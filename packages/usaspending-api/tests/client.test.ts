import { describe, it, expect, afterEach } from "bun:test";
import { z } from "zod";
import { usaGet, usaPost } from "../src/client";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

const TestSchema = z.object({ id: z.number(), name: z.string() });

describe("usaGet", () => {
  it("fetches and parses GET response", async () => {
    globalThis.fetch = (async (url: string) => {
      expect(url).toContain("/api/v2/test/");
      return new Response(JSON.stringify({ id: 1, name: "test" }), { status: 200 });
    }) as unknown as typeof fetch;

    const result = await usaGet("/api/v2/test/", TestSchema);
    expect(result).toEqual({ id: 1, name: "test" });
  });

  it("appends query params", async () => {
    let capturedUrl = "";
    globalThis.fetch = (async (url: string) => {
      capturedUrl = url;
      return new Response(JSON.stringify({ id: 1, name: "test" }), { status: 200 });
    }) as unknown as typeof fetch;

    await usaGet("/api/v2/test/", TestSchema, { foo: "bar", num: 5 });
    expect(capturedUrl).toContain("foo=bar");
    expect(capturedUrl).toContain("num=5");
  });

  it("uses custom baseUrl", async () => {
    let capturedUrl = "";
    globalThis.fetch = (async (url: string) => {
      capturedUrl = url;
      return new Response(JSON.stringify({ id: 1, name: "test" }), { status: 200 });
    }) as unknown as typeof fetch;

    await usaGet("/api/v2/test/", TestSchema, undefined, { baseUrl: "https://custom.example.com" });
    expect(capturedUrl).toContain("https://custom.example.com/api/v2/test/");
  });

  it("throws GovApiError on non-200", async () => {
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ detail: "Not found" }), { status: 404 })
    ) as unknown as typeof fetch;

    expect(usaGet("/api/v2/test/", TestSchema)).rejects.toThrow("Not found");
  });

  it("retries on 429", async () => {
    let attempts = 0;
    globalThis.fetch = (async () => {
      attempts++;
      if (attempts === 1) {
        return new Response("", { status: 429 });
      }
      return new Response(JSON.stringify({ id: 1, name: "test" }), { status: 200 });
    }) as unknown as typeof fetch;

    const result = await usaGet("/api/v2/test/", TestSchema, undefined, { initialRetryMs: 1 });
    expect(result).toEqual({ id: 1, name: "test" });
    expect(attempts).toBe(2);
  });

  it("throws GovRateLimitError after max retries", async () => {
    globalThis.fetch = (async () =>
      new Response("", { status: 429 })
    ) as unknown as typeof fetch;

    expect(
      usaGet("/api/v2/test/", TestSchema, undefined, { maxRetries: 0 })
    ).rejects.toThrow("Rate limited");
  });
});

describe("usaPost", () => {
  it("sends POST with JSON body", async () => {
    let capturedInit: RequestInit | undefined;
    globalThis.fetch = (async (_url: string, init?: RequestInit) => {
      capturedInit = init;
      return new Response(JSON.stringify({ id: 1, name: "test" }), { status: 200 });
    }) as unknown as typeof fetch;

    const result = await usaPost("/api/v2/test/", TestSchema, { filters: { keyword: "NASA" } });
    expect(result).toEqual({ id: 1, name: "test" });
    expect(capturedInit?.method).toBe("POST");
    expect(capturedInit?.headers).toEqual({ "Content-Type": "application/json" });
    const body = JSON.parse(capturedInit?.body as string);
    expect(body.filters.keyword).toBe("NASA");
  });

  it("retries on 429", async () => {
    let attempts = 0;
    globalThis.fetch = (async () => {
      attempts++;
      if (attempts === 1) return new Response("", { status: 429 });
      return new Response(JSON.stringify({ id: 1, name: "test" }), { status: 200 });
    }) as unknown as typeof fetch;

    await usaPost("/api/v2/test/", TestSchema, {}, { initialRetryMs: 1 });
    expect(attempts).toBe(2);
  });

  it("throws on HTTP error with detail message", async () => {
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ detail: "Bad request" }), { status: 400 })
    ) as unknown as typeof fetch;

    expect(usaPost("/api/v2/test/", TestSchema, {})).rejects.toThrow("Bad request");
  });
});
