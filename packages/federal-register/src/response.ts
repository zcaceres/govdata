import { createResult } from "govdata-core";
import type { GovResult, Meta } from "govdata-core";
import type { Document, Agency, PIDocument, FacetsResponse, SuggestedSearchesResponse } from "./types";

export type EndpointKind =
  | "documents"
  | "document"
  | "documents_multi"
  | "agencies"
  | "agency"
  | "public_inspection"
  | "public_inspection_current"
  | "facets"
  | "suggested_searches";

export interface KindDataMap {
  documents: Document[];
  document: Document[];
  documents_multi: Document[];
  agencies: Agency[];
  agency: Agency[];
  public_inspection: PIDocument[];
  public_inspection_current: PIDocument[];
  facets: FacetsResponse;
  suggested_searches: SuggestedSearchesResponse;
}

export interface FRResult<K extends EndpointKind = EndpointKind> extends GovResult<K> {
  readonly data: KindDataMap[K];
  readonly meta: Meta | null;
}

export function wrapResponse<K extends EndpointKind>(
  data: KindDataMap[K],
  meta: Meta | null,
  kind: K,
): FRResult<K> {
  const result = createResult(data, meta, kind) as FRResult<K>;

  // Custom summary for facets (Record<string, {count, name}> shape)
  if (kind === "facets") {
    (result as any).summary = () => {
      const facets = data as FacetsResponse;
      const count = Object.keys(facets).length;
      return `facets: ${count} entries`;
    };
  }

  // Custom summary for suggested_searches (Record<string, SuggestedSearch[]>)
  if (kind === "suggested_searches") {
    (result as any).summary = () => {
      const sections = data as SuggestedSearchesResponse;
      const total = Object.values(sections).reduce((sum, arr) => sum + arr.length, 0);
      return `suggested_searches: ${total} searches across ${Object.keys(sections).length} sections`;
    };
  }

  return result;
}
