import { describe as desc, it, expect } from "bun:test";
import { describe } from "../src/describe";

desc("describe()", () => {
  it("returns all 5 endpoints", () => {
    const result = describe();
    expect(result.endpoints).toHaveLength(5);
    const names = result.endpoints.map((e) => e.name);
    expect(names).toEqual(["grants", "contracts", "leases", "payments", "statistics"]);
  });

  it("includes param details with enum values", () => {
    const result = describe();
    const grants = result.endpoints.find((e) => e.name === "grants")!;
    const sortBy = grants.params.find((p) => p.name === "sort_by")!;
    expect(sortBy.values).toEqual(["savings", "value", "date"]);
    expect(sortBy.required).toBe(false);
  });

  it("payments has filter params", () => {
    const result = describe();
    const payments = result.endpoints.find((e) => e.name === "payments")!;
    const filter = payments.params.find((p) => p.name === "filter");
    expect(filter).toBeDefined();
  });

  it("statistics has no params", () => {
    const result = describe();
    const stats = result.endpoints.find((e) => e.name === "statistics")!;
    expect(stats.params).toHaveLength(0);
  });

  it("includes response fields for list endpoints", () => {
    const result = describe();
    const grants = result.endpoints.find((e) => e.name === "grants")!;
    expect(grants.responseFields).toContain("agency");
    expect(grants.responseFields).toContain("savings");
  });

  it("statistics responseFields describes sub-structures", () => {
    const result = describe();
    const stats = result.endpoints.find((e) => e.name === "statistics")!;
    const fields = stats.responseFields as Record<string, string[]>;
    expect(fields.agency).toEqual(["agency_name", "count"]);
    expect(fields.request_date).toEqual(["date", "count"]);
    expect(fields.org_names).toEqual(["org_name", "count"]);
  });
});
