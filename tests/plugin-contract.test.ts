import { describe, it, expect } from "bun:test";
import { dogePlugin } from "doge-api";
import { naicsPlugin } from "naics-api";
import { dolPlugin } from "dol-open-data-api";
import { usaspendingPlugin } from "usaspending-api";
import { federalRegisterPlugin } from "federal-register";
import { blsPlugin } from "bls-api";
import type { GovDataPlugin, GovResult, EndpointDescription } from "govdata-core";

/**
 * Plugin contract tests — verify every registered plugin satisfies the
 * GovDataPlugin interface and its describe() metadata is internally consistent.
 * Add each new plugin to the `plugins` array below.
 */
const plugins: GovDataPlugin[] = [dogePlugin, naicsPlugin, dolPlugin, usaspendingPlugin, federalRegisterPlugin, blsPlugin];

for (const plugin of plugins) {
  describe(`plugin contract: ${plugin.prefix}`, () => {
    it("has a non-empty prefix", () => {
      expect(plugin.prefix).toBeTruthy();
      expect(typeof plugin.prefix).toBe("string");
    });

    it("describe() returns endpoints array", () => {
      const desc = plugin.describe();
      expect(desc.endpoints).toBeInstanceOf(Array);
      expect(desc.endpoints.length).toBeGreaterThan(0);
    });

    it("every described endpoint has a matching function", () => {
      const desc = plugin.describe();
      for (const endpoint of desc.endpoints) {
        expect(plugin.endpoints[endpoint.name]).toBeDefined();
        expect(typeof plugin.endpoints[endpoint.name]).toBe("function");
      }
    });

    it("no endpoint functions exist without describe() metadata", () => {
      const desc = plugin.describe();
      const describedNames = new Set(desc.endpoints.map((e) => e.name));
      for (const name of Object.keys(plugin.endpoints)) {
        expect(describedNames.has(name)).toBe(true);
      }
    });

    it("every endpoint description has required fields", () => {
      const desc = plugin.describe();
      for (const endpoint of desc.endpoints) {
        expect(typeof endpoint.name).toBe("string");
        expect(typeof endpoint.path).toBe("string");
        expect(typeof endpoint.description).toBe("string");
        expect(endpoint.params).toBeInstanceOf(Array);
        expect(endpoint.responseFields).toBeDefined();
      }
    });

    it("every param description has required fields", () => {
      const desc = plugin.describe();
      for (const endpoint of desc.endpoints) {
        for (const param of endpoint.params) {
          expect(typeof param.name).toBe("string");
          expect(typeof param.type).toBe("string");
          expect(typeof param.required).toBe("boolean");
          if (param.values !== undefined) {
            expect(param.values).toBeInstanceOf(Array);
            expect(param.values.length).toBeGreaterThan(0);
          }
        }
      }
    });
  });
}
