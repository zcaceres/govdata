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

function mockFetchCapture(fixture: string) {
  let captured: { url: string; init?: RequestInit } | undefined;
  globalThis.fetch = (async (url: string, init?: RequestInit) => {
    captured = { url, init };
    const data = await Bun.file(`${import.meta.dir}/../fixtures/${fixture}`).json();
    return new Response(JSON.stringify(data), { status: 200 });
  }) as unknown as typeof fetch;
  return () => captured;
}

// === Award Search ===

describe("_searchAwards", () => {
  it("returns awards with pagination meta", async () => {
    mockFetch("award-search-keyword.json");
    const result = await _searchAwards({ filters: { keywords: ["NASA"], award_type_codes: ["A"] } });
    expect(result.kind).toBe("awards");
    expect(result.data).toBeInstanceOf(Array);
    expect(result.data.length).toBeGreaterThan(0);
    expect(result.meta).toBeDefined();
    expect(result.meta!.pages).toBeGreaterThan(0);
  });

  it("works with no params (uses defaults including all award types)", async () => {
    mockFetch("award-search-keyword.json");
    const result = await _searchAwards();
    expect(result.kind).toBe("awards");
    expect(result.data.length).toBeGreaterThan(0);
  });

  it("sends correct POST body with filters", async () => {
    const getCapture = mockFetchCapture("award-search-keyword.json");
    await _searchAwards({
      filters: { keywords: ["test"], award_type_codes: ["A", "B"] },
      page: 2,
      limit: 5,
    });
    const captured = getCapture();
    expect(captured).toBeDefined();
    const body = JSON.parse(captured!.init?.body as string);
    expect(body.filters.keywords).toEqual(["test"]);
    expect(body.filters.award_type_codes).toEqual(["A", "B"]);
    expect(body.page).toBe(2);
    expect(body.limit).toBe(5);
    expect(captured!.init?.method).toBe("POST");
  });

  it("includes default fields in POST body", async () => {
    const getCapture = mockFetchCapture("award-search-keyword.json");
    await _searchAwards();
    const body = JSON.parse(getCapture()!.init?.body as string);
    expect(body.fields).toContain("Award ID");
    expect(body.fields).toContain("Recipient Name");
    expect(body.fields).toContain("Award Amount");
  });

  it("reports hasNext=true as pages > currentPage", async () => {
    mockFetch("award-search-keyword.json"); // hasNext: true, page: 1
    const result = await _searchAwards();
    expect(result.meta!.pages).toBeGreaterThan(1);
  });

  it("handles grants search by NAICS", async () => {
    mockFetch("award-search-grants-naics.json");
    const result = await _searchAwards({
      filters: {
        award_type_codes: ["02", "03", "04", "05"],
        naics_codes: { require: ["541330"] },
      },
    });
    expect(result.kind).toBe("awards");
  });

  it("handles loan results with different field names", async () => {
    mockFetch("award-search-loans.json");
    const result = await _searchAwards({
      filters: { award_type_codes: ["07", "08"] },
    });
    expect(result.kind).toBe("awards");
    expect(result.data.length).toBeGreaterThan(0);
  });

  it("handles subaward results", async () => {
    mockFetch("award-search-subawards.json");
    const result = await _searchAwards({
      filters: { keywords: ["NASA"], award_type_codes: ["A"] },
    });
    expect(result.kind).toBe("awards");
    expect(result.data.length).toBeGreaterThan(0);
  });
});

// === Award Detail ===

describe("_findAward", () => {
  it("returns contract award detail", async () => {
    mockFetch("award-detail-contract.json");
    const result = await _findAward("CONT_AWD_NNM07AB03C_8000_-NONE-_-NONE-");
    expect(result.kind).toBe("award");
    expect(result.data).toBeInstanceOf(Array);
    expect(result.data.length).toBe(1);
    expect(result.data[0].generated_unique_award_id).toBeTruthy();
    expect(result.data[0].category).toBe("contract");
    expect(result.data[0].piid).toBeTruthy();
    expect(result.meta).toBeNull();
  });

  it("returns grant award detail", async () => {
    mockFetch("award-detail-grant.json");
    const result = await _findAward("ASST_NON_80NSSC24K0476_8000");
    expect(result.kind).toBe("award");
    expect(result.data[0].category).toBe("grant");
    expect(result.data[0].fain).toBeTruthy();
  });

  it("encodes award ID in URL path", async () => {
    const getCapture = mockFetchCapture("award-detail-contract.json");
    await _findAward("CONT_AWD_TEST_ID");
    expect(getCapture()!.url).toContain("/api/v2/awards/CONT_AWD_TEST_ID/");
  });
});

// === Agency Overview ===

describe("_agencyOverview", () => {
  it("returns agency overview for NASA", async () => {
    mockFetch("agency-overview-nasa.json");
    const result = await _agencyOverview("080");
    expect(result.kind).toBe("agency");
    expect(result.data.length).toBe(1);
    expect(result.data[0].name).toContain("Aeronautics");
    expect(result.data[0].toptier_code).toBe("080");
    expect(result.meta).toBeNull();
  });

  it("returns agency overview for DoD", async () => {
    mockFetch("agency-overview-dod.json");
    const result = await _agencyOverview("097");
    expect(result.data[0].name).toContain("Defense");
  });

  it("encodes toptier code in URL", async () => {
    const getCapture = mockFetchCapture("agency-overview-nasa.json");
    await _agencyOverview("080");
    expect(getCapture()!.url).toContain("/api/v2/agency/080/");
  });
});

