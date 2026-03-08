import { z } from "zod";
import {
  AwardSearchParamsSchema,
  AwardSearchResultSchema,
  AwardSearchResponseSchema,
  SpendingOverTimeParamsSchema,
  SpendingOverTimeResultSchema,
  SpendingOverTimeResponseSchema,
  SpendingOverTimeGroupSchema,
  AwardCountResultSchema,
  AwardCountResponseSchema,
  CategoryResultSchema,
  CategoryResponseSchema,
  CategoryParamsSchema,
  GeographyResultSchema,
  GeographyResponseSchema,
  GeographyParamsSchema,
  TransactionResultSchema,
  TransactionResponseSchema,
  TransactionCountResponseSchema,
  TransactionGroupedResultSchema,
  TransactionGroupedResponseSchema,
  SubawardGroupedResultSchema,
  SubawardGroupedResponseSchema,
  NewAwardsOverTimeResultSchema,
  NewAwardsOverTimeResponseSchema,
  TransactionSpendingSummaryResultSchema,
  TransactionSpendingSummaryResponseSchema,
} from "./schemas";

export type AwardSearchParams = z.infer<typeof AwardSearchParamsSchema>;
export type AwardSearchResult = z.infer<typeof AwardSearchResultSchema>;
export type AwardSearchResponse = z.infer<typeof AwardSearchResponseSchema>;
export type SpendingOverTimeParams = z.infer<typeof SpendingOverTimeParamsSchema>;
export type SpendingOverTimeResult = z.infer<typeof SpendingOverTimeResultSchema>;
export type SpendingOverTimeResponse = z.infer<typeof SpendingOverTimeResponseSchema>;
export type SpendingOverTimeGroup = z.infer<typeof SpendingOverTimeGroupSchema>;

export type AwardCountResult = z.infer<typeof AwardCountResultSchema>;
export type AwardCountResponse = z.infer<typeof AwardCountResponseSchema>;
export type CategoryResult = z.infer<typeof CategoryResultSchema>;
export type CategoryResponse = z.infer<typeof CategoryResponseSchema>;
export type CategoryParams = z.infer<typeof CategoryParamsSchema>;
export type GeographyResult = z.infer<typeof GeographyResultSchema>;
export type GeographyResponse = z.infer<typeof GeographyResponseSchema>;
export type GeographyParams = z.infer<typeof GeographyParamsSchema>;
export type TransactionResult = z.infer<typeof TransactionResultSchema>;
export type TransactionResponse = z.infer<typeof TransactionResponseSchema>;
export type TransactionCountResponse = z.infer<typeof TransactionCountResponseSchema>;
export type TransactionGroupedResult = z.infer<typeof TransactionGroupedResultSchema>;
export type TransactionGroupedResponse = z.infer<typeof TransactionGroupedResponseSchema>;
export type SubawardGroupedResult = z.infer<typeof SubawardGroupedResultSchema>;
export type SubawardGroupedResponse = z.infer<typeof SubawardGroupedResponseSchema>;
export type NewAwardsOverTimeResult = z.infer<typeof NewAwardsOverTimeResultSchema>;
export type NewAwardsOverTimeResponse = z.infer<typeof NewAwardsOverTimeResponseSchema>;
export type TransactionSpendingSummaryResult = z.infer<typeof TransactionSpendingSummaryResultSchema>;
export type TransactionSpendingSummaryResponse = z.infer<typeof TransactionSpendingSummaryResponseSchema>;

export interface SearchKindMap {
  awards: AwardSearchResult[];
  spending_over_time: SpendingOverTimeResult[];
  award_count: AwardCountResult;
  category: CategoryResult[];
  geography: GeographyResult[];
  transactions: TransactionResult[];
  transaction_count: AwardCountResult;
  transaction_grouped: TransactionGroupedResult[];
  subaward_grouped: SubawardGroupedResult[];
  new_awards_over_time: NewAwardsOverTimeResult[];
  transaction_spending_summary: TransactionSpendingSummaryResult;
}
