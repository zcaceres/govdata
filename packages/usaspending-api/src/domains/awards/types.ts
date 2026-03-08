import { z } from "zod";
import {
  AwardDetailSchema,
  AwardAccountResultSchema,
  AwardCountFederalAccountSchema,
  AwardCountSubawardSchema,
  AwardCountTransactionSchema,
  AwardFundingResultSchema,
  AwardFundingRollupSchema,
  AwardLastUpdatedSchema,
  AwardSpendingRecipientResultSchema,
} from "./schemas";

export type AwardDetail = z.infer<typeof AwardDetailSchema>;
export type AwardAccountResult = z.infer<typeof AwardAccountResultSchema>;
export type AwardCountFederalAccount = z.infer<typeof AwardCountFederalAccountSchema>;
export type AwardCountSubaward = z.infer<typeof AwardCountSubawardSchema>;
export type AwardCountTransaction = z.infer<typeof AwardCountTransactionSchema>;
export type AwardFundingResult = z.infer<typeof AwardFundingResultSchema>;
export type AwardFundingRollup = z.infer<typeof AwardFundingRollupSchema>;
export type AwardLastUpdated = z.infer<typeof AwardLastUpdatedSchema>;
export type AwardSpendingRecipientResult = z.infer<typeof AwardSpendingRecipientResultSchema>;

export interface AwardsKindMap {
  award: AwardDetail[];
  award_accounts: AwardAccountResult[];
  award_count_federal_account: AwardCountFederalAccount;
  award_count_subaward: AwardCountSubaward;
  award_count_transaction: AwardCountTransaction;
  award_funding: AwardFundingResult[];
  award_funding_rollup: AwardFundingRollup;
  award_last_updated: AwardLastUpdated;
  award_spending_recipient: AwardSpendingRecipientResult[];
}
