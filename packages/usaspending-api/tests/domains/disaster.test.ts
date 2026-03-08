import { describe, it, expect, afterEach } from "bun:test";
import {
  _disasterOverview,
  _disasterAwardAmount,
  _disasterAwardCount,
  _disasterAgencySpending,
  _disasterAgencyLoans,
  _disasterAgencyCount,
  _disasterCfdaSpending,
  _disasterCfdaLoans,
  _disasterCfdaCount,
  _disasterDefCodeCount,
  _disasterFederalAccountSpending,
  _disasterFederalAccountLoans,
  _disasterFederalAccountCount,
  _disasterObjectClassSpending,
  _disasterObjectClassLoans,
  _disasterObjectClassCount,
  _disasterRecipientSpending,
  _disasterRecipientLoans,
  _disasterRecipientCount,
  _disasterSpendingByGeography,
  DisasterOverviewSchema,
  DisasterAwardAmountSchema,
  DisasterCountSchema,
  DisasterSpendingResponseSchema,
  DisasterLoanResponseSchema,
  DisasterCfdaResponseSchema,
  DisasterCfdaLoanResponseSchema,
  DisasterGeoResponseSchema,
  disasterEndpoints,
} from "../../src/domains/disaster";
import type { DisasterKindMap } from "../../src/domains/disaster";

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

