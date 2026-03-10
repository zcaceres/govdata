import type { EndpointDescription } from "govdata-core";

const agencyParams = [
  { name: "toptier_code", type: "string", required: true },
  { name: "fiscal_year", type: "number", required: false },
];

const paginatedAgencyParams = [
  ...agencyParams,
  { name: "page", type: "number", required: false },
  { name: "limit", type: "number", required: false },
  { name: "order", type: "string", required: false, values: ["asc", "desc"] },
  { name: "sort", type: "string", required: false },
];

export const agencyEndpoints: EndpointDescription[] = [
  {
    name: "agency",
    path: "/api/v2/agency/{toptier_code}/",
    description: "Get overview information about a federal agency by its toptier code (e.g. '080' for NASA)",
    params: [
      { name: "toptier_code", type: "string", required: true },
    ],
    responseFields: [
      "toptier_code", "name", "abbreviation", "mission", "website",
      "congressional_justification_url", "subtier_agency_count",
    ],
  },
  {
    name: "agency_awards",
    path: "/api/v2/agency/{toptier_code}/awards/",
    description: "Get award summary (transaction count and obligations) for an agency",
    params: agencyParams,
    responseFields: ["transaction_count", "obligations", "latest_action_date"],
  },
  {
    name: "agency_new_award_count",
    path: "/api/v2/agency/{toptier_code}/awards/new/count/",
    description: "Get count of new awards for an agency",
    params: agencyParams,
    responseFields: ["new_award_count", "agency_type"],
  },
  {
    name: "agency_awards_count",
    path: "/api/v2/agency/awards/count/",
    description: "Get award counts by type for all agencies",
    params: [
      { name: "fiscal_year", type: "number", required: false },
    ],
    responseFields: ["awarding_toptier_agency_name", "awarding_toptier_agency_code", "contracts", "grants", "loans", "idvs", "direct_payments", "other"],
  },
  {
    name: "agency_budget_function",
    path: "/api/v2/agency/{toptier_code}/budget_function/",
    description: "Get budget function breakdown for an agency",
    params: agencyParams,
    responseFields: ["name", "children", "obligated_amount", "gross_outlay_amount"],
  },
  {
    name: "agency_budget_function_count",
    path: "/api/v2/agency/{toptier_code}/budget_function/count/",
    description: "Get count of budget functions and sub-functions for an agency",
    params: agencyParams,
    responseFields: ["budget_function_count", "budget_sub_function_count"],
  },
  {
    name: "agency_budgetary_resources",
    path: "/api/v2/agency/{toptier_code}/budgetary_resources/",
    description: "Get budgetary resources by fiscal year for an agency",
    params: [
      { name: "toptier_code", type: "string", required: true },
    ],
    responseFields: ["fiscal_year", "agency_budgetary_resources", "agency_total_obligated", "agency_total_outlayed", "total_budgetary_resources"],
  },
  {
    name: "agency_federal_account",
    path: "/api/v2/agency/{toptier_code}/federal_account/",
    description: "Get federal accounts for an agency with obligations and outlays",
    params: paginatedAgencyParams,
    responseFields: ["code", "name", "children", "obligated_amount", "gross_outlay_amount"],
  },
  {
    name: "agency_federal_account_count",
    path: "/api/v2/agency/{toptier_code}/federal_account/count/",
    description: "Get count of federal accounts and treasury accounts for an agency",
    params: agencyParams,
    responseFields: ["federal_account_count", "treasury_account_count"],
  },
  {
    name: "agency_object_class",
    path: "/api/v2/agency/{toptier_code}/object_class/",
    description: "Get object class spending breakdown for an agency",
    params: paginatedAgencyParams,
    responseFields: ["name", "obligated_amount", "gross_outlay_amount"],
  },
  {
    name: "agency_object_class_count",
    path: "/api/v2/agency/{toptier_code}/object_class/count/",
    description: "Get count of object classes for an agency",
    params: agencyParams,
    responseFields: ["object_class_count"],
  },
  {
    name: "agency_obligations_by_award_category",
    path: "/api/v2/agency/{toptier_code}/obligations_by_award_category/",
    description: "Get total obligations broken down by award category (contracts, grants, loans, etc.)",
    params: agencyParams,
    responseFields: ["category", "aggregated_amount"],
  },
  {
    name: "agency_program_activity",
    path: "/api/v2/agency/{toptier_code}/program_activity/",
    description: "Get program activity spending breakdown for an agency",
    params: paginatedAgencyParams,
    responseFields: ["name", "obligated_amount", "gross_outlay_amount"],
  },
  {
    name: "agency_program_activity_count",
    path: "/api/v2/agency/{toptier_code}/program_activity/count/",
    description: "Get count of program activities for an agency",
    params: agencyParams,
    responseFields: ["program_activity_count"],
  },
  {
    name: "agency_sub_agency",
    path: "/api/v2/agency/{toptier_code}/sub_agency/",
    description: "Get sub-agencies and their offices for an agency",
    params: paginatedAgencyParams,
    responseFields: ["name", "abbreviation", "total_obligations", "transaction_count", "new_award_count", "children"],
  },
  {
    name: "agency_sub_agency_count",
    path: "/api/v2/agency/{toptier_code}/sub_agency/count/",
    description: "Get count of sub-agencies and offices for an agency",
    params: agencyParams,
    responseFields: ["sub_agency_count", "office_count"],
  },
  {
    name: "agency_sub_components",
    path: "/api/v2/agency/{toptier_code}/sub_components/",
    description: "Get sub-components with budgetary resources for an agency",
    params: paginatedAgencyParams,
    responseFields: ["name", "id", "total_obligations", "total_outlays", "total_budgetary_resources"],
  },
  {
    name: "agency_treasury_account_object_class",
    path: "/api/v2/agency/{toptier_code}/sub_components/{account_code}/object_class/",
    description: "Get object class spending for a specific treasury account within an agency",
    params: [
      { name: "toptier_code", type: "string", required: true },
      { name: "account_code", type: "string", required: true },
      { name: "fiscal_year", type: "number", required: false },
      { name: "page", type: "number", required: false },
      { name: "limit", type: "number", required: false },
    ],
    responseFields: ["name", "obligated_amount", "gross_outlay_amount"],
  },
  {
    name: "agency_treasury_account_program_activity",
    path: "/api/v2/agency/{toptier_code}/sub_components/{account_code}/program_activity/",
    description: "Get program activity spending for a specific treasury account within an agency",
    params: [
      { name: "toptier_code", type: "string", required: true },
      { name: "account_code", type: "string", required: true },
      { name: "fiscal_year", type: "number", required: false },
      { name: "page", type: "number", required: false },
      { name: "limit", type: "number", required: false },
    ],
    responseFields: ["name", "obligated_amount", "gross_outlay_amount"],
  },
];
