import type {
  Meta,
  Grant,
  Contract,
  Lease,
  Payment,
  AgencyStat,
  RequestDateStat,
  OrgNameStat,
} from "./types";

export type EndpointKind = "grants" | "contracts" | "leases" | "payments" | "statistics";

export interface KindDataMap {
  grants: Grant[];
  contracts: Contract[];
  leases: Lease[];
  payments: Payment[];
  statistics: {
    agency: AgencyStat[];
    request_date: RequestDateStat[];
    org_names: OrgNameStat[];
  };
}

export interface DogeResult<K extends EndpointKind = EndpointKind> {
  readonly data: KindDataMap[K];
  readonly meta: Meta | null;
  readonly kind: K;
  toMarkdown(): string;
  toCSV(): string;
  summary(): string;
}

function escapeCSV(value: unknown): string {
  const str = value == null ? "" : String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function arrayToMarkdownTable(items: Record<string, unknown>[]): string {
  if (items.length === 0) return "(no data)";
  const keys = Object.keys(items[0]);
  const header = `| ${keys.join(" | ")} |`;
  const separator = `| ${keys.map(() => "---").join(" | ")} |`;
  const rows = items.map(
    (item) => `| ${keys.map((k) => item[k] == null ? "" : String(item[k])).join(" | ")} |`,
  );
  return [header, separator, ...rows].join("\n");
}

function arrayToCSV(items: Record<string, unknown>[]): string {
  if (items.length === 0) return "";
  const keys = Object.keys(items[0]);
  const header = keys.map(escapeCSV).join(",");
  const rows = items.map(
    (item) => keys.map((k) => escapeCSV(item[k])).join(","),
  );
  return [header, ...rows].join("\n");
}

export function wrapResponse<K extends EndpointKind>(
  raw: { result: Record<string, unknown>; meta?: Meta },
  kind: K,
): DogeResult<K> {
  const data = (kind === "statistics"
    ? raw.result
    : raw.result[kind]) as KindDataMap[K];
  const meta: Meta | null = raw.meta ?? null;

  return {
    data,
    meta,
    kind,
    toMarkdown(): string {
      if (kind === "statistics") {
        const sections: string[] = [];
        for (const [key, arr] of Object.entries(data as Record<string, unknown[]>)) {
          sections.push(`### ${key}\n\n${arrayToMarkdownTable(arr as Record<string, unknown>[])}`);
        }
        return sections.join("\n\n");
      }
      return arrayToMarkdownTable(data as Record<string, unknown>[]);
    },
    toCSV(): string {
      if (kind === "statistics") {
        const sections: string[] = [];
        for (const [key, arr] of Object.entries(data as Record<string, unknown[]>)) {
          sections.push(`# ${key}\n${arrayToCSV(arr as Record<string, unknown>[])}`);
        }
        return sections.join("\n\n");
      }
      return arrayToCSV(data as Record<string, unknown>[]);
    },
    summary(): string {
      if (kind === "statistics") {
        const stats = data as Record<string, unknown[]>;
        const labels: Record<string, string> = {
          agency: "agencies",
          request_date: "dates",
          org_names: "organizations",
        };
        const parts = Object.entries(stats).map(([k, v]) => `${v.length} ${labels[k] ?? k}`);
        return `statistics: ${parts.join(", ")}`;
      }
      const items = data as unknown[];
      if (!meta) return `${kind}: ${items.length} results`;
      return `${kind}: ${items.length} of ${meta.total_results} results (${meta.pages} pages)`;
    },
  };
}