describe("disaster domain", () => {
  // --- Overview (GET) ---

  describe("_disasterOverview", () => {
    it("returns overview data", async () => {
      mockFetch("disaster/overview.json");
      const result = await _disasterOverview();
      expect(result.kind).toBe("disaster_overview");
      expect(result.data.funding).toBeInstanceOf(Array);
      expect(result.data.funding.length).toBeGreaterThan(0);
      expect(typeof result.data.total_budget_authority).toBe("number");
      expect(result.data.spending).toBeDefined();
      expect(result.meta).toBeNull();
    });

    it("funding items have def_code and amount", async () => {
      mockFetch("disaster/overview.json");
      const result = await _disasterOverview();
      const item = result.data.funding[0];
      expect(item.def_code).toBeTruthy();
      expect(typeof item.amount).toBe("number");
    });

    it("spending summary has obligation and outlay fields", async () => {
      mockFetch("disaster/overview.json");
      const result = await _disasterOverview();
      const s = result.data.spending;
      expect(typeof s.award_obligations).toBe("number");
      expect(typeof s.award_outlays).toBe("number");
      expect(typeof s.total_obligations).toBe("number");
      expect(typeof s.total_outlays).toBe("number");
    });

    it("uses GET request", async () => {
      const getCapture = mockFetchCapture("disaster/overview.json");
      await _disasterOverview();
      const captured = getCapture();
      expect(captured!.init).toBeUndefined();
      expect(captured!.url).toContain("/api/v2/disaster/overview/");
    });
  });

  // --- Award amount & count ---

  describe("_disasterAwardAmount", () => {
    it("returns award amount data", async () => {
      mockFetch("disaster/award-amount.json");
      const result = await _disasterAwardAmount();
      expect(result.kind).toBe("disaster_award_amount");
      expect(typeof result.data.award_count).toBe("number");
      expect(typeof result.data.obligation).toBe("number");
      expect(typeof result.data.outlay).toBe("number");
      expect(result.meta).toBeNull();
    });

    it("sends POST with def_codes in filter", async () => {
      const getCapture = mockFetchCapture("disaster/award-amount.json");
      await _disasterAwardAmount({ def_codes: ["L", "M"] });
      const captured = getCapture();
      expect(captured!.init?.method).toBe("POST");
      const body = JSON.parse(captured!.init?.body as string);
      expect(body.filter.def_codes).toEqual(["L", "M"]);
    });
  });

  describe("_disasterAwardCount", () => {
    it("returns count", async () => {
      mockFetch("disaster/award-count.json");
      const result = await _disasterAwardCount();
      expect(result.kind).toBe("disaster_award_count");
      expect(typeof result.data.count).toBe("number");
      expect(result.data.count).toBeGreaterThan(0);
      expect(result.meta).toBeNull();
    });

    it("sends POST", async () => {
      const getCapture = mockFetchCapture("disaster/award-count.json");
      await _disasterAwardCount();
      const captured = getCapture();
      expect(captured!.init?.method).toBe("POST");
    });
  });

  // --- Agency ---

  describe("_disasterAgencySpending", () => {
    it("returns paginated spending by agency", async () => {
      mockFetch("disaster/agency-spending.json");
      const result = await _disasterAgencySpending();
      expect(result.kind).toBe("disaster_agency_spending");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.meta).not.toBeNull();
      expect(result.meta!.total_results).toBe(39);
    });

    it("items have id, code, description, obligation, outlay", async () => {
      mockFetch("disaster/agency-spending.json");
      const result = await _disasterAgencySpending();
      const item = result.data[0];
      expect(item.id).toBeDefined();
      expect(item.code).toBeTruthy();
      expect(item.description).toBeTruthy();
      expect(typeof item.obligation).toBe("number");
      expect(typeof item.outlay).toBe("number");
    });

    it("sends POST with filter.def_codes", async () => {
      const getCapture = mockFetchCapture("disaster/agency-spending.json");
      await _disasterAgencySpending({ def_codes: ["O", "P"] });
      const captured = getCapture();
      expect(captured!.init?.method).toBe("POST");
      const body = JSON.parse(captured!.init?.body as string);
      expect(body.filter.def_codes).toEqual(["O", "P"]);
      expect(captured!.url).toContain("/api/v2/disaster/agency/spending/");
    });
  });

  describe("_disasterAgencyLoans", () => {
    it("returns paginated loan data by agency", async () => {
      mockFetch("disaster/agency-loans.json");
      const result = await _disasterAgencyLoans();
      expect(result.kind).toBe("disaster_agency_loans");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.meta).not.toBeNull();
    });

    it("items have face_value_of_loan", async () => {
      mockFetch("disaster/agency-loans.json");
      const result = await _disasterAgencyLoans();
      const item = result.data[0];
      expect(typeof item.face_value_of_loan).toBe("number");
    });

    it("sends POST to correct URL", async () => {
      const getCapture = mockFetchCapture("disaster/agency-loans.json");
      await _disasterAgencyLoans();
      const captured = getCapture();
      expect(captured!.url).toContain("/api/v2/disaster/agency/loans/");
    });
  });

  describe("_disasterAgencyCount", () => {
    it("returns count", async () => {
      mockFetch("disaster/agency-count.json");
      const result = await _disasterAgencyCount();
      expect(result.kind).toBe("disaster_agency_count");
      expect(typeof result.data.count).toBe("number");
      expect(result.data.count).toBe(38);
    });

    it("sends POST to correct URL", async () => {
      const getCapture = mockFetchCapture("disaster/agency-count.json");
      await _disasterAgencyCount();
      const captured = getCapture();
      expect(captured!.url).toContain("/api/v2/disaster/agency/count/");
    });
  });

  // --- CFDA ---

  describe("_disasterCfdaSpending", () => {
    it("returns paginated CFDA spending", async () => {
      mockFetch("disaster/cfda-spending.json");
      const result = await _disasterCfdaSpending();
      expect(result.kind).toBe("disaster_cfda_spending");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.meta).not.toBeNull();
      expect(result.meta!.total_results).toBe(390);
    });

    it("sends POST to correct URL", async () => {
      const getCapture = mockFetchCapture("disaster/cfda-spending.json");
      await _disasterCfdaSpending();
      const captured = getCapture();
      expect(captured!.url).toContain("/api/v2/disaster/cfda/spending/");
    });
  });

  describe("_disasterCfdaLoans", () => {
    it("returns paginated CFDA loan data", async () => {
      mockFetch("disaster/cfda-loans.json");
      const result = await _disasterCfdaLoans();
      expect(result.kind).toBe("disaster_cfda_loans");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.meta).not.toBeNull();
    });

    it("sends POST to correct URL", async () => {
      const getCapture = mockFetchCapture("disaster/cfda-loans.json");
      await _disasterCfdaLoans();
      const captured = getCapture();
      expect(captured!.url).toContain("/api/v2/disaster/cfda/loans/");
    });
  });

  describe("_disasterCfdaCount", () => {
    it("returns count", async () => {
      mockFetch("disaster/cfda-count.json");
      const result = await _disasterCfdaCount();
      expect(result.kind).toBe("disaster_cfda_count");
      expect(typeof result.data.count).toBe("number");
    });

    it("sends POST to correct URL", async () => {
      const getCapture = mockFetchCapture("disaster/cfda-count.json");
      await _disasterCfdaCount();
      const captured = getCapture();
      expect(captured!.url).toContain("/api/v2/disaster/cfda/count/");
    });
  });

  // --- DEF Code ---

  describe("_disasterDefCodeCount", () => {
    it("returns count", async () => {
      mockFetch("disaster/def-code-count.json");
      const result = await _disasterDefCodeCount();
      expect(result.kind).toBe("disaster_def_code_count");
      expect(typeof result.data.count).toBe("number");
      expect(result.data.count).toBe(5);
    });

    it("sends POST to correct URL", async () => {
      const getCapture = mockFetchCapture("disaster/def-code-count.json");
      await _disasterDefCodeCount();
      const captured = getCapture();
      expect(captured!.url).toContain("/api/v2/disaster/def_code/count/");
    });
  });

  // --- Federal Account ---

  describe("_disasterFederalAccountSpending", () => {
    it("returns paginated spending by federal account", async () => {
      mockFetch("disaster/federal-account-spending.json");
      const result = await _disasterFederalAccountSpending();
      expect(result.kind).toBe("disaster_federal_account_spending");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.meta).not.toBeNull();
      expect(result.meta!.total_results).toBe(255);
    });

    it("sends POST to correct URL", async () => {
      const getCapture = mockFetchCapture("disaster/federal-account-spending.json");
      await _disasterFederalAccountSpending();
      const captured = getCapture();
      expect(captured!.url).toContain("/api/v2/disaster/federal_account/spending/");
    });
  });

  describe("_disasterFederalAccountLoans", () => {
    it("returns paginated loan data by federal account", async () => {
      mockFetch("disaster/federal-account-loans.json");
      const result = await _disasterFederalAccountLoans();
      expect(result.kind).toBe("disaster_federal_account_loans");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.meta).not.toBeNull();
    });

    it("sends POST to correct URL", async () => {
      const getCapture = mockFetchCapture("disaster/federal-account-loans.json");
      await _disasterFederalAccountLoans();
      const captured = getCapture();
      expect(captured!.url).toContain("/api/v2/disaster/federal_account/loans/");
    });
  });

  describe("_disasterFederalAccountCount", () => {
    it("returns count", async () => {
      mockFetch("disaster/federal-account-count.json");
      const result = await _disasterFederalAccountCount();
      expect(result.kind).toBe("disaster_federal_account_count");
      expect(typeof result.data.count).toBe("number");
    });

    it("sends POST to correct URL", async () => {
      const getCapture = mockFetchCapture("disaster/federal-account-count.json");
      await _disasterFederalAccountCount();
      const captured = getCapture();
      expect(captured!.url).toContain("/api/v2/disaster/federal_account/count/");
    });
  });

  // --- Object Class ---

  describe("_disasterObjectClassSpending", () => {
    it("returns paginated spending by object class", async () => {
      mockFetch("disaster/object-class-spending.json");
      const result = await _disasterObjectClassSpending();
      expect(result.kind).toBe("disaster_object_class_spending");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.meta).not.toBeNull();
      expect(result.meta!.total_results).toBe(6);
    });

    it("sends POST to correct URL", async () => {
      const getCapture = mockFetchCapture("disaster/object-class-spending.json");
      await _disasterObjectClassSpending();
      const captured = getCapture();
      expect(captured!.url).toContain("/api/v2/disaster/object_class/spending/");
    });
  });

  describe("_disasterObjectClassLoans", () => {
    it("returns paginated loan data by object class", async () => {
      mockFetch("disaster/object-class-loans.json");
      const result = await _disasterObjectClassLoans();
      expect(result.kind).toBe("disaster_object_class_loans");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.meta).not.toBeNull();
    });

    it("sends POST to correct URL", async () => {
      const getCapture = mockFetchCapture("disaster/object-class-loans.json");
      await _disasterObjectClassLoans();
      const captured = getCapture();
      expect(captured!.url).toContain("/api/v2/disaster/object_class/loans/");
    });
  });

  describe("_disasterObjectClassCount", () => {
    it("returns count", async () => {
      mockFetch("disaster/object-class-count.json");
      const result = await _disasterObjectClassCount();
      expect(result.kind).toBe("disaster_object_class_count");
      expect(typeof result.data.count).toBe("number");
    });

    it("sends POST to correct URL", async () => {
      const getCapture = mockFetchCapture("disaster/object-class-count.json");
      await _disasterObjectClassCount();
      const captured = getCapture();
      expect(captured!.url).toContain("/api/v2/disaster/object_class/count/");
    });
  });

  // --- Recipient ---

  describe("_disasterRecipientSpending", () => {
    it("returns paginated spending by recipient", async () => {
      mockFetch("disaster/recipient-spending.json");
      const result = await _disasterRecipientSpending();
      expect(result.kind).toBe("disaster_recipient_spending");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.meta).not.toBeNull();
      expect(result.meta!.total_results).toBe(10000);
    });

    it("sends POST to correct URL", async () => {
      const getCapture = mockFetchCapture("disaster/recipient-spending.json");
      await _disasterRecipientSpending();
      const captured = getCapture();
      expect(captured!.url).toContain("/api/v2/disaster/recipient/spending/");
    });
  });

  describe("_disasterRecipientLoans", () => {
    it("returns paginated loan data by recipient", async () => {
      mockFetch("disaster/recipient-loans.json");
      const result = await _disasterRecipientLoans();
      expect(result.kind).toBe("disaster_recipient_loans");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.meta).not.toBeNull();
    });

    it("sends POST to correct URL", async () => {
      const getCapture = mockFetchCapture("disaster/recipient-loans.json");
      await _disasterRecipientLoans();
      const captured = getCapture();
      expect(captured!.url).toContain("/api/v2/disaster/recipient/loans/");
    });
  });

  describe("_disasterRecipientCount", () => {
    it("returns count", async () => {
      mockFetch("disaster/recipient-count.json");
      const result = await _disasterRecipientCount();
      expect(result.kind).toBe("disaster_recipient_count");
      expect(typeof result.data.count).toBe("number");
    });

    it("sends POST to correct URL", async () => {
      const getCapture = mockFetchCapture("disaster/recipient-count.json");
      await _disasterRecipientCount();
      const captured = getCapture();
      expect(captured!.url).toContain("/api/v2/disaster/recipient/count/");
    });
  });

  // --- Spending by geography ---

  describe("_disasterSpendingByGeography", () => {
    it("returns geography spending data", async () => {
      mockFetch("disaster/spending-by-geography.json");
      const result = await _disasterSpendingByGeography();
      expect(result.kind).toBe("disaster_spending_by_geography");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.meta).not.toBeNull();
      expect(result.meta!.pages).toBe(1);
    });

    it("items have amount, display_name, shape_code", async () => {
      mockFetch("disaster/spending-by-geography.json");
      const result = await _disasterSpendingByGeography();
      const item = result.data[0];
      expect(typeof item.amount).toBe("number");
      expect(item.display_name).toBe("California");
      expect(item.shape_code).toBe("CA");
      expect(typeof item.population).toBe("number");
      expect(typeof item.per_capita).toBe("number");
      expect(typeof item.award_count).toBe("number");
    });

    it("sends POST with spending_type in body", async () => {
      const getCapture = mockFetchCapture("disaster/spending-by-geography.json");
      await _disasterSpendingByGeography({ spending_type: "outlay", geo_layer: "state" });
      const captured = getCapture();
      expect(captured!.init?.method).toBe("POST");
      const body = JSON.parse(captured!.init?.body as string);
      expect(body.filter.def_codes).toBeDefined();
      expect(body.spending_type).toBe("outlay");
      expect(body.geo_layer).toBe("state");
      expect(captured!.url).toContain("/api/v2/disaster/spending_by_geography/");
    });

    it("defaults def_codes when not provided", async () => {
      const getCapture = mockFetchCapture("disaster/spending-by-geography.json");
      await _disasterSpendingByGeography();
      const captured = getCapture();
      const body = JSON.parse(captured!.init?.body as string);
      expect(body.filter.def_codes).toEqual(["L", "M", "N", "O", "P", "U", "V"]);
    });
  });

  // --- URL/body capture: default def_codes ---

  describe("POST body defaults", () => {
    it("all POST endpoints default def_codes to L,M,N,O,P,U,V", async () => {
      const getCapture = mockFetchCapture("disaster/award-amount.json");
      await _disasterAwardAmount();
      const captured = getCapture();
      const body = JSON.parse(captured!.init?.body as string);
      expect(body.filter.def_codes).toEqual(["L", "M", "N", "O", "P", "U", "V"]);
    });

    it("passes sort, order, page, limit in body", async () => {
      const getCapture = mockFetchCapture("disaster/agency-spending.json");
      await _disasterAgencySpending({ sort: "obligation", order: "desc", page: 2, limit: 25 });
      const captured = getCapture();
      const body = JSON.parse(captured!.init?.body as string);
      expect(body.sort).toBe("obligation");
      expect(body.order).toBe("desc");
      expect(body.page).toBe(2);
      expect(body.limit).toBe(25);
    });
  });

  // --- Schema parsing ---

  describe("schema parsing", () => {
    it("DisasterOverviewSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/disaster/overview.json`).json();
      const result = DisasterOverviewSchema.parse(data);
      expect(result.funding.length).toBeGreaterThan(0);
      expect(typeof result.total_budget_authority).toBe("number");
      expect(typeof result.spending.award_obligations).toBe("number");
    });

    it("DisasterAwardAmountSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/disaster/award-amount.json`).json();
      const result = DisasterAwardAmountSchema.parse(data);
      expect(typeof result.award_count).toBe("number");
      expect(typeof result.obligation).toBe("number");
      expect(typeof result.outlay).toBe("number");
    });

    it("DisasterCountSchema parses award-count fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/disaster/award-count.json`).json();
      const result = DisasterCountSchema.parse(data);
      expect(result.count).toBeGreaterThan(0);
    });

    it("DisasterCountSchema parses agency-count fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/disaster/agency-count.json`).json();
      const result = DisasterCountSchema.parse(data);
      expect(result.count).toBe(38);
    });

    it("DisasterCountSchema parses cfda-count fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/disaster/cfda-count.json`).json();
      const result = DisasterCountSchema.parse(data);
      expect(typeof result.count).toBe("number");
    });

    it("DisasterCountSchema parses def-code-count fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/disaster/def-code-count.json`).json();
      const result = DisasterCountSchema.parse(data);
      expect(result.count).toBe(5);
    });

    it("DisasterCountSchema parses federal-account-count fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/disaster/federal-account-count.json`).json();
      const result = DisasterCountSchema.parse(data);
      expect(typeof result.count).toBe("number");
    });

    it("DisasterCountSchema parses object-class-count fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/disaster/object-class-count.json`).json();
      const result = DisasterCountSchema.parse(data);
      expect(typeof result.count).toBe("number");
    });

    it("DisasterCountSchema parses recipient-count fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/disaster/recipient-count.json`).json();
      const result = DisasterCountSchema.parse(data);
      expect(typeof result.count).toBe("number");
    });

    it("DisasterSpendingResponseSchema parses agency-spending fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/disaster/agency-spending.json`).json();
      const result = DisasterSpendingResponseSchema.parse(data);
      expect(result.results.length).toBeGreaterThan(0);
      expect(result.page_metadata).toBeDefined();
      expect(typeof result.totals.obligation).toBe("number");
    });

    it("DisasterSpendingResponseSchema parses federal-account-spending fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/disaster/federal-account-spending.json`).json();
      const result = DisasterSpendingResponseSchema.parse(data);
      expect(result.results.length).toBeGreaterThan(0);
    });

    it("DisasterSpendingResponseSchema parses object-class-spending fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/disaster/object-class-spending.json`).json();
      const result = DisasterSpendingResponseSchema.parse(data);
      expect(result.results.length).toBeGreaterThan(0);
    });

    it("DisasterSpendingResponseSchema parses recipient-spending fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/disaster/recipient-spending.json`).json();
      const result = DisasterSpendingResponseSchema.parse(data);
      expect(result.results.length).toBeGreaterThan(0);
    });

    it("DisasterLoanResponseSchema parses agency-loans fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/disaster/agency-loans.json`).json();
      const result = DisasterLoanResponseSchema.parse(data);
      expect(result.results.length).toBeGreaterThan(0);
      expect(typeof result.totals.face_value_of_loan).toBe("number");
    });

    it("DisasterLoanResponseSchema parses federal-account-loans fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/disaster/federal-account-loans.json`).json();
      const result = DisasterLoanResponseSchema.parse(data);
      expect(result.results.length).toBeGreaterThan(0);
    });

    it("DisasterLoanResponseSchema parses object-class-loans fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/disaster/object-class-loans.json`).json();
      const result = DisasterLoanResponseSchema.parse(data);
      expect(result.results.length).toBeGreaterThan(0);
    });

    it("DisasterLoanResponseSchema parses recipient-loans fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/disaster/recipient-loans.json`).json();
      const result = DisasterLoanResponseSchema.parse(data);
      expect(result.results.length).toBeGreaterThan(0);
    });

    it("DisasterCfdaResponseSchema parses cfda-spending fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/disaster/cfda-spending.json`).json();
      const result = DisasterCfdaResponseSchema.parse(data);
      expect(result.results.length).toBeGreaterThan(0);
      expect(result.results[0].code).toBeTruthy();
    });

    it("DisasterCfdaLoanResponseSchema parses cfda-loans fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/disaster/cfda-loans.json`).json();
      const result = DisasterCfdaLoanResponseSchema.parse(data);
      expect(result.results.length).toBeGreaterThan(0);
    });

    it("DisasterGeoResponseSchema parses spending-by-geography fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/disaster/spending-by-geography.json`).json();
      const result = DisasterGeoResponseSchema.parse(data);
      expect(result.geo_layer).toBe("state");
      expect(result.spending_type).toBe("obligation");
      expect(result.results.length).toBeGreaterThan(0);
      const ca = result.results.find((r) => r.shape_code === "CA");
      expect(ca).toBeDefined();
      expect(ca!.display_name).toBe("California");
    });
  });

  // --- Describe metadata ---

  describe("disasterEndpoints describe metadata", () => {
    it("has 20 endpoints", () => {
      expect(disasterEndpoints.length).toBe(20);
    });

    it("disaster_overview has no required params", () => {
      const ep = disasterEndpoints.find((e) => e.name === "disaster_overview");
      expect(ep).toBeDefined();
      expect(ep!.params.length).toBe(0);
    });

    it("disaster_spending_by_geography has geo-specific params", () => {
      const ep = disasterEndpoints.find((e) => e.name === "disaster_spending_by_geography");
      expect(ep).toBeDefined();
      const paramNames = ep!.params.map((p) => p.name);
      expect(paramNames).toContain("geo_layer");
      expect(paramNames).toContain("scope");
      expect(paramNames).toContain("spending_type");
    });

    it("count endpoints use countOnlyParams (def_codes only)", () => {
      const countEndpoints = disasterEndpoints.filter((e) => e.name.endsWith("_count") && e.name !== "disaster_award_count");
      for (const ep of countEndpoints) {
        expect(ep.params.length).toBe(1);
        expect(ep.params[0].name).toBe("def_codes");
      }
    });

    it("all endpoints have descriptions and responseFields", () => {
      for (const ep of disasterEndpoints) {
        expect(ep.description.length).toBeGreaterThan(0);
        expect(ep.responseFields.length).toBeGreaterThan(0);
      }
    });
  });

  // --- KindMap type test ---

  describe("DisasterKindMap type", () => {
    it("kind map resolves correctly", () => {
      const map: DisasterKindMap = {
        disaster_overview: { funding: [], total_budget_authority: 0, spending: { award_obligations: 0, award_outlays: 0, total_obligations: 0, total_outlays: 0 } },
        disaster_award_amount: { award_count: 0, obligation: 0, outlay: 0 },
        disaster_award_count: { count: 0 },
        disaster_agency_spending: [],
        disaster_agency_loans: [],
        disaster_agency_count: { count: 0 },
        disaster_cfda_spending: [],
        disaster_cfda_loans: [],
        disaster_cfda_count: { count: 0 },
        disaster_def_code_count: { count: 0 },
        disaster_federal_account_spending: [],
        disaster_federal_account_loans: [],
        disaster_federal_account_count: { count: 0 },
        disaster_object_class_spending: [],
        disaster_object_class_loans: [],
        disaster_object_class_count: { count: 0 },
        disaster_recipient_spending: [],
        disaster_recipient_loans: [],
        disaster_recipient_count: { count: 0 },
        disaster_spending_by_geography: [],
      };
      expect(map.disaster_overview.funding).toBeInstanceOf(Array);
      expect(typeof map.disaster_award_amount.obligation).toBe("number");
      expect(typeof map.disaster_award_count.count).toBe("number");
      expect(map.disaster_agency_spending).toBeInstanceOf(Array);
      expect(map.disaster_spending_by_geography).toBeInstanceOf(Array);
    });
  });
});
