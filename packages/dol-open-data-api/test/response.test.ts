import { describe, expect, test } from "bun:test";
import { wrapResponse, arrayToMarkdownTable, arrayToCSV } from "../src/response.js";

const fixture = [
  { id: 1, name: "Alice", city: "New York" },
  { id: 2, name: "Bob", city: "Chicago" },
];

describe("arrayToMarkdownTable", () => {
  test("returns pipe-delimited table", () => {
    const md = arrayToMarkdownTable(fixture);
    expect(md).toContain("| id | name | city |");
    expect(md).toContain("| --- | --- | --- |");
    expect(md).toContain("| 1 | Alice | New York |");
    expect(md).toContain("| 2 | Bob | Chicago |");
  });

  test("returns (no data) for empty array", () => {
    expect(arrayToMarkdownTable([])).toBe("(no data)");
  });

  test("handles null values", () => {
    const data = [{ a: 1, b: null }, { a: 2, b: "x" }];
    const md = arrayToMarkdownTable(data);
    expect(md).toContain("| 1 |  |");
    expect(md).toContain("| 2 | x |");
  });

  test("escapes pipe characters in values", () => {
    const data = [{ a: "hello | world", b: "ok" }];
    const md = arrayToMarkdownTable(data);
    expect(md).toContain("hello \\| world");
    expect(md).not.toContain("hello | world");
  });

  test("collects keys from all rows", () => {
    const data = [{ a: 1 }, { a: 2, b: 3 }];
    const md = arrayToMarkdownTable(data);
    expect(md).toContain("| a | b |");
  });
});

describe("arrayToCSV", () => {
  test("returns RFC 4180 CSV", () => {
    const csv = arrayToCSV(fixture);
    const lines = csv.split("\n");
    expect(lines[0]).toBe("id,name,city");
    expect(lines[1]).toBe("1,Alice,New York");
  });

  test("returns empty string for empty array", () => {
    expect(arrayToCSV([])).toBe("");
  });

  test("quotes values with commas", () => {
    const data = [{ a: "hello, world" }];
    const csv = arrayToCSV(data);
    expect(csv).toContain('"hello, world"');
  });

  test("escapes double quotes", () => {
    const data = [{ a: 'say "hi"' }];
    const csv = arrayToCSV(data);
    expect(csv).toContain('"say ""hi"""');
  });

  test("handles null values", () => {
    const data = [{ a: null, b: "ok" }];
    const csv = arrayToCSV(data);
    expect(csv).toBe("a,b\n,ok");
  });
});

describe("wrapResponse", () => {
  test("toMarkdown returns table", () => {
    const result = wrapResponse({ data: fixture }, "TEST", "example");
    expect(result.toMarkdown()).toContain("| id | name | city |");
  });

  test("toCSV returns csv", () => {
    const result = wrapResponse({ data: fixture }, "TEST", "example");
    expect(result.toCSV()).toContain("id,name,city");
  });

  test("summary includes row count and columns", () => {
    const result = wrapResponse({ data: fixture }, "MSHA", "accident");
    const s = result.summary();
    expect(s).toContain("MSHA/accident");
    expect(s).toContain("2 rows");
    expect(s).toContain("3 columns");
    expect(s).toContain("id");
  });

  test("preserves agency and endpoint", () => {
    const result = wrapResponse({ data: [] }, "OSHA", "inspection");
    expect(result.agency).toBe("OSHA");
    expect(result.endpoint).toBe("inspection");
  });

  test("summary truncates long column list", () => {
    const data = [{ a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9 }];
    const result = wrapResponse({ data }, "X", "y");
    expect(result.summary()).toContain("...");
  });
});
