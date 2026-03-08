import { describe, expect, it } from "bun:test";
import {
  DocumentSearchResponseSchema,
  SingleDocumentResponseSchema,
  MultiDocumentResponseSchema,
  AgenciesResponseSchema,
  SingleAgencyResponseSchema,
  PISearchResponseSchema,
  PICurrentResponseSchema,
  FacetsResponseSchema,
  SuggestedSearchesResponseSchema,
} from "../src/schemas";

// Load real API fixtures
const loadFixture = (name: string) =>
  Bun.file(`${import.meta.dir}/../fixtures/${name}.json`).json();

describe("schemas validate real API responses", () => {
  it("parses document search response", async () => {
    const data = await loadFixture("documents-search");
    const result = DocumentSearchResponseSchema.parse(data);
    expect(result.count).toBeGreaterThan(0);
    expect(result.total_pages).toBeGreaterThan(0);
    expect(result.results.length).toBeGreaterThan(0);
    expect(result.results[0].document_number).toBeDefined();
    expect(result.results[0].title).toBeDefined();
    expect(result.results[0].type).toBeDefined();
  });

  it("parses single document response", async () => {
    const data = await loadFixture("document-single");
    const result = SingleDocumentResponseSchema.parse(data);
    expect(result.document_number).toBe("2025-07743");
    expect(result.title).toBeDefined();
    expect(result.type).toBe("Rule");
    expect(result.publication_date).toBeDefined();
  });

  it("parses multi-document response", async () => {
    const data = await loadFixture("documents-multi");
    const result = MultiDocumentResponseSchema.parse(data);
    expect(result.count).toBeGreaterThan(0);
    expect(result.results.length).toBeGreaterThan(0);
  });

  it("parses agencies list response", async () => {
    const data = await loadFixture("agencies-list");
    const result = AgenciesResponseSchema.parse(data);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].id).toBeDefined();
    expect(result[0].name).toBeDefined();
    expect(result[0].slug).toBeDefined();
  });

  it("parses single agency response", async () => {
    const data = await loadFixture("agency-single");
    const result = SingleAgencyResponseSchema.parse(data);
    expect(result.id).toBe(12);
    expect(result.name).toBeDefined();
    expect(result.slug).toBeDefined();
  });

  it("parses public inspection search response", async () => {
    const data = await loadFixture("public-inspection-search");
    const result = PISearchResponseSchema.parse(data);
    expect(result.count).toBeGreaterThan(0);
    expect(result.total_pages).toBeGreaterThan(0);
    expect(result.results.length).toBeGreaterThan(0);
    expect(result.results[0].document_number).toBeDefined();
  });

  it("parses public inspection current response", async () => {
    const data = await loadFixture("public-inspection-current");
    const result = PICurrentResponseSchema.parse(data);
    expect(result.count).toBeGreaterThan(0);
    expect(result.results.length).toBeGreaterThan(0);
  });

  it("parses agency facets response", async () => {
    const data = await loadFixture("facets-agency");
    const result = FacetsResponseSchema.parse(data);
    const keys = Object.keys(result);
    expect(keys.length).toBeGreaterThan(0);
    const first = result[keys[0]];
    expect(first.count).toBeGreaterThanOrEqual(0);
    expect(first.name).toBeDefined();
  });

  it("parses daily facets response", async () => {
    const data = await loadFixture("facets-daily");
    const result = FacetsResponseSchema.parse(data);
    const keys = Object.keys(result);
    expect(keys.length).toBeGreaterThan(0);
  });

  it("parses suggested searches response", async () => {
    const data = await loadFixture("suggested-searches");
    const result = SuggestedSearchesResponseSchema.parse(data);
    const sections = Object.keys(result);
    expect(sections.length).toBeGreaterThan(0);
    const firstSection = result[sections[0]];
    expect(firstSection.length).toBeGreaterThan(0);
    expect(firstSection[0].slug).toBeDefined();
    expect(firstSection[0].title).toBeDefined();
  });
});
