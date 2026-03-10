import { z } from "zod";
import { simpleResultsResponse } from "../../shared-schemas";

// --- Budget function item ---

export const BudgetFunctionItemSchema = z.object({
  budget_function_code: z.string(),
  budget_function_title: z.string(),
}).passthrough();

export const BudgetFunctionListResponseSchema = simpleResultsResponse(BudgetFunctionItemSchema);

// --- Budget subfunction item ---

export const BudgetSubfunctionItemSchema = z.object({
  budget_subfunction_code: z.string(),
  budget_subfunction_title: z.string(),
}).passthrough();

export const BudgetSubfunctionListResponseSchema = simpleResultsResponse(BudgetSubfunctionItemSchema);
