import { describe, it, expect, afterEach } from "bun:test";
import { recalls, penalties, penaltyCompanies, penaltyProducts, penaltyYears, cpsc } from "../src/endpoints";
import { cpscPlugin } from "../src/plugin";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function mockFetch(body: unknown) {
  globalThis.fetch = (async () =>
    new Response(JSON.stringify(body), { status: 200 })) as unknown as typeof fetch;
}

const recallFixture = [
  {
    RecallID: 10141,
    RecallNumber: "25112",
    RecallDate: "2025-01-30T00:00:00",
    Description: "Test recall",
    URL: "https://www.cpsc.gov/Recalls/2025/test",
    Title: "Test Recall Title",
    ConsumerContact: "test@test.com",
    LastPublishDate: "2025-01-30T00:00:00",
    Products: [{ Name: "Test Product", Description: "", Model: "", Type: "", CategoryID: "", NumberOfUnits: "100" }],
    Inconjunctions: [],
    Images: [],
    Injuries: [{ Name: "None reported" }],
    Manufacturers: [],
    Retailers: [{ Name: "Amazon", CompanyID: "" }],
    Importers: [],
    Distributors: [],
    SoldAtLabel: null,
    ManufacturerCountries: [{ Country: "China" }],
    ProductUPCs: [],
    Hazards: [{ Name: "Test hazard", HazardType: "", HazardTypeID: "" }],
    Remedies: [{ Name: "Test remedy" }],
    RemedyOptions: [{ Option: "Refund" }],
  },
];

const penaltyFixture = [
  {
    RecallNo: "25048",
    Firm: "Test Corp",
    PenaltyType: "Civil",
    PenaltyDate: "2024-11-18T00:00:00",
    Act: "CPSA",
    Fine: "$1,000,000.00",
    FiscalYear: "2025",
    ReleaseTitle: "Test penalty",
    ReleaseURL: "https://www.cpsc.gov/test",
    PenaltyID: 1,
    CompanyID: null,
    ProductTypes: [{ Type: "Toys", CategoryID: "123" }],
  },
];

describe("recalls", () => {
  it("returns parsed recalls with no params", async () => {
    mockFetch(recallFixture);
    const result = await recalls();
    expect(result.kind).toBe("recalls");
    expect(result.data).toHaveLength(1);
    expect(result.data[0].RecallNumber).toBe("25112");
  });

  it("returns parsed recalls with date range", async () => {
    mockFetch(recallFixture);
    const result = await recalls({ RecallDateStart: "2025-01-01", RecallDateEnd: "2025-01-31" });
    expect(result.kind).toBe("recalls");
    expect(result.data).toHaveLength(1);
  });

  it("returns parsed recalls with RecallID", async () => {
    mockFetch(recallFixture);
    const result = await recalls({ RecallID: 10141 });
    expect(result.kind).toBe("recalls");
    expect(result.data).toHaveLength(1);
  });

  it("rejects unknown params", async () => {
    mockFetch(recallFixture);
    await expect(recalls({ badParam: "x" } as any)).rejects.toThrow();
  });

  it("toMarkdown returns table", async () => {
    mockFetch(recallFixture);
    const result = await recalls();
    const md = result.toMarkdown();
    expect(md).toContain("Recall #");
    expect(md).toContain("25112");
    expect(md).toContain("Test Recall Title");
  });

  it("toCSV returns CSV", async () => {
    mockFetch(recallFixture);
    const result = await recalls();
    const csv = result.toCSV();
    expect(csv).toContain("RecallNumber");
    expect(csv).toContain("25112");
  });
});

describe("penalties", () => {
  it("returns parsed penalties", async () => {
    mockFetch(penaltyFixture);
    const result = await penalties();
    expect(result.kind).toBe("penalties");
    expect(result.data).toHaveLength(1);
    expect(result.data[0].Firm).toBe("Test Corp");
  });

  it("accepts penaltytype param", async () => {
    mockFetch(penaltyFixture);
    const result = await penalties({ penaltytype: "criminal" });
    expect(result.kind).toBe("penalties");
  });

  it("rejects invalid penaltytype", async () => {
    mockFetch(penaltyFixture);
    await expect(penalties({ penaltytype: "invalid" as any })).rejects.toThrow();
  });
});

describe("penaltyCompanies", () => {
  it("returns company names", async () => {
    mockFetch(["Company A", "Company B"]);
    const result = await penaltyCompanies();
    expect(result.kind).toBe("penalty_companies");
    expect(result.data).toHaveLength(2);
    expect(result.data[0]).toBe("Company A");
  });
});

describe("penaltyProducts", () => {
  it("returns product types", async () => {
    mockFetch([{ Type: "Toys", CategoryID: "123" }]);
    const result = await penaltyProducts();
    expect(result.kind).toBe("penalty_products");
    expect(result.data).toHaveLength(1);
    expect(result.data[0].Type).toBe("Toys");
  });
});

describe("penaltyYears", () => {
  it("returns fiscal years", async () => {
    mockFetch(["2024", "2025"]);
    const result = await penaltyYears();
    expect(result.kind).toBe("penalty_years");
    expect(result.data).toHaveLength(2);
  });
});

describe("createCpsc singleton", () => {
  it("cpsc.recalls works", async () => {
    mockFetch(recallFixture);
    const result = await cpsc.recalls();
    expect(result.kind).toBe("recalls");
  });

  it("cpsc.penalties works", async () => {
    mockFetch(penaltyFixture);
    const result = await cpsc.penalties();
    expect(result.kind).toBe("penalties");
  });

  it("cpsc.describe returns endpoints", () => {
    const desc = cpsc.describe();
    expect(desc.endpoints.length).toBe(5);
  });
});

describe("cpscPlugin", () => {
  it("has all endpoints matching describe()", () => {
    const desc = cpscPlugin.describe();
    for (const ep of desc.endpoints) {
      expect(cpscPlugin.endpoints[ep.name]).toBeDefined();
    }
  });

  it("recalls endpoint works via plugin", async () => {
    mockFetch(recallFixture);
    const result = await cpscPlugin.endpoints.recalls();
    expect(result.kind).toBe("recalls");
  });

  it("penalties endpoint works via plugin", async () => {
    mockFetch(penaltyFixture);
    const result = await cpscPlugin.endpoints.penalties();
    expect(result.kind).toBe("penalties");
  });

  it("penalty_companies endpoint works via plugin", async () => {
    mockFetch(["A", "B"]);
    const result = await cpscPlugin.endpoints["penalty_companies"]();
    expect(result.kind).toBe("penalty_companies");
  });
});
