import { z } from "zod";
import { OffsetPageMetaSchema } from "../../shared-schemas";

// --- Toptier agencies ---
export const ToptierAgencyResultSchema = z.object({
  agency_id: z.number(),
  toptier_code: z.string(),
  abbreviation: z.string().nullable().optional(),
  agency_name: z.string(),
  congressional_justification_url: z.string().nullable().optional(),
  active_fy: z.string().nullable().optional(),
  active_fq: z.string().nullable().optional(),
  outlay_amount: z.number().nullable().optional(),
  obligated_amount: z.number().nullable().optional(),
  budget_authority_amount: z.number().nullable().optional(),
  current_total_budget_authority_amount: z.number().nullable().optional(),
  percentage_of_total_budget_authority: z.number().nullable().optional(),
}).passthrough();

export const ToptierAgenciesResponseSchema = z.object({
  results: z.array(ToptierAgencyResultSchema),
}).passthrough();

// --- Single agency reference ---
export const AgencyReferenceResponseSchema = z.object({
  results: z.unknown(),
}).passthrough();

// --- Award types ---
export const AwardTypesResponseSchema = z.object({
  contracts: z.record(z.string(), z.string()).optional(),
  loans: z.record(z.string(), z.string()).optional(),
  idvs: z.record(z.string(), z.string()).optional(),
  grants: z.record(z.string(), z.string()).optional(),
  other_financial_assistance: z.record(z.string(), z.string()).optional(),
  direct_payments: z.record(z.string(), z.string()).optional(),
}).passthrough();

// --- Glossary ---
export const GlossaryResultSchema = z.object({
  term: z.string(),
  slug: z.string().nullable().optional(),
  data_act_term: z.string().nullable().optional(),
  plain: z.string().nullable().optional(),
  official: z.string().nullable().optional(),
}).passthrough();

export const GlossaryResponseSchema = z.object({
  page_metadata: OffsetPageMetaSchema,
  results: z.array(GlossaryResultSchema),
}).passthrough();

// --- DEF codes ---
export const DefCodeSchema = z.object({
  code: z.string(),
  public_law: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  urls: z.array(z.string()).nullable().optional(),
  disaster: z.string().nullable().optional(),
}).passthrough();

export const DefCodesResponseSchema = z.object({
  codes: z.array(DefCodeSchema),
}).passthrough();

// --- NAICS ---
export const NaicsRefResultSchema = z.object({
  naics: z.string(),
  naics_description: z.string().nullable().optional(),
  year_retired: z.number().nullable().optional(),
  count: z.number().nullable().optional(),
  children: z.array(z.unknown()).nullable().optional(),
}).passthrough();

export const NaicsRefResponseSchema = z.object({
  results: z.array(NaicsRefResultSchema),
}).passthrough();

// --- Data dictionary ---
export const DataDictionaryResponseSchema = z.object({
  document: z.object({
    rows: z.array(z.array(z.unknown())),
  }).passthrough(),
}).passthrough();

// --- Filter hash ---
export const FilterHashResponseSchema = z.object({
  hash: z.string(),
}).passthrough();

// --- Filter tree ---
export const FilterTreeResultSchema = z.object({
  id: z.string().nullable().optional(),
  ancestors: z.array(z.string()).optional(),
  description: z.string().nullable().optional(),
  count: z.number().nullable().optional(),
  children: z.unknown().nullable().optional(),
}).passthrough();

export const FilterTreeResponseSchema = z.object({
  results: z.array(FilterTreeResultSchema),
}).passthrough();

// --- Submission periods ---
export const SubmissionPeriodSchema = z.object({
  period_start_date: z.string().nullable().optional(),
  period_end_date: z.string().nullable().optional(),
  submission_start_date: z.string().nullable().optional(),
  submission_due_date: z.string().nullable().optional(),
  certification_due_date: z.string().nullable().optional(),
  submission_reveal_date: z.string().nullable().optional(),
  submission_fiscal_year: z.number().nullable().optional(),
  submission_fiscal_quarter: z.number().nullable().optional(),
  submission_fiscal_month: z.number().nullable().optional(),
  is_quarter: z.boolean().nullable().optional(),
}).passthrough();

export const SubmissionPeriodsResponseSchema = z.object({
  available_periods: z.array(SubmissionPeriodSchema),
}).passthrough();

// --- Total budgetary resources ---
export const TotalBudgetaryResourceResultSchema = z.object({
  fiscal_year: z.number(),
  fiscal_period: z.number(),
  total_budgetary_resources: z.number().nullable().optional(),
}).passthrough();

export const TotalBudgetaryResourcesResponseSchema = z.object({
  results: z.array(TotalBudgetaryResourceResultSchema),
  messages: z.array(z.unknown()).optional(),
}).passthrough();

// --- Assistance listing (CFDA) ---
export const AssistanceListingResultSchema = z.object({
  code: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  count: z.number().nullable().optional(),
}).passthrough();

// CFDA totals
export const CfdaTotalsResponseSchema = z.unknown();
