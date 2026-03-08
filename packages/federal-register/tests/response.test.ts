import { describe, expect, it } from "bun:test";
import { wrapResponse } from "../src/response";

describe("wrapResponse", () => {
  it("wraps document array with meta", () => {
    const docs = [{ document_number: "2024-00001", title: "Test", type: "Rule", publication_date: "2024-01-01", html_url: "http://example.com" }];
    const result = wrapResponse(docs, { total_results: 100, pages: 5 }, "documents");
    expect(result.kind).toBe("documents");
    expect(result.data).toBe(docs);
    expect(result.meta).toEqual({ total_results: 100, pages: 5 });
    expect(result.summary()).toContain("1 of 100");
  });

  it("wraps single document as array", () => {
    const doc = [{ document_number: "2024-00001", title: "Test", type: "Rule", publication_date: "2024-01-01", html_url: "http://example.com" }];
    const result = wrapResponse(doc, null, "document");
    expect(result.kind).toBe("document");
    expect(result.data.length).toBe(1);
    expect(result.meta).toBeNull();
  });

  it("wraps agencies array", () => {
    const agencies = [{ id: 1, name: "EPA", slug: "epa" }];
    const result = wrapResponse(agencies, null, "agencies");
    expect(result.kind).toBe("agencies");
    expect(result.summary()).toContain("1 results");
  });

  it("provides custom summary for facets", () => {
    const facets = {
      "epa": { count: 100, name: "EPA" },
      "doe": { count: 50, name: "DOE" },
    };
    const result = wrapResponse(facets, null, "facets");
    expect(result.summary()).toBe("facets: 2 entries");
  });

  it("provides custom summary for suggested_searches", () => {
    const searches = {
      money: [
        { slug: "test", title: "Test", section: "money", description: "", search_conditions: {}, documents_in_last_year: 10, documents_with_open_comment_periods: 0, position: 1 },
      ],
      health: [
        { slug: "test2", title: "Test 2", section: "health", description: "", search_conditions: {}, documents_in_last_year: 5, documents_with_open_comment_periods: 0, position: 1 },
        { slug: "test3", title: "Test 3", section: "health", description: "", search_conditions: {}, documents_in_last_year: 3, documents_with_open_comment_periods: 0, position: 2 },
      ],
    };
    const result = wrapResponse(searches, null, "suggested_searches");
    expect(result.summary()).toBe("suggested_searches: 3 searches across 2 sections");
  });

  it("generates markdown table for document results", () => {
    const docs = [{ document_number: "2024-00001", title: "Test Rule" }];
    const result = wrapResponse(docs as any, null, "documents");
    const md = result.toMarkdown();
    expect(md).toContain("document_number");
    expect(md).toContain("2024-00001");
  });

  it("generates CSV for document results", () => {
    const docs = [{ document_number: "2024-00001", title: "Test Rule" }];
    const result = wrapResponse(docs as any, null, "documents");
    const csv = result.toCSV();
    expect(csv).toContain("document_number,title");
    expect(csv).toContain("2024-00001,Test Rule");
  });
});
