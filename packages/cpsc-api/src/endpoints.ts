import { z } from "zod";
import {
  RecallParamsSchema,
  PenaltyParamsSchema,
  PenaltyListParamsSchema,
  RecallsResponseSchema,
  PenaltiesResponseSchema,
  PenaltyCompaniesResponseSchema,
  PenaltyProductsResponseSchema,
  PenaltyYearsResponseSchema,
} from "./schemas";
import type {
  RecallParams,
  PenaltyParams,
  PenaltyListParams,
  ClientOptions,
  RecallsResult,
  PenaltiesResult,
  PenaltyCompaniesResult,
  PenaltyProductsResult,
  PenaltyYearsResult,
} from "./types";
import { cpscGet } from "./client";
import { GovValidationError } from "govdata-core";
import { wrapResponse } from "./response";
import { describe } from "./describe";

function validateParams<T>(schema: z.ZodType<T>, params: Record<string, unknown>): T {
  try {
    return schema.parse(params);
  } catch (err) {
    if (err instanceof z.ZodError) {
      if (err.issues.length === 1) {
        const issue = err.issues[0];
        const field = issue.path.join(".");
        if (field) {
          throw new GovValidationError(field, (params as any)?.[field], issue.message);
        }
        throw new GovValidationError("input", undefined, issue.message);
      }
      const messages = err.issues.map((issue) => {
        const field = issue.path.join(".") || "input";
        return `${field}: ${issue.message}`;
      });
      throw new GovValidationError("input", undefined, messages.join("; "));
    }
    throw err;
  }
}

async function _recalls(
  params?: RecallParams,
  options?: ClientOptions,
): Promise<RecallsResult> {
  const validated = params ? validateParams(RecallParamsSchema, params) : {};
  // Strip undefined values so govGet doesn't set them as "undefined" query params
  const queryParams: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(validated)) {
    if (value !== undefined) {
      queryParams[key] = value;
    }
  }
  const raw = await cpscGet("/RestWebServices/Recall", RecallsResponseSchema, queryParams, options);
  return wrapResponse(raw, "recalls");
}

async function _penalties(
  params?: PenaltyParams,
  options?: ClientOptions,
): Promise<PenaltiesResult> {
  const validated = params ? validateParams(PenaltyParamsSchema, params) : { penaltytype: "civil" };
  const queryParams: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(validated)) {
    if (value !== undefined) {
      queryParams[key] = value;
    }
  }
  const raw = await cpscGet("/RestWebServices/Penalty/Penalty", PenaltiesResponseSchema, queryParams, options);
  return wrapResponse(raw, "penalties");
}

async function _penaltyCompanies(
  params?: PenaltyListParams,
  options?: ClientOptions,
): Promise<PenaltyCompaniesResult> {
  const validated = params ? validateParams(PenaltyListParamsSchema, params) : { penaltytype: "civil" };
  const raw = await cpscGet(
    "/RestWebServices/Penalty/Company",
    PenaltyCompaniesResponseSchema,
    { penaltytype: validated.penaltytype },
    options,
  );
  return wrapResponse(raw, "penalty-companies");
}

async function _penaltyProducts(
  params?: PenaltyListParams,
  options?: ClientOptions,
): Promise<PenaltyProductsResult> {
  const validated = params ? validateParams(PenaltyListParamsSchema, params) : { penaltytype: "civil" };
  const raw = await cpscGet(
    "/RestWebServices/Penalty/Product",
    PenaltyProductsResponseSchema,
    { penaltytype: validated.penaltytype },
    options,
  );
  return wrapResponse(raw, "penalty-products");
}

async function _penaltyYears(
  params?: PenaltyListParams,
  options?: ClientOptions,
): Promise<PenaltyYearsResult> {
  const validated = params ? validateParams(PenaltyListParamsSchema, params) : { penaltytype: "civil" };
  const raw = await cpscGet(
    "/RestWebServices/Penalty/FiscalYear",
    PenaltyYearsResponseSchema,
    { penaltytype: validated.penaltytype },
    options,
  );
  return wrapResponse(raw, "penalty-years");
}

export async function recalls(
  params?: RecallParams,
  options?: ClientOptions,
): Promise<RecallsResult> {
  return _recalls(params, options);
}

export async function penalties(
  params?: PenaltyParams,
  options?: ClientOptions,
): Promise<PenaltiesResult> {
  return _penalties(params, options);
}

export async function penaltyCompanies(
  params?: PenaltyListParams,
  options?: ClientOptions,
): Promise<PenaltyCompaniesResult> {
  return _penaltyCompanies(params, options);
}

export async function penaltyProducts(
  params?: PenaltyListParams,
  options?: ClientOptions,
): Promise<PenaltyProductsResult> {
  return _penaltyProducts(params, options);
}

export async function penaltyYears(
  params?: PenaltyListParams,
  options?: ClientOptions,
): Promise<PenaltyYearsResult> {
  return _penaltyYears(params, options);
}

export { describe };

export function createCpsc(defaultOptions?: ClientOptions) {
  return {
    recalls: (params?: RecallParams, options?: ClientOptions) =>
      _recalls(params, { ...defaultOptions, ...options }),
    penalties: (params?: PenaltyParams, options?: ClientOptions) =>
      _penalties(params, { ...defaultOptions, ...options }),
    penaltyCompanies: (params?: PenaltyListParams, options?: ClientOptions) =>
      _penaltyCompanies(params, { ...defaultOptions, ...options }),
    penaltyProducts: (params?: PenaltyListParams, options?: ClientOptions) =>
      _penaltyProducts(params, { ...defaultOptions, ...options }),
    penaltyYears: (params?: PenaltyListParams, options?: ClientOptions) =>
      _penaltyYears(params, { ...defaultOptions, ...options }),
    describe,
  };
}

export const cpsc = createCpsc();
