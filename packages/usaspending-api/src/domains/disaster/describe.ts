import type { EndpointDescription } from "govdata-core";

const disasterFilterParams = [
  { name: "def_codes", type: "string" as const, required: false, description: "Comma-separated DEFC codes (defaults to L,M,N,O,P,U,V)" },
  { name: "spending_type", type: "string" as const, required: false, values: ["total", "obligation", "outlay"], description: "Type of spending to return" },
  { name: "sort", type: "string" as const, required: false, description: "Field to sort by" },
  { name: "order", type: "string" as const, required: false, values: ["asc", "desc"], description: "Sort order" },
  { name: "page", type: "number" as const, required: false, description: "Page number (starts at 1)" },
  { name: "limit", type: "number" as const, required: false, description: "Results per page" },
];

const countOnlyParams = [
  { name: "def_codes", type: "string" as const, required: false, description: "Comma-separated DEFC codes (defaults to L,M,N,O,P,U,V)" },
];

export const disasterEndpoints: EndpointDescription[] = [
  // Overview
  {
    name: "disaster_overview",
    path: "/api/v2/disaster/overview/",
    description: "Get disaster spending overview including funding by DEFC code, total budget authority, and spending summaries",
    params: [],
    responseFields: ["funding", "total_budget_authority", "spending", "additional"],
  },

  // Award
  {
    name: "disaster_award_amount",
    path: "/api/v2/disaster/award/amount/",
    description: "Get total disaster award obligation and outlay amounts",
    params: [...disasterFilterParams],
    responseFields: ["award_count", "obligation", "outlay"],
  },
  {
    name: "disaster_award_count",
    path: "/api/v2/disaster/award/count/",
    description: "Get total count of disaster awards",
    params: [...countOnlyParams],
    responseFields: ["count"],
  },

  // Agency
  {
    name: "disaster_agency_spending",
    path: "/api/v2/disaster/agency/spending/",
    description: "Get disaster spending broken down by agency with pagination",
    params: [...disasterFilterParams],
    responseFields: ["id", "code", "description", "obligation", "outlay", "total_budgetary_resources", "award_count", "children"],
  },
  {
    name: "disaster_agency_loans",
    path: "/api/v2/disaster/agency/loans/",
    description: "Get disaster loan data broken down by agency with pagination",
    params: [...disasterFilterParams],
    responseFields: ["id", "code", "description", "obligation", "outlay", "face_value_of_loan", "award_count", "children"],
  },
  {
    name: "disaster_agency_count",
    path: "/api/v2/disaster/agency/count/",
    description: "Get count of agencies with disaster spending",
    params: [...countOnlyParams],
    responseFields: ["count"],
  },

  // CFDA
  {
    name: "disaster_cfda_spending",
    path: "/api/v2/disaster/cfda/spending/",
    description: "Get disaster spending broken down by CFDA program with pagination",
    params: [...disasterFilterParams],
    responseFields: ["id", "code", "description", "obligation", "outlay", "award_count", "resource_link", "cfda_federal_agency", "cfda_objectives"],
  },
  {
    name: "disaster_cfda_loans",
    path: "/api/v2/disaster/cfda/loans/",
    description: "Get disaster loan data broken down by CFDA program with pagination",
    params: [...disasterFilterParams],
    responseFields: ["id", "code", "description", "obligation", "outlay", "face_value_of_loan", "award_count", "resource_link", "cfda_federal_agency"],
  },
  {
    name: "disaster_cfda_count",
    path: "/api/v2/disaster/cfda/count/",
    description: "Get count of CFDA programs with disaster spending",
    params: [...countOnlyParams],
    responseFields: ["count"],
  },

  // DEF Code
  {
    name: "disaster_def_code_count",
    path: "/api/v2/disaster/def_code/count/",
    description: "Get count of DEFC codes with disaster spending",
    params: [...countOnlyParams],
    responseFields: ["count"],
  },

  // Federal Account
  {
    name: "disaster_federal_account_spending",
    path: "/api/v2/disaster/federal_account/spending/",
    description: "Get disaster spending broken down by federal account with pagination",
    params: [...disasterFilterParams],
    responseFields: ["id", "code", "description", "obligation", "outlay", "total_budgetary_resources", "award_count", "children"],
  },
  {
    name: "disaster_federal_account_loans",
    path: "/api/v2/disaster/federal_account/loans/",
    description: "Get disaster loan data broken down by federal account with pagination",
    params: [...disasterFilterParams],
    responseFields: ["id", "code", "description", "obligation", "outlay", "face_value_of_loan", "award_count", "children"],
  },
  {
    name: "disaster_federal_account_count",
    path: "/api/v2/disaster/federal_account/count/",
    description: "Get count of federal accounts with disaster spending",
    params: [...countOnlyParams],
    responseFields: ["count"],
  },

  // Object Class
  {
    name: "disaster_object_class_spending",
    path: "/api/v2/disaster/object_class/spending/",
    description: "Get disaster spending broken down by object class with pagination",
    params: [...disasterFilterParams],
    responseFields: ["id", "code", "description", "obligation", "outlay", "award_count", "children"],
  },
  {
    name: "disaster_object_class_loans",
    path: "/api/v2/disaster/object_class/loans/",
    description: "Get disaster loan data broken down by object class with pagination",
    params: [...disasterFilterParams],
    responseFields: ["id", "code", "description", "obligation", "outlay", "face_value_of_loan", "award_count", "children"],
  },
  {
    name: "disaster_object_class_count",
    path: "/api/v2/disaster/object_class/count/",
    description: "Get count of object classes with disaster spending",
    params: [...countOnlyParams],
    responseFields: ["count"],
  },

  // Recipient
  {
    name: "disaster_recipient_spending",
    path: "/api/v2/disaster/recipient/spending/",
    description: "Get disaster spending broken down by recipient with pagination",
    params: [...disasterFilterParams],
    responseFields: ["id", "code", "description", "obligation", "outlay", "award_count"],
  },
  {
    name: "disaster_recipient_loans",
    path: "/api/v2/disaster/recipient/loans/",
    description: "Get disaster loan data broken down by recipient with pagination",
    params: [...disasterFilterParams],
    responseFields: ["id", "code", "description", "obligation", "outlay", "face_value_of_loan", "award_count"],
  },
  {
    name: "disaster_recipient_count",
    path: "/api/v2/disaster/recipient/count/",
    description: "Get count of recipients with disaster spending",
    params: [...countOnlyParams],
    responseFields: ["count"],
  },

  // Geography
  {
    name: "disaster_spending_by_geography",
    path: "/api/v2/disaster/spending_by_geography/",
    description: "Get disaster spending broken down by geographic location (state, county, or congressional district)",
    params: [
      { name: "def_codes", type: "string" as const, required: false, description: "Comma-separated DEFC codes (defaults to L,M,N,O,P,U,V)" },
      { name: "spending_type", type: "string" as const, required: false, values: ["obligation", "outlay", "face_value_of_loan"], description: "Type of spending to return (defaults to obligation)" },
      { name: "geo_layer", type: "string" as const, required: false, values: ["state", "county", "district"], description: "Geographic granularity" },
      { name: "scope", type: "string" as const, required: false, values: ["place_of_performance", "recipient_location"], description: "Location scope" },
    ],
    responseFields: ["amount", "display_name", "shape_code", "population", "per_capita", "award_count"],
  },
];
