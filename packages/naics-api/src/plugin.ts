import { createResult, GovValidationError } from "govdata-core";
import type { GovDataPlugin, GovResult } from "govdata-core";
import { classifySearchError } from "./params";
import { createNaics } from "./lib";
import { describe } from "./describe";
import type { NaicsYear } from "./types";
import { SUPPORTED_YEARS } from "./types";

function parseYear(yearStr?: string | number): NaicsYear {
  if (yearStr == null) return 2022;
  const year = typeof yearStr === "number" ? yearStr : parseInt(yearStr, 10);
  if (!SUPPORTED_YEARS.includes(year as NaicsYear)) {
    throw new Error(`Unsupported year: ${yearStr}. Supported: ${SUPPORTED_YEARS.join(", ")}`);
  }
  return year as NaicsYear;
}

function db(params?: Record<string, unknown>) {
  return createNaics({ year: parseYear(params?.year as string | number | undefined) });
}

async function sectors(params?: Record<string, unknown>): Promise<GovResult> {
  const data = db(params).codes.sectors();
  return createResult(data, null, "sectors");
}

async function get(params?: Record<string, unknown>): Promise<GovResult> {
  if (params?.code == null) throw new GovValidationError("code", undefined, "required NAICS code string");
  const code = String(params.code);
  const result = db(params).codes.get(code);
  if (!result) {
    return createResult([], null, "get");
  }
  return createResult([result], null, "get");
}

async function batch(params?: Record<string, unknown>): Promise<GovResult> {
  if (params?.codes == null) throw new GovValidationError("codes", undefined, "required comma-separated NAICS codes");
  const codesStr = String(params.codes);
  const codes = codesStr.split(",").map((c) => c.trim());
  const data = db(params).codes.batch(codes);
  return createResult(data, null, "batch");
}

async function children(params?: Record<string, unknown>): Promise<GovResult> {
  if (params?.code == null) throw new GovValidationError("code", undefined, "required NAICS code string");
  const code = String(params.code);
  const data = db(params).codes.children(code);
  return createResult(data, null, "children");
}

async function ancestors(params?: Record<string, unknown>): Promise<GovResult> {
  if (params?.code == null) throw new GovValidationError("code", undefined, "required NAICS code string");
  const code = String(params.code);
  const data = db(params).codes.ancestors(code);
  return createResult(data, null, "ancestors");
}

async function descendants(params?: Record<string, unknown>): Promise<GovResult> {
  if (params?.code == null) throw new GovValidationError("code", undefined, "required NAICS code string");
  const code = String(params.code);
  const limit = params?.limit != null ? Math.max(1, Number(params.limit)) : undefined;
  const offset = params?.offset != null ? Number(params.offset) : undefined;
  const result = db(params).codes.descendants(code, { limit, offset });
  const pages = limit ? Math.ceil(result.total / limit) : 1;
  return createResult(result.data, { total_results: result.total, pages }, "descendants");
}

async function search(params?: Record<string, unknown>): Promise<GovResult> {
  if (params?.q == null) throw new GovValidationError("q", undefined, "required search query string");
  const query = params.q as string;
  const limit = params?.limit != null ? Math.max(1, Number(params.limit)) : undefined;
  const offset = params?.offset != null ? Number(params.offset) : undefined;
  const level = params?.level != null ? Number(params.level) : undefined;
  let result;
  try {
    result = db(params).search(query, { limit, offset, level });
  } catch (err) {
    if (classifySearchError(err) === "invalid_syntax") {
      throw new GovValidationError("q", query, "valid search query");
    }
    throw err;
  }
  const effectiveLimit = limit ?? 20;
  const pages = Math.ceil(result.total / effectiveLimit);
  return createResult(result.data, { total_results: result.total, pages }, "search");
}

async function cross_references(params?: Record<string, unknown>): Promise<GovResult> {
  if (params?.code == null) throw new GovValidationError("code", undefined, "required NAICS code string");
  const code = String(params.code);
  const data = db(params).codes.crossReferences(code);
  return createResult(data, null, "cross_references");
}

async function index_entries(params?: Record<string, unknown>): Promise<GovResult> {
  if (params?.code == null) throw new GovValidationError("code", undefined, "required NAICS code string");
  const code = String(params.code);
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
