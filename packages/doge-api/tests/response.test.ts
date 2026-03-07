import { describe, it, expect } from "bun:test";
import { wrapResponse } from "../src/response";

const meta = { total_results: 15887, pages: 3178 };

const grantFixture = {
  date: "10/2/2025",
  agency: "DOE",
  recipient: "Test",
  value: 5000,
  savings: 1000,
  link: null,
  description: "Test grant",
};

describe("wrapResponse", () => {
  it("flattens grants data", () => {
    const raw = {
      success: true as const,
      result: { grants: [grantFixture] },
      meta,
    };
    const wrapped = wrapResponse(raw, "grants");
    expect(wrapped.data).toEqual([grantFixture]);
    expect(wrapped.meta).toEqual(meta);
    expect(wrapped.kind).toBe("grants");
  });

  it("flattens statistics data", () => {
    const raw = {
      success: true as const,
      result: {
        agency: [{ agency_name: "NASA", count: 100 }],
        request_date: [{ date: "2025-01-01", count: 50 }],
        org_names: [{ org_name: "HQ", count: 25 }],
      },
    };
    const wrapped = wrapResponse(raw, "statistics");
    expect(wrapped.data).toEqual(raw.result);
    expect(wrapped.meta).toBeNull();
  });
});

describe("summary()", () => {
  it("returns summary for paginated results", () => {
    const raw = {
      success: true as const,
      result: { grants: [grantFixture, { ...grantFixture, agency: "NASA" }] },
      meta: { total_results: 100, pages: 50 },
    };
    const wrapped = wrapResponse(raw, "grants");
    expect(wrapped.summary()).toBe("grants: 2 of 100 results (50 pages)");
  });

  it("returns summary for statistics", () => {
    const raw = {
      success: true as const,
      result: {
        agency: [{ agency_name: "NASA", count: 100 }],
        request_date: [{ date: "2025-01-01", count: 50 }],
        org_names: [{ org_name: "HQ", count: 25 }],
      },
    };
    const wrapped = wrapResponse(raw, "statistics");
    expect(wrapped.summary()).toBe("statistics: 1 agencies, 1 dates, 1 organizations");
  });
});

describe("toMarkdown()", () => {
  it("generates markdown table", () => {
    const raw = {
      success: true as const,
      result: { grants: [grantFixture] },
      meta: { total_results: 1, pages: 1 },
    };
    const md = wrapResponse(raw, "grants").toMarkdown();
    expect(md).toContain("| date | agency |");
    expect(md).toContain("| DOE |");
  });

  it("generates multiple tables for statistics", () => {
    const raw = {
      success: true as const,
      result: {
        agency: [{ agency_name: "NASA", count: 100 }],
        request_date: [{ date: "2025-01-01", count: 50 }],
        org_names: [{ org_name: "HQ", count: 25 }],
      },
    };
    const md = wrapResponse(raw, "statistics").toMarkdown();
    expect(md).toContain("### agency");
    expect(md).toContain("### request_date");
    expect(md).toContain("### org_names");
  });
});

describe("toCSV()", () => {
  it("generates CSV with header", () => {
    const raw = {
      success: true as const,
      result: { grants: [grantFixture] },
      meta: { total_results: 1, pages: 1 },
    };
    const csv = wrapResponse(raw, "grants").toCSV();
    expect(csv).toContain("date,agency,recipient,value,savings,link,description");
    expect(csv).toContain("DOE");
  });

  it("escapes commas in values", () => {
    const raw = {
      success: true as const,
      result: { grants: [{ ...grantFixture, agency: "DOE, Energy" }] },
      meta: { total_results: 1, pages: 1 },
    };
    const csv = wrapResponse(raw, "grants").toCSV();
    expect(csv).toContain('"DOE, Energy"');
  });

  it("escapes quotes in values", () => {
    const raw = {
      success: true as const,
      result: { grants: [{ ...grantFixture, description: 'A "quoted" grant' }] },
      meta: { total_results: 1, pages: 1 },
    };
    const csv = wrapResponse(raw, "grants").toCSV();
    expect(csv).toContain('"A ""quoted"" grant"');
  });

  it("returns empty string for empty data", () => {
    const raw = {
      success: true as const,
      result: { grants: [] as typeof grantFixture[] },
      meta: { total_results: 0, pages: 0 },
    };
    const wrapped = wrapResponse(raw, "grants");
    expect(wrapped.toCSV()).toBe("");
    expect(wrapped.toMarkdown()).toBe("(no data)");
  });
});
