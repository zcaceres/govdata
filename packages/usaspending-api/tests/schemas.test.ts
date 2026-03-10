import { describe, it, expect } from "bun:test";
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
} from "../src/schemas";
import { Glob } from "bun";

// Helper: load all fixtures matching a prefix
async function loadFixtures(prefix: string) {
  const glob = new Glob(`${prefix}*.json`);
  const fixtures: { name: string; data: any }[] = [];
  for await (const file of glob.scan(`${import.meta.dir}/../fixtures`)) {
    const data = await Bun.file(`${import.meta.dir}/../fixtures/${file}`).json();
    fixtures.push({ name: file, data });
  }
  return fixtures;
}

// === Award Search Response ===

describe("AwardSearchResponseSchema", () => {
  it("parses all award-search-*.json fixtures", async () => {
    const fixtures = await loadFixtures("award-search");
    expect(fixtures.length).toBeGreaterThan(0);

    for (const { name, data } of fixtures) {
      const result = AwardSearchResponseSchema.parse(data);
      expect(result.results).toBeInstanceOf(Array);
      expect(result.page_metadata).toBeDefined();
      expect(typeof result.page_metadata.page).toBe("number");
      expect(typeof result.page_metadata.hasNext).toBe("boolean");
      expect(typeof result.limit).toBe("number");
    }
  });

  it("contract results have expected fields", async () => {
    const data = await Bun.file(`${import.meta.dir}/../fixtures/award-search-keyword.json`).json();
    const result = AwardSearchResponseSchema.parse(data);
    const item = result.results[0];
    expect(item).toHaveProperty("internal_id");
    expect(item).toHaveProperty("Award ID");
    expect(item).toHaveProperty("Recipient Name");
    expect(item).toHaveProperty("Award Amount");
    expect(item).toHaveProperty("Awarding Agency");
    expect(item).toHaveProperty("generated_internal_id");
  });

  it("loan results have loan-specific fields", async () => {
    const data = await Bun.file(`${import.meta.dir}/../fixtures/award-search-loans.json`).json();
    const result = AwardSearchResponseSchema.parse(data);
    const item = result.results[0];
    expect(item).toHaveProperty("internal_id");
    expect(item).toHaveProperty("Award ID");
    expect(item).toHaveProperty("Loan Value");
    expect(item).toHaveProperty("Subsidy Cost");
    expect(item).toHaveProperty("Issued Date");
  });

  it("subaward results have subaward-specific fields", async () => {
    const data = await Bun.file(`${import.meta.dir}/../fixtures/award-search-subawards.json`).json();
    const result = AwardSearchResponseSchema.parse(data);
    const item = result.results[0];
    expect(item).toHaveProperty("Sub-Award ID");
    expect(item).toHaveProperty("Sub-Awardee Name");
    expect(item).toHaveProperty("Sub-Award Amount");
    expect(item).toHaveProperty("Prime Award ID");
    // internal_id is string for subawards
    expect(typeof item.internal_id).toBe("string");
  });

  it("page 2 has correct page number", async () => {
    const data = await Bun.file(`${import.meta.dir}/../fixtures/award-search-page2.json`).json();
    const result = AwardSearchResponseSchema.parse(data);
    expect(result.page_metadata.page).toBe(2);
  });

  it("handles grants with NAICS filter", async () => {
    const data = await Bun.file(`${import.meta.dir}/../fixtures/award-search-grants-naics.json`).json();
    const result = AwardSearchResponseSchema.parse(data);
    expect(result.results).toBeInstanceOf(Array);
  });
});

// === Award Detail ===

describe("AwardDetailSchema", () => {
  it("parses contract detail fixture", async () => {
    const data = await Bun.file(`${import.meta.dir}/../fixtures/award-detail-contract.json`).json();
    const result = AwardDetailSchema.parse(data);
    expect(result.id).toBeGreaterThan(0);
    expect(result.generated_unique_award_id).toBeTruthy();
    expect(result.category).toBe("contract");
    expect(result.type).toBeTruthy();
    expect(result.piid).toBeTruthy();
    expect(typeof result.total_obligation).toBe("number");
    expect(result.recipient).toBeDefined();
    expect(result.recipient?.recipient_name).toBeTruthy();
    expect(result.awarding_agency).toBeDefined();
    expect(result.period_of_performance).toBeDefined();
  });

  it("parses grant detail fixture", async () => {
    const data = await Bun.file(`${import.meta.dir}/../fixtures/award-detail-grant.json`).json();
    const result = AwardDetailSchema.parse(data);
    expect(result.category).toBe("grant");
    expect(result.fain).toBeTruthy();
    expect(result.generated_unique_award_id).toContain("ASST_NON");
  });

  it("parses legacy award-detail fixture", async () => {
    const data = await Bun.file(`${import.meta.dir}/../fixtures/award-detail.json`).json();
    const result = AwardDetailSchema.parse(data);
    expect(result.id).toBeGreaterThan(0);
  });
});

// === Agency Overview ===

