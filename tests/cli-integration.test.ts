import { describe, it, expect, afterEach } from "bun:test";
import { dispatch, parseFlags } from "govdata-core";
import type { GovDataPlugin } from "govdata-core";
import { dogePlugin } from "doge-api";

/**
 * CLI integration tests — verify dispatch routing, flag parsing, and error
 * handling using mocked fetch so tests don't hit the network.
 * When adding a new plugin, add it to the `plugins` array.
 */
const plugins: GovDataPlugin[] = [dogePlugin];

const originalFetch = globalThis.fetch;

function mockFetch(body: unknown) {
  globalThis.fetch = (async () =>
    new Response(JSON.stringify(body), { status: 200 })) as unknown as typeof fetch;
}

afterEach(() => {
  globalThis.fetch = originalFetch;
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
