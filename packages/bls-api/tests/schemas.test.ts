import { describe, it, expect } from "bun:test";
import {
  TimeseriesParamsSchema,
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

  it("rejects missing series_id", () => {
    const result = TimeseriesParamsSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("accepts boolean params", () => {
    const result = TimeseriesParamsSchema.safeParse({
      series_id: "CUUR0000SA0",
      calculations: true,
      annual_averages: true,
      catalog: false,
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
});

describe("SurveysResponseSchema", () => {
  it("parses surveys fixture", async () => {
    const fixture = await Bun.file(
      new URL("../fixtures/surveys.json", import.meta.url).pathname,
    ).json();
    const result = SurveysResponseSchema.safeParse(fixture);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.Results.survey.length).toBeGreaterThan(0);
      expect(result.data.Results.survey[0].survey_abbreviation).toBe("AP");
    }
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
      expect(result.data.Results.series.length).toBeGreaterThan(0);
      expect(result.data.Results.series[0].seriesID).toBe("CUUR0000SA0");
    }
  });
});
