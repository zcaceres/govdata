import { describe, it, expect, afterEach } from "bun:test";
import {
  _searchAwards,
  _spendingOverTime,
  _spendingByAwardCount,
  _spendingByCategory,
  _spendingByGeography,
  _spendingByTransaction,
  _spendingByTransactionCount,
  _spendingByTransactionGrouped,
  _spendingBySubawardGrouped,
  _newAwardsOverTime,
  _transactionSpendingSummary,
  AwardSearchResponseSchema,
  AwardSearchParamsSchema,
  SpendingOverTimeResponseSchema,
  SpendingOverTimeParamsSchema,
  AwardCountResponseSchema,
  CategoryResponseSchema,
  GeographyResponseSchema,
  TransactionResponseSchema,
  TransactionCountResponseSchema,
  TransactionGroupedResponseSchema,
  SubawardGroupedResponseSchema,
  NewAwardsOverTimeResponseSchema,
  TransactionSpendingSummaryResponseSchema,
  searchEndpoints,
  CATEGORY_SUB_PATHS,
} from "../../src/domains/search";
import type { SearchKindMap } from "../../src/domains/search";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function mockFetch(fixture: string) {
  globalThis.fetch = (async () => {
    const data = await Bun.file(`${import.meta.dir}/../../fixtures/${fixture}`).json();
    return new Response(JSON.stringify(data), { status: 200 });
  }) as unknown as typeof fetch;
}

function mockFetchCapture(fixture: string) {
  let captured: { url: string; init?: RequestInit } | undefined;
  globalThis.fetch = (async (url: string, init?: RequestInit) => {
    captured = { url, init };
    const data = await Bun.file(`${import.meta.dir}/../../fixtures/${fixture}`).json();
    return new Response(JSON.stringify(data), { status: 200 });
  }) as unknown as typeof fetch;
  return () => captured;
}

