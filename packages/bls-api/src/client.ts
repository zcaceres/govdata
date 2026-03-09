import { z } from "zod";
import { GovApiError, GovRateLimitError } from "govdata-core";
import type { ClientOptions } from "govdata-core";

const BASE_URL = "https://api.bls.gov/publicAPI/v2";
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_INITIAL_RETRY_MS = 1000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function _fetchWithRetry(
  url: string,
  init: RequestInit | undefined,
  maxRetries: number,
  initialRetryMs: number,
): Promise<Response> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(url, init);

    if (response.status === 429) {
      if (attempt === maxRetries) {
        const retryAfter = response.headers.get("retry-after");
        const ms = retryAfter ? parseInt(retryAfter, 10) * 1000 : null;
        throw new GovRateLimitError(ms && Number.isFinite(ms) ? ms : null);
      }
      await sleep(initialRetryMs * 2 ** attempt);
      continue;
    }

    if (!response.ok) {
      let message = `HTTP ${response.status}`;
      try {
        const body = await response.json();
        if (body && typeof body === "object") {
          if ("message" in body && Array.isArray(body.message) && body.message.length > 0) {
            message = body.message.join("; ");
          }
        }
      } catch {}
      throw new GovApiError(response.status, message);
    }

    return response;
  }

  throw new GovRateLimitError(null);
}

function isRateLimitMessage(messages: string[]): boolean {
  return messages.some(
    (m) => m.includes("daily threshold") || m.includes("daily quota"),
  );
}

function checkBLSStatus(json: { status?: string; message?: string[] }): void {
  if (json.status && json.status !== "REQUEST_SUCCEEDED") {
    const msg =
      json.message && json.message.length > 0
        ? json.message.join("; ")
        : "BLS request failed";
    if (json.message && isRateLimitMessage(json.message)) {
      throw new GovRateLimitError(null);
    }
    throw new GovApiError(200, msg);
  }
}

export async function blsPost<T>(
  path: string,
  schema: z.ZodType<T>,
  body: unknown,
  options?: ClientOptions,
): Promise<T> {
  const baseUrl = options?.baseUrl ?? BASE_URL;
  const maxRetries = options?.maxRetries ?? DEFAULT_MAX_RETRIES;
  const initialRetryMs = options?.initialRetryMs ?? DEFAULT_INITIAL_RETRY_MS;

  const url = `${baseUrl}${path}`;
  const init: RequestInit = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };

  const response = await _fetchWithRetry(url, init, maxRetries, initialRetryMs);
  const json = await response.json();
  checkBLSStatus(json);
  return schema.parse(json);
}

export async function blsGet<T>(
  path: string,
  schema: z.ZodType<T>,
  options?: ClientOptions,
): Promise<T> {
  const baseUrl = options?.baseUrl ?? BASE_URL;
  const maxRetries = options?.maxRetries ?? DEFAULT_MAX_RETRIES;
  const initialRetryMs = options?.initialRetryMs ?? DEFAULT_INITIAL_RETRY_MS;

  const url = `${baseUrl}${path}`;
  const response = await _fetchWithRetry(url, undefined, maxRetries, initialRetryMs);
  const json = await response.json();
  checkBLSStatus(json);
  return schema.parse(json);
}
