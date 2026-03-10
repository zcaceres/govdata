export {
  createUSASpending,
  usa,
} from "./usa";

export { describe } from "./describe";
export { usaspendingPlugin } from "./plugin";

export type {
  AwardSearchParams,
  AwardSearchResult,
  AwardSearchResponse,
  AwardDetail,
  AgencyOverview,
  SpendingByAgencyParams,
  SpendingByAgencyResult,
  SpendingByAgencyResponse,
  SpendingByStateItem,
  SpendingOverTimeParams,
  SpendingOverTimeResult,
  SpendingOverTimeResponse,
  SpendingOverTimeGroup,
  ClientOptions,
  USAResult,
  EndpointKind,
  KindDataMap,
  EndpointDescription,
  ParamDescription,
  PaginatedEndpoint,
} from "./types";

export { USAApiError, USARateLimitError, USAValidationError } from "./errors";
