import { z } from "zod";
import { GovApiError, GovRateLimitError } from "./errors";
import type { ClientOptions } from "./types";

const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_INITIAL_RETRY_MS = 1000;

function buildUrl(
  path: string,
  params?: Record<string, unknown>,
  baseUrl?: string,
): string {
  const url = new URL(path, baseUrl);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function govGet<T>(
  path: string,
  schema: z.ZodType<T>,
  params?: Record<string, unknown>,
  options?: ClientOptions & { errorSchema?: z.ZodType<{ message: string }> },
): Promise<T> {
  const maxRetries = options?.maxRetries ?? DEFAULT_MAX_RETRIES;
  const initialRetryMs = options?.initialRetryMs ?? DEFAULT_INITIAL_RETRY_MS;

  if (!options?.baseUrl) {
    throw new GovApiError(0, "baseUrl is required");
  }

  const url = buildUrl(path, params, options.baseUrl);

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(url);

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
      if (options?.errorSchema) {
        const parsed = options.errorSchema.safeParse(await response.json());
        if (parsed.success) message = parsed.data.message;
      } else {
        try {
          const body = await response.json();
          if (body && typeof body === "object" && "message" in body) {
            message = String(body.message);
          }
        } catch {}
      }
      throw new GovApiError(response.status, message);
    }

    const json = await response.json();
    return schema.parse(json);
  }

  throw new GovRateLimitError(null);
}
