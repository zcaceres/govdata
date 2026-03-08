import { describe, it, expect, afterEach } from "bun:test";
import { usaspendingPlugin } from "../src/plugin";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function mockFetchCapture(fixture: string) {
  let captured: { url: string; init?: RequestInit } | undefined;
  globalThis.fetch = (async (url: string, init?: RequestInit) => {
    captured = { url, init };
    const data = await Bun.file(`${import.meta.dir}/../fixtures/${fixture}`).json();
    return new Response(JSON.stringify(data), { status: 200 });
  }) as unknown as typeof fetch;
  return () => captured;
}

function mockFetch(fixture: string) {
  globalThis.fetch = (async () => {
    const data = await Bun.file(`${import.meta.dir}/../fixtures/${fixture}`).json();
    return new Response(JSON.stringify(data), { status: 200 });
  }) as unknown as typeof fetch;
}

describe("plugin prefix and structure", () => {
  it("has prefix 'usaspending'", () => {
    expect(usaspendingPlugin.prefix).toBe("usaspending");
  });

  it("has 94 endpoints", () => {
    expect(Object.keys(usaspendingPlugin.endpoints).length).toBe(137);
  });
});

describe("plugin awards — flat param to nested filter translation", () => {
  it("translates keyword to filters.keywords", async () => {
    const getCapture = mockFetchCapture("award-search-keyword.json");
    await usaspendingPlugin.endpoints.awards({ keyword: "NASA" });
    const body = JSON.parse(getCapture()!.init?.body as string);
    expect(body.filters.keywords).toEqual(["NASA"]);
  });

  it("translates award_type=contracts to award_type_codes", async () => {
    const getCapture = mockFetchCapture("award-search-keyword.json");
    await usaspendingPlugin.endpoints.awards({ award_type: "contracts" });
    const body = JSON.parse(getCapture()!.init?.body as string);
    expect(body.filters.award_type_codes).toEqual(["A", "B", "C", "D"]);
  });

  it("translates award_type=grants to grant codes", async () => {
    const getCapture = mockFetchCapture("award-search-keyword.json");
    await usaspendingPlugin.endpoints.awards({ award_type: "grants" });
    const body = JSON.parse(getCapture()!.init?.body as string);
    expect(body.filters.award_type_codes).toEqual(["02", "03", "04", "05"]);
  });

  it("translates award_type=loans to loan codes", async () => {
    const getCapture = mockFetchCapture("award-search-keyword.json");
    await usaspendingPlugin.endpoints.awards({ award_type: "loans" });
    const body = JSON.parse(getCapture()!.init?.body as string);
    expect(body.filters.award_type_codes).toEqual(["07", "08"]);
  });

  it("translates start_date and end_date to time_period", async () => {
    const getCapture = mockFetchCapture("award-search-keyword.json");
    await usaspendingPlugin.endpoints.awards({ start_date: "2024-01-01", end_date: "2024-12-31" });
    const body = JSON.parse(getCapture()!.init?.body as string);
    expect(body.filters.time_period).toEqual([{ start_date: "2024-01-01", end_date: "2024-12-31" }]);
  });

  it("translates agency to agencies array", async () => {
    const getCapture = mockFetchCapture("award-search-keyword.json");
    await usaspendingPlugin.endpoints.awards({ agency: "Department of Defense" });
    const body = JSON.parse(getCapture()!.init?.body as string);
    expect(body.filters.agencies).toEqual([{
      type: "awarding", tier: "toptier", name: "Department of Defense",
    }]);
  });

  it("translates naics_code to naics_codes object", async () => {
    const getCapture = mockFetchCapture("award-search-keyword.json");
    await usaspendingPlugin.endpoints.awards({ naics_code: "541330" });
    const body = JSON.parse(getCapture()!.init?.body as string);
    expect(body.filters.naics_codes).toEqual({ require: ["541330"] });
  });

  it("translates recipient to recipient_search_text", async () => {
    const getCapture = mockFetchCapture("award-search-keyword.json");
    await usaspendingPlugin.endpoints.awards({ recipient: "Boeing" });
    const body = JSON.parse(getCapture()!.init?.body as string);
    expect(body.filters.recipient_search_text).toEqual(["Boeing"]);
  });

  it("translates state to place_of_performance_locations", async () => {
    const getCapture = mockFetchCapture("award-search-keyword.json");
    await usaspendingPlugin.endpoints.awards({ state: "CA" });
    const body = JSON.parse(getCapture()!.init?.body as string);
    expect(body.filters.place_of_performance_locations).toEqual([{
      country: "USA", state: "CA",
    }]);
  });

  it("passes limit and page through", async () => {
    const getCapture = mockFetchCapture("award-search-keyword.json");
    await usaspendingPlugin.endpoints.awards({ keyword: "test", limit: 5, page: 2 });
    const body = JSON.parse(getCapture()!.init?.body as string);
    expect(body.limit).toBe(5);
    expect(body.page).toBe(2);
  });

  it("passes sort and order through", async () => {
    const getCapture = mockFetchCapture("award-search-keyword.json");
    await usaspendingPlugin.endpoints.awards({ sort: "Recipient Name", order: "asc" });
    const body = JSON.parse(getCapture()!.init?.body as string);
    expect(body.sort).toBe("Recipient Name");
    expect(body.order).toBe("asc");
  });
});

