export class DogeApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "DogeApiError";
  }
}

export class DogeRateLimitError extends DogeApiError {
  constructor(
    public readonly retryAfterMs: number | null,
  ) {
    super(429, "Rate limited");
    this.name = "DogeRateLimitError";
  }
}

export class DogeValidationError extends Error {
  name = "DogeValidationError";
  constructor(
    public readonly field: string,
    public readonly received: unknown,
    public readonly expected: string,
  ) {
    super(`${field} must be ${expected}, got '${String(received)}'`);
  }
}
