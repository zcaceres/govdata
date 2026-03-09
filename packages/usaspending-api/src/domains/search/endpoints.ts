import type { ClientOptions } from "govdata-core";
import { usaPost } from "../../client";
import {
  AwardSearchParamsSchema,
  AwardSearchResponseSchema,
  SpendingOverTimeParamsSchema,
  SpendingOverTimeResponseSchema,
  AwardCountResponseSchema,
  CategoryParamsSchema,
  CategoryResponseSchema,
  GeographyParamsSchema,
  GeographyResponseSchema,
  TransactionResponseSchema,
  TransactionCountResponseSchema,
  TransactionGroupedResponseSchema,
  SubawardGroupedResponseSchema,
  NewAwardsOverTimeResponseSchema,
  TransactionSpendingSummaryResponseSchema,
} from "./schemas";
import type {
  AwardSearchParams,
  SpendingOverTimeParams,
  CategoryParams,
  GeographyParams,
} from "./types";
import { wrapResponse } from "../../response";
import type { USAResult } from "../../response";
import { validateParams } from "../../plugin-helpers";
import { ALL_AWARD_TYPE_CODES } from "../../shared-schemas";

export async function _searchAwards(
  params?: AwardSearchParams,
  options?: ClientOptions,
): Promise<USAResult<"awards">> {
  const ALL_AWARD_TYPES = [...ALL_AWARD_TYPE_CODES];

  const defaultFilters = {
    award_type_codes: ALL_AWARD_TYPES,
    ...params?.filters,
  };

  const defaults: AwardSearchParams = {
    filters: defaultFilters,
    fields: [
      "Award ID", "Recipient Name", "Start Date", "End Date",
      "Award Amount", "Awarding Agency", "Awarding Sub Agency",
      "Award Type", "Description",
    ],
    page: 1,
    limit: 10,
    sort: "Award Amount",
    order: "desc",
    subawards: false,
  };

  const body = params
    ? validateParams(AwardSearchParamsSchema, { ...defaults, ...params, filters: defaultFilters })
    : defaults;

  const raw = await usaPost(
    "/api/v2/search/spending_by_award/",
    AwardSearchResponseSchema,
    body,
    options,
  );

  const currentPage = raw.page_metadata.page;
  const hasNext = raw.page_metadata.hasNext;
  const pages = hasNext ? currentPage + 1 : currentPage;

  return wrapResponse(
    raw.results,
    { total_results: raw.results.length, pages },
    "awards",
  );
}

export async function _spendingOverTime(
  params: SpendingOverTimeParams,
  options?: ClientOptions,
): Promise<USAResult<"spending_over_time">> {
  const validated = validateParams(SpendingOverTimeParamsSchema, params);
  const raw = await usaPost(
    "/api/v2/search/spending_over_time/",
    SpendingOverTimeResponseSchema,
    validated,
    options,
  );
  return wrapResponse(raw.results, null, "spending_over_time");
}

// --- New search endpoints ---

export async function _spendingByAwardCount(
  params: { filters: Record<string, unknown>; subawards?: boolean },
  options?: ClientOptions,
): Promise<USAResult<"award_count">> {
  const raw = await usaPost(
    "/api/v2/search/spending_by_award_count/",
    AwardCountResponseSchema,
    params,
    options,
  );
  return wrapResponse(raw.results, null, "award_count");
}

const CATEGORY_SUB_PATHS = [
  "awarding_agency", "awarding_subagency", "cfda", "country", "county",
  "defc", "district", "federal_account", "funding_agency", "funding_subagency",
  "naics", "psc", "recipient", "recipient_duns", "state_territory",
] as const;

export type CategorySubPath = typeof CATEGORY_SUB_PATHS[number];

export async function _spendingByCategory(
  subPath: CategorySubPath,
  params?: CategoryParams,
  options?: ClientOptions,
): Promise<USAResult<"category">> {
  const ALL_AWARD_TYPES = [...ALL_AWARD_TYPE_CODES];
  const defaultFilters = {
    award_type_codes: ALL_AWARD_TYPES,
    ...params?.filters,
  };
  const body = params
    ? validateParams(CategoryParamsSchema, { ...params, filters: defaultFilters })
    : { filters: { award_type_codes: ALL_AWARD_TYPES } };
  const raw = await usaPost(
    `/api/v2/search/spending_by_category/${subPath}/`,
    CategoryResponseSchema,
    body,
    options,
  );
  const currentPage = raw.page_metadata.page;
  const hasNext = raw.page_metadata.hasNext;
  const pages = hasNext ? currentPage + 1 : currentPage;
  return wrapResponse(
    raw.results,
    { total_results: raw.results.length, pages },
    "category",
  );
}

