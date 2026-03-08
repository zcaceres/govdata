import { createResult } from "govdata-core";
import type { GovDataPlugin, GovResult } from "govdata-core";
import { createClient } from "./client.js";
import { AGENCIES, type Agency, toKey } from "./datasets.js";
import { describe } from "./plugin-describe.js";

let _client: ReturnType<typeof createClient> | null = null;
let _cachedKey: string | null = null;

function getClient() {
  const apiKey = process.env.DOL_API_KEY;
  if (!apiKey) throw new Error("DOL_API_KEY environment variable is required");
  if (_client && _cachedKey === apiKey) return _client;
  _client = createClient({ apiKey });
  _cachedKey = apiKey;
  return _client;
}

function makeEndpoint(agency: Agency, endpoint: string) {
  return async (params?: Record<string, unknown>): Promise<GovResult> => {
    const client = getClient();
    const queryParams: Record<string, unknown> = {};
    if (params?.limit != null) {
      if (typeof params.limit === "boolean") throw new Error("limit requires a numeric value");
      queryParams.limit = Number(params.limit);
    }
    if (params?.offset != null) {
      if (typeof params.offset === "boolean") throw new Error("offset requires a numeric value");
      queryParams.offset = Number(params.offset);
    }
    if (params?.sort) queryParams.sort = String(params.sort);
    if (params?.sort_by) queryParams.sort_by = String(params.sort_by);
    if (params?.fields) queryParams.fields = String(params.fields).split(",");
    if (params?.filter) {
      if (typeof params.filter === "string") {
        try {
          queryParams.filter = JSON.parse(params.filter);
        } catch {
          throw new Error(`Invalid filter: could not parse JSON string. Example: '{"field":"state","operator":"eq","value":"CA"}'`);
        }
      } else {
        queryParams.filter = params.filter;
      }
    }

    const result = await client.getData(agency, endpoint as any, queryParams as any);
    const kind = `${agency.toLowerCase()}_${toKey(endpoint)}`;
    return createResult(result.data, null, kind);
  };
}

const endpoints: Record<string, (params?: any) => Promise<GovResult>> = {};
for (const [agency, epList] of Object.entries(AGENCIES)) {
  for (const ep of epList) {
    endpoints[`${agency.toLowerCase()}_${toKey(ep)}`] = makeEndpoint(agency as Agency, ep);
  }
}

export const dolPlugin: GovDataPlugin = {
  prefix: "dol",
  describe,
  endpoints,
};
