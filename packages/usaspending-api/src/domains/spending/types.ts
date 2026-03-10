import { z } from "zod";
import {
  SpendingByAgencyParamsSchema,
  SpendingByAgencyResultSchema,
  SpendingByAgencyResponseSchema,
} from "./schemas";

export type SpendingByAgencyParams = z.infer<typeof SpendingByAgencyParamsSchema>;
export type SpendingByAgencyResult = z.infer<typeof SpendingByAgencyResultSchema>;
export type SpendingByAgencyResponse = z.infer<typeof SpendingByAgencyResponseSchema>;

export interface SpendingKindMap {
  spending_by_agency: SpendingByAgencyResult[];
}
