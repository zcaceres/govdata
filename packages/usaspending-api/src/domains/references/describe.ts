import type { EndpointDescription } from "govdata-core";

export const referencesEndpoints: EndpointDescription[] = [
  {
    name: "ref_toptier_agencies",
    path: "/api/v2/references/toptier_agencies/",
    description: "List all top-tier federal agencies with budget information",
    params: [
      { name: "sort", type: "string", required: false },
      { name: "order", type: "string", required: false, values: ["asc", "desc"] },
    ],
    responseFields: ["agency_id", "toptier_code", "abbreviation", "agency_name", "budget_authority_amount", "obligated_amount"],
  },
  {
    name: "ref_agency",
    path: "/api/v2/references/agency/{agency_id}/",
    description: "Get reference data for a specific agency by ID",
    params: [
      { name: "agency_id", type: "number", required: true },
    ],
    responseFields: ["agency_name", "active_fy", "mission", "website"],
  },
  {
    name: "ref_award_types",
    path: "/api/v2/references/award_types/",
    description: "Get mapping of award type codes to descriptions",
    params: [],
    responseFields: ["contracts", "grants", "loans", "idvs", "direct_payments", "other_financial_assistance"],
  },
  {
    name: "ref_glossary",
    path: "/api/v2/references/glossary/",
    description: "Get glossary of USAspending terms with definitions",
    params: [
      { name: "page", type: "number", required: false },
      { name: "limit", type: "number", required: false },
    ],
    responseFields: ["term", "slug", "plain", "official"],
  },
  {
    name: "ref_def_codes",
    path: "/api/v2/references/def_codes/",
    description: "Get disaster emergency fund (DEFC) codes",
    params: [],
    responseFields: ["code", "public_law", "title", "disaster"],
  },
  {
    name: "ref_naics",
    path: "/api/v2/references/naics/",
    description: "Get NAICS code hierarchy (optionally filtered by code prefix)",
    params: [
      { name: "code", type: "string", required: false },
    ],
    responseFields: ["naics", "naics_description", "count", "children"],
  },
  {
    name: "ref_data_dictionary",
    path: "/api/v2/references/data_dictionary/",
    description: "Get the USAspending data dictionary",
    params: [],
    responseFields: ["document"],
  },
  {
    name: "ref_filter_hash",
    path: "/api/v2/references/filter/",
    description: "Generate a hash for a set of search filters (for sharing URLs)",
    params: [
      { name: "keyword", type: "string", required: false },
      { name: "award_type", type: "string", required: false },
    ],
    responseFields: ["hash"],
  },
  {
    name: "ref_filter_tree_psc",
    path: "/api/v2/references/filter_tree/psc/",
    description: "Get PSC (product/service code) filter tree hierarchy",
    params: [
      { name: "depth", type: "number", required: false },
      { name: "filter", type: "string", required: false },
    ],
    responseFields: ["id", "ancestors", "description", "count", "children"],
  },
  {
    name: "ref_filter_tree_tas",
    path: "/api/v2/references/filter_tree/tas/",
    description: "Get TAS (treasury account symbol) filter tree hierarchy",
    params: [
      { name: "depth", type: "number", required: false },
      { name: "filter", type: "string", required: false },
    ],
    responseFields: ["id", "ancestors", "description", "count", "children"],
  },
  {
    name: "ref_submission_periods",
    path: "/api/v2/references/submission_periods/",
    description: "Get available submission periods for agency reporting",
    params: [],
    responseFields: ["submission_fiscal_year", "submission_fiscal_quarter", "submission_fiscal_month", "period_start_date", "period_end_date"],
  },
  {
    name: "ref_total_budgetary_resources",
    path: "/api/v2/references/total_budgetary_resources/",
    description: "Get total budgetary resources by fiscal year and period",
    params: [],
    responseFields: ["fiscal_year", "fiscal_period", "total_budgetary_resources"],
  },
  {
    name: "ref_assistance_listing",
    path: "/api/v2/references/assistance_listing/",
    description: "Get assistance listing (CFDA) reference data",
    params: [],
    responseFields: ["code", "description", "count"],
  },
  {
    name: "ref_cfda_totals",
    path: "/api/v2/references/cfda/totals/",
    description: "Get CFDA totals (optionally filtered by CFDA number)",
    params: [
      { name: "cfda", type: "string", required: false },
    ],
    responseFields: ["total"],
  },
];
