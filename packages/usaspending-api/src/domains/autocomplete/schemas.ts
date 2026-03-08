import { z } from "zod";

// Most autocomplete endpoints return {results: [...], messages?: [...]}
// Item shapes vary by endpoint, so we use passthrough objects

export const AutocompleteAgencyResultSchema = z.object({
  id: z.number().nullable().optional(),
  toptier_flag: z.boolean().nullable().optional(),
  toptier_agency: z.object({
    toptier_code: z.string(),
    abbreviation: z.string().nullable().optional(),
    name: z.string(),
  }).passthrough().nullable().optional(),
  subtier_agency: z.object({
    abbreviation: z.string().nullable().optional(),
    name: z.string(),
  }).passthrough().nullable().optional(),
}).passthrough();

export const AutocompleteAgencyResponseSchema = z.object({
  results: z.array(AutocompleteAgencyResultSchema),
  messages: z.array(z.unknown()).optional(),
}).passthrough();

// Agency-office autocomplete has a nested structure
export const AutocompleteAgencyOfficeResponseSchema = z.object({
  results: z.object({
    toptier_agency: z.array(z.unknown()),
    subtier_agency: z.array(z.unknown()),
    office: z.array(z.unknown()),
  }).passthrough(),
  messages: z.array(z.unknown()).optional(),
}).passthrough();

// CFDA/Assistance listing autocomplete
export const AutocompleteCfdaResultSchema = z.object({
  program_number: z.string().nullable().optional(),
  program_title: z.string().nullable().optional(),
  popular_name: z.string().nullable().optional(),
}).passthrough();

export const AutocompleteCfdaResponseSchema = z.object({
  results: z.array(AutocompleteCfdaResultSchema),
}).passthrough();

// City autocomplete
export const AutocompleteCityResultSchema = z.object({
  city_name: z.string(),
  state_code: z.string().nullable().optional(),
}).passthrough();

export const AutocompleteCityResponseSchema = z.object({
  count: z.number().optional(),
  results: z.array(AutocompleteCityResultSchema),
}).passthrough();

// Glossary autocomplete
export const AutocompleteGlossaryResponseSchema = z.object({
  search_text: z.string().optional(),
  results: z.array(z.unknown()),
  count: z.number().optional(),
  matched_terms: z.array(z.string()).optional(),
}).passthrough();

// Location autocomplete
export const AutocompleteLocationResponseSchema = z.object({
  count: z.number().optional(),
  results: z.object({
    cities: z.array(z.object({
      city_name: z.string(),
      country_name: z.string().nullable().optional(),
    }).passthrough()).optional(),
  }).passthrough(),
  messages: z.array(z.unknown()).optional(),
}).passthrough();

// NAICS autocomplete
export const AutocompleteNaicsResultSchema = z.object({
  naics: z.string(),
  naics_description: z.string().nullable().optional(),
  year_retired: z.number().nullable().optional(),
}).passthrough();

export const AutocompleteNaicsResponseSchema = z.object({
  results: z.array(AutocompleteNaicsResultSchema),
}).passthrough();

// PSC autocomplete
export const AutocompletePscResponseSchema = z.object({
  results: z.array(z.unknown()),
}).passthrough();

// Program activity autocomplete
export const AutocompleteProgramActivityResultSchema = z.object({
  program_activity_code: z.string().nullable().optional(),
  program_activity_name: z.string().nullable().optional(),
}).passthrough();

export const AutocompleteProgramActivityResponseSchema = z.object({
  results: z.array(AutocompleteProgramActivityResultSchema),
}).passthrough();

// Recipient autocomplete
export const AutocompleteRecipientResultSchema = z.object({
  recipient_name: z.string().nullable().optional(),
  recipient_level: z.string().nullable().optional(),
  uei: z.string().nullable().optional(),
  duns: z.string().nullable().optional(),
}).passthrough();

export const AutocompleteRecipientResponseSchema = z.object({
  count: z.number().optional(),
  results: z.array(AutocompleteRecipientResultSchema),
  messages: z.array(z.unknown()).optional(),
}).passthrough();

// Accounts autocomplete (sub-endpoints: a, aid, ata, bpoa, epoa, main, sub)
// 'aid' returns objects, rest return strings
export const AutocompleteAccountsAidResultSchema = z.object({
  aid: z.string(),
  agency_name: z.string().nullable().optional(),
  agency_abbreviation: z.string().nullable().optional(),
}).passthrough();

export const AutocompleteAccountsAidResponseSchema = z.object({
  results: z.array(AutocompleteAccountsAidResultSchema),
}).passthrough();

export const AutocompleteAccountsStringResponseSchema = z.object({
  results: z.array(z.unknown()),
}).passthrough();
