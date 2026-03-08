import type { ClientOptions } from "govdata-core";
import { usaGet } from "../../client";
import { wrapResponse } from "../../response";
import type { USAResult } from "../../response";
import {
  ReportingAgencyOverviewResponseSchema,
  ReportingPublishDatesResponseSchema,
  ReportingDifferencesResponseSchema,
  ReportingDiscrepanciesResponseSchema,
  ReportingSingleAgencyResponseSchema,
  SubmissionHistoryResponseSchema,
  UnlinkedAwardsSchema,
} from "./schemas";

function enc(s: string) {
  return encodeURIComponent(s);
}

interface ReportingListParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
  fiscal_year?: number;
  fiscal_period?: number;
  filter?: string;
}

interface ReportingPageParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}

function toListQuery(params?: ReportingListParams): Record<string, string> | undefined {
  if (!params) return undefined;
  const q: Record<string, string> = {};
  if (params.page != null) q.page = String(params.page);
  if (params.limit != null) q.limit = String(params.limit);
  if (params.sort != null) q.sort = params.sort;
  if (params.order != null) q.order = params.order;
  if (params.fiscal_year != null) q.fiscal_year = String(params.fiscal_year);
  if (params.fiscal_period != null) q.fiscal_period = String(params.fiscal_period);
  if (params.filter != null) q.filter = params.filter;
  return Object.keys(q).length > 0 ? q : undefined;
}

function toPageQuery(params?: ReportingPageParams): Record<string, string> | undefined {
  if (!params) return undefined;
  const q: Record<string, string> = {};
  if (params.page != null) q.page = String(params.page);
  if (params.limit != null) q.limit = String(params.limit);
  if (params.sort != null) q.sort = params.sort;
  if (params.order != null) q.order = params.order;
  return Object.keys(q).length > 0 ? q : undefined;
}

export async function _reportingAgenciesOverview(
  params?: ReportingListParams,
  options?: ClientOptions,
): Promise<USAResult<"reporting_agencies_overview">> {
  const raw = await usaGet(
    `/api/v2/reporting/agencies/overview/`,
    ReportingAgencyOverviewResponseSchema,
    toListQuery(params),
    options,
  );
  const pm = raw.page_metadata;
  const pages = pm.hasNext ? pm.page + 1 : pm.page;
  return wrapResponse(raw.results, { total_results: pm.total ?? raw.results.length, pages }, "reporting_agencies_overview");
}

export async function _reportingPublishDates(
  params?: ReportingListParams,
  options?: ClientOptions,
): Promise<USAResult<"reporting_publish_dates">> {
  const raw = await usaGet(
    `/api/v2/reporting/agencies/publish_dates/`,
    ReportingPublishDatesResponseSchema,
    toListQuery(params),
    options,
  );
  const pm = raw.page_metadata;
  const pages = pm.hasNext ? pm.page + 1 : pm.page;
  return wrapResponse(raw.results, { total_results: pm.total ?? raw.results.length, pages }, "reporting_publish_dates");
}

export async function _reportingDifferences(
  toptierCode: string,
  fiscalYear: number,
  fiscalPeriod: number,
  params?: ReportingPageParams,
  options?: ClientOptions,
): Promise<USAResult<"reporting_differences">> {
  const raw = await usaGet(
    `/api/v2/reporting/agencies/${enc(toptierCode)}/${enc(String(fiscalYear))}/${enc(String(fiscalPeriod))}/differences/`,
    ReportingDifferencesResponseSchema,
    toPageQuery(params),
    options,
  );
  const pm = raw.page_metadata;
  const pages = pm.hasNext ? pm.page + 1 : pm.page;
  return wrapResponse(raw.results, { total_results: pm.total ?? raw.results.length, pages }, "reporting_differences");
}

export async function _reportingDiscrepancies(
  toptierCode: string,
  fiscalYear: number,
  fiscalPeriod: number,
  params?: ReportingPageParams,
  options?: ClientOptions,
): Promise<USAResult<"reporting_discrepancies">> {
  const raw = await usaGet(
    `/api/v2/reporting/agencies/${enc(toptierCode)}/${enc(String(fiscalYear))}/${enc(String(fiscalPeriod))}/discrepancies/`,
    ReportingDiscrepanciesResponseSchema,
    toPageQuery(params),
    options,
  );
  const pm = raw.page_metadata;
  const pages = pm.hasNext ? pm.page + 1 : pm.page;
  return wrapResponse(raw.results, { total_results: pm.total ?? raw.results.length, pages }, "reporting_discrepancies");
}

export async function _reportingAgencyOverview(
  toptierCode: string,
  params?: ReportingPageParams,
  options?: ClientOptions,
): Promise<USAResult<"reporting_agency_overview">> {
  const raw = await usaGet(
    `/api/v2/reporting/agencies/${enc(toptierCode)}/overview/`,
    ReportingSingleAgencyResponseSchema,
    toPageQuery(params),
    options,
  );
  const pm = raw.page_metadata;
  const pages = pm.hasNext ? pm.page + 1 : pm.page;
  return wrapResponse(raw.results, { total_results: pm.total ?? raw.results.length, pages }, "reporting_agency_overview");
}

export async function _reportingSubmissionHistory(
  toptierCode: string,
  fiscalYear: number,
  fiscalPeriod: number,
  params?: ReportingPageParams,
  options?: ClientOptions,
): Promise<USAResult<"reporting_submission_history">> {
  const raw = await usaGet(
    `/api/v2/reporting/agencies/${enc(toptierCode)}/${enc(String(fiscalYear))}/${enc(String(fiscalPeriod))}/submission_history/`,
    SubmissionHistoryResponseSchema,
    toPageQuery(params),
    options,
  );
  const pm = raw.page_metadata;
  const pages = pm.hasNext ? pm.page + 1 : pm.page;
  return wrapResponse(raw.results, { total_results: pm.total ?? raw.results.length, pages }, "reporting_submission_history");
}

export async function _reportingUnlinkedAssistance(
  toptierCode: string,
  fiscalYear: number,
  fiscalPeriod: number,
  options?: ClientOptions,
): Promise<USAResult<"reporting_unlinked_assistance">> {
  const raw = await usaGet(
    `/api/v2/reporting/agencies/${enc(toptierCode)}/${enc(String(fiscalYear))}/${enc(String(fiscalPeriod))}/unlinked_awards/assistance/`,
    UnlinkedAwardsSchema,
    undefined,
    options,
  );
  return wrapResponse(raw, null, "reporting_unlinked_assistance");
}

export async function _reportingUnlinkedProcurement(
  toptierCode: string,
  fiscalYear: number,
  fiscalPeriod: number,
  options?: ClientOptions,
): Promise<USAResult<"reporting_unlinked_procurement">> {
  const raw = await usaGet(
    `/api/v2/reporting/agencies/${enc(toptierCode)}/${enc(String(fiscalYear))}/${enc(String(fiscalPeriod))}/unlinked_awards/procurement/`,
    UnlinkedAwardsSchema,
    undefined,
    options,
  );
  return wrapResponse(raw, null, "reporting_unlinked_procurement");
}
