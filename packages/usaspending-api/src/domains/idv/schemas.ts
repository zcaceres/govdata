import { z } from "zod";
import { OffsetPageMetaSchema } from "../../shared-schemas";

// --- IDV Count ---

export const IdvCountSchema = z.object({
  count: z.number(),
}).passthrough();

// --- IDV Amounts ---

const DefcAmountSchema = z.object({
  code: z.string().nullable().optional(),
  amount: z.number().nullable().optional(),
}).passthrough();

export const IdvAmountsSchema = z.object({
  award_id: z.number().nullable().optional(),
  generated_unique_award_id: z.string().nullable().optional(),
  child_idv_count: z.number().nullable().optional(),
  child_award_count: z.number().nullable().optional(),
  child_award_total_obligation: z.number().nullable().optional(),
  child_award_total_outlay: z.number().nullable().optional(),
  child_award_base_and_all_options_value: z.number().nullable().optional(),
  child_award_base_exercised_options_val: z.number().nullable().optional(),
  child_total_account_outlay: z.number().nullable().optional(),
  child_total_account_obligation: z.number().nullable().optional(),
  child_account_outlays_by_defc: z.array(DefcAmountSchema).nullable().optional(),
  child_account_obligations_by_defc: z.array(DefcAmountSchema).nullable().optional(),
  grandchild_award_count: z.number().nullable().optional(),
  grandchild_award_total_obligation: z.number().nullable().optional(),
  grandchild_award_total_outlay: z.number().nullable().optional(),
  grandchild_award_base_and_all_options_value: z.number().nullable().optional(),
  grandchild_award_base_exercised_options_val: z.number().nullable().optional(),
  grandchild_total_account_outlay: z.number().nullable().optional(),
  grandchild_total_account_obligation: z.number().nullable().optional(),
  grandchild_account_outlays_by_defc: z.array(DefcAmountSchema).nullable().optional(),
  grandchild_account_obligations_by_defc: z.array(DefcAmountSchema).nullable().optional(),
}).passthrough();

// --- IDV Funding Rollup ---

export const IdvFundingRollupSchema = z.object({
  total_transaction_obligated_amount: z.number().nullable().optional(),
  awarding_agency_count: z.number().nullable().optional(),
  funding_agency_count: z.number().nullable().optional(),
  federal_account_count: z.number().nullable().optional(),
}).passthrough();

// --- IDV Funding Item ---

export const IdvFundingItemSchema = z.object({
  award_id: z.number().nullable().optional(),
  generated_unique_award_id: z.string().nullable().optional(),
  reporting_fiscal_year: z.number().nullable().optional(),
  reporting_fiscal_quarter: z.number().nullable().optional(),
  reporting_fiscal_month: z.number().nullable().optional(),
  is_quarterly_submission: z.boolean().nullable().optional(),
  disaster_emergency_fund_code: z.string().nullable().optional(),
  piid: z.string().nullable().optional(),
  awarding_agency_id: z.number().nullable().optional(),
  awarding_toptier_agency_id: z.number().nullable().optional(),
  awarding_agency_name: z.string().nullable().optional(),
  funding_agency_id: z.number().nullable().optional(),
  funding_toptier_agency_id: z.number().nullable().optional(),
  funding_agency_name: z.string().nullable().optional(),
  agency_id: z.string().nullable().optional(),
  main_account_code: z.string().nullable().optional(),
  account_title: z.string().nullable().optional(),
  program_activity_code: z.string().nullable().optional(),
  program_activity_name: z.string().nullable().optional(),
  object_class: z.string().nullable().optional(),
  object_class_name: z.string().nullable().optional(),
  transaction_obligated_amount: z.number().nullable().optional(),
  gross_outlay_amount: z.number().nullable().optional(),
  awarding_agency_slug: z.string().nullable().optional(),
  funding_agency_slug: z.string().nullable().optional(),
}).passthrough();

// --- IDV Account Item (empty results in fixture, so minimal schema) ---

export const IdvAccountItemSchema = z.object({}).passthrough();

// --- IDV Activity Item (empty results in fixture, so minimal schema) ---

export const IdvActivityItemSchema = z.object({}).passthrough();

// --- IDV Award Item (child awards or child IDVs — empty results in fixture) ---

export const IdvAwardItemSchema = z.object({}).passthrough();

// --- Paginated response schemas ---

export const IdvAccountsResponseSchema = z.object({
  results: z.array(IdvAccountItemSchema),
  page_metadata: OffsetPageMetaSchema,
}).passthrough();

export const IdvActivityResponseSchema = z.object({
  results: z.array(IdvActivityItemSchema),
  page_metadata: OffsetPageMetaSchema,
}).passthrough();

export const IdvAwardsResponseSchema = z.object({
  results: z.array(IdvAwardItemSchema),
  page_metadata: OffsetPageMetaSchema,
}).passthrough();

export const IdvFundingResponseSchema = z.object({
  results: z.array(IdvFundingItemSchema),
  page_metadata: OffsetPageMetaSchema,
}).passthrough();
