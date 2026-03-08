import { z } from "zod";

// --- Shared pagination metadata schemas ---

/** Cursor-based pagination (search endpoints) */
export const CursorPageMetaSchema = z.object({
  page: z.number(),
  hasNext: z.boolean(),
  last_record_unique_id: z.union([z.number(), z.string()]).nullable().optional(),
  last_record_sort_value: z.string().nullable().optional(),
}).passthrough();

/** Offset-based pagination (most list endpoints) */
export const OffsetPageMetaSchema = z.object({
  page: z.number(),
  count: z.number().optional(),
  next: z.number().nullable().optional(),
  previous: z.number().nullable().optional(),
  hasNext: z.boolean(),
  hasPrevious: z.boolean(),
  total: z.number().optional(),
  limit: z.number().optional(),
}).passthrough();

// --- Shared response wrapper factories ---

export function cursorPaginatedResponse<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    results: z.array(itemSchema),
    page_metadata: CursorPageMetaSchema,
    limit: z.number().optional(),
    spending_level: z.string().optional(),
    messages: z.array(z.unknown()).optional(),
  }).passthrough();
}

export function offsetPaginatedResponse<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    results: z.array(itemSchema),
    page_metadata: OffsetPageMetaSchema,
    messages: z.array(z.unknown()).optional(),
  }).passthrough();
}

export function simpleResultsResponse<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    results: z.array(itemSchema),
    messages: z.array(z.unknown()).optional(),
  }).passthrough();
}

// --- Shared filter schemas ---

export const TimePeriodSchema = z.object({
  start_date: z.string(),
  end_date: z.string(),
});

export const AwardSearchFiltersSchema = z.object({
  keywords: z.array(z.string()).optional(),
  time_period: z.array(TimePeriodSchema).optional(),
  award_type_codes: z.array(z.string()).optional(),
  agencies: z.array(z.object({
    type: z.string(),
    tier: z.string(),
    name: z.string(),
    toptier_name: z.string().optional(),
  })).optional(),
  naics_codes: z.union([
    z.array(z.string()),
    z.object({ require: z.array(z.string()).optional(), exclude: z.array(z.string()).optional() }).passthrough(),
  ]).optional(),
  recipient_search_text: z.array(z.string()).optional(),
  place_of_performance_locations: z.array(z.object({
    country: z.string(),
    state: z.string().optional(),
    county: z.string().optional(),
  })).optional(),
}).passthrough();

// --- Award type codes ---

export const AwardTypeCodes = {
  contracts: ["A", "B", "C", "D"],
  idvs: ["IDV_A", "IDV_B", "IDV_B_A", "IDV_B_B", "IDV_B_C", "IDV_C", "IDV_D", "IDV_E"],
  grants: ["02", "03", "04", "05"],
  direct_payments: ["06", "10"],
  loans: ["07", "08"],
  other: ["09", "11"],
} as const;
