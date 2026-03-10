import type { EndpointDescription } from "govdata-core";

const idParam = { name: "id", type: "number", required: true };
const paginatedParams = [
  idParam,
  { name: "page", type: "number", required: false },
  { name: "limit", type: "number", required: false },
];

export const federalAccountsEndpoints: EndpointDescription[] = [
  {
    name: "federal_account_list",
    path: "/api/v2/federal_account/",
    description: "List federal accounts with budgetary resources (paginated, POST)",
    params: [
      { name: "keyword", type: "string", required: false },
      { name: "page", type: "number", required: false },
      { name: "limit", type: "number", required: false },
      { name: "sort_field", type: "string", required: false },
      { name: "sort_direction", type: "string", required: false, values: ["asc", "desc"] },
    ],
    responseFields: [
      "agency_identifier", "account_id", "account_name", "account_number",
      "budgetary_resources", "managing_agency", "managing_agency_acronym",
    ],
  },
  {
    name: "federal_account_detail",
    path: "/api/v2/federal_account/{id}/",
    description: "Get detail for a specific federal account including treasury account children",
    params: [idParam],
    responseFields: [
      "fiscal_year", "id", "agency_identifier", "main_account_code", "account_title",
      "federal_account_code", "parent_agency_toptier_code", "parent_agency_name",
      "bureau_name", "bureau_slug", "total_obligated_amount", "total_gross_outlay_amount",
      "total_budgetary_resources", "children",
    ],
  },
  {
    name: "federal_account_fiscal_year_snapshot",
    path: "/api/v2/federal_account/{id}/fiscal_year_snapshot/{fy?}/",
    description: "Get fiscal year snapshot for a federal account (may return empty object)",
    params: [
      idParam,
      { name: "fy", type: "number", required: false },
    ],
    responseFields: ["budget_authority_amount", "obligated_amount", "outlay_amount", "balance_brought_forward", "other_budgetary_resources", "appropriations"],
  },
  {
    name: "federal_account_available_object_classes",
    path: "/api/v2/federal_account/{id}/available_object_classes/",
    description: "Get available object classes for a federal account",
    params: [idParam],
    responseFields: ["id", "name", "minor_object_class"],
  },
  {
    name: "federal_account_object_classes",
    path: "/api/v2/federal_account/{id}/spending_by_object_class/",
    description: "Get spending by object class for a federal account (paginated, POST)",
    params: paginatedParams,
    responseFields: ["code", "obligations", "name"],
  },
  {
    name: "federal_account_program_activities",
    path: "/api/v2/federal_account/{id}/spending_by_program_activity/",
    description: "Get spending by program activity for a federal account (paginated, POST)",
    params: paginatedParams,
    responseFields: ["code", "name", "type"],
  },
  {
    name: "federal_account_program_activities_total",
    path: "/api/v2/federal_account/{id}/spending_by_program_activity_object_class/",
    description: "Get program activity totals with obligations for a federal account (paginated, POST)",
    params: paginatedParams,
    responseFields: ["code", "obligations", "name", "type"],
  },
];
