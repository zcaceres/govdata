import { z } from "zod";

export const SpendingByAgencyParamsSchema = z.object({
  type: z.enum(["agency", "federal_account", "object_class", "budget_function", "budget_subfunction", "recipient", "award", "program_activity"]),
  filters: z.object({
    fy: z.string(),
    period: z.string().optional(),
    quarter: z.string().optional(),
  }).passthrough(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

export const SpendingByAgencyResultSchema = z.object({
  amount: z.number(),
  type: z.string().optional(),
  name: z.string(),
  code: z.string().nullable(),
  id: z.string().nullable().optional(),
  link: z.boolean().nullable().optional(),
}).passthrough();

export const SpendingByAgencyResponseSchema = z.object({
  total: z.number(),
  end_date: z.string().optional(),
  results: z.array(SpendingByAgencyResultSchema),
}).passthrough();
