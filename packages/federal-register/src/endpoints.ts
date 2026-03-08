import { z } from "zod";
import {
  DocumentSearchParamsSchema,
  PISearchParamsSchema,
  FacetType,
  DocumentSearchResponseSchema,
  SingleDocumentResponseSchema,
  MultiDocumentResponseSchema,
  AgenciesResponseSchema,
  SingleAgencyResponseSchema,
  PISearchResponseSchema,
  PICurrentResponseSchema,
  FacetsResponseSchema,
  SuggestedSearchesResponseSchema,
} from "./schemas";
import type {
  DocumentSearchParams,
  PISearchParams,
  FacetTypeValue,
} from "./types";
import type { ClientOptions } from "govdata-core";
import { FRValidationError } from "./errors";
import { frGet } from "./client";
import { wrapResponse } from "./response";
import type { FRResult } from "./response";

function validateParams<T>(schema: z.ZodType<T>, params: Record<string, unknown>): T {
  try {
    return schema.parse(params);
  } catch (err) {
    if (err instanceof z.ZodError) {
      const issue = err.issues[0];
      const field = issue.path.join(".");
      const expected = issue.message;
      throw new FRValidationError(field, (params as any)?.[field], expected);
    }
    throw err;
  }
}

// --- Document endpoints ---

export async function _searchDocuments(
  params?: DocumentSearchParams,
  options?: ClientOptions,
): Promise<FRResult<"documents">> {
  const validated = params ? validateParams(DocumentSearchParamsSchema, params) : undefined;
  const raw = await frGet("/documents.json", DocumentSearchResponseSchema, validated, options);
  return wrapResponse(
    raw.results,
    { total_results: raw.count, pages: raw.total_pages },
    "documents",
  );
}

export async function _findDocument(
  documentNumber: string,
  params?: { fields?: string[] },
  options?: ClientOptions,
): Promise<FRResult<"document">> {
  const queryParams = params?.fields ? { fields: params.fields } : undefined;
  const raw = await frGet(
    `/documents/${encodeURIComponent(documentNumber)}.json`,
    SingleDocumentResponseSchema,
    queryParams,
    options,
  );
  return wrapResponse([raw], null, "document");
}

const MAX_PATH_LENGTH = 1800;

async function _findManyDocumentsBatch(
  documentNumbers: string[],
  params?: { fields?: string[] },
  options?: ClientOptions,
): Promise<FRResult<"documents_multi">> {
  const joined = documentNumbers.map(encodeURIComponent).join(",");
  const queryParams = params?.fields ? { fields: params.fields } : undefined;
  const raw = await frGet(
    `/documents/${joined}.json`,
    MultiDocumentResponseSchema,
    queryParams,
    options,
  );
  return wrapResponse(raw.results, null, "documents_multi");
}

export async function _findManyDocuments(
  documentNumbers: string[],
  params?: { fields?: string[] },
  options?: ClientOptions,
): Promise<FRResult<"documents_multi">> {
  // Batch document numbers into chunks that fit in URL
  const batches: string[][] = [];
  let currentBatch: string[] = [];
  let currentLength = 0;

  for (const num of documentNumbers) {
    const encoded = encodeURIComponent(num);
    const addedLength = currentLength === 0 ? encoded.length : encoded.length + 1; // +1 for comma
    if (currentLength + addedLength > MAX_PATH_LENGTH && currentBatch.length > 0) {
      batches.push(currentBatch);
      currentBatch = [num];
      currentLength = encoded.length;
    } else {
      currentBatch.push(num);
      currentLength += addedLength;
    }
  }
  if (currentBatch.length > 0) batches.push(currentBatch);

  // Single batch — no batching overhead
  if (batches.length === 1) {
    return _findManyDocumentsBatch(batches[0], params, options);
  }

  // Multiple batches — fetch in parallel, merge results
  const results = await Promise.all(
    batches.map(batch => _findManyDocumentsBatch(batch, params, options)),
  );
  const allDocs = results.flatMap(r => r.data);
  return wrapResponse(allDocs, null, "documents_multi");
}

// --- Agency endpoints ---

export async function _listAgencies(
  options?: ClientOptions,
): Promise<FRResult<"agencies">> {
  const raw = await frGet("/agencies.json", AgenciesResponseSchema, undefined, options);
  return wrapResponse(raw, null, "agencies");
}

export async function _findAgency(
  id: number | string,
  options?: ClientOptions,
): Promise<FRResult<"agency">> {
  const raw = await frGet(
    `/agencies/${encodeURIComponent(String(id))}.json`,
    SingleAgencyResponseSchema,
    undefined,
    options,
  );
  return wrapResponse([raw], null, "agency");
}

// --- Public Inspection endpoints ---

export async function _searchPI(
  params?: PISearchParams,
  options?: ClientOptions,
): Promise<FRResult<"public_inspection">> {
  const validated = params ? validateParams(PISearchParamsSchema, params) : undefined;
  const raw = await frGet(
    "/public-inspection-documents.json",
    PISearchResponseSchema,
    validated,
    options,
  );
  return wrapResponse(
    raw.results,
    { total_results: raw.count, pages: raw.total_pages },
    "public_inspection",
  );
}

export async function _currentPI(
  options?: ClientOptions,
): Promise<FRResult<"public_inspection_current">> {
  const raw = await frGet(
    "/public-inspection-documents/current.json",
    PICurrentResponseSchema,
    undefined,
    options,
  );
  return wrapResponse(raw.results, null, "public_inspection_current");
}

// --- Facets ---

export async function _getFacets(
  facetType: FacetTypeValue,
  conditions?: Omit<DocumentSearchParams, "fields" | "per_page" | "page" | "order">,
  options?: ClientOptions,
): Promise<FRResult<"facets">> {
  FacetType.parse(facetType);
  // Validate conditions if provided — strip pagination/fields/order keys
  let validated = conditions
    ? validateParams(DocumentSearchParamsSchema, { ...conditions } as Record<string, unknown>)
    : undefined;
  if (validated) {
    const { fields, per_page, page, order, ...rest } = validated;
    validated = rest as typeof validated;
  }
  const raw = await frGet(
    `/documents/facets/${encodeURIComponent(facetType)}`,
    FacetsResponseSchema,
    validated,
    options,
  );
  return wrapResponse(raw, null, "facets");
}

// --- Suggested Searches ---

export async function _listSuggestedSearches(
  options?: ClientOptions,
): Promise<FRResult<"suggested_searches">> {
  const raw = await frGet(
    "/suggested_searches.json",
    SuggestedSearchesResponseSchema,
    undefined,
    options,
  );
  return wrapResponse(raw, null, "suggested_searches");
}
