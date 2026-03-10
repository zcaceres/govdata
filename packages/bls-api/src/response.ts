import { createResult, escapeCSV, escapeMarkdownCell } from "govdata-core";
import type { GovResult } from "govdata-core";
import type { BlsResult, EndpointKind, Series, Survey, PopularSeries, DataPoint, Meta } from "./types";

export type { BlsResult, EndpointKind };

function formatFootnotes(p: DataPoint): string {
  const notes = (p.footnotes ?? []).filter((f) => f.text);
  if (notes.length === 0) return "";
  return notes.map((f) => (f.code ? `[${f.code}] ${f.text}` : f.text!)).join("; ");
}

function hasCalculations(series: Series[]): boolean {
  return series.some((s) => s.data?.some((p) => p.calculations));
}

function hasAspects(series: Series[]): boolean {
  return series.some((s) => s.data?.some((p) => p.aspects && p.aspects.length > 0));
}

function hasFootnotes(series: Series[]): boolean {
  return series.some((s) => s.data?.some((p) => (p.footnotes ?? []).some((f) => f.text)));
}

/**
 * Timeseries data is per-series with nested data arrays — not flat tabular.
 * Build custom toMarkdown/toCSV/summary (principle #8).
 */
function wrapTimeseries(series: Series[], meta: Meta | null): BlsResult<"timeseries"> {
  const totalPoints = series.reduce((sum, s) => sum + (s.data?.length ?? 0), 0);
  // Columns are computed globally across all series for consistent tabular output.
  // If any series has calculations/aspects/footnotes, all series get those columns (with empty cells for missing).
  const showCalcs = hasCalculations(series);
  const showAspects = hasAspects(series);
  const showFootnotes = hasFootnotes(series);

  return {
    data: series,
    meta,
    kind: "timeseries",
    toMarkdown(): string {
      if (series.length === 0) return "(no data)";
      const sections: string[] = [];
      for (const s of series) {
        const seriesSection: string[] = [];

        // Catalog metadata header
        if (s.catalog && typeof s.catalog === "object") {
          const cat = s.catalog as Record<string, unknown>;
          const lines: string[] = [];
          if (cat.series_title) lines.push(`**${escapeMarkdownCell(String(cat.series_title))}**`);
          const metaFields = ["survey_name", "seasonality", "measure_data_type", "area", "item"];
          for (const key of metaFields) {
            if (cat[key]) lines.push(`- ${key}: ${escapeMarkdownCell(String(cat[key]))}`);
          }
          // Include any additional catalog fields not in the standard set
          const standardFields = new Set(["series_title", "series_id", ...metaFields]);
          for (const [key, val] of Object.entries(cat)) {
            if (!standardFields.has(key) && val != null && val !== "") {
              lines.push(`- ${key}: ${escapeMarkdownCell(String(val))}`);
            }
          }
          if (lines.length > 0) seriesSection.push(lines.join("\n"));
        }

        const points = s.data ?? [];
        if (points.length === 0) {
          seriesSection.unshift(`### ${escapeMarkdownCell(s.seriesID)}`);
          seriesSection.push("(no data points)");
          sections.push(seriesSection.join("\n\n"));
          continue;
        }

        // Build table columns dynamically based on available data
        const cols = ["Year", "Period", "Value"];
        if (showCalcs) cols.push("Net Chg (1m)", "Net Chg (3m)", "Net Chg (6m)", "Net Chg (12m)", "Pct Chg (1m)", "Pct Chg (3m)", "Pct Chg (6m)", "Pct Chg (12m)");
        if (showAspects) cols.push("Aspects");
        if (showFootnotes) cols.push("Footnotes");

        const header = `| ${cols.join(" | ")} |`;
        const sep = `| ${cols.map(() => "---").join(" | ")} |`;

        const rows = points.map((p) => {
          const cells = [
            escapeMarkdownCell(p.year),
            escapeMarkdownCell(p.periodName),
            escapeMarkdownCell(p.value),
          ];
          if (showCalcs) {
            const net = p.calculations?.net_changes ?? {};
            const pct = p.calculations?.pct_changes ?? {};
            cells.push(
              escapeMarkdownCell(net["1"] ?? ""),
              escapeMarkdownCell(net["3"] ?? ""),
              escapeMarkdownCell(net["6"] ?? ""),
              escapeMarkdownCell(net["12"] ?? ""),
              escapeMarkdownCell(pct["1"] ?? ""),
              escapeMarkdownCell(pct["3"] ?? ""),
              escapeMarkdownCell(pct["6"] ?? ""),
              escapeMarkdownCell(pct["12"] ?? ""),
            );
          }
          if (showAspects) {
            const aspectStr = (p.aspects ?? [])
              .map((a) => `${a.name}: ${a.value}`)
              .join("; ");
            cells.push(escapeMarkdownCell(aspectStr));
          }
          if (showFootnotes) {
            cells.push(escapeMarkdownCell(formatFootnotes(p)));
          }
          return `| ${cells.join(" | ")} |`;
        });

        seriesSection.unshift(`### ${escapeMarkdownCell(s.seriesID)}`);
        seriesSection.push([header, sep, ...rows].join("\n"));
        sections.push(seriesSection.join("\n\n"));
      }
      return sections.join("\n\n");
    },
    toCSV(): string {
      if (series.length === 0) return "";
      // Build CSV columns dynamically (same for all series)
      const cols = ["seriesID", "year", "period", "periodName", "value", "latest"];
      if (showCalcs) cols.push("net_chg_1m", "net_chg_3m", "net_chg_6m", "net_chg_12m", "pct_chg_1m", "pct_chg_3m", "pct_chg_6m", "pct_chg_12m");
      if (showAspects) cols.push("aspects");
      if (showFootnotes) cols.push("footnotes");

      const allRows: string[] = [cols.join(",")];
      for (const s of series) {
        const points = s.data ?? [];
        if (points.length === 0) continue;

        for (const p of points) {
          const cells = [
            escapeCSV(s.seriesID),
            escapeCSV(p.year),
            escapeCSV(p.period),
            escapeCSV(p.periodName),
            escapeCSV(p.value),
            escapeCSV(p.latest ?? ""),
          ];
          if (showCalcs) {
            const net = p.calculations?.net_changes ?? {};
            const pct = p.calculations?.pct_changes ?? {};
            cells.push(
              escapeCSV(net["1"] ?? ""),
              escapeCSV(net["3"] ?? ""),
              escapeCSV(net["6"] ?? ""),
              escapeCSV(net["12"] ?? ""),
              escapeCSV(pct["1"] ?? ""),
              escapeCSV(pct["3"] ?? ""),
              escapeCSV(pct["6"] ?? ""),
              escapeCSV(pct["12"] ?? ""),
            );
          }
          if (showAspects) {
            const aspectStr = (p.aspects ?? [])
              .map((a) => `${a.name}: ${a.value}`)
              .join("; ");
            cells.push(escapeCSV(aspectStr));
          }
          if (showFootnotes) {
            cells.push(escapeCSV(formatFootnotes(p)));
          }
          allRows.push(cells.join(","));
        }
      }
      return allRows.join("\n");
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
      const extras: string[] = [];
      if (showCalcs) extras.push("calculations");
      if (showAspects) extras.push("aspects");
      if (series.some((s) => s.catalog)) extras.push("catalog");
      const extraStr = extras.length > 0 ? `, includes ${extras.join(", ")}` : "";
      return `timeseries: ${series.length} series, ${totalPoints} data points, years ${range}${extraStr}`;
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
  const rows: PopularSeries[] = series.map((s) => ({ seriesID: s.seriesID }));
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
