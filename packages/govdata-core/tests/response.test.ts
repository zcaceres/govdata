import { describe, it, expect } from "bun:test";
import { createResult, escapeCSV, arrayToMarkdownTable, arrayToCSV } from "../src/response";

describe("escapeCSV", () => {
  it("returns plain strings unchanged", () => {
    expect(escapeCSV("hello")).toBe("hello");
  });

  it("wraps strings with commas", () => {
    expect(escapeCSV("a,b")).toBe('"a,b"');
  });

  it("escapes quotes", () => {
    expect(escapeCSV('a"b')).toBe('"a""b"');
  });

  it("handles null and undefined", () => {
    expect(escapeCSV(null)).toBe("");
    expect(escapeCSV(undefined)).toBe("");
  });
});

describe("arrayToMarkdownTable", () => {
  it("returns (no data) for empty array", () => {
    expect(arrayToMarkdownTable([])).toBe("(no data)");
  });

  it("generates table with header and rows", () => {
    const items = [{ name: "Alice", age: 30 }];
    const md = arrayToMarkdownTable(items);
    expect(md).toContain("| name | age |");
    expect(md).toContain("| --- | --- |");
    expect(md).toContain("| Alice | 30 |");
  });
});

describe("arrayToCSV", () => {
  it("returns empty string for empty array", () => {
    expect(arrayToCSV([])).toBe("");
  });

  it("generates CSV with header", () => {
    const items = [{ name: "Alice", age: 30 }];
    const csv = arrayToCSV(items);
    expect(csv).toContain("name,age");
    expect(csv).toContain("Alice,30");
  });
});

describe("createResult - array data", () => {
  it("creates result with array data", () => {
    const data = [{ name: "Test", value: 100 }];
    const meta = { total_results: 50, pages: 5 };
    const result = createResult(data, meta, "items");

    expect(result.data).toEqual(data);
    expect(result.meta).toEqual(meta);
    expect(result.kind).toBe("items");
  });

  it("summary includes pagination info", () => {
    const data = [{ a: 1 }, { a: 2 }];
    const meta = { total_results: 100, pages: 50 };
    const result = createResult(data, meta, "things");
    expect(result.summary()).toBe("things: 2 of 100 results (50 pages)");
  });

  it("summary without meta", () => {
    const data = [{ a: 1 }];
    const result = createResult(data, null, "things");
    expect(result.summary()).toBe("things: 1 results");
  });

  it("toMarkdown generates table", () => {
    const data = [{ name: "X", count: 5 }];
    const result = createResult(data, null, "items");
    expect(result.toMarkdown()).toContain("| name | count |");
  });

  it("toCSV generates CSV", () => {
    const data = [{ name: "X", count: 5 }];
    const result = createResult(data, null, "items");
    expect(result.toCSV()).toContain("name,count");
  });
});

describe("createResult - object-of-arrays data", () => {
  it("summary lists section counts", () => {
    const data = {
      agency: [{ name: "NASA", count: 10 }],
      dates: [{ date: "2025-01-01", count: 5 }, { date: "2025-01-02", count: 3 }],
    };
    const result = createResult(data, null, "statistics");
    expect(result.summary()).toBe("statistics: 1 agency, 2 dates");
  });

  it("toMarkdown generates sectioned tables", () => {
    const data = {
      agency: [{ name: "NASA", count: 10 }],
      dates: [{ date: "2025-01-01", count: 5 }],
    };
    const result = createResult(data, null, "statistics");
    const md = result.toMarkdown();
    expect(md).toContain("### agency");
    expect(md).toContain("### dates");
  });

  it("toCSV generates sectioned CSV", () => {
    const data = {
      agency: [{ name: "NASA", count: 10 }],
    };
    const result = createResult(data, null, "stats");
    const csv = result.toCSV();
    expect(csv).toContain("# agency");
    expect(csv).toContain("NASA");
  });
});
