import { describe, it, expect, afterEach } from "bun:test";
import { timeseries, surveys, popular, bls } from "../src/endpoints";
import { blsPlugin } from "../src/plugin";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function mockFetch(body: unknown) {
  globalThis.fetch = (async () =>
    new Response(JSON.stringify(body), { status: 200 })) as unknown as typeof fetch;
}

const timeseriesFixture = {
  status: "REQUEST_SUCCEEDED",
  responseTime: 50,
  message: [],
  Results: {
    series: [
      {
        seriesID: "CUUR0000SA0",
        data: [
          { year: "2025", period: "M01", periodName: "January", value: "317.671", footnotes: [{}] },
          { year: "2024", period: "M12", periodName: "December", value: "315.605", footnotes: [{}] },
        ],
      },
    ],
  },
};

const multiSeriesFixture = {
  status: "REQUEST_SUCCEEDED",
  responseTime: 50,
  message: [],
  Results: {
    series: [
      {
        seriesID: "CUUR0000SA0",
        data: [{ year: "2025", period: "M01", periodName: "January", value: "317.671", footnotes: [{}] }],
      },
      {
        seriesID: "LNS14000000",
        data: [{ year: "2025", period: "M01", periodName: "January", value: "4.0", footnotes: [{}] }],
      },
    ],
  },
};

const surveysFixture = {
  status: "REQUEST_SUCCEEDED",
  responseTime: 10,
  message: [],
  Results: {
    survey: [
      { survey_abbreviation: "CU", survey_name: "Consumer Price Index - All Urban Consumers" },
      { survey_abbreviation: "LN", survey_name: "Labor Force Statistics" },
    ],
  },
};

const popularFixture = {
  status: "REQUEST_SUCCEEDED",
  responseTime: 10,
  message: [],
  Results: {
    series: [
      { seriesID: "CUUR0000SA0" },
      { seriesID: "LNS14000000" },
    ],
  },
};

describe("timeseries", () => {
  it("returns parsed series for single ID", async () => {
    mockFetch(timeseriesFixture);
    const result = await timeseries({ series_id: "CUUR0000SA0" });
    expect(result.kind).toBe("timeseries");
    expect(result.data).toHaveLength(1);
    expect(result.data[0].seriesID).toBe("CUUR0000SA0");
    expect(result.data[0].data).toHaveLength(2);
  });

  it("returns parsed series for multiple IDs", async () => {
    mockFetch(multiSeriesFixture);
    const result = await timeseries({ series_id: ["CUUR0000SA0", "LNS14000000"] });
    expect(result.data).toHaveLength(2);
  });

  it("supports year range params", async () => {
    let capturedBody: any;
    globalThis.fetch = (async (_url: any, init?: RequestInit) => {
      capturedBody = JSON.parse(init?.body as string);
      return new Response(JSON.stringify(timeseriesFixture), { status: 200 });
    }) as unknown as typeof fetch;

    await timeseries({ series_id: "CUUR0000SA0", start_year: 2020, end_year: 2025 });
    expect(capturedBody.startyear).toBe("2020");
    expect(capturedBody.endyear).toBe("2025");
  });

  it("supports calculations, annual_averages, and aspects flags", async () => {
    let capturedBody: any;
    globalThis.fetch = (async (_url: any, init?: RequestInit) => {
      capturedBody = JSON.parse(init?.body as string);
      return new Response(JSON.stringify(timeseriesFixture), { status: 200 });
    }) as unknown as typeof fetch;

    await timeseries({ series_id: "CUUR0000SA0", calculations: true, annual_averages: true, aspects: true });
    expect(capturedBody.calculations).toBe(true);
    expect(capturedBody.annualaverage).toBe(true);
    expect(capturedBody.aspects).toBe(true);
  });

  it("throws validation error for missing series_id", async () => {
    await expect(timeseries({} as any)).rejects.toThrow();
  });

  it("toMarkdown produces table output", async () => {
    mockFetch(timeseriesFixture);
    const result = await timeseries({ series_id: "CUUR0000SA0" });
    const md = result.toMarkdown();
    expect(md).toContain("CUUR0000SA0");
    expect(md).toContain("Year");
    expect(md).toContain("317.671");
  });

  it("toCSV produces CSV output", async () => {
    mockFetch(timeseriesFixture);
    const result = await timeseries({ series_id: "CUUR0000SA0" });
    const csv = result.toCSV();
    expect(csv).toContain("seriesID,year,period,periodName,value");
    expect(csv).toContain("CUUR0000SA0");
  });

  it("summary shows series count and year range", async () => {
    mockFetch(timeseriesFixture);
    const result = await timeseries({ series_id: "CUUR0000SA0" });
    const summary = result.summary();
    expect(summary).toContain("timeseries");
    expect(summary).toContain("1 series");
    expect(summary).toContain("2 data points");
  });
});

