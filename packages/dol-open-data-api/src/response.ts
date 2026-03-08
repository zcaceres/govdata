import type { DataResponse } from "./schemas.js";

export interface AgentHelpers {
  readonly data: Record<string, unknown>[];
  readonly agency: string;
  readonly endpoint: string;
  toMarkdown(): string;
  toCSV(): string;
  summary(): string;
}

export type DOLResult = DataResponse & AgentHelpers;

function escapeCSV(value: unknown): string {
  const str = value == null ? "" : String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function collectKeys(items: Record<string, unknown>[]): string[] {
  const seen = new Set<string>();
  for (const item of items) {
    for (const key of Object.keys(item)) {
      seen.add(key);
    }
  }
  return [...seen];
}

export function arrayToMarkdownTable(items: Record<string, unknown>[]): string {
  if (items.length === 0) return "(no data)";
  const keys = collectKeys(items);
  const header = `| ${keys.join(" | ")} |`;
  const separator = `| ${keys.map(() => "---").join(" | ")} |`;
  const rows = items.map(
    (item) => `| ${keys.map((k) => item[k] == null ? "" : String(item[k])).join(" | ")} |`,
  );
  return [header, separator, ...rows].join("\n");
}

export function arrayToCSV(items: Record<string, unknown>[]): string {
  if (items.length === 0) return "";
  const keys = collectKeys(items);
  const header = keys.map(escapeCSV).join(",");
  const rows = items.map(
    (item) => keys.map((k) => escapeCSV(item[k])).join(","),
  );
  return [header, ...rows].join("\n");
}

export function wrapResponse(raw: DataResponse, agency: string, endpoint: string): DOLResult {
  return Object.assign({}, raw, {
    agency,
    endpoint,
    toMarkdown(): string {
      return arrayToMarkdownTable(raw.data);
    },
    toCSV(): string {
      return arrayToCSV(raw.data);
    },
    summary(): string {
      const keys = collectKeys(raw.data);
      const cols = keys.length > 8
        ? keys.slice(0, 8).join(", ") + ", ..."
        : keys.join(", ");
      return `${agency}/${endpoint}: ${raw.data.length} rows, ${keys.length} columns (${cols})`;
    },
  });
}
