import { describe, expect, test, afterEach } from "bun:test";
import { createClient, listDatasets } from "../src/client.js";
import datasetsFixture from "./fixtures/datasets-list.json";
import accidentFixture from "./fixtures/msha-accident.json";
import metadataFixture from "./fixtures/msha-accident-metadata.json";

const originalFetch = globalThis.fetch;

function mockFetch(handler: (url: string) => unknown) {
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = typeof input === "string" ? input : input.toString();
    const body = handler(url);
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;
}

function mockFetchError(status: number, body: string) {
  globalThis.fetch = (async () => {
    return new Response(body, { status });
  }) as unknown as typeof fetch;
}

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("listDatasets", () => {
  test("fetches and parses datasets list", async () => {
    mockFetch((url) => {
      expect(url).toContain("/datasets");
      return datasetsFixture;
    });
    const result = await listDatasets("https://test.api");
    expect(result.datasets).toHaveLength(42);
    expect(result.meta.total_count).toBe(42);
    expect(result.datasets[0].agency.abbr).toBe("ILAB");
    expect(result.datasets[0].tag_list).toContain("education");
  });
});

describe("createClient", () => {
  const client = createClient({ apiKey: "test-key" });

  test("getData fetches rows with realistic fields", async () => {
    mockFetch((url) => {
      expect(url).toContain("/get/MSHA/accident/json");
      expect(url).toContain("X-API-KEY=test-key");
      return accidentFixture;
    });
    const result = await client.getData("MSHA", "accident", { limit: 10 });
    expect(result.data).toHaveLength(3);
    expect(result.data[0]).toHaveProperty("mine_id");
    expect(result.data[0]).toHaveProperty("subunit_cd");
    expect(result.data[0]).toHaveProperty("ai_dt");
    expect(result.data[0]).toHaveProperty("days_lost");
  });

  test("getData includes query params in URL", async () => {
    mockFetch((url) => {
      expect(url).toContain("limit=50");
      expect(url).toContain("offset=100");
      expect(url).toContain("sort=desc");
      expect(url).toContain("sort_by=accident_date");
      return accidentFixture;
    });
    await client.getData("MSHA", "accident", {
      limit: 50,
      offset: 100,
      sort: "desc",
      sort_by: "accident_date",
    });
  });

  test("getMetadata fetches column metadata", async () => {
    mockFetch((url) => {
      expect(url).toContain("/get/MSHA/accident/json/metadata");
      return metadataFixture;
    });
    const result = await client.getMetadata("MSHA", "accident");
    expect(result).toHaveLength(10);
    expect(result[0]).toHaveProperty("short_name");
    expect(result[0]).toHaveProperty("application_datatype");
    expect(result[0]).toHaveProperty("variable_description");
  });

  test("getData throws DOLApiError on non-200", async () => {
    mockFetchError(401, '{"error":"Invalid API key"}');
    await expect(client.getData("MSHA", "accident")).rejects.toThrow("DOL API error 401");
  });

  test("getData throws DOLApiError on 404", async () => {
    mockFetchError(404, '{"error":"Not found"}');
    await expect(client.getData("MSHA", "accident")).rejects.toThrow("DOL API error 404");
  });

  test("error message redacts API key", async () => {
    mockFetchError(401, "Unauthorized");
    try {
      await client.getData("MSHA", "accident");
      expect.unreachable("should have thrown");
    } catch (err: any) {
      expect(err.message).toContain("X-API-KEY=***");
      expect(err.message).not.toContain("test-key");
      expect(err.url).toContain("test-key"); // raw url preserved
    }
  });

  test("getAll paginates through multiple pages", async () => {
    let callCount = 0;
    mockFetch(() => {
      callCount++;
      if (callCount === 1) return accidentFixture; // 3 rows, pageSize=3 → full page
      if (callCount === 2) return { data: [accidentFixture.data[0]] }; // 1 row → partial page, stops
      return { data: [] };
    });

    const pages: Record<string, unknown>[][] = [];
    for await (const page of client.getAll("MSHA", "accident", {}, 3)) {
      pages.push(page);
    }
    expect(pages).toHaveLength(2);
    expect(pages[0]).toHaveLength(3);
    expect(pages[1]).toHaveLength(1);
    expect(callCount).toBe(2);
  });

  test("getAll stops on empty page", async () => {
    mockFetch(() => ({ data: [] }));

    const pages: Record<string, unknown>[][] = [];
    for await (const page of client.getAll("MSHA", "accident", {}, 1000)) {
      pages.push(page);
    }
    expect(pages).toHaveLength(0);
  });

  test("getAll stops when page is smaller than pageSize", async () => {
    mockFetch(() => accidentFixture);

    const pages: Record<string, unknown>[][] = [];
    for await (const page of client.getAll("MSHA", "accident", {}, 1000)) {
      pages.push(page);
    }
    expect(pages).toHaveLength(1);
  });
});
