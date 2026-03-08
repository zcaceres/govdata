import { describe, expect, test, afterEach } from "bun:test";
import { dolPlugin } from "../src/plugin.js";
import { AGENCIES } from "../src/datasets.js";
import accidentFixture from "./fixtures/msha-accident.json";

const originalFetch = globalThis.fetch;
const originalEnv = process.env.DOL_API_KEY;

function mockFetch(body: unknown) {
  globalThis.fetch = (async () =>
    new Response(JSON.stringify(body), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })) as typeof fetch;
}

afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalEnv) {
    process.env.DOL_API_KEY = originalEnv;
  } else {
    delete process.env.DOL_API_KEY;
  }
});

describe("dolPlugin", () => {
  test("has prefix 'dol'", () => {
    expect(dolPlugin.prefix).toBe("dol");
  });

  test("describe() returns endpoints for all 42 datasets", () => {
    const desc = dolPlugin.describe();
    let expectedCount = 0;
    for (const epList of Object.values(AGENCIES)) {
      expectedCount += epList.length;
    }
    expect(desc.endpoints).toHaveLength(expectedCount);
  });

  test("every described endpoint has a matching function", () => {
    const desc = dolPlugin.describe();
    for (const endpoint of desc.endpoints) {
      expect(typeof dolPlugin.endpoints[endpoint.name]).toBe("function");
    }
  });

  test("no endpoint functions exist without describe() metadata", () => {
    const desc = dolPlugin.describe();
    const describedNames = new Set(desc.endpoints.map((e) => e.name));
    for (const name of Object.keys(dolPlugin.endpoints)) {
      expect(describedNames.has(name)).toBe(true);
    }
  });

  test("endpoint names use agency_endpoint format", () => {
    const desc = dolPlugin.describe();
    for (const endpoint of desc.endpoints) {
      expect(endpoint.name).toMatch(/^[a-z]+_/);
    }
    // Verify specific known endpoints
    const names = desc.endpoints.map((e) => e.name);
    expect(names).toContain("msha_accident");
    expect(names).toContain("osha_inspection");
    expect(names).toContain("whd_enforcement");
    expect(names).toContain("ebsa_ocats");
  });

  test("every endpoint has shared query params", () => {
    const desc = dolPlugin.describe();
    for (const endpoint of desc.endpoints) {
      const paramNames = endpoint.params.map((p) => p.name);
      expect(paramNames).toContain("limit");
      expect(paramNames).toContain("offset");
      expect(paramNames).toContain("fields");
      expect(paramNames).toContain("sort");
      expect(paramNames).toContain("sort_by");
      expect(paramNames).toContain("filter");
    }
  });

  test("endpoint descriptions have required fields", () => {
    const desc = dolPlugin.describe();
    for (const endpoint of desc.endpoints) {
      expect(typeof endpoint.name).toBe("string");
      expect(typeof endpoint.path).toBe("string");
      expect(typeof endpoint.description).toBe("string");
      expect(endpoint.params).toBeInstanceOf(Array);
      expect(endpoint.responseFields).toBeDefined();
    }
  });
});

describe("dolPlugin endpoint dispatch", () => {
  test("throws without DOL_API_KEY", async () => {
    delete process.env.DOL_API_KEY;
    expect(dolPlugin.endpoints["msha_accident"]()).rejects.toThrow("DOL_API_KEY");
  });

  test("msha_accident returns GovResult", async () => {
    process.env.DOL_API_KEY = "test-key";
    mockFetch(accidentFixture);

    const result = await dolPlugin.endpoints["msha_accident"]({ limit: 10 });
    expect(result.data).toBeInstanceOf(Array);
    expect(result.kind).toBe("msha_accident");
    expect(typeof result.toMarkdown).toBe("function");
    expect(typeof result.toCSV).toBe("function");
    expect(typeof result.summary).toBe("function");
  });

  test("passes query params to fetch", async () => {
    process.env.DOL_API_KEY = "test-key";
    let capturedUrl = "";
    globalThis.fetch = (async (input: RequestInfo | URL) => {
      capturedUrl = typeof input === "string" ? input : input.toString();
      return new Response(JSON.stringify(accidentFixture), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }) as typeof fetch;

    await dolPlugin.endpoints["msha_accident"]({ limit: 5, offset: 10, sort: "asc", sort_by: "mine_id" });
    expect(capturedUrl).toContain("limit=5");
    expect(capturedUrl).toContain("offset=10");
    expect(capturedUrl).toContain("sort=asc");
    expect(capturedUrl).toContain("sort_by=mine_id");
  });

  test("formats GovResult output without errors", async () => {
    process.env.DOL_API_KEY = "test-key";
    mockFetch(accidentFixture);

    const result = await dolPlugin.endpoints["msha_accident"]();
    const md = result.toMarkdown();
    const csv = result.toCSV();
    const summary = result.summary();
    expect(typeof md).toBe("string");
    expect(typeof csv).toBe("string");
    expect(summary).toContain("msha_accident");
  });
});
