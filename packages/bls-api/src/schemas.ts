import { z } from "zod";

// --- Param schemas (.strict() to catch typos) ---

export const TimeseriesParamsSchema = z
  .object({
    series_id: z.union([z.string(), z.array(z.string())]),
    start_year: z.coerce.number().int().optional(),
    end_year: z.coerce.number().int().optional(),
    calculations: z.boolean().optional(),
    annual_averages: z.boolean().optional(),
    catalog: z.boolean().optional(),
  })
  .strict()
  .refine((d) => !(d.end_year && !d.start_year), {
    message: "start_year required when end_year is provided",
    path: ["start_year"],
  });

// --- Response schemas (NOT .strict() — APIs may add fields) ---

export const FootnoteSchema = z.object({
  code: z.string().optional(),
  text: z.string().optional(),
});

export const DataPointSchema = z.object({
  year: z.string(),
  period: z.string(),
  periodName: z.string(),
  latest: z.string().optional(),
  value: z.string(),
  footnotes: z.array(FootnoteSchema).optional(),
  calculations: z.record(z.string(), z.unknown()).optional(),
});

export const SeriesSchema = z.object({
  seriesID: z.string(),
  catalog: z.record(z.string(), z.unknown()).optional(),
  data: z.array(DataPointSchema).optional(),
});

export const BLSResponseSchema = z.object({
  status: z.string(),
  responseTime: z.number(),
  message: z.array(z.string()),
  Results: z.object({ series: z.array(SeriesSchema) }),
});

export const SurveySchema = z.object({
  survey_abbreviation: z.string(),
  survey_name: z.string(),
});

export const SurveysResponseSchema = z.object({
  status: z.string(),
  responseTime: z.number(),
  message: z.array(z.string()),
  Results: z.object({ survey: z.array(SurveySchema) }),
});

export const PopularResponseSchema = z.object({
  status: z.string(),
  responseTime: z.number(),
  message: z.array(z.string()),
  Results: z.object({ series: z.array(SeriesSchema) }),
});
