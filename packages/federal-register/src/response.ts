import { createResult, escapeCSV } from "govdata-core";
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

  // Custom summary/toMarkdown/toCSV for facets (Record<string, {count, name}> shape)
  if (kind === "facets") {
    const facets = data as FacetsResponse;
    (result as any).summary = () => {
      const count = Object.keys(facets).length;
      return `facets: ${count} entries`;
    };
    (result as any).toMarkdown = () => {
      const entries = Object.entries(facets);
      if (entries.length === 0) return "(no data)";
      const header = "| slug | name | count |";
      const separator = "| --- | --- | --- |";
      const rows = entries.map(([slug, entry]) => `| ${slug} | ${entry.name} | ${entry.count} |`);
      return [header, separator, ...rows].join("\n");
    };
    (result as any).toCSV = () => {
      const entries = Object.entries(facets);
      if (entries.length === 0) return "";
      const rows = entries.map(([slug, entry]) => `${escapeCSV(slug)},${escapeCSV(entry.name)},${escapeCSV(entry.count)}`);
      return ["slug,name,count", ...rows].join("\n");
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
