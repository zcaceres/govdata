import type { ClientOptions } from "govdata-core";
import { usaPost } from "../../client";
import {
  AutocompleteAgencyResponseSchema,
  AutocompleteAgencyOfficeResponseSchema,
  AutocompleteCfdaResponseSchema,
  AutocompleteCityResponseSchema,
  AutocompleteGlossaryResponseSchema,
  AutocompleteLocationResponseSchema,
  AutocompleteNaicsResponseSchema,
  AutocompletePscResponseSchema,
  AutocompleteProgramActivityResponseSchema,
  AutocompleteRecipientResponseSchema,
  AutocompleteAccountsAidResponseSchema,
  AutocompleteAccountsStringResponseSchema,
} from "./schemas";
import { wrapResponse } from "../../response";
import type { USAResult } from "../../response";

interface AutocompleteParams {
  search_text: string;
  limit?: number;
}

function buildBody(params: AutocompleteParams) {
  const body: Record<string, unknown> = { search_text: params.search_text };
  if (params.limit != null) body.limit = params.limit;
  return body;
}

export async function _autocompleteAwardingAgency(
  params: AutocompleteParams,
  options?: ClientOptions,
): Promise<USAResult<"autocomplete_awarding_agency">> {
  const raw = await usaPost(
    "/api/v2/autocomplete/awarding_agency/",
    AutocompleteAgencyResponseSchema,
    buildBody(params),
    options,
  );
  return wrapResponse(raw.results, null, "autocomplete_awarding_agency");
}

export async function _autocompleteFundingAgency(
  params: AutocompleteParams,
  options?: ClientOptions,
): Promise<USAResult<"autocomplete_funding_agency">> {
  const raw = await usaPost(
    "/api/v2/autocomplete/funding_agency/",
    AutocompleteAgencyResponseSchema,
    buildBody(params),
    options,
  );
  return wrapResponse(raw.results, null, "autocomplete_funding_agency");
}

export async function _autocompleteAwardingAgencyOffice(
  params: AutocompleteParams,
  options?: ClientOptions,
): Promise<USAResult<"autocomplete_awarding_agency_office">> {
  const raw = await usaPost(
    "/api/v2/autocomplete/awarding_agency_office/",
    AutocompleteAgencyOfficeResponseSchema,
    buildBody(params),
    options,
  );
  return wrapResponse(raw.results, null, "autocomplete_awarding_agency_office");
}

export async function _autocompleteFundingAgencyOffice(
  params: AutocompleteParams,
  options?: ClientOptions,
): Promise<USAResult<"autocomplete_funding_agency_office">> {
  const raw = await usaPost(
    "/api/v2/autocomplete/funding_agency_office/",
    AutocompleteAgencyOfficeResponseSchema,
    buildBody(params),
    options,
  );
  return wrapResponse(raw.results, null, "autocomplete_funding_agency_office");
}

export async function _autocompleteCfda(
  params: AutocompleteParams,
  options?: ClientOptions,
): Promise<USAResult<"autocomplete_cfda">> {
  const raw = await usaPost(
    "/api/v2/autocomplete/cfda/",
    AutocompleteCfdaResponseSchema,
    buildBody(params),
    options,
  );
  return wrapResponse(raw.results, null, "autocomplete_cfda");
}

export async function _autocompleteCity(
  params: { search_text: string; limit?: number; filter?: { country_code: string; scope: string } },
  options?: ClientOptions,
): Promise<USAResult<"autocomplete_city">> {
  const body: Record<string, unknown> = { search_text: params.search_text };
  if (params.limit != null) body.limit = params.limit;
  if (params.filter) body.filter = params.filter;
  const raw = await usaPost(
    "/api/v2/autocomplete/city/",
    AutocompleteCityResponseSchema,
    body,
    options,
  );
  return wrapResponse(raw.results, null, "autocomplete_city");
}

export async function _autocompleteGlossary(
  params: AutocompleteParams,
  options?: ClientOptions,
): Promise<USAResult<"autocomplete_glossary">> {
  const raw = await usaPost(
    "/api/v2/autocomplete/glossary/",
    AutocompleteGlossaryResponseSchema,
    buildBody(params),
    options,
  );
  return wrapResponse(raw.results, null, "autocomplete_glossary");
}

export async function _autocompleteLocation(
  params: AutocompleteParams,
  options?: ClientOptions,
): Promise<USAResult<"autocomplete_location">> {
  const raw = await usaPost(
    "/api/v2/autocomplete/location/",
    AutocompleteLocationResponseSchema,
    buildBody(params),
    options,
  );
  return wrapResponse(raw.results, null, "autocomplete_location");
}

