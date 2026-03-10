import type { ClientOptions } from "govdata-core";
import { usaGet } from "../../client";
import { wrapResponse } from "../../response";
import type { USAResult } from "../../response";
import {
  FederalObligationsResponseSchema,
  FinancialBalancesResponseSchema,
  SpendingMajorObjectClassResponseSchema,
  SpendingObjectClassResponseSchema,
} from "./schemas";

interface FederalObligationsParams {
  funding_agency_id: number;
  fiscal_year: number;
  page?: number;
  limit?: number;
}

interface FinancialBalancesParams {
  funding_agency_id: number;
  fiscal_year: number;
  page?: number;
  limit?: number;
}

interface SpendingMajorObjectClassParams {
  fiscal_year: number;
  funding_agency_id: number;
  page?: number;
  limit?: number;
}

interface SpendingObjectClassParams {
  fiscal_year: number;
  funding_agency_id: number;
  major_object_class_code?: number;
  page?: number;
  limit?: number;
}

function toQuery(params: Record<string, unknown>): Record<string, string> {
  const q: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value != null) {
      q[key] = String(value);
    }
  }
  return Object.keys(q).length > 0 ? q : {};
}

export async function _financialFederalObligations(
  params: FederalObligationsParams,
  options?: ClientOptions,
): Promise<USAResult<"financial_federal_obligations">> {
  const raw = await usaGet(
    `/api/v2/federal_obligations/`,
    FederalObligationsResponseSchema,
    toQuery({ ...params }),
    options,
  );
  const pm = raw.page_metadata;
  const pages = pm.has_next_page ? pm.page + 1 : pm.page;
  return wrapResponse(raw.results, { total_results: pm.count ?? raw.results.length, pages }, "financial_federal_obligations");
}

export async function _financialBalances(
  params: FinancialBalancesParams,
  options?: ClientOptions,
): Promise<USAResult<"financial_balances">> {
  const raw = await usaGet(
    `/api/v2/financial_balances/agencies/`,
    FinancialBalancesResponseSchema,
    toQuery({ ...params }),
    options,
  );
  const pm = raw.page_metadata;
  const pages = pm.has_next_page ? pm.page + 1 : pm.page;
  return wrapResponse(raw.results, { total_results: pm.count ?? raw.results.length, pages }, "financial_balances");
}

export async function _financialSpendingMajorObjectClass(
  params: SpendingMajorObjectClassParams,
  options?: ClientOptions,
): Promise<USAResult<"financial_spending_major_object_class">> {
  const raw = await usaGet(
    `/api/v2/financial_spending/major_object_class/`,
    SpendingMajorObjectClassResponseSchema,
    toQuery({ ...params }),
    options,
  );
  const pm = raw.page_metadata;
  const pages = pm.has_next_page ? pm.page + 1 : pm.page;
  return wrapResponse(raw.results, { total_results: pm.count ?? raw.results.length, pages }, "financial_spending_major_object_class");
}

export async function _financialSpendingObjectClass(
  params: SpendingObjectClassParams,
  options?: ClientOptions,
): Promise<USAResult<"financial_spending_object_class">> {
  const raw = await usaGet(
    `/api/v2/financial_spending/object_class/`,
    SpendingObjectClassResponseSchema,
    toQuery({ ...params }),
    options,
  );
  const pm = raw.page_metadata;
  const pages = pm.has_next_page ? pm.page + 1 : pm.page;
  return wrapResponse(raw.results, { total_results: pm.count ?? raw.results.length, pages }, "financial_spending_object_class");
}
