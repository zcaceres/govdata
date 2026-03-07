import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test";
import { z } from "zod";
import { dogeGet } from "../src/client";
import { DogeApiError, DogeRateLimitError } from "../src/errors";

const TestSchema = z.object({ success: z.literal(true), value: z.number() });

const originalFetch = globalThis.fetch;

function mockFetch(impl: (url: string) => Promise<Response>) {
  globalThis.fetch = impl as unknown as typeof fetch;
}

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("dogeGet", () => {
  it("fetches and parses a successful response", async () => {
    mockFetch(async () =>
      new Response(JSON.stringify({ success: true, value: 42 }), {
        status: 200,
      }),
    );

    const result = await dogeGet("/test", TestSchema);
    expect(result).toEqual({ success: true, value: 42 });
  });

  it("builds URL with query params", async () => {
    let capturedUrl = "";
    mockFetch(async (url) => {
      capturedUrl = url;
      return new Response(JSON.stringify({ success: true, value: 1 }), {
        status: 200,
      });
    });

    await dogeGet("/test", TestSchema, { page: 2, per_page: 10 });
    expect(capturedUrl).toContain("page=2");
    expect(capturedUrl).toContain("per_page=10");
  });

  it("skips undefined params", async () => {
    let capturedUrl = "";
    mockFetch(async (url) => {
      capturedUrl = url;
      return new Response(JSON.stringify({ success: true, value: 1 }), {
        status: 200,
      });
    });

    await dogeGet("/test", TestSchema, { page: 1, sort: undefined });
    expect(capturedUrl).toContain("page=1");
    expect(capturedUrl).not.toContain("sort");
  });

  it("throws DogeApiError on non-429 error", async () => {
    mockFetch(async () =>
      new Response(JSON.stringify({ success: false, message: "Bad request" }), {
        status: 400,
      }),
    );

    expect(dogeGet("/test", TestSchema)).rejects.toBeInstanceOf(DogeApiError);
  });

  it("retries on 429 and succeeds", async () => {
    let attempts = 0;
    mockFetch(async () => {
      attempts++;
      if (attempts === 1) {
        return new Response("", { status: 429 });
      }
      return new Response(JSON.stringify({ success: true, value: 99 }), {
        status: 200,
      });
    });

    const result = await dogeGet("/test", TestSchema, undefined, {
      maxRetries: 3,
      initialRetryMs: 10,
    });
    expect(result.value).toBe(99);
    expect(attempts).toBe(2);
  });

  it("throws DogeRateLimitError after exhausting retries", async () => {
    mockFetch(async () => new Response("", { status: 429 }));

    expect(
      dogeGet("/test", TestSchema, undefined, {
        maxRetries: 1,
        initialRetryMs: 10,
      }),
    ).rejects.toBeInstanceOf(DogeRateLimitError);
  });

  it("throws on schema validation failure", async () => {
    mockFetch(async () =>
      new Response(JSON.stringify({ wrong: "shape" }), { status: 200 }),
    );

    expect(dogeGet("/test", TestSchema)).rejects.toThrow();
  });
});
