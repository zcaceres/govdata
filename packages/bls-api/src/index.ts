export {
  timeseries,
  surveys,
  popular,
  createBls,
  bls,
  describe,
  blsPlugin,
} from "./endpoints";

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
  EndpointDescription,
  ParamDescription,
} from "./types";

export {
  GovApiError as BlsApiError,
  GovRateLimitError as BlsRateLimitError,
  GovValidationError as BlsValidationError,
} from "govdata-core";
