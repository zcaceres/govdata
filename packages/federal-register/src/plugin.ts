import type { GovDataPlugin, GovResult } from "govdata-core";
import {
  _searchDocuments,
  _findDocument,
  _findManyDocuments,
  _listAgencies,
  _findAgency,
  _searchPI,
  _currentPI,
  _getFacets,
  _listSuggestedSearches,
} from "./endpoints";
import { describe } from "./describe";
import { FRValidationError } from "./errors";
import type { FacetTypeValue } from "./types";

/**
 * Splits a comma-separated string into an array, or passes through arrays.
 * CLI's parseFlags sends "epa,doe" as a single string.
 */
function splitComma(val: unknown): string[] | undefined {
  if (val == null) return undefined;
  if (Array.isArray(val)) return val.map(String);
  return String(val).split(",").map((s) => s.trim());
}

function toNumber(val: unknown): number | undefined {
  if (val == null) return undefined;
  const n = Number(val);
  return Number.isFinite(n) ? n : undefined;
}

/**
 * Splits a comma-separated string into an array of numbers.
 * CLI sends "145,136" as a string; the API expects number[].
 */
function splitCommaNumbers(val: unknown): number[] | undefined {
  if (val == null) return undefined;
  const parts = Array.isArray(val) ? val : String(val).split(",").map((s) => s.trim());
  const nums = parts.filter((s) => s !== "").map(Number).filter(Number.isFinite);
  return nums.length > 0 ? nums : undefined;
}

async function documents(params?: Record<string, unknown>): Promise<GovResult> {
  return _searchDocuments({
    term: params?.term != null ? String(params.term) : undefined,
    agencies: splitComma(params?.agencies),
    type: splitComma(params?.type) as any,
    significant: params?.significant != null ? (Number(params.significant) as 0 | 1) : undefined,
    publication_date_gte: params?.publication_date_gte != null ? String(params.publication_date_gte) : undefined,
    publication_date_lte: params?.publication_date_lte != null ? String(params.publication_date_lte) : undefined,
    effective_date_gte: params?.effective_date_gte != null ? String(params.effective_date_gte) : undefined,
    effective_date_lte: params?.effective_date_lte != null ? String(params.effective_date_lte) : undefined,
    comment_date_gte: params?.comment_date_gte != null ? String(params.comment_date_gte) : undefined,
    comment_date_lte: params?.comment_date_lte != null ? String(params.comment_date_lte) : undefined,
    comment_date_is: params?.comment_date_is != null ? String(params.comment_date_is) : undefined,
    signing_date_gte: params?.signing_date_gte != null ? String(params.signing_date_gte) : undefined,
    signing_date_lte: params?.signing_date_lte != null ? String(params.signing_date_lte) : undefined,
    signing_date_is: params?.signing_date_is != null ? String(params.signing_date_is) : undefined,
    publication_date_is: params?.publication_date_is != null ? String(params.publication_date_is) : undefined,
    effective_date_is: params?.effective_date_is != null ? String(params.effective_date_is) : undefined,
    presidential_document_type: splitComma(params?.presidential_document_type),
    president: splitComma(params?.president),
    docket_id: splitComma(params?.docket_id),
    regulation_id_number: splitComma(params?.regulation_id_number),
    sections: splitComma(params?.sections),
    topics: splitComma(params?.topics),
    fields: splitComma(params?.fields),
    agency_ids: splitCommaNumbers(params?.agency_ids),
    order: params?.order != null ? String(params.order) as any : undefined,
    per_page: toNumber(params?.per_page),
    page: toNumber(params?.page),
  });
}

async function document(params?: Record<string, unknown>): Promise<GovResult> {
  if (!params?.document_number) {
    throw new FRValidationError("document_number", params?.document_number, "required string");
  }
  const docNum = String(params.document_number);
  return _findDocument(docNum, {
    fields: splitComma(params?.fields),
  });
}

async function documents_multi(params?: Record<string, unknown>): Promise<GovResult> {
  if (!params?.document_numbers) {
    throw new FRValidationError("document_numbers", params?.document_numbers, "required comma-separated string");
  }
  const nums = String(params.document_numbers).split(",").map((s) => s.trim());
  return _findManyDocuments(nums, {
    fields: splitComma(params?.fields),
  });
}

async function agencies(): Promise<GovResult> {
  return _listAgencies();
}

async function agency(params?: Record<string, unknown>): Promise<GovResult> {
  if (params?.id == null) {
    throw new FRValidationError("id", params?.id, "required number");
  }
  const id = Number(params.id);
  return _findAgency(id);
}

async function public_inspection(params?: Record<string, unknown>): Promise<GovResult> {
  return _searchPI({
    term: params?.term != null ? String(params.term) : undefined,
    agencies: splitComma(params?.agencies),
    type: splitComma(params?.type) as any,
    agency_ids: splitCommaNumbers(params?.agency_ids),
    per_page: toNumber(params?.per_page),
    page: toNumber(params?.page),
  });
}

async function public_inspection_current(): Promise<GovResult> {
  return _currentPI();
}

async function facets(params?: Record<string, unknown>): Promise<GovResult> {
  if (!params?.facet_type) {
    throw new FRValidationError("facet_type", params?.facet_type, "required string (agency, daily, topic, section, type)");
  }
  const facetType = String(params.facet_type) as FacetTypeValue;
  const conditions: Record<string, unknown> = {};
  if (params?.term != null) conditions.term = String(params.term);
  if (params?.agencies != null) conditions.agencies = splitComma(params.agencies);
  if (params?.type != null) conditions.type = splitComma(params.type);
  if (params?.significant != null) conditions.significant = Number(params.significant);
  for (const dateKey of [
    "publication_date_gte", "publication_date_lte", "publication_date_is",
    "effective_date_gte", "effective_date_lte", "effective_date_is",
    "comment_date_gte", "comment_date_lte", "comment_date_is",
    "signing_date_gte", "signing_date_lte", "signing_date_is",
  ]) {
    if (params?.[dateKey] != null) conditions[dateKey] = String(params[dateKey]);
  }
  if (params?.presidential_document_type != null) conditions.presidential_document_type = splitComma(params.presidential_document_type);
  if (params?.president != null) conditions.president = splitComma(params.president);
  if (params?.docket_id != null) conditions.docket_id = splitComma(params.docket_id);
  if (params?.regulation_id_number != null) conditions.regulation_id_number = splitComma(params.regulation_id_number);
  if (params?.sections != null) conditions.sections = splitComma(params.sections);
  if (params?.topics != null) conditions.topics = splitComma(params.topics);
  if (params?.agency_ids != null) conditions.agency_ids = splitCommaNumbers(params.agency_ids);
  return _getFacets(facetType, Object.keys(conditions).length > 0 ? conditions as any : undefined);
}

async function suggested_searches(): Promise<GovResult> {
  return _listSuggestedSearches();
}

export const federalRegisterPlugin: GovDataPlugin = {
  prefix: "federal-register",
  describe,
  endpoints: {
    documents,
    document,
    documents_multi,
    agencies,
    agency,
    public_inspection,
    public_inspection_current,
    facets,
    suggested_searches,
  },
};
