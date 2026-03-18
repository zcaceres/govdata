import { z } from "zod";
import { govGet } from "govdata-core";
import type { ClientOptions } from "govdata-core";

const BASE_URL = "https://www.saferproducts.gov";

/**
 * GET from the CPSC SaferProducts API. Always appends format=json.
 * Uses govGet under the hood — standard query params work fine.
 */
export async function cpscGet<T>(
  path: string,
  schema: z.ZodType<T>,
  params?: Record<string, unknown>,
  options?: ClientOptions,
): Promise<T> {
  return govGet(path, schema, { ...params, format: "json" }, {
    baseUrl: BASE_URL,
    ...options,
  });
}
