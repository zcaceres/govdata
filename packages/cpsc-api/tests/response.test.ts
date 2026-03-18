import { describe, it, expect } from "bun:test";
import { wrapResponse } from "../src/response";
import type { Recall, Penalty, PenaltyProductType } from "../src/types";

const sampleRecall: Recall = {
  RecallID: 10141,
  RecallNumber: "25112",
  RecallDate: "2025-01-30T00:00:00",
  Description: "Test description",
  URL: "https://cpsc.gov/test",
  Title: "Test Recall",
  ConsumerContact: "test@test.com",
  LastPublishDate: "2025-01-30T00:00:00",
  Products: [{ Name: "Widget", Description: "", Model: "X", Type: "", CategoryID: "", NumberOfUnits: "500" }],
  Inconjunctions: [],
  Images: [{ URL: "https://cpsc.gov/img.png", Caption: "Test" }],
  Injuries: [{ Name: "None reported" }],
  Manufacturers: [{ Name: "Acme Corp", CompanyID: "A1" }],
  Retailers: [{ Name: "Amazon", CompanyID: "" }],
  Importers: [],
  Distributors: [],
  SoldAtLabel: null,
  ManufacturerCountries: [{ Country: "China" }],
  ProductUPCs: [],
  Hazards: [{ Name: "Choking hazard", HazardType: "", HazardTypeID: "" }],
  Remedies: [{ Name: "Full refund" }],
  RemedyOptions: [{ Option: "Refund" }],
};

const samplePenalty: Penalty = {
  RecallNo: "25048",
  Firm: "Test Corp",
  PenaltyType: "Civil",
  PenaltyDate: "2024-11-18T00:00:00",
  Act: "CPSA",
  Fine: "$1,000,000.00",
  FiscalYear: "2025",
  ReleaseTitle: "Test penalty",
  ReleaseURL: "https://cpsc.gov/test",
  PenaltyID: 1,
  CompanyID: null,
  ProductTypes: [{ Type: "Toys", CategoryID: "123" }],
};

describe("wrapResponse recalls", () => {
  it("produces correct kind", () => {
    const result = wrapResponse([sampleRecall], "recalls");
    expect(result.kind).toBe("recalls");
    expect(result.data).toHaveLength(1);
  });

  it("toMarkdown contains recall number and title", () => {
    const result = wrapResponse([sampleRecall], "recalls");
    const md = result.toMarkdown();
    expect(md).toContain("25112");
    expect(md).toContain("Test Recall");
    expect(md).toContain("Widget");
    expect(md).toContain("Refund");
    expect(md).toContain("China");
  });

  it("toMarkdown escapes pipe characters", () => {
    const recall = { ...sampleRecall, Title: "A | B recall" };
    const result = wrapResponse([recall], "recalls");
    const md = result.toMarkdown();
    expect(md).toContain("A \\| B recall");
  });

  it("toCSV contains header and data", () => {
    const result = wrapResponse([sampleRecall], "recalls");
    const csv = result.toCSV();
    expect(csv).toContain("RecallNumber");
    expect(csv).toContain("25112");
    expect(csv).toContain("Test Recall");
  });

  it("summary shows count", () => {
    const result = wrapResponse([sampleRecall, sampleRecall], "recalls");
    expect(result.summary()).toBe("recalls: 2 results");
  });

  it("handles empty array", () => {
    const result = wrapResponse([], "recalls");
    expect(result.toMarkdown()).toBe("(no data)");
    expect(result.toCSV()).toBe("");
  });

  it("truncates long hazard text in markdown", () => {
    const longHazard = "A".repeat(200);
    const recall = {
      ...sampleRecall,
      Hazards: [{ Name: longHazard, HazardType: "", HazardTypeID: "" }],
    };
    const result = wrapResponse([recall], "recalls");
    const md = result.toMarkdown();
    expect(md).toContain("...");
    expect(md).not.toContain(longHazard);
  });
});

describe("wrapResponse penalties", () => {
  it("produces correct kind and data", () => {
    const result = wrapResponse([samplePenalty], "penalties");
    expect(result.kind).toBe("penalties");
    expect(result.data).toHaveLength(1);
  });

  it("toMarkdown contains firm and fine", () => {
    const result = wrapResponse([samplePenalty], "penalties");
    const md = result.toMarkdown();
    expect(md).toContain("Test Corp");
    expect(md).toContain("$1,000,000.00");
  });

  it("summary shows count", () => {
    const result = wrapResponse([samplePenalty], "penalties");
    expect(result.summary()).toBe("penalties: 1 results");
  });
});

describe("wrapResponse penalty_companies", () => {
  it("wraps string array", () => {
    const result = wrapResponse(["Acme", "Beta"], "penalty_companies");
    expect(result.kind).toBe("penalty_companies");
    expect(result.data).toEqual(["Acme", "Beta"]);
    expect(result.toMarkdown()).toContain("Acme");
  });
});

describe("wrapResponse penalty_products", () => {
  it("wraps product type array", () => {
    const products: PenaltyProductType[] = [{ Type: "Toys", CategoryID: "123" }];
    const result = wrapResponse(products, "penalty_products");
    expect(result.kind).toBe("penalty_products");
    expect(result.toMarkdown()).toContain("Toys");
  });
});

describe("wrapResponse penalty_years", () => {
  it("wraps year string array", () => {
    const result = wrapResponse(["2024", "2025"], "penalty_years");
    expect(result.kind).toBe("penalty_years");
    expect(result.toMarkdown()).toContain("2025");
  });
});
