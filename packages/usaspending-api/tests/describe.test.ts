import { describe, it, expect } from "bun:test";
import { describe as describeEndpoints } from "../src/describe";
import { usaspendingPlugin } from "../src/plugin";

describe("describe()", () => {
  it("returns endpoint array", () => {
    const { endpoints } = describeEndpoints();
    expect(endpoints).toBeInstanceOf(Array);
    expect(endpoints.length).toBe(137);
  });

  it("every endpoint has required fields", () => {
    const { endpoints } = describeEndpoints();
    for (const ep of endpoints) {
      expect(typeof ep.name).toBe("string");
      expect(typeof ep.path).toBe("string");
      expect(typeof ep.description).toBe("string");
      expect(ep.params).toBeInstanceOf(Array);
      expect(ep.responseFields).toBeDefined();
      expect(ep.responseFields.length).toBeGreaterThan(0);
    }
  });

  it("every param has required fields", () => {
    const { endpoints } = describeEndpoints();
    for (const ep of endpoints) {
      for (const p of ep.params) {
        expect(typeof p.name).toBe("string");
        expect(typeof p.type).toBe("string");
        expect(typeof p.required).toBe("boolean");
      }
    }
  });

  it("every described endpoint has a matching plugin function", () => {
    const { endpoints } = describeEndpoints();
    for (const ep of endpoints) {
      expect(typeof usaspendingPlugin.endpoints[ep.name]).toBe("function");
    }
  });

  it("no plugin functions without describe metadata", () => {
    const { endpoints } = describeEndpoints();
    const names = new Set(endpoints.map((e) => e.name));
    for (const name of Object.keys(usaspendingPlugin.endpoints)) {
      expect(names.has(name)).toBe(true);
    }
  });
});
