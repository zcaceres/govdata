import { describe, it, expect } from "bun:test";
import { withPagination } from "../src/paginate";
import { createResult } from "../src/response";

function makePage(page: number, totalPages: number) {
  return createResult(
    [{ id: page }],
    { total_results: totalPages, pages: totalPages },
    "items",
  );
}

describe("withPagination", () => {
  it("pages() iterates through all pages", async () => {
    let callCount = 0;
    const fn = async (params?: { page?: number }) => {
      callCount++;
      const page = params?.page ?? 1;
      return makePage(page, 3);
    };

    const paginated = withPagination(fn);
    const pages = [];
    for await (const page of paginated.pages()) {
      pages.push(page);
    }
    expect(pages).toHaveLength(3);
  });

  it("all() concatenates data and updates meta", async () => {
    const fn = async (params?: { page?: number }) => {
      const page = params?.page ?? 1;
      return makePage(page, 2);
    };

    const paginated = withPagination(fn);
    const result = await paginated.all();
    expect(result.data).toHaveLength(2);
    expect(result.meta?.total_results).toBe(2);
    expect(result.meta?.pages).toBe(2);
  });

  it("all() respects maxPages", async () => {
    const fn = async (params?: { page?: number }) => {
      const page = params?.page ?? 1;
      return makePage(page, 100);
    };

    const paginated = withPagination(fn);
    const result = await paginated.all(undefined, { maxPages: 2 });
    expect(result.data).toHaveLength(2);
  });
});
