import { z } from "zod";
import { DogeApiError, DogeRateLimitError } from "./errors";
import { ErrorResponseSchema } from "./schemas";
import type { ClientOptions } from "./types";

const BASE_URL = "https://api.doge.gov";
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_INITIAL_RETRY_MS = 1000;

function buildUrl(
  path: string,
  params?: Record<string, unknown>,
  baseUrl?: string,
): string {
  const url = new URL(path, baseUrl ?? BASE_URL);
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

async function parseErrorMessage(response: Response): Promise<string> {
  const parsed = ErrorResponseSchema.safeParse(await response.json());
  if (parsed.success) return parsed.data.message;
  return `HTTP ${response.status}`;
}

export async function dogeGet<T>(
  path: string,
  schema: z.ZodType<T>,
  params?: Record<string, unknown>,
  options?: ClientOptions,
): Promise<T> {
  const maxRetries = options?.maxRetries ?? DEFAULT_MAX_RETRIES;
  const initialRetryMs = options?.initialRetryMs ?? DEFAULT_INITIAL_RETRY_MS;
  const url = buildUrl(path, params, options?.baseUrl);

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(url);

    if (response.status === 429) {
      if (attempt === maxRetries) {
        const retryAfter = response.headers.get("retry-after");
        throw new DogeRateLimitError(
          retryAfter ? parseInt(retryAfter, 10) * 1000 : null,
        );
      }
      await sleep(initialRetryMs * 2 ** attempt);
      continue;
    }

    if (!response.ok) {
      throw new DogeApiError(
        response.status,
        await parseErrorMessage(response),
      );
    }

    const json = await response.json();
    return schema.parse(json);
  }

  throw new DogeRateLimitError(null);
}
