import { describe, it, expect } from "bun:test";
import { describe as cpscDescribe } from "../src/describe";

describe("describe()", () => {
  it("returns 5 endpoints", () => {
    const { endpoints } = cpscDescribe();
    expect(endpoints).toHaveLength(5);
  });

  it("has correct endpoint names", () => {
    const { endpoints } = cpscDescribe();
    const names = endpoints.map((e) => e.name);
    expect(names).toContain("recalls");
    expect(names).toContain("penalties");
    expect(names).toContain("penalty_companies");
    expect(names).toContain("penalty_products");
    expect(names).toContain("penalty_years");
  });

  it("every endpoint has required fields", () => {
    const { endpoints } = cpscDescribe();
    for (const ep of endpoints) {
      expect(typeof ep.name).toBe("string");
      expect(typeof ep.path).toBe("string");
      expect(typeof ep.description).toBe("string");
      expect(ep.params).toBeInstanceOf(Array);
      expect(ep.responseFields).toBeDefined();
    }
  });

  it("recalls endpoint has date params", () => {
    const { endpoints } = cpscDescribe();
    const recalls = endpoints.find((e) => e.name === "recalls")!;
    const paramNames = recalls.params.map((p) => p.name);
    expect(paramNames).toContain("RecallDateStart");
    expect(paramNames).toContain("RecallDateEnd");
    expect(paramNames).toContain("RecallID");
    expect(paramNames).toContain("ProductName");
  });

  it("penalty endpoints have penaltytype param", () => {
    const { endpoints } = cpscDescribe();
    for (const ep of endpoints.filter((e) => e.name.startsWith("penalty"))) {
      const paramNames = ep.params.map((p) => p.name);
      expect(paramNames).toContain("penaltytype");
    }
  });
});
