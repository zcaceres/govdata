import type { EndpointDescription } from "govdata-core";

const listParams = [
  { name: "page", type: "number", required: false },
  { name: "limit", type: "number", required: false },
  { name: "sort", type: "string", required: false },
  { name: "order", type: "string", required: false, values: ["asc", "desc"] },
  { name: "fiscal_year", type: "number", required: false },
  { name: "fiscal_period", type: "number", required: false },
  { name: "filter", type: "string", required: false },
];

const agencyPeriodParams = [
  { name: "toptier_code", type: "string", required: true },
  { name: "fiscal_year", type: "number", required: true },
  { name: "fiscal_period", type: "number", required: true },
  { name: "page", type: "number", required: false },
  { name: "limit", type: "number", required: false },
  { name: "sort", type: "string", required: false },
  { name: "order", type: "string", required: false, values: ["asc", "desc"] },
];

export const reportingEndpoints: EndpointDescription[] = [
  {
    name: "reporting_agencies_overview",
    path: "/api/v2/reporting/agencies/overview/",
    description: "Get reporting overview for all agencies including budget authority, discrepancies, and unlinked awards",
    params: listParams,
    responseFields: [
      "agency_name", "abbreviation", "toptier_code", "agency_id",
      "current_total_budget_authority_amount", "recent_publication_date",
      "recent_publication_date_certified", "tas_account_discrepancies_totals",
      "obligation_difference", "unlinked_contract_award_count",
      "unlinked_assistance_award_count", "assurance_statement_url",
    ],
  },
  {
    name: "reporting_publish_dates",
    path: "/api/v2/reporting/agencies/publish_dates/",
    description: "Get publication and certification dates for all agency submissions by period",
    params: listParams,
    responseFields: [
      "agency_name", "abbreviation", "toptier_code",
      "current_total_budget_authority_amount", "periods",
    ],
  },
  {
    name: "reporting_differences",
    path: "/api/v2/reporting/agencies/{toptier_code}/differences/",
    description: "Get TAS/GTAS obligation differences for an agency in a specific fiscal period",
    params: agencyPeriodParams,
    responseFields: ["tas", "file_a_obligation", "file_b_obligation", "difference"],
  },
  {
    name: "reporting_discrepancies",
    path: "/api/v2/reporting/agencies/{toptier_code}/discrepancies/",
    description: "Get TAS discrepancies (missing TAS accounts) for an agency in a specific fiscal period",
    params: agencyPeriodParams,
    responseFields: ["tas", "account_number", "gtas_obligation_amount"],
  },
  {
    name: "reporting_agency_overview",
    path: "/api/v2/reporting/agencies/{toptier_code}/overview/",
    description: "Get reporting overview for a single agency across all fiscal periods",
    params: [
      { name: "toptier_code", type: "string", required: true },
      { name: "page", type: "number", required: false },
      { name: "limit", type: "number", required: false },
      { name: "sort", type: "string", required: false },
      { name: "order", type: "string", required: false, values: ["asc", "desc"] },
    ],
    responseFields: [
      "fiscal_year", "fiscal_period", "current_total_budget_authority_amount",
      "total_budgetary_resources", "percent_of_total_budgetary_resources",
      "recent_publication_date", "recent_publication_date_certified",
      "tas_account_discrepancies_totals", "obligation_difference",
      "unlinked_contract_award_count", "unlinked_assistance_award_count",
      "assurance_statement_url",
    ],
  },
  {
    name: "reporting_submission_history",
    path: "/api/v2/reporting/agencies/{toptier_code}/{fiscal_year}/{fiscal_period}/submission_history/",
    description: "Get submission publication and certification history for an agency in a specific fiscal period",
    params: agencyPeriodParams,
    responseFields: ["publication_date", "certification_date"],
  },
  {
    name: "reporting_unlinked_assistance",
    path: "/api/v2/reporting/agencies/{toptier_code}/{fiscal_year}/{fiscal_period}/unlinked_awards/assistance/",
    description: "Get counts of unlinked assistance awards for an agency in a specific fiscal period",
    params: [
      { name: "toptier_code", type: "string", required: true },
      { name: "fiscal_year", type: "number", required: true },
      { name: "fiscal_period", type: "number", required: true },
    ],
    responseFields: ["unlinked_file_c_award_count", "unlinked_file_d_award_count", "total_linked_award_count"],
  },
  {
    name: "reporting_unlinked_procurement",
    path: "/api/v2/reporting/agencies/{toptier_code}/{fiscal_year}/{fiscal_period}/unlinked_awards/procurement/",
    description: "Get counts of unlinked procurement awards for an agency in a specific fiscal period",
    params: [
      { name: "toptier_code", type: "string", required: true },
      { name: "fiscal_year", type: "number", required: true },
      { name: "fiscal_period", type: "number", required: true },
    ],
    responseFields: ["unlinked_file_c_award_count", "unlinked_file_d_award_count", "total_linked_award_count"],
  },
];
