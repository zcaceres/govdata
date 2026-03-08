import { z } from "zod";
import { OffsetPageMetaSchema } from "../../shared-schemas";

// --- List federal accounts ---

export const FederalAccountListItemSchema = z.object({
  agency_identifier: z.string().nullable().optional(),
  account_id: z.number().nullable().optional(),
  account_name: z.string().nullable().optional(),
  account_number: z.string().nullable().optional(),
  budgetary_resources: z.number().nullable().optional(),
  managing_agency: z.string().nullable().optional(),
  managing_agency_acronym: z.string().nullable().optional(),
}).passthrough();

/** The list endpoint uses inline pagination fields (not page_metadata wrapper) */
export const FederalAccountListResponseSchema = z.object({
  count: z.number().nullable().optional(),
  limit: z.number().nullable().optional(),
  page: z.number().nullable().optional(),
  fy: z.string().nullable().optional(),
  keyword: z.string().nullable().optional(),
  next: z.number().nullable().optional(),
  previous: z.number().nullable().optional(),
  hasNext: z.boolean(),
  hasPrevious: z.boolean(),
  results: z.array(FederalAccountListItemSchema),
}).passthrough();

// --- Detail ---

const TreasuryAccountChildSchema = z.object({
  account_number: z.string().nullable().optional(),
  account_name: z.string().nullable().optional(),
  account_title: z.string().nullable().optional(),
  tas_rendering_label: z.string().nullable().optional(),
  total_obligated_amount: z.number().nullable().optional(),
  total_gross_outlay_amount: z.number().nullable().optional(),
  total_budgetary_resources: z.number().nullable().optional(),
}).passthrough();

export const FederalAccountDetailSchema = z.object({
  fiscal_year: z.number().nullable().optional(),
  id: z.number().nullable().optional(),
  agency_identifier: z.string().nullable().optional(),
  main_account_code: z.string().nullable().optional(),
  account_title: z.string().nullable().optional(),
  federal_account_code: z.string().nullable().optional(),
  parent_agency_toptier_code: z.string().nullable().optional(),
  parent_agency_name: z.string().nullable().optional(),
  bureau_name: z.string().nullable().optional(),
  bureau_slug: z.string().nullable().optional(),
  total_obligated_amount: z.number().nullable().optional(),
  total_gross_outlay_amount: z.number().nullable().optional(),
  total_budgetary_resources: z.number().nullable().optional(),
  children: z.array(TreasuryAccountChildSchema).optional(),
}).passthrough();

// --- Fiscal year snapshot ---

/** May return empty object `{}` */
export const FiscalYearSnapshotSchema = z.record(z.string(), z.unknown());

// --- Available object classes ---

const MinorObjectClassSchema = z.object({
  id: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
}).passthrough();

export const AvailableObjectClassItemSchema = z.object({
  id: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  minor_object_class: z.array(MinorObjectClassSchema).optional(),
}).passthrough();

export const AvailableObjectClassResponseSchema = z.object({
  results: z.array(AvailableObjectClassItemSchema),
}).passthrough();

// --- Spending by object class ---

export const ObjectClassTotalItemSchema = z.object({
  code: z.string().nullable().optional(),
  obligations: z.number().nullable().optional(),
  name: z.string().nullable().optional(),
}).passthrough();

export const ObjectClassTotalResponseSchema = z.object({
  results: z.array(ObjectClassTotalItemSchema),
  page_metadata: OffsetPageMetaSchema,
}).passthrough();

// --- Spending by program activity ---

export const ProgramActivityItemSchema = z.object({
  code: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  type: z.string().nullable().optional(),
}).passthrough();

export const ProgramActivityResponseSchema = z.object({
  results: z.array(ProgramActivityItemSchema),
  page_metadata: OffsetPageMetaSchema,
}).passthrough();

// --- Spending by program activity / object class (total) ---

export const ProgramActivityTotalItemSchema = z.object({
  code: z.string().nullable().optional(),
  obligations: z.number().nullable().optional(),
  name: z.string().nullable().optional(),
  type: z.string().nullable().optional(),
}).passthrough();

export const ProgramActivityTotalResponseSchema = z.object({
  results: z.array(ProgramActivityTotalItemSchema),
  page_metadata: OffsetPageMetaSchema,
}).passthrough();
