import { z } from "zod";

// --- Financial page metadata (uses has_next_page/has_previous_page) ---

const FinancialPageMetaSchema = z.object({
  count: z.number().optional(),
  page: z.number(),
  has_next_page: z.boolean(),
  has_previous_page: z.boolean(),
  next: z.union([z.number(), z.string()]).nullable().optional(),
  current: z.string().nullable().optional(),
  previous: z.union([z.number(), z.string()]).nullable().optional(),
}).passthrough();

function financialPaginatedResponse<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    results: z.array(itemSchema),
    page_metadata: FinancialPageMetaSchema,
  }).passthrough();
}

// --- Federal obligations ---

export const FederalObligationItemSchema = z.object({
  id: z.string().nullable().optional(),
  account_title: z.string().nullable().optional(),
  account_number: z.string().nullable().optional(),
  obligated_amount: z.string().nullable().optional(),
}).passthrough();

export const FederalObligationsResponseSchema = financialPaginatedResponse(FederalObligationItemSchema);

// --- Financial balances ---

export const FinancialBalanceItemSchema = z.object({
  budget_authority_amount: z.string().nullable().optional(),
  obligated_amount: z.string().nullable().optional(),
  outlay_amount: z.string().nullable().optional(),
}).passthrough();

export const FinancialBalancesResponseSchema = financialPaginatedResponse(FinancialBalanceItemSchema);

// --- Spending by major object class ---

export const SpendingMajorObjectClassItemSchema = z.object({
  major_object_class_code: z.string().nullable().optional(),
  major_object_class_name: z.string().nullable().optional(),
  obligated_amount: z.string().nullable().optional(),
}).passthrough();

export const SpendingMajorObjectClassResponseSchema = financialPaginatedResponse(SpendingMajorObjectClassItemSchema);

// --- Spending by object class ---

export const SpendingObjectClassItemSchema = z.object({
  major_object_class_code: z.string().nullable().optional(),
  major_object_class_name: z.string().nullable().optional(),
  object_class_code: z.string().nullable().optional(),
  object_class_name: z.string().nullable().optional(),
  obligated_amount: z.string().nullable().optional(),
}).passthrough();

export const SpendingObjectClassResponseSchema = financialPaginatedResponse(SpendingObjectClassItemSchema);
