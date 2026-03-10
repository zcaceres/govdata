import { describe, expect, test } from "bun:test";
import { eq, neq, gt, lt, like, isIn, notIn, and, or, serializeFilter } from "../src/filters.js";

describe("filter builders", () => {
  test("eq creates condition", () => {
    expect(eq("state", "CA")).toEqual({ field: "state", operator: "eq", value: "CA" });
  });

  test("neq creates condition", () => {
    expect(neq("state", "CA")).toEqual({ field: "state", operator: "neq", value: "CA" });
  });

  test("gt creates condition", () => {
    expect(gt("year", 2020)).toEqual({ field: "year", operator: "gt", value: 2020 });
  });

  test("lt creates condition", () => {
    expect(lt("year", 2020)).toEqual({ field: "year", operator: "lt", value: 2020 });
  });

  test("like creates condition", () => {
    expect(like("name", "%mine%")).toEqual({ field: "name", operator: "like", value: "%mine%" });
  });

  test("isIn creates condition", () => {
    expect(isIn("state", ["CA", "NY"])).toEqual({ field: "state", operator: "in", value: ["CA", "NY"] });
  });

  test("notIn creates condition", () => {
    expect(notIn("state", ["CA", "NY"])).toEqual({ field: "state", operator: "not_in", value: ["CA", "NY"] });
  });

  test("and combines expressions", () => {
    const result = and(eq("state", "CA"), gt("year", 2020));
    expect(result).toEqual({
      and: [
        { field: "state", operator: "eq", value: "CA" },
        { field: "year", operator: "gt", value: 2020 },
      ],
    });
  });

  test("or combines expressions", () => {
    const result = or(eq("state", "CA"), eq("state", "NY"));
    expect(result).toEqual({
      or: [
        { field: "state", operator: "eq", value: "CA" },
        { field: "state", operator: "eq", value: "NY" },
      ],
    });
  });

  test("nested and/or", () => {
    const result = and(or(eq("state", "CA"), eq("state", "NY")), gt("year", 2020));
    expect(result).toEqual({
      and: [
        { or: [{ field: "state", operator: "eq", value: "CA" }, { field: "state", operator: "eq", value: "NY" }] },
        { field: "year", operator: "gt", value: 2020 },
      ],
    });
  });
});

describe("serializeFilter", () => {
  test("serializes eq condition", () => {
    const raw = serializeFilter(eq("state", "CA"));
    expect(JSON.parse(raw)).toEqual({ column: "state", comparator: "eq", value: "CA" });
  });

  test("serializes numeric value", () => {
    const raw = serializeFilter(gt("days_lost", 100));
    expect(JSON.parse(raw)).toEqual({ column: "days_lost", comparator: "gt", value: 100 });
  });

  test("serializes like condition", () => {
    const raw = serializeFilter(like("operator_name", "%COAL%"));
    expect(JSON.parse(raw)).toEqual({ column: "operator_name", comparator: "like", value: "%COAL%" });
  });

  test("serializes isIn with array value", () => {
    const raw = serializeFilter(isIn("fips_state_code", ["54", "21", "32"]));
    expect(JSON.parse(raw)).toEqual({ column: "fips_state_code", comparator: "in", value: ["54", "21", "32"] });
  });

  test("serializes notIn with numeric array", () => {
    const raw = serializeFilter(notIn("fiscal_year", [2020, 2021]));
    expect(JSON.parse(raw)).toEqual({ column: "fiscal_year", comparator: "not_in", value: [2020, 2021] });
  });

  test("serializes and expression", () => {
    const raw = serializeFilter(and(eq("state", "CA"), gt("year", 2020)));
    expect(JSON.parse(raw)).toEqual({
      and: [
        { column: "state", comparator: "eq", value: "CA" },
        { column: "year", comparator: "gt", value: 2020 },
      ],
    });
  });

  test("serializes or expression", () => {
    const raw = serializeFilter(or(eq("coal_metal_ind", "C"), eq("coal_metal_ind", "M")));
    expect(JSON.parse(raw)).toEqual({
      or: [
        { column: "coal_metal_ind", comparator: "eq", value: "C" },
        { column: "coal_metal_ind", comparator: "eq", value: "M" },
      ],
    });
  });

  test("serializes deeply nested expression", () => {
    const filter = and(
      or(eq("state", "WV"), eq("state", "KY")),
      gt("days_lost", 30),
      neq("degree_injury", "NO DAYS LOST"),
    );
    const raw = serializeFilter(filter);
    const parsed = JSON.parse(raw);
    expect(parsed.and).toHaveLength(3);
    expect(parsed.and[0].or).toHaveLength(2);
    expect(parsed.and[1]).toEqual({ column: "days_lost", comparator: "gt", value: 30 });
    expect(parsed.and[2]).toEqual({ column: "degree_injury", comparator: "neq", value: "NO DAYS LOST" });
  });

  test("output is raw JSON (URL encoding handled by URLSearchParams)", () => {
    const result = serializeFilter(eq("state", "CA"));
    expect(JSON.parse(result)).toEqual({ column: "state", comparator: "eq", value: "CA" });
  });
});
