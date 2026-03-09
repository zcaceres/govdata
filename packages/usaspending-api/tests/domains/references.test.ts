import { describe, it, expect, afterEach } from "bun:test";
import {
  _refToptierAgencies,
  _refAgency,
  _refAwardTypes,
  _refGlossary,
  _refDefCodes,
  _refNaics,
  _refDataDictionary,
  _refFilterHash,
  _refFilterTreePsc,
  _refFilterTreeTas,
  _refSubmissionPeriods,
  _refTotalBudgetaryResources,
  _refAssistanceListing,
  _refCfdaTotals,
  referencesEndpoints,
} from "../../src/domains/references";
import type { ReferencesKindMap } from "../../src/domains/references";
import {
  ToptierAgenciesResponseSchema,
  ToptierAgencyResultSchema,
  AgencyReferenceResponseSchema,
  AwardTypesResponseSchema,
  GlossaryResponseSchema,
  GlossaryResultSchema,
  DefCodesResponseSchema,
  DefCodeSchema,
  NaicsRefResponseSchema,
  NaicsRefResultSchema,
  DataDictionaryResponseSchema,
  FilterHashResponseSchema,
  FilterTreeResponseSchema,
  FilterTreeResultSchema,
  SubmissionPeriodsResponseSchema,
  SubmissionPeriodSchema,
  TotalBudgetaryResourcesResponseSchema,
  TotalBudgetaryResourceResultSchema,
  AssistanceListingResultSchema,
} from "../../src/domains/references/schemas";

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

