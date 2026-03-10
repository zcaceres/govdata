export {
  createFederalRegister,
  fr,
} from "./fr";

export { describe } from "./describe";
export { federalRegisterPlugin } from "./plugin";

export type {
  DocumentSearchParams,
  PISearchParams,
  FacetTypeValue,
  Document,
  Agency,
  PIDocument,
  DocumentSearchResponse,
  MultiDocumentResponse,
  AgenciesResponse,
  PISearchResponse,
  PICurrentResponse,
  FacetsResponse,
  SuggestedSearchesResponse,
  ClientOptions,
  FRResult,
  EndpointKind,
  KindDataMap,
  EndpointDescription,
  ParamDescription,
  PaginatedEndpoint,
} from "./types";

export { FRApiError, FRRateLimitError, FRValidationError } from "./errors";
