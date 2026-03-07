import { z } from "zod";
import {
  SavingsParamsSchema,
  PaymentsParamsSchema,
  GrantsResponseSchema,
  ContractsResponseSchema,
  LeasesResponseSchema,
  PaymentsResponseSchema,
  StatisticsResponseSchema,
} from "./schemas";
import type {
  SavingsParams,
  PaymentsParams,
  ClientOptions,
  GrantsResult,
  ContractsResult,
  LeasesResult,
  PaymentsResult,
  StatisticsResult,
} from "./types";
import { dogeGet } from "./client";
import { DogeValidationError } from "./errors";
import { wrapResponse } from "./response";
import type { DogeResult } from "./response";
import { withPagination } from "./paginate";
import { describe } from "./describe";
import type { PaginatedEndpoint } from "./paginate";
import type { GovDataPlugin } from "govdata-core";

function validateParams<T>(schema: z.ZodType<T>, params: Record<string, unknown>): T {
  try {
    return schema.parse(params);
  } catch (err) {
    if (err instanceof z.ZodError) {
      const issue = err.issues[0];
      const field = issue.path.join(".");
      const expected = "options" in issue
        ? (issue as any).options.map((o: string) => `'${o}'`).join(" | ")
        : issue.message;
      throw new DogeValidationError(field, (params as any)?.[field], expected);
    }
    throw err;
  }
}

async function _grants(
  params?: SavingsParams,
  options?: ClientOptions,
): Promise<GrantsResult> {
  const validated = params ? validateParams(SavingsParamsSchema, params) : undefined;
  const raw = await dogeGet("/savings/grants", GrantsResponseSchema, validated, options);
  return wrapResponse(raw, "grants");
}

async function _contracts(
  params?: SavingsParams,
  options?: ClientOptions,
): Promise<ContractsResult> {
  const validated = params ? validateParams(SavingsParamsSchema, params) : undefined;
  const raw = await dogeGet("/savings/contracts", ContractsResponseSchema, validated, options);
  return wrapResponse(raw, "contracts");
}

async function _leases(
  params?: SavingsParams,
  options?: ClientOptions,
): Promise<LeasesResult> {
  const validated = params ? validateParams(SavingsParamsSchema, params) : undefined;
  const raw = await dogeGet("/savings/leases", LeasesResponseSchema, validated, options);
  return wrapResponse(raw, "leases");
}

async function _payments(
  params?: PaymentsParams,
  options?: ClientOptions,
): Promise<PaymentsResult> {
  const validated = params ? validateParams(PaymentsParamsSchema, params) : undefined;
  const raw = await dogeGet("/payments", PaymentsResponseSchema, validated, options);
  return wrapResponse(raw, "payments");
}

async function _statistics(
  options?: ClientOptions,
): Promise<StatisticsResult> {
  const raw = await dogeGet("/payments/statistics", StatisticsResponseSchema, undefined, options);
  return wrapResponse(raw, "statistics");
}

export const grants = withPagination(_grants);
export const contracts = withPagination(_contracts);
export const leases = withPagination(_leases);
export const payments = withPagination(_payments);

export async function statistics(
  options?: ClientOptions,
): Promise<StatisticsResult> {
  return _statistics(options);
}

export { describe };

export function createDoge(defaultOptions?: ClientOptions) {
  const boundGrants = withPagination(
    (params?: SavingsParams, options?: ClientOptions) =>
      _grants(params, { ...defaultOptions, ...options }),
  );
  const boundContracts = withPagination(
    (params?: SavingsParams, options?: ClientOptions) =>
      _contracts(params, { ...defaultOptions, ...options }),
  );
  const boundLeases = withPagination(
    (params?: SavingsParams, options?: ClientOptions) =>
      _leases(params, { ...defaultOptions, ...options }),
  );
  const boundPayments = withPagination(
    (params?: PaymentsParams, options?: ClientOptions) =>
      _payments(params, { ...defaultOptions, ...options }),
  );

  return {
    grants: boundGrants,
    contracts: boundContracts,
    leases: boundLeases,
    payments: boundPayments,
    statistics: (options?: ClientOptions) =>
      _statistics({ ...defaultOptions, ...options }),
    describe,
  };
}

export const doge = createDoge();

export const dogePlugin: GovDataPlugin = {
  prefix: "doge",
  describe,
  endpoints: {
    grants: (params?: any) => grants(params),
    contracts: (params?: any) => contracts(params),
    leases: (params?: any) => leases(params),
    payments: (params?: any) => payments(params),
    statistics: () => statistics(),
  } as Record<string, (params?: any) => Promise<DogeResult>>,
};
