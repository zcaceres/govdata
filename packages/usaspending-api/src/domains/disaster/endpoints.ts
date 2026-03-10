import type { ClientOptions } from "govdata-core";
import { usaGet, usaPost } from "../../client";
import { wrapResponse } from "../../response";
import type { USAResult } from "../../response";
import {
  DisasterCountSchema,
  DisasterOverviewSchema,
  DisasterAwardAmountSchema,
  DisasterSpendingResponseSchema,
  DisasterLoanResponseSchema,
  DisasterCfdaResponseSchema,
  DisasterCfdaLoanResponseSchema,
  DisasterGeoResponseSchema,
} from "./schemas";
import type { DisasterFilterParams } from "./types";

// --- Body builder ---

function buildDisasterBody(params?: DisasterFilterParams): Record<string, unknown> {
  const body: Record<string, unknown> = {
    filter: { def_codes: params?.def_codes ?? ["L", "M", "N", "O", "P", "U", "V"] },
  };
  if (params?.spending_type != null) body.spending_type = params.spending_type;
  if (params?.sort != null) body.sort = params.sort;
  if (params?.order != null) body.order = params.order;
  if (params?.page != null) body.page = params.page;
  if (params?.limit != null) body.limit = params.limit;
  return body;
}

function buildGeoBody(params?: DisasterFilterParams): Record<string, unknown> {
  const body: Record<string, unknown> = {
    filter: { def_codes: params?.def_codes ?? ["L", "M", "N", "O", "P", "U", "V"] },
    spending_type: params?.spending_type ?? "obligation",
  };
  if (params?.geo_layer != null) body.geo_layer = params.geo_layer;
  if (params?.scope != null) body.scope = params.scope;
  return body;
}

// --- Overview (GET) ---

export async function _disasterOverview(
  options?: ClientOptions,
): Promise<USAResult<"disaster_overview">> {
  const raw = await usaGet("/api/v2/disaster/overview/", DisasterOverviewSchema, undefined, options);
  return wrapResponse(raw, null, "disaster_overview");
}

// --- Award amount & count (POST) ---

export async function _disasterAwardAmount(
  params?: DisasterFilterParams,
  options?: ClientOptions,
): Promise<USAResult<"disaster_award_amount">> {
  const body = buildDisasterBody(params);
  const raw = await usaPost("/api/v2/disaster/award/amount/", DisasterAwardAmountSchema, body, options);
  return wrapResponse(raw, null, "disaster_award_amount");
}

export async function _disasterAwardCount(
  params?: DisasterFilterParams,
  options?: ClientOptions,
): Promise<USAResult<"disaster_award_count">> {
  const body = buildDisasterBody(params);
  const raw = await usaPost("/api/v2/disaster/award/count/", DisasterCountSchema, body, options);
  return wrapResponse(raw, null, "disaster_award_count");
}

// --- Count endpoint factory ---

type CountKind =
  | "disaster_agency_count"
  | "disaster_cfda_count"
  | "disaster_def_code_count"
  | "disaster_federal_account_count"
  | "disaster_object_class_count"
  | "disaster_recipient_count";

function makeCountEndpoint(apiPath: string, kind: CountKind) {
  return async function (
    params?: DisasterFilterParams,
    options?: ClientOptions,
  ): Promise<USAResult<typeof kind>> {
    const body = buildDisasterBody(params);
    const raw = await usaPost(`/api/v2/disaster/${apiPath}/count/`, DisasterCountSchema, body, options);
    return wrapResponse(raw, null, kind);
  };
}

export const _disasterAgencyCount = makeCountEndpoint("agency", "disaster_agency_count");
export const _disasterCfdaCount = makeCountEndpoint("cfda", "disaster_cfda_count");
export const _disasterDefCodeCount = makeCountEndpoint("def_code", "disaster_def_code_count");
export const _disasterFederalAccountCount = makeCountEndpoint("federal_account", "disaster_federal_account_count");
export const _disasterObjectClassCount = makeCountEndpoint("object_class", "disaster_object_class_count");
export const _disasterRecipientCount = makeCountEndpoint("recipient", "disaster_recipient_count");

// --- Spending endpoint factory ---

type SpendingKind =
  | "disaster_agency_spending"
  | "disaster_federal_account_spending"
  | "disaster_object_class_spending"
  | "disaster_recipient_spending";

