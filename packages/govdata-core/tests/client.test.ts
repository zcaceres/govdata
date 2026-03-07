import { describe, it, expect, afterEach } from "bun:test";
import { z } from "zod";
import { govGet } from "../src/client";
import { GovApiError, GovRateLimitError } from "../src/errors";

const TestSchema = z.object({ success: z.literal(true), value: z.number() });
const ErrorSchema = z.object({ success: z.literal(false), message: z.string() });

const originalFetch = globalThis.fetch;

function mockFetch(impl: (url: string) => Promise<Response>) {
  globalThis.fetch = impl as unknown as typeof fetch;
}

afterEach(() => {
  globalThis.fetch = originalFetch;
});

const baseOpts = { baseUrl: "https://api.example.gov" };

describe("govGet", () => {
  it("fetches and parses a successful response", async () => {
    mockFetch(async () =>
      new Response(JSON.stringify({ success: true, value: 42 }), { status: 200 }),
    );

    const result = await govGet("/test", TestSchema, undefined, baseOpts);
    expect(result).toEqual({ success: true, value: 42 });
  });

  it("builds URL with query params", async () => {
    let capturedUrl = "";
    mockFetch(async (url) => {
      capturedUrl = url;
      return new Response(JSON.stringify({ success: true, value: 1 }), { status: 200 });
    });

    await govGet("/test", TestSchema, { page: 2, per_page: 10 }, baseOpts);
    expect(capturedUrl).toContain("page=2");
    expect(capturedUrl).toContain("per_page=10");
  });

  it("throws GovApiError on non-429 error with errorSchema", async () => {
    mockFetch(async () =>
      new Response(JSON.stringify({ success: false, message: "Bad request" }), { status: 400 }),
    );

    expect(
      govGet("/test", TestSchema, undefined, { ...baseOpts, errorSchema: ErrorSchema }),
    ).rejects.toBeInstanceOf(GovApiError);
  });

  it("retries on 429 and succeeds", async () => {
    let attempts = 0;
    mockFetch(async () => {
      attempts++;
      if (attempts === 1) {
        return new Response("", { status: 429 });
      }
      return new Response(JSON.stringify({ success: true, value: 99 }), { status: 200 });
    });

    const result = await govGet("/test", TestSchema, undefined, {
      ...baseOpts,
      maxRetries: 3,
      initialRetryMs: 10,
    });
    expect(result.value).toBe(99);
    expect(attempts).toBe(2);
  });

  it("throws GovRateLimitError after exhausting retries", async () => {
    mockFetch(async () => new Response("", { status: 429 }));

    expect(
      govGet("/test", TestSchema, undefined, {
        ...baseOpts,
        maxRetries: 1,
        initialRetryMs: 10,
      }),
    ).rejects.toBeInstanceOf(GovRateLimitError);
  });

  it("requires baseUrl", async () => {
    expect(govGet("/test", TestSchema)).rejects.toThrow("baseUrl is required");
  });
});
