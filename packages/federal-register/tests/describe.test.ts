import { describe as testDescribe, expect, it } from "bun:test";
import { describe } from "../src/describe";

testDescribe("describe", () => {
  it("returns all 9 endpoints", () => {
    const { endpoints } = describe();
    expect(endpoints.length).toBe(9);
  });

  it("has correct endpoint names", () => {
    const { endpoints } = describe();
    const names = endpoints.map((e) => e.name);
    expect(names).toContain("documents");
    expect(names).toContain("document");
    expect(names).toContain("documents_multi");
    expect(names).toContain("agencies");
    expect(names).toContain("agency");
    expect(names).toContain("public_inspection");
    expect(names).toContain("public_inspection_current");
    expect(names).toContain("facets");
    expect(names).toContain("suggested_searches");
  });

  it("every endpoint has required fields", () => {
    const { endpoints } = describe();
    for (const ep of endpoints) {
      expect(ep.name).toBeDefined();
      expect(ep.path).toBeDefined();
      expect(ep.description).toBeDefined();
      expect(Array.isArray(ep.params)).toBe(true);
      expect(ep.responseFields).toBeDefined();
    }
  });

  it("documents endpoint has search params", () => {
    const { endpoints } = describe();
    const docs = endpoints.find((e) => e.name === "documents")!;
    const paramNames = docs.params.map((p) => p.name);
    expect(paramNames).toContain("term");
    expect(paramNames).toContain("agencies");
    expect(paramNames).toContain("type");
    expect(paramNames).toContain("page");
    expect(paramNames).toContain("per_page");
    expect(paramNames).toContain("order");
    expect(paramNames).toContain("publication_date_gte");
  });

  it("facets endpoint has facet_type required param", () => {
    const { endpoints } = describe();
    const facets = endpoints.find((e) => e.name === "facets")!;
    const facetTypeParam = facets.params.find((p) => p.name === "facet_type");
    expect(facetTypeParam).toBeDefined();
    expect(facetTypeParam!.required).toBe(true);
    expect(facetTypeParam!.values).toContain("agency");
    expect(facetTypeParam!.values).toContain("daily");
  });

  it("document endpoint has required document_number param", () => {
    const { endpoints } = describe();
    const doc = endpoints.find((e) => e.name === "document")!;
    const docNumParam = doc.params.find((p) => p.name === "document_number");
    expect(docNumParam).toBeDefined();
    expect(docNumParam!.required).toBe(true);
  });
});
