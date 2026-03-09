import { describe, it, expect, afterEach } from "bun:test";
import {
  _autocompleteAwardingAgency,
  _autocompleteFundingAgency,
  _autocompleteAwardingAgencyOffice,
  _autocompleteFundingAgencyOffice,
  _autocompleteCfda,
  _autocompleteCity,
  _autocompleteGlossary,
  _autocompleteLocation,
  _autocompleteNaics,
  _autocompletePsc,
  _autocompleteProgramActivity,
  _autocompleteRecipient,
  _autocompleteAccountsAid,
  _autocompleteAccountsA,
  _autocompleteAccountsAta,
  _autocompleteAccountsBpoa,
  _autocompleteAccountsEpoa,
  _autocompleteAccountsMain,
  _autocompleteAccountsSub,
  AutocompleteAgencyResponseSchema,
  AutocompleteAgencyOfficeResponseSchema,
  AutocompleteCfdaResponseSchema,
  AutocompleteCityResponseSchema,
  AutocompleteGlossaryResponseSchema,
  AutocompleteLocationResponseSchema,
  AutocompleteNaicsResponseSchema,
  AutocompletePscResponseSchema,
  AutocompleteProgramActivityResponseSchema,
  AutocompleteRecipientResponseSchema,
  AutocompleteAccountsAidResponseSchema,
  AutocompleteAccountsStringResponseSchema,
  autocompleteEndpoints,
} from "../../src/domains/autocomplete";
import type { AutocompleteKindMap } from "../../src/domains/autocomplete";

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

