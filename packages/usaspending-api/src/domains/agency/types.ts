import { z } from "zod";
import {
  AgencyOverviewSchema,
  AgencyAwardsSchema,
  AgencyNewAwardCountSchema,
  AgencyAwardsCountItemSchema,
  BudgetFunctionResultSchema,
  BudgetFunctionCountSchema,
  BudgetaryResourcesResponseSchema,
  FederalAccountResultSchema,
  FederalAccountCountSchema,
  ObjectClassResultSchema,
  ObjectClassCountSchema,
  ObligationsByCategoryResultSchema,
  ProgramActivityResultSchema,
  ProgramActivityCountSchema,
  SubAgencyResultSchema,
  SubAgencyCountSchema,
  SubComponentResultSchema,
  TreasuryAccountResultSchema,
} from "./schemas";

export type AgencyOverview = z.infer<typeof AgencyOverviewSchema>;
export type AgencyAwards = z.infer<typeof AgencyAwardsSchema>;
export type AgencyNewAwardCount = z.infer<typeof AgencyNewAwardCountSchema>;
export type AgencyAwardsCountItem = z.infer<typeof AgencyAwardsCountItemSchema>;
export type BudgetFunctionResult = z.infer<typeof BudgetFunctionResultSchema>;
export type BudgetFunctionCount = z.infer<typeof BudgetFunctionCountSchema>;
export type BudgetaryResourcesResponse = z.infer<typeof BudgetaryResourcesResponseSchema>;
export type FederalAccountResult = z.infer<typeof FederalAccountResultSchema>;
export type FederalAccountCount = z.infer<typeof FederalAccountCountSchema>;
export type ObjectClassResult = z.infer<typeof ObjectClassResultSchema>;
export type ObjectClassCount = z.infer<typeof ObjectClassCountSchema>;
export type ObligationsByCategoryResult = z.infer<typeof ObligationsByCategoryResultSchema>;
export type ProgramActivityResult = z.infer<typeof ProgramActivityResultSchema>;
export type ProgramActivityCount = z.infer<typeof ProgramActivityCountSchema>;
export type SubAgencyResult = z.infer<typeof SubAgencyResultSchema>;
export type SubAgencyCount = z.infer<typeof SubAgencyCountSchema>;
export type SubComponentResult = z.infer<typeof SubComponentResultSchema>;
export type TreasuryAccountResult = z.infer<typeof TreasuryAccountResultSchema>;

export interface AgencyKindMap {
  agency: AgencyOverview[];
  agency_awards: AgencyAwards;
  agency_new_award_count: AgencyNewAwardCount;
  agency_awards_count: AgencyAwardsCountItem[][];
  agency_budget_function: BudgetFunctionResult[];
  agency_budget_function_count: BudgetFunctionCount;
  agency_budgetary_resources: BudgetaryResourcesResponse;
  agency_federal_account: FederalAccountResult[];
  agency_federal_account_count: FederalAccountCount;
  agency_object_class: ObjectClassResult[];
  agency_object_class_count: ObjectClassCount;
  agency_obligations_by_award_category: ObligationsByCategoryResult[];
  agency_program_activity: ProgramActivityResult[];
  agency_program_activity_count: ProgramActivityCount;
  agency_sub_agency: SubAgencyResult[];
  agency_sub_agency_count: SubAgencyCount;
  agency_sub_components: SubComponentResult[];
  agency_treasury_account_object_class: TreasuryAccountResult[];
  agency_treasury_account_program_activity: TreasuryAccountResult[];
}
