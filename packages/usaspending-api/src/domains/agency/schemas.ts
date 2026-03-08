import { z } from "zod";
import { OffsetPageMetaSchema } from "../../shared-schemas";

export const AgencyOverviewSchema = z.object({
  fiscal_year: z.number().nullable().optional(),
  toptier_code: z.string(),
  name: z.string(),
  abbreviation: z.string().nullable().optional(),
  agency_id: z.number().nullable().optional(),
  icon_filename: z.string().nullable().optional(),
  mission: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  congressional_justification_url: z.string().nullable().optional(),
  subtier_agency_count: z.number().nullable().optional(),
  messages: z.array(z.unknown()).optional(),
}).passthrough();

// --- Awards summary ---

export const AgencyAwardsSchema = z.object({
  fiscal_year: z.number().nullable().optional(),
  latest_action_date: z.string().nullable().optional(),
  toptier_code: z.string(),
  transaction_count: z.number(),
  obligations: z.number(),
  messages: z.array(z.unknown()).optional(),
}).passthrough();

// --- Awards new count ---

export const AgencyNewAwardCountSchema = z.object({
  toptier_code: z.string(),
  fiscal_year: z.number().nullable().optional(),
  agency_type: z.string().nullable().optional(),
  award_type_codes: z.unknown().nullable().optional(),
  new_award_count: z.number(),
}).passthrough();

// --- Awards count (all agencies) ---

export const AgencyAwardsCountItemSchema = z.object({
  awarding_toptier_agency_name: z.string(),
  awarding_toptier_agency_code: z.string(),
  contracts: z.number(),
  direct_payments: z.number(),
  grants: z.number(),
  idvs: z.number(),
  loans: z.number(),
  other: z.number(),
}).passthrough();

export const AgencyAwardsCountResponseSchema = z.object({
  results: z.array(z.array(AgencyAwardsCountItemSchema)),
}).passthrough();

// --- Budget function ---

const BudgetFunctionChildSchema = z.object({
  name: z.string(),
  obligated_amount: z.number().nullable().optional(),
  gross_outlay_amount: z.number().nullable().optional(),
}).passthrough();

export const BudgetFunctionResultSchema = z.object({
  name: z.string(),
  children: z.array(BudgetFunctionChildSchema).optional(),
  obligated_amount: z.number().nullable().optional(),
  gross_outlay_amount: z.number().nullable().optional(),
}).passthrough();

export const BudgetFunctionResponseSchema = z.object({
  toptier_code: z.string(),
  fiscal_year: z.number().nullable().optional(),
  results: z.array(BudgetFunctionResultSchema),
  messages: z.array(z.unknown()).optional(),
}).passthrough();

// --- Budget function count ---

export const BudgetFunctionCountSchema = z.object({
  toptier_code: z.string(),
  fiscal_year: z.number().nullable().optional(),
  budget_function_count: z.number(),
  budget_sub_function_count: z.number(),
  messages: z.array(z.unknown()).optional(),
}).passthrough();

// --- Budgetary resources ---

const BudgetaryResourcePeriodSchema = z.object({
  period: z.number(),
  obligated: z.number(),
}).passthrough();

const BudgetaryResourceYearSchema = z.object({
  fiscal_year: z.number(),
  agency_budgetary_resources: z.number().nullable().optional(),
  agency_total_obligated: z.number().nullable().optional(),
  agency_total_outlayed: z.number().nullable().optional(),
  total_budgetary_resources: z.number().nullable().optional(),
  agency_obligation_by_period: z.array(BudgetaryResourcePeriodSchema).optional(),
}).passthrough();

export const BudgetaryResourcesResponseSchema = z.object({
  toptier_code: z.string(),
  agency_data_by_year: z.array(BudgetaryResourceYearSchema),
}).passthrough();

// --- Federal account ---

const FederalAccountChildSchema = z.object({
  name: z.string(),
  code: z.string().nullable().optional(),
  obligated_amount: z.number().nullable().optional(),
  gross_outlay_amount: z.number().nullable().optional(),
}).passthrough();

export const FederalAccountResultSchema = z.object({
  code: z.string().nullable().optional(),
  name: z.string(),
  children: z.array(FederalAccountChildSchema).optional(),
  obligated_amount: z.number().nullable().optional(),
  gross_outlay_amount: z.number().nullable().optional(),
}).passthrough();

export const FederalAccountResponseSchema = z.object({
  toptier_code: z.string(),
  fiscal_year: z.number().nullable().optional(),
  page_metadata: OffsetPageMetaSchema,
  results: z.array(FederalAccountResultSchema),
  messages: z.array(z.unknown()).optional(),
}).passthrough();

// --- Federal account count ---

