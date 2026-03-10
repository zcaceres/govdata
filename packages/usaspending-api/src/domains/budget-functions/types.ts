import { z } from "zod";
import {
  BudgetFunctionItemSchema,
  BudgetSubfunctionItemSchema,
} from "./schemas";

export type BudgetFunctionItem = z.infer<typeof BudgetFunctionItemSchema>;
export type BudgetSubfunctionItem = z.infer<typeof BudgetSubfunctionItemSchema>;

export interface BudgetFunctionsKindMap {
  budget_function_list: BudgetFunctionItem[];
  budget_function_subfunctions: BudgetSubfunctionItem[];
}
