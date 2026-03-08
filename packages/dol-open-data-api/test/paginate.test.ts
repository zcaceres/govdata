import { describe, expect, test } from "bun:test";
import { withPagination } from "../src/paginate.js";
import type { DataResponse } from "../src/schemas.js";

function makePage(n: number): DataResponse {
  return { data: Array.from({ length: n }, (_, i) => ({ id: i })) };
}

describe("withPagination", () => {
  test("base call wraps response", async () => {
    const getData = async () => makePage(3);
    const fn = withPagination(getData as any, "MSHA" as any, "accident" as any, async () => ({} as any));
    const result = await fn({ limit: 3 });
    expect(result.data).toHaveLength(3);
    expect(result.agency).toBe("MSHA");
    expect(result.endpoint).toBe("accident");
    expect(typeof result.toMarkdown).toBe("function");
  });

  test(".pages() yields multiple pages then stops", async () => {
    let callCount = 0;
    const getData = async () => {
      callCount++;
      if (callCount <= 2) return makePage(5);
      return makePage(2);
    };
    const fn = withPagination(getData as any, "MSHA" as any, "accident" as any, async () => ({} as any));

    const pages = [];
    for await (const page of fn.pages({}, 5)) {
      pages.push(page);
    }
    expect(pages).toHaveLength(3);
    expect(pages[0].data).toHaveLength(5);
    expect(pages[2].data).toHaveLength(2);
  });

  test(".pages() stops on empty page", async () => {
    const getData = async () => makePage(0);
    const fn = withPagination(getData as any, "MSHA" as any, "accident" as any, async () => ({} as any));

    const pages = [];
    for await (const page of fn.pages({}, 10)) {
      pages.push(page);
    }
    expect(pages).toHaveLength(0);
  });

  test(".all() concatenates all pages", async () => {
    let callCount = 0;
    const getData = async () => {
      callCount++;
      if (callCount === 1) return makePage(5);
      return makePage(2);
    };
    const fn = withPagination(getData as any, "MSHA" as any, "accident" as any, async () => ({} as any));

    const result = await fn.all({}, 5);
    expect(result.data).toHaveLength(7);
    expect(result.agency).toBe("MSHA");
    expect(typeof result.toCSV).toBe("function");
  });

  test(".describe() delegates to describeFn", async () => {
    const mockDesc = { agency: "MSHA", endpoint: "accident", columns: [] };
    const getData = async () => makePage(0);
    const fn = withPagination(getData as any, "MSHA" as any, "accident" as any, async () => mockDesc as any);

    const desc = await fn.describe();
    expect(desc.agency).toBe("MSHA");
  });
});
