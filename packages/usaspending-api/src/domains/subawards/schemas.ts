import { z } from "zod";
import { offsetPaginatedResponse } from "../../shared-schemas";

// --- Subaward list item ---

export const SubawardItemSchema = z.object({
  id: z.number(),
  subaward_number: z.string(),
  description: z.string().nullable().optional(),
  action_date: z.string().nullable().optional(),
  amount: z.number().nullable().optional(),
  recipient_name: z.string().nullable().optional(),
}).passthrough();

export const SubawardListResponseSchema = offsetPaginatedResponse(SubawardItemSchema);

// --- Transaction item ---

export const TransactionItemSchema = z.object({
  id: z.string(),
  type: z.string().nullable().optional(),
  type_description: z.string().nullable().optional(),
  action_date: z.string().nullable().optional(),
  action_type: z.string().nullable().optional(),
  action_type_description: z.string().nullable().optional(),
  modification_number: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  federal_action_obligation: z.number().nullable().optional(),
  face_value_loan_guarantee: z.number().nullable().optional(),
  original_loan_subsidy_cost: z.number().nullable().optional(),
}).passthrough();

export const TransactionListResponseSchema = offsetPaginatedResponse(TransactionItemSchema);
