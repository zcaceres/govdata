import type { EndpointDescription } from "govdata-core";

export const budgetFunctionsEndpoints: EndpointDescription[] = [
  {
    name: "budget_function_list",
    path: "/api/v2/budget_functions/list_budget_functions/",
    description: "List all budget functions with their codes and titles",
    params: [],
    responseFields: [
      "budget_function_code",
      "budget_function_title",
    ],
  },
  {
    name: "budget_function_subfunctions",
    path: "/api/v2/budget_functions/list_budget_subfunctions/",
    description: "List subfunctions for a given budget function code",
    params: [
      { name: "budget_function_code", type: "string", required: true },
    ],
    responseFields: [
      "budget_subfunction_code",
      "budget_subfunction_title",
    ],
  },
];
