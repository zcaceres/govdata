import { describe as desc, it, expect } from "bun:test";
import { describe } from "../src/describe";

desc("describe()", () => {
  it("returns all 3 endpoints", () => {
    const result = describe();
    expect(result.endpoints).toHaveLength(3);
    const names = result.endpoints.map((e) => e.name);
    expect(names).toEqual(["timeseries", "surveys", "popular"]);
  });

  it("timeseries has 6 params with series_id required", () => {
    const result = describe();
    const ts = result.endpoints.find((e) => e.name === "timeseries")!;
    expect(ts.params).toHaveLength(6);
    const seriesId = ts.params.find((p) => p.name === "series_id")!;
    expect(seriesId.required).toBe(true);
    expect(seriesId.type).toBe("string");
    const optional = ts.params.filter((p) => !p.required);
    expect(optional).toHaveLength(5);
  });

  it("surveys has 0 params", () => {
    const result = describe();
    const surveys = result.endpoints.find((e) => e.name === "surveys")!;
    expect(surveys.params).toHaveLength(0);
  });

  it("popular has 1 optional param (survey)", () => {
    const result = describe();
    const popular = result.endpoints.find((e) => e.name === "popular")!;
    expect(popular.params).toHaveLength(1);
    const survey = popular.params.find((p) => p.name === "survey")!;
    expect(survey.required).toBe(false);
    expect(survey.type).toBe("string");
  });

  it("all endpoints have responseFields", () => {
    const result = describe();
    for (const endpoint of result.endpoints) {
      expect(endpoint.responseFields).toBeDefined();
      expect(
        Array.isArray(endpoint.responseFields)
          ? endpoint.responseFields.length > 0
          : Object.keys(endpoint.responseFields).length > 0,
      ).toBe(true);
    }
  });
});
