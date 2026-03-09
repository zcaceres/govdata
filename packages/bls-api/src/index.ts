export {
  timeseries,
  surveys,
  popular,
  createBls,
  bls,
  describe,
} from "./endpoints";

export { blsPlugin } from "./plugin";

export type {
  TimeseriesParams,
  DataPoint,
  Series,
  Survey,
  Meta,
  ClientOptions,
  TimeseriesResult,
  SurveysResult,
  PopularResult,
  BlsResult,
  EndpointKind,
  KindDataMap,
  EndpointDescription,
  ParamDescription,
} from "./types";

export { BlsApiError, BlsRateLimitError, BlsValidationError } from "./errors";
