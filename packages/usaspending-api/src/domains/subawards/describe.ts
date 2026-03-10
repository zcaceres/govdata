import type { EndpointDescription } from "govdata-core";

export const subawardEndpoints: EndpointDescription[] = [
  {
    name: "subaward_list",
    path: "/api/v2/subawards/",
    description: "Search and list subawards with optional keyword and award filters",
    params: [
      { name: "page", type: "number", required: false },
      { name: "limit", type: "number", required: false },
      { name: "sort", type: "string", required: false },
      { name: "order", type: "string", required: false, values: ["asc", "desc"] },
      { name: "keyword", type: "string", required: false },
      { name: "award_id", type: "string", required: false },
    ],
    responseFields: [
      "id", "subaward_number", "description", "action_date",
      "amount", "recipient_name",
    ],
  },
  {
    name: "subaward_by_award",
    path: "/api/v2/subawards/",
    description: "List subawards for a specific award by award ID",
    params: [
      { name: "award_id", type: "string", required: true },
      { name: "page", type: "number", required: false },
      { name: "limit", type: "number", required: false },
      { name: "sort", type: "string", required: false },
      { name: "order", type: "string", required: false, values: ["asc", "desc"] },
    ],
    responseFields: [
      "id", "subaward_number", "description", "action_date",
      "amount", "recipient_name",
    ],
  },
  {
    name: "subaward_transactions",
    path: "/api/v2/transactions/",
    description: "Get transaction history for a specific award",
    params: [
      { name: "award_id", type: "number", required: true },
      { name: "page", type: "number", required: false },
      { name: "limit", type: "number", required: false },
      { name: "sort", type: "string", required: false },
      { name: "order", type: "string", required: false, values: ["asc", "desc"] },
    ],
    responseFields: [
      "id", "type", "type_description", "action_date", "action_type",
      "action_type_description", "modification_number", "description",
      "federal_action_obligation", "face_value_loan_guarantee",
      "original_loan_subsidy_cost",
    ],
  },
];
