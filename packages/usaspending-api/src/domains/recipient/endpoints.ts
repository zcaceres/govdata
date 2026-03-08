import type { ClientOptions } from "govdata-core";
import { usaGet, usaPost } from "../../client";
import {
  SpendingByStateResponseSchema,
  RecipientListResponseSchema,
  RecipientCountSchema,
  RecipientDetailSchema,
  RecipientChildrenResponseSchema,
  StateDetailSchema,
  StateAwardsResponseSchema,
} from "./schemas";
import { wrapResponse } from "../../response";
import type { USAResult } from "../../response";

function enc(s: string) {
  return encodeURIComponent(s);
}

export async function _spendingByState(
  options?: ClientOptions,
): Promise<USAResult<"spending_by_state">> {
  const raw = await usaGet(
    "/api/v2/recipient/state/",
    SpendingByStateResponseSchema,
    undefined,
    options,
  );
  return wrapResponse(raw, null, "spending_by_state");
}

export async function _recipientList(
  params?: { keyword?: string; award_type?: string; page?: number; limit?: number; order?: string; sort?: string },
  options?: ClientOptions,
): Promise<USAResult<"recipient_list">> {
  const body: Record<string, unknown> = {};
  if (params?.keyword) body.keyword = params.keyword;
  if (params?.award_type) body.award_type = params.award_type;
  if (params?.page) body.page = params.page;
  if (params?.limit) body.limit = params.limit;
  if (params?.order) body.order = params.order;
  if (params?.sort) body.sort = params.sort;
  const raw = await usaPost(
    "/api/v2/recipient/",
    RecipientListResponseSchema,
    body,
    options,
  );
  const pm = raw.page_metadata;
  const pages = pm.hasNext ? pm.page + 1 : pm.page;
  return wrapResponse(raw.results, { total_results: pm.total ?? raw.results.length, pages }, "recipient_list");
}

export async function _recipientCount(
  params?: { keyword?: string; award_type?: string },
  options?: ClientOptions,
): Promise<USAResult<"recipient_count">> {
  const body: Record<string, unknown> = {};
  if (params?.keyword) body.keyword = params.keyword;
  if (params?.award_type) body.award_type = params.award_type;
  const raw = await usaPost(
    "/api/v2/recipient/count/",
    RecipientCountSchema,
    body,
    options,
  );
  return wrapResponse(raw, null, "recipient_count");
}

export async function _recipientDetail(
  recipientId: string,
  params?: { year?: string },
  options?: ClientOptions,
): Promise<USAResult<"recipient_detail">> {
  const q: Record<string, string> = {};
  if (params?.year) q.year = params.year;
  const raw = await usaGet(
    `/api/v2/recipient/${enc(recipientId)}/`,
    RecipientDetailSchema,
    Object.keys(q).length > 0 ? q : undefined,
    options,
  );
  return wrapResponse(raw, null, "recipient_detail");
}

export async function _recipientChildren(
  recipientId: string,
  params?: { year?: string },
  options?: ClientOptions,
): Promise<USAResult<"recipient_children">> {
  const q: Record<string, string> = {};
  if (params?.year) q.year = params.year;
  const raw = await usaGet(
    `/api/v2/recipient/${enc(recipientId)}/children/`,
    RecipientChildrenResponseSchema,
    Object.keys(q).length > 0 ? q : undefined,
    options,
  );
  return wrapResponse(raw, null, "recipient_children");
}

export async function _stateDetail(
  fips: string,
  params?: { year?: number },
  options?: ClientOptions,
): Promise<USAResult<"state_detail">> {
  const q: Record<string, string> = {};
  if (params?.year) q.year = String(params.year);
  const raw = await usaGet(
    `/api/v2/recipient/state/${enc(fips)}/`,
    StateDetailSchema,
    Object.keys(q).length > 0 ? q : undefined,
    options,
  );
  return wrapResponse(raw, null, "state_detail");
}

export async function _stateAwards(
  fips: string,
  params?: { year?: number },
  options?: ClientOptions,
): Promise<USAResult<"state_awards">> {
  const q: Record<string, string> = {};
  if (params?.year) q.year = String(params.year);
  const raw = await usaGet(
    `/api/v2/recipient/state/awards/${enc(fips)}/`,
    StateAwardsResponseSchema,
    Object.keys(q).length > 0 ? q : undefined,
    options,
  );
  return wrapResponse(raw, null, "state_awards");
}
