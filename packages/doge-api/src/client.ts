import { z } from "zod";
import { govGet } from "govdata-core";
import { ErrorResponseSchema } from "./schemas";
import type { ClientOptions } from "./types";

const BASE_URL = "https://api.doge.gov";

export async function dogeGet<T>(
  path: string,
  schema: z.ZodType<T>,
  params?: Record<string, unknown>,
  options?: ClientOptions,
): Promise<T> {
  return govGet(path, schema, params, {
    ...options,
    baseUrl: options?.baseUrl ?? BASE_URL,
    errorSchema: ErrorResponseSchema,
  });
}
