import type { ClientOptions } from "govdata-core";
import { usaPost } from "../../client";
import { SpendingByAgencyParamsSchema, SpendingByAgencyResponseSchema } from "./schemas";
import type { SpendingByAgencyParams } from "./types";
import { wrapResponse } from "../../response";
import type { USAResult } from "../../response";
import { validateParams } from "../../plugin-helpers";

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
