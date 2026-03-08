import { describe, expect, it, mock, beforeEach, afterEach } from "bun:test";
import { z } from "zod";
import { frGet } from "../src/client";

const TestSchema = z.object({ id: z.number(), name: z.string() });

describe("frGet", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("makes a GET request and parses response", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(JSON.stringify({ id: 1, name: "test" }), { status: 200 })),
    ) as any;

    const result = await frGet("/test.json", TestSchema);
    expect(result).toEqual({ id: 1, name: "test" });
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    const calledUrl = (globalThis.fetch as any).mock.calls[0][0];
    expect(calledUrl).toContain("/api/v1/test.json");
  });

  it("appends bracket-syntax params to URL", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(JSON.stringify({ id: 1, name: "test" }), { status: 200 })),
    ) as any;

    await frGet("/test.json", TestSchema, { term: "energy", agencies: ["epa"] });
    const calledUrl = (globalThis.fetch as any).mock.calls[0][0];
    expect(calledUrl).toContain("conditions[term]=energy");
    expect(calledUrl).toContain("conditions[agencies][]=epa");
  });

  it("uses custom baseUrl from options", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(JSON.stringify({ id: 1, name: "test" }), { status: 200 })),
    ) as any;

    await frGet("/test.json", TestSchema, undefined, { baseUrl: "https://custom.api" });
    const calledUrl = (globalThis.fetch as any).mock.calls[0][0];
    expect(calledUrl).toStartWith("https://custom.api/test.json");
  });

  it("throws GovApiError on non-200 response", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(
        new Response(JSON.stringify({ message: "not found" }), {
          status: 404,
          headers: { "content-type": "application/json" },
        }),
      ),
    ) as any;

    await expect(frGet("/bad.json", TestSchema)).rejects.toThrow("not found");
  });

  it("retries on 429 and succeeds", async () => {
    let callCount = 0;
    globalThis.fetch = mock(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve(new Response("", { status: 429 }));
      }
      return Promise.resolve(new Response(JSON.stringify({ id: 1, name: "retry" }), { status: 200 }));
    }) as any;

    const result = await frGet("/test.json", TestSchema, undefined, { initialRetryMs: 1 });
    expect(result).toEqual({ id: 1, name: "retry" });
    expect(callCount).toBe(2);
  });

  it("throws GovRateLimitError after max retries", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response("", { status: 429 })),
    ) as any;

    await expect(
      frGet("/test.json", TestSchema, undefined, { maxRetries: 0 }),
    ).rejects.toThrow("Rate limited");
  });

  it("handles HTML 404 response with 'Not found' message", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(
        new Response("<html><body>Not Found</body></html>", {
          status: 404,
          headers: { "content-type": "text/html; charset=utf-8" },
        }),
      ),
    ) as any;

    await expect(frGet("/bad.json", TestSchema)).rejects.toThrow("Not found");
  });

  it("uses JSON error message when content-type is application/json", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(
        new Response(JSON.stringify({ message: "Document not found" }), {
          status: 404,
          headers: { "content-type": "application/json" },
        }),
      ),
    ) as any;

    await expect(frGet("/bad.json", TestSchema)).rejects.toThrow("Document not found");
  });

  it("wraps schema parse errors in GovApiError", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(JSON.stringify({ unexpected: "shape" }), { status: 200 })),
    ) as any;

    await expect(frGet("/test.json", TestSchema)).rejects.toThrow("Unexpected API response shape");
  });

  it("falls back to HTTP status for non-JSON non-404 errors", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(
        new Response("Internal Server Error", {
          status: 500,
          headers: { "content-type": "text/html" },
        }),
      ),
    ) as any;

    await expect(frGet("/bad.json", TestSchema)).rejects.toThrow("HTTP 500");
  });
});
