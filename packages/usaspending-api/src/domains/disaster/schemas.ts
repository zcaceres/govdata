import { z } from "zod";
import { OffsetPageMetaSchema } from "../../shared-schemas";

// --- Count ---

export const DisasterCountSchema = z.object({
  count: z.number(),
}).passthrough();

// --- Overview ---

export const DisasterFundingItemSchema = z.object({
  def_code: z.string(),
  amount: z.number(),
}).passthrough();

export const DisasterSpendingSummarySchema = z.object({
  award_obligations: z.number(),
  award_outlays: z.number(),
  total_obligations: z.number(),
  total_outlays: z.number(),
}).passthrough();

export const DisasterOverviewSchema = z.object({
  funding: z.array(DisasterFundingItemSchema),
  total_budget_authority: z.number(),
  spending: DisasterSpendingSummarySchema,
  additional: z.unknown().nullable().optional(),
}).passthrough();

// --- Award Amount ---

export const DisasterAwardAmountSchema = z.object({
  award_count: z.number(),
  obligation: z.number(),
  outlay: z.number(),
}).passthrough();

// --- Paginated spending items (agency, federal_account, object_class, recipient) ---

export const DisasterSpendingChildSchema = z.object({
  id: z.union([z.number(), z.string(), z.null()]),
  code: z.string(),
  description: z.string(),
  award_count: z.number().nullable().optional(),
  obligation: z.number(),
  outlay: z.number(),
  total_budgetary_resources: z.number().nullable().optional(),
  face_value_of_loan: z.number().nullable().optional(),
}).passthrough();

export const DisasterSpendingItemSchema = z.object({
  id: z.union([z.number(), z.string(), z.array(z.string()), z.null()]),
  code: z.string(),
  description: z.string(),
  award_count: z.number().nullable().optional(),
  obligation: z.number(),
  outlay: z.number(),
  total_budgetary_resources: z.number().nullable().optional(),
  children: z.array(DisasterSpendingChildSchema).optional(),
}).passthrough();

export const DisasterSpendingTotalsSchema = z.object({
  obligation: z.number(),
  outlay: z.number(),
  total_budgetary_resources: z.number().nullable().optional(),
  award_count: z.number().nullable().optional(),
}).passthrough();

export const DisasterSpendingResponseSchema = z.object({
  totals: DisasterSpendingTotalsSchema,
  results: z.array(DisasterSpendingItemSchema),
  page_metadata: OffsetPageMetaSchema,
  messages: z.array(z.unknown()).optional(),
}).passthrough();

// --- Paginated loan items (agency-loans, cfda-loans, etc.) ---

export const DisasterLoanItemSchema = z.object({
  id: z.union([z.number(), z.string(), z.array(z.string()), z.null()]),
  code: z.string(),
  description: z.string(),
  award_count: z.number().nullable().optional(),
  obligation: z.number(),
  outlay: z.number(),
  face_value_of_loan: z.number().nullable().optional(),
  children: z.array(DisasterSpendingChildSchema).optional(),
}).passthrough();

export const DisasterLoanTotalsSchema = z.object({
  obligation: z.number(),
  outlay: z.number(),
  award_count: z.number().nullable().optional(),
  face_value_of_loan: z.number().nullable().optional(),
}).passthrough();

export const DisasterLoanResponseSchema = z.object({
  totals: DisasterLoanTotalsSchema,
  results: z.array(DisasterLoanItemSchema),
  page_metadata: OffsetPageMetaSchema,
  messages: z.array(z.unknown()).optional(),
}).passthrough();

// --- CFDA spending items (have extra fields) ---

export const DisasterCfdaItemSchema = z.object({
  id: z.union([z.number(), z.string(), z.array(z.string()), z.null()]),
  code: z.string(),
  description: z.string(),
  award_count: z.number().nullable().optional(),
  obligation: z.number(),
  outlay: z.number(),
  resource_link: z.string().nullable().optional(),
  cfda_federal_agency: z.string().nullable().optional(),
  cfda_objectives: z.string().nullable().optional(),
  cfda_website: z.string().nullable().optional(),
  applicant_eligibility: z.string().nullable().optional(),
  beneficiary_eligibility: z.string().nullable().optional(),
  face_value_of_loan: z.number().nullable().optional(),
}).passthrough();

export const DisasterCfdaResponseSchema = z.object({
  totals: DisasterSpendingTotalsSchema,
  results: z.array(DisasterCfdaItemSchema),
  page_metadata: OffsetPageMetaSchema,
  messages: z.array(z.unknown()).optional(),
}).passthrough();

export const DisasterCfdaLoanResponseSchema = z.object({
  totals: DisasterLoanTotalsSchema,
  results: z.array(DisasterCfdaItemSchema),
  page_metadata: OffsetPageMetaSchema,
  messages: z.array(z.unknown()).optional(),
}).passthrough();

// --- Spending by geography ---

export const DisasterGeoItemSchema = z.object({
  amount: z.number(),
  display_name: z.string().nullable().optional(),
  shape_code: z.string().nullable().optional(),
  population: z.number().nullable().optional(),
  per_capita: z.number().nullable().optional(),
  award_count: z.number().nullable().optional(),
}).passthrough();

export const DisasterGeoResponseSchema = z.object({
  geo_layer: z.string(),
  spending_type: z.string(),
  scope: z.string(),
  results: z.array(DisasterGeoItemSchema),
}).passthrough();
