import { z } from "zod";

// --- Param schemas ---

export const DocumentType = z.enum(["RULE", "PRORULE", "NOTICE", "PRESDOCU"]);
export const OrderDirection = z.enum(["relevance", "newest", "oldest", "executive_order_number"]);

export const DocumentSearchParamsSchema = z.object({
  term: z.string().optional(),
  agencies: z.array(z.string()).optional(),
  type: z.array(DocumentType).optional(),
  significant: z.union([z.boolean(), z.literal(0), z.literal(1)]).optional(),
  publication_date_gte: z.string().optional(),
  publication_date_lte: z.string().optional(),
  publication_date_is: z.string().optional(),
  effective_date_gte: z.string().optional(),
  effective_date_lte: z.string().optional(),
  effective_date_is: z.string().optional(),
  comment_date_gte: z.string().optional(),
  comment_date_lte: z.string().optional(),
  comment_date_is: z.string().optional(),
  signing_date_gte: z.string().optional(),
  signing_date_lte: z.string().optional(),
  signing_date_is: z.string().optional(),
  presidential_document_type: z.array(z.string()).optional(),
  president: z.array(z.string()).optional(),
  docket_id: z.array(z.string()).optional(),
  regulation_id_number: z.array(z.string()).optional(),
  sections: z.array(z.string()).optional(),
  topics: z.array(z.string()).optional(),
  agency_ids: z.array(z.number()).optional(),
  fields: z.array(z.string()).optional(),
  per_page: z.number().int().positive().optional(),
  page: z.number().int().positive().optional(),
  order: OrderDirection.optional(),
}).strict();

export const PISearchParamsSchema = z.object({
  term: z.string().optional(),
  agencies: z.array(z.string()).optional(),
  type: z.array(DocumentType).optional(),
  agency_ids: z.array(z.number()).optional(),
  per_page: z.number().int().positive().optional(),
  page: z.number().int().positive().optional(),
}).strict();

export const FacetType = z.enum(["agency", "daily", "topic", "section", "type"]);

// --- Resource schemas ---

const AgencyRefSchema = z
  .object({
    raw_name: z.string(),
    name: z.string().optional(),
    id: z.number().optional(),
    url: z.string().optional(),
    json_url: z.string().optional(),
    parent_id: z.number().nullable().optional(),
    slug: z.string().optional(),
  })
  .passthrough();

const PageViewsSchema = z
  .object({
    count: z.number(),
    last_updated: z.string(),
  })
  .passthrough();

export const DocumentSchema = z
  .object({
    document_number: z.string(),
    title: z.string().optional(),
    type: z.string().optional(),
    abstract: z.string().nullable().optional(),
    action: z.string().nullable().optional(),
    agencies: z.array(AgencyRefSchema).optional(),
    publication_date: z.string().optional(),
    effective_on: z.string().nullable().optional(),
    citation: z.string().nullable().optional(),
    docket_ids: z.array(z.string()).optional(),
    regulation_id_numbers: z.array(z.string()).optional(),
    topics: z.array(z.string()).optional(),
    significant: z.boolean().nullable().optional(),
    html_url: z.string().optional(),
    pdf_url: z.string().nullable().optional(),
    json_url: z.string().optional(),
    page_views: PageViewsSchema.optional(),
    president: z.unknown().optional(),
    executive_order_number: z.unknown().optional(),
    subtype: z.string().nullable().optional(),
    excerpts: z.string().nullable().optional(),
    start_page: z.number().nullable().optional(),
    end_page: z.number().nullable().optional(),
    volume: z.number().nullable().optional(),

    // URL fields
    body_html_url: z.string().nullable().optional(),
    full_text_xml_url: z.string().nullable().optional(),
    mods_url: z.string().nullable().optional(),
    raw_text_url: z.string().nullable().optional(),
    public_inspection_pdf_url: z.string().nullable().optional(),
    comment_url: z.string().nullable().optional(),
    regulations_dot_gov_url: z.string().nullable().optional(),

    // Date/deadline fields
    signing_date: z.string().nullable().optional(),
    comments_close_on: z.string().nullable().optional(),
    dates: z.string().nullable().optional(),

    // Presidential document fields
    presidential_document_number: z.string().nullable().optional(),
    proclamation_number: z.string().nullable().optional(),
    executive_order_notes: z.string().nullable().optional(),

    // Regulatory/docket fields
    cfr_references: z.array(z.unknown()).optional(),
    dockets: z.array(z.unknown()).optional(),
    regulation_id_number_info: z.record(z.string(), z.unknown()).optional(),
    regulations_dot_gov_info: z.unknown().nullable().optional(),

    // Administrative fields
    correction_of: z.string().nullable().optional(),
    corrections: z.array(z.unknown()).optional(),
    disposition_notes: z.string().nullable().optional(),
    explanation: z.string().nullable().optional(),
    not_received_for_publication: z.boolean().nullable().optional(),
    page_length: z.number().nullable().optional(),
    toc_doc: z.string().nullable().optional(),
    toc_subject: z.string().nullable().optional(),
    images: z.unknown().optional(),
    images_metadata: z.unknown().optional(),
  })
  .passthrough();