function makeSpendingEndpoint(apiPath: string, kind: SpendingKind) {
  return async function (
    params?: DisasterFilterParams,
    options?: ClientOptions,
  ): Promise<USAResult<typeof kind>> {
    const body = buildDisasterBody(params);
    const raw = await usaPost(`/api/v2/disaster/${apiPath}/spending/`, DisasterSpendingResponseSchema, body, options);
    const meta = {
      total_results: raw.page_metadata.total ?? raw.results.length,
      page: raw.page_metadata.page,
      pages: raw.page_metadata.total && raw.page_metadata.limit
        ? Math.ceil(raw.page_metadata.total / raw.page_metadata.limit)
        : 1,
    };
    return wrapResponse(raw.results as any, meta, kind);
  };
}

export const _disasterAgencySpending = makeSpendingEndpoint("agency", "disaster_agency_spending");
export const _disasterFederalAccountSpending = makeSpendingEndpoint("federal_account", "disaster_federal_account_spending");
export const _disasterObjectClassSpending = makeSpendingEndpoint("object_class", "disaster_object_class_spending");
export const _disasterRecipientSpending = makeSpendingEndpoint("recipient", "disaster_recipient_spending");

// --- CFDA spending (has extra fields) ---

export async function _disasterCfdaSpending(
  params?: DisasterFilterParams,
  options?: ClientOptions,
): Promise<USAResult<"disaster_cfda_spending">> {
  const body = buildDisasterBody(params);
  const raw = await usaPost("/api/v2/disaster/cfda/spending/", DisasterCfdaResponseSchema, body, options);
  const meta = {
    total_results: raw.page_metadata.total ?? raw.results.length,
    page: raw.page_metadata.page,
    pages: raw.page_metadata.total && raw.page_metadata.limit
      ? Math.ceil(raw.page_metadata.total / raw.page_metadata.limit)
      : 1,
  };
  return wrapResponse(raw.results as any, meta, "disaster_cfda_spending");
}

// --- Loan endpoint factory ---

type LoanKind =
  | "disaster_agency_loans"
  | "disaster_federal_account_loans"
  | "disaster_object_class_loans"
  | "disaster_recipient_loans";

function makeLoanEndpoint(apiPath: string, kind: LoanKind) {
  return async function (
    params?: DisasterFilterParams,
    options?: ClientOptions,
  ): Promise<USAResult<typeof kind>> {
    const body = buildDisasterBody(params);
    const raw = await usaPost(`/api/v2/disaster/${apiPath}/loans/`, DisasterLoanResponseSchema, body, options);
    const meta = {
      total_results: raw.page_metadata.total ?? raw.results.length,
      page: raw.page_metadata.page,
      pages: raw.page_metadata.total && raw.page_metadata.limit
        ? Math.ceil(raw.page_metadata.total / raw.page_metadata.limit)
        : 1,
    };
    return wrapResponse(raw.results as any, meta, kind);
  };
}

export const _disasterAgencyLoans = makeLoanEndpoint("agency", "disaster_agency_loans");
export const _disasterFederalAccountLoans = makeLoanEndpoint("federal_account", "disaster_federal_account_loans");
export const _disasterObjectClassLoans = makeLoanEndpoint("object_class", "disaster_object_class_loans");
export const _disasterRecipientLoans = makeLoanEndpoint("recipient", "disaster_recipient_loans");

// --- CFDA loans (has extra fields) ---

export async function _disasterCfdaLoans(
  params?: DisasterFilterParams,
  options?: ClientOptions,
): Promise<USAResult<"disaster_cfda_loans">> {
  const body = buildDisasterBody(params);
  const raw = await usaPost("/api/v2/disaster/cfda/loans/", DisasterCfdaLoanResponseSchema, body, options);
  const meta = {
    total_results: raw.page_metadata.total ?? raw.results.length,
    page: raw.page_metadata.page,
    pages: raw.page_metadata.total && raw.page_metadata.limit
      ? Math.ceil(raw.page_metadata.total / raw.page_metadata.limit)
      : 1,
  };
  return wrapResponse(raw.results as any, meta, "disaster_cfda_loans");
}

// --- Spending by geography ---

export async function _disasterSpendingByGeography(
  params?: DisasterFilterParams,
  options?: ClientOptions,
): Promise<USAResult<"disaster_spending_by_geography">> {
  const body = buildGeoBody(params);
  const raw = await usaPost("/api/v2/disaster/spending_by_geography/", DisasterGeoResponseSchema, body, options);
  return wrapResponse(
    raw.results as any,
    { total_results: raw.results.length, pages: 1 },
    "disaster_spending_by_geography",
  );
}
