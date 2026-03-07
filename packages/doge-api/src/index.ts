export {
  grants,
  contracts,
  leases,
  payments,
  statistics,
  createDoge,
  doge,
  describe,
} from "./endpoints";

export type {
  SavingsParams,
  PaymentsParams,
  Grant,
  Contract,
  Lease,
  Payment,
  Meta,
  AgencyStat,
  RequestDateStat,
  OrgNameStat,
  ClientOptions,
  GrantsResult,
  ContractsResult,
  LeasesResult,
  PaymentsResult,
  StatisticsResult,
  DogeResult,
  EndpointKind,
  EndpointDescription,
  ParamDescription,
  PaginatedEndpoint,
} from "./types";

export { DogeApiError, DogeRateLimitError, DogeValidationError } from "./errors";
