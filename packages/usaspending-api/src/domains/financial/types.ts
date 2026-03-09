import { z } from "zod";
import {
  FederalObligationItemSchema,
  FinancialBalanceItemSchema,
  SpendingMajorObjectClassItemSchema,
  SpendingObjectClassItemSchema,
} from "./schemas";

export type FederalObligationItem = z.infer<typeof FederalObligationItemSchema>;
export type FinancialBalanceItem = z.infer<typeof FinancialBalanceItemSchema>;
export type SpendingMajorObjectClassItem = z.infer<typeof SpendingMajorObjectClassItemSchema>;
export type SpendingObjectClassItem = z.infer<typeof SpendingObjectClassItemSchema>;

export interface FinancialKindMap {
  financial_federal_obligations: FederalObligationItem[];
  financial_balances: FinancialBalanceItem[];
  financial_spending_major_object_class: SpendingMajorObjectClassItem[];
  financial_spending_object_class: SpendingObjectClassItem[];
}