describe("search domain", () => {
  describe("_searchAwards", () => {
    it("returns awards with pagination meta", async () => {
      mockFetch("search/spending-by-award.json");
      const result = await _searchAwards({ filters: { keywords: ["NASA"], award_type_codes: ["A"] } });
      expect(result.kind).toBe("awards");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.meta).toBeDefined();
      expect(result.meta!.pages).toBeGreaterThan(0);
    });

    it("works with no params", async () => {
      mockFetch("search/spending-by-award.json");
      const result = await _searchAwards();
      expect(result.kind).toBe("awards");
      expect(result.data.length).toBeGreaterThan(0);
    });

    it("sends correct POST body", async () => {
      const getCapture = mockFetchCapture("search/spending-by-award.json");
      await _searchAwards({
        filters: { keywords: ["test"], award_type_codes: ["A", "B"] },
        page: 2,
        limit: 5,
      });
      const captured = getCapture();
      const body = JSON.parse(captured!.init?.body as string);
      expect(body.filters.keywords).toEqual(["test"]);
      expect(body.page).toBe(2);
      expect(body.limit).toBe(5);
      expect(captured!.init?.method).toBe("POST");
    });
  });

  describe("_spendingOverTime", () => {
    it("returns fiscal year grouping", async () => {
      mockFetch("search/spending-over-time-fy.json");
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
      mockFetch("search/spending-over-time-quarter.json");
      const result = await _spendingOverTime({
        group: "quarter",
        filters: { keywords: ["climate"] },
      });
      expect(result.data[0].time_period).toHaveProperty("quarter");
    });

    it("returns month grouping", async () => {
      mockFetch("search/spending-over-time-month.json");
      const result = await _spendingOverTime({
        group: "month",
        filters: { keywords: ["infrastructure"] },
      });
      expect(result.data[0].time_period).toHaveProperty("month");
    });

    it("sends correct POST body", async () => {
      const getCapture = mockFetchCapture("search/spending-over-time-fy.json");
      await _spendingOverTime({
        group: "fiscal_year",
        filters: { keywords: ["test"] },
      });
      const body = JSON.parse(getCapture()!.init?.body as string);
      expect(body.group).toBe("fiscal_year");
      expect(body.filters.keywords).toEqual(["test"]);
    });
  });

  // --- New endpoint tests ---

  describe("_spendingByAwardCount", () => {
    it("returns count map by award type", async () => {
      mockFetch("search/spending-by-award-count.json");
      const result = await _spendingByAwardCount({ filters: { keywords: ["NASA"] } });
      expect(result.kind).toBe("award_count");
      expect(typeof result.data.contracts).toBe("number");
      expect(typeof result.data.grants).toBe("number");
      expect(typeof result.data.loans).toBe("number");
      expect(result.meta).toBeNull();
    });

    it("sends POST with filters", async () => {
      const getCapture = mockFetchCapture("search/spending-by-award-count.json");
      await _spendingByAwardCount({ filters: { keywords: ["test"] } });
      const body = JSON.parse(getCapture()!.init?.body as string);
      expect(body.filters.keywords).toEqual(["test"]);
    });
  });

  describe("_spendingByCategory", () => {
    it("returns category results for naics", async () => {
      mockFetch("search/category-naics.json");
      const result = await _spendingByCategory("naics", {
        filters: { keywords: ["NASA"] },
      });
      expect(result.kind).toBe("category");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0]).toHaveProperty("code");
      expect(result.data[0]).toHaveProperty("name");
      expect(result.data[0]).toHaveProperty("amount");
    });

    it("sends correct sub-path URL", async () => {
      const getCapture = mockFetchCapture("search/category-naics.json");
      await _spendingByCategory("naics", { filters: {} });
      expect(getCapture()!.url).toContain("/spending_by_category/naics/");
    });

    it("returns pagination meta", async () => {
      mockFetch("search/category-naics.json");
      const result = await _spendingByCategory("naics", { filters: {} });
      expect(result.meta).toBeDefined();
      expect(result.meta!.pages).toBeGreaterThan(0);
    });

    // Test a few representative sub-paths
    for (const subPath of ["awarding_agency", "psc", "recipient", "state_territory"] as const) {
      it(`works for sub-path: ${subPath}`, async () => {
        mockFetch(`search/category-${subPath.replace(/_/g, "_")}.json`);
        const result = await _spendingByCategory(subPath, { filters: {} });
        expect(result.kind).toBe("category");
        expect(result.data).toBeInstanceOf(Array);
      });
    }
  });

  describe("_spendingByGeography", () => {
    it("returns geography results for states", async () => {
      mockFetch("search/geography-state.json");
      const result = await _spendingByGeography({
        filters: { keywords: ["NASA"] },
        scope: "place_of_performance",
        geo_layer: "state",
      });
      expect(result.kind).toBe("geography");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0]).toHaveProperty("shape_code");
      expect(result.data[0]).toHaveProperty("display_name");
      expect(result.data[0]).toHaveProperty("aggregated_amount");
      expect(result.data[0]).toHaveProperty("per_capita");
    });

    it("works for county layer", async () => {
      mockFetch("search/geography-county.json");
      const result = await _spendingByGeography({
        filters: { keywords: ["NASA"] },
        geo_layer: "county",
      });
      expect(result.kind).toBe("geography");
      expect(result.data).toBeInstanceOf(Array);
    });

    it("works for district layer", async () => {
      mockFetch("search/geography-district.json");
      const result = await _spendingByGeography({
        filters: { keywords: ["NASA"] },
        geo_layer: "district",
      });
      expect(result.kind).toBe("geography");
      expect(result.data).toBeInstanceOf(Array);
    });
  });

  describe("_spendingByTransaction", () => {
    it("returns transaction results with pagination", async () => {
      mockFetch("search/spending-by-transaction.json");
      const result = await _spendingByTransaction({
        filters: { keywords: ["NASA"] },
      });
      expect(result.kind).toBe("transactions");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0]).toHaveProperty("Award ID");
      expect(result.data[0]).toHaveProperty("Recipient Name");
      expect(result.data[0]).toHaveProperty("Transaction Amount");
      expect(result.meta).toBeDefined();
      expect(result.meta!.pages).toBeGreaterThan(0);
    });
  });

  describe("_spendingByTransactionCount", () => {
    it("returns count map", async () => {
      mockFetch("search/spending-by-transaction-count.json");
      const result = await _spendingByTransactionCount({ filters: { keywords: ["NASA"] } });
      expect(result.kind).toBe("transaction_count");
      expect(typeof result.data.contracts).toBe("number");
      expect(result.meta).toBeNull();
    });
  });

  describe("_spendingByTransactionGrouped", () => {
    it("returns grouped transaction results", async () => {
      mockFetch("search/spending-by-transaction-grouped.json");
      const result = await _spendingByTransactionGrouped({
        filters: { keywords: ["NASA"] },
      });
      expect(result.kind).toBe("transaction_grouped");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0]).toHaveProperty("award_id");
      expect(result.data[0]).toHaveProperty("transaction_count");
      expect(result.data[0]).toHaveProperty("transaction_obligation");
    });
  });

  describe("_spendingBySubawardGrouped", () => {
    it("returns grouped subaward results", async () => {
      mockFetch("search/spending-by-subaward-grouped.json");
      const result = await _spendingBySubawardGrouped({
        filters: { keywords: ["NASA"] },
      });
      expect(result.kind).toBe("subaward_grouped");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0]).toHaveProperty("award_id");
      expect(result.data[0]).toHaveProperty("subaward_count");
      expect(result.data[0]).toHaveProperty("subaward_obligation");
    });
  });

  describe("_newAwardsOverTime", () => {
    it("returns new award counts over time", async () => {
      mockFetch("search/new-awards-over-time.json");
      const result = await _newAwardsOverTime({
        group: "fiscal_year",
        filters: { keywords: ["NASA"] },
      });
      expect(result.kind).toBe("new_awards_over_time");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0]).toHaveProperty("new_award_count_in_period");
      expect(result.data[0]).toHaveProperty("time_period");
      expect(result.meta).toBeNull();
    });
  });

  describe("_transactionSpendingSummary", () => {
    it("returns summary totals", async () => {
      mockFetch("search/transaction-spending-summary.json");
      const result = await _transactionSpendingSummary({
        filters: { keywords: ["NASA"] },
      });
      expect(result.kind).toBe("transaction_spending_summary");
      expect(typeof result.data.prime_awards_count).toBe("number");
      expect(typeof result.data.prime_awards_obligation_amount).toBe("number");
      expect(result.meta).toBeNull();
    });
  });

  // --- Schema parsing against real fixtures ---

  describe("schema parsing", () => {
    it("AwardSearchResponseSchema parses real fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/search/spending-by-award.json`).json();
      const result = AwardSearchResponseSchema.parse(data);
      expect(result.results).toBeInstanceOf(Array);
      expect(result.results.length).toBeGreaterThan(0);
      expect(typeof result.page_metadata.hasNext).toBe("boolean");
    });

    it("SpendingOverTimeResponseSchema parses real fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/search/spending-over-time-fy.json`).json();
      const result = SpendingOverTimeResponseSchema.parse(data);
      expect(result.group).toBe("fiscal_year");
      expect(result.results.length).toBeGreaterThan(0);
      expect(typeof result.results[0].aggregated_amount).toBe("number");
    });

    it("AwardCountResponseSchema parses real fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/search/spending-by-award-count.json`).json();
      const result = AwardCountResponseSchema.parse(data);
      expect(typeof result.results.contracts).toBe("number");
      expect(typeof result.results.grants).toBe("number");
    });

    it("CategoryResponseSchema parses all 15 category fixtures", async () => {
      for (const subPath of CATEGORY_SUB_PATHS) {
        const fileName = `category-${subPath.replace(/_/g, "_")}.json`;
        const data = await Bun.file(`${import.meta.dir}/../../fixtures/search/${fileName}`).json();
        const result = CategoryResponseSchema.parse(data);
        expect(result.results).toBeInstanceOf(Array);
        expect(result.category).toBe(subPath);
      }
    });

    it("GeographyResponseSchema parses state fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/search/geography-state.json`).json();
      const result = GeographyResponseSchema.parse(data);
      expect(result.results).toBeInstanceOf(Array);
      expect(result.scope).toBe("place_of_performance");
      expect(result.geo_layer).toBe("state");
    });

    it("GeographyResponseSchema parses county fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/search/geography-county.json`).json();
      const result = GeographyResponseSchema.parse(data);
      expect(result.geo_layer).toBe("county");
    });

    it("GeographyResponseSchema parses district fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/search/geography-district.json`).json();
      const result = GeographyResponseSchema.parse(data);
      expect(result.geo_layer).toBe("district");
    });

    it("TransactionResponseSchema parses real fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/search/spending-by-transaction.json`).json();
      const result = TransactionResponseSchema.parse(data);
      expect(result.results).toBeInstanceOf(Array);
      expect(result.results.length).toBeGreaterThan(0);
    });

    it("TransactionCountResponseSchema parses real fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/search/spending-by-transaction-count.json`).json();
      const result = TransactionCountResponseSchema.parse(data);
      expect(typeof result.results.contracts).toBe("number");
    });

    it("TransactionGroupedResponseSchema parses real fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/search/spending-by-transaction-grouped.json`).json();
      const result = TransactionGroupedResponseSchema.parse(data);
      expect(result.results).toBeInstanceOf(Array);
      expect(result.results[0]).toHaveProperty("transaction_count");
    });

    it("SubawardGroupedResponseSchema parses real fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/search/spending-by-subaward-grouped.json`).json();
      const result = SubawardGroupedResponseSchema.parse(data);
      expect(result.results).toBeInstanceOf(Array);
      expect(result.results[0]).toHaveProperty("subaward_count");
    });

    it("NewAwardsOverTimeResponseSchema parses real fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/search/new-awards-over-time.json`).json();
      const result = NewAwardsOverTimeResponseSchema.parse(data);
      expect(result.results).toBeInstanceOf(Array);
      expect(result.results[0]).toHaveProperty("new_award_count_in_period");
    });

    it("TransactionSpendingSummaryResponseSchema parses real fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/search/transaction-spending-summary.json`).json();
      const result = TransactionSpendingSummaryResponseSchema.parse(data);
      expect(typeof result.results.prime_awards_count).toBe("number");
      expect(typeof result.results.prime_awards_obligation_amount).toBe("number");
    });
  });

  // --- Param validation ---

  describe("param schema validation", () => {
    it("AwardSearchParamsSchema accepts valid params", () => {
      const result = AwardSearchParamsSchema.safeParse({
        filters: { keywords: ["NASA"] },
        page: 1,
        limit: 10,
      });
      expect(result.success).toBe(true);
    });

    it("AwardSearchParamsSchema requires filters", () => {
      const result = AwardSearchParamsSchema.safeParse({ page: 1 });
      expect(result.success).toBe(false);
    });

    it("SpendingOverTimeParamsSchema validates group enum", () => {
      for (const group of ["fiscal_year", "quarter", "month"]) {
        const result = SpendingOverTimeParamsSchema.safeParse({ group, filters: {} });
        expect(result.success).toBe(true);
      }
    });
  });

  // --- Describe metadata ---

  describe("searchEndpoints describe metadata", () => {
    it("has 25 search endpoints", () => {
      expect(searchEndpoints.length).toBe(25);
    });

    it("awards endpoint exists with expected params", () => {
      const ep = searchEndpoints.find((e) => e.name === "awards");
      expect(ep).toBeDefined();
      expect(ep!.params.find((p) => p.name === "keyword")).toBeDefined();
      expect(ep!.responseFields.length).toBeGreaterThan(0);
    });

    it("spending_over_time endpoint exists", () => {
      const ep = searchEndpoints.find((e) => e.name === "spending_over_time");
      expect(ep).toBeDefined();
      expect(ep!.params.find((p) => p.name === "group")?.required).toBe(true);
    });

    it("all 15 category endpoints exist", () => {
      for (const subPath of CATEGORY_SUB_PATHS) {
        const ep = searchEndpoints.find((e) => e.name === `category_${subPath}`);
        expect(ep).toBeDefined();
        expect(ep!.path).toContain(`/spending_by_category/${subPath}/`);
      }
    });

    it("geography endpoint exists", () => {
      const ep = searchEndpoints.find((e) => e.name === "spending_by_geography");
      expect(ep).toBeDefined();
      expect(ep!.params.find((p) => p.name === "scope")).toBeDefined();
      expect(ep!.params.find((p) => p.name === "geo_layer")).toBeDefined();
    });

    it("all new endpoints have response fields", () => {
      const newNames = [
        "award_count", "spending_by_geography", "transactions",
        "transaction_count", "transaction_grouped", "subaward_grouped",
        "new_awards_over_time", "transaction_spending_summary",
      ];
      for (const name of newNames) {
        const ep = searchEndpoints.find((e) => e.name === name);
        expect(ep).toBeDefined();
        expect(ep!.responseFields.length).toBeGreaterThan(0);
      }
    });
  });

  describe("SearchKindMap type", () => {
    it("kind map resolves correctly for all kinds", () => {
      const map: SearchKindMap = {
        awards: [],
        spending_over_time: [],
        award_count: { contracts: 0, direct_payments: 0, grants: 0, idvs: 0, loans: 0, other: 0 },
        category: [],
        geography: [],
        transactions: [],
        transaction_count: { contracts: 0, direct_payments: 0, grants: 0, idvs: 0, loans: 0, other: 0 },
        transaction_grouped: [],
        subaward_grouped: [],
        new_awards_over_time: [],
        transaction_spending_summary: { prime_awards_count: 0, prime_awards_obligation_amount: 0 },
      };
      expect(map.awards).toBeInstanceOf(Array);
      expect(typeof map.award_count.contracts).toBe("number");
      expect(typeof map.transaction_spending_summary.prime_awards_count).toBe("number");
    });
  });
});
