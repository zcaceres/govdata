import { describe, it, expect, afterEach } from "bun:test";
import {
  _spendingByState,
  _recipientList,
  _recipientCount,
  _recipientDetail,
  _recipientChildren,
  _stateDetail,
  _stateAwards,
  SpendingByStateResponseSchema,
  RecipientListResponseSchema,
  RecipientCountSchema,
  RecipientDetailSchema,
  RecipientChildrenResponseSchema,
  StateDetailSchema,
  StateAwardsResponseSchema,
  recipientEndpoints,
} from "../../src/domains/recipient";
import type { RecipientKindMap } from "../../src/domains/recipient";

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

describe("recipient domain", () => {
  describe("_spendingByState", () => {
    it("returns all states/territories", async () => {
      mockFetch("recipient/state-list.json");
      const result = await _spendingByState();
      expect(result.kind).toBe("spending_by_state");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(50);
      expect(result.meta).toBeNull();
    });

    it("state items have fips, code, name, amount", async () => {
      mockFetch("recipient/state-list.json");
      const result = await _spendingByState();
      for (const state of result.data.slice(0, 5)) {
        expect(state.fips).toBeTruthy();
        expect(state.code).toBeTruthy();
        expect(state.name).toBeTruthy();
        expect(typeof state.amount).toBe("number");
      }
    });

    it("uses GET request", async () => {
      const getCapture = mockFetchCapture("recipient/state-list.json");
      await _spendingByState();
      const captured = getCapture();
      expect(captured!.init).toBeUndefined();
      expect(captured!.url).toContain("/api/v2/recipient/state/");
    });
  });

  describe("_recipientList", () => {
    it("returns paginated list", async () => {
      mockFetch("recipient/list.json");
      const result = await _recipientList();
      expect(result.kind).toBe("recipient_list");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.meta).not.toBeNull();
    });

    it("sends POST with keyword", async () => {
      const getCapture = mockFetchCapture("recipient/list.json");
      await _recipientList({ keyword: "lockheed" });
      const captured = getCapture();
      expect(captured!.url).toContain("/api/v2/recipient/");
      const body = JSON.parse(captured!.init?.body as string);
      expect(body.keyword).toBe("lockheed");
    });

    it("items have id, name, amount", async () => {
      mockFetch("recipient/list.json");
      const result = await _recipientList();
      const item = result.data[0];
      expect(item.id).toBeDefined();
      expect(item.name).toBeDefined();
      expect(typeof item.amount).toBe("number");
    });
  });

  describe("_recipientCount", () => {
    it("returns count", async () => {
      mockFetch("recipient/count.json");
      const result = await _recipientCount();
      expect(result.kind).toBe("recipient_count");
      expect(typeof result.data.count).toBe("number");
      expect(result.data.count).toBeGreaterThan(0);
    });

    it("sends POST", async () => {
      const getCapture = mockFetchCapture("recipient/count.json");
      await _recipientCount({ keyword: "test" });
      const captured = getCapture();
      expect(captured!.init?.method).toBe("POST");
    });
  });

  describe("_recipientDetail", () => {
    it("returns detail for recipient", async () => {
      mockFetch("recipient/detail.json");
      const result = await _recipientDetail("test-id");
      expect(result.kind).toBe("recipient_detail");
      expect(result.data.name).toBe("LOCKHEED MARTIN CORP");
      expect(result.data.alternate_names).toBeInstanceOf(Array);
    });

    it("encodes recipient_id in URL", async () => {
      const getCapture = mockFetchCapture("recipient/detail.json");
      await _recipientDetail("abc-123-def");
      expect(getCapture()!.url).toContain("/api/v2/recipient/abc-123-def/");
    });
  });

  describe("_recipientChildren", () => {
    it("returns children array", async () => {
      mockFetch("recipient/children.json");
      const result = await _recipientChildren("test-parent-id");
      expect(result.kind).toBe("recipient_children");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
    });

    it("children have recipient_id, name, amount, state_province", async () => {
      mockFetch("recipient/children.json");
      const result = await _recipientChildren("test-parent-id");
      const child = result.data[0];
      expect(child.recipient_id).toBeDefined();
      expect(child.name).toBeDefined();
      expect(typeof child.amount).toBe("number");
      expect(child.state_province).toBeDefined();
    });

    it("passes recipient_id in URL", async () => {
      const getCapture = mockFetchCapture("recipient/children.json");
      await _recipientChildren("parent-abc");
      expect(getCapture()!.url).toContain("/api/v2/recipient/parent-abc/children/");
    });
  });

  describe("_stateDetail", () => {
    it("returns state detail", async () => {
      mockFetch("recipient/state-detail.json");
      const result = await _stateDetail("06");
      expect(result.kind).toBe("state_detail");
      expect(result.data.name).toBe("California");
      expect(result.data.code).toBe("CA");
      expect(result.data.fips).toBe("06");
      expect(typeof result.data.population).toBe("number");
    });

    it("passes fips in URL", async () => {
      const getCapture = mockFetchCapture("recipient/state-detail.json");
      await _stateDetail("06");
      expect(getCapture()!.url).toContain("/api/v2/recipient/state/06/");
    });
  });

  describe("_stateAwards", () => {
    it("returns award type breakdown", async () => {
      mockFetch("recipient/state-awards.json");
      const result = await _stateAwards("06");
      expect(result.kind).toBe("state_awards");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
    });

    it("items have type, amount, count", async () => {
      mockFetch("recipient/state-awards.json");
      const result = await _stateAwards("06");
      const item = result.data[0];
      expect(item.type).toBeDefined();
      expect(typeof item.amount).toBe("number");
      expect(typeof item.count).toBe("number");
    });

    it("passes fips in URL", async () => {
      const getCapture = mockFetchCapture("recipient/state-awards.json");
      await _stateAwards("06");
      expect(getCapture()!.url).toContain("/api/v2/recipient/state/awards/06/");
    });
  });

  describe("schema parsing", () => {
    it("SpendingByStateResponseSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/recipient/state-list.json`).json();
      const result = SpendingByStateResponseSchema.parse(data);
      expect(result.length).toBeGreaterThan(50);
      const ca = result.find((s) => s.code === "CA");
      expect(ca).toBeDefined();
      expect(ca!.name).toBe("California");
    });

    it("RecipientListResponseSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/recipient/list.json`).json();
      const result = RecipientListResponseSchema.parse(data);
      expect(result.results.length).toBeGreaterThan(0);
      expect(result.page_metadata).toBeDefined();
    });

    it("RecipientCountSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/recipient/count.json`).json();
      const result = RecipientCountSchema.parse(data);
      expect(result.count).toBeGreaterThan(0);
    });

    it("RecipientDetailSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/recipient/detail.json`).json();
      const result = RecipientDetailSchema.parse(data);
      expect(result.name).toBe("LOCKHEED MARTIN CORP");
      expect(result.alternate_names!.length).toBeGreaterThan(0);
      expect(result.duns).toBeDefined();
      expect(result.uei).toBeDefined();
    });

    it("RecipientChildrenResponseSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/recipient/children.json`).json();
      const result = RecipientChildrenResponseSchema.parse(data);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].recipient_id).toBeDefined();
    });

    it("StateDetailSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/recipient/state-detail.json`).json();
      const result = StateDetailSchema.parse(data);
      expect(result.name).toBe("California");
      expect(result.population).toBeGreaterThan(0);
      expect(typeof result.total_prime_amount).toBe("number");
    });

    it("StateAwardsResponseSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/recipient/state-awards.json`).json();
      const result = StateAwardsResponseSchema.parse(data);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].type).toBeDefined();
    });
  });

  describe("recipientEndpoints describe metadata", () => {
    it("has 7 endpoints", () => {
      expect(recipientEndpoints.length).toBe(7);
    });

    it("spending_by_state endpoint has no required params", () => {
      const ep = recipientEndpoints.find(e => e.name === "spending_by_state");
      expect(ep).toBeDefined();
      expect(ep!.params.length).toBe(0);
    });

    it("recipient_detail requires recipient_id", () => {
      const ep = recipientEndpoints.find(e => e.name === "recipient_detail");
      expect(ep).toBeDefined();
      const required = ep!.params.filter(p => p.required);
      expect(required.length).toBe(1);
      expect(required[0].name).toBe("recipient_id");
    });

    it("state_detail requires fips", () => {
      const ep = recipientEndpoints.find(e => e.name === "state_detail");
      expect(ep).toBeDefined();
      const required = ep!.params.filter(p => p.required);
      expect(required.length).toBe(1);
      expect(required[0].name).toBe("fips");
    });

    it("all endpoints have descriptions and response fields", () => {
      for (const ep of recipientEndpoints) {
        expect(ep.description.length).toBeGreaterThan(0);
        expect(ep.responseFields.length).toBeGreaterThan(0);
      }
    });
  });

  describe("RecipientKindMap type", () => {
    it("kind map resolves correctly", () => {
      const map: RecipientKindMap = {
        spending_by_state: [],
        recipient_list: [],
        recipient_count: { count: 0 },
        recipient_detail: {} as any,
        recipient_children: [],
        state_detail: {} as any,
        state_awards: [],
      };
      expect(map.spending_by_state).toBeInstanceOf(Array);
      expect(map.recipient_list).toBeInstanceOf(Array);
      expect(typeof map.recipient_count.count).toBe("number");
    });
  });
});
