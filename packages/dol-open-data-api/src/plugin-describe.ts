import type { ParamDescription, EndpointDescription } from "govdata-core";
import { AGENCIES, toKey } from "./datasets.js";

const sharedParams: ParamDescription[] = [
  { name: "limit", type: "number", required: false },
  { name: "offset", type: "number", required: false, min: 0 },
  { name: "fields", type: "string", required: false },
  { name: "sort", type: "string", required: false, values: ["asc", "desc"] },
  { name: "sort_by", type: "string", required: false },
  { name: "filter", type: "string", required: false },
];

const endpoints: EndpointDescription[] = [];
for (const [agency, epList] of Object.entries(AGENCIES)) {
  for (const ep of epList) {
    endpoints.push({
      name: `${agency.toLowerCase()}_${toKey(ep)}`,
      path: `/get/${agency}/${ep}`,
      description: `Query ${agency} ${ep} dataset`,
      params: [...sharedParams],
      responseFields: ["data"],
    });
  }
}

export function describe(): { endpoints: EndpointDescription[] } {
  return { endpoints };
}
