import { describe, it, expect } from "bun:test";
import { GovApiError, GovRateLimitError, GovValidationError } from "../src/errors";

describe("GovApiError", () => {
  it("stores status and message", () => {
    const err = new GovApiError(404, "Not found");
    expect(err.status).toBe(404);
    expect(err.message).toBe("Not found");
    expect(err.name).toBe("GovApiError");
    expect(err).toBeInstanceOf(Error);
  });
});

describe("GovRateLimitError", () => {
  it("is a GovApiError with 429 status", () => {
    const err = new GovRateLimitError(5000);
    expect(err.status).toBe(429);
    expect(err.retryAfterMs).toBe(5000);
    expect(err).toBeInstanceOf(GovApiError);
  });

  it("accepts null retryAfterMs", () => {
    const err = new GovRateLimitError(null);
    expect(err.retryAfterMs).toBeNull();
  });
});

describe("GovValidationError", () => {
  it("formats message with field info", () => {
    const err = new GovValidationError("sort_by", "invalid", "'savings' | 'value'");
    expect(err.field).toBe("sort_by");
    expect(err.received).toBe("invalid");
    expect(err.expected).toBe("'savings' | 'value'");
    expect(err.message).toContain("sort_by");
    expect(err).toBeInstanceOf(Error);
  });
});
