import { createResult, escapeCSV } from "govdata-core";
import type { GovResult } from "govdata-core";
import type { BlsResult, EndpointKind, Series, Survey, Meta } from "./types";

export type { BlsResult, EndpointKind };

/**
 * Timeseries data is per-series with nested data arrays — not flat tabular.
 * Build custom toMarkdown/toCSV/summary (principle #8).
 */
function wrapTimeseries(series: Series[], meta: Meta | null): BlsResult<"timeseries"> {
  const totalPoints = series.reduce((sum, s) => sum + (s.data?.length ?? 0), 0);

  return {
    data: series,
    meta,
    kind: "timeseries",
    toMarkdown(): string {
      if (series.length === 0) return "(no data)";
      const sections: string[] = [];
      for (const s of series) {
        const points = s.data ?? [];
        if (points.length === 0) {
          sections.push(`### ${s.seriesID}\n\n(no data points)`);
          continue;
        }
        const header = "| Year | Period | Value |";
        const sep = "| --- | --- | --- |";
        const rows = points.map(
          (p) => `| ${p.year} | ${p.periodName} | ${p.value} |`,
        );
        sections.push(`### ${s.seriesID}\n\n${[header, sep, ...rows].join("\n")}`);
      }
      return sections.join("\n\n");
    },
    toCSV(): string {
      if (series.length === 0) return "";
      const sections: string[] = [];
      for (const s of series) {
        const points = s.data ?? [];
        if (points.length === 0) continue;
        const header = "seriesID,year,period,periodName,value";
        const rows = points.map(
          (p) =>
            `${escapeCSV(s.seriesID)},${escapeCSV(p.year)},${escapeCSV(p.period)},${escapeCSV(p.periodName)},${escapeCSV(p.value)}`,
        );
        sections.push([header, ...rows].join("\n"));
      }
      return sections.join("\n\n");
    },
    summary(): string {
      const years = new Set<string>();
      for (const s of series) {
        for (const p of s.data ?? []) {
          years.add(p.year);
        }
      }
      const sorted = [...years].sort();
      const range = sorted.length > 0 ? `${sorted[0]}–${sorted[sorted.length - 1]}` : "none";
      return `timeseries: ${series.length} series, ${totalPoints} data points, years ${range}`;
    },
  };
}

/**
 * Surveys and popular are simpler — use createResult for tabular output.
 */
function wrapSurveys(surveys: Survey[], meta: Meta | null): BlsResult<"surveys"> {
  return createResult(surveys, meta, "surveys") as BlsResult<"surveys">;
}

function wrapPopular(series: Series[], meta: Meta | null): BlsResult<"popular"> {
  // Popular returns just seriesIDs (no data), make a simple table
  const rows = series.map((s) => ({ seriesID: s.seriesID }));
  return createResult(rows, meta, "popular") as BlsResult<"popular">;
}

export function wrapResponse<K extends EndpointKind>(
  data: unknown,
  kind: K,
): BlsResult<K> {
  switch (kind) {
    case "timeseries":
      return wrapTimeseries(data as Series[], null) as BlsResult<K>;
    case "surveys":
      return wrapSurveys(data as Survey[], null) as BlsResult<K>;
    case "popular":
      return wrapPopular(data as Series[], null) as BlsResult<K>;
    default:
      throw new Error(`Unknown kind: ${kind}`);
  }
}
