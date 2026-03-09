import { z } from "zod";
import {
  TimeseriesParamsSchema,
  PopularParamsSchema,
  BLSResponseSchema,
  SurveysResponseSchema,
  PopularResponseSchema,
} from "./schemas";
import type {
  TimeseriesParams,
  PopularParams,
  ClientOptions,
  TimeseriesResult,
  SurveysResult,
  PopularResult,
} from "./types";
import { blsPost, blsGet } from "./client";
import { GovValidationError } from "govdata-core";
import { wrapResponse } from "./response";
import { describe } from "./describe";

function validateParams<T>(schema: z.ZodType<T>, params: Record<string, unknown>): T {
  try {
    return schema.parse(params);
  } catch (err) {
    if (err instanceof z.ZodError) {
      const issue = err.issues[0];
      const field = issue.path.join(".") || "input";
      const expected = issue.message;
      throw new GovValidationError(field, (params as any)?.[field], expected);
    }
    throw err;
  }
}

function buildPostBody(params: {
  series_id: string | string[];
  start_year?: number;
  end_year?: number;
  calculations?: boolean;
  annual_averages?: boolean;
  catalog?: boolean;
}): Record<string, unknown> {
  const body: Record<string, unknown> = {
    seriesid: Array.isArray(params.series_id) ? params.series_id : [params.series_id],
  };
  if (params.start_year != null) body.startyear = String(params.start_year);
  if (params.end_year != null) body.endyear = String(params.end_year);
  if (params.calculations != null) body.calculations = params.calculations;
  if (params.annual_averages != null) body.annualaverage = params.annual_averages;
  if (params.catalog != null) body.catalog = params.catalog;

  const apiKey = process.env.BLS_API_KEY;
  if (apiKey) body.registrationkey = apiKey;

  return body;
}

async function _timeseries(
  params: TimeseriesParams,
  options?: ClientOptions,
): Promise<TimeseriesResult> {
  const validated = validateParams(TimeseriesParamsSchema, params);
  const body = buildPostBody(validated);
  const raw = await blsPost("/timeseries/data/", BLSResponseSchema, body, options);
  return wrapResponse(raw.Results.series, "timeseries");
}

async function _surveys(
  options?: ClientOptions,
): Promise<SurveysResult> {
  const raw = await blsGet("/surveys/", SurveysResponseSchema, options);
  return wrapResponse(raw.Results.survey, "surveys");
}

async function _popular(
  params?: PopularParams,
  options?: ClientOptions,
): Promise<PopularResult> {
  const validated = params ? validateParams(PopularParamsSchema, params) : {};
  const path = validated.survey
    ? `/timeseries/popular?survey=${encodeURIComponent(validated.survey)}`
    : "/timeseries/popular";
  const raw = await blsGet(path, PopularResponseSchema, options);
  return wrapResponse(raw.Results.series, "popular");
}

export async function timeseries(
  params: TimeseriesParams,
  options?: ClientOptions,
): Promise<TimeseriesResult> {
  return _timeseries(params, options);
}

export async function surveys(
  options?: ClientOptions,
): Promise<SurveysResult> {
  return _surveys(options);
}

export async function popular(
  params?: PopularParams,
  options?: ClientOptions,
): Promise<PopularResult> {
  return _popular(params, options);
}

export { describe };

export function createBls(defaultOptions?: ClientOptions) {
  return {
    timeseries: (params: TimeseriesParams, options?: ClientOptions) =>
      _timeseries(params, { ...defaultOptions, ...options }),
    surveys: (options?: ClientOptions) =>
      _surveys({ ...defaultOptions, ...options }),
    popular: (params?: PopularParams, options?: ClientOptions) =>
      _popular(params, { ...defaultOptions, ...options }),
    describe,
  };
}

export const bls = createBls();
