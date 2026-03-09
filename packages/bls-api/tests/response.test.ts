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

const calculationsFixture = [
  {
    seriesID: "CUUR0000SA0",
    data: [
      {
        year: "2024",
        period: "M12",
        periodName: "December",
        value: "315.605",
        footnotes: [{}],
        calculations: {
          net_changes: { "1": "0.1", "3": "0.3", "6": "0.5", "12": "2.9" },
          pct_changes: { "1": "0.0", "3": "0.1", "6": "0.5", "12": "2.9" },
        },
      },
    ],
  },
];

const catalogFixture = [
  {
    seriesID: "CUUR0000SA0",
    catalog: {
      series_title: "All items in U.S. city average",
      series_id: "CUUR0000SA0",
      seasonality: "Not Seasonally Adjusted",
      survey_name: "Consumer Price Index for All Urban Consumers (CPI-U)",
      measure_data_type: "All items",
      area: "U.S. city average",
      item: "All items",
    },
    data: [
      { year: "2024", period: "M12", periodName: "December", value: "315.605", footnotes: [{}] },
    ],
  },
];

const aspectsFixture = [
  {
    seriesID: "TEST001",
    data: [
      {
        year: "2024",
        period: "M12",
        periodName: "December",
        value: "100.0",
        footnotes: [{}],
        aspects: [
          { name: "Standard Error", value: "0.1", footnotes: [{}] },
        ],
      },
    ],
  },
];

const footnotesFixture = [
  {
    seriesID: "CUUR0000SA0",
    data: [
      {
        year: "2025",
        period: "M10",
        periodName: "October",
        value: "-",
        footnotes: [
          { code: "X", text: "Data unavailable due to the 2025 lapse in appropriations" },
        ],
      },
      { year: "2025", period: "M09", periodName: "September", value: "324.800", footnotes: [{}] },
    ],
  },
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

  it("includes calculation columns when calculations present", () => {
    const result = wrapResponse(calculationsFixture, "timeseries");
    const md = result.toMarkdown();
    expect(md).toContain("Net Chg (1m)");
    expect(md).toContain("Pct Chg (12m)");
    expect(md).toContain("0.1");
    expect(md).toContain("2.9");
  });

  it("includes catalog metadata header when catalog present", () => {
    const result = wrapResponse(catalogFixture, "timeseries");
    const md = result.toMarkdown();
    expect(md).toContain("**All items in U.S. city average**");
    expect(md).toContain("survey_name: Consumer Price Index");
    expect(md).toContain("seasonality: Not Seasonally Adjusted");
    expect(md).toContain("area: U.S. city average");
  });

  it("includes aspects column when aspects present", () => {
    const result = wrapResponse(aspectsFixture, "timeseries");
    const md = result.toMarkdown();
    expect(md).toContain("Aspects");
    expect(md).toContain("Standard Error: 0.1");
  });

  it("includes footnotes column when footnotes have text", () => {
    const result = wrapResponse(footnotesFixture, "timeseries");
    const md = result.toMarkdown();
    expect(md).toContain("Footnotes");
    expect(md).toContain("[X] Data unavailable");
  });

  it("omits extra columns when no calculations/aspects/footnotes", () => {
    const result = wrapResponse(seriesFixture, "timeseries");
    const md = result.toMarkdown();
    expect(md).not.toContain("Net Chg");
    expect(md).not.toContain("Pct Chg");
    expect(md).not.toContain("Aspects");
    expect(md).not.toContain("Footnotes");
  });
});

describe("toCSV()", () => {
  it("generates correct CSV with headers", () => {
    const result = wrapResponse(seriesFixture, "timeseries");
    const csv = result.toCSV();
    expect(csv).toContain("seriesID,year,period,periodName,value,latest");
    expect(csv).toContain("CUUR0000SA0");
    expect(csv).toContain("317.671");
  });

  it("returns empty string for empty series array", () => {
    const result = wrapResponse([], "timeseries");
    expect(result.toCSV()).toBe("");
  });

  it("includes calculation columns in CSV when present", () => {
    const result = wrapResponse(calculationsFixture, "timeseries");
    const csv = result.toCSV();
    expect(csv).toContain("net_chg_1m");
    expect(csv).toContain("pct_chg_12m");
  });

  it("includes aspects column in CSV when present", () => {
    const result = wrapResponse(aspectsFixture, "timeseries");
    const csv = result.toCSV();
    expect(csv).toContain("aspects");
    expect(csv).toContain("Standard Error: 0.1");
  });

  it("includes footnotes column in CSV when present", () => {
    const result = wrapResponse(footnotesFixture, "timeseries");
    const csv = result.toCSV();
    expect(csv).toContain("footnotes");
    expect(csv).toContain("Data unavailable");
  });

  it("includes latest field in CSV", () => {
    const data = [
      {
        seriesID: "TEST",
        data: [
          { year: "2026", period: "M01", periodName: "January", latest: "true", value: "100", footnotes: [{}] },
        ],
      },
    ];
    const result = wrapResponse(data, "timeseries");
    const csv = result.toCSV();
    expect(csv).toContain("latest");
    expect(csv).toContain("true");
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

  it("mentions calculations in summary when present", () => {
    const result = wrapResponse(calculationsFixture, "timeseries");
    const summary = result.summary();
    expect(summary).toContain("calculations");
  });

  it("mentions catalog in summary when present", () => {
    const result = wrapResponse(catalogFixture, "timeseries");
    const summary = result.summary();
    expect(summary).toContain("catalog");
  });

  it("mentions aspects in summary when present", () => {
    const result = wrapResponse(aspectsFixture, "timeseries");
    const summary = result.summary();
    expect(summary).toContain("aspects");
  });
});
