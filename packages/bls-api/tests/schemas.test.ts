import { describe, it, expect } from "bun:test";
import {
  TimeseriesParamsSchema,
  PopularParamsSchema,
  BLSResponseSchema,
  SurveysResponseSchema,
  PopularResponseSchema,
} from "../src/schemas";

describe("TimeseriesParamsSchema", () => {
  it("accepts string series_id", () => {
    const result = TimeseriesParamsSchema.safeParse({ series_id: "CUUR0000SA0" });
    expect(result.success).toBe(true);
  });

  it("accepts array series_id", () => {
    const result = TimeseriesParamsSchema.safeParse({ series_id: ["CUUR0000SA0", "LNS14000000"] });
    expect(result.success).toBe(true);
  });

  it("accepts optional year params", () => {
    const result = TimeseriesParamsSchema.safeParse({
      series_id: "CUUR0000SA0",
      start_year: 2020,
      end_year: 2025,
    });
    expect(result.success).toBe(true);
  });

  it("coerces string years to numbers", () => {
    const result = TimeseriesParamsSchema.safeParse({
      series_id: "CUUR0000SA0",
      start_year: "2020",
      end_year: "2025",
    });
    expect(result.success).toBe(true);
  });

  it("rejects end_year without start_year", () => {
    const result = TimeseriesParamsSchema.safeParse({
      series_id: "CUUR0000SA0",
      end_year: 2025,
    });
    expect(result.success).toBe(false);
  });

  it("rejects unknown keys (.strict())", () => {
    const result = TimeseriesParamsSchema.safeParse({
      series_id: "CUUR0000SA0",
      unknown_param: "bad",
    });
    expect(result.success).toBe(false);
  });

  it("rejects start_year > end_year", () => {
    const result = TimeseriesParamsSchema.safeParse({
      series_id: "CUUR0000SA0",
      start_year: 2025,
      end_year: 2020,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain("start_year must be <= end_year");
    }
  });

  it("rejects missing series_id", () => {
    const result = TimeseriesParamsSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("accepts boolean params including aspects", () => {
    const result = TimeseriesParamsSchema.safeParse({
      series_id: "CUUR0000SA0",
      calculations: true,
      annual_averages: true,
      catalog: false,
      aspects: true,
    });
    expect(result.success).toBe(true);
  });
});

describe("BLSResponseSchema", () => {
  it("parses timeseries fixture", async () => {
    const fixture = await Bun.file(
      new URL("../fixtures/timeseries.json", import.meta.url).pathname,
    ).json();
    const result = BLSResponseSchema.safeParse(fixture);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.Results.series).toHaveLength(1);
      expect(result.data.Results.series[0].seriesID).toBe("CUUR0000SA0");
    }
  });

  it("parses multi-series fixture", async () => {
    const fixture = await Bun.file(
      new URL("../fixtures/timeseries-multi.json", import.meta.url).pathname,
    ).json();
    const result = BLSResponseSchema.safeParse(fixture);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.Results.series).toHaveLength(2);
      const ids = result.data.Results.series.map((s) => s.seriesID).sort();
      expect(ids).toEqual(["CUUR0000SA0", "LNS14000000"]);
    }
  });

  it("parses year-range fixture", async () => {
    const fixture = await Bun.file(
      new URL("../fixtures/timeseries-year-range.json", import.meta.url).pathname,
    ).json();
    const result = BLSResponseSchema.safeParse(fixture);
    expect(result.success).toBe(true);
    if (result.success) {
      const years = new Set(result.data.Results.series[0].data?.map((d) => d.year));
      expect(years.has("2020")).toBe(true);
      expect(years.has("2024")).toBe(true);
      expect(years.has("2025")).toBe(false);
    }
  });

  it("parses calculations fixture with net_changes and pct_changes", async () => {
    const fixture = await Bun.file(
      new URL("../fixtures/timeseries-calculations.json", import.meta.url).pathname,
    ).json();
    const result = BLSResponseSchema.safeParse(fixture);
    expect(result.success).toBe(true);
    if (result.success) {
      const points = result.data.Results.series[0].data ?? [];
      // Should have M13 annual average
      const annual = points.find((p) => p.period === "M13");
      expect(annual).toBeDefined();
      expect(annual!.periodName).toBe("Annual");
      // Should have calculations on data points
      const withCalcs = points.filter((p) => p.calculations != null);
      expect(withCalcs.length).toBeGreaterThan(0);
    }
  });

  it("parses catalog fixture with series metadata", async () => {
    const fixture = await Bun.file(
      new URL("../fixtures/timeseries-catalog.json", import.meta.url).pathname,
    ).json();
    const result = BLSResponseSchema.safeParse(fixture);
    expect(result.success).toBe(true);
    if (result.success) {
      const series = result.data.Results.series[0];
      expect(series.catalog).toBeDefined();
      expect(series.catalog!.series_title).toBeDefined();
      expect(series.catalog!.survey_name).toBeDefined();
    }
  });
});

describe("SurveysResponseSchema", () => {
  it("parses surveys fixture", async () => {
    const fixture = await Bun.file(
      new URL("../fixtures/surveys.json", import.meta.url).pathname,
    ).json();
    const result = SurveysResponseSchema.safeParse(fixture);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.Results.survey).toHaveLength(69);
      expect(result.data.Results.survey[0].survey_abbreviation).toBe("AP");
    }
  });
});

describe("PopularParamsSchema", () => {
  it("accepts empty object (no filter)", () => {
    const result = PopularParamsSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts survey abbreviation", () => {
    const result = PopularParamsSchema.safeParse({ survey: "CU" });
    expect(result.success).toBe(true);
  });

  it("rejects unknown keys (.strict())", () => {
    const result = PopularParamsSchema.safeParse({ survey: "CU", bad: "key" });
    expect(result.success).toBe(false);
  });
});

describe("PopularResponseSchema", () => {
  it("parses popular fixture", async () => {
    const fixture = await Bun.file(
      new URL("../fixtures/popular.json", import.meta.url).pathname,
    ).json();
    const result = PopularResponseSchema.safeParse(fixture);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.Results.series).toHaveLength(25);
      expect(result.data.Results.series[0].seriesID).toBe("CUUR0000SA0");
    }
  });

  it("parses popular-survey-cu fixture", async () => {
    const fixture = await Bun.file(
      new URL("../fixtures/popular-survey-cu.json", import.meta.url).pathname,
    ).json();
    const result = PopularResponseSchema.safeParse(fixture);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.Results.series).toHaveLength(25);
      // All CU survey series start with CU
      for (const s of result.data.Results.series) {
        expect(s.seriesID.startsWith("CU")).toBe(true);
      }
    }
  });
});
