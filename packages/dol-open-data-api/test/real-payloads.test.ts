/**
 * Tests using real API payloads captured from the DOL Open Data API.
 * Verifies schema parsing, plugin wrapper behavior, and GovResult formatting
 * against actual production data shapes for ALL endpoints with fixtures.
 */
import { describe, expect, test, afterEach } from "bun:test";
import { DataResponse, MetadataResponse } from "../src/schemas";
import { dolPlugin } from "../src/plugin";
import { wrapResponse } from "../src/response";
import { createResult } from "govdata-core";

// === EBSA ===
import ebsaOcats from "./fixtures/real-ebsa-ocats.json";

// === ETA ===
import etaOtaaPetition from "./fixtures/real-eta-otaa_petition.json";
import etaApprenticeship from "./fixtures/real-eta-apprenticeship_data.json";
import etaNationalClaims from "./fixtures/real-eta-ui_national_weekly_claims.json";
import etaStateClaims from "./fixtures/real-eta-ui_state_weekly_claims.json";

// === ILAB ===
import ilabChildLabor from "./fixtures/real-ilab-child_labor_report__2016_to_2022.json";
import ilabImportWatchGoodsHS from "./fixtures/real-ilab-importwatch_goods_hs.json";
import ilabImportWatchCore from "./fixtures/real-ilab-importwatch_core_data.json";
import ilabImportWatchCountry from "./fixtures/real-ilab-importwatch_country_codes.json";
import ilabLaborShieldReporting from "./fixtures/real-ilab-laborshield_reportingdata.json";
import ilabLaborShieldGoods from "./fixtures/real-ilab-laborshield_goods.json";
import ilabLaborShieldActions from "./fixtures/real-ilab-laborshield_suggestedactions.json";

// === MSHA (15/15) ===
import mshaAccident from "./fixtures/real-msha-accident.json";
import mshaAddressOfRecords from "./fixtures/real-msha-address_of_records_mines.json";
import mshaAssessedViolations from "./fixtures/real-msha-assessed_violations.json";
import mshaContractorNameId from "./fixtures/real-msha-contractor_name_id_lookup.json";
import mshaContractorEmpAnnual from "./fixtures/real-msha-contractor_employment_production_annual.json";
import mshaControllerHistory from "./fixtures/real-msha-controller_history.json";
import mshaCommodity from "./fixtures/real-msha-commodity_lookup.json";
import mshaOperatorEmpAnnual from "./fixtures/real-msha-operator_employment_production_annual.json";
import mshaInspection from "./fixtures/real-msha-inspection.json";
import mshaMines from "./fixtures/real-msha-mines.json";
import mshaContractorHistoryMines from "./fixtures/real-msha-contractor_history_at_mines.json";
import mshaOperatorHistoryMines from "./fixtures/real-msha-operator_history_at_mines.json";
import mshaContractorEmpQuarterly from "./fixtures/real-msha-contractor_employment_production_quarterly.json";
import mshaOperatorEmpQuarterly from "./fixtures/real-msha-operator_employment_production_quarterly.json";
import mshaViolation from "./fixtures/real-msha-violation.json";

// === OSHA (11/11) ===
import oshaAccidentLookup2 from "./fixtures/real-osha-accident_lookup2.json";
import oshaAccident from "./fixtures/real-osha-accident.json";
import oshaAccidentAbstract from "./fixtures/real-osha-accident_abstract.json";
import oshaAccidentInjury from "./fixtures/real-osha-accident_injury.json";
import oshaInspection from "./fixtures/real-osha-inspection.json";
import oshaOptionalCodeInfo from "./fixtures/real-osha-optional_code_info.json";
import oshaRelatedActivity from "./fixtures/real-osha-related_activity.json";
import oshaEmphasisCodes from "./fixtures/real-osha-emphasis_codes.json";
import oshaViolation from "./fixtures/real-osha-violation.json";
import oshaViolationEvent from "./fixtures/real-osha-violation_event.json";
import oshaViolationGenDutyStd from "./fixtures/real-osha-violation_gen_duty_std.json";

// === TRNG ===
import trngIndustries from "./fixtures/real-trng-training_dataset_industries.json";

// === VETS ===
import vets4212 from "./fixtures/real-vets-4212.json";

// === WB ===
import wbNdcp from "./fixtures/real-wb-ndcp.json";

// === WHD ===
import whdEnforcement from "./fixtures/real-whd-enforcement.json";

// === Metadata ===
import mshaAccidentMeta from "./fixtures/real-msha-accident-metadata.json";
import oshaInspectionMeta from "./fixtures/real-osha-inspection-metadata.json";

