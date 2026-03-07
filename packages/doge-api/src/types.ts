import { z } from "zod";
import {
  SavingsParamsSchema,
  PaymentsParamsSchema,
  GrantSchema,
  ContractSchema,
  LeaseSchema,
  PaymentSchema,
  MetaSchema,
  AgencyStatSchema,
  RequestDateStatSchema,
  OrgNameStatSchema,
  GrantsResponseSchema,
  ContractsResponseSchema,
  LeasesResponseSchema,
  PaymentsResponseSchema,
  StatisticsResponseSchema,
  ErrorResponseSchema,
} from "./schemas";

export type SavingsParams = z.infer<typeof SavingsParamsSchema>;
export type PaymentsParams = z.infer<typeof PaymentsParamsSchema>;

export type Grant = z.infer<typeof GrantSchema>;
export type Contract = z.infer<typeof ContractSchema>;
export type Lease = z.infer<typeof LeaseSchema>;
export type Payment = z.infer<typeof PaymentSchema>;
export type Meta = z.infer<typeof MetaSchema>;
export type AgencyStat = z.infer<typeof AgencyStatSchema>;
export type RequestDateStat = z.infer<typeof RequestDateStatSchema>;
export type OrgNameStat = z.infer<typeof OrgNameStatSchema>;

export type GrantsResponse = z.infer<typeof GrantsResponseSchema>;
export type ContractsResponse = z.infer<typeof ContractsResponseSchema>;
export type LeasesResponse = z.infer<typeof LeasesResponseSchema>;
export type PaymentsResponse = z.infer<typeof PaymentsResponseSchema>;
export type StatisticsResponse = z.infer<typeof StatisticsResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

export type { ClientOptions } from "govdata-core";

export type { DogeResult, EndpointKind, KindDataMap } from "./response";
export type { EndpointDescription, ParamDescription } from "./describe";
export type { PaginatedEndpoint } from "./paginate";

import type { DogeResult } from "./response";

export type GrantsResult = DogeResult<"grants">;
export type ContractsResult = DogeResult<"contracts">;
export type LeasesResult = DogeResult<"leases">;
export type PaymentsResult = DogeResult<"payments">;
export type StatisticsResult = DogeResult<"statistics">;
