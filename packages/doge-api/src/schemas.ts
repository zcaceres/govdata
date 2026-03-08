import { z } from "zod";

// --- Param schemas ---

export const SavingsSortBy = z.enum(["savings", "value", "date"]);
export const PaymentsSortBy = z.enum(["amount", "date"]);
export const SortOrder = z.enum(["asc", "desc"]);

const paginationParams = {
  page: z.number().int().positive().optional(),
  per_page: z.number().int().positive().optional(),
};

export const SavingsParamsSchema = z.object({
  sort_by: SavingsSortBy.optional(),
  sort_order: SortOrder.optional(),
  ...paginationParams,
});

export const PaymentsParamsSchema = z.object({
  sort_by: PaymentsSortBy.optional(),
  sort_order: SortOrder.optional(),
  filter: z.string().optional(),
  filter_value: z.string().optional(),
  ...paginationParams,
}).refine(
  (data) => !data.filter_value || data.filter,
  { message: "filter is required when filter_value is provided", path: ["filter"] },
).refine(
  (data) => !data.filter || data.filter_value,
  { message: "filter_value is required when filter is provided", path: ["filter_value"] },
);

// --- Resource schemas ---

export const GrantSchema = z.object({
  date: z.string().nullable(),
  agency: z.string().nullable(),
  recipient: z.string().nullable(),
  value: z.number().nullable(),
  savings: z.number().nullable(),
  link: z.string().nullable(),
  description: z.string().nullable(),
});

export const ContractSchema = z.object({
  piid: z.string().nullable(),
  agency: z.string().nullable(),
  vendor: z.string().nullable(),
  value: z.number().nullable(),
  description: z.string().nullable(),
  fpds_status: z.string().nullable(),
  fpds_link: z.string().nullable(),
  deleted_date: z.string().nullable(),
  savings: z.number().nullable(),
});

export const LeaseSchema = z.object({
  date: z.string().nullable(),
  location: z.string().nullable(),
  sq_ft: z.number().nullable(),
  description: z.string().nullable(),
  value: z.number().nullable(),
  savings: z.number().nullable(),
  agency: z.string().nullable(),
});

export const PaymentSchema = z.object({
  payment_date: z.string().nullable(),
  payment_amt: z.number().nullable(),
  agency_name: z.string().nullable(),
  award_description: z.string().nullable(),
  fain: z.string().nullable(),
  recipient_justification: z.string().nullable(),
  agency_lead_justification: z.string().nullable(),
  org_name: z.string().nullable(),
  generated_unique_award_id: z.string().nullable(),
});

// --- Statistics sub-schemas ---

export const AgencyStatSchema = z.object({
  agency_name: z.string(),
  count: z.number(),
});

export const RequestDateStatSchema = z.object({
  date: z.string(),
  count: z.number(),
});

export const OrgNameStatSchema = z.object({
  org_name: z.string(),
  count: z.number(),
});

// --- Meta schema ---

export const MetaSchema = z.object({
  total_results: z.number(),
  pages: z.number(),
});

// --- Response wrappers ---

export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  message: z.string(),
});

export const GrantsResponseSchema = z.object({
  success: z.literal(true),
  result: z.object({ grants: z.array(GrantSchema) }),
  meta: MetaSchema,
});

export const ContractsResponseSchema = z.object({
  success: z.literal(true),
  result: z.object({ contracts: z.array(ContractSchema) }),
  meta: MetaSchema,
});

export const LeasesResponseSchema = z.object({
  success: z.literal(true),
  result: z.object({ leases: z.array(LeaseSchema) }),
  meta: MetaSchema,
});

export const PaymentsResponseSchema = z.object({
  success: z.literal(true),
  result: z.object({ payments: z.array(PaymentSchema) }),
  meta: MetaSchema,
});

export const StatisticsResponseSchema = z.object({
  success: z.literal(true),
  result: z.object({
    agency: z.array(AgencyStatSchema),
    request_date: z.array(RequestDateStatSchema),
    org_names: z.array(OrgNameStatSchema),
  }),
});