// === Spending by Agency ===

describe("_spendingByAgency", () => {
  it("returns spending breakdown by agency", async () => {
    mockFetch("spending-by-agency-fy2024.json");
    const result = await _spendingByAgency({
      type: "agency",
      filters: { fy: "2024", period: "12" },
    });
    expect(result.kind).toBe("spending_by_agency");
    expect(result.data).toBeInstanceOf(Array);
    expect(result.data.length).toBeGreaterThan(0);
    expect(result.data[0].name).toBeTruthy();
    expect(typeof result.data[0].amount).toBe("number");
  });

  it("works with quarter param", async () => {
    mockFetch("spending-by-agency-fy2023-q4.json");
    const result = await _spendingByAgency({
      type: "agency",
      filters: { fy: "2023", quarter: "4" },
    });
    expect(result.kind).toBe("spending_by_agency");
    expect(result.data.length).toBeGreaterThan(0);
  });

  it("works with federal_account type", async () => {
    mockFetch("spending-by-federal-account.json");
    const result = await _spendingByAgency({
      type: "federal_account",
      filters: { fy: "2024", period: "12" },
    });
    expect(result.kind).toBe("spending_by_agency");
    expect(result.data.length).toBeGreaterThan(0);
  });

  it("works with object_class type", async () => {
    mockFetch("spending-by-object-class.json");
    const result = await _spendingByAgency({
      type: "object_class",
      filters: { fy: "2024", period: "12" },
    });
    expect(result.data.length).toBeGreaterThan(0);
  });

  it("works with budget_function type", async () => {
    mockFetch("spending-by-budget-function.json");
    const result = await _spendingByAgency({
      type: "budget_function",
      filters: { fy: "2024", period: "12" },
    });
    expect(result.data.length).toBeGreaterThan(0);
  });

  it("sends correct POST body", async () => {
    const getCapture = mockFetchCapture("spending-by-agency-fy2024.json");
    await _spendingByAgency({
      type: "agency",
      filters: { fy: "2024", period: "12" },
    });
    const body = JSON.parse(getCapture()!.init?.body as string);
    expect(body.type).toBe("agency");
    expect(body.filters.fy).toBe("2024");
    expect(body.filters.period).toBe("12");
  });
});

// === Spending by State ===

describe("_spendingByState", () => {
  it("returns all states/territories", async () => {
    mockFetch("spending-by-state-all.json");
    const result = await _spendingByState();
    expect(result.kind).toBe("spending_by_state");
    expect(result.data).toBeInstanceOf(Array);
    expect(result.data.length).toBeGreaterThan(50);
    expect(result.meta).toBeNull();
  });

  it("state items have fips, code, name, amount", async () => {
    mockFetch("spending-by-state-all.json");
    const result = await _spendingByState();
    for (const state of result.data.slice(0, 5)) {
      expect(state.fips).toBeTruthy();
      expect(state.code).toBeTruthy();
      expect(state.name).toBeTruthy();
      expect(typeof state.amount).toBe("number");
    }
  });

  it("uses GET request", async () => {
    const getCapture = mockFetchCapture("spending-by-state-all.json");
    await _spendingByState();
    const captured = getCapture();
    expect(captured!.init).toBeUndefined(); // GET has no init
    expect(captured!.url).toContain("/api/v2/recipient/state/");
  });
});

// === Spending Over Time ===

describe("_spendingOverTime", () => {
  it("returns fiscal year grouping", async () => {
    mockFetch("spending-over-time-fy.json");
    const result = await _spendingOverTime({
      group: "fiscal_year",
      filters: { keywords: ["NASA"] },
    });
    expect(result.kind).toBe("spending_over_time");
    expect(result.data).toBeInstanceOf(Array);
    expect(result.data.length).toBeGreaterThan(0);
    expect(result.data[0].time_period).toHaveProperty("fiscal_year");
    expect(result.meta).toBeNull();
  });

  it("returns quarter grouping", async () => {
    mockFetch("spending-over-time-quarter.json");
    const result = await _spendingOverTime({
      group: "quarter",
      filters: { keywords: ["climate"] },
    });
    expect(result.data[0].time_period).toHaveProperty("quarter");
  });

  it("returns month grouping", async () => {
    mockFetch("spending-over-time-month.json");
    const result = await _spendingOverTime({
      group: "month",
      filters: { keywords: ["infrastructure"] },
    });
    expect(result.data[0].time_period).toHaveProperty("month");
  });

  it("sends correct POST body", async () => {
    const getCapture = mockFetchCapture("spending-over-time-fy.json");
    await _spendingOverTime({
      group: "fiscal_year",
      filters: { keywords: ["test"] },
    });
    const body = JSON.parse(getCapture()!.init?.body as string);
    expect(body.group).toBe("fiscal_year");
    expect(body.filters.keywords).toEqual(["test"]);
  });
});