export async function _autocompleteNaics(
  params: AutocompleteParams,
  options?: ClientOptions,
): Promise<USAResult<"autocomplete_naics">> {
  const raw = await usaPost(
    "/api/v2/autocomplete/naics/",
    AutocompleteNaicsResponseSchema,
    buildBody(params),
    options,
  );
  return wrapResponse(raw.results, null, "autocomplete_naics");
}

export async function _autocompletePsc(
  params: AutocompleteParams,
  options?: ClientOptions,
): Promise<USAResult<"autocomplete_psc">> {
  const raw = await usaPost(
    "/api/v2/autocomplete/psc/",
    AutocompletePscResponseSchema,
    buildBody(params),
    options,
  );
  return wrapResponse(raw.results, null, "autocomplete_psc");
}

export async function _autocompleteProgramActivity(
  params: AutocompleteParams,
  options?: ClientOptions,
): Promise<USAResult<"autocomplete_program_activity">> {
  const raw = await usaPost(
    "/api/v2/autocomplete/program_activity/",
    AutocompleteProgramActivityResponseSchema,
    buildBody(params),
    options,
  );
  return wrapResponse(raw.results, null, "autocomplete_program_activity");
}

export async function _autocompleteRecipient(
  params: AutocompleteParams,
  options?: ClientOptions,
): Promise<USAResult<"autocomplete_recipient">> {
  const raw = await usaPost(
    "/api/v2/autocomplete/recipient/",
    AutocompleteRecipientResponseSchema,
    buildBody(params),
    options,
  );
  return wrapResponse(raw.results, null, "autocomplete_recipient");
}

// Account autocomplete sub-endpoints
const ACCOUNT_COMPONENT_PATHS = {
  a: "/api/v2/autocomplete/accounts/a/",
  ata: "/api/v2/autocomplete/accounts/ata/",
  bpoa: "/api/v2/autocomplete/accounts/bpoa/",
  epoa: "/api/v2/autocomplete/accounts/epoa/",
  main: "/api/v2/autocomplete/accounts/main/",
  sub: "/api/v2/autocomplete/accounts/sub/",
} as const;

export type AccountComponent = keyof typeof ACCOUNT_COMPONENT_PATHS;

export async function _autocompleteAccountsAid(
  params: { filters: { aid?: string; ata?: string; main?: string; sub?: string; bpoa?: string; epoa?: string; a?: string } },
  options?: ClientOptions,
): Promise<USAResult<"autocomplete_accounts_aid">> {
  const raw = await usaPost(
    "/api/v2/autocomplete/accounts/aid/",
    AutocompleteAccountsAidResponseSchema,
    params,
    options,
  );
  return wrapResponse(raw.results, null, "autocomplete_accounts_aid");
}

async function _autocompleteAccountsString<K extends `autocomplete_accounts_${AccountComponent}`>(
  component: AccountComponent,
  params: { filters: Record<string, string> },
  kind: K,
  options?: ClientOptions,
): Promise<USAResult<K>> {
  const raw = await usaPost(
    ACCOUNT_COMPONENT_PATHS[component],
    AutocompleteAccountsStringResponseSchema,
    params,
    options,
  );
  return wrapResponse(raw.results as any, null, kind);
}

export async function _autocompleteAccountsA(
  params: { filters: Record<string, string> },
  options?: ClientOptions,
): Promise<USAResult<"autocomplete_accounts_a">> {
  return _autocompleteAccountsString("a", params, "autocomplete_accounts_a", options);
}

export async function _autocompleteAccountsAta(
  params: { filters: Record<string, string> },
  options?: ClientOptions,
): Promise<USAResult<"autocomplete_accounts_ata">> {
  return _autocompleteAccountsString("ata", params, "autocomplete_accounts_ata", options);
}

export async function _autocompleteAccountsBpoa(
  params: { filters: Record<string, string> },
  options?: ClientOptions,
): Promise<USAResult<"autocomplete_accounts_bpoa">> {
  return _autocompleteAccountsString("bpoa", params, "autocomplete_accounts_bpoa", options);
}

export async function _autocompleteAccountsEpoa(
  params: { filters: Record<string, string> },
  options?: ClientOptions,
): Promise<USAResult<"autocomplete_accounts_epoa">> {
  return _autocompleteAccountsString("epoa", params, "autocomplete_accounts_epoa", options);
}

export async function _autocompleteAccountsMain(
  params: { filters: Record<string, string> },
  options?: ClientOptions,
): Promise<USAResult<"autocomplete_accounts_main">> {
  return _autocompleteAccountsString("main", params, "autocomplete_accounts_main", options);
}

export async function _autocompleteAccountsSub(
  params: { filters: Record<string, string> },
  options?: ClientOptions,
): Promise<USAResult<"autocomplete_accounts_sub">> {
  return _autocompleteAccountsString("sub", params, "autocomplete_accounts_sub", options);
}
