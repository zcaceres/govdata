import { describe, it, expect, afterEach } from "bun:test";
import { grants, doge } from "../src/endpoints";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function mockFetchSequence(responses: unknown[]) {
  let callIndex = 0;
  globalThis.fetch = (async () => {
    const body = responses[Math.min(callIndex, responses.length - 1)];
    callIndex++;
    return new Response(JSON.stringify(body), { status: 200 });
  }) as unknown as typeof fetch;
}

const makeGrantsPage = (page: number, totalPages: number) => ({
  success: true,
  result: {
    grants: [{ date: null, agency: `Agency-${page}`, recipient: null, value: page * 1000, savings: 100, link: null, description: null }],
  },
  meta: { total_results: totalPages, pages: totalPages },
});

describe("pagination - pages()", () => {
  it("iterates through all pages", async () => {
    mockFetchSequence([
      makeGrantsPage(1, 3),
      makeGrantsPage(2, 3),
      makeGrantsPage(3, 3),
    ]);

    const pages = [];
    for await (const page of grants.pages({ per_page: 1 })) {
      pages.push(page);
    }
    expect(pages).toHaveLength(3);
    expect(pages[0].data[0].agency).toBe("Agency-1");
    expect(pages[2].data[0].agency).toBe("Agency-3");
  });

  it("stops at last page", async () => {
    mockFetchSequence([makeGrantsPage(1, 1)]);

    const pages = [];
    for await (const page of grants.pages()) {
      pages.push(page);
    }
    expect(pages).toHaveLength(1);
  });
});

describe("pagination - all()", () => {
  it("concatenates all pages", async () => {
    mockFetchSequence([
      makeGrantsPage(1, 2),
      makeGrantsPage(2, 2),
    ]);

    const result = await grants.all({ per_page: 1 });
    expect(result.data).toHaveLength(2);
    expect(result.data[0].agency).toBe("Agency-1");
    expect(result.data[1].agency).toBe("Agency-2");
  });

  it("respects maxPages limit", async () => {
    mockFetchSequence([
      makeGrantsPage(1, 100),
      makeGrantsPage(2, 100),
    ]);

    const result = await grants.all({ per_page: 1 }, { maxPages: 2 });
    expect(result.data).toHaveLength(2);
  });
});

describe("pagination on doge instance", () => {
  it("doge.grants has pages() and all()", () => {
    expect(typeof doge.grants.pages).toBe("function");
    expect(typeof doge.grants.all).toBe("function");
  });

  it("doge.grants.pages works", async () => {
    mockFetchSequence([makeGrantsPage(1, 1)]);
    const pages = [];
    for await (const page of doge.grants.pages()) {
      pages.push(page);
    }
    expect(pages).toHaveLength(1);
  });
});
