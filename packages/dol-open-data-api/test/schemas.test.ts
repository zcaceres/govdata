import { describe, expect, test } from "bun:test";
import { QueryParams, FilterExpression, ClientConfig, DataResponse, DatasetInfo, DatasetsResponse } from "../src/schemas.js";

describe("QueryParams", () => {
  test("valid params", () => {
    const result = QueryParams.parse({ limit: 100, offset: 0, sort: "asc", sort_by: "year" });
    expect(result.limit).toBe(100);
  });

  test("empty object is valid", () => {
    expect(() => QueryParams.parse({})).not.toThrow();
  });

  test("rejects limit > 10000", () => {
    expect(() => QueryParams.parse({ limit: 20000 })).toThrow();
  });

  test("rejects negative offset", () => {
    expect(() => QueryParams.parse({ offset: -1 })).toThrow();
  });

  test("rejects invalid sort", () => {
    expect(() => QueryParams.parse({ sort: "invalid" })).toThrow();
  });
});

describe("FilterExpression", () => {
  test("parses simple condition", () => {
    const result = FilterExpression.parse({ field: "state", operator: "eq", value: "CA" });
    expect(result).toEqual({ field: "state", operator: "eq", value: "CA" });
  });

  test("parses and expression", () => {
    const result = FilterExpression.parse({
      and: [{ field: "state", operator: "eq", value: "CA" }],
    });
    expect(result).toHaveProperty("and");
  });

  test("parses or expression", () => {
    const result = FilterExpression.parse({
      or: [
        { field: "state", operator: "eq", value: "CA" },
        { field: "state", operator: "eq", value: "NY" },
      ],
    });
    expect(result).toHaveProperty("or");
  });

  test("parses nested and/or", () => {
    const result = FilterExpression.parse({
      and: [
        { or: [{ field: "state", operator: "eq", value: "CA" }, { field: "state", operator: "eq", value: "NY" }] },
        { field: "year", operator: "gt", value: 2020 },
      ],
    });
    expect(result).toHaveProperty("and");
  });

  test("rejects invalid operator", () => {
    expect(() => FilterExpression.parse({ field: "x", operator: "bad", value: 1 })).toThrow();
  });
});

describe("ClientConfig", () => {
  test("valid config", () => {
    expect(() => ClientConfig.parse({ apiKey: "abc123" })).not.toThrow();
  });

  test("valid config with custom baseUrl", () => {
    const result = ClientConfig.parse({ apiKey: "abc123", baseUrl: "https://custom.api/v4" });
    expect(result.baseUrl).toBe("https://custom.api/v4");
  });

  test("rejects empty apiKey", () => {
    expect(() => ClientConfig.parse({ apiKey: "" })).toThrow();
  });
});

describe("DataResponse", () => {
  test("parses valid response", () => {
    const result = DataResponse.parse({ data: [{ id: 1 }] });
    expect(result.data).toHaveLength(1);
  });

  test("rejects missing data", () => {
    expect(() => DataResponse.parse({})).toThrow();
  });
});

describe("DatasetInfo", () => {
  test("parses realistic dataset object", () => {
    const result = DatasetInfo.parse({
      id: 10227,
      name: "Accident",
      description: "Mine accidents dataset",
      tablename: "MSHA_accident",
      published_at: "2024-10-11T19:50:24",
      dataset_type: 1,
      agency_id: 20,
      agency: { name: "Mine Safety and Health Administration", abbr: "MSHA" },
      frequency: "Weekly",
      api_url: "accident",
      category_name: "Enforcement",
      status: 4,
      tag_list: ["accidents", "mines"],
      created_at: "2024-10-11T19:32:18",
      updated_at: "2024-10-11T19:50:55",
    });
    expect(result.agency.abbr).toBe("MSHA");
    expect(result.tag_list).toContain("accidents");
  });

  test("passes through extra fields", () => {
    const result = DatasetInfo.parse({
      id: 1, name: "Test", tablename: "t", published_at: "2024-01-01",
      dataset_type: 1, agency_id: 1, agency: { name: "Test", abbr: "T" },
      frequency: "Weekly", api_url: "test", status: 4, tag_list: [],
      created_at: "2024-01-01", updated_at: "2024-01-01",
      some_extra_field: "hello",
    });
    expect((result as any).some_extra_field).toBe("hello");
  });
});

describe("DatasetsResponse", () => {
  test("parses full datasets response with meta", () => {
    const result = DatasetsResponse.parse({
      datasets: [{
        id: 1, name: "Test", tablename: "t", published_at: "2024-01-01",
        dataset_type: 1, agency_id: 1, agency: { name: "Test", abbr: "T" },
        frequency: "Weekly", api_url: "test", status: 4, tag_list: [],
        created_at: "2024-01-01", updated_at: "2024-01-01",
      }],
      meta: { current_page: 1, next_page: null, prev_page: null, total_pages: 1, total_count: 1 },
    });
    expect(result.datasets).toHaveLength(1);
    expect(result.meta.total_count).toBe(1);
  });
});
