import { describe, it, expect, afterEach } from "bun:test";
import {
  _financialFederalObligations,
  _financialBalances,
  _financialSpendingMajorObjectClass,
  _financialSpendingObjectClass,
  FederalObligationsResponseSchema,
  FinancialBalancesResponseSchema,
  SpendingMajorObjectClassResponseSchema,
  SpendingObjectClassResponseSchema,
  financialEndpoints,
} from "../../src/domains/financial";
import type { FinancialKindMap } from "../../src/domains/financial";

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

describe("financial domain", () => {
  describe("_financialFederalObligations", () => {
    it("returns federal obligations array", async () => {
      mockFetch("financial/federal-obligations.json");
      const result = await _financialFederalObligations({ funding_agency_id: 1125, fiscal_year: 2024 });
      expect(result.kind).toBe("financial_federal_obligations");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.meta).not.toBeNull();
    });

    it("items have account_title, account_number, obligated_amount", async () => {
      mockFetch("financial/federal-obligations.json");
      const result = await _financialFederalObligations({ funding_agency_id: 1125, fiscal_year: 2024 });
      const item = result.data[0];
      expect(item.account_title).toBe("Salaries and Expenses, Federal Mediation and Conciliation Service");
      expect(item.account_number).toBe("093-0100");
      expect(item.obligated_amount).toBe("56187993.41");
    });

    it("uses GET request to correct URL with query params", async () => {
      const getCapture = mockFetchCapture("financial/federal-obligations.json");
      await _financialFederalObligations({ funding_agency_id: 1125, fiscal_year: 2024 });
      const captured = getCapture();
      expect(captured!.init).toBeUndefined();
      expect(captured!.url).toContain("/api/v2/federal_obligations/");
      expect(captured!.url).toContain("funding_agency_id=1125");
      expect(captured!.url).toContain("fiscal_year=2024");
    });

    it("passes optional page and limit params", async () => {
      const getCapture = mockFetchCapture("financial/federal-obligations.json");
      await _financialFederalObligations({ funding_agency_id: 1125, fiscal_year: 2024, page: 2, limit: 25 });
      const captured = getCapture();
      expect(captured!.url).toContain("page=2");
      expect(captured!.url).toContain("limit=25");
    });
  });

  describe("_financialBalances", () => {
    it("returns financial balances array (may be empty)", async () => {
      mockFetch("financial/financial-balances.json");
      const result = await _financialBalances({ funding_agency_id: 1125, fiscal_year: 2024 });
      expect(result.kind).toBe("financial_balances");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.meta).not.toBeNull();
    });

    it("uses GET request to correct URL with query params", async () => {
      const getCapture = mockFetchCapture("financial/financial-balances.json");
      await _financialBalances({ funding_agency_id: 1125, fiscal_year: 2024 });
      const captured = getCapture();
      expect(captured!.init).toBeUndefined();
      expect(captured!.url).toContain("/api/v2/financial_balances/agencies/");
      expect(captured!.url).toContain("funding_agency_id=1125");
      expect(captured!.url).toContain("fiscal_year=2024");
    });
  });

  describe("_financialSpendingMajorObjectClass", () => {
    it("returns spending by major object class array (may be empty)", async () => {
      mockFetch("financial/spending-major-object-class.json");
      const result = await _financialSpendingMajorObjectClass({ fiscal_year: 2024, funding_agency_id: 1125 });
      expect(result.kind).toBe("financial_spending_major_object_class");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.meta).not.toBeNull();
    });

    it("uses GET request to correct URL with query params", async () => {
      const getCapture = mockFetchCapture("financial/spending-major-object-class.json");
      await _financialSpendingMajorObjectClass({ fiscal_year: 2024, funding_agency_id: 1125 });
      const captured = getCapture();
      expect(captured!.init).toBeUndefined();
      expect(captured!.url).toContain("/api/v2/financial_spending/major_object_class/");
      expect(captured!.url).toContain("fiscal_year=2024");
      expect(captured!.url).toContain("funding_agency_id=1125");
    });
  });

  describe("_financialSpendingObjectClass", () => {
    it("returns spending by object class array (may be empty)", async () => {
      mockFetch("financial/spending-object-class.json");
      const result = await _financialSpendingObjectClass({ fiscal_year: 2024, funding_agency_id: 1125 });
      expect(result.kind).toBe("financial_spending_object_class");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBe(0);
      expect(result.meta).not.toBeNull();
    });

    it("uses GET request to correct URL with query params", async () => {
      const getCapture = mockFetchCapture("financial/spending-object-class.json");
      await _financialSpendingObjectClass({ fiscal_year: 2024, funding_agency_id: 1125, major_object_class_code: 25 });
      const captured = getCapture();
      expect(captured!.init).toBeUndefined();
      expect(captured!.url).toContain("/api/v2/financial_spending/object_class/");
      expect(captured!.url).toContain("fiscal_year=2024");
      expect(captured!.url).toContain("funding_agency_id=1125");
      expect(captured!.url).toContain("major_object_class_code=25");
    });
  });

  describe("schema parsing", () => {
    it("FederalObligationsResponseSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/financial/federal-obligations.json`).json();
      const result = FederalObligationsResponseSchema.parse(data);
      expect(result.results.length).toBe(1);
      expect(result.page_metadata.page).toBe(1);
      expect(result.results[0].account_title).toBe("Salaries and Expenses, Federal Mediation and Conciliation Service");
    });

    it("FinancialBalancesResponseSchema parses fixture (empty results)", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/financial/financial-balances.json`).json();
      const result = FinancialBalancesResponseSchema.parse(data);
      expect(result.results).toBeInstanceOf(Array);
      expect(result.page_metadata.has_next_page).toBe(false);
    });

    it("SpendingMajorObjectClassResponseSchema parses fixture (empty results)", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/financial/spending-major-object-class.json`).json();
      const result = SpendingMajorObjectClassResponseSchema.parse(data);
      expect(result.results).toBeInstanceOf(Array);
    });

    it("SpendingObjectClassResponseSchema parses fixture (empty results)", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/financial/spending-object-class.json`).json();
      const result = SpendingObjectClassResponseSchema.parse(data);
      expect(result.results).toBeInstanceOf(Array);
      expect(result.results.length).toBe(0);
      expect(result.page_metadata.page).toBe(1);
    });
  });

  describe("financialEndpoints describe metadata", () => {
    it("has 4 endpoints", () => {
      expect(financialEndpoints.length).toBe(4);
    });

    it("financial_federal_obligations requires funding_agency_id and fiscal_year", () => {
      const ep = financialEndpoints.find(e => e.name === "financial_federal_obligations");
      expect(ep).toBeDefined();
      const required = ep!.params.filter(p => p.required);
      expect(required.length).toBe(2);
      const requiredNames = required.map(p => p.name).sort();
      expect(requiredNames).toEqual(["fiscal_year", "funding_agency_id"]);
    });

    it("financial_spending_object_class has optional major_object_class_code", () => {
      const ep = financialEndpoints.find(e => e.name === "financial_spending_object_class");
      expect(ep).toBeDefined();
      const optional = ep!.params.find(p => p.name === "major_object_class_code");
      expect(optional).toBeDefined();
      expect(optional!.required).toBe(false);
    });

    it("all endpoints have name, path, params, and responseFields", () => {
      for (const ep of financialEndpoints) {
        expect(ep.name.length).toBeGreaterThan(0);
        expect(ep.path.length).toBeGreaterThan(0);
        expect(ep.params).toBeInstanceOf(Array);
        expect(ep.responseFields.length).toBeGreaterThan(0);
      }
    });

    it("all endpoints have descriptions", () => {
      for (const ep of financialEndpoints) {
        expect(ep.description.length).toBeGreaterThan(0);
      }
    });
  });

  describe("FinancialKindMap type", () => {
    it("kind map resolves correctly", () => {
      const map: FinancialKindMap = {
        financial_federal_obligations: [],
        financial_balances: [],
        financial_spending_major_object_class: [],
        financial_spending_object_class: [],
      };
      expect(map.financial_federal_obligations).toBeInstanceOf(Array);
      expect(map.financial_balances).toBeInstanceOf(Array);
      expect(map.financial_spending_major_object_class).toBeInstanceOf(Array);
      expect(map.financial_spending_object_class).toBeInstanceOf(Array);
    });
  });
});
