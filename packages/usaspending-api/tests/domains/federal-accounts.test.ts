import { describe, it, expect, afterEach } from "bun:test";
import {
  _federalAccountList,
  _federalAccountDetail,
  _federalAccountFiscalYearSnapshot,
  _federalAccountAvailableObjectClasses,
  _federalAccountObjectClasses,
  _federalAccountProgramActivities,
  _federalAccountProgramActivitiesTotal,
  FederalAccountListResponseSchema,
  FederalAccountDetailSchema,
  FiscalYearSnapshotSchema,
  AvailableObjectClassResponseSchema,
  ObjectClassTotalResponseSchema,
  ProgramActivityResponseSchema,
  ProgramActivityTotalResponseSchema,
  federalAccountsEndpoints,
} from "../../src/domains/federal-accounts";
import type { FederalAccountsKindMap } from "../../src/domains/federal-accounts";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function mockFetch(fixture: string) {
  globalThis.fetch = (async () => {
    const data = await Bun.file(`${import.meta.dir}/../../fixtures/federal-accounts/${fixture}`).json();
    return new Response(JSON.stringify(data), { status: 200 });
  }) as unknown as typeof fetch;
}

function mockFetchCapture(fixture: string) {
  let captured: { url: string; init?: RequestInit } | undefined;
  globalThis.fetch = (async (url: string, init?: RequestInit) => {
    captured = { url, init };
    const data = await Bun.file(`${import.meta.dir}/../../fixtures/federal-accounts/${fixture}`).json();
    return new Response(JSON.stringify(data), { status: 200 });
  }) as unknown as typeof fetch;
  return () => captured;
}

