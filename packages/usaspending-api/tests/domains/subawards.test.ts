import { describe, it, expect, afterEach } from "bun:test";
import {
  _subawardList,
  _subawardByAward,
  _subawardTransactions,
  SubawardListResponseSchema,
  TransactionListResponseSchema,
  subawardEndpoints,
} from "../../src/domains/subawards";
import type { SubawardsKindMap } from "../../src/domains/subawards";

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

describe("subawards domain", () => {
  describe("_subawardList", () => {
    it("returns subaward list array", async () => {
      mockFetch("subawards/list.json");
      const result = await _subawardList();
      expect(result.kind).toBe("subaward_list");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.meta).not.toBeNull();
    });

    it("items have id, subaward_number, description, action_date", async () => {
      mockFetch("subawards/list.json");
      const result = await _subawardList();
      const item = result.data[0];
      expect(item.id).toBe(2040919);
      expect(item.subaward_number).toBe("ZZRZX5QAANX3 MAYA BRIDGE UCP OY2");
      expect(item.description).toBeDefined();
      expect(item.action_date).toBe("2024-09-05");
    });

    it("sends POST request to correct URL", async () => {
      const getCapture = mockFetchCapture("subawards/list.json");
      await _subawardList();
      const captured = getCapture();
      expect(captured!.init?.method).toBe("POST");
      expect(captured!.url).toContain("/api/v2/subawards/");
    });

    it("sends optional params in body", async () => {
      const getCapture = mockFetchCapture("subawards/list.json");
      await _subawardList({ keyword: "defense", page: 2, limit: 25, sort: "amount", order: "desc" });
      const body = JSON.parse(getCapture()!.init?.body as string);
      expect(body.keyword).toBe("defense");
      expect(body.page).toBe(2);
      expect(body.limit).toBe(25);
      expect(body.sort).toBe("amount");
      expect(body.order).toBe("desc");
    });
  });

  describe("_subawardByAward", () => {
    it("returns subawards for a specific award", async () => {
      mockFetch("subawards/by-award.json");
      const result = await _subawardByAward({ award_id: "CONT_AWD_NNM07AB03C_8000_-NONE-_-NONE-" });
      expect(result.kind).toBe("subaward_by_award");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.meta).not.toBeNull();
    });

    it("items have id, subaward_number, amount, recipient_name", async () => {
      mockFetch("subawards/by-award.json");
      const result = await _subawardByAward({ award_id: "test-award" });
      const item = result.data[0];
      expect(item.id).toBe(10238157);
      expect(item.subaward_number).toBe("694540-112");
      expect(item.amount).toBe(904540);
      expect(item.recipient_name).toBe("GENERAL DYNAMICS-OTS, INC.");
    });

    it("sends POST request with award_id in body", async () => {
      const getCapture = mockFetchCapture("subawards/by-award.json");
      await _subawardByAward({ award_id: "CONT_AWD_TEST_123" });
      const captured = getCapture();
      expect(captured!.init?.method).toBe("POST");
      expect(captured!.url).toContain("/api/v2/subawards/");
      const body = JSON.parse(captured!.init?.body as string);
      expect(body.award_id).toBe("CONT_AWD_TEST_123");
    });

    it("sends optional sort and order params", async () => {
      const getCapture = mockFetchCapture("subawards/by-award.json");
      await _subawardByAward({ award_id: "test", page: 3, limit: 50, sort: "action_date", order: "asc" });
      const body = JSON.parse(getCapture()!.init?.body as string);
      expect(body.award_id).toBe("test");
      expect(body.page).toBe(3);
      expect(body.limit).toBe(50);
      expect(body.sort).toBe("action_date");
      expect(body.order).toBe("asc");
    });
  });

  describe("_subawardTransactions", () => {
    it("returns transactions array", async () => {
      mockFetch("subawards/transactions.json");
      const result = await _subawardTransactions({ award_id: 12345 });
      expect(result.kind).toBe("subaward_transactions");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.meta).not.toBeNull();
    });

    it("items have expected transaction fields", async () => {
      mockFetch("subawards/transactions.json");
      const result = await _subawardTransactions({ award_id: 12345 });
      const item = result.data[0];
      expect(item.id).toBeDefined();
      expect(item.type).toBe("D");
      expect(item.type_description).toBe("DEFINITIVE CONTRACT");
      expect(item.action_date).toBeDefined();
      expect(item.modification_number).toBeDefined();
      expect(typeof item.federal_action_obligation).toBe("number");
    });

    it("sends POST request with award_id in body", async () => {
      const getCapture = mockFetchCapture("subawards/transactions.json");
      await _subawardTransactions({ award_id: 99999 });
      const captured = getCapture();
      expect(captured!.init?.method).toBe("POST");
      expect(captured!.url).toContain("/api/v2/transactions/");
      const body = JSON.parse(captured!.init?.body as string);
      expect(body.award_id).toBe(99999);
    });

    it("sends optional params in body", async () => {
      const getCapture = mockFetchCapture("subawards/transactions.json");
      await _subawardTransactions({ award_id: 1, page: 2, limit: 10, sort: "action_date", order: "desc" });
      const body = JSON.parse(getCapture()!.init?.body as string);
      expect(body.award_id).toBe(1);
      expect(body.page).toBe(2);
      expect(body.limit).toBe(10);
      expect(body.sort).toBe("action_date");
      expect(body.order).toBe("desc");
    });
  });

  describe("schema parsing", () => {
    it("SubawardListResponseSchema parses list fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/subawards/list.json`).json();
      const result = SubawardListResponseSchema.parse(data);
      expect(result.results.length).toBeGreaterThan(0);
      expect(result.page_metadata.hasNext).toBe(true);
      expect(result.results[0].subaward_number).toBe("ZZRZX5QAANX3 MAYA BRIDGE UCP OY2");
    });

    it("SubawardListResponseSchema parses by-award fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/subawards/by-award.json`).json();
      const result = SubawardListResponseSchema.parse(data);
      expect(result.results.length).toBeGreaterThan(0);
      expect(result.page_metadata.hasNext).toBe(true);
      expect(result.results[0].recipient_name).toBe("GENERAL DYNAMICS-OTS, INC.");
    });

    it("TransactionListResponseSchema parses transactions fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/subawards/transactions.json`).json();
      const result = TransactionListResponseSchema.parse(data);
      expect(result.results.length).toBeGreaterThan(0);
      expect(result.page_metadata.hasNext).toBe(true);
      expect(result.results[0].type).toBe("D");
    });
  });

  describe("subawardEndpoints describe metadata", () => {
    it("has 3 endpoints", () => {
      expect(subawardEndpoints.length).toBe(3);
    });

    it("subaward_list has no required params", () => {
      const ep = subawardEndpoints.find(e => e.name === "subaward_list");
      expect(ep).toBeDefined();
      const required = ep!.params.filter(p => p.required);
      expect(required.length).toBe(0);
    });

    it("subaward_by_award requires award_id", () => {
      const ep = subawardEndpoints.find(e => e.name === "subaward_by_award");
      expect(ep).toBeDefined();
      const required = ep!.params.filter(p => p.required);
      expect(required.length).toBe(1);
      expect(required[0].name).toBe("award_id");
    });

    it("subaward_transactions requires award_id", () => {
      const ep = subawardEndpoints.find(e => e.name === "subaward_transactions");
      expect(ep).toBeDefined();
      const required = ep!.params.filter(p => p.required);
      expect(required.length).toBe(1);
      expect(required[0].name).toBe("award_id");
    });

    it("all endpoints have name, path, params, and responseFields", () => {
      for (const ep of subawardEndpoints) {
        expect(ep.name.length).toBeGreaterThan(0);
        expect(ep.path.length).toBeGreaterThan(0);
        expect(ep.params).toBeInstanceOf(Array);
        expect(ep.responseFields.length).toBeGreaterThan(0);
      }
    });

    it("all endpoints have descriptions", () => {
      for (const ep of subawardEndpoints) {
        expect(ep.description.length).toBeGreaterThan(0);
      }
    });
  });

  describe("SubawardsKindMap type", () => {
    it("kind map resolves correctly", () => {
      const map: SubawardsKindMap = {
        subaward_list: [],
        subaward_by_award: [],
        subaward_transactions: [],
      };
      expect(map.subaward_list).toBeInstanceOf(Array);
      expect(map.subaward_by_award).toBeInstanceOf(Array);
      expect(map.subaward_transactions).toBeInstanceOf(Array);
    });
  });
});
