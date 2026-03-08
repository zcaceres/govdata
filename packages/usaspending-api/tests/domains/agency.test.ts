import { describe, it, expect, afterEach } from "bun:test";
import {
  _agencyOverview,
  _agencyAwards,
  _agencyNewAwardCount,
  _agencyAwardsCount,
  _agencyBudgetFunction,
  _agencyBudgetFunctionCount,
  _agencyBudgetaryResources,
  _agencyFederalAccount,
  _agencyFederalAccountCount,
  _agencyObjectClass,
  _agencyObjectClassCount,
  _agencyObligationsByAwardCategory,
  _agencyProgramActivity,
  _agencyProgramActivityCount,
  _agencySubAgency,
  _agencySubAgencyCount,
  _agencySubComponents,
  _agencyTreasuryAccountObjectClass,
  _agencyTreasuryAccountProgramActivity,
  AgencyOverviewSchema,
  AgencyAwardsSchema,
  AgencyNewAwardCountSchema,
  AgencyAwardsCountResponseSchema,
  BudgetFunctionResponseSchema,
  BudgetFunctionCountSchema,
  BudgetaryResourcesResponseSchema,
  FederalAccountResponseSchema,
  FederalAccountCountSchema,
  ObjectClassResponseSchema,
  ObjectClassCountSchema,
  ObligationsByCategoryResponseSchema,
  ProgramActivityResponseSchema,
  ProgramActivityCountSchema,
  SubAgencyResponseSchema,
  SubAgencyCountSchema,
  SubComponentsResponseSchema,
  TreasuryAccountResponseSchema,
  agencyEndpoints,
} from "../../src/domains/agency";
import type { AgencyKindMap } from "../../src/domains/agency";

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

