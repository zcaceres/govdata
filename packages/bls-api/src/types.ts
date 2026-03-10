import type { z } from "zod";
import type {
  TimeseriesParamsSchema,
  PopularParamsSchema,
  DataPointSchema,
  SeriesSchema,
  SurveySchema,
  FootnoteSchema,
  CalculationsSchema,
  AspectSchema,
} from "./schemas";
import type { GovResult, Meta } from "govdata-core";
export type { ClientOptions, Meta } from "govdata-core";
export type { ParamDescription, EndpointDescription } from "govdata-core";

export type TimeseriesParams = z.input<typeof TimeseriesParamsSchema>;
export type PopularParams = z.input<typeof PopularParamsSchema>;
export type Footnote = z.infer<typeof FootnoteSchema>;
export type Calculations = z.infer<typeof CalculationsSchema>;
export type Aspect = z.infer<typeof AspectSchema>;
export type DataPoint = z.infer<typeof DataPointSchema>;
export type Series = z.infer<typeof SeriesSchema>;
export type Survey = z.infer<typeof SurveySchema>;

export type PopularSeries = { seriesID: string };
export type EndpointKind = "timeseries" | "surveys" | "popular";

export interface KindDataMap {
  timeseries: Series[];
  surveys: Survey[];
  popular: PopularSeries[];
}

export interface BlsResult<K extends EndpointKind = EndpointKind> extends GovResult<K> {
  readonly data: KindDataMap[K];
  readonly meta: Meta | null;
}

export type TimeseriesResult = BlsResult<"timeseries">;
export type SurveysResult = BlsResult<"surveys">;
export type PopularResult = BlsResult<"popular">;