const allFixtures: { name: string; agency: string; endpoint: string; fixture: unknown }[] = [
  // EBSA (1/1)
  { name: "EBSA/ocats", agency: "EBSA", endpoint: "ocats", fixture: ebsaOcats },

  // ETA (4/4)
  { name: "ETA/otaa_petition", agency: "ETA", endpoint: "otaa_petition", fixture: etaOtaaPetition },
  { name: "ETA/apprenticeship_data", agency: "ETA", endpoint: "apprenticeship_data", fixture: etaApprenticeship },
  { name: "ETA/ui_national_weekly_claims", agency: "ETA", endpoint: "ui_national_weekly_claims", fixture: etaNationalClaims },
  { name: "ETA/ui_state_weekly_claims", agency: "ETA", endpoint: "ui_state_weekly_claims", fixture: etaStateClaims },

  // ILAB (7/7)
  { name: "ILAB/Child_Labor_Report__2016_to_2022", agency: "ILAB", endpoint: "Child_Labor_Report__2016_to_2022", fixture: ilabChildLabor },
  { name: "ILAB/ImportWatch_Goods_HS", agency: "ILAB", endpoint: "ImportWatch_Goods_HS", fixture: ilabImportWatchGoodsHS },
  { name: "ILAB/ImportWatch_Core_Data", agency: "ILAB", endpoint: "ImportWatch_Core_Data", fixture: ilabImportWatchCore },
  { name: "ILAB/ImportWatch_Country_Codes", agency: "ILAB", endpoint: "ImportWatch_Country_Codes", fixture: ilabImportWatchCountry },
  { name: "ILAB/LaborShield_ReportingData", agency: "ILAB", endpoint: "LaborShield_ReportingData", fixture: ilabLaborShieldReporting },
  { name: "ILAB/LaborShield_Goods", agency: "ILAB", endpoint: "LaborShield_Goods", fixture: ilabLaborShieldGoods },
  { name: "ILAB/LaborShield_SuggestedActions", agency: "ILAB", endpoint: "LaborShield_SuggestedActions", fixture: ilabLaborShieldActions },

  // MSHA (15/15)
  { name: "MSHA/accident", agency: "MSHA", endpoint: "accident", fixture: mshaAccident },
  { name: "MSHA/address_of_records_mines", agency: "MSHA", endpoint: "address_of_records_mines", fixture: mshaAddressOfRecords },
  { name: "MSHA/assessed_violations", agency: "MSHA", endpoint: "assessed_violations", fixture: mshaAssessedViolations },
  { name: "MSHA/contractor_name_id_lookup", agency: "MSHA", endpoint: "contractor_name_id_lookup", fixture: mshaContractorNameId },
  { name: "MSHA/contractor_employment_production_annual", agency: "MSHA", endpoint: "contractor_employment_production_annual", fixture: mshaContractorEmpAnnual },
  { name: "MSHA/controller_history", agency: "MSHA", endpoint: "controller_history", fixture: mshaControllerHistory },
  { name: "MSHA/commodity_lookup", agency: "MSHA", endpoint: "commodity_lookup", fixture: mshaCommodity },
  { name: "MSHA/operator_employment_production_annual", agency: "MSHA", endpoint: "operator_employment_production_annual", fixture: mshaOperatorEmpAnnual },
  { name: "MSHA/inspection", agency: "MSHA", endpoint: "inspection", fixture: mshaInspection },
  { name: "MSHA/mines", agency: "MSHA", endpoint: "mines", fixture: mshaMines },
  { name: "MSHA/contractor_history_at_mines", agency: "MSHA", endpoint: "contractor_history_at_mines", fixture: mshaContractorHistoryMines },
  { name: "MSHA/operator_history_at_mines", agency: "MSHA", endpoint: "operator_history_at_mines", fixture: mshaOperatorHistoryMines },
  { name: "MSHA/contractor_employment_production_quarterly", agency: "MSHA", endpoint: "contractor_employment_production_quarterly", fixture: mshaContractorEmpQuarterly },
  { name: "MSHA/operator_employment_production_quarterly", agency: "MSHA", endpoint: "operator_employment_production_quarterly", fixture: mshaOperatorEmpQuarterly },
  { name: "MSHA/violation", agency: "MSHA", endpoint: "violation", fixture: mshaViolation },

  // OSHA (11/11)
  { name: "OSHA/accident_lookup2", agency: "OSHA", endpoint: "accident_lookup2", fixture: oshaAccidentLookup2 },
  { name: "OSHA/accident", agency: "OSHA", endpoint: "accident", fixture: oshaAccident },
  { name: "OSHA/accident_abstract", agency: "OSHA", endpoint: "accident_abstract", fixture: oshaAccidentAbstract },
  { name: "OSHA/accident_injury", agency: "OSHA", endpoint: "accident_injury", fixture: oshaAccidentInjury },
  { name: "OSHA/inspection", agency: "OSHA", endpoint: "inspection", fixture: oshaInspection },
  { name: "OSHA/optional_code_info", agency: "OSHA", endpoint: "optional_code_info", fixture: oshaOptionalCodeInfo },
  { name: "OSHA/related_activity", agency: "OSHA", endpoint: "related_activity", fixture: oshaRelatedActivity },
  { name: "OSHA/emphasis_codes", agency: "OSHA", endpoint: "emphasis_codes", fixture: oshaEmphasisCodes },
  { name: "OSHA/violation", agency: "OSHA", endpoint: "violation", fixture: oshaViolation },
  { name: "OSHA/violation_event", agency: "OSHA", endpoint: "violation_event", fixture: oshaViolationEvent },
  { name: "OSHA/violation_gen_duty_std", agency: "OSHA", endpoint: "violation_gen_duty_std", fixture: oshaViolationGenDutyStd },

  // TRNG (1/1)
  { name: "TRNG/training_dataset_industries", agency: "TRNG", endpoint: "training_dataset_industries", fixture: trngIndustries },

  // VETS (1/1)
  { name: "VETS/4212", agency: "VETS", endpoint: "4212", fixture: vets4212 },

  // WB (1/1)
  { name: "WB/ndcp", agency: "WB", endpoint: "ndcp", fixture: wbNdcp },

  // WHD (1/1)
  { name: "WHD/enforcement", agency: "WHD", endpoint: "enforcement", fixture: whdEnforcement },
];

