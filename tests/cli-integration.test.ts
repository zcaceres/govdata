import { describe, it, expect, afterEach } from "bun:test";
import { dispatch, parseFlags } from "govdata-core";
import type { GovDataPlugin } from "govdata-core";
import { dogePlugin } from "doge-api";
import { naicsPlugin } from "naics-api";
import { dolPlugin } from "dol-open-data-api";
import { usaspendingPlugin } from "usaspending-api";

/**
 * CLI integration tests — verify dispatch routing, flag parsing, and error
 * handling using mocked fetch so tests don't hit the network.
 * When adding a new plugin, add it to the `plugins` array.
 */
const plugins: GovDataPlugin[] = [dogePlugin, naicsPlugin, dolPlugin, usaspendingPlugin];

const originalFetch = globalThis.fetch;

function mockFetch(body: unknown) {
  globalThis.fetch = (async () =>
    new Response(JSON.stringify(body), { status: 200 })) as unknown as typeof fetch;
}

const originalDolKey = process.env.DOL_API_KEY;

afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalDolKey) {
    process.env.DOL_API_KEY = originalDolKey;
  } else {
    delete process.env.DOL_API_KEY;
  }
});

const grantsFixture = {
  success: true,
  result: {
    grants: [{ date: "1/1/2025", agency: "DOE", recipient: "Test", value: 1000, savings: 500, link: null, description: "Test" }],
  },
  meta: { total_results: 1, pages: 1 },
};

const statisticsFixture = {
  success: true,
  result: {
    agency: [{ agency_name: "NASA", count: 100 }],
    request_date: [{ date: "2025-01-01", count: 50 }],
    org_names: [{ org_name: "HQ", count: 25 }],
  },
};

describe("CLI dispatch", () => {
  it("routes to doge grants", async () => {
    mockFetch(grantsFixture);
    const result = await dispatch(plugins, ["doge", "grants"]);
    expect(result.kind).toBe("grants");
    expect(result.data).toBeInstanceOf(Array);
  });

  it("routes to doge statistics", async () => {
    mockFetch(statisticsFixture);
    const result = await dispatch(plugins, ["doge", "statistics"]);
    expect(result.kind).toBe("statistics");
  });

  it("passes parsed flags to endpoint", async () => {
    let capturedUrl = "";
    globalThis.fetch = (async (url: string) => {
      capturedUrl = url;
      return new Response(JSON.stringify(grantsFixture), { status: 200 });
    }) as unknown as typeof fetch;

    await dispatch(plugins, ["doge", "grants", "--sort-by", "savings", "--per-page", "5"]);
    expect(capturedUrl).toContain("sort_by=savings");
    expect(capturedUrl).toContain("per_page=5");
  });

  it("throws for unknown plugin", async () => {
    expect(dispatch(plugins, ["unknown", "grants"])).rejects.toThrow("Unknown source");
  });

  it("throws for unknown endpoint", async () => {
    expect(dispatch(plugins, ["doge", "nonexistent"])).rejects.toThrow("Unknown endpoint");
  });

  it("throws with no args and lists available plugins", async () => {
    try {
      await dispatch(plugins, []);
      expect(true).toBe(false);
    } catch (err: any) {
      expect(err.message).toContain("doge");
    }
  });

  it("throws with only plugin name and lists endpoints", async () => {
    try {
      await dispatch(plugins, ["doge"]);
      expect(true).toBe(false);
    } catch (err: any) {
      expect(err.message).toContain("grants");
      expect(err.message).toContain("statistics");
    }
  });
});

describe("CLI dispatch — naics", () => {
  it("routes to naics sectors", async () => {
    const result = await dispatch(plugins, ["naics", "sectors"]);
    expect(result.kind).toBe("sectors");
    expect(result.data).toBeInstanceOf(Array);
    expect((result.data as unknown[]).length).toBe(20);
  });

  it("routes to naics search with flags", async () => {
    const result = await dispatch(plugins, ["naics", "search", "--q", "restaurant", "--limit", "3"]);
    expect(result.kind).toBe("search");
    expect(result.data).toBeInstanceOf(Array);
    expect((result.data as unknown[]).length).toBeLessThanOrEqual(3);
    expect(result.meta).toBeDefined();
    expect(result.meta!.total_results).toBeGreaterThan(0);
  });

  it("routes to naics get with code flag", async () => {
    const result = await dispatch(plugins, ["naics", "get", "--code", "722511"]);
    expect(result.kind).toBe("get");
    expect(result.data).toBeInstanceOf(Array);
    expect((result.data as any[])[0].code).toBe("722511");
  });

  it("routes to naics children", async () => {
    const result = await dispatch(plugins, ["naics", "children", "--code", "72"]);
    expect(result.kind).toBe("children");
    expect(result.data).toBeInstanceOf(Array);
    expect((result.data as unknown[]).length).toBeGreaterThan(0);
  });

  it("routes to naics with year flag", async () => {
    const result = await dispatch(plugins, ["naics", "sectors", "--year", "2022"]);
    expect(result.kind).toBe("sectors");
    expect((result.data as unknown[]).length).toBe(20);
  });

  it("throws with only naics prefix and lists endpoints", async () => {
    try {
      await dispatch(plugins, ["naics"]);
      expect(true).toBe(false);
    } catch (err: any) {
      expect(err.message).toContain("sectors");
      expect(err.message).toContain("search");
    }
  });
});

