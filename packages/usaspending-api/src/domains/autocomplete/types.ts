import { z } from "zod";
import {
  AutocompleteAgencyResultSchema,
  AutocompleteCfdaResultSchema,
  AutocompleteCityResultSchema,
  AutocompleteNaicsResultSchema,
  AutocompleteProgramActivityResultSchema,
  AutocompleteRecipientResultSchema,
  AutocompleteAccountsAidResultSchema,
} from "./schemas";

export type AutocompleteAgencyResult = z.infer<typeof AutocompleteAgencyResultSchema>;
export type AutocompleteCfdaResult = z.infer<typeof AutocompleteCfdaResultSchema>;
export type AutocompleteCityResult = z.infer<typeof AutocompleteCityResultSchema>;
export type AutocompleteNaicsResult = z.infer<typeof AutocompleteNaicsResultSchema>;
export type AutocompleteProgramActivityResult = z.infer<typeof AutocompleteProgramActivityResultSchema>;
export type AutocompleteRecipientResult = z.infer<typeof AutocompleteRecipientResultSchema>;
export type AutocompleteAccountsAidResult = z.infer<typeof AutocompleteAccountsAidResultSchema>;

export interface AutocompleteKindMap {
  autocomplete_awarding_agency: AutocompleteAgencyResult[];
  autocomplete_funding_agency: AutocompleteAgencyResult[];
  autocomplete_awarding_agency_office: unknown;
  autocomplete_funding_agency_office: unknown;
  autocomplete_cfda: AutocompleteCfdaResult[];
  autocomplete_city: AutocompleteCityResult[];
  autocomplete_glossary: unknown[];
  autocomplete_location: unknown;
  autocomplete_naics: AutocompleteNaicsResult[];
  autocomplete_psc: unknown[];
  autocomplete_program_activity: AutocompleteProgramActivityResult[];
  autocomplete_recipient: AutocompleteRecipientResult[];
  autocomplete_accounts_aid: AutocompleteAccountsAidResult[];
  autocomplete_accounts_a: (string | number)[];
  autocomplete_accounts_ata: (string | number)[];
  autocomplete_accounts_bpoa: (string | number)[];
  autocomplete_accounts_epoa: (string | number)[];
  autocomplete_accounts_main: (string | number)[];
  autocomplete_accounts_sub: (string | number)[];
}
