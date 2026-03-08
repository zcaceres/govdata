import type { ClientOptions } from "govdata-core";
import { usaGet, usaPost } from "../../client";
import {
  FederalAccountListResponseSchema,
  FederalAccountDetailSchema,
  FiscalYearSnapshotSchema,
  AvailableObjectClassResponseSchema,
  ObjectClassTotalResponseSchema,
  ProgramActivityResponseSchema,
  ProgramActivityTotalResponseSchema,
} from "./schemas";
import { wrapResponse } from "../../response";
import type { USAResult } from "../../response";

const enc = encodeURIComponent;

// --- List federal accounts (POST) ---

interface FederalAccountListParams {
  keyword?: string;
  page?: number;
  limit?: number;
  sort_field?: string;
  sort_direction?: string;
}

export async function _federalAccountList(
  params?: FederalAccountListParams,
  options?: ClientOptions,
): Promise<USAResult<"federal_account_list">> {
  const body: Record<string, unknown> = {};
  if (params?.keyword != null) body.keyword = params.keyword;
  if (params?.page != null) body.page = params.page;
  if (params?.limit != null) body.limit = params.limit;
  if (params?.sort_field != null) body.sort_field = params.sort_field;
  if (params?.sort_direction != null) body.sort_direction = params.sort_direction;

  const raw = await usaPost(
    "/api/v2/federal_account/",
    FederalAccountListResponseSchema,
    body,
    options,
  );

  const pages = raw.hasNext ? (raw.page ?? 1) + 1 : raw.page ?? 1;
  return wrapResponse(
    raw.results,
    { total_results: raw.count ?? raw.results.length, pages },
    "federal_account_list",
  );
}

// --- Detail (GET) ---

export async function _federalAccountDetail(
  id: number,
  options?: ClientOptions,
): Promise<USAResult<"federal_account_detail">> {
  const raw = await usaGet(
    `/api/v2/federal_account/${enc(String(id))}/`,
    FederalAccountDetailSchema,
    undefined,
    options,
  );
  return wrapResponse(raw, null, "federal_account_detail");
}

// --- Fiscal year snapshot (GET) ---

export async function _federalAccountFiscalYearSnapshot(
  id: number,
  fy?: number,
  options?: ClientOptions,
): Promise<USAResult<"federal_account_fiscal_year_snapshot">> {
  const path = fy != null
    ? `/api/v2/federal_account/${enc(String(id))}/fiscal_year_snapshot/${enc(String(fy))}/`
    : `/api/v2/federal_account/${enc(String(id))}/fiscal_year_snapshot/`;

  const raw = await usaGet(
    path,
    FiscalYearSnapshotSchema,
    undefined,
    options,
  );
  return wrapResponse(raw, null, "federal_account_fiscal_year_snapshot");
}

// --- Available object classes (GET) ---

export async function _federalAccountAvailableObjectClasses(
  id: number,
  options?: ClientOptions,
): Promise<USAResult<"federal_account_available_object_classes">> {
  const raw = await usaGet(
    `/api/v2/federal_account/${enc(String(id))}/available_object_classes/`,
    AvailableObjectClassResponseSchema,
    undefined,
    options,
  );
  return wrapResponse(raw.results, null, "federal_account_available_object_classes");
}

// --- Spending by object class (POST) ---

interface PaginatedParams {
  page?: number;
  limit?: number;
}

export async function _federalAccountObjectClasses(
  id: number,
  params?: PaginatedParams,
  options?: ClientOptions,
): Promise<USAResult<"federal_account_object_classes">> {
  const body: Record<string, unknown> = {};
  if (params?.page != null) body.page = params.page;
  if (params?.limit != null) body.limit = params.limit;

  const raw = await usaPost(
    `/api/v2/federal_account/${enc(String(id))}/spending_by_object_class/`,
    ObjectClassTotalResponseSchema,
    body,
    options,
  );

  const pm = raw.page_metadata;
  const pages = pm.hasNext ? pm.page + 1 : pm.page;
  return wrapResponse(
    raw.results,
    { total_results: pm.total ?? raw.results.length, pages },
    "federal_account_object_classes",
  );
}

// --- Spending by program activity (POST) ---

export async function _federalAccountProgramActivities(
  id: number,
  params?: PaginatedParams,
  options?: ClientOptions,
): Promise<USAResult<"federal_account_program_activities">> {
  const body: Record<string, unknown> = {};
  if (params?.page != null) body.page = params.page;
  if (params?.limit != null) body.limit = params.limit;

  const raw = await usaPost(
    `/api/v2/federal_account/${enc(String(id))}/spending_by_program_activity/`,
    ProgramActivityResponseSchema,
    body,
    options,
  );

  const pm = raw.page_metadata;
  const pages = pm.hasNext ? pm.page + 1 : pm.page;
  return wrapResponse(
    raw.results,
    { total_results: pm.total ?? raw.results.length, pages },
    "federal_account_program_activities",
  );
}

// --- Spending by program activity / object class total (POST) ---

export async function _federalAccountProgramActivitiesTotal(
  id: number,
  params?: PaginatedParams,
  options?: ClientOptions,
): Promise<USAResult<"federal_account_program_activities_total">> {
  const body: Record<string, unknown> = {};
  if (params?.page != null) body.page = params.page;
  if (params?.limit != null) body.limit = params.limit;

  const raw = await usaPost(
    `/api/v2/federal_account/${enc(String(id))}/spending_by_program_activity_object_class/`,
    ProgramActivityTotalResponseSchema,
    body,
    options,
  );

  const pm = raw.page_metadata;
  const pages = pm.hasNext ? pm.page + 1 : pm.page;
  return wrapResponse(
    raw.results,
    { total_results: pm.total ?? raw.results.length, pages },
    "federal_account_program_activities_total",
  );
}
