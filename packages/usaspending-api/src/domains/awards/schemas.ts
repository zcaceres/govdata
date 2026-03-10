import { z } from "zod";
import { OffsetPageMetaSchema } from "../../shared-schemas";

const RecipientSchema = z.object({
  recipient_hash: z.string().nullable().optional(),
  recipient_name: z.string().nullable().optional(),
  recipient_uei: z.string().nullable().optional(),
  recipient_unique_id: z.string().nullable().optional(),
  parent_recipient_hash: z.string().nullable().optional(),
  parent_recipient_name: z.string().nullable().optional(),
  parent_recipient_uei: z.string().nullable().optional(),
  parent_recipient_unique_id: z.string().nullable().optional(),
  business_categories: z.array(z.string()).optional(),
  location: z.unknown().optional(),
}).passthrough();

const AgencyRefSchema = z.object({
  id: z.number().nullable().optional(),
  toptier_agency: z.unknown().optional(),
  subtier_agency: z.unknown().optional(),
  office_agency_name: z.string().nullable().optional(),
}).passthrough();

const PeriodOfPerformanceSchema = z.object({
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
  last_modified_date: z.string().nullable().optional(),
  potential_end_date: z.string().nullable().optional(),
}).passthrough();

export const AwardDetailSchema = z.object({
  id: z.number(),
  generated_unique_award_id: z.string(),
  piid: z.string().nullable().optional(),
  fain: z.string().nullable().optional(),
  uri: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  type: z.string().nullable().optional(),
  type_description: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  total_obligation: z.number().nullable().optional(),
  total_outlay: z.number().nullable().optional(),
  subaward_count: z.number().nullable().optional(),
  total_subaward_amount: z.number().nullable().optional(),
  date_signed: z.string().nullable().optional(),
  base_exercised_options: z.number().nullable().optional(),
  base_and_all_options: z.number().nullable().optional(),
  recipient: RecipientSchema.nullable().optional(),
  awarding_agency: AgencyRefSchema.nullable().optional(),
  funding_agency: AgencyRefSchema.nullable().optional(),
  period_of_performance: PeriodOfPerformanceSchema.nullable().optional(),
  naics_hierarchy: z.unknown().optional(),
  psc_hierarchy: z.unknown().optional(),
}).passthrough();

// --- Award accounts ---

export const AwardAccountResultSchema = z.object({
  total_transaction_obligated_amount: z.number().nullable().optional(),
  federal_account: z.string().nullable().optional(),
  account_title: z.string().nullable().optional(),
  funding_agency_abbreviation: z.string().nullable().optional(),
  funding_agency_name: z.string().nullable().optional(),
  funding_agency_id: z.number().nullable().optional(),
  funding_toptier_agency_id: z.number().nullable().optional(),
  funding_agency_slug: z.string().nullable().optional(),
}).passthrough();

export const AwardAccountsResponseSchema = z.object({
  results: z.array(AwardAccountResultSchema),
  page_metadata: OffsetPageMetaSchema,
}).passthrough();

// --- Award counts ---

export const AwardCountFederalAccountSchema = z.object({
  federal_accounts: z.number(),
}).passthrough();

export const AwardCountSubawardSchema = z.object({
  subawards: z.number(),
}).passthrough();

export const AwardCountTransactionSchema = z.object({
  transactions: z.number(),
}).passthrough();

// --- Award funding ---

export const AwardFundingResultSchema = z.object({
  transaction_obligated_amount: z.number().nullable().optional(),
  gross_outlay_amount: z.number().nullable().optional(),
  disaster_emergency_fund_code: z.string().nullable().optional(),
  federal_account: z.string().nullable().optional(),
  account_title: z.string().nullable().optional(),
  funding_agency_name: z.string().nullable().optional(),
  funding_agency_id: z.number().nullable().optional(),
  funding_toptier_agency_id: z.number().nullable().optional(),
  awarding_agency_name: z.string().nullable().optional(),
}).passthrough();

export const AwardFundingResponseSchema = z.object({
  results: z.array(AwardFundingResultSchema),
  page_metadata: OffsetPageMetaSchema,
}).passthrough();

// --- Award funding rollup ---

export const AwardFundingRollupSchema = z.object({
  total_transaction_obligated_amount: z.number().nullable().optional(),
  awarding_agency_count: z.number().nullable().optional(),
  funding_agency_count: z.number().nullable().optional(),
  federal_account_count: z.number().nullable().optional(),
}).passthrough();

// --- Last updated ---

export const AwardLastUpdatedSchema = z.object({
  last_updated: z.string().nullable().optional(),
}).passthrough();

// --- Award spending by recipient ---

const SpendingRecipientPageMetaSchema = z.object({
  count: z.number().optional(),
  page: z.number(),
  has_next_page: z.boolean(),
  has_previous_page: z.boolean(),
  next: z.number().nullable().optional(),
  current: z.string().nullable().optional(),
  previous: z.number().nullable().optional(),
}).passthrough();

export const AwardSpendingRecipientResultSchema = z.object({
  award_category: z.string().nullable().optional(),
  obligated_amount: z.union([z.number(), z.string()]).nullable().optional(),
  recipient: z.object({
    recipient_name: z.string().nullable().optional(),
  }).passthrough().nullable().optional(),
}).passthrough();

export const AwardSpendingRecipientResponseSchema = z.object({
  page_metadata: SpendingRecipientPageMetaSchema,
  results: z.array(AwardSpendingRecipientResultSchema),
}).passthrough();
