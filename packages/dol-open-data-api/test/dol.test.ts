import { describe, expect, test, afterEach } from "bun:test";
import { createDol } from "../src/dol.js";
import accidentFixture from "./fixtures/msha-accident.json";

const originalFetch = globalThis.fetch;

function mockFetch(handler: (url: string) => unknown) {
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = typeof input === "string" ? input : input.toString();
    const body = handler(url);
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;
}

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("createDol", () => {
  test("dol.msha.accident exists and is callable", async () => {
    mockFetch(() => accidentFixture);
    const dol = createDol({ apiKey: "test-key" });
    expect(typeof dol.msha.accident).toBe("function");
    const result = await dol.msha.accident({ limit: 10 });
    expect(result.data).toHaveLength(3);
    expect(result.agency).toBe("MSHA");
    expect(result.endpoint).toBe("accident");
  });

  test("response has helper methods", async () => {
    mockFetch(() => accidentFixture);
    const dol = createDol({ apiKey: "test-key" });
    const result = await dol.msha.accident({ limit: 3 });
    expect(result.toMarkdown()).toContain("| mine_id");
    expect(result.toCSV()).toContain("mine_id,");
    expect(result.summary()).toContain("MSHA/accident");
    expect(result.summary()).toContain("3 rows");
  });

  test("dol.msha.accident.pages is a function", () => {
    const dol = createDol({ apiKey: "test-key" });
    expect(typeof dol.msha.accident.pages).toBe("function");
  });

  test("dol.msha.accident.describe is a function", () => {
    const dol = createDol({ apiKey: "test-key" });
    expect(typeof dol.msha.accident.describe).toBe("function");
  });

  test("all agencies and endpoints are present", () => {
    const dol = createDol({ apiKey: "test-key" });
    expect(typeof dol.msha.accident).toBe("function");
    expect(typeof dol.msha.mines).toBe("function");
    expect(typeof dol.osha.inspection).toBe("function");
    expect(typeof dol.osha.accident_lookup2).toBe("function");
    expect(typeof dol.whd.enforcement).toBe("function");
    expect(typeof dol.ilab.Child_Labor_Report__2016_to_2022).toBe("function");
    expect(typeof dol.wb.ndcp).toBe("function");
    expect(typeof dol.ebsa.ocats).toBe("function");
    expect(typeof dol.eta.ui_national_weekly_claims).toBe("function");
    expect(typeof dol.vets["4212"]).toBe("function");
    expect(typeof dol.trng.training_dataset_industries).toBe("function");
  });

  test("end-to-end: pages yields wrapped results", async () => {
    let callCount = 0;
    mockFetch(() => {
      callCount++;
      if (callCount === 1) return accidentFixture;
      return { data: [] };
    });

    const dol = createDol({ apiKey: "test-key" });
    const pages = [];
    for await (const page of dol.msha.accident.pages({ limit: 100 }, 3)) {
      pages.push(page);
    }
    expect(pages.length).toBeGreaterThanOrEqual(1);
    expect(pages[0].agency).toBe("MSHA");
  });
});
