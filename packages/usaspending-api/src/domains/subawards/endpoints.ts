import type { ClientOptions } from "govdata-core";
import { usaPost } from "../../client";
import { wrapResponse } from "../../response";
import type { USAResult } from "../../response";
import {
  SubawardListResponseSchema,
  TransactionListResponseSchema,
} from "./schemas";

// --- Subaward list ---

interface SubawardListParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
  keyword?: string;
  award_id?: string;
}

export async function _subawardList(
  params?: SubawardListParams,
  options?: ClientOptions,
): Promise<USAResult<"subaward_list">> {
  const body: Record<string, unknown> = {};
  if (params?.page != null) body.page = params.page;
  if (params?.limit != null) body.limit = params.limit;
  if (params?.sort != null) body.sort = params.sort;
  if (params?.order != null) body.order = params.order;
  if (params?.keyword != null) body.keyword = params.keyword;
  if (params?.award_id != null) body.award_id = params.award_id;

  const raw = await usaPost(
    `/api/v2/subawards/`,
    SubawardListResponseSchema,
    body,
    options,
  );
  const pm = raw.page_metadata;
  const pages = pm.hasNext ? pm.page + 1 : pm.page;
  return wrapResponse(raw.results, { total_results: pm.total ?? raw.results.length, pages }, "subaward_list");
}

// --- Subawards by award ---

interface SubawardByAwardParams {
  award_id: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}

export async function _subawardByAward(
  params: SubawardByAwardParams,
  options?: ClientOptions,
): Promise<USAResult<"subaward_by_award">> {
  const body: Record<string, unknown> = {
    award_id: params.award_id,
  };
  if (params.page != null) body.page = params.page;
  if (params.limit != null) body.limit = params.limit;
  if (params.sort != null) body.sort = params.sort;
  if (params.order != null) body.order = params.order;

  const raw = await usaPost(
    `/api/v2/subawards/`,
    SubawardListResponseSchema,
    body,
    options,
  );
  const pm = raw.page_metadata;
  const pages = pm.hasNext ? pm.page + 1 : pm.page;
  return wrapResponse(raw.results, { total_results: pm.total ?? raw.results.length, pages }, "subaward_by_award");
}

// --- Transactions for an award ---

interface TransactionParams {
  award_id: number;
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}

export async function _subawardTransactions(
  params: TransactionParams,
  options?: ClientOptions,
): Promise<USAResult<"subaward_transactions">> {
  const body: Record<string, unknown> = {
    award_id: params.award_id,
  };
  if (params.page != null) body.page = params.page;
  if (params.limit != null) body.limit = params.limit;
  if (params.sort != null) body.sort = params.sort;
  if (params.order != null) body.order = params.order;

  const raw = await usaPost(
    `/api/v2/transactions/`,
    TransactionListResponseSchema,
    body,
    options,
  );
  const pm = raw.page_metadata;
  const pages = pm.hasNext ? pm.page + 1 : pm.page;
  return wrapResponse(raw.results, { total_results: pm.total ?? raw.results.length, pages }, "subaward_transactions");
}