describe("DataResponse schema parses real payloads", () => {
  for (const { name, fixture } of allFixtures) {
    test(`${name} parses without error`, () => {
      const result = DataResponse.parse(fixture);
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
    });

    test(`${name} rows are plain objects with at least one key`, () => {
      const result = DataResponse.parse(fixture);
      for (const row of result.data) {
        expect(typeof row).toBe("object");
        expect(row).not.toBeNull();
        expect(Object.keys(row).length).toBeGreaterThan(0);
      }
    });
  }
});

describe("MetadataResponse schema parses real metadata", () => {
  test("MSHA/accident metadata parses with 59 columns", () => {
    const result = MetadataResponse.parse(mshaAccidentMeta);
    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBe(59);
  });

  test("OSHA/inspection metadata parses with 36 columns", () => {
    const result = MetadataResponse.parse(oshaInspectionMeta);
    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBe(36);
  });

  test("metadata rows have column info fields", () => {
    const result = MetadataResponse.parse(mshaAccidentMeta);
    for (const col of result) {
      const keys = Object.keys(col);
      expect(keys.length).toBeGreaterThan(0);
    }
  });

  test("MSHA accident metadata column count matches data columns", () => {
    const data = DataResponse.parse(mshaAccident);
    const meta = MetadataResponse.parse(mshaAccidentMeta);
    expect(meta.length).toBe(Object.keys(data.data[0]).length);
  });

  test("OSHA inspection metadata column count matches data columns", () => {
    const data = DataResponse.parse(oshaInspection);
    const meta = MetadataResponse.parse(oshaInspectionMeta);
    expect(meta.length).toBe(Object.keys(data.data[0]).length);
  });
});

describe("wrapResponse with real payloads", () => {
  for (const { name, agency, endpoint, fixture } of allFixtures) {
    test(`${name} wraps and formats correctly`, () => {
      const parsed = DataResponse.parse(fixture);
      const wrapped = wrapResponse(parsed, agency, endpoint);

      expect(wrapped.data).toBeInstanceOf(Array);
      expect(wrapped.data.length).toBeGreaterThan(0);
      expect(typeof wrapped.toMarkdown).toBe("function");
      expect(typeof wrapped.toCSV).toBe("function");
      expect(typeof wrapped.summary).toBe("function");

      // toMarkdown produces a pipe-delimited table
      const md = wrapped.toMarkdown();
      expect(md).toContain("|");
      expect(md.split("\n").length).toBeGreaterThan(2);

      // toCSV produces non-empty output with header
      const csv = wrapped.toCSV();
      expect(csv.trim().split("\n").length).toBeGreaterThan(1);

      // summary includes agency and endpoint
      const summary = wrapped.summary();
      expect(summary).toContain(agency);
      expect(summary).toContain(endpoint);
    });
  }
});

