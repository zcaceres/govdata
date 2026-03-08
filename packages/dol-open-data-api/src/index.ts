export { dolPlugin } from "./plugin.js";
export { createDol, type DolClient } from "./dol.js";

export { createClient, listDatasets } from "./client.js";
export { AGENCIES, type Agency, type EndpointFor, toKey } from "./datasets.js";
export { DOLApiError } from "./errors.js";
export { eq, neq, gt, lt, like, isIn, notIn, and, or, serializeFilter } from "./filters.js";
export type { FilterCondition, FilterExpression, QueryParams, DataResponse, MetadataResponse, DatasetInfo, DatasetsResponse, ClientConfig } from "./schemas.js";

export { wrapResponse, arrayToMarkdownTable, arrayToCSV, type DOLResult, type AgentHelpers } from "./response.js";
export type { DatasetDescription, ColumnInfo } from "./describe.js";
export type { PaginatedEndpoint } from "./paginate.js";
export { findClosestAgency, findClosestEndpoint } from "./suggest.js";