export async function _spendingByGeography(
  params: GeographyParams,
  options?: ClientOptions,
): Promise<USAResult<"geography">> {
  const validated = validateParams(GeographyParamsSchema, params);
  const raw = await usaPost(
    "/api/v2/search/spending_by_geography/",
    GeographyResponseSchema,
    validated,
    options,
  );
  return wrapResponse(raw.results, null, "geography");
}

export async function _spendingByTransaction(
  params?: AwardSearchParams,
  options?: ClientOptions,
): Promise<USAResult<"transactions">> {
  const ALL_AWARD_TYPES = [...ALL_AWARD_TYPE_CODES];
  const defaultFilters = {
    award_type_codes: ALL_AWARD_TYPES,
    ...params?.filters,
  };
  const defaults: AwardSearchParams = {
    filters: defaultFilters,
    fields: [
      "Award ID", "Recipient Name", "Action Date",
      "Transaction Amount", "Awarding Agency", "Award Type",
    ],
    page: 1,
    limit: 10,
    sort: "Transaction Amount",
    order: "desc",
    subawards: false,
  };
  const body = params
    ? validateParams(AwardSearchParamsSchema, { ...defaults, ...params, filters: defaultFilters })
    : defaults;
  const raw = await usaPost(
    "/api/v2/search/spending_by_transaction/",
    TransactionResponseSchema,
    body,
    options,
  );
  const currentPage = raw.page_metadata.page;
  const hasNext = raw.page_metadata.hasNext;
  const pages = hasNext ? currentPage + 1 : currentPage;
  return wrapResponse(
    raw.results,
    { total_results: raw.results.length, pages },
    "transactions",
  );
}

export async function _spendingByTransactionCount(
  params: { filters: Record<string, unknown>; subawards?: boolean },
  options?: ClientOptions,
): Promise<USAResult<"transaction_count">> {
  const raw = await usaPost(
    "/api/v2/search/spending_by_transaction_count/",
    TransactionCountResponseSchema,
    params,
    options,
  );
  return wrapResponse(raw.results, null, "transaction_count");
}

export async function _spendingByTransactionGrouped(
  params?: AwardSearchParams,
  options?: ClientOptions,
): Promise<USAResult<"transaction_grouped">> {
  const ALL_AWARD_TYPES = [...ALL_AWARD_TYPE_CODES];
  const defaultFilters = {
    award_type_codes: ALL_AWARD_TYPES,
    ...params?.filters,
  };
  const body = params
    ? { ...params, filters: defaultFilters }
    : { filters: { award_type_codes: ALL_AWARD_TYPES } };
  const raw = await usaPost(
    "/api/v2/search/spending_by_transaction_grouped/",
    TransactionGroupedResponseSchema,
    body,
    options,
  );
  const currentPage = raw.page_metadata.page;
  const hasNext = raw.page_metadata.hasNext;
  const pages = hasNext ? currentPage + 1 : currentPage;
  return wrapResponse(
    raw.results,
    { total_results: raw.results.length, pages },
    "transaction_grouped",
  );
}

export async function _spendingBySubawardGrouped(
  params?: AwardSearchParams,
  options?: ClientOptions,
): Promise<USAResult<"subaward_grouped">> {
  const ALL_AWARD_TYPES = [...ALL_AWARD_TYPE_CODES];
  const defaultFilters = {
    award_type_codes: ALL_AWARD_TYPES,
    ...params?.filters,
  };
  const body = params
    ? { ...params, filters: defaultFilters }
    : { filters: { award_type_codes: ALL_AWARD_TYPES } };
  const raw = await usaPost(
    "/api/v2/search/spending_by_subaward_grouped/",
    SubawardGroupedResponseSchema,
    body,
    options,
  );
  const currentPage = raw.page_metadata.page;
  const hasNext = raw.page_metadata.hasNext;
  const pages = hasNext ? currentPage + 1 : currentPage;
  return wrapResponse(
    raw.results,
    { total_results: raw.results.length, pages },
    "subaward_grouped",
  );
}

export async function _newAwardsOverTime(
  params: SpendingOverTimeParams,
  options?: ClientOptions,
): Promise<USAResult<"new_awards_over_time">> {
  const validated = validateParams(SpendingOverTimeParamsSchema, params);
  const raw = await usaPost(
    "/api/v2/search/new_awards_over_time/",
    NewAwardsOverTimeResponseSchema,
    validated,
    options,
  );
  return wrapResponse(raw.results, null, "new_awards_over_time");
}

export async function _transactionSpendingSummary(
  params: { filters: Record<string, unknown> },
  options?: ClientOptions,
): Promise<USAResult<"transaction_spending_summary">> {
  const raw = await usaPost(
    "/api/v2/search/transaction_spending_summary/",
    TransactionSpendingSummaryResponseSchema,
    params,
    options,
  );
  return wrapResponse(raw.results, null, "transaction_spending_summary");
}

export { CATEGORY_SUB_PATHS };
