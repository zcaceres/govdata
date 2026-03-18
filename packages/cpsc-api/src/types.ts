import type { z } from "zod";
import type {
  RecallParamsSchema,
  PenaltyParamsSchema,
  PenaltyListParamsSchema,
  RecallSchema,
  PenaltySchema,
} from "./schemas";
import type { GovResult, Meta } from "govdata-core";
export type { ClientOptions, Meta } from "govdata-core";
export type { ParamDescription, EndpointDescription } from "govdata-core";

export type RecallParams = z.input<typeof RecallParamsSchema>;
export type PenaltyParams = z.input<typeof PenaltyParamsSchema>;
export type PenaltyListParams = z.input<typeof PenaltyListParamsSchema>;
export type Recall = z.infer<typeof RecallSchema>;
export type Penalty = z.infer<typeof PenaltySchema>;
export type PenaltyProductType = { Type: string; CategoryID: string };

export type EndpointKind =
  | "recalls"
  | "penalties"
  | "penalty_companies"
  | "penalty_products"
  | "penalty_years";

export interface KindDataMap {
  recalls: Recall[];
  penalties: Penalty[];
  penalty_companies: string[];
  penalty_products: PenaltyProductType[];
  penalty_years: string[];
}

export interface CpscResult<K extends EndpointKind = EndpointKind> extends GovResult<K> {
  readonly data: KindDataMap[K];
  readonly meta: Meta | null;
}

export type RecallsResult = CpscResult<"recalls">;
export type PenaltiesResult = CpscResult<"penalties">;
export type PenaltyCompaniesResult = CpscResult<"penalty_companies">;
export type PenaltyProductsResult = CpscResult<"penalty_products">;
export type PenaltyYearsResult = CpscResult<"penalty_years">;
