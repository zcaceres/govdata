import { z } from "zod";

export const FilterOperator = z.enum(["eq", "neq", "gt", "lt", "in", "not_in", "like"]);
export type FilterOperator = z.infer<typeof FilterOperator>;

export const FilterCondition = z.object({
  field: z.string(),
  operator: FilterOperator,
  value: z.union([z.string(), z.number(), z.array(z.union([z.string(), z.number()]))]),
});
export type FilterCondition = z.infer<typeof FilterCondition>;

export type FilterExpression =
  | FilterCondition
  | { and: FilterExpression[] }
  | { or: FilterExpression[] };

export const FilterExpression: z.ZodType<FilterExpression> = z.lazy(() =>
  z.union([
    FilterCondition,
    z.object({ and: z.array(FilterExpression) }),
    z.object({ or: z.array(FilterExpression) }),
  ]),
);

export const QueryParams = z.object({
  limit: z.number().int().min(1).max(10000).optional(),
  offset: z.number().int().min(0).optional(),
  fields: z.array(z.string()).optional(),
  sort: z.enum(["asc", "desc"]).optional(),
  sort_by: z.string().optional(),
  filter: FilterExpression.optional(),
});
export type QueryParams = z.infer<typeof QueryParams>;

export const DataResponse = z.object({
  data: z.array(z.record(z.string(), z.unknown())),
});
export type DataResponse = z.infer<typeof DataResponse>;

export const MetadataResponse = z.array(z.record(z.string(), z.unknown()));
export type MetadataResponse = z.infer<typeof MetadataResponse>;

export const DatasetInfo = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().optional(),
  tablename: z.string(),
  published_at: z.string(),
  dataset_type: z.number(),
  agency_id: z.number(),
  agency: z.object({
    name: z.string(),
    abbr: z.string(),
  }),
  frequency: z.string(),
  api_url: z.string(),
  category_name: z.string().optional(),
  status: z.number(),
  tag_list: z.array(z.string()),
  created_at: z.string(),
  updated_at: z.string(),
}).passthrough();
export type DatasetInfo = z.infer<typeof DatasetInfo>;

export const DatasetsResponse = z.object({
  datasets: z.array(DatasetInfo),
  meta: z.object({
    current_page: z.number(),
    next_page: z.number().nullable(),
    prev_page: z.number().nullable(),
    total_pages: z.number(),
    total_count: z.number(),
  }),
});
export type DatasetsResponse = z.infer<typeof DatasetsResponse>;

export const ClientConfig = z.object({
  apiKey: z.string().min(1),
  baseUrl: z.string().url().optional(),
});
export type ClientConfig = z.infer<typeof ClientConfig>;