describe("federal-accounts domain", () => {
  describe("_federalAccountList", () => {
    it("returns paginated list", async () => {
      mockFetch("list.json");
      const result = await _federalAccountList();
      expect(result.kind).toBe("federal_account_list");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.meta).not.toBeNull();
    });

    it("sends POST with keyword", async () => {
      const getCapture = mockFetchCapture("list.json");
      await _federalAccountList({ keyword: "nasa" });
      const captured = getCapture();
      expect(captured!.url).toContain("/api/v2/federal_account/");
      const body = JSON.parse(captured!.init?.body as string);
      expect(body.keyword).toBe("nasa");
    });

    it("items have account_id, account_name, budgetary_resources", async () => {
      mockFetch("list.json");
      const result = await _federalAccountList();
      const item = result.data[0];
      expect(item.account_id).toBeDefined();
      expect(item.account_name).toBeDefined();
      expect(typeof item.budgetary_resources).toBe("number");
    });

    it("meta reflects pagination", async () => {
      mockFetch("list.json");
      const result = await _federalAccountList();
      expect(result.meta!.total_results).toBe(18);
      expect(result.meta!.pages).toBe(2); // hasNext is true, page is 1 => pages = 2
    });
  });

  describe("_federalAccountDetail", () => {
    it("returns detail for an account", async () => {
      mockFetch("detail.json");
      const result = await _federalAccountDetail(5623);
      expect(result.kind).toBe("federal_account_detail");
      expect(result.data.id).toBe(5623);
      expect(result.data.account_title).toContain("National Aeronautics");
      expect(result.meta).toBeNull();
    });

    it("encodes id in URL", async () => {
      const getCapture = mockFetchCapture("detail.json");
      await _federalAccountDetail(5623);
      expect(getCapture()!.url).toContain("/api/v2/federal_account/5623/");
    });

    it("uses GET request", async () => {
      const getCapture = mockFetchCapture("detail.json");
      await _federalAccountDetail(5623);
      const captured = getCapture();
      expect(captured!.init).toBeUndefined();
    });
  });

  describe("_federalAccountFiscalYearSnapshot", () => {
    it("returns snapshot without fy", async () => {
      mockFetch("fiscal-year-snapshot.json");
      const result = await _federalAccountFiscalYearSnapshot(5623);
      expect(result.kind).toBe("federal_account_fiscal_year_snapshot");
      expect(result.meta).toBeNull();
    });

    it("returns snapshot with fy", async () => {
      mockFetch("fiscal-year-snapshot-2024.json");
      const result = await _federalAccountFiscalYearSnapshot(5623, 2024);
      expect(result.kind).toBe("federal_account_fiscal_year_snapshot");
      expect(result.meta).toBeNull();
    });

    it("includes fy in URL when provided", async () => {
      const getCapture = mockFetchCapture("fiscal-year-snapshot-2024.json");
      await _federalAccountFiscalYearSnapshot(5623, 2024);
      expect(getCapture()!.url).toContain("/api/v2/federal_account/5623/fiscal_year_snapshot/2024/");
    });

    it("omits fy from URL when not provided", async () => {
      const getCapture = mockFetchCapture("fiscal-year-snapshot.json");
      await _federalAccountFiscalYearSnapshot(5623);
      const url = getCapture()!.url;
      expect(url).toContain("/api/v2/federal_account/5623/fiscal_year_snapshot/");
      expect(url).not.toContain("/fiscal_year_snapshot/2024");
    });
  });

  describe("_federalAccountAvailableObjectClasses", () => {
    it("returns array of object classes", async () => {
      mockFetch("available-object-classes.json");
      const result = await _federalAccountAvailableObjectClasses(5623);
      expect(result.kind).toBe("federal_account_available_object_classes");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.meta).toBeNull();
    });

    it("items have id, name, minor_object_class", async () => {
      mockFetch("available-object-classes.json");
      const result = await _federalAccountAvailableObjectClasses(5623);
      const item = result.data[0];
      expect(item.id).toBeDefined();
      expect(item.name).toBeDefined();
      expect(item.minor_object_class).toBeInstanceOf(Array);
    });

    it("encodes id in URL", async () => {
      const getCapture = mockFetchCapture("available-object-classes.json");
      await _federalAccountAvailableObjectClasses(5623);
      expect(getCapture()!.url).toContain("/api/v2/federal_account/5623/available_object_classes/");
    });
  });

  describe("_federalAccountObjectClasses", () => {
    it("returns paginated spending by object class", async () => {
      mockFetch("object-classes-total.json");
      const result = await _federalAccountObjectClasses(5623);
      expect(result.kind).toBe("federal_account_object_classes");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.meta).not.toBeNull();
    });

    it("items have code, obligations, name", async () => {
      mockFetch("object-classes-total.json");
      const result = await _federalAccountObjectClasses(5623);
      const item = result.data[0];
      expect(item.code).toBeDefined();
      expect(typeof item.obligations).toBe("number");
      expect(item.name).toBeDefined();
    });

    it("sends POST with pagination params", async () => {
      const getCapture = mockFetchCapture("object-classes-total.json");
      await _federalAccountObjectClasses(5623, { page: 2, limit: 5 });
      const captured = getCapture();
      expect(captured!.url).toContain("/api/v2/federal_account/5623/spending_by_object_class/");
      const body = JSON.parse(captured!.init?.body as string);
      expect(body.page).toBe(2);
      expect(body.limit).toBe(5);
    });
  });

  describe("_federalAccountProgramActivities", () => {
    it("returns paginated program activities", async () => {
      mockFetch("program-activities.json");
      const result = await _federalAccountProgramActivities(5623);
      expect(result.kind).toBe("federal_account_program_activities");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.meta).not.toBeNull();
    });

    it("items have code, name, type", async () => {
      mockFetch("program-activities.json");
      const result = await _federalAccountProgramActivities(5623);
      const item = result.data[0];
      expect(item.code).toBe("0001");
      expect(item.name).toContain("SCIENCE");
      expect(item.type).toBe("PAC/PAN");
    });

    it("sends POST to correct URL", async () => {
      const getCapture = mockFetchCapture("program-activities.json");
      await _federalAccountProgramActivities(5623);
      const captured = getCapture();
      expect(captured!.url).toContain("/api/v2/federal_account/5623/spending_by_program_activity/");
      expect(captured!.init?.method).toBe("POST");
    });
  });

  describe("_federalAccountProgramActivitiesTotal", () => {
    it("returns paginated program activity totals", async () => {
      mockFetch("program-activities-total.json");
      const result = await _federalAccountProgramActivitiesTotal(5623);
      expect(result.kind).toBe("federal_account_program_activities_total");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.meta).not.toBeNull();
    });

    it("items have code, obligations, name, type", async () => {
      mockFetch("program-activities-total.json");
      const result = await _federalAccountProgramActivitiesTotal(5623);
      const item = result.data[0];
      expect(item.code).toBe("0001");
      expect(typeof item.obligations).toBe("number");
      expect(item.name).toContain("SCIENCE");
      expect(item.type).toBe("PAC/PAN");
    });

    it("sends POST to correct URL", async () => {
      const getCapture = mockFetchCapture("program-activities-total.json");
      await _federalAccountProgramActivitiesTotal(5623);
      const captured = getCapture();
      expect(captured!.url).toContain("/api/v2/federal_account/5623/spending_by_program_activity_object_class/");
      expect(captured!.init?.method).toBe("POST");
    });
  });

  describe("schema parsing", () => {
    it("FederalAccountListResponseSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/federal-accounts/list.json`).json();
      const result = FederalAccountListResponseSchema.parse(data);
      expect(result.results.length).toBeGreaterThan(0);
      expect(result.hasNext).toBe(true);
      expect(result.count).toBe(18);
    });

    it("FederalAccountDetailSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/federal-accounts/detail.json`).json();
      const result = FederalAccountDetailSchema.parse(data);
      expect(result.id).toBe(5623);
      expect(result.account_title).toContain("National Aeronautics");
      expect(result.federal_account_code).toBe("080-0110");
    });

    it("FiscalYearSnapshotSchema parses empty fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/federal-accounts/fiscal-year-snapshot.json`).json();
      const result = FiscalYearSnapshotSchema.parse(data);
      expect(Object.keys(result).length).toBe(0);
    });

    it("FiscalYearSnapshotSchema parses fy-specific fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/federal-accounts/fiscal-year-snapshot-2024.json`).json();
      const result = FiscalYearSnapshotSchema.parse(data);
      expect(result).toBeDefined();
    });

    it("AvailableObjectClassResponseSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/federal-accounts/available-object-classes.json`).json();
      const result = AvailableObjectClassResponseSchema.parse(data);
      expect(result.results.length).toBeGreaterThan(0);
      expect(result.results[0].id).toBeDefined();
      expect(result.results[0].minor_object_class!.length).toBeGreaterThan(0);
    });

    it("ObjectClassTotalResponseSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/federal-accounts/object-classes-total.json`).json();
      const result = ObjectClassTotalResponseSchema.parse(data);
      expect(result.results.length).toBeGreaterThan(0);
      expect(result.page_metadata).toBeDefined();
    });

    it("ProgramActivityResponseSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/federal-accounts/program-activities.json`).json();
      const result = ProgramActivityResponseSchema.parse(data);
      expect(result.results.length).toBeGreaterThan(0);
      expect(result.page_metadata).toBeDefined();
    });

    it("ProgramActivityTotalResponseSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/federal-accounts/program-activities-total.json`).json();
      const result = ProgramActivityTotalResponseSchema.parse(data);
      expect(result.results.length).toBeGreaterThan(0);
      expect(result.results[0].obligations).toBeDefined();
      expect(result.page_metadata).toBeDefined();
    });
  });

  describe("federalAccountsEndpoints describe metadata", () => {
    it("has 7 endpoints", () => {
      expect(federalAccountsEndpoints.length).toBe(7);
    });

    it("federal_account_list has no required params", () => {
      const ep = federalAccountsEndpoints.find(e => e.name === "federal_account_list");
      expect(ep).toBeDefined();
      const required = ep!.params.filter(p => p.required);
      expect(required.length).toBe(0);
    });

    it("federal_account_detail requires id", () => {
      const ep = federalAccountsEndpoints.find(e => e.name === "federal_account_detail");
      expect(ep).toBeDefined();
      const required = ep!.params.filter(p => p.required);
      expect(required.length).toBe(1);
      expect(required[0].name).toBe("id");
    });

    it("federal_account_fiscal_year_snapshot requires id, fy optional", () => {
      const ep = federalAccountsEndpoints.find(e => e.name === "federal_account_fiscal_year_snapshot");
      expect(ep).toBeDefined();
      const required = ep!.params.filter(p => p.required);
      expect(required.length).toBe(1);
      expect(required[0].name).toBe("id");
      const fyParam = ep!.params.find(p => p.name === "fy");
      expect(fyParam).toBeDefined();
      expect(fyParam!.required).toBe(false);
    });

    it("all endpoints have descriptions and response fields", () => {
      for (const ep of federalAccountsEndpoints) {
        expect(ep.description.length).toBeGreaterThan(0);
        expect(ep.responseFields.length).toBeGreaterThan(0);
      }
    });
  });

  describe("FederalAccountsKindMap type", () => {
    it("kind map resolves correctly", () => {
      const map: FederalAccountsKindMap = {
        federal_account_list: [],
        federal_account_detail: {} as any,
        federal_account_fiscal_year_snapshot: {},
        federal_account_available_object_classes: [],
        federal_account_object_classes: [],
        federal_account_program_activities: [],
        federal_account_program_activities_total: [],
      };
      expect(map.federal_account_list).toBeInstanceOf(Array);
      expect(map.federal_account_available_object_classes).toBeInstanceOf(Array);
      expect(typeof map.federal_account_fiscal_year_snapshot).toBe("object");
    });
  });
});