describe("AgencyOverviewSchema", () => {
  const agencies = [
    { file: "agency-overview-nasa.json", code: "080", contains: "Aeronautics" },
    { file: "agency-overview-dod.json", code: "097", contains: "Defense" },
    { file: "agency-overview-hhs.json", code: "075", contains: "Health" },
    { file: "agency-overview-epa.json", code: "068", contains: "Environmental" },
  ];

  for (const { file, code, contains } of agencies) {
    it(`parses ${file}`, async () => {
      const data = await Bun.file(`${import.meta.dir}/../fixtures/${file}`).json();
      const result = AgencyOverviewSchema.parse(data);
      expect(result.toptier_code).toBe(code);
      expect(result.name).toContain(contains);
      expect(typeof result.name).toBe("string");
    });
  }

  it("contains expected agency fields", async () => {
    const data = await Bun.file(`${import.meta.dir}/../fixtures/agency-overview-nasa.json`).json();
    const result = AgencyOverviewSchema.parse(data);
    expect(result).toHaveProperty("toptier_code");
    expect(result).toHaveProperty("name");
    expect(result).toHaveProperty("abbreviation");
    expect(result).toHaveProperty("agency_id");
    expect(result).toHaveProperty("mission");
    expect(result).toHaveProperty("website");
  });

  it("parses legacy agency-overview fixture", async () => {
    const data = await Bun.file(`${import.meta.dir}/../fixtures/agency-overview.json`).json();
    const result = AgencyOverviewSchema.parse(data);
    expect(result.toptier_code).toBe("080");
  });
});

// === Spending by Agency ===

describe("SpendingByAgencyResponseSchema", () => {
  it("parses all spending-by-*.json fixtures", async () => {
    const fixtures = await loadFixtures("spending-by-a");
    const more = await loadFixtures("spending-by-f");
    const obj = await loadFixtures("spending-by-o");
    const budget = await loadFixtures("spending-by-b");
    const all = [...fixtures, ...more, ...obj, ...budget];
    expect(all.length).toBeGreaterThan(0);

    for (const { name, data } of all) {
      const result = SpendingByAgencyResponseSchema.parse(data);
      expect(typeof result.total).toBe("number");
      expect(result.results).toBeInstanceOf(Array);
      expect(result.results.length).toBeGreaterThan(0);
      for (const item of result.results) {
        expect(typeof item.name).toBe("string");
        expect(typeof item.amount).toBe("number");
      }
    }
  });

  it("agency type results have agency codes", async () => {
    const data = await Bun.file(`${import.meta.dir}/../fixtures/spending-by-agency-fy2024.json`).json();
    const result = SpendingByAgencyResponseSchema.parse(data);
    // Most should have codes (some may be null)
    const withCodes = result.results.filter(r => r.code != null);
    expect(withCodes.length).toBeGreaterThan(0);
  });

  it("FY2023 Q4 fixture uses quarter param", async () => {
    const data = await Bun.file(`${import.meta.dir}/../fixtures/spending-by-agency-fy2023-q4.json`).json();
    const result = SpendingByAgencyResponseSchema.parse(data);
    expect(result.total).toBeGreaterThan(0);
  });

  it("parses legacy spending-by-agency fixture", async () => {
    const data = await Bun.file(`${import.meta.dir}/../fixtures/spending-by-agency.json`).json();
    const result = SpendingByAgencyResponseSchema.parse(data);
    expect(result.total).toBeGreaterThan(0);
  });
});

// === Spending by State ===

describe("SpendingByStateResponseSchema", () => {
  it("parses spending-by-state fixture (array of states)", async () => {
    const data = await Bun.file(`${import.meta.dir}/../fixtures/spending-by-state-all.json`).json();
    const result = SpendingByStateResponseSchema.parse(data);
    expect(result.length).toBeGreaterThan(50); // 50 states + territories
    for (const item of result) {
      expect(item.fips).toBeTruthy();
      expect(item.code).toBeTruthy();
      expect(item.name).toBeTruthy();
      expect(typeof item.amount).toBe("number");
    }
  });

  it("state items have expected structure", async () => {
    const data = await Bun.file(`${import.meta.dir}/../fixtures/spending-by-state-all.json`).json();
    const result = SpendingByStateResponseSchema.parse(data);
    const ca = result.find(s => s.code === "CA");
    expect(ca).toBeDefined();
    expect(ca!.name).toBe("California");
    expect(ca!.amount).toBeGreaterThan(0);
  });

  it("parses legacy spending-by-state fixture", async () => {
    const data = await Bun.file(`${import.meta.dir}/../fixtures/spending-by-state.json`).json();
    const result = SpendingByStateResponseSchema.parse(data);
    expect(result.length).toBeGreaterThan(0);
  });
});

// === Spending Over Time ===

