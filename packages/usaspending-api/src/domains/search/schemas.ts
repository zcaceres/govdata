import { z } from "zod";
import { AwardSearchFiltersSchema, CursorPageMetaSchema } from "../../shared-schemas";

// Re-export for backward compat
export { AwardSearchFiltersSchema };

export const AwardSearchParamsSchema = z.object({
  filters: AwardSearchFiltersSchema,
  fields: z.array(z.string()).optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).optional(),
  subawards: z.boolean().optional(),
});

export const AwardSearchResultSchema = z.object({
  internal_id: z.union([z.number(), z.string()]),
  "Award ID": z.string().nullable().optional(),
  "Recipient Name": z.string().nullable().optional(),
  "Start Date": z.string().nullable().optional(),
  "End Date": z.string().nullable().optional(),
  "Award Amount": z.number().nullable().optional(),
  "Awarding Agency": z.string().nullable().optional(),
  "Awarding Sub Agency": z.string().nullable().optional(),
  "Award Type": z.string().nullable().optional(),
  "Description": z.string().nullable().optional(),
  generated_internal_id: z.string().nullable().optional(),
  awarding_agency_id: z.number().nullable().optional(),
  agency_slug: z.string().nullable().optional(),
}).passthrough();

export const AwardSearchResponseSchema = z.object({
  spending_level: z.string().optional(),
  limit: z.number(),
  results: z.array(AwardSearchResultSchema),
  page_metadata: CursorPageMetaSchema,
  messages: z.array(z.unknown()).optional(),
}).passthrough();

export const SpendingOverTimeGroupSchema = z.enum(["fiscal_year", "quarter", "month"]);

export const SpendingOverTimeParamsSchema = z.object({
  group: SpendingOverTimeGroupSchema,
  filters: AwardSearchFiltersSchema,
  subawards: z.boolean().optional(),
});

export const SpendingOverTimeResultSchema = z.object({
  aggregated_amount: z.number(),
  time_period: z.record(z.string(), z.string()),
  Contract_Obligations: z.number().nullable().optional(),
  Direct_Obligations: z.number().nullable().optional(),
  Grant_Obligations: z.number().nullable().optional(),
  Idv_Obligations: z.number().nullable().optional(),
  Loan_Obligations: z.number().nullable().optional(),
  Other_Obligations: z.number().nullable().optional(),
  total_outlays: z.number().nullable().optional(),
}).passthrough();

export const SpendingOverTimeResponseSchema = z.object({
  group: z.string(),
  results: z.array(SpendingOverTimeResultSchema),
  spending_level: z.string().optional(),
  messages: z.array(z.unknown()).optional(),
}).passthrough();

// --- Spending by Award Count ---

export const AwardCountResultSchema = z.object({
  contracts: z.number(),
  direct_payments: z.number(),
  grants: z.number(),
  idvs: z.number(),
  loans: z.number(),
  other: z.number(),
}).passthrough();

export const AwardCountResponseSchema = z.object({
  results: AwardCountResultSchema,
  spending_level: z.string().optional(),
  messages: z.array(z.unknown()).optional(),
}).passthrough();

// --- Spending by Category (15 sub-paths, same shape) ---

export const CategoryResultSchema = z.object({
  id: z.union([z.number(), z.string()]).nullable().optional(),
  code: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  amount: z.number().nullable().optional(),
  total_outlays: z.number().nullable().optional(),
  year_retired: z.union([z.number(), z.string()]).nullable().optional(),
}).passthrough();

export const CategoryResponseSchema = z.object({
  category: z.string(),
  spending_level: z.string().optional(),
  limit: z.number().optional(),
  page_metadata: CursorPageMetaSchema,
  results: z.array(CategoryResultSchema),
  messages: z.array(z.unknown()).optional(),
}).passthrough();

export const CategoryParamsSchema = z.object({
  filters: AwardSearchFiltersSchema,
  limit: z.number().int().positive().optional(),
  page: z.number().int().positive().optional(),
  subawards: z.boolean().optional(),
});

