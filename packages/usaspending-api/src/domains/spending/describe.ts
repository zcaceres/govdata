import type { EndpointDescription } from "govdata-core";

export const spendingEndpoints: EndpointDescription[] = [
  {
    name: "spending_by_agency",
    path: "/api/v2/spending/",
    description: "Get federal spending broken down by agency for a given fiscal year and period",
    params: [
      { name: "type", type: "string", required: true, values: ["agency", "federal_account", "object_class", "budget_function", "budget_subfunction", "recipient", "award", "program_activity"] },
      { name: "fy", type: "string", required: true },
      { name: "period", type: "string", required: false },
      { name: "quarter", type: "string", required: false },
    ],
    responseFields: [
      "name", "code", "amount", "type", "id",
    ],
  },
];
