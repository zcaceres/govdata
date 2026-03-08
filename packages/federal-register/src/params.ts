/**
 * Serializes flat params into Federal Register bracket-syntax query strings.
 *
 * Mapping rules:
 * - `term`, `agencies`, `type`, `significant`, `publication_date_*`, `effective_date_*`,
 *   `comment_date_*`, `signing_date_*`, `presidential_document_type`, `president`,
 *   `docket_id`, `regulation_id_number`, `sections`, `topics`, `agency_ids`
 *   → wrapped in `conditions[...]`
 * - Array values → bracket pairs: `conditions[agencies][]=epa&conditions[agencies][]=doe`
 * - `_gte`, `_lte`, `_is` suffixes → nested: `conditions[publication_date][gte]=...`
 * - `fields` → `fields[]=title&fields[]=abstract`
 * - `page`, `per_page`, `order` → top-level (no conditions wrapper)
 */

const TOP_LEVEL_PARAMS = new Set(["page", "per_page", "order"]);

const DATE_SUFFIXES = ["_gte", "_lte", "_is"] as const;
const DATE_PREFIXES = [
  "publication_date",
  "effective_date",
  "comment_date",
  "signing_date",
] as const;

const ARRAY_CONDITIONS = new Set([
  "agencies",
  "type",
  "presidential_document_type",
  "president",
  "sections",
  "topics",
  "agency_ids",
]);

export function serializeParams(params: Record<string, unknown>): string {
  const parts: string[] = [];

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;

    if (TOP_LEVEL_PARAMS.has(key)) {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
      continue;
    }

    if (key === "fields") {
      const fields = Array.isArray(value) ? value : [value];
      for (const f of fields) {
        parts.push(`fields[]=${encodeURIComponent(String(f))}`);
      }
      continue;
    }

    // Check for date range params: publication_date_gte → conditions[publication_date][gte]
    const dateMatch = matchDateParam(key);
    if (dateMatch) {
      parts.push(
        `conditions[${dateMatch.prefix}][${dateMatch.suffix}]=${encodeURIComponent(String(value))}`,
      );
      continue;
    }

    // Array conditions: agencies → conditions[agencies][]=val
    if (ARRAY_CONDITIONS.has(key)) {
      const values = Array.isArray(value) ? value : [value];
      for (const v of values) {
        parts.push(`conditions[${key}][]=${encodeURIComponent(String(v))}`);
      }
      continue;
    }

    // Everything else: conditions[key]=value
    parts.push(`conditions[${key}]=${encodeURIComponent(String(value))}`);
  }

  return parts.join("&");
}

function matchDateParam(
  key: string,
): { prefix: string; suffix: string } | null {
  for (const prefix of DATE_PREFIXES) {
    for (const suffix of DATE_SUFFIXES) {
      if (key === `${prefix}${suffix}`) {
        return { prefix, suffix: suffix.slice(1) }; // Remove leading underscore
      }
    }
  }
  return null;
}
