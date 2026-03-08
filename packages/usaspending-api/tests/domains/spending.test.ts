import { describe, it, expect, afterEach } from "bun:test";
import {
  _spendingByAgency,
  SpendingByAgencyParamsSchema,
  SpendingByAgencyResponseSchema,
  spendingEndpoints,
} from "../../src/domains/spending";
import type { SpendingKindMap } from "../../src/domains/spending";

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

describe("spending domain", () => {
  describe("_spendingByAgency", () => {
    it("returns spending breakdown by agency", async () => {
      mockFetch("spending/by-agency.json");
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

    it("works with federal_account type", async () => {
      mockFetch("spending/by-federal-account.json");
      const result = await _spendingByAgency({
        type: "federal_account",
        filters: { fy: "2024", period: "12" },
      });
      expect(result.kind).toBe("spending_by_agency");
      expect(result.data.length).toBeGreaterThan(0);
    });

    it("works with object_class type", async () => {
      mockFetch("spending/by-object-class.json");
      const result = await _spendingByAgency({
        type: "object_class",
        filters: { fy: "2024", period: "12" },
      });
      expect(result.data.length).toBeGreaterThan(0);
    });

    it("works with budget_function type", async () => {
      mockFetch("spending/by-budget-function.json");
      const result = await _spendingByAgency({
        type: "budget_function",
        filters: { fy: "2024", period: "12" },
      });
      expect(result.data.length).toBeGreaterThan(0);
    });

    it("sends correct POST body", async () => {
      const getCapture = mockFetchCapture("spending/by-agency.json");
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

  describe("SpendingByAgencyResponseSchema", () => {
    const fixtures = [
      "spending/by-agency.json",
      "spending/by-federal-account.json",
      "spending/by-object-class.json",
      "spending/by-budget-function.json",
    ];

    for (const fixture of fixtures) {
      it(`parses ${fixture}`, async () => {
        const data = await Bun.file(`${import.meta.dir}/../../fixtures/${fixture}`).json();
        const result = SpendingByAgencyResponseSchema.parse(data);
        expect(typeof result.total).toBe("number");
        expect(result.results).toBeInstanceOf(Array);
        expect(result.results.length).toBeGreaterThan(0);
      });
    }
  });

  describe("SpendingByAgencyParamsSchema", () => {
    it("validates type enum", () => {
      const valid = SpendingByAgencyParamsSchema.safeParse({
        type: "agency",
        filters: { fy: "2024" },
      });
      expect(valid.success).toBe(true);

      const invalid = SpendingByAgencyParamsSchema.safeParse({
        type: "invalid_type",
        filters: { fy: "2024" },
      });
      expect(invalid.success).toBe(false);
    });
  });

  describe("spendingEndpoints describe metadata", () => {
    it("has 1 endpoint", () => {
      expect(spendingEndpoints.length).toBe(1);
    });

    it("spending_by_agency endpoint has required params", () => {
      const ep = spendingEndpoints[0];
      expect(ep.name).toBe("spending_by_agency");
      expect(ep.params.find((p) => p.name === "type")?.required).toBe(true);
      expect(ep.params.find((p) => p.name === "fy")?.required).toBe(true);
    });
  });

  describe("SpendingKindMap type", () => {
    it("kind map resolves correctly", () => {
      const map: SpendingKindMap = { spending_by_agency: [] };
      expect(map.spending_by_agency).toBeInstanceOf(Array);
    });
  });
});
