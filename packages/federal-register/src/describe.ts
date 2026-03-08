import type { ParamDescription, EndpointDescription } from "govdata-core";
import { DocumentType, OrderDirection, FacetType } from "./schemas";

export type { ParamDescription, EndpointDescription };

const paginationParams: ParamDescription[] = [
  { name: "page", type: "number", required: false },
  { name: "per_page", type: "number", required: false },
];

const documentSearchParams: ParamDescription[] = [
  { name: "term", type: "string", required: false },
  { name: "agencies", type: "string", required: false },
  { name: "type", type: "string", required: false, values: DocumentType.options as unknown as string[] },
  { name: "significant", type: "string", required: false, values: ["0", "1"] },
  { name: "publication_date_gte", type: "string", required: false },
  { name: "publication_date_lte", type: "string", required: false },
  { name: "effective_date_gte", type: "string", required: false },
  { name: "effective_date_lte", type: "string", required: false },
  { name: "comment_date_gte", type: "string", required: false },
  { name: "comment_date_lte", type: "string", required: false },
  { name: "comment_date_is", type: "string", required: false },
  { name: "signing_date_gte", type: "string", required: false },
  { name: "signing_date_lte", type: "string", required: false },
  { name: "signing_date_is", type: "string", required: false },
  { name: "publication_date_is", type: "string", required: false },
  { name: "effective_date_is", type: "string", required: false },
  { name: "presidential_document_type", type: "string", required: false },
  { name: "president", type: "string", required: false },
  { name: "docket_id", type: "string", required: false },
  { name: "regulation_id_number", type: "string", required: false },
  { name: "sections", type: "string", required: false },
  { name: "topics", type: "string", required: false },
  { name: "fields", type: "string", required: false },
  { name: "agency_ids", type: "string", required: false },
  { name: "order", type: "string", required: false, values: OrderDirection.options as unknown as string[] },
  ...paginationParams,
];

const piSearchParams: ParamDescription[] = [
  { name: "term", type: "string", required: false },
  { name: "agencies", type: "string", required: false },
  { name: "type", type: "string", required: false, values: DocumentType.options as unknown as string[] },
  { name: "agency_ids", type: "string", required: false },
  ...paginationParams,
];

const endpoints: EndpointDescription[] = [
  {
    name: "documents",
    path: "/documents.json",
    description: "Search Federal Register documents (rules, proposed rules, notices, presidential documents)",
    params: documentSearchParams,
    responseFields: [
      "document_number", "title", "type", "abstract", "agencies",
      "publication_date", "effective_on", "citation", "html_url", "pdf_url",
    ],
  },
  {
    name: "document",
    path: "/documents/{document_number}.json",
    description: "Get a single Federal Register document by document number",
    params: [
      { name: "document_number", type: "string", required: true },
      { name: "fields", type: "string", required: false },
    ],
    responseFields: [
      "document_number", "title", "type", "abstract", "action", "agencies",
      "publication_date", "effective_on", "citation", "html_url", "pdf_url",
    ],
  },
  {
    name: "documents_multi",
    path: "/documents/{numbers}.json",
    description: "Get multiple Federal Register documents by document numbers (comma-separated)",
    params: [
      { name: "document_numbers", type: "string", required: true },
      { name: "fields", type: "string", required: false },
    ],
    responseFields: [
      "document_number", "title", "type", "abstract", "agencies",
      "publication_date", "html_url",
    ],
  },
  {
    name: "agencies",
    path: "/agencies.json",
    description: "List all Federal Register agencies",
    params: [],
    responseFields: ["id", "name", "short_name", "slug", "description", "url", "parent_id"],
  },
  {
    name: "agency",
    path: "/agencies/{id}.json",
    description: "Get a single agency by numeric ID",
    params: [
      { name: "id", type: "number", required: true },
    ],
    responseFields: ["id", "name", "short_name", "slug", "description", "url", "parent_id", "child_ids"],
  },
  {
    name: "public_inspection",
    path: "/public-inspection-documents.json",
    description: "Search public inspection documents",
    params: piSearchParams,
    responseFields: [
      "document_number", "title", "type", "agencies", "filed_at",
      "filing_type", "num_pages", "pdf_url", "publication_date",
    ],
  },
  {
    name: "public_inspection_current",
    path: "/public-inspection-documents/current.json",
    description: "Get documents currently on public inspection",
    params: [],
    responseFields: [
      "document_number", "title", "type", "agencies", "filed_at",
      "filing_type", "num_pages", "pdf_url", "publication_date",
    ],
  },
  {
    name: "facets",
    path: "/documents/facets/{facet_type}",
    description: "Get aggregated facet counts for documents (by agency, daily, topic, section, or type)",
    params: [
      { name: "facet_type", type: "string", required: true, values: FacetType.options as unknown as string[] },
      { name: "term", type: "string", required: false },
      { name: "agencies", type: "string", required: false },
      { name: "publication_date_gte", type: "string", required: false },
      { name: "publication_date_lte", type: "string", required: false },
    ],
    responseFields: ["slug", "count", "name"],
  },
  {
    name: "suggested_searches",
    path: "/suggested_searches.json",
    description: "Get curated suggested search topics",
    params: [],
    responseFields: ["slug", "title", "section", "description", "documents_in_last_year"],
  },
];

export function describe(): { endpoints: EndpointDescription[] } {
  return { endpoints };
}
