import type { EndpointDescription } from "govdata-core";

const filterParams = [
  { name: "keyword", type: "string", required: false },
  { name: "start_date", type: "string", required: false },
  { name: "end_date", type: "string", required: false },
  { name: "award_type", type: "string", required: false, values: ["contracts", "idvs", "grants", "direct_payments", "loans", "other"] },
  { name: "agency", type: "string", required: false },
];

const fileFormatParam = { name: "file_format", type: "string", required: false, values: ["csv", "tsv"] };
const columnsParam = { name: "columns", type: "string", required: false };

export const downloadsEndpoints: EndpointDescription[] = [
  {
    name: "download_count",
    path: "/api/v2/download/count/",
    description: "Get count of records that would be in a download based on award search filters",
    params: filterParams,
    responseFields: [
      "calculated_transaction_count", "maximum_transaction_limit", "transaction_rows_gt_limit",
      "calculated_count", "spending_level", "maximum_limit", "rows_gt_limit", "messages",
    ],
  },
  {
    name: "download_awards",
    path: "/api/v2/download/awards/",
    description: "Generate an award data download file based on search filters",
    params: [...filterParams, columnsParam, fileFormatParam],
    responseFields: ["status_url", "file_name", "file_url", "download_request_id", "status", "message"],
  },
  {
    name: "download_transactions",
    path: "/api/v2/download/transactions/",
    description: "Generate a transaction data download file based on search filters",
    params: [...filterParams, columnsParam, fileFormatParam],
    responseFields: ["status_url", "file_name", "file_url", "download_request_id", "status", "message"],
  },
  {
    name: "download_idv",
    path: "/api/v2/download/idv/",
    description: "Generate an IDV (Indefinite Delivery Vehicle) download file",
    params: [
      { name: "award_id", type: "number", required: true },
      columnsParam,
      fileFormatParam,
    ],
    responseFields: ["status_url", "file_name", "file_url", "download_request_id", "status", "message"],
  },
  {
    name: "download_contract",
    path: "/api/v2/download/contract/",
    description: "Generate a contract award download file",
    params: [
      { name: "award_id", type: "number", required: true },
      columnsParam,
      fileFormatParam,
    ],
    responseFields: ["status_url", "file_name", "file_url", "download_request_id", "status", "message"],
  },
  {
    name: "download_assistance",
    path: "/api/v2/download/assistance/",
    description: "Generate an assistance award download file",
    params: [
      { name: "award_id", type: "number", required: true },
      columnsParam,
      fileFormatParam,
    ],
    responseFields: ["status_url", "file_name", "file_url", "download_request_id", "status", "message"],
  },
  {
    name: "download_status",
    path: "/api/v2/download/status/",
    description: "Check the status of a download generation request",
    params: [
      { name: "file_name", type: "string", required: true },
    ],
    responseFields: ["status", "status_url", "file_name", "file_url", "download_request_id", "message", "seconds_elapsed", "total_rows", "total_columns"],
  },
  {
    name: "download_disaster",
    path: "/api/v2/download/disaster/",
    description: "Generate a disaster spending download file",
    params: [
      { name: "def_codes", type: "string", required: false },
    ],
    responseFields: ["status_url", "file_name", "file_url", "download_request_id", "status", "message"],
  },
  {
    name: "bulk_download_list_agencies_accounts",
    path: "/api/v2/bulk_download/list_agencies/",
    description: "List agencies available for account bulk downloads",
    params: [],
    responseFields: ["agencies", "sub_agencies"],
  },
  {
    name: "bulk_download_list_agencies_awards",
    path: "/api/v2/bulk_download/list_agencies/",
    description: "List agencies available for award bulk downloads",
    params: [],
    responseFields: ["agencies", "sub_agencies"],
  },
  {
    name: "bulk_download_list_monthly_files",
    path: "/api/v2/bulk_download/list_monthly_files/",
    description: "List available monthly bulk download files for an agency",
    params: [
      { name: "agency", type: "string", required: true },
      { name: "fiscal_year", type: "number", required: true },
      { name: "type", type: "string", required: true, values: ["contracts", "assistance", "sub_contracts", "sub_grants"] },
    ],
    responseFields: ["monthly_files"],
  },
  {
    name: "bulk_download_awards",
    path: "/api/v2/bulk_download/awards/",
    description: "Generate a bulk award download file",
    params: [...filterParams, fileFormatParam],
    responseFields: ["status_url", "file_name", "file_url", "download_request_id", "status", "message"],
  },
  {
    name: "bulk_download_status",
    path: "/api/v2/bulk_download/status/",
    description: "Check the status of a bulk download generation request",
    params: [
      { name: "file_name", type: "string", required: true },
    ],
    responseFields: ["status", "status_url", "file_name", "file_url", "download_request_id", "message", "seconds_elapsed", "total_rows", "total_columns"],
  },
];
