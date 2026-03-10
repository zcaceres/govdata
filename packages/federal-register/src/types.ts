import { z } from "zod";
import {
  DocumentSearchParamsSchema,
  PISearchParamsSchema,
  FacetType,
  DocumentSchema,
  AgencySchema,
  PIDocumentSchema,
  DocumentSearchResponseSchema,
  MultiDocumentResponseSchema,
  AgenciesResponseSchema,
  PISearchResponseSchema,
  PICurrentResponseSchema,
  FacetsResponseSchema,
  SuggestedSearchesResponseSchema,
} from "./schemas";

export type DocumentSearchParams = z.infer<typeof DocumentSearchParamsSchema>;
export type PISearchParams = z.infer<typeof PISearchParamsSchema>;
export type FacetTypeValue = z.infer<typeof FacetType>;

export type Document = z.infer<typeof DocumentSchema>;
export type Agency = z.infer<typeof AgencySchema>;
export type PIDocument = z.infer<typeof PIDocumentSchema>;

export type DocumentSearchResponse = z.infer<typeof DocumentSearchResponseSchema>;
export type MultiDocumentResponse = z.infer<typeof MultiDocumentResponseSchema>;
export type AgenciesResponse = z.infer<typeof AgenciesResponseSchema>;
export type PISearchResponse = z.infer<typeof PISearchResponseSchema>;
export type PICurrentResponse = z.infer<typeof PICurrentResponseSchema>;
export type FacetsResponse = z.infer<typeof FacetsResponseSchema>;
export type SuggestedSearchesResponse = z.infer<typeof SuggestedSearchesResponseSchema>;

export type { ClientOptions } from "govdata-core";

export type { FRResult, EndpointKind, KindDataMap } from "./response";
export type { EndpointDescription, ParamDescription } from "./describe";
export type { PaginatedEndpoint } from "govdata-core";
