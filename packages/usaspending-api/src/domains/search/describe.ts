import type { EndpointDescription } from "govdata-core";

const searchFilterParams = [
  { name: "keyword", type: "string", required: false },
  { name: "start_date", type: "string", required: false },
  { name: "end_date", type: "string", required: false },
  { name: "award_type", type: "string", required: false, values: ["contracts", "idvs", "grants", "direct_payments", "loans", "other"] },
  { name: "agency", type: "string", required: false },
  { name: "naics_code", type: "string", required: false },
  { name: "recipient", type: "string", required: false },
  { name: "state", type: "string", required: false },
];

const paginationParams = [
  { name: "sort", type: "string", required: false },
  { name: "order", type: "string", required: false, values: ["asc", "desc"] },
  { name: "limit", type: "number", required: false },
  { name: "page", type: "number", required: false },
];

const CATEGORY_SUB_PATHS = [
  { subPath: "awarding_agency", label: "awarding agency" },
  { subPath: "awarding_subagency", label: "awarding sub-agency" },
  { subPath: "cfda", label: "CFDA program" },
  { subPath: "country", label: "country" },
  { subPath: "county", label: "county" },
  { subPath: "defc", label: "DEFC (disaster emergency funding code)" },
  { subPath: "district", label: "congressional district" },
  { subPath: "federal_account", label: "federal account" },
  { subPath: "funding_agency", label: "funding agency" },
  { subPath: "funding_subagency", label: "funding sub-agency" },
  { subPath: "naics", label: "NAICS code" },
  { subPath: "psc", label: "PSC (product/service code)" },
  { subPath: "recipient", label: "recipient" },
  { subPath: "recipient_duns", label: "recipient DUNS" },
  { subPath: "state_territory", label: "state/territory" },
];

const categoryEndpoints: EndpointDescription[] = CATEGORY_SUB_PATHS.map(({ subPath, label }) => ({
  name: `category_${subPath}`,
  path: `/api/v2/search/spending_by_category/${subPath}/`,
  description: `Get spending totals grouped by ${label}`,
  params: [
    ...searchFilterParams,
    { name: "limit", type: "number", required: false },
    { name: "page", type: "number", required: false },
  ],
  responseFields: ["name", "id", "code", "amount", "total_outlays"],
}));

export const searchEndpoints: EndpointDescription[] = [
  {
    name: "awards",
    path: "/api/v2/search/spending_by_award/",
    description: "Search federal awards (contracts, grants, loans, etc.) with filters for keyword, date range, award type, agency, NAICS code, recipient, and state",
    params: [
      ...searchFilterParams,
      ...paginationParams,
    ],
    responseFields: [
      "Award ID", "Recipient Name", "Start Date", "End Date",
      "Award Amount", "Awarding Agency", "Awarding Sub Agency",
      "Award Type", "Description",
    ],
  },
  {
    name: "spending_over_time",
    path: "/api/v2/search/spending_over_time/",
    description: "Get spending trends over time (by fiscal year, quarter, or month) with optional keyword and date filters",
    params: [
      { name: "group", type: "string", required: true, values: ["fiscal_year", "quarter", "month"] },
      ...searchFilterParams,
    ],
    responseFields: [
      "aggregated_amount", "time_period",
      "Contract_Obligations", "Grant_Obligations", "Loan_Obligations",
    ],
  },
  {
    name: "award_count",
    path: "/api/v2/search/spending_by_award_count/",
    description: "Get count of awards by type (contracts, grants, loans, etc.) matching search filters",
    params: [...searchFilterParams],
    responseFields: ["contracts", "grants", "loans", "direct_payments", "idvs", "other"],
  },
  ...categoryEndpoints,
  {
    name: "spending_by_geography",
    path: "/api/v2/search/spending_by_geography/",
    description: "Get spending totals grouped by geographic area (state, county, or congressional district)",
    params: [
      ...searchFilterParams,
      { name: "scope", type: "string", required: false, values: ["place_of_performance", "recipient_location"] },
      { name: "geo_layer", type: "string", required: false, values: ["state", "county", "district"] },
    ],
    responseFields: ["shape_code", "display_name", "aggregated_amount", "population", "per_capita"],
  },
  {
    name: "transactions",
    path: "/api/v2/search/spending_by_transaction/",
    description: "Search individual transactions with filters",
    params: [
      ...searchFilterParams,
      ...paginationParams,
    ],
    responseFields: ["Award ID", "Recipient Name", "Action Date", "Transaction Amount", "Awarding Agency", "Award Type"],
  },
  {
    name: "transaction_count",
    path: "/api/v2/search/spending_by_transaction_count/",
    description: "Get count of transactions by type matching search filters",
    params: [...searchFilterParams],
    responseFields: ["contracts", "grants", "loans", "direct_payments", "idvs", "other"],
  },
  {
    name: "transaction_grouped",
    path: "/api/v2/search/spending_by_transaction_grouped/",
    description: "Get transactions grouped by award, showing transaction count and total obligation per award",
    params: [
      ...searchFilterParams,
      ...paginationParams,
    ],
    responseFields: ["award_id", "transaction_count", "transaction_obligation", "award_generated_internal_id"],
  },
  {
    name: "subaward_grouped",
    path: "/api/v2/search/spending_by_subaward_grouped/",
    description: "Get subawards grouped by award, showing subaward count and total obligation per award",
    params: [
      ...searchFilterParams,
      ...paginationParams,
    ],
    responseFields: ["award_id", "subaward_count", "subaward_obligation", "award_generated_internal_id"],
  },
  {
    name: "new_awards_over_time",
    path: "/api/v2/search/new_awards_over_time/",
    description: "Get count of new awards over time (by fiscal year, quarter, or month)",
    params: [
      { name: "group", type: "string", required: true, values: ["fiscal_year", "quarter", "month"] },
      ...searchFilterParams,
    ],
    responseFields: ["new_award_count_in_period", "time_period"],
  },
  {
    name: "transaction_spending_summary",
    path: "/api/v2/search/transaction_spending_summary/",
    description: "Get summary of total prime award count and obligation amount matching search filters",
    params: [...searchFilterParams],
    responseFields: ["prime_awards_count", "prime_awards_obligation_amount"],
  },
];
