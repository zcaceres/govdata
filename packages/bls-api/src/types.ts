import type { z } from "zod";
import type {
  TimeseriesParamsSchema,
  DataPointSchema,
  SeriesSchema,
  SurveySchema,
} from "./schemas";
import type { GovResult, Meta } from "govdata-core";
export type { ClientOptions, Meta } from "govdata-core";
export type { ParamDescription, EndpointDescription } from "govdata-core";

export type TimeseriesParams = z.input<typeof TimeseriesParamsSchema>;
export type DataPoint = z.infer<typeof DataPointSchema>;
export type Series = z.infer<typeof SeriesSchema>;
export type Survey = z.infer<typeof SurveySchema>;

export type EndpointKind = "timeseries" | "surveys" | "popular";

export interface KindDataMap {
  timeseries: Series[];
  surveys: Survey[];
  popular: Series[];
}

export interface BlsResult<K extends EndpointKind = EndpointKind> extends GovResult<K> {
  readonly data: KindDataMap[K];
  readonly meta: Meta | null;
}

export type TimeseriesResult = BlsResult<"timeseries">;
export type SurveysResult = BlsResult<"surveys">;
export type PopularResult = BlsResult<"popular">;
