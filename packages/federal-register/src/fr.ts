import { withPagination } from "govdata-core";
import type { ClientOptions } from "govdata-core";
import type { DocumentSearchParams, PISearchParams, FacetTypeValue } from "./types";
import {
  _searchDocuments,
  _findDocument,
  _findManyDocuments,
  _listAgencies,
  _findAgency,
  _searchPI,
  _currentPI,
  _getFacets,
  _listSuggestedSearches,
} from "./endpoints";
import { describe } from "./describe";

export function createFederalRegister(defaultOptions?: ClientOptions) {
  return {
    documents: {
      search: withPagination(
        (params?: DocumentSearchParams, options?: ClientOptions) =>
          _searchDocuments(params, { ...defaultOptions, ...options }),
      ),
      find: (documentNumber: string, params?: { fields?: string[] }, options?: ClientOptions) =>
        _findDocument(documentNumber, params, { ...defaultOptions, ...options }),
      findMany: (documentNumbers: string[], params?: { fields?: string[] }, options?: ClientOptions) =>
        _findManyDocuments(documentNumbers, params, { ...defaultOptions, ...options }),
    },
    agencies: {
      all: (options?: ClientOptions) =>
        _listAgencies({ ...defaultOptions, ...options }),
      find: (id: number | string, options?: ClientOptions) =>
        _findAgency(id, { ...defaultOptions, ...options }),
    },
    publicInspection: {
      search: withPagination(
        (params?: PISearchParams, options?: ClientOptions) =>
          _searchPI(params, { ...defaultOptions, ...options }),
      ),
      current: (options?: ClientOptions) =>
        _currentPI({ ...defaultOptions, ...options }),
    },
    facets: {
      get: (
        facetType: FacetTypeValue,
        conditions?: Omit<DocumentSearchParams, "fields" | "per_page" | "page" | "order">,
        options?: ClientOptions,
      ) => _getFacets(facetType, conditions, { ...defaultOptions, ...options }),
    },
    suggestedSearches: {
      all: (options?: ClientOptions) =>
        _listSuggestedSearches({ ...defaultOptions, ...options }),
    },
    describe,
  };
}

export const fr = createFederalRegister();
