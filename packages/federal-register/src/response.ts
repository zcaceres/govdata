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

export function wrapResponse(data: FacetsResponse, meta: null, kind: "facets"): FRResult<"facets">;
export function wrapResponse(data: SuggestedSearchesResponse, meta: null, kind: "suggested_searches"): FRResult<"suggested_searches">;
export function wrapResponse<K extends Exclude<EndpointKind, "facets" | "suggested_searches">>(data: KindDataMap[K], meta: Meta | null, kind: K): FRResult<K>;
export function wrapResponse(data: unknown, meta: Meta | null, kind: EndpointKind): FRResult {
  if (kind === "facets") {
    return buildFacetsResult(data as FacetsResponse);
  }
  if (kind === "suggested_searches") {
    return buildSuggestedSearchesResult(data as SuggestedSearchesResponse);
  }
  return createResult(data, meta, kind) as FRResult;
}

function buildFacetsResult(data: FacetsResponse): FRResult<"facets"> {
  return {
    data,
    meta: null,
    kind: "facets",
    summary() {
      return `facets: ${Object.keys(data).length} entries`;
    },
    toMarkdown() {
      const entries = Object.entries(data);
      if (entries.length === 0) return "(no data)";
      const header = "| slug | name | count |";
      const separator = "| --- | --- | --- |";
      const rows = entries.map(([slug, entry]) => `| ${slug} | ${entry.name} | ${entry.count} |`);
      return [header, separator, ...rows].join("\n");
    },
    toCSV() {
      const entries = Object.entries(data);
      if (entries.length === 0) return "";
      const rows = entries.map(([slug, entry]) => `${escapeCSV(slug)},${escapeCSV(entry.name)},${escapeCSV(entry.count)}`);
      return ["slug,name,count", ...rows].join("\n");
    },
  };
}

function buildSuggestedSearchesResult(data: SuggestedSearchesResponse): FRResult<"suggested_searches"> {
  return {
    data,
    meta: null,
    kind: "suggested_searches",
    summary() {
      const total = Object.values(data).reduce((sum, arr) => sum + arr.length, 0);
      return `suggested_searches: ${total} searches across ${Object.keys(data).length} sections`;
    },
    toMarkdown() {
      const entries = Object.entries(data);
      if (entries.length === 0) return "(no data)";
      const parts = entries.map(([section, items]) => {
        const header = "| slug | title | docs_last_year | open_comments |";
        const sep = "| --- | --- | --- | --- |";
        const rows = items.map(
          (s) => `| ${s.slug} | ${s.title} | ${s.documents_in_last_year} | ${s.documents_with_open_comment_periods} |`,
        );
        return `### ${section}\n\n${[header, sep, ...rows].join("\n")}`;
      });
      return parts.join("\n\n");
    },
    toCSV() {
      const entries = Object.entries(data);
      if (entries.length === 0) return "";
      const parts = entries.map(([section, items]) => {
        const rows = items.map(
          (s) => `${escapeCSV(s.slug)},${escapeCSV(s.title)},${s.documents_in_last_year},${s.documents_with_open_comment_periods}`,
        );
        return `# ${section}\nslug,title,docs_last_year,open_comments\n${rows.join("\n")}`;
      });
      return parts.join("\n\n");
    },
  };
}
