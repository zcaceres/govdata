import type { Meta } from "./types";

export interface GovResult<K extends string = string> {
  readonly data: unknown;
  readonly meta: Meta | null;
  readonly kind: K;
  toMarkdown(): string;
  toCSV(): string;
  summary(): string;
}

export function escapeCSV(value: unknown): string {
  const str = value == null ? "" : String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function escapeMarkdownCell(value: unknown): string {
  if (value == null) return "";
  return String(value).replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

export function arrayToMarkdownTable(items: Record<string, unknown>[]): string {
  if (items.length === 0) return "(no data)";
  const keys = Object.keys(items[0]);
  const header = `| ${keys.join(" | ")} |`;
  const separator = `| ${keys.map(() => "---").join(" | ")} |`;
  const rows = items.map(
    (item) => `| ${keys.map((k) => escapeMarkdownCell(item[k])).join(" | ")} |`,
  );
  return [header, separator, ...rows].join("\n");
}

export function arrayToCSV(items: Record<string, unknown>[]): string {
  if (items.length === 0) return "";
  const keys = Object.keys(items[0]);
  const header = keys.map(escapeCSV).join(",");
  const rows = items.map(
    (item) => keys.map((k) => escapeCSV(item[k])).join(","),
  );
  return [header, ...rows].join("\n");
}

export function createResult<K extends string>(
  data: unknown,
  meta: Meta | null,
  kind: K,
): GovResult<K> {
  return {
    data,
    meta,
    kind,
    toMarkdown(): string {
      if (data && typeof data === "object" && !Array.isArray(data)) {
        const sections: string[] = [];
        for (const [key, arr] of Object.entries(data as Record<string, unknown[]>)) {
          if (Array.isArray(arr)) {
            sections.push(`### ${key}\n\n${arrayToMarkdownTable(arr as Record<string, unknown>[])}`);
          }
        }
        if (sections.length > 0) return sections.join("\n\n");
      }
      return arrayToMarkdownTable(data as Record<string, unknown>[]);
    },
    toCSV(): string {
      if (data && typeof data === "object" && !Array.isArray(data)) {
        const sections: string[] = [];
        for (const [key, arr] of Object.entries(data as Record<string, unknown[]>)) {
          if (Array.isArray(arr)) {
            sections.push(`# ${key}\n${arrayToCSV(arr as Record<string, unknown>[])}`);
          }
        }
        if (sections.length > 0) return sections.join("\n\n");
      }
      return arrayToCSV(data as Record<string, unknown>[]);
    },
    summary(): string {
      if (data && typeof data === "object" && !Array.isArray(data)) {
        const entries = Object.entries(data as Record<string, unknown[]>);
        const allArrays = entries.length > 0 && entries.every(([, v]) => Array.isArray(v));
        if (allArrays) {
          const parts = entries.map(([k, v]) => `${(v as unknown[]).length} ${k}`);
          return `${kind}: ${parts.join(", ")}`;
        }
      }
      const items = data as unknown[];
      if (!meta) return `${kind}: ${items.length} results`;
      return `${kind}: ${items.length} of ${meta.total_results} results (${meta.pages} pages)`;
    },
  };
}
