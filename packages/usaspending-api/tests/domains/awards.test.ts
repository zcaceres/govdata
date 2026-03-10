import { describe, it, expect, afterEach } from "bun:test";
import {
  _findAward,
  _awardAccounts,
  _awardCountFederalAccount,
  _awardCountSubaward,
  _awardCountTransaction,
  _awardFunding,
  _awardFundingRollup,
  _awardLastUpdated,
  _awardSpendingRecipient,
  AwardDetailSchema,
  AwardAccountsResponseSchema,
  AwardCountFederalAccountSchema,
  AwardCountSubawardSchema,
  AwardCountTransactionSchema,
  AwardFundingResponseSchema,
  AwardFundingRollupSchema,
  AwardLastUpdatedSchema,
  AwardSpendingRecipientResponseSchema,
  awardsEndpoints,
} from "../../src/domains/awards";
import type { AwardsKindMap } from "../../src/domains/awards";

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

describe("awards domain", () => {
  describe("_findAward", () => {
    it("returns contract award detail", async () => {
      mockFetch("awards/detail-contract.json");
      const result = await _findAward("CONT_AWD_NNM07AB03C_8000_-NONE-_-NONE-");
      expect(result.kind).toBe("award");
      expect(result.data.length).toBe(1);
      expect(result.data[0].generated_unique_award_id).toBeTruthy();
      expect(result.data[0].category).toBe("contract");
      expect(result.meta).toBeNull();
    });

    it("returns grant award detail", async () => {
      mockFetch("awards/detail-grant.json");
      const result = await _findAward("ASST_NON_80NSSC24K0476_8000");
      expect(result.kind).toBe("award");
      expect(result.data[0].category).toBe("grant");
      expect(result.data[0].fain).toBeTruthy();
    });

    it("encodes award ID in URL path", async () => {
      const getCapture = mockFetchCapture("awards/detail-contract.json");
      await _findAward("CONT_AWD_TEST_ID");
      expect(getCapture()!.url).toContain("/api/v2/awards/CONT_AWD_TEST_ID/");
    });
  });

  describe("_awardAccounts", () => {
    it("returns award account funding", async () => {
      mockFetch("awards/accounts.json");
      const result = await _awardAccounts("CONT_AWD_TEST");
      expect(result.kind).toBe("award_accounts");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0]).toHaveProperty("federal_account");
      expect(result.data[0]).toHaveProperty("total_transaction_obligated_amount");
    });

    it("includes correct URL path", async () => {
      const getCapture = mockFetchCapture("awards/accounts.json");
      await _awardAccounts("TEST_ID");
      expect(getCapture()!.url).toContain("/awards/TEST_ID/accounts/");
    });
  });

  describe("_awardCountFederalAccount", () => {
    it("returns federal account count", async () => {
      mockFetch("awards/count-federal-account.json");
      const result = await _awardCountFederalAccount("TEST_ID");
      expect(result.kind).toBe("award_count_federal_account");
      expect(typeof result.data.federal_accounts).toBe("number");
    });
  });

  describe("_awardCountSubaward", () => {
    it("returns subaward count", async () => {
      mockFetch("awards/count-subaward.json");
      const result = await _awardCountSubaward("TEST_ID");
      expect(result.kind).toBe("award_count_subaward");
      expect(typeof result.data.subawards).toBe("number");
    });
  });

  describe("_awardCountTransaction", () => {
    it("returns transaction count", async () => {
      mockFetch("awards/count-transaction.json");
      const result = await _awardCountTransaction("TEST_ID");
      expect(result.kind).toBe("award_count_transaction");
      expect(typeof result.data.transactions).toBe("number");
    });
  });

  describe("_awardFunding", () => {
    it("returns funding transactions with pagination", async () => {
      mockFetch("awards/funding.json");
      const result = await _awardFunding("TEST_ID");
      expect(result.kind).toBe("award_funding");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0]).toHaveProperty("transaction_obligated_amount");
      expect(result.data[0]).toHaveProperty("federal_account");
      expect(result.meta).toBeDefined();
    });
  });

  describe("_awardFundingRollup", () => {
    it("returns funding rollup summary", async () => {
      mockFetch("awards/funding-rollup.json");
      const result = await _awardFundingRollup("TEST_ID");
      expect(result.kind).toBe("award_funding_rollup");
      expect(typeof result.data.total_transaction_obligated_amount).toBe("number");
      expect(typeof result.data.federal_account_count).toBe("number");
    });
  });

  describe("_awardLastUpdated", () => {
    it("returns last updated date", async () => {
      mockFetch("awards/last-updated.json");
      const result = await _awardLastUpdated();
      expect(result.kind).toBe("award_last_updated");
      expect(typeof result.data.last_updated).toBe("string");
    });
  });

  describe("_awardSpendingRecipient", () => {
    it("returns spending by recipient", async () => {
      mockFetch("awards/spending-recipient.json");
      const result = await _awardSpendingRecipient({
        awarding_agency_id: 1125,
        fiscal_year: 2024,
      });
      expect(result.kind).toBe("award_spending_recipient");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0]).toHaveProperty("award_category");
      expect(result.data[0]).toHaveProperty("obligated_amount");
      expect(result.data[0]).toHaveProperty("recipient");
    });

    it("passes query params", async () => {
      const getCapture = mockFetchCapture("awards/spending-recipient.json");
      await _awardSpendingRecipient({ awarding_agency_id: 1125, fiscal_year: 2024 });
      const url = getCapture()!.url;
      expect(url).toContain("awarding_agency_id=1125");
      expect(url).toContain("fiscal_year=2024");
    });
  });

  // --- Schema parsing ---

  describe("schema parsing", () => {
    it("AwardDetailSchema parses contract fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/awards/detail-contract.json`).json();
      const result = AwardDetailSchema.parse(data);
      expect(result.id).toBeGreaterThan(0);
      expect(result.category).toBe("contract");
    });

    it("AwardDetailSchema parses grant fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/awards/detail-grant.json`).json();
      const result = AwardDetailSchema.parse(data);
      expect(result.category).toBe("grant");
    });

    it("AwardAccountsResponseSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/awards/accounts.json`).json();
      const result = AwardAccountsResponseSchema.parse(data);
      expect(result.results).toBeInstanceOf(Array);
    });

    it("AwardCountFederalAccountSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/awards/count-federal-account.json`).json();
      const result = AwardCountFederalAccountSchema.parse(data);
      expect(typeof result.federal_accounts).toBe("number");
    });

    it("AwardCountSubawardSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/awards/count-subaward.json`).json();
      const result = AwardCountSubawardSchema.parse(data);
      expect(typeof result.subawards).toBe("number");
    });

    it("AwardCountTransactionSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/awards/count-transaction.json`).json();
      const result = AwardCountTransactionSchema.parse(data);
      expect(typeof result.transactions).toBe("number");
    });

    it("AwardFundingResponseSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/awards/funding.json`).json();
      const result = AwardFundingResponseSchema.parse(data);
      expect(result.results).toBeInstanceOf(Array);
    });

    it("AwardFundingRollupSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/awards/funding-rollup.json`).json();
      const result = AwardFundingRollupSchema.parse(data);
      expect(typeof result.total_transaction_obligated_amount).toBe("number");
    });

    it("AwardLastUpdatedSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/awards/last-updated.json`).json();
      const result = AwardLastUpdatedSchema.parse(data);
      expect(typeof result.last_updated).toBe("string");
    });

    it("AwardSpendingRecipientResponseSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/awards/spending-recipient.json`).json();
      const result = AwardSpendingRecipientResponseSchema.parse(data);
      expect(result.results).toBeInstanceOf(Array);
    });
  });

  // --- Describe metadata ---

  describe("awardsEndpoints describe metadata", () => {
    it("has 9 awards endpoints", () => {
      expect(awardsEndpoints.length).toBe(9);
    });

    it("award endpoint requires id param", () => {
      const ep = awardsEndpoints.find((e) => e.name === "award");
      expect(ep).toBeDefined();
      expect(ep!.params.find((p) => p.name === "id")?.required).toBe(true);
    });

    it("award_last_updated has no required params", () => {
      const ep = awardsEndpoints.find((e) => e.name === "award_last_updated");
      expect(ep).toBeDefined();
      expect(ep!.params.length).toBe(0);
    });

    it("all endpoints have response fields", () => {
      for (const ep of awardsEndpoints) {
        expect(ep.responseFields.length).toBeGreaterThan(0);
      }
    });
  });

  describe("AwardsKindMap type", () => {
    it("kind map resolves correctly", () => {
      const map: Partial<AwardsKindMap> = {
        award: [],
        award_accounts: [],
        award_count_federal_account: { federal_accounts: 5 },
        award_funding_rollup: {
          total_transaction_obligated_amount: 100,
          awarding_agency_count: 1,
          funding_agency_count: 1,
          federal_account_count: 2,
        },
      };
      expect(map.award).toBeInstanceOf(Array);
      expect(typeof map.award_count_federal_account!.federal_accounts).toBe("number");
    });
  });
});
