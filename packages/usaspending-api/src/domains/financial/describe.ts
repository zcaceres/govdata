import type { EndpointDescription } from "govdata-core";

const agencyFiscalYearParams = [
  { name: "funding_agency_id", type: "number", required: true },
  { name: "fiscal_year", type: "number", required: true },
  { name: "page", type: "number", required: false },
  { name: "limit", type: "number", required: false },
];

export const financialEndpoints: EndpointDescription[] = [
  {
    name: "financial_federal_obligations",
    path: "/api/v2/federal_obligations/",
    description: "Get federal obligations by agency, broken down by federal account",
    params: agencyFiscalYearParams,
    responseFields: [
      "id", "account_title", "account_number", "obligated_amount",
    ],
  },
  {
    name: "financial_balances",
    path: "/api/v2/financial_balances/agencies/",
    description: "Get financial balances (budget authority, obligations, outlays) for an agency in a fiscal year",
    params: agencyFiscalYearParams,
    responseFields: [
      "budget_authority_amount", "obligated_amount", "outlay_amount",
    ],
  },
  {
    name: "financial_spending_major_object_class",
    path: "/api/v2/financial_spending/major_object_class/",
    description: "Get spending breakdown by major object class for an agency in a fiscal year",
    params: [
      { name: "fiscal_year", type: "number", required: true },
      { name: "funding_agency_id", type: "number", required: true },
      { name: "page", type: "number", required: false },
      { name: "limit", type: "number", required: false },
    ],
    responseFields: [
      "major_object_class_code", "major_object_class_name", "obligated_amount",
    ],
  },
  {
    name: "financial_spending_object_class",
    path: "/api/v2/financial_spending/object_class/",
    description: "Get spending breakdown by object class for an agency in a fiscal year, optionally filtered by major object class",
    params: [
      { name: "fiscal_year", type: "number", required: true },
      { name: "funding_agency_id", type: "number", required: true },
      { name: "major_object_class_code", type: "number", required: false },
      { name: "page", type: "number", required: false },
      { name: "limit", type: "number", required: false },
    ],
    responseFields: [
      "major_object_class_code", "major_object_class_name",
      "object_class_code", "object_class_name", "obligated_amount",
    ],
  },
];