export const AgencySchema = z
  .object({
    id: z.number(),
    name: z.string(),
    short_name: z.string().nullable().optional(),
    slug: z.string(),
    description: z.string().nullable().optional(),
    url: z.string().optional(),
    json_url: z.string().optional(),
    parent_id: z.number().nullable().optional(),
    child_ids: z.array(z.number()).optional(),
    child_slugs: z.array(z.string()).optional(),
    agency_url: z.string().nullable().optional(),
    recent_articles_url: z.string().nullable().optional(),
    logo: z.unknown().optional(),
  })
  .passthrough();

export const PIDocumentSchema = z
  .object({
    document_number: z.string(),
    title: z.string(),
    type: z.string(),
    agencies: z.array(AgencyRefSchema).optional(),
    filed_at: z.string().nullable().optional(),
    filing_type: z.string().nullable().optional(),
    num_pages: z.number().nullable().optional(),
    pdf_url: z.string().nullable().optional(),
    publication_date: z.string().nullable().optional(),
    docket_numbers: z.array(z.string()).optional(),
    html_url: z.string().optional(),
    json_url: z.string().optional(),
    page_views: PageViewsSchema.nullable().optional(),
  })
  .passthrough();

const SuggestedSearchSchema = z
  .object({
    slug: z.string(),
    title: z.string(),
    section: z.string(),
    description: z.string(),
    search_conditions: z.record(z.string(), z.unknown()),
    documents_in_last_year: z.number(),
    documents_with_open_comment_periods: z.number(),
    position: z.number(),
  })
  .passthrough();

const FacetEntrySchema = z.object({
  count: z.number(),
  name: z.string(),
});

// --- Response wrappers ---

export const DocumentSearchResponseSchema = z.object({
  count: z.number(),
  total_pages: z.number().optional().default(0),
  next_page_url: z.string().nullable().optional(),
  description: z.string().optional(),
  results: z.array(DocumentSchema).optional().default([]),
});

export const SingleDocumentResponseSchema = DocumentSchema;

export const MultiDocumentResponseSchema = z.object({
  count: z.number(),
  results: z.array(DocumentSchema),
  errors: z.record(z.string(), z.unknown()).optional(),
});

export const AgenciesResponseSchema = z.array(AgencySchema);

export const SingleAgencyResponseSchema = AgencySchema;

export const PISearchResponseSchema = z.object({
  count: z.number(),
  total_pages: z.number().optional().default(0),
  next_page_url: z.string().nullable().optional(),
  description: z.string().optional(),
  results: z.array(PIDocumentSchema).optional().default([]),
});

export const PICurrentResponseSchema = z.object({
  count: z.number(),
  results: z.array(PIDocumentSchema),
  special_filings_updated_at: z.string().nullable().optional(),
  regular_filings_updated_at: z.string().nullable().optional(),
});

export const FacetsResponseSchema = z.record(z.string(), FacetEntrySchema.passthrough());

export const SuggestedSearchesResponseSchema = z.record(
  z.string(),
  z.array(SuggestedSearchSchema.passthrough()),
);
