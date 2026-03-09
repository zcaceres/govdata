import type { ParamDescription, EndpointDescription } from "govdata-core";

export type { ParamDescription, EndpointDescription };

const endpoints: EndpointDescription[] = [
  {
    name: "timeseries",
    path: "/timeseries/data/",
    description: "Fetch time series data for BLS series IDs (CPI, unemployment, etc.)",
    params: [
      { name: "series_id", type: "string", required: true, description: "BLS series ID(s), comma-separated for multiple" },
      { name: "start_year", type: "number", required: false, min: 1900 },
      { name: "end_year", type: "number", required: false, min: 1900 },
      { name: "calculations", type: "boolean", required: false },
      { name: "annual_averages", type: "boolean", required: false },
      { name: "catalog", type: "boolean", required: false },
      { name: "aspects", type: "boolean", required: false },
    ],
    responseFields: ["seriesID", "year", "period", "periodName", "value", "footnotes", "calculations", "catalog", "aspects"],
  },
  {
    name: "surveys",
    path: "/surveys/",
    description: "List all available BLS surveys",
    params: [],
    responseFields: ["survey_abbreviation", "survey_name"],
  },
  {
    name: "popular",
    path: "/timeseries/popular",
    description: "Get the 25 most popular BLS time series, optionally filtered by survey",
    params: [
      { name: "survey", type: "string", required: false },
    ],
    responseFields: ["seriesID"],
  },
];

export function describe(): { endpoints: EndpointDescription[] } {
  return { endpoints };
}
