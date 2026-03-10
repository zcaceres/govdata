import { describe, it, expect, afterEach } from "bun:test";
import {
  _searchAwards,
  _findAward,
  _agencyOverview,
  _spendingByAgency,
  _spendingByState,
  _spendingOverTime,
} from "../src/endpoints";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function mockFetch(fixture: string) {
  globalThis.fetch = (async () => {
    const data = await Bun.file(`${import.meta.dir}/../fixtures/${fixture}`).json();
    return new Response(JSON.stringify(data), { status: 200 });
  }) as unknown as typeof fetch;
}

describe("toMarkdown()", () => {
  it("produces table for award search results", async () => {
    mockFetch("award-search-keyword.json");
    const result = await _searchAwards();
    const md = result.toMarkdown();
    expect(md).toContain("|");
    expect(md).toContain("---");
    expect(md).toContain("internal_id");
  });

  it("produces table for single award detail", async () => {
    mockFetch("award-detail-contract.json");
    const result = await _findAward("test");
    const md = result.toMarkdown();
    expect(md).toContain("|");
    expect(md).toContain("generated_unique_award_id");
  });

  it("produces table for agency overview", async () => {
    mockFetch("agency-overview-nasa.json");
    const result = await _agencyOverview("080");
    const md = result.toMarkdown();
    expect(md).toContain("|");
    expect(md).toContain("toptier_code");
  });

  it("produces table for spending by agency", async () => {
    mockFetch("spending-by-agency-fy2024.json");
    const result = await _spendingByAgency({ type: "agency", filters: { fy: "2024", period: "12" } });
    const md = result.toMarkdown();
    expect(md).toContain("|");
    expect(md).toContain("name");
    expect(md).toContain("amount");
  });

  it("produces table for spending by state", async () => {
    mockFetch("spending-by-state-all.json");
    const result = await _spendingByState();
    const md = result.toMarkdown();
    expect(md).toContain("|");
    expect(md).toContain("California");
  });

  it("produces table for spending over time", async () => {
    mockFetch("spending-over-time-fy.json");
    const result = await _spendingOverTime({ group: "fiscal_year", filters: {} });
    const md = result.toMarkdown();
    expect(md).toContain("|");
    expect(md).toContain("aggregated_amount");
  });
});

describe("toCSV()", () => {
  it("produces comma-separated output for awards", async () => {
    mockFetch("award-search-keyword.json");
    const result = await _searchAwards();
    const csv = result.toCSV();
    expect(csv).toContain(",");
    expect(csv.split("\n").length).toBeGreaterThan(1);
  });

  it("produces CSV for spending by state", async () => {
    mockFetch("spending-by-state-all.json");
    const result = await _spendingByState();
    const csv = result.toCSV();
    expect(csv).toContain("fips");
    expect(csv).toContain("California");
    const lines = csv.split("\n");
    expect(lines.length).toBeGreaterThan(50);
  });

  it("produces CSV for spending over time", async () => {
    mockFetch("spending-over-time-fy.json");
    const result = await _spendingOverTime({ group: "fiscal_year", filters: {} });
    const csv = result.toCSV();
    expect(csv).toContain("aggregated_amount");
  });
});

describe("summary()", () => {
  it("includes kind name for awards", async () => {
    mockFetch("award-search-keyword.json");
    const result = await _searchAwards();
    const summary = result.summary();
    expect(summary).toContain("awards");
    expect(summary).toContain("results");
  });

  it("includes kind name for award detail", async () => {
    mockFetch("award-detail-contract.json");
    const result = await _findAward("test");
    expect(result.summary()).toContain("award");
  });

  it("includes kind for spending_by_state", async () => {
    mockFetch("spending-by-state-all.json");
    const result = await _spendingByState();
    expect(result.summary()).toContain("spending_by_state");
  });

  it("includes kind for spending_over_time", async () => {
    mockFetch("spending-over-time-fy.json");
    const result = await _spendingOverTime({ group: "fiscal_year", filters: {} });
    expect(result.summary()).toContain("spending_over_time");
  });

  it("includes kind for spending_by_agency", async () => {
    mockFetch("spending-by-agency-fy2024.json");
    const result = await _spendingByAgency({ type: "agency", filters: { fy: "2024", period: "12" } });
    expect(result.summary()).toContain("spending_by_agency");
  });

  it("includes kind for agency", async () => {
    mockFetch("agency-overview-nasa.json");
    const result = await _agencyOverview("080");
    expect(result.summary()).toContain("agency");
  });
});

describe("formatting does not throw on any fixture", () => {
  const endpointFixtures = [
    { fn: () => _searchAwards(), fixture: "award-search-keyword.json" },
    { fn: () => _searchAwards({ filters: { award_type_codes: ["07"] } }), fixture: "award-search-loans.json" },
    { fn: () => _searchAwards({ filters: { award_type_codes: ["A"] } }), fixture: "award-search-subawards.json" },
    { fn: () => _findAward("test"), fixture: "award-detail-contract.json" },
    { fn: () => _findAward("test"), fixture: "award-detail-grant.json" },
    { fn: () => _agencyOverview("080"), fixture: "agency-overview-nasa.json" },
    { fn: () => _agencyOverview("097"), fixture: "agency-overview-dod.json" },
    { fn: () => _spendingByAgency({ type: "agency", filters: { fy: "2024", period: "12" } }), fixture: "spending-by-agency-fy2024.json" },
    { fn: () => _spendingByAgency({ type: "object_class", filters: { fy: "2024", period: "12" } }), fixture: "spending-by-object-class.json" },
    { fn: () => _spendingByState(), fixture: "spending-by-state-all.json" },
    { fn: () => _spendingOverTime({ group: "fiscal_year", filters: {} }), fixture: "spending-over-time-fy.json" },
    { fn: () => _spendingOverTime({ group: "quarter", filters: {} }), fixture: "spending-over-time-quarter.json" },
    { fn: () => _spendingOverTime({ group: "month", filters: {} }), fixture: "spending-over-time-month.json" },
  ];

  for (const { fn, fixture } of endpointFixtures) {
    it(`formatting works for ${fixture}`, async () => {
      mockFetch(fixture);
      const result = await fn();
      expect(() => result.toMarkdown()).not.toThrow();
      expect(() => result.toCSV()).not.toThrow();
      expect(() => result.summary()).not.toThrow();
      expect(typeof result.toMarkdown()).toBe("string");
      expect(typeof result.toCSV()).toBe("string");
      expect(typeof result.summary()).toBe("string");
    });
  }
});
