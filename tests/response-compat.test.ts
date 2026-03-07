import { describe, it, expect, afterEach } from "bun:test";
import { grants, contracts, leases, payments, statistics } from "doge-api";
import type { GovResult } from "govdata-core";

/**
 * Response compatibility tests — verify that DogeResult objects returned by
 * doge-api endpoints satisfy the GovResult interface from core and that all
 * formatting methods produce correct output.
 */

const originalFetch = globalThis.fetch;

function mockFetch(body: unknown) {
  globalThis.fetch = (async () =>
    new Response(JSON.stringify(body), { status: 200 })) as unknown as typeof fetch;
}

afterEach(() => {
  globalThis.fetch = originalFetch;
});

const grantsFixture = {
  success: true,
  result: {
    grants: [
      { date: "1/1/2025", agency: "DOE", recipient: "University", value: 50000, savings: 10000, link: "https://example.com", description: "Research grant" },
      { date: "2/1/2025", agency: "NASA", recipient: "Lab Corp", value: 30000, savings: 5000, link: null, description: "Space stuff" },
    ],
  },
  meta: { total_results: 100, pages: 50 },
};

const statisticsFixture = {
  success: true,
  result: {
    agency: [{ agency_name: "NASA", count: 100 }, { agency_name: "DOE", count: 50 }],
    request_date: [{ date: "2025-01-01", count: 50 }],
    org_names: [{ org_name: "HQ", count: 25 }],
  },
};

describe("DogeResult satisfies GovResult", () => {
  it("grants result has all GovResult methods", async () => {
    mockFetch(grantsFixture);
    const result = await grants();

    // Structural GovResult check
    const gov: GovResult = result;
    expect(gov.kind).toBe("grants");
    expect(gov.data).toBeDefined();
    expect(gov.meta).toBeDefined();
    expect(typeof gov.toMarkdown).toBe("function");
    expect(typeof gov.toCSV).toBe("function");
    expect(typeof gov.summary).toBe("function");
  });

  it("statistics result has all GovResult methods", async () => {
    mockFetch(statisticsFixture);
    const result = await statistics();

    const gov: GovResult = result;
    expect(gov.kind).toBe("statistics");
    expect(typeof gov.toMarkdown).toBe("function");
    expect(typeof gov.toCSV).toBe("function");
    expect(typeof gov.summary).toBe("function");
  });
});

describe("formatting consistency", () => {
  it("toMarkdown produces table with headers for array data", async () => {
    mockFetch(grantsFixture);
    const result = await grants();
    const md = result.toMarkdown();

    expect(md).toContain("| date |");
    expect(md).toContain("| --- |");
    expect(md).toContain("| DOE |");
    expect(md).toContain("| NASA |");
  });

  it("toCSV produces comma-separated output with header", async () => {
    mockFetch(grantsFixture);
    const result = await grants();
    const csv = result.toCSV();
    const lines = csv.split("\n");

    expect(lines[0]).toContain("date,agency,recipient");
    expect(lines.length).toBe(3); // header + 2 rows
    expect(csv).toContain("DOE");
  });

  it("toCSV escapes values with commas", async () => {
    mockFetch({
      ...grantsFixture,
      result: {
        grants: [{ ...grantsFixture.result.grants[0], agency: "DOE, Energy" }],
      },
    });
    const result = await grants();
    expect(result.toCSV()).toContain('"DOE, Energy"');
  });

  it("summary includes kind and count for array data", async () => {
    mockFetch(grantsFixture);
    const result = await grants();
    expect(result.summary()).toBe("grants: 2 of 100 results (50 pages)");
  });

  it("statistics summary uses custom labels", async () => {
    mockFetch(statisticsFixture);
    const result = await statistics();
    expect(result.summary()).toBe("statistics: 2 agencies, 1 dates, 1 organizations");
  });

  it("statistics toMarkdown produces section headers", async () => {
    mockFetch(statisticsFixture);
    const result = await statistics();
    const md = result.toMarkdown();

    expect(md).toContain("### agency");
    expect(md).toContain("### request_date");
    expect(md).toContain("### org_names");
    expect(md).toContain("NASA");
  });

  it("statistics toCSV produces section headers", async () => {
    mockFetch(statisticsFixture);
    const result = await statistics();
    const csv = result.toCSV();

    expect(csv).toContain("# agency");
    expect(csv).toContain("# request_date");
    expect(csv).toContain("# org_names");
  });

  it("empty data returns (no data) for markdown", async () => {
    mockFetch({
      success: true,
      result: { grants: [] },
      meta: { total_results: 0, pages: 0 },
    });
    const result = await grants();
    expect(result.toMarkdown()).toBe("(no data)");
    expect(result.toCSV()).toBe("");
  });
});