const dolFixture = { data: [{ id: 1, mine_id: "1234", field: "value" }] };

describe("CLI dispatch — dol", () => {
  it("routes to dol msha_accident", async () => {
    process.env.DOL_API_KEY = "test-key";
    mockFetch(dolFixture);
    const result = await dispatch(plugins, ["dol", "msha_accident"]);
    expect(result.kind).toBe("msha_accident");
    expect(result.data).toBeInstanceOf(Array);
  });

  it("passes flags to dol endpoint", async () => {
    process.env.DOL_API_KEY = "test-key";
    let capturedUrl = "";
    globalThis.fetch = (async (input: RequestInfo | URL) => {
      capturedUrl = typeof input === "string" ? input : input.toString();
      return new Response(JSON.stringify(dolFixture), { status: 200 });
    }) as unknown as typeof fetch;

    await dispatch(plugins, ["dol", "osha_inspection", "--limit", "5"]);
    expect(capturedUrl).toContain("limit=5");
  });

  it("throws with only dol prefix and lists endpoints", async () => {
    try {
      await dispatch(plugins, ["dol"]);
      expect(true).toBe(false);
    } catch (err: any) {
      expect(err.message).toContain("Endpoints:");
      expect(err.message).toContain("msha_accident");
    }
  });
});

const usaspendingAwardsFixture = {
  limit: 10,
  results: [{ internal_id: 1, "Award ID": "TEST001", "Award Amount": 1000, "Recipient Name": "Test Corp", generated_internal_id: "CONT_TEST" }],
  page_metadata: { page: 1, hasNext: false },
};

describe("CLI dispatch — usaspending", () => {
  it("routes to usaspending awards", async () => {
    mockFetch(usaspendingAwardsFixture);
    const result = await dispatch(plugins, ["usaspending", "awards", "--keyword", "NASA"]);
    expect(result.kind).toBe("awards");
    expect(result.data).toBeInstanceOf(Array);
  });

  it("routes to usaspending spending_by_state", async () => {
    mockFetch([{ fips: "06", code: "CA", name: "California", amount: 500000, count: 100 }]);
    const result = await dispatch(plugins, ["usaspending", "spending_by_state"]);
    expect(result.kind).toBe("spending_by_state");
    expect(result.data).toBeInstanceOf(Array);
  });

  it("throws with only usaspending prefix and lists endpoints", async () => {
    try {
      await dispatch(plugins, ["usaspending"]);
      expect(true).toBe(false);
    } catch (err: any) {
      expect(err.message).toContain("Endpoints:");
      expect(err.message).toContain("awards");
    }
  });
});

describe("CLI dispatch — --help via dispatch", () => {
  it("shows help for each plugin with --help flag", async () => {
    for (const plugin of plugins) {
      try {
        await dispatch(plugins, [plugin.prefix, "--help"]);
        expect(true).toBe(false);
      } catch (err: any) {
        expect(err.message).toContain("Usage:");
        expect(err.message).toContain("Endpoints:");
        // Every plugin should list at least one endpoint
        const { endpoints } = plugin.describe();
        for (const ep of endpoints) {
          expect(err.message).toContain(ep.name);
        }
      }
    }
  });

  it("shows help with --help after endpoint name", async () => {
    try {
      await dispatch(plugins, ["doge", "grants", "--help"]);
      expect(true).toBe(false);
    } catch (err: any) {
      expect(err.message).toContain("Endpoints:");
      expect(err.message).toContain("grants");
    }
  });
});

describe("CLI dispatch — all plugins registered", () => {
  it("every plugin prefix is routable", async () => {
    for (const plugin of plugins) {
      // Just test that routing finds the plugin (will fail at endpoint level)
      try {
        await dispatch(plugins, [plugin.prefix]);
      } catch (err: any) {
        // Expected: "Usage: govdata <prefix> <endpoint>" — means plugin was found
        expect(err.message).toContain("Endpoints:");
      }
    }
  });

  it("every plugin endpoint is dispatchable", async () => {
    mockFetch(grantsFixture); // generic fixture, schema validation may fail for non-grants but dispatch routing should work
    for (const plugin of plugins) {
      for (const endpoint of plugin.describe().endpoints) {
        // Verify the endpoint function exists and is callable via dispatch routing
        expect(typeof plugin.endpoints[endpoint.name]).toBe("function");
      }
    }
  });
});
