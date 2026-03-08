import type { ClientOptions } from "govdata-core";
import { usaGet, usaPost } from "../../client";
import { wrapResponse } from "../../response";
import type { USAResult } from "../../response";
import {
  IdvAccountsResponseSchema,
  IdvActivityResponseSchema,
  IdvAmountsSchema,
  IdvAwardsResponseSchema,
  IdvCountSchema,
  IdvFundingRollupSchema,
  IdvFundingResponseSchema,
} from "./schemas";

const enc = encodeURIComponent;

// --- POST /api/v2/idvs/accounts/ ---

export async function _idvAccounts(
  params?: { award_id?: number; page?: number; limit?: number; sort?: string; order?: string },
  options?: ClientOptions,
): Promise<USAResult<"idv_accounts">> {
  const body: Record<string, unknown> = {};
  if (params?.award_id != null) body.award_id = params.award_id;
  if (params?.page != null) body.page = params.page;
  if (params?.limit != null) body.limit = params.limit;
  if (params?.sort != null) body.sort = params.sort;
  if (params?.order != null) body.order = params.order;

  const raw = await usaPost("/api/v2/idvs/accounts/", IdvAccountsResponseSchema, body, options);
  const pm = raw.page_metadata;
  const pages = pm.hasNext ? pm.page + 1 : pm.page;
  return wrapResponse(raw.results, { total_results: pm.count ?? raw.results.length, pages }, "idv_accounts");
}

// --- POST /api/v2/idvs/activity/ ---

export async function _idvActivity(
  params?: { award_id?: number; page?: number; limit?: number },
  options?: ClientOptions,
): Promise<USAResult<"idv_activity">> {
  const body: Record<string, unknown> = {};
  if (params?.award_id != null) body.award_id = params.award_id;
  if (params?.page != null) body.page = params.page;
  if (params?.limit != null) body.limit = params.limit;

  const raw = await usaPost("/api/v2/idvs/activity/", IdvActivityResponseSchema, body, options);
  const pm = raw.page_metadata;
  const pages = pm.hasNext ? pm.page + 1 : pm.page;
  return wrapResponse(raw.results, { total_results: pm.total ?? raw.results.length, pages }, "idv_activity");
}

// --- GET /api/v2/idvs/amounts/{award_id}/ ---

export async function _idvAmounts(
  awardId: string,
  options?: ClientOptions,
): Promise<USAResult<"idv_amounts">> {
  const raw = await usaGet(
    `/api/v2/idvs/amounts/${enc(awardId)}/`,
    IdvAmountsSchema,
    undefined,
    options,
  );
  return wrapResponse(raw, null, "idv_amounts");
}

// --- POST /api/v2/idvs/awards/ (type: "child_awards") ---

export async function _idvChildAwards(
  params?: { award_id?: number; page?: number; limit?: number; sort?: string; order?: string },
  options?: ClientOptions,
): Promise<USAResult<"idv_child_awards">> {
  const body: Record<string, unknown> = { type: "child_awards" };
  if (params?.award_id != null) body.award_id = params.award_id;
  if (params?.page != null) body.page = params.page;
  if (params?.limit != null) body.limit = params.limit;
  if (params?.sort != null) body.sort = params.sort;
  if (params?.order != null) body.order = params.order;

  const raw = await usaPost("/api/v2/idvs/awards/", IdvAwardsResponseSchema, body, options);
  const pm = raw.page_metadata;
  const pages = pm.hasNext ? pm.page + 1 : pm.page;
  return wrapResponse(raw.results, { total_results: pm.count ?? raw.results.length, pages }, "idv_child_awards");
}

// --- POST /api/v2/idvs/awards/ (type: "child_idvs") ---

export async function _idvChildIdvs(
  params?: { award_id?: number; page?: number; limit?: number; sort?: string; order?: string },
  options?: ClientOptions,
): Promise<USAResult<"idv_child_idvs">> {
  const body: Record<string, unknown> = { type: "child_idvs" };
  if (params?.award_id != null) body.award_id = params.award_id;
  if (params?.page != null) body.page = params.page;
  if (params?.limit != null) body.limit = params.limit;
  if (params?.sort != null) body.sort = params.sort;
  if (params?.order != null) body.order = params.order;

  const raw = await usaPost("/api/v2/idvs/awards/", IdvAwardsResponseSchema, body, options);
  const pm = raw.page_metadata;
  const pages = pm.hasNext ? pm.page + 1 : pm.page;
  return wrapResponse(raw.results, { total_results: pm.count ?? raw.results.length, pages }, "idv_child_idvs");
}

// --- GET /api/v2/idvs/count/federal_account/{award_id}/ ---

export async function _idvCountFederalAccount(
  awardId: string,
  options?: ClientOptions,
): Promise<USAResult<"idv_count_federal_account">> {
  const raw = await usaGet(
    `/api/v2/idvs/count/federal_account/${enc(awardId)}/`,
    IdvCountSchema,
    undefined,
    options,
  );
  return wrapResponse(raw, null, "idv_count_federal_account");
}

// --- GET /api/v2/idvs/funding_rollup/{award_id}/ ---

export async function _idvFundingRollup(
  awardId: string,
  options?: ClientOptions,
): Promise<USAResult<"idv_funding_rollup">> {
  const raw = await usaGet(
    `/api/v2/idvs/funding_rollup/${enc(awardId)}/`,
    IdvFundingRollupSchema,
    undefined,
    options,
  );
  return wrapResponse(raw, null, "idv_funding_rollup");
}

// --- POST /api/v2/idvs/funding/ ---

export async function _idvFunding(
  params?: { award_id?: number; page?: number; limit?: number; sort?: string; order?: string; piid?: string },
  options?: ClientOptions,
): Promise<USAResult<"idv_funding">> {
  const body: Record<string, unknown> = {};
  if (params?.award_id != null) body.award_id = params.award_id;
  if (params?.page != null) body.page = params.page;
  if (params?.limit != null) body.limit = params.limit;
  if (params?.sort != null) body.sort = params.sort;
  if (params?.order != null) body.order = params.order;
  if (params?.piid != null) body.piid = params.piid;

  const raw = await usaPost("/api/v2/idvs/funding/", IdvFundingResponseSchema, body, options);
  const pm = raw.page_metadata;
  const pages = pm.hasNext ? pm.page + 1 : pm.page;
  return wrapResponse(raw.results, { total_results: pm.count ?? raw.results.length, pages }, "idv_funding");
}
