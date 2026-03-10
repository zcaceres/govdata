import { z } from "zod";
import { SubawardItemSchema, TransactionItemSchema } from "./schemas";

export type SubawardItem = z.infer<typeof SubawardItemSchema>;
export type TransactionItem = z.infer<typeof TransactionItemSchema>;

export interface SubawardsKindMap {
  subaward_list: SubawardItem[];
  subaward_by_award: SubawardItem[];
  subaward_transactions: TransactionItem[];
}
