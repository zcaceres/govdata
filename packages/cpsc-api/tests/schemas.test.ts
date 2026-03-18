import { describe, it, expect } from "bun:test";
import { readdirSync } from "node:fs";
import {
  RecallParamsSchema,
  PenaltyParamsSchema,
  PenaltyListParamsSchema,
  RecallsResponseSchema,
  PenaltiesResponseSchema,
  PenaltyCompaniesResponseSchema,
  PenaltyProductsResponseSchema,
  PenaltyYearsResponseSchema,
} from "../src/schemas";

describe("RecallParamsSchema", () => {
  it("accepts empty object", () => {
    expect(RecallParamsSchema.safeParse({}).success).toBe(true);
  });

  it("accepts valid date range", () => {
    const result = RecallParamsSchema.safeParse({
      RecallDateStart: "2025-01-01",
      RecallDateEnd: "2025-01-31",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid date range (start > end)", () => {
    const result = RecallParamsSchema.safeParse({
      RecallDateStart: "2025-02-01",
      RecallDateEnd: "2025-01-01",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid LastPublishDate range", () => {
    const result = RecallParamsSchema.safeParse({
      LastPublishDateStart: "2025-06-01",
      LastPublishDateEnd: "2025-01-01",
    });
    expect(result.success).toBe(false);
  });

  it("coerces RecallID from string to number", () => {
    const result = RecallParamsSchema.safeParse({ RecallID: "10141" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.RecallID).toBe(10141);
  });

  it("rejects unknown keys (.strict())", () => {
    const result = RecallParamsSchema.safeParse({ typo: "foo" });
    expect(result.success).toBe(false);
  });

  it("accepts all valid string params", () => {
    const result = RecallParamsSchema.safeParse({
      RecallTitle: "hair dryer",
      ProductName: "dryer",
      Manufacturer: "AliExpress",
      ManufacturerCountry: "China",
      RemedyOption: "Refund",
    });
    expect(result.success).toBe(true);
  });
});

describe("PenaltyParamsSchema", () => {
  it("defaults penaltytype to civil", () => {
    const result = PenaltyParamsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.penaltytype).toBe("civil");
  });

  it("accepts criminal", () => {
    const result = PenaltyParamsSchema.safeParse({ penaltytype: "criminal" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid penaltytype", () => {
    const result = PenaltyParamsSchema.safeParse({ penaltytype: "admin" });
    expect(result.success).toBe(false);
  });

  it("accepts filter params", () => {
    const result = PenaltyParamsSchema.safeParse({
      penaltytype: "civil",
      company: "Fitbit",
      fiscalyear: "2025",
    });
    expect(result.success).toBe(true);
  });

  it("rejects unknown keys (.strict())", () => {
    const result = PenaltyParamsSchema.safeParse({ badKey: "x" });
    expect(result.success).toBe(false);
  });
});

describe("PenaltyListParamsSchema", () => {
  it("defaults penaltytype to civil", () => {
    const result = PenaltyListParamsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.penaltytype).toBe("civil");
  });
});

describe("Response schemas", () => {
  const fixtureSchemas = {
    "recall-by-id.json": RecallsResponseSchema,
    "recall-search-small.json": RecallsResponseSchema,
    "recall-search.json": RecallsResponseSchema,
    "penalty-civil-2025.json": PenaltiesResponseSchema,
    "penalty-criminal-all.json": PenaltiesResponseSchema,
    "penalty-companies.json": PenaltyCompaniesResponseSchema,
    "penalty-products.json": PenaltyProductsResponseSchema,
    "penalty-fiscal-years.json": PenaltyYearsResponseSchema,
  } as const;

  it("RecallsResponseSchema parses fixture", async () => {
    const fixture = await Bun.file(
      new URL("../fixtures/recall-by-id.json", import.meta.url),
    ).json();
    const result = RecallsResponseSchema.safeParse(fixture);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(1);
      expect(result.data[0].RecallID).toBe(10141);
      expect(result.data[0].Products).toHaveLength(1);
      expect(result.data[0].Hazards).toHaveLength(1);
    }
  });

  it("RecallsResponseSchema parses multi-recall fixture", async () => {
    const fixture = await Bun.file(
      new URL("../fixtures/recall-search-small.json", import.meta.url),
    ).json();
    const result = RecallsResponseSchema.safeParse(fixture);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.length).toBeGreaterThan(1);
    }
  });

  it("PenaltiesResponseSchema parses fixture", async () => {
    const fixture = await Bun.file(
      new URL("../fixtures/penalty-civil-2025.json", import.meta.url),
    ).json();
    const result = PenaltiesResponseSchema.safeParse(fixture);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(2);
      expect(result.data[0].Firm).toBe("Bestar Inc.");
      expect(result.data[0].Fine).toBe("$16,025,000.00");
    }
  });

  it("PenaltyCompaniesResponseSchema parses fixture", async () => {
    const fixture = await Bun.file(
      new URL("../fixtures/penalty-companies.json", import.meta.url),
    ).json();
    const result = PenaltyCompaniesResponseSchema.safeParse(fixture);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.length).toBeGreaterThan(100);
      expect(result.data).toContain("Fitbit LLC");
    }
  });

  it("PenaltyProductsResponseSchema parses fixture", async () => {
    const fixture = await Bun.file(
      new URL("../fixtures/penalty-products.json", import.meta.url),
    ).json();
    const result = PenaltyProductsResponseSchema.safeParse(fixture);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.length).toBeGreaterThan(50);
      expect(result.data[0]).toHaveProperty("Type");
      expect(result.data[0]).toHaveProperty("CategoryID");
    }
  });

  it("PenaltyYearsResponseSchema parses fixture", async () => {
    const fixture = await Bun.file(
      new URL("../fixtures/penalty-fiscal-years.json", import.meta.url),
    ).json();
    const result = PenaltyYearsResponseSchema.safeParse(fixture);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toContain("2025");
      expect(result.data).toContain("1977");
    }
  });

  it("all CPSC fixtures match their intended schemas", async () => {
    const fixtureDir = new URL("../fixtures/", import.meta.url);
    const fixtureFiles = readdirSync(fixtureDir).filter((file) => file.endsWith(".json")).sort();

    expect(fixtureFiles).toEqual(Object.keys(fixtureSchemas).sort());

    for (const file of fixtureFiles) {
      const fixture = await Bun.file(new URL(`../fixtures/${file}`, import.meta.url)).json();
      const schema = fixtureSchemas[file as keyof typeof fixtureSchemas];
      const result = schema.safeParse(fixture);
      expect(result.success, `${file} should match its schema`).toBe(true);
    }
  });
});
