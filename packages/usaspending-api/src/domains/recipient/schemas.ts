import { z } from "zod";
import { OffsetPageMetaSchema } from "../../shared-schemas";

export const SpendingByStateItemSchema = z.object({
  fips: z.string(),
  code: z.string(),
  name: z.string(),
  type: z.string().optional(),
  amount: z.number(),
  count: z.number().optional(),
}).passthrough();

export const SpendingByStateResponseSchema = z.array(SpendingByStateItemSchema);

// --- Recipient list ---

export const RecipientListItemSchema = z.object({
  id: z.string().nullable().optional(),
  duns: z.string().nullable().optional(),
  uei: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  recipient_level: z.string().nullable().optional(),
  amount: z.number().nullable().optional(),
}).passthrough();

export const RecipientListResponseSchema = z.object({
  page_metadata: OffsetPageMetaSchema,
  results: z.array(RecipientListItemSchema),
}).passthrough();

// --- Recipient count ---

export const RecipientCountSchema = z.object({
  count: z.number(),
}).passthrough();

// --- Recipient detail ---

export const RecipientDetailSchema = z.object({
  name: z.string().nullable().optional(),
  alternate_names: z.array(z.string()).optional(),
  duns: z.string().nullable().optional(),
  uei: z.string().nullable().optional(),
  recipient_id: z.string().nullable().optional(),
  recipient_level: z.string().nullable().optional(),
  parent_name: z.string().nullable().optional(),
  parent_duns: z.string().nullable().optional(),
  parent_uei: z.string().nullable().optional(),
  parent_id: z.string().nullable().optional(),
  parents: z.array(z.unknown()).optional(),
  business_types: z.array(z.string()).optional(),
  location: z.unknown().optional(),
  total_transaction_amount: z.number().nullable().optional(),
  total_transactions: z.number().nullable().optional(),
}).passthrough();

// --- Recipient children ---

export const RecipientChildSchema = z.object({
  recipient_id: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  duns: z.string().nullable().optional(),
  uei: z.string().nullable().optional(),
  amount: z.number().nullable().optional(),
  state_province: z.string().nullable().optional(),
}).passthrough();

export const RecipientChildrenResponseSchema = z.array(RecipientChildSchema);

// --- State detail ---

export const StateDetailSchema = z.object({
  name: z.string().nullable().optional(),
  code: z.string().nullable().optional(),
  fips: z.string().nullable().optional(),
  type: z.string().nullable().optional(),
  population: z.number().nullable().optional(),
  pop_year: z.number().nullable().optional(),
  pop_source: z.string().nullable().optional(),
  median_household_income: z.number().nullable().optional(),
  mhi_year: z.number().nullable().optional(),
  mhi_source: z.string().nullable().optional(),
  total_prime_amount: z.number().nullable().optional(),
  total_prime_awards: z.number().nullable().optional(),
  total_face_value_loan_amount: z.number().nullable().optional(),
  total_face_value_loan_prime_awards: z.number().nullable().optional(),
  award_amount_per_capita: z.number().nullable().optional(),
  total_outlays: z.number().nullable().optional(),
}).passthrough();

// --- State awards ---

export const StateAwardItemSchema = z.object({
  type: z.string(),
  amount: z.number().nullable().optional(),
  count: z.number().nullable().optional(),
  total_outlays: z.number().nullable().optional(),
}).passthrough();

export const StateAwardsResponseSchema = z.array(StateAwardItemSchema);
