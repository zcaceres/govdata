import type { GovResult } from "govdata-core";
import { GovValidationError } from "govdata-core";
import { z } from "zod";
import { USAValidationError } from "./errors";
import { AwardTypeCodes } from "./shared-schemas";

export function toNumber(val: unknown): number | undefined {
  if (val == null) return undefined;
  const n = Number(val);
  return Number.isFinite(n) ? n : undefined;
}

/**
 * Build nested filters object from flat CLI/MCP params.
 * Used by search endpoints that accept the AdvancedFilterObject.
 */
export function buildFilters(params: Record<string, unknown>) {
  const filters: Record<string, unknown> = {};

  if (params.keyword != null) {
    filters.keywords = [String(params.keyword)];
  }

  if (params.start_date != null || params.end_date != null) {
    filters.time_period = [{
      start_date: String(params.start_date ?? "2000-01-01"),
      end_date: String(params.end_date ?? "2099-12-31"),
    }];
  }

  if (params.award_type != null) {
    const typeKey = String(params.award_type) as keyof typeof AwardTypeCodes;
    const codes = AwardTypeCodes[typeKey];
    if (codes) {
      filters.award_type_codes = [...codes];
    } else {
      throw new GovValidationError(
        "award_type",
        params.award_type,
        `one of: ${Object.keys(AwardTypeCodes).join(", ")}`,
      );
    }
  }

  if (params.agency != null) {
    filters.agencies = [{
      type: "awarding",
      tier: "toptier",
      name: String(params.agency),
    }];
  }

  if (params.naics_code != null) {
    filters.naics_codes = { require: [String(params.naics_code)] };
  }

  if (params.recipient != null) {
    filters.recipient_search_text = [String(params.recipient)];
  }

  if (params.state != null) {
    filters.place_of_performance_locations = [{
      country: "USA",
      state: String(params.state),
    }];
  }

  return filters;
}

export function validateParams<T>(schema: z.ZodType<T>, params: Record<string, unknown>): T {
  try {
    return schema.parse(params);
  } catch (err) {
    if (err instanceof z.ZodError) {
      const issue = err.issues[0];
      const field = issue.path.join(".");
      const expected = issue.message;
      let val: unknown = params;
      for (const seg of issue.path) val = (val as any)?.[seg];
      throw new USAValidationError(field, val, expected);
    }
    throw err;
  }
}