// --- Spending by Geography ---

export const GeographyResultSchema = z.object({
  shape_code: z.string().nullable().optional(),
  display_name: z.string().nullable().optional(),
  aggregated_amount: z.number().nullable().optional(),
  population: z.number().nullable().optional(),
  per_capita: z.number().nullable().optional(),
}).passthrough();

export const GeographyResponseSchema = z.object({
  scope: z.string(),
  geo_layer: z.string(),
  spending_level: z.string().optional(),
  results: z.array(GeographyResultSchema),
  messages: z.array(z.unknown()).optional(),
}).passthrough();

export const GeographyParamsSchema = z.object({
  filters: AwardSearchFiltersSchema,
  scope: z.enum(["place_of_performance", "recipient_location"]).optional(),
  geo_layer: z.enum(["state", "county", "district"]).optional(),
  geo_layer_filters: z.array(z.string()).optional(),
  subawards: z.boolean().optional(),
});

// --- Spending by Transaction ---

export const TransactionResultSchema = z.object({
  internal_id: z.union([z.number(), z.string()]),
  "Award ID": z.string().nullable().optional(),
  "Recipient Name": z.string().nullable().optional(),
  "Action Date": z.string().nullable().optional(),
  "Transaction Amount": z.number().nullable().optional(),
  "Awarding Agency": z.string().nullable().optional(),
  "Award Type": z.string().nullable().optional(),
  generated_internal_id: z.string().nullable().optional(),
}).passthrough();

export const TransactionResponseSchema = z.object({
  limit: z.number().optional(),
  results: z.array(TransactionResultSchema),
  page_metadata: CursorPageMetaSchema,
  spending_level: z.string().optional(),
  messages: z.array(z.unknown()).optional(),
}).passthrough();

// --- Spending by Transaction Count (same shape as award count) ---

export const TransactionCountResponseSchema = z.object({
  results: AwardCountResultSchema,
  messages: z.array(z.unknown()).optional(),
}).passthrough();

// --- Spending by Transaction Grouped ---

export const TransactionGroupedResultSchema = z.object({
  award_id: z.string().nullable().optional(),
  transaction_count: z.number(),
  transaction_obligation: z.number(),
  award_generated_internal_id: z.string().nullable().optional(),
}).passthrough();

export const TransactionGroupedResponseSchema = z.object({
  limit: z.number().optional(),
  results: z.array(TransactionGroupedResultSchema),
  page_metadata: CursorPageMetaSchema,
  messages: z.array(z.unknown()).optional(),
}).passthrough();

// --- Spending by Subaward Grouped ---

export const SubawardGroupedResultSchema = z.object({
  award_id: z.string().nullable().optional(),
  subaward_count: z.number(),
  subaward_obligation: z.number(),
  award_generated_internal_id: z.string().nullable().optional(),
}).passthrough();

export const SubawardGroupedResponseSchema = z.object({
  limit: z.number().optional(),
  results: z.array(SubawardGroupedResultSchema),
  page_metadata: CursorPageMetaSchema,
  messages: z.array(z.unknown()).optional(),
}).passthrough();

// --- New Awards Over Time ---

export const NewAwardsOverTimeResultSchema = z.object({
  new_award_count_in_period: z.number(),
  time_period: z.record(z.string(), z.string()),
}).passthrough();

export const NewAwardsOverTimeResponseSchema = z.object({
  group: z.string(),
  results: z.array(NewAwardsOverTimeResultSchema),
  messages: z.array(z.unknown()).optional(),
}).passthrough();

// --- Transaction Spending Summary ---

export const TransactionSpendingSummaryResultSchema = z.object({
  prime_awards_count: z.number(),
  prime_awards_obligation_amount: z.number(),
}).passthrough();

export const TransactionSpendingSummaryResponseSchema = z.object({
  results: TransactionSpendingSummaryResultSchema,
  messages: z.array(z.unknown()).optional(),
}).passthrough();