describe("references domain", () => {
  // --- Endpoint function tests ---

  describe("_refToptierAgencies", () => {
    it("returns top-tier agencies list", async () => {
      mockFetch("references/toptier-agencies.json");
      const result = await _refToptierAgencies();
      expect(result.kind).toBe("ref_toptier_agencies");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0]).toHaveProperty("agency_id");
      expect(result.data[0]).toHaveProperty("agency_name");
      expect(result.data[0]).toHaveProperty("toptier_code");
      expect(result.meta).toBeNull();
    });

    it("passes sort and order params", async () => {
      const getCapture = mockFetchCapture("references/toptier-agencies.json");
      await _refToptierAgencies({ sort: "budget_authority_amount", order: "desc" });
      const url = getCapture()!.url;
      expect(url).toContain("/api/v2/references/toptier_agencies/");
      expect(url).toContain("sort=budget_authority_amount");
      expect(url).toContain("order=desc");
    });
  });

  describe("_refAgency", () => {
    it("returns agency reference data", async () => {
      mockFetch("references/agency.json");
      const result = await _refAgency(80);
      expect(result.kind).toBe("ref_agency");
      expect(result.data).toBeDefined();
      expect(result.meta).toBeNull();
    });

    it("passes agency_id in URL path", async () => {
      const getCapture = mockFetchCapture("references/agency.json");
      await _refAgency(80);
      expect(getCapture()!.url).toContain("/api/v2/references/agency/80/");
    });
  });

  describe("_refAwardTypes", () => {
    it("returns award type mappings", async () => {
      mockFetch("references/award-types.json");
      const result = await _refAwardTypes();
      expect(result.kind).toBe("ref_award_types");
      expect(result.data).toHaveProperty("contracts");
      expect(result.data).toHaveProperty("grants");
      expect(result.data).toHaveProperty("loans");
      expect(result.data).toHaveProperty("idvs");
      expect(result.meta).toBeNull();
    });

    it("hits correct URL path", async () => {
      const getCapture = mockFetchCapture("references/award-types.json");
      await _refAwardTypes();
      expect(getCapture()!.url).toContain("/api/v2/references/award_types/");
    });
  });

  describe("_refGlossary", () => {
    it("returns glossary terms with pagination", async () => {
      mockFetch("references/glossary.json");
      const result = await _refGlossary({ page: 1, limit: 10 });
      expect(result.kind).toBe("ref_glossary");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0]).toHaveProperty("term");
      expect(result.data[0]).toHaveProperty("slug");
      expect(result.meta).toBeDefined();
      expect(result.meta!.total_results).toBe(149);
    });

    it("passes page and limit params", async () => {
      const getCapture = mockFetchCapture("references/glossary.json");
      await _refGlossary({ page: 2, limit: 25 });
      const url = getCapture()!.url;
      expect(url).toContain("page=2");
      expect(url).toContain("limit=25");
    });
  });

  describe("_refDefCodes", () => {
    it("returns DEF codes array", async () => {
      mockFetch("references/def-codes.json");
      const result = await _refDefCodes();
      expect(result.kind).toBe("ref_def_codes");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0]).toHaveProperty("code");
      expect(result.data[0]).toHaveProperty("public_law");
      expect(result.data[0]).toHaveProperty("title");
      expect(result.meta).toBeNull();
    });

    it("hits correct URL path", async () => {
      const getCapture = mockFetchCapture("references/def-codes.json");
      await _refDefCodes();
      expect(getCapture()!.url).toContain("/api/v2/references/def_codes/");
    });
  });

  describe("_refNaics", () => {
    it("returns NAICS codes list", async () => {
      mockFetch("references/naics.json");
      const result = await _refNaics();
      expect(result.kind).toBe("ref_naics");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0]).toHaveProperty("naics");
      expect(result.data[0]).toHaveProperty("naics_description");
      expect(result.meta).toBeNull();
    });

    it("filters by code in URL path", async () => {
      const getCapture = mockFetchCapture("references/naics-detail.json");
      await _refNaics({ code: "54" });
      expect(getCapture()!.url).toContain("/api/v2/references/naics/54/");
    });

    it("returns results when filtered by code", async () => {
      mockFetch("references/naics-detail.json");
      const result = await _refNaics({ code: "54" });
      expect(result.kind).toBe("ref_naics");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data[0].naics).toBe("11");
    });
  });

  describe("_refDataDictionary", () => {
    it("returns data dictionary document", async () => {
      mockFetch("references/data-dictionary.json");
      const result = await _refDataDictionary();
      expect(result.kind).toBe("ref_data_dictionary");
      expect(result.data).toHaveProperty("rows");
      expect(result.data.rows).toBeInstanceOf(Array);
      expect(result.data.rows.length).toBeGreaterThan(0);
      expect(result.meta).toBeNull();
    });

    it("hits correct URL path", async () => {
      const getCapture = mockFetchCapture("references/data-dictionary.json");
      await _refDataDictionary();
      expect(getCapture()!.url).toContain("/api/v2/references/data_dictionary/");
    });
  });

  describe("_refFilterHash", () => {
    it("returns filter hash", async () => {
      mockFetch("references/filter-hash.json");
      const result = await _refFilterHash({ keywords: ["NASA"] });
      expect(result.kind).toBe("ref_filter_hash");
      expect(result.data).toHaveProperty("hash");
      expect(typeof result.data.hash).toBe("string");
      expect(result.meta).toBeNull();
    });

    it("sends POST request with filters in body", async () => {
      const getCapture = mockFetchCapture("references/filter-hash.json");
      await _refFilterHash({ keywords: ["NASA"] });
      const captured = getCapture()!;
      expect(captured.url).toContain("/api/v2/references/filter/");
      expect(captured.init?.method).toBe("POST");
      const body = JSON.parse(captured.init?.body as string);
      expect(body.filters).toEqual({ keywords: ["NASA"] });
    });
  });

  describe("_refFilterTreePsc", () => {
    it("returns PSC filter tree", async () => {
      mockFetch("references/filter-tree-psc.json");
      const result = await _refFilterTreePsc({ depth: 1 });
      expect(result.kind).toBe("ref_filter_tree_psc");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0]).toHaveProperty("id");
      expect(result.data[0]).toHaveProperty("description");
      expect(result.data[0]).toHaveProperty("count");
      expect(result.meta).toBeNull();
    });

    it("passes depth and filter params", async () => {
      const getCapture = mockFetchCapture("references/filter-tree-psc.json");
      await _refFilterTreePsc({ depth: 2, filter: "Product" });
      const url = getCapture()!.url;
      expect(url).toContain("/api/v2/references/filter_tree/psc/");
      expect(url).toContain("depth=2");
      expect(url).toContain("filter=Product");
    });

    it("returns group-level results with ancestors", async () => {
      mockFetch("references/filter-tree-psc-group.json");
      const result = await _refFilterTreePsc({ depth: 2 });
      expect(result.data[0].ancestors).toBeInstanceOf(Array);
      expect(result.data[0].ancestors!.length).toBeGreaterThan(0);
    });
  });

  describe("_refFilterTreeTas", () => {
    it("returns TAS filter tree", async () => {
      mockFetch("references/filter-tree-tas.json");
      const result = await _refFilterTreeTas({ depth: 1 });
      expect(result.kind).toBe("ref_filter_tree_tas");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0]).toHaveProperty("id");
      expect(result.data[0]).toHaveProperty("description");
      expect(result.meta).toBeNull();
    });

    it("passes depth param", async () => {
      const getCapture = mockFetchCapture("references/filter-tree-tas.json");
      await _refFilterTreeTas({ depth: 1 });
      const url = getCapture()!.url;
      expect(url).toContain("/api/v2/references/filter_tree/tas/");
      expect(url).toContain("depth=1");
    });

    it("returns agency-level results with ancestors", async () => {
      mockFetch("references/filter-tree-tas-agency.json");
      const result = await _refFilterTreeTas({ depth: 2 });
      expect(result.data[0].ancestors).toBeInstanceOf(Array);
      expect(result.data[0].ancestors!.length).toBeGreaterThan(0);
    });
  });

  describe("_refSubmissionPeriods", () => {
    it("returns submission periods array", async () => {
      mockFetch("references/submission-periods.json");
      const result = await _refSubmissionPeriods();
      expect(result.kind).toBe("ref_submission_periods");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0]).toHaveProperty("submission_fiscal_year");
      expect(result.data[0]).toHaveProperty("submission_fiscal_quarter");
      expect(result.data[0]).toHaveProperty("period_start_date");
      expect(result.data[0]).toHaveProperty("period_end_date");
      expect(result.meta).toBeNull();
    });

    it("hits correct URL path", async () => {
      const getCapture = mockFetchCapture("references/submission-periods.json");
      await _refSubmissionPeriods();
      expect(getCapture()!.url).toContain("/api/v2/references/submission_periods/");
    });
  });

  describe("_refTotalBudgetaryResources", () => {
    it("returns total budgetary resources", async () => {
      mockFetch("references/total-budgetary-resources.json");
      const result = await _refTotalBudgetaryResources();
      expect(result.kind).toBe("ref_total_budgetary_resources");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0]).toHaveProperty("fiscal_year");
      expect(result.data[0]).toHaveProperty("fiscal_period");
      expect(result.data[0]).toHaveProperty("total_budgetary_resources");
      expect(result.meta).toBeNull();
    });

    it("hits correct URL path", async () => {
      const getCapture = mockFetchCapture("references/total-budgetary-resources.json");
      await _refTotalBudgetaryResources();
      expect(getCapture()!.url).toContain("/api/v2/references/total_budgetary_resources/");
    });
  });

  describe("_refAssistanceListing", () => {
    it("returns assistance listing array", async () => {
      mockFetch("references/assistance-listing.json");
      const result = await _refAssistanceListing();
      expect(result.kind).toBe("ref_assistance_listing");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0]).toHaveProperty("code");
      expect(result.meta).toBeNull();
    });

    it("hits correct URL path", async () => {
      const getCapture = mockFetchCapture("references/assistance-listing.json");
      await _refAssistanceListing();
      expect(getCapture()!.url).toContain("/api/v2/references/assistance_listing/");
    });
  });

  describe("_refCfdaTotals", () => {
    it("returns CFDA totals", async () => {
      mockFetch("references/cfda-totals.json");
      const result = await _refCfdaTotals();
      expect(result.kind).toBe("ref_cfda_totals");
      expect(result.data).toBeDefined();
      expect(result.meta).toBeNull();
    });

    it("passes cfda param", async () => {
      const getCapture = mockFetchCapture("references/cfda-totals-single.json");
      await _refCfdaTotals({ cfda: "10.001" });
      const url = getCapture()!.url;
      expect(url).toContain("/api/v2/references/cfda/totals/");
      expect(url).toContain("cfda=10.001");
    });

    it("handles null response", async () => {
      mockFetch("references/cfda-totals-single.json");
      const result = await _refCfdaTotals({ cfda: "10.001" });
      expect(result.kind).toBe("ref_cfda_totals");
    });
  });

  // --- Schema parsing tests ---

  describe("schema parsing", () => {
    it("ToptierAgenciesResponseSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/references/toptier-agencies.json`).json();
      const result = ToptierAgenciesResponseSchema.parse(data);
      expect(result.results).toBeInstanceOf(Array);
      expect(result.results.length).toBeGreaterThan(0);
      expect(result.results[0].agency_id).toBeGreaterThan(0);
      expect(typeof result.results[0].agency_name).toBe("string");
    });

    it("ToptierAgencyResultSchema parses individual result", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/references/toptier-agencies.json`).json();
      const result = ToptierAgencyResultSchema.parse(data.results[0]);
      expect(result.agency_id).toBeGreaterThan(0);
      expect(typeof result.toptier_code).toBe("string");
    });

    it("AgencyReferenceResponseSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/references/agency.json`).json();
      const result = AgencyReferenceResponseSchema.parse(data);
      expect(result.results).toBeDefined();
    });

    it("AwardTypesResponseSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/references/award-types.json`).json();
      const result = AwardTypesResponseSchema.parse(data);
      expect(result.contracts).toBeDefined();
      expect(result.grants).toBeDefined();
      expect(result.loans).toBeDefined();
      expect(result.contracts!["A"]).toBe("BPA Call");
    });

    it("GlossaryResponseSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/references/glossary.json`).json();
      const result = GlossaryResponseSchema.parse(data);
      expect(result.results).toBeInstanceOf(Array);
      expect(result.page_metadata.page).toBe(1);
      expect(result.page_metadata.count).toBe(149);
      expect(result.page_metadata.hasNext).toBe(true);
    });

    it("GlossaryResultSchema parses individual result", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/references/glossary.json`).json();
      const result = GlossaryResultSchema.parse(data.results[0]);
      expect(typeof result.term).toBe("string");
      expect(typeof result.slug).toBe("string");
    });

    it("DefCodesResponseSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/references/def-codes.json`).json();
      const result = DefCodesResponseSchema.parse(data);
      expect(result.codes).toBeInstanceOf(Array);
      expect(result.codes.length).toBeGreaterThan(0);
    });

    it("DefCodeSchema parses individual code", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/references/def-codes.json`).json();
      const result = DefCodeSchema.parse(data.codes[0]);
      expect(typeof result.code).toBe("string");
      expect(typeof result.public_law).toBe("string");
      expect(typeof result.title).toBe("string");
    });

    it("NaicsRefResponseSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/references/naics.json`).json();
      const result = NaicsRefResponseSchema.parse(data);
      expect(result.results).toBeInstanceOf(Array);
      expect(result.results.length).toBeGreaterThan(0);
    });

    it("NaicsRefResultSchema parses individual result", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/references/naics.json`).json();
      const result = NaicsRefResultSchema.parse(data.results[0]);
      expect(typeof result.naics).toBe("string");
      expect(typeof result.naics_description).toBe("string");
    });

    it("NaicsRefResponseSchema parses detail fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/references/naics-detail.json`).json();
      const result = NaicsRefResponseSchema.parse(data);
      expect(result.results).toBeInstanceOf(Array);
      expect(result.results.length).toBeGreaterThan(0);
      expect(result.results[0].naics).toBe("11");
    });

    it("DataDictionaryResponseSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/references/data-dictionary.json`).json();
      const result = DataDictionaryResponseSchema.parse(data);
      expect(result.document).toBeDefined();
      expect(result.document.rows).toBeInstanceOf(Array);
      expect(result.document.rows.length).toBeGreaterThan(0);
    });

    it("FilterHashResponseSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/references/filter-hash.json`).json();
      const result = FilterHashResponseSchema.parse(data);
      expect(typeof result.hash).toBe("string");
      expect(result.hash).toBe("de81d96814661f3f8eb66520465e94fd");
    });

    it("FilterTreeResponseSchema parses PSC fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/references/filter-tree-psc.json`).json();
      const result = FilterTreeResponseSchema.parse(data);
      expect(result.results).toBeInstanceOf(Array);
      expect(result.results.length).toBe(3);
    });

    it("FilterTreeResultSchema parses individual PSC result", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/references/filter-tree-psc.json`).json();
      const result = FilterTreeResultSchema.parse(data.results[0]);
      expect(typeof result.id).toBe("string");
      expect(result.ancestors).toBeInstanceOf(Array);
    });

    it("FilterTreeResponseSchema parses PSC group fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/references/filter-tree-psc-group.json`).json();
      const result = FilterTreeResponseSchema.parse(data);
      expect(result.results).toBeInstanceOf(Array);
      expect(result.results[0].ancestors!.length).toBeGreaterThan(0);
    });

    it("FilterTreeResponseSchema parses TAS fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/references/filter-tree-tas.json`).json();
      const result = FilterTreeResponseSchema.parse(data);
      expect(result.results).toBeInstanceOf(Array);
      expect(result.results.length).toBeGreaterThan(0);
    });

    it("FilterTreeResponseSchema parses TAS agency fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/references/filter-tree-tas-agency.json`).json();
      const result = FilterTreeResponseSchema.parse(data);
      expect(result.results).toBeInstanceOf(Array);
      expect(result.results[0].ancestors!.length).toBeGreaterThan(0);
    });

    it("SubmissionPeriodsResponseSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/references/submission-periods.json`).json();
      const result = SubmissionPeriodsResponseSchema.parse(data);
      expect(result.available_periods).toBeInstanceOf(Array);
      expect(result.available_periods.length).toBeGreaterThan(0);
    });

    it("SubmissionPeriodSchema parses individual period", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/references/submission-periods.json`).json();
      const result = SubmissionPeriodSchema.parse(data.available_periods[0]);
      expect(typeof result.submission_fiscal_year).toBe("number");
      expect(typeof result.submission_fiscal_quarter).toBe("number");
      expect(typeof result.period_start_date).toBe("string");
      expect(typeof result.is_quarter).toBe("boolean");
    });

    it("TotalBudgetaryResourcesResponseSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/references/total-budgetary-resources.json`).json();
      const result = TotalBudgetaryResourcesResponseSchema.parse(data);
      expect(result.results).toBeInstanceOf(Array);
      expect(result.results.length).toBeGreaterThan(0);
    });

    it("TotalBudgetaryResourceResultSchema parses individual result", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/references/total-budgetary-resources.json`).json();
      const result = TotalBudgetaryResourceResultSchema.parse(data.results[0]);
      expect(typeof result.fiscal_year).toBe("number");
      expect(typeof result.fiscal_period).toBe("number");
      expect(typeof result.total_budgetary_resources).toBe("number");
    });

    it("AssistanceListingResultSchema parses fixture entry", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/references/assistance-listing.json`).json();
      const result = AssistanceListingResultSchema.parse(data[0]);
      expect(result).toHaveProperty("code");
      expect(result).toHaveProperty("count");
    });
  });

  // --- Describe metadata ---

  describe("referencesEndpoints describe metadata", () => {
    it("has 14 references endpoints", () => {
      expect(referencesEndpoints.length).toBe(14);
    });

    it("ref_agency endpoint requires agency_id param", () => {
      const ep = referencesEndpoints.find((e) => e.name === "ref_agency");
      expect(ep).toBeDefined();
      expect(ep!.params.find((p) => p.name === "agency_id")?.required).toBe(true);
    });

    it("ref_toptier_agencies has no required params", () => {
      const ep = referencesEndpoints.find((e) => e.name === "ref_toptier_agencies");
      expect(ep).toBeDefined();
      expect(ep!.params.every((p) => !p.required)).toBe(true);
    });

    it("ref_award_types has no params", () => {
      const ep = referencesEndpoints.find((e) => e.name === "ref_award_types");
      expect(ep).toBeDefined();
      expect(ep!.params.length).toBe(0);
    });

    it("ref_def_codes has no params", () => {
      const ep = referencesEndpoints.find((e) => e.name === "ref_def_codes");
      expect(ep).toBeDefined();
      expect(ep!.params.length).toBe(0);
    });

    it("ref_glossary has optional page and limit params", () => {
      const ep = referencesEndpoints.find((e) => e.name === "ref_glossary");
      expect(ep).toBeDefined();
      expect(ep!.params.find((p) => p.name === "page")?.required).toBe(false);
      expect(ep!.params.find((p) => p.name === "limit")?.required).toBe(false);
    });

    it("ref_naics has optional code param", () => {
      const ep = referencesEndpoints.find((e) => e.name === "ref_naics");
      expect(ep).toBeDefined();
      expect(ep!.params.find((p) => p.name === "code")?.required).toBe(false);
    });

    it("ref_filter_tree_psc has optional depth and filter params", () => {
      const ep = referencesEndpoints.find((e) => e.name === "ref_filter_tree_psc");
      expect(ep).toBeDefined();
      expect(ep!.params.length).toBe(2);
      expect(ep!.params.every((p) => !p.required)).toBe(true);
    });

    it("ref_filter_tree_tas has optional depth and filter params", () => {
      const ep = referencesEndpoints.find((e) => e.name === "ref_filter_tree_tas");
      expect(ep).toBeDefined();
      expect(ep!.params.length).toBe(2);
      expect(ep!.params.every((p) => !p.required)).toBe(true);
    });

    it("ref_cfda_totals has optional cfda param", () => {
      const ep = referencesEndpoints.find((e) => e.name === "ref_cfda_totals");
      expect(ep).toBeDefined();
      expect(ep!.params.find((p) => p.name === "cfda")?.required).toBe(false);
    });

    it("all endpoints have response fields", () => {
      for (const ep of referencesEndpoints) {
        expect(ep.responseFields.length).toBeGreaterThan(0);
      }
    });

    it("all endpoints have descriptions", () => {
      for (const ep of referencesEndpoints) {
        expect(typeof ep.description).toBe("string");
        expect(ep.description.length).toBeGreaterThan(0);
      }
    });
  });

  // --- KindMap type test ---

  describe("ReferencesKindMap type", () => {
    it("kind map resolves correctly", () => {
      const map: Partial<ReferencesKindMap> = {
        ref_toptier_agencies: [],
        ref_agency: { agency_name: "Test" },
        ref_award_types: { contracts: { A: "BPA Call" } },
        ref_glossary: [],
        ref_def_codes: [],
        ref_naics: [],
        ref_filter_hash: { hash: "abc123" },
        ref_filter_tree_psc: [],
        ref_filter_tree_tas: [],
        ref_submission_periods: [],
        ref_total_budgetary_resources: [],
        ref_assistance_listing: [],
        ref_cfda_totals: null,
      };
      expect(map.ref_toptier_agencies).toBeInstanceOf(Array);
      expect(typeof map.ref_filter_hash!.hash).toBe("string");
      expect(map.ref_glossary).toBeInstanceOf(Array);
    });
  });
});
