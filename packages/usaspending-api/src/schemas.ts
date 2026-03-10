// Re-export all schemas from domains and shared for backward compatibility
export { AwardTypeCodes, TimePeriodSchema, AwardSearchFiltersSchema } from "./shared-schemas";
export { CursorPageMetaSchema as PageMetadataSchema } from "./shared-schemas";

export {
  AwardSearchParamsSchema,
  AwardSearchResultSchema,
  AwardSearchResponseSchema,
  SpendingOverTimeGroupSchema,
  SpendingOverTimeParamsSchema,
  SpendingOverTimeResultSchema,
  SpendingOverTimeResponseSchema,
} from "./domains/search";

export { AwardDetailSchema } from "./domains/awards";
export { AgencyOverviewSchema } from "./domains/agency";

export {
  SpendingByAgencyParamsSchema,
  SpendingByAgencyResultSchema,
  SpendingByAgencyResponseSchema,
} from "./domains/spending";

export {
  SpendingByStateItemSchema,
  SpendingByStateResponseSchema,
} from "./domains/recipient";
