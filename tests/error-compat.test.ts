import { describe, it, expect } from "bun:test";
import {
  GovApiError,
  GovRateLimitError,
  GovValidationError,
} from "govdata-core";
import {
  DogeApiError,
  DogeRateLimitError,
  DogeValidationError,
} from "doge-api";

/**
 * Error compatibility tests — verify that plugin-aliased error classes
 * are the exact same class as core, so instanceof works across boundaries.
 * When adding a new plugin with error aliases, add tests here.
 */

describe("error class aliasing", () => {
  it("DogeApiError is GovApiError", () => {
    expect(DogeApiError).toBe(GovApiError);
  });

  it("DogeRateLimitError is GovRateLimitError", () => {
    expect(DogeRateLimitError).toBe(GovRateLimitError);
  });

  it("DogeValidationError is GovValidationError", () => {
    expect(DogeValidationError).toBe(GovValidationError);
  });
});

describe("cross-boundary instanceof", () => {
  it("GovApiError thrown in core is catchable as DogeApiError", () => {
    const err = new GovApiError(400, "test");
    expect(err).toBeInstanceOf(DogeApiError);
    expect(err).toBeInstanceOf(GovApiError);
    expect(err).toBeInstanceOf(Error);
  });

  it("DogeRateLimitError is instanceof both rate limit and api error", () => {
    const err = new DogeRateLimitError(5000);
    expect(err).toBeInstanceOf(GovRateLimitError);
    expect(err).toBeInstanceOf(GovApiError);
    expect(err).toBeInstanceOf(DogeApiError);
    expect(err).toBeInstanceOf(Error);
  });

  it("GovValidationError thrown in core is catchable as DogeValidationError", () => {
    const err = new GovValidationError("field", "bad", "good");
    expect(err).toBeInstanceOf(DogeValidationError);
    expect(err).toBeInstanceOf(Error);
  });
});
