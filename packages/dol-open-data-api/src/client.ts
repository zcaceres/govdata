import type { Agency, EndpointFor } from "./datasets.js";
import { DOLApiError } from "./errors.js";
import { buildSearchParams } from "./params.js";
import { ClientConfig, DataResponse, MetadataResponse, DatasetsResponse, type QueryParams } from "./schemas.js";

const DEFAULT_BASE_URL = "https://apiprod.dol.gov/v4";

async function fetchJson(url: string, agency?: string, endpoint?: string): Promise<unknown> {
  const res = await fetch(url);
  const body = await res.text();
  if (!res.ok) {
    throw new DOLApiError(res.status, body, url, agency, endpoint);
  }
  try {
    return JSON.parse(body);
  } catch {
    throw new DOLApiError(res.status, `Invalid JSON response: ${body.slice(0, 200)}`, url, agency, endpoint);
  }
}

export async function listDatasets(baseUrl = DEFAULT_BASE_URL): Promise<DatasetsResponse> {
  const raw = await fetchJson(`${baseUrl}/datasets`);
  return DatasetsResponse.parse(raw);
}

export function createClient(config: ClientConfig) {
  const { apiKey, baseUrl = DEFAULT_BASE_URL } = ClientConfig.parse(config);

  async function getData<A extends Agency>(
    agency: A,
    endpoint: EndpointFor<A>,
    params?: QueryParams,
  ): Promise<DataResponse> {
    const sp = buildSearchParams(apiKey, params);
    const url = `${baseUrl}/get/${agency}/${String(endpoint)}/json?${sp}`;
    const raw = await fetchJson(url, agency, String(endpoint));
    return DataResponse.parse(raw);
  }

  async function getMetadata<A extends Agency>(
    agency: A,
    endpoint: EndpointFor<A>,
  ): Promise<MetadataResponse> {
    const sp = new URLSearchParams({ "X-API-KEY": apiKey });
    const url = `${baseUrl}/get/${agency}/${String(endpoint)}/json/metadata?${sp}`;
    const raw = await fetchJson(url, agency, String(endpoint));
    return MetadataResponse.parse(raw);
  }

  async function* getAll<A extends Agency>(
    agency: A,
    endpoint: EndpointFor<A>,
    params?: Omit<QueryParams, "offset" | "limit">,
    pageSize = 1000,
  ): AsyncGenerator<Record<string, unknown>[]> {
    let offset = 0;
    while (true) {
      const result = await getData(agency, endpoint, {
        ...params,
        limit: pageSize,
        offset,
      });
      if (result.data.length === 0) break;
      yield result.data;
      if (result.data.length < pageSize) break;
      offset += pageSize;
    }
  }

  return { getData, getMetadata, getAll };
}
