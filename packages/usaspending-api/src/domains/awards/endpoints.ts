import type { ClientOptions } from "govdata-core";
import { usaGet } from "../../client";
import {
  AwardDetailSchema,
  AwardAccountsResponseSchema,
  AwardCountFederalAccountSchema,
  AwardCountSubawardSchema,
  AwardCountTransactionSchema,
  AwardFundingResponseSchema,
  AwardFundingRollupSchema,
  AwardLastUpdatedSchema,
  AwardSpendingRecipientResponseSchema,
} from "./schemas";
import { wrapResponse } from "../../response";
import type { USAResult } from "../../response";

function enc(s: string) {
  return encodeURIComponent(s);
}

export async function _findAward(
  id: string,
  options?: ClientOptions,
): Promise<USAResult<"award">> {
  const raw = await usaGet(
    `/api/v2/awards/${enc(id)}/`,
    AwardDetailSchema,
    undefined,
    options,
  );
  return wrapResponse([raw], null, "award");
}

export async function _awardAccounts(
  id: string,
  params?: { page?: number; limit?: number },
  options?: ClientOptions,
): Promise<USAResult<"award_accounts">> {
  const q: Record<string, string> = {};
  if (params?.page != null) q.page = String(params.page);
  if (params?.limit != null) q.limit = String(params.limit);
  const raw = await usaGet(
    `/api/v2/awards/${enc(id)}/accounts/`,
    AwardAccountsResponseSchema,
    Object.keys(q).length > 0 ? q : undefined,
    options,
  );
  const pm = raw.page_metadata;
  const pages = pm.hasNext ? pm.page + 1 : pm.page;
  return wrapResponse(raw.results, { total_results: pm.count ?? raw.results.length, pages }, "award_accounts");
}

export async function _awardCountFederalAccount(
  id: string,
  options?: ClientOptions,
): Promise<USAResult<"award_count_federal_account">> {
  const raw = await usaGet(
    `/api/v2/awards/${enc(id)}/count/federal_account/`,
    AwardCountFederalAccountSchema,
    undefined,
    options,
  );
  return wrapResponse(raw, null, "award_count_federal_account");
}

export async function _awardCountSubaward(
  id: string,
  options?: ClientOptions,
): Promise<USAResult<"award_count_subaward">> {
  const raw = await usaGet(
    `/api/v2/awards/${enc(id)}/count/subaward/`,
    AwardCountSubawardSchema,
    undefined,
    options,
  );
  return wrapResponse(raw, null, "award_count_subaward");
}

export async function _awardCountTransaction(
  id: string,
  options?: ClientOptions,
): Promise<USAResult<"award_count_transaction">> {
  const raw = await usaGet(
    `/api/v2/awards/${enc(id)}/count/transaction/`,
    AwardCountTransactionSchema,
    undefined,
    options,
  );
  return wrapResponse(raw, null, "award_count_transaction");
}

export async function _awardFunding(
  id: string,
  params?: { page?: number; limit?: number },
  options?: ClientOptions,
): Promise<USAResult<"award_funding">> {
  const q: Record<string, string> = {};
  if (params?.page != null) q.page = String(params.page);
  if (params?.limit != null) q.limit = String(params.limit);
  const raw = await usaGet(
    `/api/v2/awards/${enc(id)}/funding/`,
    AwardFundingResponseSchema,
    Object.keys(q).length > 0 ? q : undefined,
    options,
  );
  const pm = raw.page_metadata;
  const pages = pm.hasNext ? pm.page + 1 : pm.page;
  return wrapResponse(raw.results, { total_results: raw.results.length, pages }, "award_funding");
}

export async function _awardFundingRollup(
  id: string,
  options?: ClientOptions,
): Promise<USAResult<"award_funding_rollup">> {
  const raw = await usaGet(
    `/api/v2/awards/${enc(id)}/funding_rollup/`,
    AwardFundingRollupSchema,
    undefined,
    options,
  );
  return wrapResponse(raw, null, "award_funding_rollup");
}

export async function _awardLastUpdated(
  options?: ClientOptions,
): Promise<USAResult<"award_last_updated">> {
  const raw = await usaGet(
    `/api/v2/awards/last_updated/`,
    AwardLastUpdatedSchema,
    undefined,
    options,
  );
  return wrapResponse(raw, null, "award_last_updated");
}

export async function _awardSpendingRecipient(
  params?: { awarding_agency_id?: number; fiscal_year?: number; page?: number; limit?: number },
  options?: ClientOptions,
): Promise<USAResult<"award_spending_recipient">> {
  const q: Record<string, string> = {};
  if (params?.awarding_agency_id != null) q.awarding_agency_id = String(params.awarding_agency_id);
  if (params?.fiscal_year != null) q.fiscal_year = String(params.fiscal_year);
  if (params?.page != null) q.page = String(params.page);
  if (params?.limit != null) q.limit = String(params.limit);
  const raw = await usaGet(
    `/api/v2/award_spending/recipient/`,
    AwardSpendingRecipientResponseSchema,
    Object.keys(q).length > 0 ? q : undefined,
    options,
  );
  const pm = raw.page_metadata;
  const pages = pm.has_next_page ? pm.page + 1 : pm.page;
  return wrapResponse(raw.results, { total_results: pm.count ?? raw.results.length, pages }, "award_spending_recipient");
}
