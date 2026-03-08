import { describe, expect, it, mock, afterEach } from "bun:test";
import {
  _searchDocuments,
  _findDocument,
  _findManyDocuments,
  _listAgencies,
  _findAgency,
  _searchPI,
  _currentPI,
  _getFacets,
  _listSuggestedSearches,
} from "../src/endpoints";

const loadFixture = (name: string) =>
  Bun.file(`${import.meta.dir}/../fixtures/${name}.json`).json();

function mockFetch(fixture: Promise<unknown>) {
  const fn = mock(async () => {
    const data = await fixture;
    return new Response(JSON.stringify(data), { status: 200 });
  }) as any;
  globalThis.fetch = fn;
  return fn;
}

describe("endpoints", () => {
  const originalFetch = globalThis.fetch;
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  describe("documents.search", () => {
    it("returns paginated document results", async () => {
      mockFetch(loadFixture("documents-search"));
      const result = await _searchDocuments({ term: "clean energy", per_page: 3 });
      expect(result.kind).toBe("documents");
      expect(result.data.length).toBe(3);
      expect(result.meta).toBeDefined();
      expect(result.meta!.total_results).toBeGreaterThan(0);
      expect(result.meta!.pages).toBeGreaterThan(0);
    });

    it("returns results without params", async () => {
      mockFetch(loadFixture("documents-search"));
      const result = await _searchDocuments();
      expect(result.kind).toBe("documents");
    });
  });

  describe("documents.find", () => {
    it("returns a single document wrapped in array", async () => {
      mockFetch(loadFixture("document-single"));
      const result = await _findDocument("2025-07743");
      expect(result.kind).toBe("document");
      expect(result.data.length).toBe(1);
      expect(result.data[0].document_number).toBe("2025-07743");
      expect(result.meta).toBeNull();
    });
  });

  describe("documents.findMany", () => {
    it("returns multiple documents", async () => {
      mockFetch(loadFixture("documents-multi"));
      const result = await _findManyDocuments(["2024-02585", "2024-00574"]);
      expect(result.kind).toBe("documents_multi");
      expect(result.data.length).toBeGreaterThan(0);
    });
  });

  describe("agencies.all", () => {
    it("returns all agencies", async () => {
      mockFetch(loadFixture("agencies-list"));
      const result = await _listAgencies();
      expect(result.kind).toBe("agencies");
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0].id).toBeDefined();
      expect(result.data[0].name).toBeDefined();
    });
  });

  describe("agencies.find", () => {
    it("returns a single agency", async () => {
      mockFetch(loadFixture("agency-single"));
      const result = await _findAgency(12);
      expect(result.kind).toBe("agency");
      expect(result.data.length).toBe(1);
      expect(result.data[0].id).toBe(12);
    });
  });

  describe("publicInspection.search", () => {
    it("returns paginated PI documents", async () => {
      mockFetch(loadFixture("public-inspection-search"));
      const result = await _searchPI({ per_page: 3 });
      expect(result.kind).toBe("public_inspection");
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.meta).toBeDefined();
    });
  });

  describe("publicInspection.current", () => {
    it("returns current PI documents", async () => {
      mockFetch(loadFixture("public-inspection-current"));
      const result = await _currentPI();
      expect(result.kind).toBe("public_inspection_current");
      expect(result.data.length).toBeGreaterThan(0);
    });
  });

  describe("facets.get", () => {
    it("returns agency facets", async () => {
      mockFetch(loadFixture("facets-agency"));
      const result = await _getFacets("agency", { term: "regulation" });
      expect(result.kind).toBe("facets");
      expect(Object.keys(result.data).length).toBeGreaterThan(0);
      expect(result.summary()).toContain("facets:");
    });

    it("returns daily facets", async () => {
      mockFetch(loadFixture("facets-daily"));
      const result = await _getFacets("daily", { term: "regulation" });
      expect(result.kind).toBe("facets");
    });
  });

  describe("suggestedSearches.all", () => {
    it("returns suggested searches grouped by section", async () => {
      mockFetch(loadFixture("suggested-searches"));
      const result = await _listSuggestedSearches();
      expect(result.kind).toBe("suggested_searches");
      const sections = Object.keys(result.data);
      expect(sections.length).toBeGreaterThan(0);
      expect(result.summary()).toContain("searches across");
    });
  });

  describe("documents.findMany batching", () => {
    it("sends a single request when document numbers fit in URL", async () => {
      const fetchFn = mockFetch(loadFixture("documents-multi"));
      const docNumbers = ["2024-02585", "2024-00574"];
      const result = await _findManyDocuments(docNumbers);
      expect(result.kind).toBe("documents_multi");
      expect(fetchFn).toHaveBeenCalledTimes(1);
    });

    it("batches into multiple requests when document numbers exceed URL limit", async () => {
      // Generate enough document numbers to exceed MAX_PATH_LENGTH (1800 chars)
      // Each number like "2024-XXXXX" is ~10 chars encoded + comma
      const docNumbers: string[] = [];
      for (let i = 0; i < 200; i++) {
        docNumbers.push(`2024-${String(i).padStart(5, "0")}`);
      }

      let callCount = 0;
      const calledUrls: string[] = [];
      const fixture = await loadFixture("documents-multi");
      globalThis.fetch = mock(async (url: string) => {
        callCount++;
        calledUrls.push(url);
        return new Response(JSON.stringify(fixture), { status: 200 });
      }) as any;

      const result = await _findManyDocuments(docNumbers);
      expect(result.kind).toBe("documents_multi");
      expect(callCount).toBeGreaterThan(1);
      // Results should be merged from all batches
      expect(result.data.length).toBe(fixture.results.length * callCount);

      // Each batch URL path (before query params) should be under the limit
      for (const url of calledUrls) {
        const path = new URL(url).pathname;
        expect(path.length).toBeLessThanOrEqual(1800 + "/api/v1/documents/.json".length);
      }
    });
  });

  describe("documents.search empty results", () => {
    it("handles empty search results", async () => {
      globalThis.fetch = mock(async () =>
        new Response(JSON.stringify({ count: 0, total_pages: 0, results: [] }), { status: 200 }),
      ) as any;
      const result = await _searchDocuments({ term: "xyznonexistent12345" });
      expect(result.kind).toBe("documents");
      expect(result.data.length).toBe(0);
      expect(result.meta!.total_results).toBe(0);
    });
  });
});
