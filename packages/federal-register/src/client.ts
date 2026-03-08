import { z } from "zod";
import { GovApiError, GovRateLimitError } from "govdata-core";
import type { ClientOptions } from "govdata-core";
import { serializeParams } from "./params";

const BASE_URL = "https://www.federalregister.gov/api/v1";
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_INITIAL_RETRY_MS = 1000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Custom fetch for Federal Register API.
 * Uses bracket-syntax param serialization (can't use govGet's url.searchParams.set).
 */
export async function frGet<T>(
  path: string,
  schema: z.ZodType<T>,
  params?: Record<string, unknown>,
  options?: ClientOptions,
): Promise<T> {
  const baseUrl = options?.baseUrl ?? BASE_URL;
  const maxRetries = options?.maxRetries ?? DEFAULT_MAX_RETRIES;
  const initialRetryMs = options?.initialRetryMs ?? DEFAULT_INITIAL_RETRY_MS;

  const qs = params ? serializeParams(params) : "";
  const url = qs ? `${baseUrl}${path}?${qs}` : `${baseUrl}${path}`;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(url);

    if (response.status === 429) {
      if (attempt === maxRetries) {
        const retryAfter = response.headers.get("retry-after");
        throw new GovRateLimitError(
          retryAfter ? parseInt(retryAfter, 10) * 1000 : null,
        );
      }
      await sleep(initialRetryMs * 2 ** attempt);
      continue;
    }

    if (!response.ok) {
      let message = `HTTP ${response.status}`;
      const contentType = response.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        try {
          const body = await response.json();
          if (body && typeof body === "object" && "message" in body) {
            message = String(body.message);
          }
        } catch {}
      } else if (response.status === 404) {
        message = "Not found";
      }
      throw new GovApiError(response.status, message);
    }

    const json = await response.json();
    return schema.parse(json);
  }

  throw new GovRateLimitError(null);
}
