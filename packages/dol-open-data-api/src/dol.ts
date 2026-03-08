import { AGENCIES, type Agency, type EndpointFor } from "./datasets.js";
import { createClient, listDatasets } from "./client.js";
import { createDescribe } from "./describe.js";
import { withPagination, type PaginatedEndpoint } from "./paginate.js";
import type { ClientConfig, QueryParams } from "./schemas.js";

type AgencyNamespace<A extends Agency> = {
  [E in EndpointFor<A>]: PaginatedEndpoint<QueryParams>;
};

export type DolClient = {
  [A in Agency as Lowercase<A>]: AgencyNamespace<A>;
};

export function createDol(config: ClientConfig): DolClient {
  const client = createClient(config);
  const { apiKey, baseUrl } = config;

  const describeFn = createDescribe({
    getMetadata: client.getMetadata,
    listDatasets: () => listDatasets(baseUrl),
  });

  const dol = {} as Record<string, Record<string, PaginatedEndpoint>>;

  for (const [agency, endpoints] of Object.entries(AGENCIES)) {
    const ns: Record<string, PaginatedEndpoint> = {};
    for (const endpoint of endpoints) {
      ns[endpoint] = withPagination(
        client.getData as any,
        agency as Agency,
        endpoint as EndpointFor<Agency>,
        () => describeFn(agency as Agency, endpoint as EndpointFor<Agency>),
      );
    }
    dol[agency.toLowerCase()] = ns;
  }

  return dol as unknown as DolClient;
}
