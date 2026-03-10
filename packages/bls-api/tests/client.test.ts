import { describe, it, expect, afterEach } from "bun:test";
import { z } from "zod";
import { GovRateLimitError } from "govdata-core";
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

describe("API key redaction", () => {
  it("in-band error messages do not contain API key", async () => {
    const originalKey = process.env.BLS_API_KEY;
    process.env.BLS_API_KEY = "SECRET_TEST_KEY_12345";

    mockFetch({
      status: "REQUEST_FAILED",
      responseTime: 1,
      message: ["Invalid series ID"],
      Results: {},
    });

    try {
      await blsPost("/timeseries/data/", SimpleSchema, {
        seriesid: ["BAD"],
        registrationkey: process.env.BLS_API_KEY,
      });
      expect(true).toBe(false); // should not reach
    } catch (err: any) {
      expect(err.message).not.toContain("SECRET_TEST_KEY_12345");
    } finally {
      if (originalKey != null) {
        process.env.BLS_API_KEY = originalKey;
      } else {
        delete process.env.BLS_API_KEY;
      }
    }
  });
});

describe("network error API key redaction", () => {
  it("redacts registrationkey from network error messages", async () => {
    const originalKey = process.env.BLS_API_KEY;
    process.env.BLS_API_KEY = "SECRET_NET_KEY_99999";

    globalThis.fetch = (() => {
      throw new Error("fetch failed: https://api.bls.gov/publicAPI/v2/surveys/?registrationkey=SECRET_NET_KEY_99999 ECONNREFUSED");
    }) as unknown as typeof fetch;

    try {
      await blsGet("/surveys/", SimpleSchema, { maxRetries: 0 });
      expect(true).toBe(false); // should not reach
    } catch (err: any) {
      expect(err.message).not.toContain("SECRET_NET_KEY_99999");
      expect(err.message).toContain("registrationkey=***");
    } finally {
      if (originalKey != null) {
        process.env.BLS_API_KEY = originalKey;
      } else {
        delete process.env.BLS_API_KEY;
      }
    }
  });

  it("does not modify network errors without registrationkey", async () => {
    globalThis.fetch = (() => {
      throw new Error("fetch failed: ECONNREFUSED");
    }) as unknown as typeof fetch;

    try {
      await blsGet("/surveys/", SimpleSchema, { maxRetries: 0 });
      expect(true).toBe(false);
    } catch (err: any) {
      expect(err.message).toBe("fetch failed: ECONNREFUSED");
    }
  });
});

describe("in-band rate limit detection", () => {
  it("throws GovRateLimitError for daily threshold message", async () => {
    mockFetch({
      status: "REQUEST_NOT_SERVICED",
      responseTime: 0,
      message: [
        "Request could not be serviced, as the daily threshold for total number of requests allocated to the user has been reached.",
      ],
      Results: {},
    });

    try {
      await blsGet("/surveys/", SimpleSchema);
      expect(true).toBe(false); // should not reach
    } catch (err: any) {
      expect(err).toBeInstanceOf(GovRateLimitError);
    }
  });

  it("throws GovApiError (not GovRateLimitError) for other in-band errors", async () => {
    mockFetch({
      status: "REQUEST_FAILED",
      responseTime: 1,
      message: ["Invalid series ID"],
      Results: {},
    });

    try {
      await blsGet("/surveys/", SimpleSchema);
      expect(true).toBe(false);
    } catch (err: any) {
      expect(err).not.toBeInstanceOf(GovRateLimitError);
      expect(err.message).toBe("Invalid series ID");
    }
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
