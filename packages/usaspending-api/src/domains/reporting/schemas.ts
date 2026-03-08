import { z } from "zod";
import { offsetPaginatedResponse } from "../../shared-schemas";

// --- TAS account discrepancies (shared nested object) ---

const TasAccountDiscrepanciesTotalsSchema = z.object({
  gtas_obligation_total: z.number().nullable().optional(),
  tas_accounts_total: z.number().nullable().optional(),
  tas_obligation_not_in_gtas_total: z.number().nullable().optional(),
  missing_tas_accounts_count: z.number().nullable().optional(),
}).passthrough();

// --- Agencies overview (all agencies) ---

export const ReportingAgencyOverviewItemSchema = z.object({
  agency_name: z.string(),
  abbreviation: z.string().nullable().optional(),
  toptier_code: z.string(),
  agency_id: z.number().nullable().optional(),
  current_total_budget_authority_amount: z.number().nullable().optional(),
  recent_publication_date: z.string().nullable().optional(),
  recent_publication_date_certified: z.boolean().nullable().optional(),
  tas_account_discrepancies_totals: TasAccountDiscrepanciesTotalsSchema.nullable().optional(),
  obligation_difference: z.number().nullable().optional(),
  unlinked_contract_award_count: z.number().nullable().optional(),
  unlinked_assistance_award_count: z.number().nullable().optional(),
  assurance_statement_url: z.string().nullable().optional(),
}).passthrough();

export const ReportingAgencyOverviewResponseSchema = offsetPaginatedResponse(ReportingAgencyOverviewItemSchema);

// --- Publish dates ---

const SubmissionDatesSchema = z.object({
  publication_date: z.string().nullable().optional(),
  certification_date: z.string().nullable().optional(),
}).passthrough();

const PublishDatePeriodSchema = z.object({
  period: z.number(),
  quarter: z.number(),
  submission_dates: SubmissionDatesSchema,
  quarterly: z.boolean().nullable().optional(),
}).passthrough();

export const ReportingPublishDatesItemSchema = z.object({
  agency_name: z.string(),
  abbreviation: z.string().nullable().optional(),
  toptier_code: z.string(),
  current_total_budget_authority_amount: z.number().nullable().optional(),
  periods: z.array(PublishDatePeriodSchema),
}).passthrough();

export const ReportingPublishDatesResponseSchema = offsetPaginatedResponse(ReportingPublishDatesItemSchema);

// --- TAS/GTAS differences ---

export const ReportingDifferenceItemSchema = z.unknown();

export const ReportingDifferencesResponseSchema = offsetPaginatedResponse(ReportingDifferenceItemSchema);

// --- TAS discrepancies ---

export const ReportingDiscrepancyItemSchema = z.unknown();

export const ReportingDiscrepanciesResponseSchema = offsetPaginatedResponse(ReportingDiscrepancyItemSchema);

// --- Single agency overview ---

export const ReportingSingleAgencyItemSchema = z.object({
  fiscal_year: z.number().nullable().optional(),
  fiscal_period: z.number().nullable().optional(),
  current_total_budget_authority_amount: z.number().nullable().optional(),
  total_budgetary_resources: z.number().nullable().optional(),
  percent_of_total_budgetary_resources: z.number().nullable().optional(),
  recent_publication_date: z.string().nullable().optional(),
  recent_publication_date_certified: z.boolean().nullable().optional(),
  tas_account_discrepancies_totals: TasAccountDiscrepanciesTotalsSchema.nullable().optional(),
  obligation_difference: z.number().nullable().optional(),
  unlinked_contract_award_count: z.number().nullable().optional(),
  unlinked_assistance_award_count: z.number().nullable().optional(),
  assurance_statement_url: z.string().nullable().optional(),
}).passthrough();

export const ReportingSingleAgencyResponseSchema = offsetPaginatedResponse(ReportingSingleAgencyItemSchema);

// --- Submission history ---

export const SubmissionHistoryItemSchema = z.object({
  publication_date: z.string().nullable().optional(),
  certification_date: z.string().nullable().optional(),
}).passthrough();

export const SubmissionHistoryResponseSchema = offsetPaginatedResponse(SubmissionHistoryItemSchema);

// --- Unlinked awards (assistance + procurement share same shape) ---

export const UnlinkedAwardsSchema = z.object({
  unlinked_file_c_award_count: z.number().nullable().optional(),
  unlinked_file_d_award_count: z.number().nullable().optional(),
  total_linked_award_count: z.number().nullable().optional(),
}).passthrough();
