import type { ClientOptions } from "govdata-core";
import { usaGet } from "../../client";
import {
  AgencyOverviewSchema,
  AgencyAwardsSchema,
  AgencyNewAwardCountSchema,
  AgencyAwardsCountResponseSchema,
  BudgetFunctionResponseSchema,
  BudgetFunctionCountSchema,
  BudgetaryResourcesResponseSchema,
  FederalAccountResponseSchema,
  FederalAccountCountSchema,
  ObjectClassResponseSchema,
  ObjectClassCountSchema,
  ObligationsByCategoryResponseSchema,
  ProgramActivityResponseSchema,
  ProgramActivityCountSchema,
  SubAgencyResponseSchema,
  SubAgencyCountSchema,
  SubComponentsResponseSchema,
  TreasuryAccountResponseSchema,
} from "./schemas";
import { wrapResponse } from "../../response";
import type { USAResult } from "../../response";

function enc(s: string) {
  return encodeURIComponent(s);
}

interface AgencyQueryParams {
  fiscal_year?: number;
  page?: number;
  limit?: number;
  order?: "asc" | "desc";
  sort?: string;
}

function toQuery(params?: AgencyQueryParams): Record<string, string> | undefined {
  if (!params) return undefined;
  const q: Record<string, string> = {};
  if (params.fiscal_year != null) q.fiscal_year = String(params.fiscal_year);
  if (params.page != null) q.page = String(params.page);
  if (params.limit != null) q.limit = String(params.limit);
  if (params.order != null) q.order = params.order;
  if (params.sort != null) q.sort = params.sort;
  return Object.keys(q).length > 0 ? q : undefined;
}

export async function _agencyOverview(
  toptierCode: string,
  options?: ClientOptions,
): Promise<USAResult<"agency">> {
  const raw = await usaGet(
    `/api/v2/agency/${enc(toptierCode)}/`,
    AgencyOverviewSchema,
    undefined,
    options,
  );
  return wrapResponse([raw], null, "agency");
}

export async function _agencyAwards(
  toptierCode: string,
  params?: AgencyQueryParams,
  options?: ClientOptions,
): Promise<USAResult<"agency_awards">> {
  const raw = await usaGet(
    `/api/v2/agency/${enc(toptierCode)}/awards/`,
    AgencyAwardsSchema,
    toQuery(params),
    options,
  );
  return wrapResponse(raw, null, "agency_awards");
}

export async function _agencyNewAwardCount(
  toptierCode: string,
  params?: AgencyQueryParams,
  options?: ClientOptions,
): Promise<USAResult<"agency_new_award_count">> {
  const raw = await usaGet(
    `/api/v2/agency/${enc(toptierCode)}/awards/new/count/`,
    AgencyNewAwardCountSchema,
    toQuery(params),
    options,
  );
  return wrapResponse(raw, null, "agency_new_award_count");
}

export async function _agencyAwardsCount(
  params?: AgencyQueryParams,
  options?: ClientOptions,
): Promise<USAResult<"agency_awards_count">> {
  const raw = await usaGet(
    `/api/v2/agency/awards/count/`,
    AgencyAwardsCountResponseSchema,
    toQuery(params),
    options,
  );
  return wrapResponse(raw.results, null, "agency_awards_count");
}

export async function _agencyBudgetFunction(
  toptierCode: string,
  params?: AgencyQueryParams,
  options?: ClientOptions,
): Promise<USAResult<"agency_budget_function">> {
  const raw = await usaGet(
    `/api/v2/agency/${enc(toptierCode)}/budget_function/`,
    BudgetFunctionResponseSchema,
    toQuery(params),
    options,
  );
  return wrapResponse(raw.results, null, "agency_budget_function");
}

export async function _agencyBudgetFunctionCount(
  toptierCode: string,
  params?: AgencyQueryParams,
  options?: ClientOptions,
): Promise<USAResult<"agency_budget_function_count">> {
  const raw = await usaGet(
    `/api/v2/agency/${enc(toptierCode)}/budget_function/count/`,
    BudgetFunctionCountSchema,
    toQuery(params),
    options,
  );
  return wrapResponse(raw, null, "agency_budget_function_count");
}

export async function _agencyBudgetaryResources(
  toptierCode: string,
  options?: ClientOptions,
): Promise<USAResult<"agency_budgetary_resources">> {
  const raw = await usaGet(
    `/api/v2/agency/${enc(toptierCode)}/budgetary_resources/`,
    BudgetaryResourcesResponseSchema,
    undefined,
    options,
  );
  return wrapResponse(raw, null, "agency_budgetary_resources");
}

export async function _agencyFederalAccount(
  toptierCode: string,
  params?: AgencyQueryParams,
  options?: ClientOptions,
): Promise<USAResult<"agency_federal_account">> {
  const raw = await usaGet(
    `/api/v2/agency/${enc(toptierCode)}/federal_account/`,
    FederalAccountResponseSchema,
    toQuery(params),
    options,
  );
  const pm = raw.page_metadata;
  const pages = pm.hasNext ? pm.page + 1 : pm.page;
  return wrapResponse(raw.results, { total_results: pm.total ?? raw.results.length, pages }, "agency_federal_account");
}

export async function _agencyFederalAccountCount(
  toptierCode: string,
  params?: AgencyQueryParams,
  options?: ClientOptions,
): Promise<USAResult<"agency_federal_account_count">> {
  const raw = await usaGet(
    `/api/v2/agency/${enc(toptierCode)}/federal_account/count/`,
    FederalAccountCountSchema,
    toQuery(params),
    options,
  );
  return wrapResponse(raw, null, "agency_federal_account_count");
}