describe("SpendingOverTimeResponseSchema", () => {
  it("parses fiscal_year grouping", async () => {
    const data = await Bun.file(`${import.meta.dir}/../fixtures/spending-over-time-fy.json`).json();
    const result = SpendingOverTimeResponseSchema.parse(data);
    expect(result.group).toBe("fiscal_year");
    expect(result.results.length).toBeGreaterThan(0);
    for (const item of result.results) {
      expect(item.time_period).toHaveProperty("fiscal_year");
      expect(typeof item.aggregated_amount).toBe("number");
    }
  });

  it("parses quarter grouping", async () => {
    const data = await Bun.file(`${import.meta.dir}/../fixtures/spending-over-time-quarter.json`).json();
    const result = SpendingOverTimeResponseSchema.parse(data);
    expect(result.group).toBe("quarter");
    for (const item of result.results) {
      expect(item.time_period).toHaveProperty("fiscal_year");
      expect(item.time_period).toHaveProperty("quarter");
    }
  });

  it("parses month grouping", async () => {
    const data = await Bun.file(`${import.meta.dir}/../fixtures/spending-over-time-month.json`).json();
    const result = SpendingOverTimeResponseSchema.parse(data);
    expect(result.group).toBe("month");
    for (const item of result.results) {
      expect(item.time_period).toHaveProperty("fiscal_year");
      expect(item.time_period).toHaveProperty("month");
    }
  });

  it("parses contracts-only spending over time", async () => {
    const data = await Bun.file(`${import.meta.dir}/../fixtures/spending-over-time-contracts.json`).json();
    const result = SpendingOverTimeResponseSchema.parse(data);
    expect(result.results.length).toBeGreaterThan(0);
  });

  it("results have obligation breakdown fields", async () => {
    const data = await Bun.file(`${import.meta.dir}/../fixtures/spending-over-time-fy.json`).json();
    const result = SpendingOverTimeResponseSchema.parse(data);
    const item = result.results[0];
    // These breakdown fields may be present
    expect(item).toHaveProperty("aggregated_amount");
    expect(item).toHaveProperty("time_period");
  });

  it("parses legacy spending-over-time fixture", async () => {
    const data = await Bun.file(`${import.meta.dir}/../fixtures/spending-over-time.json`).json();
    const result = SpendingOverTimeResponseSchema.parse(data);
    expect(result.results.length).toBeGreaterThan(0);
  });
});

// === Param Schemas ===

describe("Param schema validation", () => {
  it("AwardSearchParamsSchema accepts valid params", () => {
    const result = AwardSearchParamsSchema.safeParse({
      filters: { keywords: ["NASA"], award_type_codes: ["A", "B"] },
      page: 1,
      limit: 10,
      sort: "Award Amount",
      order: "desc",
      subawards: false,
    });
    expect(result.success).toBe(true);
  });

  it("AwardSearchParamsSchema requires filters", () => {
    const result = AwardSearchParamsSchema.safeParse({ page: 1 });
    expect(result.success).toBe(false);
  });

  it("AwardSearchFiltersSchema accepts naics_codes as array", () => {
    const result = AwardSearchFiltersSchema.safeParse({
      naics_codes: ["541330"],
    });
    expect(result.success).toBe(true);
  });

  it("AwardSearchFiltersSchema accepts naics_codes as object", () => {
    const result = AwardSearchFiltersSchema.safeParse({
      naics_codes: { require: ["541330"] },
    });
    expect(result.success).toBe(true);
  });

  it("SpendingByAgencyParamsSchema validates type enum", () => {
    const valid = SpendingByAgencyParamsSchema.safeParse({
      type: "agency",
      filters: { fy: "2024" },
    });
    expect(valid.success).toBe(true);

    const invalid = SpendingByAgencyParamsSchema.safeParse({
      type: "invalid_type",
      filters: { fy: "2024" },
    });
    expect(invalid.success).toBe(false);
  });

  it("SpendingOverTimeParamsSchema validates group enum", () => {
    for (const group of ["fiscal_year", "quarter", "month"]) {
      const result = SpendingOverTimeParamsSchema.safeParse({
        group,
        filters: {},
      });
      expect(result.success).toBe(true);
    }
  });

  it("AwardSearchParamsSchema rejects invalid order", () => {
    const result = AwardSearchParamsSchema.safeParse({
      filters: {},
      order: "invalid",
    });
    expect(result.success).toBe(false);
  });

  it("AwardSearchParamsSchema rejects limit > 100", () => {
    const result = AwardSearchParamsSchema.safeParse({
      filters: {},
      limit: 200,
    });
    expect(result.success).toBe(false);
  });
});

// === Award Type Codes ===

describe("AwardTypeCodes", () => {
  it("has all expected categories", () => {
    expect(AwardTypeCodes.contracts).toEqual(["A", "B", "C", "D"]);
    expect(AwardTypeCodes.grants).toEqual(["02", "03", "04", "05"]);
    expect(AwardTypeCodes.loans).toEqual(["07", "08"]);
    expect(AwardTypeCodes.direct_payments).toEqual(["06", "10"]);
    expect(AwardTypeCodes.other).toEqual(["09", "11"]);
    expect(AwardTypeCodes.idvs.length).toBeGreaterThan(0);
  });
});