describe("autocomplete domain", () => {
  // --- Endpoint functions ---

  describe("_autocompleteAwardingAgency", () => {
    it("returns awarding agency results", async () => {
      mockFetch("autocomplete/awarding-agency.json");
      const result = await _autocompleteAwardingAgency({ search_text: "defense" });
      expect(result.kind).toBe("autocomplete_awarding_agency");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0]).toHaveProperty("id");
      expect(result.data[0]).toHaveProperty("toptier_agency");
      expect(result.data[0]).toHaveProperty("subtier_agency");
      expect(result.meta).toBeNull();
    });

    it("sends POST to correct URL", async () => {
      const getCapture = mockFetchCapture("autocomplete/awarding-agency.json");
      await _autocompleteAwardingAgency({ search_text: "defense" });
      expect(getCapture()!.url).toContain("/api/v2/autocomplete/awarding_agency/");
    });
  });

  describe("_autocompleteFundingAgency", () => {
    it("returns funding agency results", async () => {
      mockFetch("autocomplete/funding-agency.json");
      const result = await _autocompleteFundingAgency({ search_text: "defense" });
      expect(result.kind).toBe("autocomplete_funding_agency");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0]).toHaveProperty("id");
      expect(result.data[0]).toHaveProperty("toptier_agency");
      expect(result.meta).toBeNull();
    });

    it("sends POST to correct URL", async () => {
      const getCapture = mockFetchCapture("autocomplete/funding-agency.json");
      await _autocompleteFundingAgency({ search_text: "defense" });
      expect(getCapture()!.url).toContain("/api/v2/autocomplete/funding_agency/");
    });
  });

  describe("_autocompleteAwardingAgencyOffice", () => {
    it("returns awarding agency office hierarchy", async () => {
      mockFetch("autocomplete/awarding-agency-office.json");
      const result = await _autocompleteAwardingAgencyOffice({ search_text: "defense" });
      expect(result.kind).toBe("autocomplete_awarding_agency_office");
      expect(result.data).toHaveProperty("toptier_agency");
      expect(result.data).toHaveProperty("subtier_agency");
      expect(result.data).toHaveProperty("office");
      expect(result.meta).toBeNull();
    });

    it("sends POST to correct URL", async () => {
      const getCapture = mockFetchCapture("autocomplete/awarding-agency-office.json");
      await _autocompleteAwardingAgencyOffice({ search_text: "defense" });
      expect(getCapture()!.url).toContain("/api/v2/autocomplete/awarding_agency_office/");
    });
  });

  describe("_autocompleteFundingAgencyOffice", () => {
    it("returns funding agency office hierarchy", async () => {
      mockFetch("autocomplete/funding-agency-office.json");
      const result = await _autocompleteFundingAgencyOffice({ search_text: "defense" });
      expect(result.kind).toBe("autocomplete_funding_agency_office");
      expect(result.data).toHaveProperty("toptier_agency");
      expect(result.data).toHaveProperty("subtier_agency");
      expect(result.data).toHaveProperty("office");
      expect(result.meta).toBeNull();
    });

    it("sends POST to correct URL", async () => {
      const getCapture = mockFetchCapture("autocomplete/funding-agency-office.json");
      await _autocompleteFundingAgencyOffice({ search_text: "defense" });
      expect(getCapture()!.url).toContain("/api/v2/autocomplete/funding_agency_office/");
    });
  });

  describe("_autocompleteCfda", () => {
    it("returns CFDA results", async () => {
      mockFetch("autocomplete/cfda.json");
      const result = await _autocompleteCfda({ search_text: "disaster" });
      expect(result.kind).toBe("autocomplete_cfda");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0]).toHaveProperty("program_number");
      expect(result.data[0]).toHaveProperty("program_title");
      expect(result.meta).toBeNull();
    });

    it("sends POST to correct URL", async () => {
      const getCapture = mockFetchCapture("autocomplete/cfda.json");
      await _autocompleteCfda({ search_text: "disaster" });
      expect(getCapture()!.url).toContain("/api/v2/autocomplete/cfda/");
    });
  });

  describe("_autocompleteCity", () => {
    it("returns city results", async () => {
      mockFetch("autocomplete/city.json");
      const result = await _autocompleteCity({ search_text: "new" });
      expect(result.kind).toBe("autocomplete_city");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0]).toHaveProperty("city_name");
      expect(result.data[0]).toHaveProperty("state_code");
      expect(result.meta).toBeNull();
    });

    it("sends POST to correct URL", async () => {
      const getCapture = mockFetchCapture("autocomplete/city.json");
      await _autocompleteCity({ search_text: "new" });
      expect(getCapture()!.url).toContain("/api/v2/autocomplete/city/");
    });
  });

  describe("_autocompleteGlossary", () => {
    it("returns glossary results", async () => {
      mockFetch("autocomplete/glossary.json");
      const result = await _autocompleteGlossary({ search_text: "award" });
      expect(result.kind).toBe("autocomplete_glossary");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.meta).toBeNull();
    });

    it("sends POST to correct URL", async () => {
      const getCapture = mockFetchCapture("autocomplete/glossary.json");
      await _autocompleteGlossary({ search_text: "award" });
      expect(getCapture()!.url).toContain("/api/v2/autocomplete/glossary/");
    });
  });

  describe("_autocompleteLocation", () => {
    it("returns location results with cities", async () => {
      mockFetch("autocomplete/location.json");
      const result = await _autocompleteLocation({ search_text: "cal" });
      expect(result.kind).toBe("autocomplete_location");
      expect(result.data).toHaveProperty("cities");
      expect(result.data.cities).toBeInstanceOf(Array);
      expect(result.data.cities!.length).toBeGreaterThan(0);
      expect(result.data.cities![0]).toHaveProperty("city_name");
      expect(result.data.cities![0]).toHaveProperty("country_name");
      expect(result.meta).toBeNull();
    });

    it("sends POST to correct URL", async () => {
      const getCapture = mockFetchCapture("autocomplete/location.json");
      await _autocompleteLocation({ search_text: "cal" });
      expect(getCapture()!.url).toContain("/api/v2/autocomplete/location/");
    });
  });

  describe("_autocompleteNaics", () => {
    it("returns NAICS results", async () => {
      mockFetch("autocomplete/naics.json");
      const result = await _autocompleteNaics({ search_text: "mining" });
      expect(result.kind).toBe("autocomplete_naics");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0]).toHaveProperty("naics");
      expect(result.data[0]).toHaveProperty("naics_description");
      expect(result.meta).toBeNull();
    });

    it("sends POST to correct URL", async () => {
      const getCapture = mockFetchCapture("autocomplete/naics.json");
      await _autocompleteNaics({ search_text: "mining" });
      expect(getCapture()!.url).toContain("/api/v2/autocomplete/naics/");
    });
  });

  describe("_autocompletePsc", () => {
    it("returns PSC results", async () => {
      mockFetch("autocomplete/psc.json");
      const result = await _autocompletePsc({ search_text: "research" });
      expect(result.kind).toBe("autocomplete_psc");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.meta).toBeNull();
    });

    it("sends POST to correct URL", async () => {
      const getCapture = mockFetchCapture("autocomplete/psc.json");
      await _autocompletePsc({ search_text: "research" });
      expect(getCapture()!.url).toContain("/api/v2/autocomplete/psc/");
    });
  });

  describe("_autocompleteProgramActivity", () => {
    it("returns program activity results", async () => {
      mockFetch("autocomplete/program-activity.json");
      const result = await _autocompleteProgramActivity({ search_text: "program" });
      expect(result.kind).toBe("autocomplete_program_activity");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0]).toHaveProperty("program_activity_code");
      expect(result.data[0]).toHaveProperty("program_activity_name");
      expect(result.meta).toBeNull();
    });

    it("sends POST to correct URL", async () => {
      const getCapture = mockFetchCapture("autocomplete/program-activity.json");
      await _autocompleteProgramActivity({ search_text: "program" });
      expect(getCapture()!.url).toContain("/api/v2/autocomplete/program_activity/");
    });
  });

  describe("_autocompleteRecipient", () => {
    it("returns recipient results", async () => {
      mockFetch("autocomplete/recipient.json");
      const result = await _autocompleteRecipient({ search_text: "boeing" });
      expect(result.kind).toBe("autocomplete_recipient");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0]).toHaveProperty("recipient_name");
      expect(result.meta).toBeNull();
    });

    it("sends POST to correct URL", async () => {
      const getCapture = mockFetchCapture("autocomplete/recipient.json");
      await _autocompleteRecipient({ search_text: "boeing" });
      expect(getCapture()!.url).toContain("/api/v2/autocomplete/recipient/");
    });
  });

  describe("_autocompleteAccountsAid", () => {
    it("returns accounts AID results", async () => {
      mockFetch("autocomplete/accounts-aid.json");
      const result = await _autocompleteAccountsAid({ filters: {} });
      expect(result.kind).toBe("autocomplete_accounts_aid");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0]).toHaveProperty("aid");
      expect(result.data[0]).toHaveProperty("agency_name");
      expect(result.data[0]).toHaveProperty("agency_abbreviation");
      expect(result.meta).toBeNull();
    });

    it("sends POST to correct URL", async () => {
      const getCapture = mockFetchCapture("autocomplete/accounts-aid.json");
      await _autocompleteAccountsAid({ filters: {} });
      expect(getCapture()!.url).toContain("/api/v2/autocomplete/accounts/aid/");
    });
  });

  describe("_autocompleteAccountsA", () => {
    it("returns accounts A results (string array)", async () => {
      mockFetch("autocomplete/accounts-a.json");
      const result = await _autocompleteAccountsA({ filters: {} });
      expect(result.kind).toBe("autocomplete_accounts_a");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.meta).toBeNull();
    });

    it("sends POST to correct URL", async () => {
      const getCapture = mockFetchCapture("autocomplete/accounts-a.json");
      await _autocompleteAccountsA({ filters: {} });
      expect(getCapture()!.url).toContain("/api/v2/autocomplete/accounts/a/");
    });
  });

  describe("_autocompleteAccountsAta", () => {
    it("returns accounts ATA results", async () => {
      mockFetch("autocomplete/accounts-ata.json");
      const result = await _autocompleteAccountsAta({ filters: {} });
      expect(result.kind).toBe("autocomplete_accounts_ata");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.meta).toBeNull();
    });

    it("sends POST to correct URL", async () => {
      const getCapture = mockFetchCapture("autocomplete/accounts-ata.json");
      await _autocompleteAccountsAta({ filters: {} });
      expect(getCapture()!.url).toContain("/api/v2/autocomplete/accounts/ata/");
    });
  });

  describe("_autocompleteAccountsBpoa", () => {
    it("returns accounts BPOA results (string array)", async () => {
      mockFetch("autocomplete/accounts-bpoa.json");
      const result = await _autocompleteAccountsBpoa({ filters: {} });
      expect(result.kind).toBe("autocomplete_accounts_bpoa");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.meta).toBeNull();
    });

    it("sends POST to correct URL", async () => {
      const getCapture = mockFetchCapture("autocomplete/accounts-bpoa.json");
      await _autocompleteAccountsBpoa({ filters: {} });
      expect(getCapture()!.url).toContain("/api/v2/autocomplete/accounts/bpoa/");
    });
  });

  describe("_autocompleteAccountsEpoa", () => {
    it("returns accounts EPOA results (string array)", async () => {
      mockFetch("autocomplete/accounts-epoa.json");
      const result = await _autocompleteAccountsEpoa({ filters: {} });
      expect(result.kind).toBe("autocomplete_accounts_epoa");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.meta).toBeNull();
    });

    it("sends POST to correct URL", async () => {
      const getCapture = mockFetchCapture("autocomplete/accounts-epoa.json");
      await _autocompleteAccountsEpoa({ filters: {} });
      expect(getCapture()!.url).toContain("/api/v2/autocomplete/accounts/epoa/");
    });
  });

  describe("_autocompleteAccountsMain", () => {
    it("returns accounts main results (string array)", async () => {
      mockFetch("autocomplete/accounts-main.json");
      const result = await _autocompleteAccountsMain({ filters: {} });
      expect(result.kind).toBe("autocomplete_accounts_main");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.meta).toBeNull();
    });

    it("sends POST to correct URL", async () => {
      const getCapture = mockFetchCapture("autocomplete/accounts-main.json");
      await _autocompleteAccountsMain({ filters: {} });
      expect(getCapture()!.url).toContain("/api/v2/autocomplete/accounts/main/");
    });
  });

  describe("_autocompleteAccountsSub", () => {
    it("returns accounts sub results (string array)", async () => {
      mockFetch("autocomplete/accounts-sub.json");
      const result = await _autocompleteAccountsSub({ filters: {} });
      expect(result.kind).toBe("autocomplete_accounts_sub");
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.meta).toBeNull();
    });

    it("sends POST to correct URL", async () => {
      const getCapture = mockFetchCapture("autocomplete/accounts-sub.json");
      await _autocompleteAccountsSub({ filters: {} });
      expect(getCapture()!.url).toContain("/api/v2/autocomplete/accounts/sub/");
    });
  });

  // --- Schema parsing ---

  describe("schema parsing", () => {
    it("AutocompleteAgencyResponseSchema parses awarding-agency fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/autocomplete/awarding-agency.json`).json();
      const result = AutocompleteAgencyResponseSchema.parse(data);
      expect(result.results).toBeInstanceOf(Array);
      expect(result.results.length).toBeGreaterThan(0);
      expect(result.results[0].toptier_agency!.name).toBe("Defense Nuclear Facilities Safety Board");
    });

    it("AutocompleteAgencyResponseSchema parses funding-agency fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/autocomplete/funding-agency.json`).json();
      const result = AutocompleteAgencyResponseSchema.parse(data);
      expect(result.results).toBeInstanceOf(Array);
      expect(result.results.length).toBeGreaterThan(0);
      expect(result.results[0].id).toBe(806);
    });

    it("AutocompleteAgencyOfficeResponseSchema parses awarding-agency-office fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/autocomplete/awarding-agency-office.json`).json();
      const result = AutocompleteAgencyOfficeResponseSchema.parse(data);
      expect(result.results.toptier_agency).toBeInstanceOf(Array);
      expect(result.results.subtier_agency).toBeInstanceOf(Array);
      expect(result.results.office).toBeInstanceOf(Array);
    });

    it("AutocompleteAgencyOfficeResponseSchema parses funding-agency-office fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/autocomplete/funding-agency-office.json`).json();
      const result = AutocompleteAgencyOfficeResponseSchema.parse(data);
      expect(result.results.toptier_agency).toBeInstanceOf(Array);
      expect(result.results.subtier_agency).toBeInstanceOf(Array);
      expect(result.results.office).toBeInstanceOf(Array);
    });

    it("AutocompleteCfdaResponseSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/autocomplete/cfda.json`).json();
      const result = AutocompleteCfdaResponseSchema.parse(data);
      expect(result.results).toBeInstanceOf(Array);
      expect(result.results[0].program_number).toBe("11.021");
    });

    it("AutocompleteCityResponseSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/autocomplete/city.json`).json();
      const result = AutocompleteCityResponseSchema.parse(data);
      expect(result.results).toBeInstanceOf(Array);
      expect(result.count).toBe(26);
      expect(result.results[0].city_name).toBe("HOUSTON");
    });

    it("AutocompleteGlossaryResponseSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/autocomplete/glossary.json`).json();
      const result = AutocompleteGlossaryResponseSchema.parse(data);
      expect(result.results).toBeInstanceOf(Array);
      expect(result.count).toBe(3);
      expect(result.search_text).toBe("obligation");
    });

    it("AutocompleteLocationResponseSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/autocomplete/location.json`).json();
      const result = AutocompleteLocationResponseSchema.parse(data);
      expect(result.results.cities).toBeInstanceOf(Array);
      expect(result.count).toBe(6);
      expect(result.results.cities![0].city_name).toBe("CALIFORNIA");
    });

    it("AutocompleteNaicsResponseSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/autocomplete/naics.json`).json();
      const result = AutocompleteNaicsResponseSchema.parse(data);
      expect(result.results).toBeInstanceOf(Array);
      expect(result.results.length).toBeGreaterThan(0);
      expect(result.results[0].naics).toBe("334611");
    });

    it("AutocompletePscResponseSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/autocomplete/psc.json`).json();
      const result = AutocompletePscResponseSchema.parse(data);
      expect(result.results).toBeInstanceOf(Array);
    });

    it("AutocompleteProgramActivityResponseSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/autocomplete/program-activity.json`).json();
      const result = AutocompleteProgramActivityResponseSchema.parse(data);
      expect(result.results).toBeInstanceOf(Array);
      expect(result.results.length).toBeGreaterThan(0);
      expect(result.results[0].program_activity_code).toBe("0001");
    });

    it("AutocompleteRecipientResponseSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/autocomplete/recipient.json`).json();
      const result = AutocompleteRecipientResponseSchema.parse(data);
      expect(result.results).toBeInstanceOf(Array);
      expect(result.count).toBe(5);
      expect(result.results[0].recipient_name).toBeTruthy();
    });

    it("AutocompleteAccountsAidResponseSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/autocomplete/accounts-aid.json`).json();
      const result = AutocompleteAccountsAidResponseSchema.parse(data);
      expect(result.results).toBeInstanceOf(Array);
      expect(result.results[0].aid).toBe("080");
      expect(result.results[0].agency_name).toBe("National Aeronautics and Space Administration");
    });

    it("AutocompleteAccountsStringResponseSchema parses accounts-a fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/autocomplete/accounts-a.json`).json();
      const result = AutocompleteAccountsStringResponseSchema.parse(data);
      expect(result.results).toBeInstanceOf(Array);
      expect(result.results).toContain("X");
    });

    it("AutocompleteAccountsStringResponseSchema parses accounts-ata fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/autocomplete/accounts-ata.json`).json();
      const result = AutocompleteAccountsStringResponseSchema.parse(data);
      expect(result.results).toBeInstanceOf(Array);
    });

    it("AutocompleteAccountsStringResponseSchema parses accounts-bpoa fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/autocomplete/accounts-bpoa.json`).json();
      const result = AutocompleteAccountsStringResponseSchema.parse(data);
      expect(result.results).toBeInstanceOf(Array);
      expect(result.results.length).toBeGreaterThan(0);
    });

    it("AutocompleteAccountsStringResponseSchema parses accounts-epoa fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/autocomplete/accounts-epoa.json`).json();
      const result = AutocompleteAccountsStringResponseSchema.parse(data);
      expect(result.results).toBeInstanceOf(Array);
      expect(result.results.length).toBeGreaterThan(0);
    });

    it("AutocompleteAccountsStringResponseSchema parses accounts-main fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/autocomplete/accounts-main.json`).json();
      const result = AutocompleteAccountsStringResponseSchema.parse(data);
      expect(result.results).toBeInstanceOf(Array);
      expect(result.results.length).toBeGreaterThan(0);
    });

    it("AutocompleteAccountsStringResponseSchema parses accounts-sub fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/autocomplete/accounts-sub.json`).json();
      const result = AutocompleteAccountsStringResponseSchema.parse(data);
      expect(result.results).toBeInstanceOf(Array);
      expect(result.results.length).toBeGreaterThan(0);
    });
  });

  // --- Describe metadata ---

  describe("autocompleteEndpoints describe metadata", () => {
    it("has 19 autocomplete endpoints", () => {
      expect(autocompleteEndpoints.length).toBe(19);
    });

    it("all endpoints have response fields", () => {
      for (const ep of autocompleteEndpoints) {
        expect(ep.responseFields.length).toBeGreaterThan(0);
      }
    });

    it("search-text endpoints require search_text param", () => {
      const searchEndpoints = [
        "autocomplete_awarding_agency",
        "autocomplete_funding_agency",
        "autocomplete_cfda",
        "autocomplete_glossary",
        "autocomplete_naics",
        "autocomplete_psc",
        "autocomplete_recipient",
      ];
      for (const name of searchEndpoints) {
        const ep = autocompleteEndpoints.find((e) => e.name === name);
        expect(ep).toBeDefined();
        expect(ep!.params.find((p) => p.name === "search_text")?.required).toBe(true);
      }
    });

    it("account endpoints have optional search_text param", () => {
      const accountEndpoints = [
        "autocomplete_accounts_aid",
        "autocomplete_accounts_a",
        "autocomplete_accounts_ata",
        "autocomplete_accounts_bpoa",
        "autocomplete_accounts_epoa",
        "autocomplete_accounts_main",
        "autocomplete_accounts_sub",
      ];
      for (const name of accountEndpoints) {
        const ep = autocompleteEndpoints.find((e) => e.name === name);
        expect(ep).toBeDefined();
        expect(ep!.params.find((p) => p.name === "search_text")?.required).toBe(false);
      }
    });

    it("city endpoint has filter params", () => {
      const ep = autocompleteEndpoints.find((e) => e.name === "autocomplete_city");
      expect(ep).toBeDefined();
      expect(ep!.params.find((p) => p.name === "country_code")).toBeDefined();
      expect(ep!.params.find((p) => p.name === "scope")).toBeDefined();
    });
  });

  // --- KindMap type ---

  describe("AutocompleteKindMap type", () => {
    it("kind map resolves correctly", () => {
      const map: Partial<AutocompleteKindMap> = {
        autocomplete_awarding_agency: [],
        autocomplete_funding_agency: [],
        autocomplete_awarding_agency_office: { toptier_agency: [], subtier_agency: [], office: [] },
        autocomplete_funding_agency_office: { toptier_agency: [], subtier_agency: [], office: [] },
        autocomplete_cfda: [],
        autocomplete_city: [],
        autocomplete_glossary: [],
        autocomplete_location: { cities: [] },
        autocomplete_naics: [],
        autocomplete_psc: [],
        autocomplete_program_activity: [],
        autocomplete_recipient: [],
        autocomplete_accounts_aid: [],
        autocomplete_accounts_a: [],
        autocomplete_accounts_ata: [],
        autocomplete_accounts_bpoa: [],
        autocomplete_accounts_epoa: [],
        autocomplete_accounts_main: [],
        autocomplete_accounts_sub: [],
      };
      expect(map.autocomplete_awarding_agency).toBeInstanceOf(Array);
      expect(map.autocomplete_accounts_a).toBeInstanceOf(Array);
    });
  });
});
