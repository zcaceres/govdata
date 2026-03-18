import { describe, it, expect } from "bun:test";
import { parseFlags, kebabToSnake, dispatch } from "../src/cli-utils";
import type { GovDataPlugin } from "../src/plugin";
import { createResult } from "../src/response";

describe("kebabToSnake", () => {
  it("converts kebab to snake", () => {
    expect(kebabToSnake("sort-by")).toBe("sort_by");
    expect(kebabToSnake("per-page")).toBe("per_page");
    expect(kebabToSnake("simple")).toBe("simple");
  });
});

describe("parseFlags", () => {
  it("parses string flags", () => {
    const result = parseFlags(["--sort-by", "savings"]);
    expect(result).toEqual({ sort_by: "savings" });
  });

  it("keeps numeric-looking values as strings", () => {
    const result = parseFlags(["--page", "2"]);
    expect(result).toEqual({ page: "2" });
  });

  it("preserves leading zeros", () => {
    const result = parseFlags(["--upc", "0123456789"]);
    expect(result).toEqual({ upc: "0123456789" });
  });

  it("parses boolean flags", () => {
    const result = parseFlags(["--json"]);
    expect(result).toEqual({ json: true });
  });

  it("parses mixed flags", () => {
    const result = parseFlags(["--sort-by", "savings", "--page", "1", "--json"]);
    expect(result).toEqual({ sort_by: "savings", page: "1", json: true });
  });

  it("preserves leading zeros on numeric-looking strings", () => {
    const result = parseFlags(["--upc", "0123456789"]);
    expect(result).toEqual({ upc: "0123456789" });
    expect(typeof result.upc).toBe("string");
  });

  it("preserves zip codes with leading zeros", () => {
    const result = parseFlags(["--zip", "01234"]);
    expect(result.zip).toBe("01234");
  });

  it("preserves plain numeric strings as strings", () => {
    const result = parseFlags(["--id", "42"]);
    expect(result.id).toBe("42");
    expect(typeof result.id).toBe("string");
  });
});

describe("dispatch", () => {
  const mockPlugin: GovDataPlugin = {
    prefix: "test",
    describe: () => ({
      endpoints: [
        { name: "items", path: "/items", description: "List items", params: [], responseFields: [] },
        { name: "nested_thing", path: "/nested-thing", description: "Nested thing", params: [], responseFields: [] },
      ],
    }),
    endpoints: {
      items: async (params?: any) => createResult([{ id: 1 }], null, "items"),
      nested_thing: async (params?: any) => createResult([{ id: 2 }], null, "nested_thing"),
    },
  };

  it("dispatches to correct plugin and endpoint", async () => {
    const result = await dispatch([mockPlugin], ["test", "items"]);
    expect(result.kind).toBe("items");
  });

  it("converts kebab-case endpoint names to snake_case", async () => {
    const result = await dispatch([mockPlugin], ["test", "nested-thing"]);
    expect(result.kind).toBe("nested_thing");
  });

  it("throws for unknown plugin", async () => {
    expect(dispatch([mockPlugin], ["unknown", "items"])).rejects.toThrow("Unknown source");
  });

  it("throws for unknown endpoint", async () => {
    expect(dispatch([mockPlugin], ["test", "unknown"])).rejects.toThrow("Unknown endpoint");
  });

  it("throws with no args", async () => {
    expect(dispatch([mockPlugin], [])).rejects.toThrow("Usage");
  });

  it("shows help with --help as second arg", async () => {
    try {
      await dispatch([mockPlugin], ["test", "--help"]);
      expect(true).toBe(false);
    } catch (err: any) {
      expect(err.message).toContain("Usage:");
      expect(err.message).toContain("items");
      expect(err.message).toContain("List items");
    }
  });

  it("shows help with --help as third arg (after endpoint)", async () => {
    try {
      await dispatch([mockPlugin], ["test", "items", "--help"]);
      expect(true).toBe(false);
    } catch (err: any) {
      expect(err.message).toContain("Endpoints:");
      expect(err.message).toContain("items");
    }
  });
});
