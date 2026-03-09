import type { ParamDescription, EndpointDescription } from "govdata-core";

export type { ParamDescription, EndpointDescription };

const endpoints: EndpointDescription[] = [
  {
    name: "timeseries",
    path: "/timeseries/data/",
    description: "Fetch time series data for BLS series IDs (CPI, unemployment, etc.)",
    params: [
      { name: "series_id", type: "string", required: true },
      { name: "start_year", type: "number", required: false },
      { name: "end_year", type: "number", required: false },
      { name: "calculations", type: "boolean", required: false },
      { name: "annual_averages", type: "boolean", required: false },
      { name: "catalog", type: "boolean", required: false },
    ],
    responseFields: ["seriesID", "year", "period", "periodName", "value"],
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
