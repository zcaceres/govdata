import { z } from "zod";
import {
  DownloadCountResponseSchema,
  DownloadGenerationResponseSchema,
  DownloadStatusResponseSchema,
  BulkDownloadListAgenciesResponseSchema,
  BulkDownloadListMonthlyFilesResponseSchema,
} from "./schemas";

export type DownloadCountResponse = z.infer<typeof DownloadCountResponseSchema>;
export type DownloadGenerationResponse = z.infer<typeof DownloadGenerationResponseSchema>;
export type DownloadStatusResponse = z.infer<typeof DownloadStatusResponseSchema>;
export type BulkDownloadListAgenciesResponse = z.infer<typeof BulkDownloadListAgenciesResponseSchema>;
export type BulkDownloadListMonthlyFilesResponse = z.infer<typeof BulkDownloadListMonthlyFilesResponseSchema>;

export interface DownloadsKindMap {
  download_count: DownloadCountResponse;
  download_awards: DownloadGenerationResponse;
  download_transactions: DownloadGenerationResponse;
  download_idv: DownloadGenerationResponse;
  download_contract: DownloadGenerationResponse;
  download_assistance: DownloadGenerationResponse;
  download_status: DownloadStatusResponse;
  download_disaster: DownloadGenerationResponse;
  bulk_download_list_agencies_accounts: BulkDownloadListAgenciesResponse;
  bulk_download_list_agencies_awards: BulkDownloadListAgenciesResponse;
  bulk_download_list_monthly_files: BulkDownloadListMonthlyFilesResponse;
  bulk_download_awards: DownloadGenerationResponse;
  bulk_download_status: DownloadStatusResponse;
}