export async function _agencyObjectClass(
  toptierCode: string,
  params?: AgencyQueryParams,
  options?: ClientOptions,
): Promise<USAResult<"agency_object_class">> {
  const raw = await usaGet(
    `/api/v2/agency/${enc(toptierCode)}/object_class/`,
    ObjectClassResponseSchema,
    toQuery(params),
    options,
  );
  const pm = raw.page_metadata;
  const pages = pm.hasNext ? pm.page + 1 : pm.page;
  return wrapResponse(raw.results, { total_results: pm.total ?? raw.results.length, pages }, "agency_object_class");
}

export async function _agencyObjectClassCount(
  toptierCode: string,
  params?: AgencyQueryParams,
  options?: ClientOptions,
): Promise<USAResult<"agency_object_class_count">> {
  const raw = await usaGet(
    `/api/v2/agency/${enc(toptierCode)}/object_class/count/`,
    ObjectClassCountSchema,
    toQuery(params),
    options,
  );
  return wrapResponse(raw, null, "agency_object_class_count");
}

export async function _agencyObligationsByAwardCategory(
  toptierCode: string,
  params?: AgencyQueryParams,
  options?: ClientOptions,
): Promise<USAResult<"agency_obligations_by_award_category">> {
  const raw = await usaGet(
    `/api/v2/agency/${enc(toptierCode)}/obligations_by_award_category/`,
    ObligationsByCategoryResponseSchema,
    toQuery(params),
    options,
  );
  return wrapResponse(raw.results, null, "agency_obligations_by_award_category");
}

export async function _agencyProgramActivity(
  toptierCode: string,
  params?: AgencyQueryParams,
  options?: ClientOptions,
): Promise<USAResult<"agency_program_activity">> {
  const raw = await usaGet(
    `/api/v2/agency/${enc(toptierCode)}/program_activity/`,
    ProgramActivityResponseSchema,
    toQuery(params),
    options,
  );
  const pm = raw.page_metadata;
  const pages = pm.hasNext ? pm.page + 1 : pm.page;
  return wrapResponse(raw.results, { total_results: pm.total ?? raw.results.length, pages }, "agency_program_activity");
}

export async function _agencyProgramActivityCount(
  toptierCode: string,
  params?: AgencyQueryParams,
  options?: ClientOptions,
): Promise<USAResult<"agency_program_activity_count">> {
  const raw = await usaGet(
    `/api/v2/agency/${enc(toptierCode)}/program_activity/count/`,
    ProgramActivityCountSchema,
    toQuery(params),
    options,
  );
  return wrapResponse(raw, null, "agency_program_activity_count");
}

export async function _agencySubAgency(
  toptierCode: string,
  params?: AgencyQueryParams,
  options?: ClientOptions,
): Promise<USAResult<"agency_sub_agency">> {
  const raw = await usaGet(
    `/api/v2/agency/${enc(toptierCode)}/sub_agency/`,
    SubAgencyResponseSchema,
    toQuery(params),
    options,
  );
  const pm = raw.page_metadata;
  const pages = pm.hasNext ? pm.page + 1 : pm.page;
  return wrapResponse(raw.results, { total_results: pm.total ?? raw.results.length, pages }, "agency_sub_agency");
}

export async function _agencySubAgencyCount(
  toptierCode: string,
  params?: AgencyQueryParams,
  options?: ClientOptions,
): Promise<USAResult<"agency_sub_agency_count">> {
  const raw = await usaGet(
    `/api/v2/agency/${enc(toptierCode)}/sub_agency/count/`,
    SubAgencyCountSchema,
    toQuery(params),
    options,
  );
  return wrapResponse(raw, null, "agency_sub_agency_count");
}

export async function _agencySubComponents(
  toptierCode: string,
  params?: AgencyQueryParams,
  options?: ClientOptions,
): Promise<USAResult<"agency_sub_components">> {
  const raw = await usaGet(
    `/api/v2/agency/${enc(toptierCode)}/sub_components/`,
    SubComponentsResponseSchema,
    toQuery(params),
    options,
  );
  const pm = raw.page_metadata;
  const pages = pm.hasNext ? pm.page + 1 : pm.page;
  return wrapResponse(raw.results, { total_results: pm.total ?? raw.results.length, pages }, "agency_sub_components");
}

export async function _agencyTreasuryAccountObjectClass(
  toptierCode: string,
  accountCode: string,
  params?: AgencyQueryParams,
  options?: ClientOptions,
): Promise<USAResult<"agency_treasury_account_object_class">> {
  const raw = await usaGet(
    `/api/v2/agency/${enc(toptierCode)}/sub_components/${enc(accountCode)}/object_class/`,
    TreasuryAccountResponseSchema,
    toQuery(params),
    options,
  );
  const pm = raw.page_metadata;
  const pages = pm.hasNext ? pm.page + 1 : pm.page;
  return wrapResponse(raw.results, { total_results: pm.total ?? raw.results.length, pages }, "agency_treasury_account_object_class");
}

export async function _agencyTreasuryAccountProgramActivity(
  toptierCode: string,
  accountCode: string,
  params?: AgencyQueryParams,
  options?: ClientOptions,
): Promise<USAResult<"agency_treasury_account_program_activity">> {
  const raw = await usaGet(
    `/api/v2/agency/${enc(toptierCode)}/sub_components/${enc(accountCode)}/program_activity/`,
    TreasuryAccountResponseSchema,
    toQuery(params),
    options,
  );
  const pm = raw.page_metadata;
  const pages = pm.hasNext ? pm.page + 1 : pm.page;
  return wrapResponse(raw.results, { total_results: pm.total ?? raw.results.length, pages }, "agency_treasury_account_program_activity");
}
