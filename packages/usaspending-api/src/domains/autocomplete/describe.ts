import type { EndpointDescription } from "govdata-core";

const autocompleteParams = [
  { name: "search_text", type: "string", required: true },
  { name: "limit", type: "number", required: false },
];

export const autocompleteEndpoints: EndpointDescription[] = [
  {
    name: "autocomplete_awarding_agency",
    path: "/api/v2/autocomplete/awarding_agency/",
    description: "Autocomplete awarding agency names",
    params: autocompleteParams,
    responseFields: ["id", "toptier_agency", "subtier_agency"],
  },
  {
    name: "autocomplete_funding_agency",
    path: "/api/v2/autocomplete/funding_agency/",
    description: "Autocomplete funding agency names",
    params: autocompleteParams,
    responseFields: ["id", "toptier_agency", "subtier_agency"],
  },
  {
    name: "autocomplete_awarding_agency_office",
    path: "/api/v2/autocomplete/awarding_agency_office/",
    description: "Autocomplete awarding agencies with office hierarchy",
    params: autocompleteParams,
    responseFields: ["toptier_agency", "subtier_agency", "office"],
  },
  {
    name: "autocomplete_funding_agency_office",
    path: "/api/v2/autocomplete/funding_agency_office/",
    description: "Autocomplete funding agencies with office hierarchy",
    params: autocompleteParams,
    responseFields: ["toptier_agency", "subtier_agency", "office"],
  },
  {
    name: "autocomplete_cfda",
    path: "/api/v2/autocomplete/cfda/",
    description: "Autocomplete CFDA/assistance listing programs",
    params: autocompleteParams,
    responseFields: ["program_number", "program_title", "popular_name"],
  },
  {
    name: "autocomplete_city",
    path: "/api/v2/autocomplete/city/",
    description: "Autocomplete city names (requires country_code filter)",
    params: [
      ...autocompleteParams,
      { name: "country_code", type: "string", required: false },
      { name: "scope", type: "string", required: false, values: ["recipient_location", "place_of_performance"] },
    ],
    responseFields: ["city_name", "state_code"],
  },
  {
    name: "autocomplete_glossary",
    path: "/api/v2/autocomplete/glossary/",
    description: "Autocomplete glossary terms",
    params: autocompleteParams,
    responseFields: ["search_text", "matched_terms", "count"],
  },
  {
    name: "autocomplete_location",
    path: "/api/v2/autocomplete/location/",
    description: "Autocomplete location names (cities, countries)",
    params: autocompleteParams,
    responseFields: ["cities"],
  },
  {
    name: "autocomplete_naics",
    path: "/api/v2/autocomplete/naics/",
    description: "Autocomplete NAICS industry codes",
    params: autocompleteParams,
    responseFields: ["naics", "naics_description"],
  },
  {
    name: "autocomplete_psc",
    path: "/api/v2/autocomplete/psc/",
    description: "Autocomplete product/service codes",
    params: autocompleteParams,
    responseFields: ["product_or_service_code", "psc_description"],
  },
  {
    name: "autocomplete_program_activity",
    path: "/api/v2/autocomplete/program_activity/",
    description: "Autocomplete program activity names",
    params: autocompleteParams,
    responseFields: ["program_activity_code", "program_activity_name"],
  },
  {
    name: "autocomplete_recipient",
    path: "/api/v2/autocomplete/recipient/",
    description: "Autocomplete recipient names",
    params: autocompleteParams,
    responseFields: ["recipient_name", "uei", "duns"],
  },
  {
    name: "autocomplete_accounts_aid",
    path: "/api/v2/autocomplete/accounts/aid/",
    description: "Autocomplete treasury account AID (agency identifier)",
    params: [
      { name: "aid", type: "string", required: false },
      { name: "ata", type: "string", required: false },
      { name: "main", type: "string", required: false },
      { name: "sub", type: "string", required: false },
      { name: "bpoa", type: "string", required: false },
      { name: "epoa", type: "string", required: false },
      { name: "a", type: "string", required: false },
    ],
    responseFields: ["aid", "agency_name", "agency_abbreviation"],
  },
  {
    name: "autocomplete_accounts_a",
    path: "/api/v2/autocomplete/accounts/a/",
    description: "Autocomplete treasury account availability type code",
    params: [
      { name: "search_text", type: "string", required: false },
    ],
    responseFields: ["results"],
  },
  {
    name: "autocomplete_accounts_ata",
    path: "/api/v2/autocomplete/accounts/ata/",
    description: "Autocomplete treasury account ATA (allocation transfer agency)",
    params: [
      { name: "search_text", type: "string", required: false },
    ],
    responseFields: ["results"],
  },
  {
    name: "autocomplete_accounts_bpoa",
    path: "/api/v2/autocomplete/accounts/bpoa/",
    description: "Autocomplete treasury account beginning period of availability",
    params: [
      { name: "search_text", type: "string", required: false },
    ],
    responseFields: ["results"],
  },
  {
    name: "autocomplete_accounts_epoa",
    path: "/api/v2/autocomplete/accounts/epoa/",
    description: "Autocomplete treasury account ending period of availability",
    params: [
      { name: "search_text", type: "string", required: false },
    ],
    responseFields: ["results"],
  },
  {
    name: "autocomplete_accounts_main",
    path: "/api/v2/autocomplete/accounts/main/",
    description: "Autocomplete treasury account main account code",
    params: [
      { name: "search_text", type: "string", required: false },
    ],
    responseFields: ["results"],
  },
  {
    name: "autocomplete_accounts_sub",
    path: "/api/v2/autocomplete/accounts/sub/",
    description: "Autocomplete treasury account sub-account code",
    params: [
      { name: "search_text", type: "string", required: false },
    ],
    responseFields: ["results"],
  },
];
