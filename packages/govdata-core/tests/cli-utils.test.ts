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

  it("parses numeric flags", () => {
    const result = parseFlags(["--page", "2"]);
    expect(result).toEqual({ page: 2 });
  });

  it("parses boolean flags", () => {
    const result = parseFlags(["--json"]);
    expect(result).toEqual({ json: true });
  });

  it("parses mixed flags", () => {
    const result = parseFlags(["--sort-by", "savings", "--page", "1", "--json"]);
    expect(result).toEqual({ sort_by: "savings", page: 1, json: true });
  });
});

describe("dispatch", () => {
  const mockPlugin: GovDataPlugin = {
    prefix: "test",
    describe: () => ({
      endpoints: [{ name: "items", path: "/items", description: "List items", params: [], responseFields: [] }],
    }),
    endpoints: {
      items: async (params?: any) => createResult([{ id: 1 }], null, "items"),
    },
  };

  it("dispatches to correct plugin and endpoint", async () => {
    const result = await dispatch([mockPlugin], ["test", "items"]);
    expect(result.kind).toBe("items");
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
});
