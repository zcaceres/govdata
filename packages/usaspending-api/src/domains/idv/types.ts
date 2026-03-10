import { z } from "zod";
import {
  IdvAmountsSchema,
  IdvCountSchema,
  IdvFundingRollupSchema,
  IdvFundingItemSchema,
  IdvAccountItemSchema,
  IdvActivityItemSchema,
  IdvAwardItemSchema,
} from "./schemas";

export type IdvAmounts = z.infer<typeof IdvAmountsSchema>;
export type IdvCount = z.infer<typeof IdvCountSchema>;
export type IdvFundingRollup = z.infer<typeof IdvFundingRollupSchema>;
export type IdvFundingItem = z.infer<typeof IdvFundingItemSchema>;
export type IdvAccountItem = z.infer<typeof IdvAccountItemSchema>;
export type IdvActivityItem = z.infer<typeof IdvActivityItemSchema>;
export type IdvAwardItem = z.infer<typeof IdvAwardItemSchema>;

export interface IdvKindMap {
  idv_accounts: IdvAccountItem[];
  idv_activity: IdvActivityItem[];
  idv_amounts: IdvAmounts;
  idv_child_awards: IdvAwardItem[];
  idv_child_idvs: IdvAwardItem[];
  idv_count_federal_account: IdvCount;
  idv_funding_rollup: IdvFundingRollup;
  idv_funding: IdvFundingItem[];
}
