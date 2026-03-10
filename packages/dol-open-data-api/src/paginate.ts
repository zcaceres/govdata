import type { Agency, EndpointFor } from "./datasets.js";
import type { DataResponse, QueryParams } from "./schemas.js";
import type { DatasetDescription } from "./describe.js";
import { wrapResponse, type DOLResult } from "./response.js";

export interface PaginatedEndpoint<TParams = QueryParams> {
  (params?: TParams): Promise<DOLResult>;
  pages(params?: TParams, pageSize?: number): AsyncGenerator<DOLResult>;
  all(params?: Omit<TParams, "offset" | "limit">, pageSize?: number): Promise<DOLResult>;
  describe(): Promise<DatasetDescription>;
}

export function withPagination<A extends Agency>(
  getData: (agency: A, endpoint: EndpointFor<A>, params?: QueryParams) => Promise<DataResponse>,
  agency: A,
  endpoint: EndpointFor<A>,
  describeFn: () => Promise<DatasetDescription>,
): PaginatedEndpoint {
  const agencyStr = agency;
  const endpointStr = String(endpoint);

  const fn = async (params?: QueryParams): Promise<DOLResult> => {
    const raw = await getData(agency, endpoint, params);
    return wrapResponse(raw, agencyStr, endpointStr);
  };

  fn.pages = async function* (
    params?: QueryParams,
    pageSize = 1000,
  ): AsyncGenerator<DOLResult> {
    let offset = params?.offset ?? 0;
    while (true) {
      const result = await fn({ ...params, limit: pageSize, offset });
      if (result.data.length === 0) break;
      yield result;
      if (result.data.length < pageSize) break;
      offset += pageSize;
    }
  };

  fn.all = async (
    params?: Omit<QueryParams, "offset" | "limit">,
    pageSize = 1000,
  ): Promise<DOLResult> => {
    const allData: Record<string, unknown>[] = [];
    for await (const page of fn.pages(params as QueryParams, pageSize)) {
      allData.push(...page.data);
    }
    return wrapResponse({ data: allData }, agencyStr, endpointStr);
  };

  fn.describe = describeFn;

  return fn as PaginatedEndpoint;
}
