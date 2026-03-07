import type { ParamDescription, EndpointDescription } from "govdata-core";
import { SavingsSortBy, PaymentsSortBy, SortOrder } from "./schemas";

export type { ParamDescription, EndpointDescription };

const paginationParams: ParamDescription[] = [
  { name: "page", type: "number", required: false },
  { name: "per_page", type: "number", required: false },
];

const savingsParams: ParamDescription[] = [
  { name: "sort_by", type: "string", required: false, values: SavingsSortBy.options as unknown as string[] },
  { name: "sort_order", type: "string", required: false, values: SortOrder.options as unknown as string[] },
  ...paginationParams,
];

const paymentsParams: ParamDescription[] = [
  { name: "sort_by", type: "string", required: false, values: PaymentsSortBy.options as unknown as string[] },
  { name: "sort_order", type: "string", required: false, values: SortOrder.options as unknown as string[] },
  { name: "filter", type: "string", required: false },
  { name: "filter_value", type: "string", required: false },
  ...paginationParams,
];

const endpoints: EndpointDescription[] = [
  {
    name: "grants",
    path: "/savings/grants",
    description: "List cancelled grants with savings data",
    params: savingsParams,
    responseFields: ["date", "agency", "recipient", "value", "savings", "link", "description"],
  },
  {
    name: "contracts",
    path: "/savings/contracts",
    description: "List cancelled contracts with savings data",
    params: savingsParams,
    responseFields: ["piid", "agency", "vendor", "value", "description", "fpds_status", "fpds_link", "deleted_date", "savings"],
  },
  {
    name: "leases",
    path: "/savings/leases",
    description: "List cancelled leases with savings data",
    params: savingsParams,
    responseFields: ["date", "location", "sq_ft", "description", "value", "savings", "agency"],
  },
  {
    name: "payments",
    path: "/payments",
    description: "List payments with filtering support",
    params: paymentsParams,
    responseFields: ["payment_date", "payment_amt", "agency_name", "award_description", "fain", "recipient_justification", "agency_lead_justification", "org_name", "generated_unique_award_id"],
  },
  {
    name: "statistics",
    path: "/payments/statistics",
    description: "Payment statistics by agency, date, and organization",
    params: [],
    responseFields: {
      agency: ["agency_name", "count"],
      request_date: ["date", "count"],
      org_names: ["org_name", "count"],
    },
  },
];

export function describe(): { endpoints: EndpointDescription[] } {
  return { endpoints };
}
