import { createResult, GovValidationError } from "govdata-core";
import type { GovDataPlugin, GovResult } from "govdata-core";
import { classifySearchError, isValidNaicsFormat, parseCodesList, parseLevel, parsePagination } from "./params";
import { createNaics } from "./lib";
import { describe } from "./describe";
import type { NaicsYear } from "./types";
import { SUPPORTED_YEARS } from "./types";

function parseYear(yearStr?: string | number): NaicsYear {
  if (yearStr == null) return 2022;
  const year = typeof yearStr === "number" ? yearStr : parseInt(yearStr, 10);
  if (!Number.isFinite(year) || !SUPPORTED_YEARS.includes(year as NaicsYear)) {
    throw new GovValidationError("year", yearStr, `one of ${SUPPORTED_YEARS.join(", ")}`);
  }
  return year as NaicsYear;
}

function db(params?: Record<string, unknown>) {
  return createNaics({ year: parseYear(params?.year as string | number | undefined) });
}

function validateCode(code: unknown, paramName = "code"): string {
  if (code == null) throw new GovValidationError(paramName, undefined, "required NAICS code string");
  const str = String(code);
  if (!isValidNaicsFormat(str)) {
    throw new GovValidationError(paramName, str, "valid NAICS code (2-6 digits or range like 31-33)");
  }
  return str;
}

async function sectors(params?: Record<string, unknown>): Promise<GovResult> {
  const data = db(params).codes.sectors();
  return createResult(data, null, "sectors");
}

async function get(params?: Record<string, unknown>): Promise<GovResult> {
  const code = validateCode(params?.code);
  const result = db(params).codes.get(code);
  if (!result) {
    return createResult([], null, "get");
  }
  return createResult([result], null, "get");
}

async function batch(params?: Record<string, unknown>): Promise<GovResult> {
  if (params?.codes == null) throw new GovValidationError("codes", undefined, "required comma-separated NAICS codes");
  const codesStr = String(params.codes);
  const parsed = parseCodesList(codesStr);
  if (!parsed.ok) throw new GovValidationError("codes", codesStr, parsed.error);
  const data = db(params).codes.batch(parsed.codes);
  return createResult(data, null, "batch");
}

async function children(params?: Record<string, unknown>): Promise<GovResult> {
  const code = validateCode(params?.code);
  const data = db(params).codes.children(code);
  return createResult(data, null, "children");
}

async function ancestors(params?: Record<string, unknown>): Promise<GovResult> {
  const code = validateCode(params?.code);
  const data = db(params).codes.ancestors(code);
  return createResult(data, null, "ancestors");
}

async function descendants(params?: Record<string, unknown>): Promise<GovResult> {
  const code = validateCode(params?.code);
  const pag = parsePagination(
    params?.limit != null ? String(params.limit) : undefined,
    params?.offset != null ? String(params.offset) : undefined,
    { defaultLimit: 100, maxLimit: 500 },
  );
  if (!pag.ok) throw new GovValidationError("pagination", `limit=${params?.limit}, offset=${params?.offset}`, pag.error);
  const result = db(params).codes.descendants(code, { limit: pag.limit, offset: pag.offset });
  const pages = Math.ceil(result.total / pag.limit);
  return createResult(result.data, { total_results: result.total, pages }, "descendants");
}

async function search(params?: Record<string, unknown>): Promise<GovResult> {
  if (params?.q == null || typeof params.q !== "string" || params.q.trim() === "") {
    throw new GovValidationError("q", params?.q, "non-empty search query string");
  }
  const query = params.q;

  const levelStr = params?.level != null ? String(params.level) : undefined;
  const levelResult = parseLevel(levelStr);
  if (!levelResult.ok) throw new GovValidationError("level", params?.level, levelResult.error);

  const pag = parsePagination(
    params?.limit != null ? String(params.limit) : undefined,
    params?.offset != null ? String(params.offset) : undefined,
    { defaultLimit: 20, maxLimit: 100 },
  );
  if (!pag.ok) throw new GovValidationError("pagination", `limit=${params?.limit}, offset=${params?.offset}`, pag.error);

  let result;
  try {
    result = db(params).search(query, { limit: pag.limit, offset: pag.offset, level: levelResult.value });
  } catch (err) {
    if (classifySearchError(err) === "invalid_syntax") {
      throw new GovValidationError("q", query, "valid search query");
    }
    throw err;
  }
  const pages = Math.ceil(result.total / pag.limit);
  return createResult(result.data, { total_results: result.total, pages }, "search");
}

async function cross_references(params?: Record<string, unknown>): Promise<GovResult> {
  const code = validateCode(params?.code);
  const data = db(params).codes.crossReferences(code);
  return createResult(data, null, "cross_references");
}

async function index_entries(params?: Record<string, unknown>): Promise<GovResult> {
  const code = validateCode(params?.code);
  const data = db(params).codes.indexEntries(code);
  return createResult(data, null, "index_entries");
}

export const naicsPlugin: GovDataPlugin = {
  prefix: "naics",
  describe,
  endpoints: {
    sectors,
    get,
    batch,
    children,
    ancestors,
    descendants,
    search,
    cross_references,
    index_entries,
  },
};
