import type { ClientOptions } from "govdata-core";
import { usaGet, usaPost } from "../../client";
import { wrapResponse } from "../../response";
import type { USAResult } from "../../response";
import {
  DownloadCountResponseSchema,
  DownloadGenerationResponseSchema,
  DownloadStatusResponseSchema,
  BulkDownloadListAgenciesResponseSchema,
  BulkDownloadListMonthlyFilesResponseSchema,
} from "./schemas";

// --- Downloads ---

interface DownloadFilterParams {
  filters: Record<string, unknown>;
  columns?: string[];
  file_format?: "csv" | "tsv";
}

interface DownloadAwardIdParams {
  award_id: number;
  columns?: string[];
  file_format?: "csv" | "tsv";
}

interface DownloadDisasterParams {
  filters: { def_codes: string[]; [key: string]: unknown };
}

interface BulkDownloadListMonthlyFilesParams {
  agency: number | "all";
  fiscal_year: number;
  type: "contracts" | "assistance" | "sub_contracts" | "sub_grants";
}

interface BulkDownloadAwardsParams {
  filters: Record<string, unknown>;
  file_format?: "csv" | "tsv";
}

export async function _downloadCount(
  params: { filters: Record<string, unknown> },
  options?: ClientOptions,
): Promise<USAResult<"download_count">> {
  const raw = await usaPost(
    `/api/v2/download/count/`,
    DownloadCountResponseSchema,
    { filters: params.filters },
    options,
  );
  return wrapResponse(raw, null, "download_count");
}

export async function _downloadAwards(
  params: DownloadFilterParams,
  options?: ClientOptions,
): Promise<USAResult<"download_awards">> {
  const body: Record<string, unknown> = { filters: params.filters };
  if (params.columns) body.columns = params.columns;
  if (params.file_format) body.file_format = params.file_format;
  const raw = await usaPost(
    `/api/v2/download/awards/`,
    DownloadGenerationResponseSchema,
    body,
    options,
  );
  return wrapResponse(raw, null, "download_awards");
}

export async function _downloadTransactions(
  params: DownloadFilterParams,
  options?: ClientOptions,
): Promise<USAResult<"download_transactions">> {
  const body: Record<string, unknown> = { filters: params.filters };
  if (params.columns) body.columns = params.columns;
  if (params.file_format) body.file_format = params.file_format;
  const raw = await usaPost(
    `/api/v2/download/transactions/`,
    DownloadGenerationResponseSchema,
    body,
    options,
  );
  return wrapResponse(raw, null, "download_transactions");
}

export async function _downloadIdv(
  params: DownloadAwardIdParams,
  options?: ClientOptions,
): Promise<USAResult<"download_idv">> {
  const body: Record<string, unknown> = { award_id: params.award_id };
  if (params.columns) body.columns = params.columns;
  if (params.file_format) body.file_format = params.file_format;
  const raw = await usaPost(
    `/api/v2/download/idv/`,
    DownloadGenerationResponseSchema,
    body,
    options,
  );
  return wrapResponse(raw, null, "download_idv");
}

export async function _downloadContract(
  params: DownloadAwardIdParams,
  options?: ClientOptions,
): Promise<USAResult<"download_contract">> {
  const body: Record<string, unknown> = { award_id: params.award_id };
  if (params.columns) body.columns = params.columns;
  if (params.file_format) body.file_format = params.file_format;
  const raw = await usaPost(
    `/api/v2/download/contract/`,
    DownloadGenerationResponseSchema,
    body,
    options,
  );
  return wrapResponse(raw, null, "download_contract");
}

export async function _downloadAssistance(
  params: DownloadAwardIdParams,
  options?: ClientOptions,
): Promise<USAResult<"download_assistance">> {
  const body: Record<string, unknown> = { award_id: params.award_id };
  if (params.columns) body.columns = params.columns;
  if (params.file_format) body.file_format = params.file_format;
  const raw = await usaPost(
    `/api/v2/download/assistance/`,
    DownloadGenerationResponseSchema,
    body,
    options,
  );
  return wrapResponse(raw, null, "download_assistance");
}

export async function _downloadStatus(
  fileName: string,
  options?: ClientOptions,
): Promise<USAResult<"download_status">> {
  const raw = await usaGet(
    `/api/v2/download/status/`,
    DownloadStatusResponseSchema,
    { file_name: fileName },
    options,
  );
  return wrapResponse(raw, null, "download_status");
}

export async function _downloadDisaster(
  params: DownloadDisasterParams,
  options?: ClientOptions,
): Promise<USAResult<"download_disaster">> {
  const raw = await usaPost(
    `/api/v2/download/disaster/`,
    DownloadGenerationResponseSchema,
    { filters: params.filters },
    options,
  );
  return wrapResponse(raw, null, "download_disaster");
}

// --- Bulk Downloads ---

export async function _bulkDownloadListAgenciesAccounts(
  options?: ClientOptions,
): Promise<USAResult<"bulk_download_list_agencies_accounts">> {
  const raw = await usaPost(
    `/api/v2/bulk_download/list_agencies/`,
    BulkDownloadListAgenciesResponseSchema,
    { type: "account_agencies" },
    options,
  );
  return wrapResponse(raw, null, "bulk_download_list_agencies_accounts");
}

export async function _bulkDownloadListAgenciesAwards(
  options?: ClientOptions,
): Promise<USAResult<"bulk_download_list_agencies_awards">> {
  const raw = await usaPost(
    `/api/v2/bulk_download/list_agencies/`,
    BulkDownloadListAgenciesResponseSchema,
    { type: "award_agencies" },
    options,
  );
  return wrapResponse(raw, null, "bulk_download_list_agencies_awards");
}

export async function _bulkDownloadListMonthlyFiles(
  params: BulkDownloadListMonthlyFilesParams,
  options?: ClientOptions,
): Promise<USAResult<"bulk_download_list_monthly_files">> {
  const raw = await usaPost(
    `/api/v2/bulk_download/list_monthly_files/`,
    BulkDownloadListMonthlyFilesResponseSchema,
    {
      agency: params.agency,
      fiscal_year: params.fiscal_year,
      type: params.type,
    },
    options,
  );
  return wrapResponse(raw, null, "bulk_download_list_monthly_files");
}

export async function _bulkDownloadAwards(
  params: BulkDownloadAwardsParams,
  options?: ClientOptions,
): Promise<USAResult<"bulk_download_awards">> {
  const body: Record<string, unknown> = { filters: params.filters };
  if (params.file_format) body.file_format = params.file_format;
  const raw = await usaPost(
    `/api/v2/bulk_download/awards/`,
    DownloadGenerationResponseSchema,
    body,
    options,
  );
  return wrapResponse(raw, null, "bulk_download_awards");
}

export async function _bulkDownloadStatus(
  fileName: string,
  options?: ClientOptions,
): Promise<USAResult<"bulk_download_status">> {
  const raw = await usaGet(
    `/api/v2/bulk_download/status/`,
    DownloadStatusResponseSchema,
    { file_name: fileName },
    options,
  );
  return wrapResponse(raw, null, "bulk_download_status");
}
