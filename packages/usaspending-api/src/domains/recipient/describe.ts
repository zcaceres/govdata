import type { EndpointDescription } from "govdata-core";

export const recipientEndpoints: EndpointDescription[] = [
  {
    name: "spending_by_state",
    path: "/api/v2/recipient/state/",
    description: "Get total federal spending by state/territory",
    params: [],
    responseFields: [
      "fips", "code", "name", "amount", "count",
    ],
  },
  {
    name: "recipient_list",
    path: "/api/v2/recipient/",
    description: "Search and list recipients by keyword and award type",
    params: [
      { name: "keyword", type: "string", required: false },
      { name: "award_type", type: "string", required: false, values: ["all", "contracts", "grants", "loans", "direct_payments", "other"] },
      { name: "sort", type: "string", required: false },
      { name: "order", type: "string", required: false, values: ["asc", "desc"] },
      { name: "page", type: "number", required: false },
      { name: "limit", type: "number", required: false },
    ],
    responseFields: ["id", "name", "duns", "uei", "recipient_level", "amount"],
  },
  {
    name: "recipient_count",
    path: "/api/v2/recipient/count/",
    description: "Get total count of recipients matching filters",
    params: [
      { name: "keyword", type: "string", required: false },
      { name: "award_type", type: "string", required: false },
    ],
    responseFields: ["count"],
  },
  {
    name: "recipient_detail",
    path: "/api/v2/recipient/{recipient_id}/",
    description: "Get detailed profile for a specific recipient",
    params: [
      { name: "recipient_id", type: "string", required: true },
      { name: "year", type: "string", required: false },
    ],
    responseFields: ["name", "duns", "uei", "recipient_id", "recipient_level", "alternate_names", "total_transaction_amount"],
  },
  {
    name: "recipient_children",
    path: "/api/v2/recipient/{recipient_id}/children/",
    description: "Get child recipients (subsidiaries) under a parent recipient",
    params: [
      { name: "recipient_id", type: "string", required: true },
      { name: "year", type: "string", required: false },
    ],
    responseFields: ["recipient_id", "name", "duns", "uei", "amount", "state_province"],
  },
  {
    name: "state_detail",
    path: "/api/v2/recipient/state/{fips}/",
    description: "Get detailed spending and demographic data for a state",
    params: [
      { name: "fips", type: "string", required: true },
      { name: "year", type: "number", required: false },
    ],
    responseFields: ["name", "code", "fips", "population", "total_prime_amount", "total_prime_awards", "award_amount_per_capita"],
  },
  {
    name: "state_awards",
    path: "/api/v2/recipient/state/awards/{fips}/",
    description: "Get award type breakdown for a specific state",
    params: [
      { name: "fips", type: "string", required: true },
      { name: "year", type: "number", required: false },
    ],
    responseFields: ["type", "amount", "count", "total_outlays"],
  },
];