describe("plugin wrapper dispatches real payloads as GovResult", () => {
  const originalFetch = globalThis.fetch;
  const originalEnv = process.env.DOL_API_KEY;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    if (originalEnv) {
      process.env.DOL_API_KEY = originalEnv;
    } else {
      delete process.env.DOL_API_KEY;
    }
  });

  function mockFetch(body: unknown) {
    globalThis.fetch = (async () =>
      new Response(JSON.stringify(body), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })) as typeof fetch;
  }

  for (const { name, agency, endpoint, fixture } of allFixtures) {
    const pluginEndpointName = `${agency.toLowerCase()}_${endpoint}`;

    test(`${pluginEndpointName} returns valid GovResult`, async () => {
      process.env.DOL_API_KEY = "test-key";
      mockFetch(fixture);

      const fn = dolPlugin.endpoints[pluginEndpointName];
      expect(fn).toBeDefined();

      const result = await fn({ limit: 2 });

      // GovResult shape
      expect(result.data).toBeInstanceOf(Array);
      expect(result.kind).toBe(pluginEndpointName);
      expect(typeof result.toMarkdown).toBe("function");
      expect(typeof result.toCSV).toBe("function");
      expect(typeof result.summary).toBe("function");

      // Row count matches fixture
      const parsed = DataResponse.parse(fixture);
      expect((result.data as unknown[]).length).toBe(parsed.data.length);

      // Formatting doesn't throw
      expect(result.toMarkdown().length).toBeGreaterThan(0);
      expect(result.toCSV().length).toBeGreaterThan(0);
      expect(result.summary()).toContain(pluginEndpointName);
    });
  }
});

describe("createResult with real payloads", () => {
  for (const { name, agency, endpoint, fixture } of allFixtures) {
    test(`${name} round-trips through createResult`, () => {
      const parsed = DataResponse.parse(fixture);
      const kind = `${agency.toLowerCase()}_${endpoint}`;
      const result = createResult(parsed.data, null, kind);

      expect(result.data).toBeInstanceOf(Array);
      expect(result.kind).toBe(kind);
      expect(result.meta).toBeNull();
      expect(typeof result.toMarkdown()).toBe("string");
      expect(typeof result.toCSV()).toBe("string");
      expect(result.summary()).toContain(kind);
    });
  }
});

describe("real payload column counts per README", () => {
  const expectedColumns: Record<string, number> = {
    // EBSA
    "EBSA/ocats": 12,
    // ETA
    "ETA/otaa_petition": 66,
    "ETA/apprenticeship_data": 34,
    "ETA/ui_national_weekly_claims": 10,
    "ETA/ui_state_weekly_claims": 25,
    // ILAB
    "ILAB/Child_Labor_Report__2016_to_2022": 73,
    "ILAB/ImportWatch_Goods_HS": 3,
    "ILAB/ImportWatch_Core_Data": 10,
    "ILAB/ImportWatch_Country_Codes": 8,
    "ILAB/LaborShield_ReportingData": 62,
    "ILAB/LaborShield_Goods": 8,
    "ILAB/LaborShield_SuggestedActions": 6,
    // MSHA
    "MSHA/accident": 59,
    "MSHA/address_of_records_mines": 21,
    "MSHA/assessed_violations": 12,
    "MSHA/contractor_name_id_lookup": 3,
    "MSHA/contractor_employment_production_annual": 8,
    "MSHA/controller_history": 7,
    "MSHA/commodity_lookup": 9,
    "MSHA/operator_employment_production_annual": 7,
    "MSHA/inspection": 54,
    "MSHA/mines": 62,
    "MSHA/contractor_history_at_mines": 6,
    "MSHA/operator_history_at_mines": 7,
    "MSHA/contractor_employment_production_quarterly": 12,
    "MSHA/operator_employment_production_quarterly": 11,
    "MSHA/violation": 55,
    // OSHA
    "OSHA/accident_lookup2": 5,
    "OSHA/accident": 16,
    "OSHA/accident_abstract": 4,
    "OSHA/accident_injury": 21,
    "OSHA/inspection": 36,
    "OSHA/optional_code_info": 6,
    "OSHA/related_activity": 6,
    "OSHA/emphasis_codes": 4,
    "OSHA/violation": 29,
    "OSHA/violation_event": 10,
    "OSHA/violation_gen_duty_std": 5,
    // TRNG
    "TRNG/training_dataset_industries": 3,
    // VETS
    "VETS/4212": 78,
    // WB
    "WB/ndcp": 370,
    // WHD
    "WHD/enforcement": 110,
  };

  for (const { name, fixture } of allFixtures) {
    const expected = expectedColumns[name];
    if (expected) {
      test(`${name} has ${expected} columns`, () => {
        const parsed = DataResponse.parse(fixture);
        expect(Object.keys(parsed.data[0]).length).toBe(expected);
      });
    }
  }
});
