import { describe, it, expect, afterEach } from "bun:test";
import { z } from "zod";
import { cpscGet } from "../src/client";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function mockFetch(body: unknown, status = 200) {
  globalThis.fetch = (async () =>
    new Response(JSON.stringify(body), { status })) as unknown as typeof fetch;
}

const ArraySchema = z.array(z.object({ id: z.number() }));

describe("cpscGet", () => {
  it("sends GET request with format=json", async () => {
    let capturedUrl = "";
    globalThis.fetch = (async (url: any) => {
      capturedUrl = url.toString();
      return new Response(JSON.stringify([{ id: 1 }]), { status: 200 });
    }) as unknown as typeof fetch;

    await cpscGet("/RestWebServices/Recall", ArraySchema, { RecallID: "10141" });

    expect(capturedUrl).toContain("format=json");
    expect(capturedUrl).toContain("RecallID=10141");
    expect(capturedUrl).toContain("saferproducts.gov");
  });

  it("always includes format=json even without params", async () => {
    let capturedUrl = "";
    globalThis.fetch = (async (url: any) => {
      capturedUrl = url.toString();
      return new Response(JSON.stringify([{ id: 1 }]), { status: 200 });
    }) as unknown as typeof fetch;

    await cpscGet("/RestWebServices/Recall", ArraySchema);

    expect(capturedUrl).toContain("format=json");
  });

  it("throws on HTTP error", async () => {
    mockFetch({ message: "Not found" }, 404);

    await expect(
      cpscGet("/RestWebServices/Recall", ArraySchema, {}, { maxRetries: 0 }),
    ).rejects.toThrow();
  });

  it("parses response with Zod schema", async () => {
    mockFetch([{ id: 42 }]);

    const result = await cpscGet("/RestWebServices/Recall", ArraySchema);
    expect(result).toEqual([{ id: 42 }]);
  });

  it("retries on 429", async () => {
    let attempt = 0;
    globalThis.fetch = (async () => {
      attempt++;
      if (attempt === 1) {
        return new Response("", { status: 429 });
      }
      return new Response(JSON.stringify([{ id: 1 }]), { status: 200 });
    }) as unknown as typeof fetch;

    const result = await cpscGet("/RestWebServices/Recall", ArraySchema, {}, { initialRetryMs: 1 });
    expect(result).toEqual([{ id: 1 }]);
    expect(attempt).toBe(2);
  });
});
