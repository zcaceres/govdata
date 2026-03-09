import { describe, it, expect } from "bun:test";
import { createResult, stringifyValue, escapeCSV, escapeMarkdownCell, arrayToMarkdownTable, arrayToCSV } from "../src/response";

describe("stringifyValue", () => {
  it("returns empty string for null/undefined", () => {
    expect(stringifyValue(null)).toBe("");
    expect(stringifyValue(undefined)).toBe("");
  });

  it("returns String() for primitives", () => {
    expect(stringifyValue("hello")).toBe("hello");
    expect(stringifyValue(42)).toBe("42");
    expect(stringifyValue(true)).toBe("true");
  });

  it("extracts name from object", () => {
    expect(stringifyValue({ name: "EPA", id: 145 })).toBe("EPA");
  });

  it("extracts title from object when no name", () => {
    expect(stringifyValue({ title: "My Doc", id: 1 })).toBe("My Doc");
  });

  it("extracts slug from object when no name/title", () => {
    expect(stringifyValue({ slug: "epa", id: 145 })).toBe("epa");
  });

  it("extracts label from object when no name/title/slug", () => {
    expect(stringifyValue({ label: "Category A", count: 10 })).toBe("Category A");
  });

  it("falls back to JSON for objects without label fields", () => {
    expect(stringifyValue({ count: 5, last_updated: "2025-01-01" })).toBe(
      '{"count":5,"last_updated":"2025-01-01"}',
    );
  });

  it("joins array of primitives with commas", () => {
    expect(stringifyValue(["a", "b", "c"])).toBe("a, b, c");
  });

  it("extracts names from array of objects", () => {
    const agencies = [
      { name: "EPA", id: 145 },
      { name: "DOE", id: 136 },
    ];
    expect(stringifyValue(agencies)).toBe("EPA, DOE");
  });

  it("handles empty array", () => {
    expect(stringifyValue([])).toBe("");
  });
});

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

describe("escapeMarkdownCell", () => {
  it("renders array of objects by extracting names", () => {
    const agencies = [{ name: "EPA", id: 145 }, { name: "DOE", id: 136 }];
    expect(escapeMarkdownCell(agencies)).toBe("EPA, DOE");
  });

  it("renders nested object without [object Object]", () => {
    const pageViews = { count: 500, last_updated: "2025-01-01" };
    const result = escapeMarkdownCell(pageViews);
    expect(result).not.toContain("[object Object]");
    expect(result).toContain("500");
  });

  it("escapes pipes in stringified values", () => {
    expect(escapeMarkdownCell({ name: "a|b" })).toBe("a\\|b");
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
