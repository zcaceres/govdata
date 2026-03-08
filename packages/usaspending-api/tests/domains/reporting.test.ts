import { describe, it, expect, afterEach } from "bun:test";
import {
  _reportingAgenciesOverview,
  _reportingPublishDates,
  _reportingDifferences,
  _reportingDiscrepancies,
  _reportingAgencyOverview,
  _reportingSubmissionHistory,
  _reportingUnlinkedAssistance,
  _reportingUnlinkedProcurement,
  ReportingAgencyOverviewResponseSchema,
  ReportingPublishDatesResponseSchema,
  ReportingDifferencesResponseSchema,
  ReportingDiscrepanciesResponseSchema,
  ReportingSingleAgencyResponseSchema,
  SubmissionHistoryResponseSchema,
  UnlinkedAwardsSchema,
  reportingEndpoints,
} from "../../src/domains/reporting";
import type { ReportingKindMap } from "../../src/domains/reporting";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function mockFetch(fixture: string) {
  globalThis.fetch = (async () => {
    const data = await Bun.file(`${import.meta.dir}/../../fixtures/reporting/${fixture}`).json();
    return new Response(JSON.stringify(data), { status: 200 });
  }) as unknown as typeof fetch;
}

function mockFetchCapture(fixture: string) {
  let captured: { url: string; init?: RequestInit } | undefined;
  globalThis.fetch = (async (url: string, init?: RequestInit) => {
    captured = { url, init };
    const data = await Bun.file(`${import.meta.dir}/../../fixtures/reporting/${fixture}`).json();
    return new Response(JSON.stringify(data), { status: 200 });
  }) as unknown as typeof fetch;
  return () => captured;
}

