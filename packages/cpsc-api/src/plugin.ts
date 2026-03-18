import { GovValidationError } from "govdata-core";
import type { GovDataPlugin } from "govdata-core";
import { recalls, penalties, penaltyCompanies, penaltyProducts, penaltyYears } from "./endpoints";
import { describe } from "./describe";
import type { CpscResult } from "./response";

function coercePenaltyType(params: any): any {
  const coerced = { ...params };
  if (coerced.penaltytype != null) {
    coerced.penaltytype = String(coerced.penaltytype).toLowerCase();
    if (coerced.penaltytype !== "civil" && coerced.penaltytype !== "criminal") {
      throw new GovValidationError("penaltytype", coerced.penaltytype, "Must be 'civil' or 'criminal'");
    }
  }
  return coerced;
}

export const cpscPlugin: GovDataPlugin = {
  prefix: "cpsc",
  describe,
  endpoints: {
    recalls: (params?: any) => {
      if (!params || Object.keys(params).length === 0) {
        throw new GovValidationError("params", undefined, "At least one filter is required (e.g. RecallDateStart, ProductName, Manufacturer)");
      }
      const coerced = { ...params };
      // Coerce RecallID from CLI: parseFlags may produce number, API expects number but schema uses coerce
      if (coerced.RecallID != null) {
        if (coerced.RecallID === true || coerced.RecallID === "") {
          throw new GovValidationError("RecallID", coerced.RecallID, "Recall ID required");
        }
        const n = Number(coerced.RecallID);
        if (!Number.isFinite(n)) {
          throw new GovValidationError("RecallID", coerced.RecallID, "Must be a valid number");
        }
        coerced.RecallID = n;
      }
      // Coerce string params that parseFlags might turn into numbers or booleans
      for (const key of [
        "RecallNumber", "RecallDateStart", "RecallDateEnd",
        "LastPublishDateStart", "LastPublishDateEnd",
        "RecallTitle", "RecallDescription",
        "ProductName", "ProductDescription", "ProductModel", "ProductType",
        "Hazard", "Manufacturer", "Retailer", "Importer", "Distributor",
        "ManufacturerCountry", "UPC", "Remedy", "RemedyOption", "ConsumerContact",
        "RecallURL", "ImageURL", "InconjunctionURL",
      ] as const) {
        if (coerced[key] != null) {
          if (coerced[key] === true) {
            throw new GovValidationError(key, coerced[key], "Value required");
          }
          coerced[key] = String(coerced[key]);
        }
      }
      return recalls(coerced);
    },
    penalties: (params?: any) => {
      if (!params || Object.keys(params).length === 0) return penalties();
      const coerced = coercePenaltyType(params);
      // Coerce string filter params
      for (const key of ["company", "product", "fiscalyear"] as const) {
        if (coerced[key] != null) {
          if (coerced[key] === true) {
            throw new GovValidationError(key, coerced[key], "Value required");
          }
          coerced[key] = String(coerced[key]);
        }
      }
      return penalties(coerced);
    },
    // dispatch() normalizes kebab-case to snake_case via kebabToSnake(),
    // so "penalty-companies" becomes "penalty_companies" at lookup time.
    penalty_companies: (params?: any) => {
      if (!params || Object.keys(params).length === 0) return penaltyCompanies();
      return penaltyCompanies(coercePenaltyType(params));
    },
    penalty_products: (params?: any) => {
      if (!params || Object.keys(params).length === 0) return penaltyProducts();
      return penaltyProducts(coercePenaltyType(params));
    },
    penalty_years: (params?: any) => {
      if (!params || Object.keys(params).length === 0) return penaltyYears();
      return penaltyYears(coercePenaltyType(params));
    },
  } as Record<string, (params?: any) => Promise<CpscResult>>,
};
