import type { EndpointDescription } from "govdata-core";

const paginatedPostParams = [
  { name: "award_id", type: "number", required: true },
  { name: "page", type: "number", required: false },
  { name: "limit", type: "number", required: false },
  { name: "sort", type: "string", required: false },
  { name: "order", type: "string", required: false, values: ["asc", "desc"] },
];

export const idvEndpoints: EndpointDescription[] = [
  {
    name: "idv_accounts",
    path: "/api/v2/idvs/accounts/",
    description: "Get financial accounts associated with an IDV (Indefinite Delivery Vehicle) award",
    params: paginatedPostParams,
    responseFields: ["account_title", "federal_account", "funding_agency_abbreviation", "funding_agency_name", "total_transaction_obligated_amount"],
  },
  {
    name: "idv_activity",
    path: "/api/v2/idvs/activity/",
    description: "Get activity and history for an IDV award",
    params: [
      { name: "award_id", type: "number", required: true },
      { name: "page", type: "number", required: false },
      { name: "limit", type: "number", required: false },
    ],
    responseFields: ["award_id", "awarding_agency", "awarding_agency_id", "generated_unique_award_id", "last_date_to_order", "obligated_amount", "awarded_amount", "period_of_performance_potential_end_date", "period_of_performance_start_date", "piid", "recipient_name"],
  },
  {
    name: "idv_amounts",
    path: "/api/v2/idvs/amounts/{award_id}/",
    description: "Get obligation and outlay amounts for an IDV and its child/grandchild awards",
    params: [
      { name: "award_id", type: "string", required: true },
    ],
    responseFields: [
      "award_id", "generated_unique_award_id",
      "child_idv_count", "child_award_count",
      "child_award_total_obligation", "child_award_total_outlay",
      "child_award_base_and_all_options_value", "child_award_base_exercised_options_val",
      "child_total_account_outlay", "child_total_account_obligation",
      "grandchild_award_count",
      "grandchild_award_total_obligation", "grandchild_award_total_outlay",
      "grandchild_award_base_and_all_options_value", "grandchild_award_base_exercised_options_val",
      "grandchild_total_account_outlay", "grandchild_total_account_obligation",
    ],
  },
  {
    name: "idv_child_awards",
    path: "/api/v2/idvs/awards/",
    description: "Get child contract awards under an IDV",
    params: paginatedPostParams,
    responseFields: ["award_id", "generated_unique_award_id", "piid", "recipient_name", "obligated_amount", "awarded_amount", "period_of_performance_start_date", "last_date_to_order"],
  },
  {
    name: "idv_child_idvs",
    path: "/api/v2/idvs/awards/",
    description: "Get child IDVs (sub-IDVs) under an IDV",
    params: paginatedPostParams,
    responseFields: ["award_id", "generated_unique_award_id", "piid", "recipient_name", "obligated_amount", "awarded_amount", "period_of_performance_start_date", "last_date_to_order"],
  },
  {
    name: "idv_count_federal_account",
    path: "/api/v2/idvs/count/federal_account/{award_id}/",
    description: "Get the count of federal accounts associated with an IDV award",
    params: [
      { name: "award_id", type: "string", required: true },
    ],
    responseFields: ["count"],
  },
  {
    name: "idv_funding_rollup",
    path: "/api/v2/idvs/funding_rollup/{award_id}/",
    description: "Get a funding rollup summary for an IDV including agency and account counts",
    params: [
      { name: "award_id", type: "string", required: true },
    ],
    responseFields: [
      "total_transaction_obligated_amount",
      "awarding_agency_count",
      "funding_agency_count",
      "federal_account_count",
    ],
  },
  {
    name: "idv_funding",
    path: "/api/v2/idvs/funding/",
    description: "Get detailed funding information for an IDV award including agency and account breakdowns",
    params: [
      ...paginatedPostParams,
      { name: "piid", type: "string", required: false },
    ],
    responseFields: [
      "award_id", "generated_unique_award_id",
      "reporting_fiscal_year", "reporting_fiscal_quarter", "reporting_fiscal_month",
      "piid", "awarding_agency_name", "funding_agency_name",
      "agency_id", "main_account_code", "account_title",
      "object_class", "object_class_name",
      "transaction_obligated_amount", "gross_outlay_amount",
    ],
  },
];
