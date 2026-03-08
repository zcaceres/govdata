// Re-export all types from domains for backward compatibility
export type {
  AwardSearchParams,
  AwardSearchResult,
  AwardSearchResponse,
  SpendingOverTimeParams,
  SpendingOverTimeResult,
  SpendingOverTimeResponse,
  SpendingOverTimeGroup,
} from "./domains/search";

export type { AwardDetail } from "./domains/awards";
export type { AgencyOverview } from "./domains/agency";

export type {
  SpendingByAgencyParams,
  SpendingByAgencyResult,
  SpendingByAgencyResponse,
} from "./domains/spending";

export type { SpendingByStateItem } from "./domains/recipient";

export type { ClientOptions } from "govdata-core";
export type { USAResult, EndpointKind, KindDataMap } from "./response";
export type { EndpointDescription, ParamDescription } from "./describe";
export type { PaginatedEndpoint } from "govdata-core";