describe("agency domain", () => {
  describe("_agencyOverview", () => {
    it("returns agency overview for NASA", async () => {
      mockFetch("agency/overview.json");
      const result = await _agencyOverview("080");
      expect(result.kind).toBe("agency");
      expect(result.data.length).toBe(1);
      expect(result.data[0].toptier_code).toBe("080");
      expect(result.data[0].name).toBeTruthy();
      expect(result.meta).toBeNull();
    });

    it("returns agency overview for DoD", async () => {
      mockFetch("agency/overview-dod.json");
      const result = await _agencyOverview("097");
      expect(result.data[0].name).toContain("Defense");
    });

    it("encodes toptier code in URL", async () => {
      const getCapture = mockFetchCapture("agency/overview.json");
      await _agencyOverview("080");
      expect(getCapture()!.url).toContain("/api/v2/agency/080/");
    });
  });

  describe("_agencyAwards", () => {
    it("returns awards summary", async () => {
      mockFetch("agency/awards.json");
      const result = await _agencyAwards("080");
      expect(result.kind).toBe("agency_awards");
      expect(typeof result.data.transaction_count).toBe("number");
      expect(typeof result.data.obligations).toBe("number");
    });

    it("passes fiscal_year as query param", async () => {
      const getCapture = mockFetchCapture("agency/awards.json");
      await _agencyAwards("080", { fiscal_year: 2024 });
      expect(getCapture()!.url).toContain("fiscal_year=2024");
    });
  });

  describe("_agencyNewAwardCount", () => {
    it("returns new award count", async () => {
      mockFetch("agency/awards-new-count.json");
      const result = await _agencyNewAwardCount("080");
      expect(result.kind).toBe("agency_new_award_count");
      expect(typeof result.data.new_award_count).toBe("number");
    });
  });

  describe("_agencyAwardsCount", () => {
    it("returns award counts for all agencies", async () => {
      mockFetch("agency/awards-count-all.json");
      const result = await _agencyAwardsCount();
      expect(result.kind).toBe("agency_awards_count");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
    });
  });

  describe("_agencyBudgetFunction", () => {
    it("returns budget function breakdown", async () => {
      mockFetch("agency/budget-function.json");
      const result = await _agencyBudgetFunction("080");
      expect(result.kind).toBe("agency_budget_function");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data[0]).toHaveProperty("name");
      expect(result.data[0]).toHaveProperty("obligated_amount");
    });
  });

  describe("_agencyBudgetFunctionCount", () => {
    it("returns budget function counts", async () => {
      mockFetch("agency/budget-function-count.json");
      const result = await _agencyBudgetFunctionCount("080");
      expect(result.kind).toBe("agency_budget_function_count");
      expect(typeof result.data.budget_function_count).toBe("number");
      expect(typeof result.data.budget_sub_function_count).toBe("number");
    });
  });

  describe("_agencyBudgetaryResources", () => {
    it("returns budgetary resources by year", async () => {
      mockFetch("agency/budgetary-resources.json");
      const result = await _agencyBudgetaryResources("080");
      expect(result.kind).toBe("agency_budgetary_resources");
      expect(result.data.agency_data_by_year).toBeInstanceOf(Array);
      expect(result.data.agency_data_by_year[0]).toHaveProperty("fiscal_year");
      expect(result.data.agency_data_by_year[0]).toHaveProperty("agency_budgetary_resources");
    });
  });

  describe("_agencyFederalAccount", () => {
    it("returns federal accounts with pagination", async () => {
      mockFetch("agency/federal-account.json");
      const result = await _agencyFederalAccount("080");
      expect(result.kind).toBe("agency_federal_account");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data[0]).toHaveProperty("code");
      expect(result.data[0]).toHaveProperty("name");
      expect(result.meta).toBeDefined();
    });
  });

  describe("_agencyFederalAccountCount", () => {
    it("returns federal account counts", async () => {
      mockFetch("agency/federal-account-count.json");
      const result = await _agencyFederalAccountCount("080");
      expect(result.kind).toBe("agency_federal_account_count");
      expect(typeof result.data.federal_account_count).toBe("number");
      expect(typeof result.data.treasury_account_count).toBe("number");
    });
  });

  describe("_agencyObjectClass", () => {
    it("returns object class breakdown with pagination", async () => {
      mockFetch("agency/object-class.json");
      const result = await _agencyObjectClass("080");
      expect(result.kind).toBe("agency_object_class");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data[0]).toHaveProperty("name");
      expect(result.data[0]).toHaveProperty("obligated_amount");
    });
  });

  describe("_agencyObjectClassCount", () => {
    it("returns object class count", async () => {
      mockFetch("agency/object-class-count.json");
      const result = await _agencyObjectClassCount("080");
      expect(result.kind).toBe("agency_object_class_count");
      expect(typeof result.data.object_class_count).toBe("number");
    });
  });

  describe("_agencyObligationsByAwardCategory", () => {
    it("returns obligations by award category", async () => {
      mockFetch("agency/obligations-by-award-category.json");
      const result = await _agencyObligationsByAwardCategory("080");
      expect(result.kind).toBe("agency_obligations_by_award_category");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data[0]).toHaveProperty("category");
      expect(result.data[0]).toHaveProperty("aggregated_amount");
    });
  });

  describe("_agencyProgramActivity", () => {
    it("returns program activity breakdown", async () => {
      mockFetch("agency/program-activity.json");
      const result = await _agencyProgramActivity("080");
      expect(result.kind).toBe("agency_program_activity");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data[0]).toHaveProperty("name");
      expect(result.data[0]).toHaveProperty("obligated_amount");
    });
  });

  describe("_agencyProgramActivityCount", () => {
    it("returns program activity count", async () => {
      mockFetch("agency/program-activity-count.json");
      const result = await _agencyProgramActivityCount("080");
      expect(result.kind).toBe("agency_program_activity_count");
      expect(typeof result.data.program_activity_count).toBe("number");
    });
  });

  describe("_agencySubAgency", () => {
    it("returns sub-agencies", async () => {
      mockFetch("agency/sub-agency.json");
      const result = await _agencySubAgency("080");
      expect(result.kind).toBe("agency_sub_agency");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data[0]).toHaveProperty("name");
      expect(result.data[0]).toHaveProperty("total_obligations");
    });
  });

  describe("_agencySubAgencyCount", () => {
    it("returns sub-agency and office counts", async () => {
      mockFetch("agency/sub-agency-count.json");
      const result = await _agencySubAgencyCount("080");
      expect(result.kind).toBe("agency_sub_agency_count");
      expect(typeof result.data.sub_agency_count).toBe("number");
      expect(typeof result.data.office_count).toBe("number");
    });
  });

  describe("_agencySubComponents", () => {
    it("returns sub-components", async () => {
      mockFetch("agency/sub-components.json");
      const result = await _agencySubComponents("080");
      expect(result.kind).toBe("agency_sub_components");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data[0]).toHaveProperty("name");
      expect(result.data[0]).toHaveProperty("total_obligations");
    });
  });

  describe("_agencyTreasuryAccountObjectClass", () => {
    it("returns treasury account object class data", async () => {
      mockFetch("agency/treasury-account-object-class.json");
      const result = await _agencyTreasuryAccountObjectClass("080", "080-0110");
      expect(result.kind).toBe("agency_treasury_account_object_class");
      expect(result.data).toBeInstanceOf(Array);
    });

    it("includes correct path segments", async () => {
      const getCapture = mockFetchCapture("agency/treasury-account-object-class.json");
      await _agencyTreasuryAccountObjectClass("080", "080-0110");
      const url = getCapture()!.url;
      expect(url).toContain("/agency/080/");
      expect(url).toContain("/sub_components/080-0110/object_class/");
    });
  });

  describe("_agencyTreasuryAccountProgramActivity", () => {
    it("returns treasury account program activity data", async () => {
      mockFetch("agency/treasury-account-program-activity.json");
      const result = await _agencyTreasuryAccountProgramActivity("080", "080-0110");
      expect(result.kind).toBe("agency_treasury_account_program_activity");
      expect(result.data).toBeInstanceOf(Array);
    });
  });

  // --- Schema parsing against real fixtures ---

  describe("schema parsing", () => {
    it("AgencyOverviewSchema parses NASA fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/agency/overview.json`).json();
      const result = AgencyOverviewSchema.parse(data);
      expect(result.toptier_code).toBe("080");
    });

    it("AgencyAwardsSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/agency/awards.json`).json();
      const result = AgencyAwardsSchema.parse(data);
      expect(typeof result.transaction_count).toBe("number");
    });

    it("AgencyNewAwardCountSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/agency/awards-new-count.json`).json();
      const result = AgencyNewAwardCountSchema.parse(data);
      expect(typeof result.new_award_count).toBe("number");
    });

    it("AgencyAwardsCountResponseSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/agency/awards-count-all.json`).json();
      const result = AgencyAwardsCountResponseSchema.parse(data);
      expect(result.results).toBeInstanceOf(Array);
    });

    it("BudgetFunctionResponseSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/agency/budget-function.json`).json();
      const result = BudgetFunctionResponseSchema.parse(data);
      expect(result.results).toBeInstanceOf(Array);
    });

    it("BudgetFunctionCountSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/agency/budget-function-count.json`).json();
      const result = BudgetFunctionCountSchema.parse(data);
      expect(typeof result.budget_function_count).toBe("number");
    });

    it("BudgetaryResourcesResponseSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/agency/budgetary-resources.json`).json();
      const result = BudgetaryResourcesResponseSchema.parse(data);
      expect(result.agency_data_by_year).toBeInstanceOf(Array);
    });

    it("FederalAccountResponseSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/agency/federal-account.json`).json();
      const result = FederalAccountResponseSchema.parse(data);
      expect(result.results).toBeInstanceOf(Array);
    });

    it("FederalAccountCountSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/agency/federal-account-count.json`).json();
      const result = FederalAccountCountSchema.parse(data);
      expect(typeof result.federal_account_count).toBe("number");
    });

    it("ObjectClassResponseSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/agency/object-class.json`).json();
      const result = ObjectClassResponseSchema.parse(data);
      expect(result.results).toBeInstanceOf(Array);
    });

    it("ObjectClassCountSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/agency/object-class-count.json`).json();
      const result = ObjectClassCountSchema.parse(data);
      expect(typeof result.object_class_count).toBe("number");
    });

    it("ObligationsByCategoryResponseSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/agency/obligations-by-award-category.json`).json();
      const result = ObligationsByCategoryResponseSchema.parse(data);
      expect(result.results).toBeInstanceOf(Array);
    });

    it("ProgramActivityResponseSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/agency/program-activity.json`).json();
      const result = ProgramActivityResponseSchema.parse(data);
      expect(result.results).toBeInstanceOf(Array);
    });

    it("ProgramActivityCountSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/agency/program-activity-count.json`).json();
      const result = ProgramActivityCountSchema.parse(data);
      expect(typeof result.program_activity_count).toBe("number");
    });

    it("SubAgencyResponseSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/agency/sub-agency.json`).json();
      const result = SubAgencyResponseSchema.parse(data);
      expect(result.results).toBeInstanceOf(Array);
    });

    it("SubAgencyCountSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/agency/sub-agency-count.json`).json();
      const result = SubAgencyCountSchema.parse(data);
      expect(typeof result.sub_agency_count).toBe("number");
    });

    it("SubComponentsResponseSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/agency/sub-components.json`).json();
      const result = SubComponentsResponseSchema.parse(data);
      expect(result.results).toBeInstanceOf(Array);
    });

    it("TreasuryAccountResponseSchema parses object class fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/agency/treasury-account-object-class.json`).json();
      const result = TreasuryAccountResponseSchema.parse(data);
      expect(result.results).toBeInstanceOf(Array);
    });

    it("TreasuryAccountResponseSchema parses program activity fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/agency/treasury-account-program-activity.json`).json();
      const result = TreasuryAccountResponseSchema.parse(data);
      expect(result.results).toBeInstanceOf(Array);
    });
  });

  // --- Describe metadata ---

  describe("agencyEndpoints describe metadata", () => {
    it("has 19 agency endpoints", () => {
      expect(agencyEndpoints.length).toBe(19);
    });

    it("all endpoints have required fields", () => {
      for (const ep of agencyEndpoints) {
        expect(typeof ep.name).toBe("string");
        expect(typeof ep.path).toBe("string");
        expect(typeof ep.description).toBe("string");
        expect(ep.params).toBeInstanceOf(Array);
        expect(ep.responseFields.length).toBeGreaterThan(0);
      }
    });

    it("most endpoints require toptier_code", () => {
      const withCode = agencyEndpoints.filter(
        (e) => e.params.some((p) => p.name === "toptier_code" && p.required),
      );
      // agency_awards_count is the only one without toptier_code
      expect(withCode.length).toBe(18);
    });
  });

  describe("AgencyKindMap type", () => {
    it("agency kind resolves correctly for all kinds", () => {
      const map: Partial<AgencyKindMap> = {
        agency: [],
        agency_awards: { toptier_code: "080", transaction_count: 0, obligations: 0 },
        agency_budget_function: [],
        agency_obligations_by_award_category: [],
      };
      expect(map.agency).toBeInstanceOf(Array);
      expect(typeof map.agency_awards!.obligations).toBe("number");
    });
  });
});
