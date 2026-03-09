import { describe, it, expect } from "bun:test";
import { wrapResponse } from "../src/response";

const seriesFixture = [
  {
    seriesID: "CUUR0000SA0",
    data: [
      { year: "2025", period: "M01", periodName: "January", value: "317.671", footnotes: [{}] },
      { year: "2024", period: "M12", periodName: "December", value: "315.605", footnotes: [{}] },
    ],
  },
];

const multiSeriesFixture = [
  {
    seriesID: "CUUR0000SA0",
    data: [
      { year: "2025", period: "M01", periodName: "January", value: "317.671", footnotes: [{}] },
    ],
  },
  {
    seriesID: "LNS14000000",
    data: [
      { year: "2025", period: "M01", periodName: "January", value: "4.0", footnotes: [{}] },
    ],
  },
];

const surveysFixture = [
  { survey_abbreviation: "CU", survey_name: "Consumer Price Index" },
  { survey_abbreviation: "LN", survey_name: "Labor Force Statistics" },
];

describe("wrapResponse", () => {
  it("timeseries returns correct data and kind", () => {
    const result = wrapResponse(seriesFixture, "timeseries");
    expect(result.kind).toBe("timeseries");
    expect(result.data).toEqual(seriesFixture);
    expect(result.meta).toBeNull();
  });

  it("surveys returns correct data and kind", () => {
    const result = wrapResponse(surveysFixture, "surveys");
    expect(result.kind).toBe("surveys");
    expect(result.data).toEqual(surveysFixture);
  });

  it("popular returns correct kind", () => {
    const result = wrapResponse([{ seriesID: "CUUR0000SA0" }], "popular");
    expect(result.kind).toBe("popular");
  });
});

describe("toMarkdown()", () => {
  it("generates per-series tables for timeseries", () => {
    const result = wrapResponse(multiSeriesFixture, "timeseries");
    const md = result.toMarkdown();
    expect(md).toContain("### CUUR0000SA0");
    expect(md).toContain("### LNS14000000");
    expect(md).toContain("| Year | Period | Value |");
    expect(md).toContain("317.671");
    expect(md).toContain("4.0");
  });

  it("returns (no data) for empty series array", () => {
    const result = wrapResponse([], "timeseries");
    expect(result.toMarkdown()).toBe("(no data)");
  });

  it("escapes pipe characters in values", () => {
    const data = [
      {
        seriesID: "TEST|ID",
        data: [
          { year: "2025", period: "M01", periodName: "Jan|Feb", value: "100|200", footnotes: [{}] },
        ],
      },
    ];
    const result = wrapResponse(data, "timeseries");
    const md = result.toMarkdown();
    expect(md).toContain("TEST\\|ID");
    expect(md).toContain("Jan\\|Feb");
    expect(md).toContain("100\\|200");
  });
});

describe("toCSV()", () => {
  it("generates correct CSV with headers", () => {
    const result = wrapResponse(seriesFixture, "timeseries");
    const csv = result.toCSV();
    expect(csv).toContain("seriesID,year,period,periodName,value");
    expect(csv).toContain("CUUR0000SA0");
    expect(csv).toContain("317.671");
  });

  it("returns empty string for empty series array", () => {
    const result = wrapResponse([], "timeseries");
    expect(result.toCSV()).toBe("");
  });
});

describe("summary()", () => {
  it("returns series count and year range", () => {
    const result = wrapResponse(seriesFixture, "timeseries");
    const summary = result.summary();
    expect(summary).toContain("1 series");
    expect(summary).toContain("2 data points");
    expect(summary).toContain("2024");
    expect(summary).toContain("2025");
  });

  it("handles multiple series", () => {
    const result = wrapResponse(multiSeriesFixture, "timeseries");
    const summary = result.summary();
    expect(summary).toContain("2 series");
  });
});
