import type { ParamDescription, EndpointDescription } from "govdata-core";
import { SUPPORTED_YEARS } from "./types";

export type { ParamDescription, EndpointDescription };

const yearParam: ParamDescription = {
  name: "year",
  type: "string",
  required: false,
  values: SUPPORTED_YEARS.map(String),
};

const codeParam: ParamDescription = {
  name: "code",
  type: "string",
  required: true,
};

const paginationParams: ParamDescription[] = [
  { name: "limit", type: "number", required: false },
  { name: "offset", type: "number", required: false, min: 0 },
];

const endpoints: EndpointDescription[] = [
  {
    name: "sectors",
    path: "/sectors",
    description: "List all 20 top-level NAICS sectors",
    params: [yearParam],
    responseFields: ["code", "title", "description", "level", "parent_code"],
  },
  {
    name: "get",
    path: "/naics/:code",
    description: "Look up a single NAICS code",
    params: [codeParam, yearParam],
    responseFields: ["code", "title", "description", "level", "parent_code"],
  },
  {
    name: "batch",
    path: "/naics?codes=:codes",
    description: "Batch lookup multiple NAICS codes (comma-separated)",
    params: [
      { name: "codes", type: "string", required: true },
      yearParam,
    ],
    responseFields: ["code", "title", "description", "level", "parent_code"],
  },
  {
    name: "children",
    path: "/naics/:code/children",
    description: "Get direct children of a NAICS code",
    params: [codeParam, yearParam],
    responseFields: ["code", "title", "description", "level", "parent_code"],
  },
  {
    name: "ancestors",
    path: "/naics/:code/ancestors",
    description: "Get ancestor chain from a NAICS code up to its sector",
    params: [codeParam, yearParam],
    responseFields: ["code", "title", "description", "level", "parent_code"],
  },
  {
    name: "descendants",
    path: "/naics/:code/descendants",
    description: "Get all descendants of a NAICS code (paginated)",
    params: [codeParam, yearParam, ...paginationParams],
    responseFields: ["code", "title", "description", "level", "parent_code"],
  },
  {
    name: "search",
    path: "/search",
    description: "Full-text search across NAICS codes, titles, descriptions, and index entries",
    params: [
      { name: "q", type: "string", required: true },
      yearParam,
      ...paginationParams,
      { name: "level", type: "number", required: false },
    ],
    responseFields: ["code", "title", "description", "rank", "level", "parent_code"],
  },
  {
    name: "cross_references",
    path: "/naics/:code/cross-references",
    description: "Get cross-references for a NAICS code",
    params: [codeParam, yearParam],
    responseFields: ["id", "code", "description"],
  },
  {
    name: "index_entries",
    path: "/naics/:code/index-entries",
    description: "Get index entries (keyword synonyms) for a NAICS code",
    params: [codeParam, yearParam],
    responseFields: ["id", "code", "entry"],
  },
];

export function describe(): { endpoints: EndpointDescription[] } {
  return { endpoints };
}
