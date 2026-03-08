import { createResult } from "govdata-core";
import type { GovDataPlugin, GovResult } from "govdata-core";
import { createClient } from "./client.js";
import { AGENCIES, type Agency } from "./datasets.js";
import { describe } from "./plugin-describe.js";

function getClient() {
  const apiKey = process.env.DOL_API_KEY;
  if (!apiKey) throw new Error("DOL_API_KEY environment variable is required");
  return createClient({ apiKey });
}

function makeEndpoint(agency: Agency, endpoint: string) {
  return async (params?: Record<string, unknown>): Promise<GovResult> => {
    const client = getClient();
    const queryParams: Record<string, unknown> = {};
    if (params?.limit != null) queryParams.limit = Number(params.limit);
    if (params?.offset != null) queryParams.offset = Number(params.offset);
    if (params?.sort) queryParams.sort = String(params.sort);
    if (params?.sort_by) queryParams.sort_by = String(params.sort_by);
    if (params?.fields) queryParams.fields = String(params.fields).split(",");
    if (params?.filter) queryParams.filter = JSON.parse(String(params.filter));

    const result = await client.getData(agency, endpoint as any, queryParams as any);
    const kind = `${agency.toLowerCase()}_${endpoint}`;
    return createResult(result.data, null, kind);
  };
}

const endpoints: Record<string, (params?: any) => Promise<GovResult>> = {};
for (const [agency, epList] of Object.entries(AGENCIES)) {
  for (const ep of epList) {
    endpoints[`${agency.toLowerCase()}_${ep}`] = makeEndpoint(agency as Agency, ep);
  }
}

export const dolPlugin: GovDataPlugin = {
  prefix: "dol",
  describe,
  endpoints,
};
