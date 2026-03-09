import { GovValidationError } from "govdata-core";
import type { GovDataPlugin } from "govdata-core";
import { timeseries, surveys, popular } from "./endpoints";
import { describe } from "./describe";
import type { BlsResult } from "./response";

export const blsPlugin: GovDataPlugin = {
  prefix: "bls",
  describe,
  endpoints: {
    timeseries: (params?: any) => {
      if (
        !params?.series_id ||
        (typeof params.series_id === "string" && params.series_id.trim() === "")
      ) {
        throw new GovValidationError("series_id", params?.series_id, "Required");
      }
      // Handle CLI string → array coercion for series_id
      const coerced = { ...params };
      if (typeof coerced.series_id === "string" && coerced.series_id.includes(",")) {
        coerced.series_id = coerced.series_id.split(",").map((s: string) => s.trim());
      }
      // Coerce boolean strings from CLI
      for (const key of ["calculations", "annual_averages", "catalog", "aspects"] as const) {
        if (coerced[key] === "true") coerced[key] = true;
        else if (coerced[key] === "false") coerced[key] = false;
      }
      // Coerce year numbers
      for (const key of ["start_year", "end_year"] as const) {
        if (coerced[key] != null) {
          const n = Number(coerced[key]);
          if (!Number.isFinite(n)) {
            throw new GovValidationError(key, coerced[key], "Must be a valid number");
          }
          coerced[key] = n;
        }
      }
      return timeseries(coerced);
    },
    surveys: () => surveys(),
    popular: (params?: any) => {
      const coerced: Record<string, unknown> = {};
      if (params?.survey != null) {
        coerced.survey = String(params.survey);
      }
      return popular(Object.keys(coerced).length > 0 ? coerced : undefined);
    },
  } as Record<string, (params?: any) => Promise<BlsResult>>,
};
