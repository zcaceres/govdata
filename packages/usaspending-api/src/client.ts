import { z } from "zod";
import { GovApiError, GovRateLimitError } from "govdata-core";
import type { ClientOptions } from "govdata-core";

const BASE_URL = "https://api.usaspending.gov";
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
        const retryMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : null;
        throw new GovRateLimitError(
          Number.isFinite(retryMs) ? retryMs : null,
        );
      }
      await sleep(initialRetryMs * 2 ** attempt);
      continue;
    }

    if (!response.ok) {
      let message = `HTTP ${response.status}`;
      try {
        const body = await response.json();
        if (body && typeof body === "object") {
          if ("detail" in body) message = String(body.detail);
          else if ("message" in body) message = String(body.message);
          else if ("messages" in body && Array.isArray(body.messages)) message = body.messages.join("; ");
        }
      } catch {}
      throw new GovApiError(response.status, message);
    }

    return response;
  }

  throw new GovRateLimitError(null);
}

export async function usaGet<T>(
  path: string,
  schema: z.ZodType<T>,
  params?: Record<string, unknown>,
  options?: ClientOptions,
): Promise<T> {
  const baseUrl = options?.baseUrl ?? BASE_URL;
  const maxRetries = options?.maxRetries ?? DEFAULT_MAX_RETRIES;
  const initialRetryMs = options?.initialRetryMs ?? DEFAULT_INITIAL_RETRY_MS;

  const url = new URL(`${baseUrl}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value != null) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const response = await _fetchWithRetry(url.toString(), undefined, maxRetries, initialRetryMs);
  const json = await response.json();
  return schema.parse(json);
}

export async function usaPost<T>(
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
  return schema.parse(json);
}
