import { z } from "zod";
import {
  ToptierAgencyResultSchema,
  AwardTypesResponseSchema,
  GlossaryResultSchema,
  DefCodeSchema,
  NaicsRefResultSchema,
  FilterTreeResultSchema,
  SubmissionPeriodSchema,
  TotalBudgetaryResourceResultSchema,
  AssistanceListingResultSchema,
} from "./schemas";

export type ToptierAgencyResult = z.infer<typeof ToptierAgencyResultSchema>;
export type AwardTypesResponse = z.infer<typeof AwardTypesResponseSchema>;
export type GlossaryResult = z.infer<typeof GlossaryResultSchema>;
export type DefCode = z.infer<typeof DefCodeSchema>;
export type NaicsRefResult = z.infer<typeof NaicsRefResultSchema>;
export type FilterTreeResult = z.infer<typeof FilterTreeResultSchema>;
export type SubmissionPeriod = z.infer<typeof SubmissionPeriodSchema>;
export type TotalBudgetaryResourceResult = z.infer<typeof TotalBudgetaryResourceResultSchema>;
export type AssistanceListingResult = z.infer<typeof AssistanceListingResultSchema>;

export interface ReferencesKindMap {
  ref_toptier_agencies: ToptierAgencyResult[];
  ref_agency: unknown;
  ref_award_types: AwardTypesResponse;
  ref_glossary: GlossaryResult[];
  ref_def_codes: DefCode[];
  ref_naics: NaicsRefResult[];
  ref_data_dictionary: unknown;
  ref_filter_hash: { hash: string };
  ref_filter_tree_psc: FilterTreeResult[];
  ref_filter_tree_tas: FilterTreeResult[];
  ref_submission_periods: SubmissionPeriod[];
  ref_total_budgetary_resources: TotalBudgetaryResourceResult[];
  ref_assistance_listing: AssistanceListingResult[];
  ref_cfda_totals: unknown;
}
