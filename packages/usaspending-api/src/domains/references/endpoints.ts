import type { ClientOptions } from "govdata-core";
import { usaGet, usaPost } from "../../client";
import {
  ToptierAgenciesResponseSchema,
  AgencyReferenceResponseSchema,
  AwardTypesResponseSchema,
  GlossaryResponseSchema,
  DefCodesResponseSchema,
  NaicsRefResponseSchema,
  DataDictionaryResponseSchema,
  FilterHashResponseSchema,
  FilterTreeResponseSchema,
  SubmissionPeriodsResponseSchema,
  TotalBudgetaryResourcesResponseSchema,
  CfdaTotalsResponseSchema,
} from "./schemas";
import { wrapResponse } from "../../response";
import type { USAResult } from "../../response";
import { z } from "zod";

export async function _refToptierAgencies(
  params?: { sort?: string; order?: string },
  options?: ClientOptions,
): Promise<USAResult<"ref_toptier_agencies">> {
  const q: Record<string, string> = {};
  if (params?.sort) q.sort = params.sort;
  if (params?.order) q.order = params.order;
  const raw = await usaGet(
    "/api/v2/references/toptier_agencies/",
    ToptierAgenciesResponseSchema,
    Object.keys(q).length > 0 ? q : undefined,
    options,
  );
  return wrapResponse(raw.results, null, "ref_toptier_agencies");
}

export async function _refAgency(
  agency_id: number,
  options?: ClientOptions,
): Promise<USAResult<"ref_agency">> {
  const raw = await usaGet(
    `/api/v2/references/agency/${encodeURIComponent(String(agency_id))}/`,
    AgencyReferenceResponseSchema,
    undefined,
    options,
  );
  return wrapResponse(raw.results, null, "ref_agency");
}

export async function _refAwardTypes(
  options?: ClientOptions,
): Promise<USAResult<"ref_award_types">> {
  const raw = await usaGet(
    "/api/v2/references/award_types/",
    AwardTypesResponseSchema,
    undefined,
    options,
  );
  return wrapResponse(raw, null, "ref_award_types");
}

export async function _refGlossary(
  params?: { page?: number; limit?: number },
  options?: ClientOptions,
): Promise<USAResult<"ref_glossary">> {
  const q: Record<string, string> = {};
  if (params?.page != null) q.page = String(params.page);
  if (params?.limit != null) q.limit = String(params.limit);
  const raw = await usaGet(
    "/api/v2/references/glossary/",
    GlossaryResponseSchema,
    Object.keys(q).length > 0 ? q : undefined,
    options,
  );
  const pm = raw.page_metadata;
  const pages = pm.hasNext ? pm.page + 1 : pm.page;
  return wrapResponse(raw.results, { total_results: pm.count ?? raw.results.length, pages }, "ref_glossary");
}

export async function _refDefCodes(
  options?: ClientOptions,
): Promise<USAResult<"ref_def_codes">> {
  const raw = await usaGet(
    "/api/v2/references/def_codes/",
    DefCodesResponseSchema,
    undefined,
    options,
  );
  return wrapResponse(raw.codes, null, "ref_def_codes");
}

export async function _refNaics(
  params?: { code?: string },
  options?: ClientOptions,
): Promise<USAResult<"ref_naics">> {
  const path = params?.code
    ? `/api/v2/references/naics/${encodeURIComponent(params.code)}/`
    : "/api/v2/references/naics/";
  const raw = await usaGet(
    path,
    NaicsRefResponseSchema,
    undefined,
    options,
  );
  return wrapResponse(raw.results, null, "ref_naics");
}

export async function _refDataDictionary(
  options?: ClientOptions,
): Promise<USAResult<"ref_data_dictionary">> {
  const raw = await usaGet(
    "/api/v2/references/data_dictionary/",
    DataDictionaryResponseSchema,
    undefined,
    options,
  );
  return wrapResponse(raw.document, null, "ref_data_dictionary");
}

export async function _refFilterHash(
  filters: Record<string, unknown>,
  options?: ClientOptions,
): Promise<USAResult<"ref_filter_hash">> {
  const raw = await usaPost(
    "/api/v2/references/filter/",
    FilterHashResponseSchema,
    { filters },
    options,
  );
  return wrapResponse(raw, null, "ref_filter_hash");
}

export async function _refFilterTreePsc(
  params?: { depth?: number; filter?: string },
  options?: ClientOptions,
): Promise<USAResult<"ref_filter_tree_psc">> {
  const q: Record<string, string> = {};
  if (params?.depth != null) q.depth = String(params.depth);
  if (params?.filter) q.filter = params.filter;
  const raw = await usaGet(
    "/api/v2/references/filter_tree/psc/",
    FilterTreeResponseSchema,
    Object.keys(q).length > 0 ? q : undefined,
    options,
  );
  return wrapResponse(raw.results, null, "ref_filter_tree_psc");
}

export async function _refFilterTreeTas(
  params?: { depth?: number; filter?: string },
  options?: ClientOptions,
): Promise<USAResult<"ref_filter_tree_tas">> {
  const q: Record<string, string> = {};
  if (params?.depth != null) q.depth = String(params.depth);
  if (params?.filter) q.filter = params.filter;
  const raw = await usaGet(
    "/api/v2/references/filter_tree/tas/",
    FilterTreeResponseSchema,
    Object.keys(q).length > 0 ? q : undefined,
    options,
  );
  return wrapResponse(raw.results, null, "ref_filter_tree_tas");
}

export async function _refSubmissionPeriods(
  options?: ClientOptions,
): Promise<USAResult<"ref_submission_periods">> {
  const raw = await usaGet(
    "/api/v2/references/submission_periods/",
    SubmissionPeriodsResponseSchema,
    undefined,
    options,
  );
  return wrapResponse(raw.available_periods, null, "ref_submission_periods");
}

export async function _refTotalBudgetaryResources(
  options?: ClientOptions,
): Promise<USAResult<"ref_total_budgetary_resources">> {
  const raw = await usaGet(
    "/api/v2/references/total_budgetary_resources/",
    TotalBudgetaryResourcesResponseSchema,
    undefined,
    options,
  );
  return wrapResponse(raw.results, null, "ref_total_budgetary_resources");
}

export async function _refAssistanceListing(
  options?: ClientOptions,
): Promise<USAResult<"ref_assistance_listing">> {
  const raw = await usaGet(
    "/api/v2/references/assistance_listing/",
    z.array(z.unknown()),
    undefined,
    options,
  );
  return wrapResponse(raw as any, null, "ref_assistance_listing");
}

export async function _refCfdaTotals(
  params?: { cfda?: string },
  options?: ClientOptions,
): Promise<USAResult<"ref_cfda_totals">> {
  const q: Record<string, string> = {};
  if (params?.cfda) q.cfda = params.cfda;
  const raw = await usaGet(
    "/api/v2/references/cfda/totals/",
    CfdaTotalsResponseSchema,
    Object.keys(q).length > 0 ? q : undefined,
    options,
  );
  return wrapResponse(raw, null, "ref_cfda_totals");
}
