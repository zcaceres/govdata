import { z } from "zod";
import type { ClientOptions } from "govdata-core";
import { USAValidationError } from "../../errors";
import { usaPost } from "../../client";
import { SpendingByAgencyParamsSchema, SpendingByAgencyResponseSchema } from "./schemas";
import type { SpendingByAgencyParams } from "./types";
import { wrapResponse } from "../../response";
import type { USAResult } from "../../response";

function validateParams<T>(schema: z.ZodType<T>, params: Record<string, unknown>): T {
  try {
    return schema.parse(params);
  } catch (err) {
    if (err instanceof z.ZodError) {
      const issue = err.issues[0];
      const field = issue.path.join(".");
      const expected = issue.message;
      throw new USAValidationError(field, (params as any)?.[field], expected);
    }
    throw err;
  }
}

export async function _spendingByAgency(
  params: SpendingByAgencyParams,
  options?: ClientOptions,
): Promise<USAResult<"spending_by_agency">> {
  const validated = validateParams(SpendingByAgencyParamsSchema, params);
  const raw = await usaPost(
    "/api/v2/spending/",
    SpendingByAgencyResponseSchema,
    validated,
    options,
  );

  return wrapResponse(
    raw.results,
    { total_results: raw.results.length, pages: 1 },
    "spending_by_agency",
  );
}
