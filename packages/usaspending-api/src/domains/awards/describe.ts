import type { EndpointDescription } from "govdata-core";

export const awardsEndpoints: EndpointDescription[] = [
  {
    name: "award",
    path: "/api/v2/awards/{id}/",
    description: "Get detailed information about a specific federal award by its generated unique award ID",
    params: [
      { name: "id", type: "string", required: true },
    ],
    responseFields: [
      "generated_unique_award_id", "piid", "fain", "category", "type",
      "description", "total_obligation", "recipient", "awarding_agency",
      "date_signed", "period_of_performance",
    ],
  },
  {
    name: "award_accounts",
    path: "/api/v2/awards/{id}/accounts/",
    description: "Get federal accounts funding a specific award",
    params: [
      { name: "id", type: "string", required: true },
      { name: "page", type: "number", required: false },
      { name: "limit", type: "number", required: false },
    ],
    responseFields: [
      "total_transaction_obligated_amount", "federal_account",
      "account_title", "funding_agency_name",
    ],
  },
  {
    name: "award_count_federal_account",
    path: "/api/v2/awards/{id}/count/federal_account/",
    description: "Get count of federal accounts associated with an award",
    params: [
      { name: "id", type: "string", required: true },
    ],
    responseFields: ["federal_accounts"],
  },
  {
    name: "award_count_subaward",
    path: "/api/v2/awards/{id}/count/subaward/",
    description: "Get count of subawards under a specific award",
    params: [
      { name: "id", type: "string", required: true },
    ],
    responseFields: ["subawards"],
  },
  {
    name: "award_count_transaction",
    path: "/api/v2/awards/{id}/count/transaction/",
    description: "Get count of transactions for a specific award",
    params: [
      { name: "id", type: "string", required: true },
    ],
    responseFields: ["transactions"],
  },
  {
    name: "award_funding",
    path: "/api/v2/awards/{id}/funding/",
    description: "Get individual funding transactions for an award",
    params: [
      { name: "id", type: "string", required: true },
      { name: "page", type: "number", required: false },
      { name: "limit", type: "number", required: false },
    ],
    responseFields: [
      "transaction_obligated_amount", "federal_account",
      "account_title", "funding_agency_name", "awarding_agency_name",
    ],
  },
  {
    name: "award_funding_rollup",
    path: "/api/v2/awards/{id}/funding_rollup/",
    description: "Get funding summary for an award (total obligation, agency and account counts)",
    params: [
      { name: "id", type: "string", required: true },
    ],
    responseFields: [
      "total_transaction_obligated_amount", "awarding_agency_count",
      "funding_agency_count", "federal_account_count",
    ],
  },
  {
    name: "award_last_updated",
    path: "/api/v2/awards/last_updated/",
    description: "Get the date when award data was last updated",
    params: [],
    responseFields: ["last_updated"],
  },
  {
    name: "award_spending_recipient",
    path: "/api/v2/award_spending/recipient/",
    description: "Get award spending grouped by recipient for an agency and fiscal year",
    params: [
      { name: "awarding_agency_id", type: "number", required: false },
      { name: "fiscal_year", type: "number", required: false },
      { name: "page", type: "number", required: false },
      { name: "limit", type: "number", required: false },
    ],
    responseFields: ["award_category", "obligated_amount", "recipient"],
  },
];
