import { z } from "zod";
import {
  ReportingAgencyOverviewItemSchema,
  ReportingPublishDatesItemSchema,
  ReportingSingleAgencyItemSchema,
  SubmissionHistoryItemSchema,
  UnlinkedAwardsSchema,
} from "./schemas";

export type ReportingAgencyOverviewItem = z.infer<typeof ReportingAgencyOverviewItemSchema>;
export type ReportingPublishDatesItem = z.infer<typeof ReportingPublishDatesItemSchema>;
export type ReportingSingleAgencyItem = z.infer<typeof ReportingSingleAgencyItemSchema>;
export type SubmissionHistoryItem = z.infer<typeof SubmissionHistoryItemSchema>;
export type UnlinkedAwards = z.infer<typeof UnlinkedAwardsSchema>;

export interface ReportingKindMap {
  reporting_agencies_overview: ReportingAgencyOverviewItem[];
  reporting_publish_dates: ReportingPublishDatesItem[];
  reporting_differences: unknown[];
  reporting_discrepancies: unknown[];
  reporting_agency_overview: ReportingSingleAgencyItem[];
  reporting_submission_history: SubmissionHistoryItem[];
  reporting_unlinked_assistance: UnlinkedAwards;
  reporting_unlinked_procurement: UnlinkedAwards;
}
