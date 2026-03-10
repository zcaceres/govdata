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
        params.series_id === true ||
        (typeof params.series_id === "string" && params.series_id.trim() === "")
      ) {
        throw new GovValidationError("series_id", params?.series_id, "Required");
      }
      // Handle CLI string → array coercion for series_id
      const coerced = { ...params };
      if (typeof coerced.series_id === "string") {
        if (coerced.series_id.includes(",")) {
          coerced.series_id = coerced.series_id.split(",").map((s: string) => s.trim()).filter(Boolean);
        } else if (coerced.series_id.includes(" ")) {
          coerced.series_id = coerced.series_id.split(/\s+/).filter(Boolean);
        }
      }
      // Guard against empty array after splitting (e.g. "," or "  ")
      if (Array.isArray(coerced.series_id) && coerced.series_id.length === 0) {
        throw new GovValidationError("series_id", params.series_id, "Required");
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
          if (!Number.isFinite(n) || n < 1900) {
            throw new GovValidationError(key, coerced[key], "Must be a valid year (>= 1900)");
          }
          coerced[key] = n;
        }
      }
      // Check year ordering after coercion
      if (coerced.start_year != null && coerced.end_year != null && coerced.start_year > coerced.end_year) {
        throw new GovValidationError("start_year", coerced.start_year, "start_year must be <= end_year");
      }
      return timeseries(coerced);
    },
    surveys: () => surveys(),
    popular: (params?: any) => {
      if (!params || Object.keys(params).length === 0) return popular();
      const coerced = { ...params };
      if (coerced.survey != null) {
        if (coerced.survey === true || (typeof coerced.survey === "string" && coerced.survey.trim() === "")) {
          throw new GovValidationError("survey", coerced.survey, "Survey abbreviation required (e.g. CU, LN)");
        }
        coerced.survey = String(coerced.survey);
      }
      return popular(coerced);
    },
  } as Record<string, (params?: any) => Promise<BlsResult>>,
};
