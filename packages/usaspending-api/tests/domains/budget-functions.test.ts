import { describe, it, expect, afterEach } from "bun:test";
import {
  _budgetFunctionList,
  _budgetFunctionSubfunctions,
  BudgetFunctionListResponseSchema,
  BudgetSubfunctionListResponseSchema,
  budgetFunctionsEndpoints,
} from "../../src/domains/budget-functions";
import type { BudgetFunctionsKindMap } from "../../src/domains/budget-functions";

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

describe("budget-functions domain", () => {
  describe("_budgetFunctionList", () => {
    it("returns budget function list array", async () => {
      mockFetch("budget-functions/list.json");
      const result = await _budgetFunctionList();
      expect(result.kind).toBe("budget_function_list");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBe(20);
      expect(result.meta).toBeNull();
    });

    it("items have budget_function_code and budget_function_title", async () => {
      mockFetch("budget-functions/list.json");
      const result = await _budgetFunctionList();
      const item = result.data[0];
      expect(item.budget_function_code).toBe("750");
      expect(item.budget_function_title).toBe("Administration of Justice");
    });

    it("uses GET request to correct URL", async () => {
      const getCapture = mockFetchCapture("budget-functions/list.json");
      await _budgetFunctionList();
      const captured = getCapture();
      expect(captured!.init).toBeUndefined();
      expect(captured!.url).toContain("/api/v2/budget_functions/list_budget_functions/");
    });
  });

  describe("_budgetFunctionSubfunctions", () => {
    it("returns subfunctions array", async () => {
      mockFetch("budget-functions/subfunctions.json");
      const result = await _budgetFunctionSubfunctions("050");
      expect(result.kind).toBe("budget_function_subfunctions");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBe(4);
      expect(result.meta).toBeNull();
    });

    it("items have budget_subfunction_code and budget_subfunction_title", async () => {
      mockFetch("budget-functions/subfunctions.json");
      const result = await _budgetFunctionSubfunctions("050");
      const item = result.data[0];
      expect(item.budget_subfunction_code).toBe("053");
      expect(item.budget_subfunction_title).toBe("Atomic energy defense activities");
    });

    it("sends POST request with budget_function_code in body", async () => {
      const getCapture = mockFetchCapture("budget-functions/subfunctions.json");
      await _budgetFunctionSubfunctions("050");
      const captured = getCapture();
      expect(captured!.init?.method).toBe("POST");
      expect(captured!.url).toContain("/api/v2/budget_functions/list_budget_subfunctions/");
      const body = JSON.parse(captured!.init?.body as string);
      expect(body.budget_function_code).toBe("050");
    });
  });

  describe("schema parsing", () => {
    it("BudgetFunctionListResponseSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/budget-functions/list.json`).json();
      const result = BudgetFunctionListResponseSchema.parse(data);
      expect(result.results.length).toBe(20);
      expect(result.results[0].budget_function_code).toBe("750");
      expect(result.results[0].budget_function_title).toBe("Administration of Justice");
    });

    it("BudgetSubfunctionListResponseSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/budget-functions/subfunctions.json`).json();
      const result = BudgetSubfunctionListResponseSchema.parse(data);
      expect(result.results.length).toBe(4);
      expect(result.results[0].budget_subfunction_code).toBe("053");
    });
  });

  describe("budgetFunctionsEndpoints describe metadata", () => {
    it("has 2 endpoints", () => {
      expect(budgetFunctionsEndpoints.length).toBe(2);
    });

    it("budget_function_list has no params", () => {
      const ep = budgetFunctionsEndpoints.find(e => e.name === "budget_function_list");
      expect(ep).toBeDefined();
      expect(ep!.params.length).toBe(0);
    });

    it("budget_function_subfunctions requires budget_function_code", () => {
      const ep = budgetFunctionsEndpoints.find(e => e.name === "budget_function_subfunctions");
      expect(ep).toBeDefined();
      const required = ep!.params.filter(p => p.required);
      expect(required.length).toBe(1);
      expect(required[0].name).toBe("budget_function_code");
    });

    it("all endpoints have name, path, params, and responseFields", () => {
      for (const ep of budgetFunctionsEndpoints) {
        expect(ep.name.length).toBeGreaterThan(0);
        expect(ep.path.length).toBeGreaterThan(0);
        expect(ep.params).toBeInstanceOf(Array);
        expect(ep.responseFields.length).toBeGreaterThan(0);
      }
    });

    it("all endpoints have descriptions", () => {
      for (const ep of budgetFunctionsEndpoints) {
        expect(ep.description.length).toBeGreaterThan(0);
      }
    });
  });

  describe("BudgetFunctionsKindMap type", () => {
    it("kind map resolves correctly", () => {
      const map: BudgetFunctionsKindMap = {
        budget_function_list: [],
        budget_function_subfunctions: [],
      };
      expect(map.budget_function_list).toBeInstanceOf(Array);
      expect(map.budget_function_subfunctions).toBeInstanceOf(Array);
    });
  });
});
