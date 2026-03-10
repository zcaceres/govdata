export class GovApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "GovApiError";
  }
}

export class GovRateLimitError extends GovApiError {
  constructor(
    public readonly retryAfterMs: number | null,
  ) {
    super(429, "Rate limited");
    this.name = "GovRateLimitError";
  }
}

export class GovValidationError extends Error {
  name = "GovValidationError";
  constructor(
    public readonly field: string,
    public readonly received: unknown,
    public readonly expected: string,
  ) {
    super(received === undefined ? `${field}: ${expected}` : `${field}: ${expected} (got '${String(received)}')`);
  }
}
