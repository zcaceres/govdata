import { describe, it, expect } from "bun:test";
import { toNumber, buildFilters } from "../src/plugin-helpers";

describe("toNumber", () => {
  it("converts string to number", () => {
    expect(toNumber("42")).toBe(42);
  });

  it("passes through numbers", () => {
    expect(toNumber(42)).toBe(42);
  });

  it("returns undefined for null", () => {
    expect(toNumber(null)).toBeUndefined();
  });

  it("returns undefined for undefined", () => {
    expect(toNumber(undefined)).toBeUndefined();
  });

  it("returns undefined for non-numeric strings", () => {
    expect(toNumber("abc")).toBeUndefined();
  });

  it("returns undefined for NaN", () => {
    expect(toNumber(NaN)).toBeUndefined();
  });

  it("returns undefined for Infinity", () => {
    expect(toNumber(Infinity)).toBeUndefined();
  });

  it("handles float strings", () => {
    expect(toNumber("3.14")).toBe(3.14);
  });
});

describe("buildFilters", () => {
  it("converts keyword to keywords array", () => {
    const filters = buildFilters({ keyword: "NASA" });
    expect(filters.keywords).toEqual(["NASA"]);
  });

  it("converts start_date and end_date to time_period", () => {
    const filters = buildFilters({ start_date: "2024-01-01", end_date: "2024-12-31" });
    expect(filters.time_period).toEqual([{ start_date: "2024-01-01", end_date: "2024-12-31" }]);
  });

  it("uses default start_date when only end_date provided", () => {
    const filters = buildFilters({ end_date: "2024-12-31" });
    expect((filters.time_period as any)[0].start_date).toBe("2000-01-01");
  });

  it("uses default end_date when only start_date provided", () => {
    const filters = buildFilters({ start_date: "2024-01-01" });
    expect((filters.time_period as any)[0].end_date).toBe("2099-12-31");
  });

  it("converts award_type=contracts to codes", () => {
    const filters = buildFilters({ award_type: "contracts" });
    expect(filters.award_type_codes).toEqual(["A", "B", "C", "D"]);
  });

  it("converts award_type=grants to codes", () => {
    const filters = buildFilters({ award_type: "grants" });
    expect(filters.award_type_codes).toEqual(["02", "03", "04", "05"]);
  });

  it("converts award_type=loans to codes", () => {
    const filters = buildFilters({ award_type: "loans" });
    expect(filters.award_type_codes).toEqual(["07", "08"]);
  });

  it("converts agency to agencies array", () => {
    const filters = buildFilters({ agency: "Department of Defense" });
    expect(filters.agencies).toEqual([{
      type: "awarding", tier: "toptier", name: "Department of Defense",
    }]);
  });

  it("converts naics_code to require object", () => {
    const filters = buildFilters({ naics_code: "541330" });
    expect(filters.naics_codes).toEqual({ require: ["541330"] });
  });

  it("converts recipient to recipient_search_text", () => {
    const filters = buildFilters({ recipient: "Boeing" });
    expect(filters.recipient_search_text).toEqual(["Boeing"]);
  });

  it("converts state to place_of_performance_locations", () => {
    const filters = buildFilters({ state: "CA" });
    expect(filters.place_of_performance_locations).toEqual([{
      country: "USA", state: "CA",
    }]);
  });

  it("throws on invalid award_type", () => {
    expect(() => buildFilters({ award_type: "invalid_type" })).toThrow(
      "one of: contracts, idvs, grants, direct_payments, loans, other"
    );
  });

  it("ignores unknown params", () => {
    const filters = buildFilters({ unknown_param: "value" });
    expect(Object.keys(filters).length).toBe(0);
  });

  it("handles empty params", () => {
    const filters = buildFilters({});
    expect(Object.keys(filters).length).toBe(0);
  });

  it("handles multiple filters combined", () => {
    const filters = buildFilters({
      keyword: "test",
      award_type: "contracts",
      state: "TX",
    });
    expect(filters.keywords).toEqual(["test"]);
    expect(filters.award_type_codes).toEqual(["A", "B", "C", "D"]);
    expect(filters.place_of_performance_locations).toEqual([{ country: "USA", state: "TX" }]);
  });
});