describe("reporting domain", () => {
  describe("_reportingAgenciesOverview", () => {
    it("returns paginated agencies overview", async () => {
      mockFetch("agencies-overview.json");
      const result = await _reportingAgenciesOverview();
      expect(result.kind).toBe("reporting_agencies_overview");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.meta).not.toBeNull();
    });

    it("items have agency_name, toptier_code, budget authority", async () => {
      mockFetch("agencies-overview.json");
      const result = await _reportingAgenciesOverview();
      const item = result.data[0];
      expect(item.agency_name).toBeDefined();
      expect(item.toptier_code).toBeDefined();
      expect(typeof item.current_total_budget_authority_amount).toBe("number");
    });

    it("uses GET request to correct URL", async () => {
      const getCapture = mockFetchCapture("agencies-overview.json");
      await _reportingAgenciesOverview();
      const captured = getCapture();
      expect(captured!.init).toBeUndefined();
      expect(captured!.url).toContain("/api/v2/reporting/agencies/overview/");
    });
  });

  describe("_reportingPublishDates", () => {
    it("returns paginated publish dates", async () => {
      mockFetch("agencies-publish-dates.json");
      const result = await _reportingPublishDates();
      expect(result.kind).toBe("reporting_publish_dates");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.meta).not.toBeNull();
    });

    it("items have agency_name, toptier_code, periods", async () => {
      mockFetch("agencies-publish-dates.json");
      const result = await _reportingPublishDates();
      const item = result.data[0];
      expect(item.agency_name).toBeDefined();
      expect(item.toptier_code).toBeDefined();
      expect(item.periods).toBeInstanceOf(Array);
    });

    it("uses GET request to correct URL", async () => {
      const getCapture = mockFetchCapture("agencies-publish-dates.json");
      await _reportingPublishDates();
      const captured = getCapture();
      expect(captured!.init).toBeUndefined();
      expect(captured!.url).toContain("/api/v2/reporting/agencies/publish_dates/");
    });
  });

  describe("_reportingDifferences", () => {
    it("returns paginated differences (may be empty)", async () => {
      mockFetch("agency-differences.json");
      const result = await _reportingDifferences("020", 2024, 6);
      expect(result.kind).toBe("reporting_differences");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.meta).not.toBeNull();
    });

    it("includes toptier_code, fiscal_year, fiscal_period in URL", async () => {
      const getCapture = mockFetchCapture("agency-differences.json");
      await _reportingDifferences("020", 2024, 6);
      const captured = getCapture();
      expect(captured!.init).toBeUndefined();
      expect(captured!.url).toContain("/api/v2/reporting/agencies/020/2024/6/differences/");
    });
  });

  describe("_reportingDiscrepancies", () => {
    it("returns paginated discrepancies (may be empty)", async () => {
      mockFetch("agency-discrepancies.json");
      const result = await _reportingDiscrepancies("020", 2024, 6);
      expect(result.kind).toBe("reporting_discrepancies");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.meta).not.toBeNull();
    });

    it("includes toptier_code, fiscal_year, fiscal_period in URL", async () => {
      const getCapture = mockFetchCapture("agency-discrepancies.json");
      await _reportingDiscrepancies("080", 2025, 11);
      const captured = getCapture();
      expect(captured!.init).toBeUndefined();
      expect(captured!.url).toContain("/api/v2/reporting/agencies/080/2025/11/discrepancies/");
    });
  });

  describe("_reportingAgencyOverview", () => {
    it("returns paginated single agency overview", async () => {
      mockFetch("agency-overview.json");
      const result = await _reportingAgencyOverview("080");
      expect(result.kind).toBe("reporting_agency_overview");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.meta).not.toBeNull();
    });

    it("items have fiscal_year, fiscal_period, budget authority", async () => {
      mockFetch("agency-overview.json");
      const result = await _reportingAgencyOverview("080");
      const item = result.data[0];
      expect(typeof item.fiscal_year).toBe("number");
      expect(typeof item.fiscal_period).toBe("number");
      expect(typeof item.current_total_budget_authority_amount).toBe("number");
    });

    it("includes toptier_code in URL", async () => {
      const getCapture = mockFetchCapture("agency-overview.json");
      await _reportingAgencyOverview("080");
      const captured = getCapture();
      expect(captured!.init).toBeUndefined();
      expect(captured!.url).toContain("/api/v2/reporting/agencies/080/overview/");
    });
  });

  describe("_reportingSubmissionHistory", () => {
    it("returns paginated submission history", async () => {
      mockFetch("submission-history.json");
      const result = await _reportingSubmissionHistory("020", 2024, 6);
      expect(result.kind).toBe("reporting_submission_history");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.meta).not.toBeNull();
    });

    it("items have publication_date", async () => {
      mockFetch("submission-history.json");
      const result = await _reportingSubmissionHistory("020", 2024, 6);
      const item = result.data[0];
      expect(item.publication_date).toBeDefined();
    });

    it("includes toptier_code, fiscal_year, fiscal_period in URL", async () => {
      const getCapture = mockFetchCapture("submission-history.json");
      await _reportingSubmissionHistory("020", 2024, 6);
      const captured = getCapture();
      expect(captured!.init).toBeUndefined();
      expect(captured!.url).toContain("/api/v2/reporting/agencies/020/2024/6/submission_history/");
    });
  });

  describe("_reportingUnlinkedAssistance", () => {
    it("returns unlinked assistance counts", async () => {
      mockFetch("unlinked-awards-assistance.json");
      const result = await _reportingUnlinkedAssistance("020", 2024, 6);
      expect(result.kind).toBe("reporting_unlinked_assistance");
      expect(typeof result.data.total_linked_award_count).toBe("number");
      expect(result.meta).toBeNull();
    });

    it("includes toptier_code, fiscal_year, fiscal_period in URL", async () => {
      const getCapture = mockFetchCapture("unlinked-awards-assistance.json");
      await _reportingUnlinkedAssistance("020", 2024, 6);
      const captured = getCapture();
      expect(captured!.init).toBeUndefined();
      expect(captured!.url).toContain("/api/v2/reporting/agencies/020/2024/6/unlinked_awards/assistance/");
    });
  });

  describe("_reportingUnlinkedProcurement", () => {
    it("returns unlinked procurement counts", async () => {
      mockFetch("unlinked-awards-procurement.json");
      const result = await _reportingUnlinkedProcurement("080", 2025, 11);
      expect(result.kind).toBe("reporting_unlinked_procurement");
      expect(typeof result.data.unlinked_file_c_award_count).toBe("number");
      expect(typeof result.data.unlinked_file_d_award_count).toBe("number");
      expect(typeof result.data.total_linked_award_count).toBe("number");
      expect(result.meta).toBeNull();
    });

    it("includes toptier_code, fiscal_year, fiscal_period in URL", async () => {
      const getCapture = mockFetchCapture("unlinked-awards-procurement.json");
      await _reportingUnlinkedProcurement("080", 2025, 11);
      const captured = getCapture();
      expect(captured!.init).toBeUndefined();
      expect(captured!.url).toContain("/api/v2/reporting/agencies/080/2025/11/unlinked_awards/procurement/");
    });
  });

  describe("schema parsing", () => {
    it("ReportingAgencyOverviewResponseSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/reporting/agencies-overview.json`).json();
      const result = ReportingAgencyOverviewResponseSchema.parse(data);
      expect(result.results.length).toBeGreaterThan(0);
      expect(result.page_metadata).toBeDefined();
      expect(result.results[0].agency_name).toBe("Department of the Treasury");
      expect(result.results[0].toptier_code).toBe("020");
    });

    it("ReportingPublishDatesResponseSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/reporting/agencies-publish-dates.json`).json();
      const result = ReportingPublishDatesResponseSchema.parse(data);
      expect(result.results.length).toBeGreaterThan(0);
      expect(result.page_metadata).toBeDefined();
      expect(result.results[0].periods).toBeInstanceOf(Array);
    });

    it("ReportingDifferencesResponseSchema parses fixture (empty results)", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/reporting/agency-differences.json`).json();
      const result = ReportingDifferencesResponseSchema.parse(data);
      expect(result.results).toBeInstanceOf(Array);
      expect(result.results.length).toBe(0);
      expect(result.page_metadata).toBeDefined();
    });

    it("ReportingDiscrepanciesResponseSchema parses fixture (empty results)", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/reporting/agency-discrepancies.json`).json();
      const result = ReportingDiscrepanciesResponseSchema.parse(data);
      expect(result.results).toBeInstanceOf(Array);
      expect(result.results.length).toBe(0);
      expect(result.page_metadata).toBeDefined();
    });

    it("ReportingSingleAgencyResponseSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/reporting/agency-overview.json`).json();
      const result = ReportingSingleAgencyResponseSchema.parse(data);
      expect(result.results.length).toBeGreaterThan(0);
      expect(result.page_metadata).toBeDefined();
      expect(typeof result.results[0].fiscal_year).toBe("number");
    });

    it("SubmissionHistoryResponseSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/reporting/submission-history.json`).json();
      const result = SubmissionHistoryResponseSchema.parse(data);
      expect(result.results.length).toBeGreaterThan(0);
      expect(result.results[0].publication_date).toBeDefined();
    });

    it("UnlinkedAwardsSchema parses assistance fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/reporting/unlinked-awards-assistance.json`).json();
      const result = UnlinkedAwardsSchema.parse(data);
      expect(typeof result.total_linked_award_count).toBe("number");
    });

    it("UnlinkedAwardsSchema parses procurement fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/reporting/unlinked-awards-procurement.json`).json();
      const result = UnlinkedAwardsSchema.parse(data);
      expect(typeof result.unlinked_file_c_award_count).toBe("number");
      expect(typeof result.unlinked_file_d_award_count).toBe("number");
      expect(typeof result.total_linked_award_count).toBe("number");
    });
  });

  describe("reportingEndpoints describe metadata", () => {
    it("has 8 endpoints", () => {
      expect(reportingEndpoints.length).toBe(8);
    });

    it("reporting_agencies_overview has no required params", () => {
      const ep = reportingEndpoints.find(e => e.name === "reporting_agencies_overview");
      expect(ep).toBeDefined();
      const required = ep!.params.filter(p => p.required);
      expect(required.length).toBe(0);
    });

    it("reporting_differences requires toptier_code, fiscal_year, fiscal_period", () => {
      const ep = reportingEndpoints.find(e => e.name === "reporting_differences");
      expect(ep).toBeDefined();
      const required = ep!.params.filter(p => p.required);
      expect(required.length).toBe(3);
      const requiredNames = required.map(p => p.name).sort();
      expect(requiredNames).toEqual(["fiscal_period", "fiscal_year", "toptier_code"]);
    });

    it("reporting_agency_overview requires toptier_code", () => {
      const ep = reportingEndpoints.find(e => e.name === "reporting_agency_overview");
      expect(ep).toBeDefined();
      const required = ep!.params.filter(p => p.required);
      expect(required.length).toBe(1);
      expect(required[0].name).toBe("toptier_code");
    });

    it("unlinked endpoints require toptier_code, fiscal_year, fiscal_period and have no optional params", () => {
      for (const name of ["reporting_unlinked_assistance", "reporting_unlinked_procurement"]) {
        const ep = reportingEndpoints.find(e => e.name === name);
        expect(ep).toBeDefined();
        expect(ep!.params.length).toBe(3);
        const required = ep!.params.filter(p => p.required);
        expect(required.length).toBe(3);
      }
    });

    it("all endpoints have descriptions and response fields", () => {
      for (const ep of reportingEndpoints) {
        expect(ep.description.length).toBeGreaterThan(0);
        expect(ep.responseFields.length).toBeGreaterThan(0);
      }
    });
  });

  describe("ReportingKindMap type", () => {
    it("kind map resolves correctly", () => {
      const map: ReportingKindMap = {
        reporting_agencies_overview: [],
        reporting_publish_dates: [],
        reporting_differences: [],
        reporting_discrepancies: [],
        reporting_agency_overview: [],
        reporting_submission_history: [],
        reporting_unlinked_assistance: { unlinked_file_c_award_count: 0, unlinked_file_d_award_count: 0, total_linked_award_count: 0 },
        reporting_unlinked_procurement: { unlinked_file_c_award_count: 0, unlinked_file_d_award_count: 0, total_linked_award_count: 0 },
      };
      expect(map.reporting_agencies_overview).toBeInstanceOf(Array);
      expect(map.reporting_publish_dates).toBeInstanceOf(Array);
      expect(map.reporting_differences).toBeInstanceOf(Array);
      expect(map.reporting_discrepancies).toBeInstanceOf(Array);
      expect(map.reporting_agency_overview).toBeInstanceOf(Array);
      expect(map.reporting_submission_history).toBeInstanceOf(Array);
      expect(typeof map.reporting_unlinked_assistance.total_linked_award_count).toBe("number");
      expect(typeof map.reporting_unlinked_procurement.total_linked_award_count).toBe("number");
    });
  });
});
