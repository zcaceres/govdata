import { describe, expect, test } from "bun:test";
import { levenshtein, findClosestAgency, findClosestEndpoint, buildSuggestions } from "../src/suggest.js";

describe("levenshtein", () => {
  test("identical strings have distance 0", () => {
    expect(levenshtein("abc", "abc")).toBe(0);
  });

  test("case insensitive", () => {
    expect(levenshtein("MSHA", "msha")).toBe(0);
  });

  test("single edit", () => {
    expect(levenshtein("msha", "mhsa")).toBe(2);
  });

  test("completely different", () => {
    expect(levenshtein("abc", "xyz")).toBe(3);
  });

  test("empty strings", () => {
    expect(levenshtein("", "abc")).toBe(3);
    expect(levenshtein("abc", "")).toBe(3);
  });
});

describe("findClosestAgency", () => {
  test("finds exact match", () => {
    expect(findClosestAgency("MSHA")).toBe("MSHA");
  });

  test("finds close typo", () => {
    expect(findClosestAgency("MSHA1")).toBe("MSHA");
  });

  test("returns null for distant input", () => {
    expect(findClosestAgency("ZZZZZZZZZ")).toBeNull();
  });
});

describe("findClosestEndpoint", () => {
  test("finds exact match", () => {
    expect(findClosestEndpoint("MSHA", "accident")).toBe("accident");
  });

  test("finds close typo", () => {
    expect(findClosestEndpoint("MSHA", "accidnet")).toBe("accident");
  });

  test("returns null for distant input", () => {
    expect(findClosestEndpoint("MSHA", "zzzzzzzzzzzzz")).toBeNull();
  });

  test("short gibberish does not incorrectly match short endpoints", () => {
    expect(findClosestEndpoint("MSHA", "zzzz")).toBeNull();
  });
});

describe("buildSuggestions", () => {
  test("401 suggests API key", () => {
    const s = buildSuggestions({ status: 401, body: "", url: "" });
    expect(s).toHaveLength(1);
    expect(s[0]).toContain("API key");
  });

  test("404 with unknown agency suggests closest", () => {
    const s = buildSuggestions({ status: 404, body: "", url: "", agency: "MSAH" });
    expect(s.some((x) => x.includes("Did you mean agency 'MSHA'"))).toBe(true);
  });

  test("404 with valid agency but unknown endpoint suggests closest", () => {
    const s = buildSuggestions({ status: 404, body: "", url: "", agency: "MSHA", endpoint: "accidnet" });
    expect(s.some((x) => x.includes("accident"))).toBe(true);
  });

  test("400 parses error body", () => {
    const s = buildSuggestions({ status: 400, body: '{"error":"bad filter"}', url: "" });
    expect(s).toContain("bad filter");
  });

  test("unknown status returns empty", () => {
    const s = buildSuggestions({ status: 500, body: "", url: "" });
    expect(s).toHaveLength(0);
  });
});
