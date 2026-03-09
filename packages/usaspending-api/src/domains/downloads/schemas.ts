import { z } from "zod";
import { AwardSearchFiltersSchema } from "../../shared-schemas";

// --- Download count ---

export const DownloadCountResponseSchema = z.object({
  calculated_transaction_count: z.number().nullable().optional(),
  maximum_transaction_limit: z.number().nullable().optional(),
  transaction_rows_gt_limit: z.boolean().nullable().optional(),
  calculated_count: z.number().nullable().optional(),
  spending_level: z.string().nullable().optional(),
  maximum_limit: z.number().nullable().optional(),
  rows_gt_limit: z.boolean().nullable().optional(),
  messages: z.array(z.string()).optional(),
}).passthrough();

// --- Download generation response (shared by awards, transactions, idv, contract, assistance, disaster, bulk_download_awards) ---

export const DownloadGenerationResponseSchema = z.object({
  status_url: z.string().nullable().optional(),
  file_name: z.string().nullable().optional(),
  file_url: z.string().nullable().optional(),
  download_request_id: z.union([z.number(), z.string()]).nullable().optional(),
  status: z.string().nullable().optional(),
  message: z.string().nullable().optional(),
}).passthrough();

// --- Download status ---

export const DownloadStatusResponseSchema = z.object({
  status: z.string().nullable().optional(),
  status_url: z.string().nullable().optional(),
  file_name: z.string().nullable().optional(),
  file_url: z.string().nullable().optional(),
  download_request_id: z.union([z.number(), z.string()]).nullable().optional(),
  message: z.string().nullable().optional(),
  seconds_elapsed: z.string().nullable().optional(),
  total_rows: z.number().nullable().optional(),
  total_columns: z.number().nullable().optional(),
}).passthrough();

// --- Bulk download list agencies ---

const BulkDownloadAgencySchema = z.object({
  name: z.string(),
  toptier_agency_id: z.number(),
  toptier_code: z.string(),
}).passthrough();

const BulkDownloadAgencyGroupSchema = z.object({
  cfo_agencies: z.array(BulkDownloadAgencySchema),
  other_agencies: z.array(BulkDownloadAgencySchema),
}).passthrough();

export const BulkDownloadListAgenciesResponseSchema = z.object({
  agencies: BulkDownloadAgencyGroupSchema,
  sub_agencies: z.array(z.unknown()),
}).passthrough();

// --- Bulk download list monthly files ---

const MonthlyFileSchema = z.object({
  agency_name: z.string().nullable().optional(),
  agency_acronym: z.string().nullable().optional(),
  file_name: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
  fiscal_year: z.number().nullable().optional(),
  updated_date: z.string().nullable().optional(),
}).passthrough();

export const BulkDownloadListMonthlyFilesResponseSchema = z.object({
  monthly_files: z.array(MonthlyFileSchema),
}).passthrough();

// --- Request body schemas ---

export const DownloadCountParamsSchema = z.object({
  filters: AwardSearchFiltersSchema,
}).strict();

export const DownloadAwardsParamsSchema = z.object({
  filters: AwardSearchFiltersSchema,
  columns: z.array(z.string()).optional(),
  file_format: z.enum(["csv", "tsv"]).optional(),
}).strict();

export const DownloadTransactionsParamsSchema = z.object({
  filters: AwardSearchFiltersSchema,
  columns: z.array(z.string()).optional(),
  file_format: z.enum(["csv", "tsv"]).optional(),
}).strict();

export const DownloadAwardIdParamsSchema = z.object({
  award_id: z.number(),
  columns: z.array(z.string()).optional(),
  file_format: z.enum(["csv", "tsv"]).optional(),
}).strict();

export const DownloadDisasterParamsSchema = z.object({
  filters: z.object({
    def_codes: z.array(z.string()),
  }).passthrough(),
}).strict();

export const BulkDownloadListMonthlyFilesParamsSchema = z.object({
  agency: z.union([z.number(), z.literal("all")]),
  fiscal_year: z.number(),
  type: z.enum(["contracts", "assistance", "sub_contracts", "sub_grants"]),
}).strict();

export const BulkDownloadAwardsParamsSchema = z.object({
  filters: AwardSearchFiltersSchema,
  file_format: z.enum(["csv", "tsv"]).optional(),
}).strict();
