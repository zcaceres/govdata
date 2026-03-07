import { createResult } from "govdata-core";
import type { GovResult } from "govdata-core";
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

export interface DogeResult<K extends EndpointKind = EndpointKind> extends GovResult<K> {
  readonly data: KindDataMap[K];
  readonly meta: Meta | null;
}

const statisticsLabels: Record<string, string> = {
  agency: "agencies",
  request_date: "dates",
  org_names: "organizations",
};

export function wrapResponse<K extends EndpointKind>(
  raw: { result: Record<string, unknown>; meta?: Meta },
  kind: K,
): DogeResult<K> {
  const data = (kind === "statistics"
    ? raw.result
    : raw.result[kind]) as KindDataMap[K];
  const meta: Meta | null = raw.meta ?? null;

  const result = createResult(data, meta, kind) as DogeResult<K>;

  if (kind === "statistics") {
    const originalSummary = result.summary;
    (result as any).summary = () => {
      const stats = data as Record<string, unknown[]>;
      const parts = Object.entries(stats).map(
        ([k, v]) => `${(v as unknown[]).length} ${statisticsLabels[k] ?? k}`,
      );
      return `statistics: ${parts.join(", ")}`;
    };
  }

  return result;
}
