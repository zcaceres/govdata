import { describe, it, expect, afterEach } from "bun:test";
import {
  _idvAccounts,
  _idvActivity,
  _idvAmounts,
  _idvChildAwards,
  _idvChildIdvs,
  _idvCountFederalAccount,
  _idvFundingRollup,
  _idvFunding,
  IdvAmountsSchema,
  IdvCountSchema,
  IdvFundingRollupSchema,
  IdvFundingResponseSchema,
  IdvAccountsResponseSchema,
  IdvActivityResponseSchema,
  IdvAwardsResponseSchema,
  idvEndpoints,
} from "../../src/domains/idv";
import type { IdvKindMap } from "../../src/domains/idv";

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

describe("idv domain", () => {
  describe("_idvAccounts", () => {
    it("returns accounts array", async () => {
      mockFetch("idv/accounts.json");
      const result = await _idvAccounts();
      expect(result.kind).toBe("idv_accounts");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBe(0);
      expect(result.meta).not.toBeNull();
    });

    it("sends POST request", async () => {
      const getCapture = mockFetchCapture("idv/accounts.json");
      await _idvAccounts({ award_id: 123 });
      const captured = getCapture();
      expect(captured!.init?.method).toBe("POST");
      expect(captured!.url).toContain("/api/v2/idvs/accounts/");
      const body = JSON.parse(captured!.init?.body as string);
      expect(body.award_id).toBe(123);
    });

    it("sends optional params in body", async () => {
      const getCapture = mockFetchCapture("idv/accounts.json");
      await _idvAccounts({ award_id: 1, page: 2, limit: 25, sort: "amount", order: "desc" });
      const body = JSON.parse(getCapture()!.init?.body as string);
      expect(body.page).toBe(2);
      expect(body.limit).toBe(25);
      expect(body.sort).toBe("amount");
      expect(body.order).toBe("desc");
    });
  });

  describe("_idvActivity", () => {
    it("returns activity array", async () => {
      mockFetch("idv/activity.json");
      const result = await _idvActivity();
      expect(result.kind).toBe("idv_activity");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBe(0);
      expect(result.meta).not.toBeNull();
    });

    it("sends POST with award_id", async () => {
      const getCapture = mockFetchCapture("idv/activity.json");
      await _idvActivity({ award_id: 456 });
      const captured = getCapture();
      expect(captured!.init?.method).toBe("POST");
      expect(captured!.url).toContain("/api/v2/idvs/activity/");
      const body = JSON.parse(captured!.init?.body as string);
      expect(body.award_id).toBe(456);
    });

    it("sends page and limit in body", async () => {
      const getCapture = mockFetchCapture("idv/activity.json");
      await _idvActivity({ award_id: 1, page: 3, limit: 50 });
      const body = JSON.parse(getCapture()!.init?.body as string);
      expect(body.page).toBe(3);
      expect(body.limit).toBe(50);
    });
  });

  describe("_idvAmounts", () => {
    it("returns amounts object", async () => {
      mockFetch("idv/amounts.json");
      const result = await _idvAmounts("CONT_IDV_NNJ16GU21B_8000");
      expect(result.kind).toBe("idv_amounts");
      expect(result.data.award_id).toBe(351431948);
      expect(result.data.generated_unique_award_id).toBe("CONT_IDV_NNJ16GU21B_8000");
      expect(result.meta).toBeNull();
    });

    it("has child and grandchild counts", async () => {
      mockFetch("idv/amounts.json");
      const result = await _idvAmounts("test-id");
      expect(typeof result.data.child_idv_count).toBe("number");
      expect(typeof result.data.child_award_count).toBe("number");
      expect(typeof result.data.grandchild_award_count).toBe("number");
    });

    it("encodes award_id in URL (GET)", async () => {
      const getCapture = mockFetchCapture("idv/amounts.json");
      await _idvAmounts("CONT_IDV_ABC/123");
      const captured = getCapture();
      expect(captured!.init).toBeUndefined();
      expect(captured!.url).toContain("/api/v2/idvs/amounts/CONT_IDV_ABC%2F123/");
    });
  });

  describe("_idvChildAwards", () => {
    it("returns child awards array", async () => {
      mockFetch("idv/awards-child-awards.json");
      const result = await _idvChildAwards();
      expect(result.kind).toBe("idv_child_awards");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBe(0);
      expect(result.meta).not.toBeNull();
    });

    it("sends POST with type child_awards", async () => {
      const getCapture = mockFetchCapture("idv/awards-child-awards.json");
      await _idvChildAwards({ award_id: 789 });
      const captured = getCapture();
      expect(captured!.init?.method).toBe("POST");
      expect(captured!.url).toContain("/api/v2/idvs/awards/");
      const body = JSON.parse(captured!.init?.body as string);
      expect(body.type).toBe("child_awards");
      expect(body.award_id).toBe(789);
    });
  });

  describe("_idvChildIdvs", () => {
    it("returns child idvs array", async () => {
      mockFetch("idv/awards-child-idvs.json");
      const result = await _idvChildIdvs();
      expect(result.kind).toBe("idv_child_idvs");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBe(0);
      expect(result.meta).not.toBeNull();
    });

    it("sends POST with type child_idvs", async () => {
      const getCapture = mockFetchCapture("idv/awards-child-idvs.json");
      await _idvChildIdvs({ award_id: 101 });
      const captured = getCapture();
      expect(captured!.init?.method).toBe("POST");
      expect(captured!.url).toContain("/api/v2/idvs/awards/");
      const body = JSON.parse(captured!.init?.body as string);
      expect(body.type).toBe("child_idvs");
      expect(body.award_id).toBe(101);
    });
  });

  describe("_idvCountFederalAccount", () => {
    it("returns count", async () => {
      mockFetch("idv/count-federal-account.json");
      const result = await _idvCountFederalAccount("test-id");
      expect(result.kind).toBe("idv_count_federal_account");
      expect(typeof result.data.count).toBe("number");
      expect(result.data.count).toBe(206);
      expect(result.meta).toBeNull();
    });

    it("encodes award_id in URL (GET)", async () => {
      const getCapture = mockFetchCapture("idv/count-federal-account.json");
      await _idvCountFederalAccount("CONT_IDV_XYZ");
      const captured = getCapture();
      expect(captured!.init).toBeUndefined();
      expect(captured!.url).toContain("/api/v2/idvs/count/federal_account/CONT_IDV_XYZ/");
    });
  });

  describe("_idvFundingRollup", () => {
    it("returns rollup summary", async () => {
      mockFetch("idv/funding-rollup.json");
      const result = await _idvFundingRollup("test-id");
      expect(result.kind).toBe("idv_funding_rollup");
      expect(typeof result.data.total_transaction_obligated_amount).toBe("number");
      expect(typeof result.data.awarding_agency_count).toBe("number");
      expect(typeof result.data.funding_agency_count).toBe("number");
      expect(typeof result.data.federal_account_count).toBe("number");
      expect(result.meta).toBeNull();
    });

    it("encodes award_id in URL (GET)", async () => {
      const getCapture = mockFetchCapture("idv/funding-rollup.json");
      await _idvFundingRollup("CONT_IDV_ABC");
      const captured = getCapture();
      expect(captured!.init).toBeUndefined();
      expect(captured!.url).toContain("/api/v2/idvs/funding_rollup/CONT_IDV_ABC/");
    });
  });

  describe("_idvFunding", () => {
    it("returns funding items array", async () => {
      mockFetch("idv/funding.json");
      const result = await _idvFunding();
      expect(result.kind).toBe("idv_funding");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBe(10);
      expect(result.meta).not.toBeNull();
    });

    it("funding items have expected fields", async () => {
      mockFetch("idv/funding.json");
      const result = await _idvFunding();
      const item = result.data[0];
      expect(item.award_id).toBe(351431948);
      expect(item.piid).toBe("NNJ16GU21B");
      expect(item.awarding_agency_name).toBe("National Aeronautics and Space Administration");
      expect(item.account_title).toBe("Space Operations, National Aeronautics and Space Administration");
    });

    it("sends POST with params", async () => {
      const getCapture = mockFetchCapture("idv/funding.json");
      await _idvFunding({ award_id: 42, piid: "TEST123", sort: "amount", order: "asc" });
      const captured = getCapture();
      expect(captured!.init?.method).toBe("POST");
      expect(captured!.url).toContain("/api/v2/idvs/funding/");
      const body = JSON.parse(captured!.init?.body as string);
      expect(body.award_id).toBe(42);
      expect(body.piid).toBe("TEST123");
      expect(body.sort).toBe("amount");
      expect(body.order).toBe("asc");
    });
  });

  describe("schema parsing", () => {
    it("IdvAmountsSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/idv/amounts.json`).json();
      const result = IdvAmountsSchema.parse(data);
      expect(result.award_id).toBe(351431948);
      expect(result.generated_unique_award_id).toBe("CONT_IDV_NNJ16GU21B_8000");
      expect(result.child_account_outlays_by_defc).toBeInstanceOf(Array);
    });

    it("IdvCountSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/idv/count-federal-account.json`).json();
      const result = IdvCountSchema.parse(data);
      expect(result.count).toBe(206);
    });

    it("IdvFundingRollupSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/idv/funding-rollup.json`).json();
      const result = IdvFundingRollupSchema.parse(data);
      expect(result.total_transaction_obligated_amount).toBe(0);
      expect(result.federal_account_count).toBe(0);
    });

    it("IdvFundingResponseSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/idv/funding.json`).json();
      const result = IdvFundingResponseSchema.parse(data);
      expect(result.results.length).toBe(10);
      expect(result.page_metadata.hasNext).toBe(true);
      expect(result.results[0].piid).toBe("NNJ16GU21B");
    });

    it("IdvAccountsResponseSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/idv/accounts.json`).json();
      const result = IdvAccountsResponseSchema.parse(data);
      expect(result.results).toBeInstanceOf(Array);
      expect(result.results.length).toBe(0);
      expect(result.page_metadata.hasNext).toBe(false);
    });

    it("IdvActivityResponseSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/idv/activity.json`).json();
      const result = IdvActivityResponseSchema.parse(data);
      expect(result.results).toBeInstanceOf(Array);
      expect(result.results.length).toBe(0);
      expect(result.page_metadata.hasNext).toBe(false);
    });

    it("IdvAwardsResponseSchema parses child-awards fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/idv/awards-child-awards.json`).json();
      const result = IdvAwardsResponseSchema.parse(data);
      expect(result.results).toBeInstanceOf(Array);
      expect(result.results.length).toBe(0);
    });

    it("IdvAwardsResponseSchema parses child-idvs fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/idv/awards-child-idvs.json`).json();
      const result = IdvAwardsResponseSchema.parse(data);
      expect(result.results).toBeInstanceOf(Array);
      expect(result.results.length).toBe(0);
    });
  });

  describe("idvEndpoints describe metadata", () => {
    it("has 8 endpoints", () => {
      expect(idvEndpoints.length).toBe(8);
    });

    it("idv_amounts requires award_id", () => {
      const ep = idvEndpoints.find(e => e.name === "idv_amounts");
      expect(ep).toBeDefined();
      const required = ep!.params.filter(p => p.required);
      expect(required.length).toBe(1);
      expect(required[0].name).toBe("award_id");
    });

    it("idv_count_federal_account requires award_id", () => {
      const ep = idvEndpoints.find(e => e.name === "idv_count_federal_account");
      expect(ep).toBeDefined();
      const required = ep!.params.filter(p => p.required);
      expect(required.length).toBe(1);
      expect(required[0].name).toBe("award_id");
    });

    it("idv_funding has piid as optional param", () => {
      const ep = idvEndpoints.find(e => e.name === "idv_funding");
      expect(ep).toBeDefined();
      const piid = ep!.params.find(p => p.name === "piid");
      expect(piid).toBeDefined();
      expect(piid!.required).toBe(false);
    });

    it("all endpoints have descriptions and response fields", () => {
      for (const ep of idvEndpoints) {
        expect(ep.description.length).toBeGreaterThan(0);
        expect(ep.responseFields.length).toBeGreaterThan(0);
      }
    });
  });

  describe("IdvKindMap type", () => {
    it("kind map resolves correctly", () => {
      const map: IdvKindMap = {
        idv_accounts: [],
        idv_activity: [],
        idv_amounts: {} as any,
        idv_child_awards: [],
        idv_child_idvs: [],
        idv_count_federal_account: { count: 0 },
        idv_funding_rollup: {} as any,
        idv_funding: [],
      };
      expect(map.idv_accounts).toBeInstanceOf(Array);
      expect(map.idv_activity).toBeInstanceOf(Array);
      expect(map.idv_child_awards).toBeInstanceOf(Array);
      expect(map.idv_child_idvs).toBeInstanceOf(Array);
      expect(map.idv_funding).toBeInstanceOf(Array);
      expect(typeof map.idv_count_federal_account.count).toBe("number");
    });
  });
});
