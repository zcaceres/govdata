import { describe, it, expect } from "bun:test";
import { GovValidationError } from "govdata-core";
import { naicsPlugin } from "../src/plugin";

const ep = naicsPlugin.endpoints;

describe("plugin validation", () => {
  // Bug 1: q as boolean (bare --q flag) or empty string
  describe("search q validation", () => {
    it("rejects boolean q (bare --q flag)", async () => {
      await expect(ep.search({ q: true })).rejects.toBeInstanceOf(GovValidationError);
    });

    it("rejects empty string q", async () => {
      await expect(ep.search({ q: "" })).rejects.toBeInstanceOf(GovValidationError);
    });

    it("rejects whitespace-only q", async () => {
      await expect(ep.search({ q: "   " })).rejects.toBeInstanceOf(GovValidationError);
    });

    it("rejects missing q", async () => {
      await expect(ep.search({})).rejects.toBeInstanceOf(GovValidationError);
    });
  });

  // Bug 2: invalid code format
  describe("code format validation", () => {
    const codeEndpoints = ["get", "children", "ancestors", "descendants", "cross_references", "index_entries"] as const;

    for (const name of codeEndpoints) {
      it(`${name} rejects invalid code format`, async () => {
        await expect(ep[name]({ code: "invalid" })).rejects.toBeInstanceOf(GovValidationError);
      });

      it(`${name} rejects single digit code`, async () => {
        await expect(ep[name]({ code: "1" })).rejects.toBeInstanceOf(GovValidationError);
      });

      it(`${name} rejects code with letters`, async () => {
        await expect(ep[name]({ code: "72abc" })).rejects.toBeInstanceOf(GovValidationError);
      });
    }
  });

  // Bug 3: invalid codes in batch
  describe("batch codes validation", () => {
    it("rejects invalid codes", async () => {
      await expect(ep.batch({ codes: "invalid,abc" })).rejects.toBeInstanceOf(GovValidationError);
    });

    it("rejects mix of valid and invalid codes", async () => {
      await expect(ep.batch({ codes: "722511,abc" })).rejects.toBeInstanceOf(GovValidationError);
    });
  });

  // Bug 4: invalid level
  describe("search level validation", () => {
    it("rejects level 0", async () => {
      await expect(ep.search({ q: "restaurant", level: 0 })).rejects.toBeInstanceOf(GovValidationError);
    });

    it("rejects level 1", async () => {
      await expect(ep.search({ q: "restaurant", level: 1 })).rejects.toBeInstanceOf(GovValidationError);
    });

    it("rejects level 7", async () => {
      await expect(ep.search({ q: "restaurant", level: 7 })).rejects.toBeInstanceOf(GovValidationError);
    });

    it("rejects non-numeric level", async () => {
      await expect(ep.search({ q: "restaurant", level: "abc" })).rejects.toBeInstanceOf(GovValidationError);
    });
  });

  // Bug 5: negative offset
  describe("pagination validation", () => {
    it("descendants rejects negative offset", async () => {
      await expect(ep.descendants({ code: "72", offset: -5 })).rejects.toBeInstanceOf(GovValidationError);
    });

    it("search rejects negative offset", async () => {
      await expect(ep.search({ q: "restaurant", offset: -1 })).rejects.toBeInstanceOf(GovValidationError);
    });

    it("descendants rejects zero limit", async () => {
      await expect(ep.descendants({ code: "72", limit: 0 })).rejects.toBeInstanceOf(GovValidationError);
    });

    it("search rejects non-numeric limit", async () => {
      await expect(ep.search({ q: "restaurant", limit: "abc" })).rejects.toBeInstanceOf(GovValidationError);
    });
  });

  // Bug 6: year validation uses GovValidationError
  describe("year validation", () => {
    it("rejects unsupported year", async () => {
      await expect(ep.sectors({ year: 9999 })).rejects.toBeInstanceOf(GovValidationError);
    });

    it("rejects non-numeric year", async () => {
      await expect(ep.sectors({ year: "abc" })).rejects.toBeInstanceOf(GovValidationError);
    });
  });

  // Regression: valid calls still work
  describe("valid calls succeed", () => {
    it("get with valid code", async () => {
      const result = await ep.get({ code: "722511" });
      expect(result.kind).toBe("get");
    });

    it("search with valid query", async () => {
      const result = await ep.search({ q: "restaurant", limit: 3 });
      expect(result.kind).toBe("search");
    });

    it("sectors with no params", async () => {
      const result = await ep.sectors();
      expect(result.kind).toBe("sectors");
    });

    it("children with valid code", async () => {
      const result = await ep.children({ code: "72" });
      expect(result.kind).toBe("children");
    });

    it("descendants with valid pagination", async () => {
      const result = await ep.descendants({ code: "72", limit: 5, offset: 0 });
      expect(result.kind).toBe("descendants");
    });

    it("batch with valid codes", async () => {
      const result = await ep.batch({ codes: "722511,722513" });
      expect(result.kind).toBe("batch");
    });

    it("search with valid level", async () => {
      const result = await ep.search({ q: "restaurant", level: 6, limit: 3 });
      expect(result.kind).toBe("search");
    });

    it("get with range code", async () => {
      const result = await ep.get({ code: "31-33" });
      expect(result.kind).toBe("get");
    });
  });
});