describe("surveys", () => {
  it("returns parsed survey list", async () => {
    mockFetch(surveysFixture);
    const result = await surveys();
    expect(result.kind).toBe("surveys");
    expect(result.data).toHaveLength(2);
    expect(result.data[0].survey_abbreviation).toBe("CU");
  });
});

describe("popular", () => {
  it("returns parsed popular series", async () => {
    mockFetch(popularFixture);
    const result = await popular();
    expect(result.kind).toBe("popular");
    expect(result.data).toBeDefined();
  });

  it("passes survey filter as query param", async () => {
    let capturedUrl: string | undefined;
    globalThis.fetch = (async (url: any) => {
      capturedUrl = String(url);
      return new Response(JSON.stringify(popularFixture), { status: 200 });
    }) as unknown as typeof fetch;

    await popular({ survey: "CU" });
    expect(capturedUrl).toContain("?survey=CU");
  });

  it("omits query param when no survey provided", async () => {
    let capturedUrl: string | undefined;
    globalThis.fetch = (async (url: any) => {
      capturedUrl = String(url);
      return new Response(JSON.stringify(popularFixture), { status: 200 });
    }) as unknown as typeof fetch;

    await popular();
    expect(capturedUrl).not.toContain("?survey");
  });
});

describe("error handling", () => {
  it("REQUEST_FAILED status throws GovApiError", async () => {
    mockFetch({
      status: "REQUEST_FAILED",
      responseTime: 1,
      message: ["Invalid series ID"],
      Results: { series: [] },
    });

    await expect(timeseries({ series_id: "BAD_ID" })).rejects.toThrow("Invalid series ID");
  });
});

describe("createBls factory", () => {
  it("bls singleton works", async () => {
    mockFetch(surveysFixture);
    const result = await bls.surveys();
    expect(result.kind).toBe("surveys");
  });
});

describe("blsPlugin", () => {
  it("has correct prefix", () => {
    expect(blsPlugin.prefix).toBe("bls");
  });

  it("has all endpoint functions", () => {
    expect(typeof blsPlugin.endpoints.timeseries).toBe("function");
    expect(typeof blsPlugin.endpoints.surveys).toBe("function");
    expect(typeof blsPlugin.endpoints.popular).toBe("function");
  });

  it("plugin timeseries validates required series_id", () => {
    expect(() => blsPlugin.endpoints.timeseries({})).toThrow();
  });

  it("plugin timeseries rejects empty string series_id", () => {
    expect(() => blsPlugin.endpoints.timeseries({ series_id: "" })).toThrow();
  });

  it("plugin timeseries rejects whitespace-only series_id", () => {
    expect(() => blsPlugin.endpoints.timeseries({ series_id: "  " })).toThrow();
  });

  it("plugin timeseries splits comma-separated series_id", async () => {
    let capturedBody: any;
    globalThis.fetch = (async (_url: any, init?: RequestInit) => {
      capturedBody = JSON.parse(init?.body as string);
      return new Response(JSON.stringify(timeseriesFixture), { status: 200 });
    }) as unknown as typeof fetch;

    await blsPlugin.endpoints.timeseries({ series_id: "CUUR0000SA0,LNS14000000" });
    expect(capturedBody.seriesid).toEqual(["CUUR0000SA0", "LNS14000000"]);
  });

  it("plugin timeseries coerces boolean strings", async () => {
    let capturedBody: any;
    globalThis.fetch = (async (_url: any, init?: RequestInit) => {
      capturedBody = JSON.parse(init?.body as string);
      return new Response(JSON.stringify(timeseriesFixture), { status: 200 });
    }) as unknown as typeof fetch;

    await blsPlugin.endpoints.timeseries({ series_id: "CUUR0000SA0", calculations: "true", aspects: "true" });
    expect(capturedBody.calculations).toBe(true);
    expect(capturedBody.aspects).toBe(true);
  });
});
