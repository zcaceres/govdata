import { describe, expect, test } from "bun:test";
import { buildSearchParams } from "../src/params.js";
import { eq } from "../src/filters.js";

describe("buildSearchParams", () => {
  test("includes API key", () => {
    const sp = buildSearchParams("test-key");
    expect(sp.get("X-API-KEY")).toBe("test-key");
  });

  test("sets limit and offset", () => {
    const sp = buildSearchParams("key", { limit: 50, offset: 100 });
    expect(sp.get("limit")).toBe("50");
    expect(sp.get("offset")).toBe("100");
  });

  test("joins fields with comma", () => {
    const sp = buildSearchParams("key", { fields: ["name", "state", "year"] });
    expect(sp.get("fields")).toBe("name,state,year");
  });

  test("sets sort and sort_by", () => {
    const sp = buildSearchParams("key", { sort: "desc", sort_by: "year" });
    expect(sp.get("sort")).toBe("desc");
    expect(sp.get("sort_by")).toBe("year");
  });

  test("serializes filter to filter_object", () => {
    const sp = buildSearchParams("key", { filter: eq("state", "CA") });
    const raw = sp.get("filter_object")!;
    expect(JSON.parse(raw)).toEqual({ column: "state", comparator: "eq", value: "CA" });
  });

  test("omits undefined params", () => {
    const sp = buildSearchParams("key", {});
    expect(sp.has("limit")).toBe(false);
    expect(sp.has("offset")).toBe(false);
    expect(sp.has("fields")).toBe(false);
  });
});
