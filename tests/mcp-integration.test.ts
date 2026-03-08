import { describe, it, expect, afterEach } from "bun:test";
import { buildSchemaFromParams } from "govdata-core";
import type { GovDataPlugin } from "govdata-core";
import { dogePlugin } from "doge-api";
import { naicsPlugin } from "naics-api";
import { dolPlugin } from "dol-open-data-api";
import { usaspendingPlugin } from "usaspending-api";
import { z } from "zod";

/**
 * MCP integration tests — verify tool registration logic, schema generation
 * from describe() metadata, and tool dispatch for all plugins.
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

describe("MCP schema generation", () => {
  for (const plugin of plugins) {
    describe(`plugin: ${plugin.prefix}`, () => {
      it("generates valid Zod schemas for every endpoint", () => {
        for (const endpoint of plugin.describe().endpoints) {
          const shape = buildSchemaFromParams(endpoint.params);

          // Shape should be a plain object of Zod schemas
          expect(typeof shape).toBe("object");

          // Every param should produce a key
          for (const param of endpoint.params) {
            expect(shape[param.name]).toBeDefined();
          }

          // Wrapping in z.object should not throw
          const schema = z.object(shape);
          expect(schema).toBeDefined();

          // Empty input should parse (all params are optional in doge)
          if (endpoint.params.every((p) => !p.required)) {
            const result = schema.safeParse({});
            expect(result.success).toBe(true);
          }
        }
      });

      it("enum params accept valid values", () => {
        for (const endpoint of plugin.describe().endpoints) {
          const shape = buildSchemaFromParams(endpoint.params);
          for (const param of endpoint.params) {
            if (param.values) {
              for (const value of param.values) {
                const schema = z.object({ [param.name]: shape[param.name] });
                const result = schema.safeParse({ [param.name]: value });
                expect(result.success).toBe(true);
              }
            }
          }
        }
      });

      it("enum params reject invalid values", () => {
        for (const endpoint of plugin.describe().endpoints) {
          const shape = buildSchemaFromParams(endpoint.params);
          for (const param of endpoint.params) {
            if (param.values) {
              const schema = z.object({ [param.name]: shape[param.name] });
              const result = schema.safeParse({ [param.name]: "__invalid__" });
              expect(result.success).toBe(false);
            }
          }
        }
      });
    });
  }
});

describe("MCP tool naming", () => {
  it("generates unique tool names across all plugins", () => {
    const names = new Set<string>();
    for (const plugin of plugins) {
      for (const endpoint of plugin.describe().endpoints) {
        const toolName = `${plugin.prefix}_${endpoint.name}`;
        expect(names.has(toolName)).toBe(false);
        names.add(toolName);
      }
      // describe tool
      const describeName = `${plugin.prefix}_describe`;
      expect(names.has(describeName)).toBe(false);
      names.add(describeName);
    }
  });

  it("all plugin prefixes are unique", () => {
    const prefixes = plugins.map((p) => p.prefix);
    expect(new Set(prefixes).size).toBe(prefixes.length);
  });
});

describe("MCP tool dispatch", () => {
  const grantsFixture = {
    success: true,
    result: {
      grants: [{ date: "1/1/2025", agency: "DOE", recipient: "Test", value: 1000, savings: 500, link: null, description: "Test" }],
    },
    meta: { total_results: 1, pages: 1 },
  };

  const contractsFixture = {
    success: true,
    result: {
      contracts: [{ piid: "X001", agency: "Navy", vendor: "Acme", value: 2000, description: "Test", fpds_status: "ACTIVE", fpds_link: null, deleted_date: null, savings: 500 }],
    },
    meta: { total_results: 1, pages: 1 },
  };

  const leasesFixture = {
    success: true,
    result: {
      leases: [{ date: "1/1/2025", location: "DC", sq_ft: 1000, description: "Test", value: 5000, savings: 200, agency: "GSA" }],
    },
    meta: { total_results: 1, pages: 1 },
  };

  const paymentsFixture = {
    success: true,
    result: {
      payments: [{ payment_date: "1/1/2025", payment_amt: 999, agency_name: "NASA", award_description: "Test", fain: null, recipient_justification: null, agency_lead_justification: null, org_name: "HQ", generated_unique_award_id: null }],
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

  const fixtures: Record<string, unknown> = {
    grants: grantsFixture,
    contracts: contractsFixture,
    leases: leasesFixture,
    payments: paymentsFixture,
    statistics: statisticsFixture,
  };

  const dolFixture = { data: [{ id: 1, field: "value", name: "test" }] };

  // USAspending fixtures (minimal valid shapes for each endpoint)
  const usaspendingFixtures: Record<string, unknown> = {
    awards: {
      limit: 10,
      results: [{ internal_id: 1, "Award ID": "TEST001", "Award Amount": 1000, "Recipient Name": "Test Corp", generated_internal_id: "CONT_TEST" }],
      page_metadata: { page: 1, hasNext: false },
    },
    award: {
      id: 1, generated_unique_award_id: "CONT_TEST", piid: "TEST001", category: "contract",
      type: "A", type_description: "Contract", description: "Test", total_obligation: 1000,
    },
    agency: {
      toptier_code: "080", name: "NASA", abbreviation: "NASA", fiscal_year: 2024,
    },
    spending_by_agency: {
      total: 100000, results: [{ amount: 50000, name: "Agency1", code: "001" }],
    },
    spending_by_state: [
      { fips: "06", code: "CA", name: "California", amount: 500000, count: 100 },
    ],
    spending_over_time: {
      group: "fiscal_year",
      results: [{ aggregated_amount: 100000, time_period: { fiscal_year: "2024" } }],
    },
  };

  const usaspendingTestParams: Record<string, Record<string, unknown>> = {
    awards: { keyword: "test" },
    award: { id: "CONT_TEST" },
    agency: { toptier_code: "080" },
    spending_by_agency: { type: "agency", fy: "2024", period: "12" },
    spending_by_state: {},
    spending_over_time: { group: "fiscal_year", keyword: "test" },
  };

  // Naics endpoints need params to call — provide test params per endpoint
  const naicsTestParams: Record<string, Record<string, unknown>> = {
    sectors: {},
    get: { code: "722511" },
    batch: { codes: "722511,722513" },
    children: { code: "72" },
    ancestors: { code: "722511" },
    descendants: { code: "72", limit: 5 },
    search: { q: "restaurant", limit: 3 },
    cross_references: { code: "722511" },
    index_entries: { code: "722511" },
  };

  for (const plugin of plugins) {
    for (const endpoint of plugin.describe().endpoints) {
      it(`${plugin.prefix}_${endpoint.name} returns a valid result`, async () => {
        let params: Record<string, unknown> | undefined;

        if (plugin.prefix === "naics") {
          params = naicsTestParams[endpoint.name];
          if (!params) return; // skip unknown naics endpoints
        } else if (plugin.prefix === "dol") {
          process.env.DOL_API_KEY = "test-key";
          mockFetch(dolFixture);
        } else if (plugin.prefix === "usaspending") {
          const fixture = usaspendingFixtures[endpoint.name];
          if (!fixture) return;
          mockFetch(fixture);
          params = usaspendingTestParams[endpoint.name];
        } else {
          const fixture = fixtures[endpoint.name];
          if (!fixture) return; // skip endpoints without fixtures
          mockFetch(fixture);
        }

        const fn = plugin.endpoints[endpoint.name];
        const result = params && Object.keys(params).length > 0
          ? await fn(params)
          : await fn();

        expect(result.kind).toBe(endpoint.name);
        expect(result.data).toBeDefined();
        expect(typeof result.toMarkdown).toBe("function");
        expect(typeof result.toCSV).toBe("function");
        expect(typeof result.summary).toBe("function");

        // Formatting should not throw
        const md = result.toMarkdown();
        const csv = result.toCSV();
        const summary = result.summary();
        expect(typeof md).toBe("string");
        expect(typeof csv).toBe("string");
        expect(typeof summary).toBe("string");
        expect(summary).toContain(endpoint.name);
      });
    }
  }
});
