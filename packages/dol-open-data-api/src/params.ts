import { QueryParams } from "./schemas.js";
import { serializeFilter } from "./filters.js";

export function buildSearchParams(apiKey: string, params?: QueryParams): URLSearchParams {
  const sp = new URLSearchParams();
  sp.set("X-API-KEY", apiKey);

  if (!params) return sp;

  const parsed = QueryParams.parse(params);

  if (parsed.limit !== undefined) sp.set("limit", String(parsed.limit));
  if (parsed.offset !== undefined) sp.set("offset", String(parsed.offset));
  if (parsed.fields) sp.set("fields", parsed.fields.join(","));
  if (parsed.sort) sp.set("sort", parsed.sort);
  if (parsed.sort_by) sp.set("sort_by", parsed.sort_by);
  if (parsed.filter) sp.set("filter_object", serializeFilter(parsed.filter));

  return sp;
}
