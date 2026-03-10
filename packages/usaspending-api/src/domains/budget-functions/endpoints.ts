import type { ClientOptions } from "govdata-core";
import { usaGet, usaPost } from "../../client";
import { wrapResponse } from "../../response";
import type { USAResult } from "../../response";
import {
  BudgetFunctionListResponseSchema,
  BudgetSubfunctionListResponseSchema,
} from "./schemas";

export async function _budgetFunctionList(
  options?: ClientOptions,
): Promise<USAResult<"budget_function_list">> {
  const raw = await usaGet(
    `/api/v2/budget_functions/list_budget_functions/`,
    BudgetFunctionListResponseSchema,
    undefined,
    options,
  );
  return wrapResponse(raw.results, null, "budget_function_list");
}

export async function _budgetFunctionSubfunctions(
  budgetFunctionCode: string,
  options?: ClientOptions,
): Promise<USAResult<"budget_function_subfunctions">> {
  const raw = await usaPost(
    `/api/v2/budget_functions/list_budget_subfunctions/`,
    BudgetSubfunctionListResponseSchema,
    { budget_function_code: budgetFunctionCode },
    options,
  );
  return wrapResponse(raw.results, null, "budget_function_subfunctions");
}
