import { z } from "zod";
import {
  FederalAccountListItemSchema,
  FederalAccountDetailSchema,
  FiscalYearSnapshotSchema,
  AvailableObjectClassItemSchema,
  ObjectClassTotalItemSchema,
  ProgramActivityItemSchema,
  ProgramActivityTotalItemSchema,
} from "./schemas";

export type FederalAccountListItem = z.infer<typeof FederalAccountListItemSchema>;
export type FederalAccountDetail = z.infer<typeof FederalAccountDetailSchema>;
export type FiscalYearSnapshot = z.infer<typeof FiscalYearSnapshotSchema>;
export type AvailableObjectClassItem = z.infer<typeof AvailableObjectClassItemSchema>;
export type ObjectClassTotalItem = z.infer<typeof ObjectClassTotalItemSchema>;
export type ProgramActivityItem = z.infer<typeof ProgramActivityItemSchema>;
export type ProgramActivityTotalItem = z.infer<typeof ProgramActivityTotalItemSchema>;

export interface FederalAccountsKindMap {
  federal_account_list: FederalAccountListItem[];
  federal_account_detail: FederalAccountDetail;
  federal_account_fiscal_year_snapshot: Record<string, unknown>;
  federal_account_available_object_classes: AvailableObjectClassItem[];
  federal_account_object_classes: ObjectClassTotalItem[];
  federal_account_program_activities: ProgramActivityItem[];
  federal_account_program_activities_total: ProgramActivityTotalItem[];
}
