import { z } from "zod";
import {
  DisasterCountSchema,
  DisasterOverviewSchema,
  DisasterAwardAmountSchema,
  DisasterSpendingItemSchema,
  DisasterSpendingResponseSchema,
  DisasterLoanItemSchema,
  DisasterLoanResponseSchema,
  DisasterCfdaItemSchema,
  DisasterCfdaResponseSchema,
  DisasterCfdaLoanResponseSchema,
  DisasterGeoItemSchema,
  DisasterGeoResponseSchema,
  DisasterSpendingTotalsSchema,
  DisasterLoanTotalsSchema,
} from "./schemas";

// --- Inferred types ---

export type DisasterCount = z.infer<typeof DisasterCountSchema>;
export type DisasterOverview = z.infer<typeof DisasterOverviewSchema>;
export type DisasterAwardAmount = z.infer<typeof DisasterAwardAmountSchema>;
export type DisasterSpendingItem = z.infer<typeof DisasterSpendingItemSchema>;
export type DisasterSpendingResponse = z.infer<typeof DisasterSpendingResponseSchema>;
export type DisasterLoanItem = z.infer<typeof DisasterLoanItemSchema>;
export type DisasterLoanResponse = z.infer<typeof DisasterLoanResponseSchema>;
export type DisasterCfdaItem = z.infer<typeof DisasterCfdaItemSchema>;
export type DisasterCfdaResponse = z.infer<typeof DisasterCfdaResponseSchema>;
export type DisasterCfdaLoanResponse = z.infer<typeof DisasterCfdaLoanResponseSchema>;
export type DisasterGeoItem = z.infer<typeof DisasterGeoItemSchema>;
export type DisasterGeoResponse = z.infer<typeof DisasterGeoResponseSchema>;
export type DisasterSpendingTotals = z.infer<typeof DisasterSpendingTotalsSchema>;
export type DisasterLoanTotals = z.infer<typeof DisasterLoanTotalsSchema>;

// --- Filter params for POST endpoints ---

export interface DisasterFilterParams {
  def_codes?: string[];
  spending_type?: string;
  sort?: string;
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
  // spending_by_geography specific
  geo_layer?: string;
  scope?: string;
}

// --- Kind map ---

export interface DisasterKindMap {
  disaster_overview: DisasterOverview;
  disaster_award_amount: DisasterAwardAmount;
  disaster_award_count: DisasterCount;
  disaster_agency_spending: DisasterSpendingItem[];
  disaster_agency_loans: DisasterLoanItem[];
  disaster_agency_count: DisasterCount;
  disaster_cfda_spending: DisasterCfdaItem[];
  disaster_cfda_loans: DisasterCfdaItem[];
  disaster_cfda_count: DisasterCount;
  disaster_def_code_count: DisasterCount;
  disaster_federal_account_spending: DisasterSpendingItem[];
  disaster_federal_account_loans: DisasterLoanItem[];
  disaster_federal_account_count: DisasterCount;
  disaster_object_class_spending: DisasterSpendingItem[];
  disaster_object_class_loans: DisasterLoanItem[];
  disaster_object_class_count: DisasterCount;
  disaster_recipient_spending: DisasterSpendingItem[];
  disaster_recipient_loans: DisasterLoanItem[];
  disaster_recipient_count: DisasterCount;
  disaster_spending_by_geography: DisasterGeoItem[];
}
