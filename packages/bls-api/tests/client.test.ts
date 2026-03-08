import { describe, it, expect, afterEach } from "bun:test";
import { z } from "zod";
import { blsPost, blsGet } from "../src/client";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function mockFetch(body: unknown, status = 200) {
  globalThis.fetch = (async () =>
    new Response(JSON.stringify(body), { status })) as unknown as typeof fetch;
}

const SimpleSchema = z.object({
  status: z.string(),
  responseTime: z.number(),
  message: z.array(z.string()),
  Results: z.unknown(),
});

describe("blsPost", () => {
  it("sends correct POST body with Content-Type header", async () => {
    let capturedInit: RequestInit | undefined;
    globalThis.fetch = (async (_url: any, init?: RequestInit) => {
      capturedInit = init;
      return new Response(
        JSON.stringify({ status: "REQUEST_SUCCEEDED", responseTime: 1, message: [], Results: {} }),
        { status: 200 },
      );
    }) as unknown as typeof fetch;

    await blsPost("/timeseries/data/", SimpleSchema, { seriesid: ["CUUR0000SA0"] });

    expect(capturedInit?.method).toBe("POST");
    expect((capturedInit?.headers as Record<string, string>)["Content-Type"]).toBe("application/json");
    const parsed = JSON.parse(capturedInit?.body as string);
    expect(parsed.seriesid).toEqual(["CUUR0000SA0"]);
  });

  it("throws on in-band error (HTTP 200 + REQUEST_FAILED)", async () => {
    mockFetch({
      status: "REQUEST_FAILED",
      responseTime: 1,
      message: ["Series not found", "Invalid ID"],
      Results: {},
    });

    await expect(blsPost("/timeseries/data/", SimpleSchema, {})).rejects.toThrow(
      "Series not found; Invalid ID",
    );
  });

  it("throws on HTTP error", async () => {
    mockFetch({ message: ["Server error"] }, 500);

    await expect(
      blsPost("/timeseries/data/", SimpleSchema, {}, { maxRetries: 0 }),
    ).rejects.toThrow();
  });
});

describe("blsGet", () => {
  it("makes GET request", async () => {
    let capturedMethod: string | undefined;
    globalThis.fetch = (async (_url: any, init?: RequestInit) => {
      capturedMethod = init?.method;
      return new Response(
        JSON.stringify({ status: "REQUEST_SUCCEEDED", responseTime: 1, message: [], Results: {} }),
        { status: 200 },
      );
    }) as unknown as typeof fetch;

    await blsGet("/surveys/", SimpleSchema);

    // fetch without init = GET by default
    expect(capturedMethod).toBeUndefined();
  });

  it("throws on in-band error", async () => {
    mockFetch({
      status: "REQUEST_FAILED",
      responseTime: 1,
      message: ["Unavailable"],
      Results: {},
    });

    await expect(blsGet("/surveys/", SimpleSchema)).rejects.toThrow("Unavailable");
  });
});

describe("retry on 429", () => {
  it("retries and succeeds", async () => {
    let attempt = 0;
    globalThis.fetch = (async () => {
      attempt++;
      if (attempt === 1) {
        return new Response("", { status: 429 });
      }
      return new Response(
        JSON.stringify({ status: "REQUEST_SUCCEEDED", responseTime: 1, message: [], Results: {} }),
        { status: 200 },
      );
    }) as unknown as typeof fetch;

    const result = await blsGet("/surveys/", SimpleSchema, { initialRetryMs: 1 });
    expect(result.status).toBe("REQUEST_SUCCEEDED");
    expect(attempt).toBe(2);
  });
});