describe("plugin award detail", () => {
  it("passes id to URL path", async () => {
    const getCapture = mockFetchCapture("award-detail-contract.json");
    await usaspendingPlugin.endpoints.award({ id: "CONT_AWD_TEST" });
    expect(getCapture()!.url).toContain("/api/v2/awards/CONT_AWD_TEST/");
  });

  it("returns kind 'award'", async () => {
    mockFetch("award-detail-contract.json");
    const result = await usaspendingPlugin.endpoints.award({ id: "test" });
    expect(result.kind).toBe("award");
  });
});

describe("plugin agency", () => {
  it("passes toptier_code to URL path", async () => {
    const getCapture = mockFetchCapture("agency-overview-nasa.json");
    await usaspendingPlugin.endpoints.agency({ toptier_code: "080" });
    expect(getCapture()!.url).toContain("/api/v2/agency/080/");
  });

  it("returns kind 'agency'", async () => {
    mockFetch("agency-overview-nasa.json");
    const result = await usaspendingPlugin.endpoints.agency({ toptier_code: "080" });
    expect(result.kind).toBe("agency");
  });
});

describe("plugin spending_by_agency", () => {
  it("sends type and fy in POST body", async () => {
    const getCapture = mockFetchCapture("spending-by-agency-fy2024.json");
    await usaspendingPlugin.endpoints.spending_by_agency({
      type: "agency", fy: "2024", period: "12",
    });
    const body = JSON.parse(getCapture()!.init?.body as string);
    expect(body.type).toBe("agency");
    expect(body.filters.fy).toBe("2024");
    expect(body.filters.period).toBe("12");
  });

  it("supports quarter param", async () => {
    const getCapture = mockFetchCapture("spending-by-agency-fy2023-q4.json");
    await usaspendingPlugin.endpoints.spending_by_agency({
      type: "agency", fy: "2023", quarter: "4",
    });
    const body = JSON.parse(getCapture()!.init?.body as string);
    expect(body.filters.quarter).toBe("4");
  });
});

describe("plugin spending_by_state", () => {
  it("returns kind 'spending_by_state'", async () => {
    mockFetch("spending-by-state-all.json");
    const result = await usaspendingPlugin.endpoints.spending_by_state();
    expect(result.kind).toBe("spending_by_state");
    expect(result.data).toBeInstanceOf(Array);
  });
});

describe("plugin spending_over_time", () => {
  it("translates keyword into filters", async () => {
    const getCapture = mockFetchCapture("spending-over-time-fy.json");
    await usaspendingPlugin.endpoints.spending_over_time({
      group: "fiscal_year", keyword: "NASA",
    });
    const body = JSON.parse(getCapture()!.init?.body as string);
    expect(body.group).toBe("fiscal_year");
    expect(body.filters.keywords).toEqual(["NASA"]);
  });

  it("translates date range into filters", async () => {
    const getCapture = mockFetchCapture("spending-over-time-fy.json");
    await usaspendingPlugin.endpoints.spending_over_time({
      group: "fiscal_year", start_date: "2020-01-01", end_date: "2024-12-31",
    });
    const body = JSON.parse(getCapture()!.init?.body as string);
    expect(body.filters.time_period).toEqual([{
      start_date: "2020-01-01", end_date: "2024-12-31",
    }]);
  });

  it("translates award_type into filter codes", async () => {
    const getCapture = mockFetchCapture("spending-over-time-contracts.json");
    await usaspendingPlugin.endpoints.spending_over_time({
      group: "fiscal_year", award_type: "contracts",
    });
    const body = JSON.parse(getCapture()!.init?.body as string);
    expect(body.filters.award_type_codes).toEqual(["A", "B", "C", "D"]);
  });
});
