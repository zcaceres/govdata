import { describe, it, expect } from "bun:test";
import { describe as describeEndpoints } from "../src/describe";
import { usaspendingPlugin } from "../src/plugin";

// Import from top-level re-exports
import {
  AwardSearchResponseSchema,
  AwardDetailSchema,
  AgencyOverviewSchema,
  SpendingByAgencyResponseSchema,
  SpendingByStateResponseSchema,
  SpendingOverTimeResponseSchema,
  AwardSearchParamsSchema,
  SpendingByAgencyParamsSchema,
  SpendingOverTimeParamsSchema,
  AwardSearchFiltersSchema,
  AwardTypeCodes,
  PageMetadataSchema,
} from "../src/schemas";

// Import from domains directly
import { AgencyOverviewSchema as DomainAgencySchema } from "../src/domains/agency";
import { AwardDetailSchema as DomainAwardSchema } from "../src/domains/awards";
import { AwardSearchResponseSchema as DomainSearchSchema } from "../src/domains/search";
import { SpendingByAgencyResponseSchema as DomainSpendingSchema } from "../src/domains/spending";
import { SpendingByStateResponseSchema as DomainRecipientSchema } from "../src/domains/recipient";

// Import domain describe arrays
import { agencyEndpoints } from "../src/domains/agency";
import { autocompleteEndpoints } from "../src/domains/autocomplete";
import { awardsEndpoints } from "../src/domains/awards";
import { disasterEndpoints } from "../src/domains/disaster";
import { federalAccountsEndpoints } from "../src/domains/federal-accounts";
import { idvEndpoints } from "../src/domains/idv";
import { recipientEndpoints } from "../src/domains/recipient";
import { referencesEndpoints } from "../src/domains/references";
import { reportingEndpoints } from "../src/domains/reporting";
import { searchEndpoints } from "../src/domains/search";
import { spendingEndpoints } from "../src/domains/spending";
import { financialEndpoints } from "../src/domains/financial";
import { subawardEndpoints } from "../src/domains/subawards";
import { budgetFunctionsEndpoints } from "../src/domains/budget-functions";
import { downloadsEndpoints } from "../src/domains/downloads";

describe("domain aggregation", () => {
  describe("re-exported schemas match domain schemas", () => {
    it("AgencyOverviewSchema is the same object", () => {
      expect(AgencyOverviewSchema).toBe(DomainAgencySchema);
    });

    it("AwardDetailSchema is the same object", () => {
      expect(AwardDetailSchema).toBe(DomainAwardSchema);
    });

    it("AwardSearchResponseSchema is the same object", () => {
      expect(AwardSearchResponseSchema).toBe(DomainSearchSchema);
    });

    it("SpendingByAgencyResponseSchema is the same object", () => {
      expect(SpendingByAgencyResponseSchema).toBe(DomainSpendingSchema);
    });

    it("SpendingByStateResponseSchema is the same object", () => {
      expect(SpendingByStateResponseSchema).toBe(DomainRecipientSchema);
    });
  });

  describe("all re-exported schemas are defined", () => {
    it("all response schemas exist", () => {
      expect(AwardSearchResponseSchema).toBeDefined();
      expect(AwardDetailSchema).toBeDefined();
      expect(AgencyOverviewSchema).toBeDefined();
      expect(SpendingByAgencyResponseSchema).toBeDefined();
      expect(SpendingByStateResponseSchema).toBeDefined();
      expect(SpendingOverTimeResponseSchema).toBeDefined();
    });

    it("all param schemas exist", () => {
      expect(AwardSearchParamsSchema).toBeDefined();
      expect(SpendingByAgencyParamsSchema).toBeDefined();
      expect(SpendingOverTimeParamsSchema).toBeDefined();
    });

    it("shared schemas exist", () => {
      expect(AwardSearchFiltersSchema).toBeDefined();
      expect(AwardTypeCodes).toBeDefined();
      expect(PageMetadataSchema).toBeDefined();
    });
  });

  describe("describe() aggregates all domain endpoints", () => {
    it("total endpoint count is sum of domains", () => {
      const { endpoints } = describeEndpoints();
      const domainTotal =
        agencyEndpoints.length +
        autocompleteEndpoints.length +
        awardsEndpoints.length +
        disasterEndpoints.length +
        federalAccountsEndpoints.length +
        idvEndpoints.length +
        recipientEndpoints.length +
        referencesEndpoints.length +
        reportingEndpoints.length +
        searchEndpoints.length +
        spendingEndpoints.length +
        financialEndpoints.length +
        subawardEndpoints.length +
        budgetFunctionsEndpoints.length +
        downloadsEndpoints.length;
      expect(endpoints.length).toBe(domainTotal);
    });

    it("every described endpoint exists in plugin", () => {
      const { endpoints } = describeEndpoints();
      for (const ep of endpoints) {
        expect(typeof usaspendingPlugin.endpoints[ep.name]).toBe("function");
      }
    });

    it("every plugin endpoint has describe metadata", () => {
      const { endpoints } = describeEndpoints();
      const names = new Set(endpoints.map((e) => e.name));
      for (const name of Object.keys(usaspendingPlugin.endpoints)) {
        expect(names.has(name)).toBe(true);
      }
    });

    it("contains expected endpoint names", () => {
      const { endpoints } = describeEndpoints();
      const names = endpoints.map((e) => e.name);
      expect(names).toContain("awards");
      expect(names).toContain("award");
      expect(names).toContain("agency");
      expect(names).toContain("spending_by_agency");
      expect(names).toContain("spending_by_state");
      expect(names).toContain("spending_over_time");
    });
  });

  describe("response formatting via domains", () => {
    it("all domain fixtures produce valid formatting output", async () => {
      const originalFetch = globalThis.fetch;
      const domainFixtures = [
        { fixture: "search/spending-by-award.json", fn: () => import("../src/domains/search").then(m => m._searchAwards()) },
        { fixture: "awards/detail-contract.json", fn: () => import("../src/domains/awards").then(m => m._findAward("test")) },
        { fixture: "agency/overview.json", fn: () => import("../src/domains/agency").then(m => m._agencyOverview("080")) },
        { fixture: "spending/by-agency.json", fn: () => import("../src/domains/spending").then(m => m._spendingByAgency({ type: "agency", filters: { fy: "2024", period: "12" } })) },
        { fixture: "recipient/state-list.json", fn: () => import("../src/domains/recipient").then(m => m._spendingByState()) },
        { fixture: "search/spending-over-time-fy.json", fn: () => import("../src/domains/search").then(m => m._spendingOverTime({ group: "fiscal_year", filters: {} })) },
      ];

      for (const { fixture, fn } of domainFixtures) {
        globalThis.fetch = (async () => {
          const data = await Bun.file(`${import.meta.dir}/../fixtures/${fixture}`).json();
          return new Response(JSON.stringify(data), { status: 200 });
        }) as unknown as typeof fetch;

        const result = await fn();
        expect(() => result.toMarkdown()).not.toThrow();
        expect(() => result.toCSV()).not.toThrow();
        expect(() => result.summary()).not.toThrow();
      }

      globalThis.fetch = originalFetch;
    });
  });
});