export const FederalAccountCountSchema = z.object({
  toptier_code: z.string(),
  fiscal_year: z.number().nullable().optional(),
  federal_account_count: z.number(),
  treasury_account_count: z.number(),
  messages: z.array(z.unknown()).optional(),
}).passthrough();

// --- Object class ---

export const ObjectClassResultSchema = z.object({
  name: z.string(),
  obligated_amount: z.number().nullable().optional(),
  gross_outlay_amount: z.number().nullable().optional(),
}).passthrough();

export const ObjectClassResponseSchema = z.object({
  toptier_code: z.string(),
  fiscal_year: z.number().nullable().optional(),
  page_metadata: OffsetPageMetaSchema,
  results: z.array(ObjectClassResultSchema),
  messages: z.array(z.unknown()).optional(),
}).passthrough();

// --- Object class count ---

export const ObjectClassCountSchema = z.object({
  toptier_code: z.string(),
  fiscal_year: z.number().nullable().optional(),
  object_class_count: z.number(),
  messages: z.array(z.unknown()).optional(),
}).passthrough();

// --- Obligations by award category ---

export const ObligationsByCategoryResultSchema = z.object({
  category: z.string(),
  aggregated_amount: z.number().nullable().optional(),
}).passthrough();

export const ObligationsByCategoryResponseSchema = z.object({
  total_aggregated_amount: z.number().nullable().optional(),
  results: z.array(ObligationsByCategoryResultSchema),
}).passthrough();

// --- Program activity ---

export const ProgramActivityResultSchema = z.object({
  name: z.string(),
  obligated_amount: z.number().nullable().optional(),
  gross_outlay_amount: z.number().nullable().optional(),
}).passthrough();

export const ProgramActivityResponseSchema = z.object({
  toptier_code: z.string(),
  fiscal_year: z.number().nullable().optional(),
  page_metadata: OffsetPageMetaSchema,
  results: z.array(ProgramActivityResultSchema),
  messages: z.array(z.unknown()).optional(),
}).passthrough();

// --- Program activity count ---

export const ProgramActivityCountSchema = z.object({
  toptier_code: z.string(),
  fiscal_year: z.number().nullable().optional(),
  program_activity_count: z.number(),
  messages: z.array(z.unknown()).optional(),
}).passthrough();

// --- Sub-agency ---

const SubAgencyChildSchema = z.object({
  code: z.string().nullable().optional(),
  name: z.string(),
  total_obligations: z.number().nullable().optional(),
  transaction_count: z.number().nullable().optional(),
  new_award_count: z.number().nullable().optional(),
}).passthrough();

export const SubAgencyResultSchema = z.object({
  abbreviation: z.string().nullable().optional(),
  name: z.string(),
  total_obligations: z.number().nullable().optional(),
  transaction_count: z.number().nullable().optional(),
  new_award_count: z.number().nullable().optional(),
  children: z.array(SubAgencyChildSchema).optional(),
}).passthrough();

export const SubAgencyResponseSchema = z.object({
  toptier_code: z.string(),
  fiscal_year: z.number().nullable().optional(),
  page_metadata: OffsetPageMetaSchema,
  results: z.array(SubAgencyResultSchema),
  messages: z.array(z.unknown()).optional(),
}).passthrough();

// --- Sub-agency count ---

export const SubAgencyCountSchema = z.object({
  toptier_code: z.string(),
  fiscal_year: z.number().nullable().optional(),
  sub_agency_count: z.number(),
  office_count: z.number(),
  messages: z.array(z.unknown()).optional(),
}).passthrough();

// --- Sub-components ---

export const SubComponentResultSchema = z.object({
  name: z.string(),
  id: z.string().nullable().optional(),
  total_obligations: z.number().nullable().optional(),
  total_outlays: z.number().nullable().optional(),
  total_budgetary_resources: z.number().nullable().optional(),
}).passthrough();

export const SubComponentsResponseSchema = z.object({
  toptier_code: z.string(),
  fiscal_year: z.number().nullable().optional(),
  results: z.array(SubComponentResultSchema),
  messages: z.array(z.unknown()).optional(),
  page_metadata: OffsetPageMetaSchema,
}).passthrough();

// --- Treasury account sub-resources ---

export const TreasuryAccountResultSchema = z.object({
  name: z.string().nullable().optional(),
  obligated_amount: z.number().nullable().optional(),
  gross_outlay_amount: z.number().nullable().optional(),
}).passthrough();

export const TreasuryAccountResponseSchema = z.object({
  treasury_account_symbol: z.string().nullable().optional(),
  fiscal_year: z.number().nullable().optional(),
  page_metadata: OffsetPageMetaSchema,
  results: z.array(TreasuryAccountResultSchema),
  messages: z.array(z.unknown()).optional(),
}).passthrough();
