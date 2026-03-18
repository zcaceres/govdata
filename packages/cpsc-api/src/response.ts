import { createResult, escapeCSV, escapeMarkdownCell } from "govdata-core";
import type { GovResult } from "govdata-core";
import type {
  CpscResult,
  EndpointKind,
  Recall,
  Penalty,
  PenaltyProductType,
} from "./types";

export type { CpscResult, EndpointKind };

function formatDate(iso: string): string {
  if (!iso) return "";
  return iso.replace("T00:00:00", "").slice(0, 10);
}

function joinNames(items: { Name: string }[]): string {
  return items.map((i) => i.Name).filter(Boolean).join("; ");
}

function joinCompanies(items: { Name: string; CompanyID: string }[]): string {
  return items.map((i) => i.Name).filter(Boolean).join("; ");
}

/**
 * Recalls have deeply nested data — custom toMarkdown/toCSV (principle #8).
 * Flattens key nested fields into columns for tabular display.
 */
function wrapRecalls(recalls: Recall[]): CpscResult<"recalls"> {
  return {
    data: recalls,
    meta: null,
    kind: "recalls",
    toMarkdown(): string {
      if (recalls.length === 0) return "(no data)";

      const cols = [
        "Recall #", "Date", "Title", "Products", "Units",
        "Hazard", "Remedy", "Country",
      ];
      const header = `| ${cols.join(" | ")} |`;
      const sep = `| ${cols.map(() => "---").join(" | ")} |`;
      const rows = recalls.map((r) => {
        const products = r.Products.map((p) => p.Name).filter(Boolean).join("; ");
        const units = r.Products.map((p) => p.NumberOfUnits).filter(Boolean).join("; ");
        const hazard = r.Hazards.map((h) => h.Name).filter(Boolean).join("; ");
        // Truncate long hazard text for table readability
        const hazardShort = hazard.length > 120 ? hazard.slice(0, 117) + "..." : hazard;
        const remedy = r.RemedyOptions.map((o) => o.Option).join(", ");
        const countries = r.ManufacturerCountries.map((c) => c.Country).join(", ");
        const cells = [
          escapeMarkdownCell(r.RecallNumber),
          escapeMarkdownCell(formatDate(r.RecallDate)),
          escapeMarkdownCell(r.Title),
          escapeMarkdownCell(products),
          escapeMarkdownCell(units),
          escapeMarkdownCell(hazardShort),
          escapeMarkdownCell(remedy),
          escapeMarkdownCell(countries),
        ];
        return `| ${cells.join(" | ")} |`;
      });
      return [header, sep, ...rows].join("\n");
    },
    toCSV(): string {
      if (recalls.length === 0) return "";

      const cols = [
        "RecallNumber", "RecallDate", "Title", "URL", "Products",
        "NumberOfUnits", "Hazards", "Injuries", "Remedies", "RemedyOptions",
        "Manufacturers", "Retailers", "Importers", "Distributors",
        "ManufacturerCountries", "Description",
      ];
      const header = cols.join(",");
      const rows = recalls.map((r) => {
        const cells = [
          escapeCSV(r.RecallNumber),
          escapeCSV(formatDate(r.RecallDate)),
          escapeCSV(r.Title),
          escapeCSV(r.URL),
          escapeCSV(r.Products.map((p) => p.Name).filter(Boolean).join("; ")),
          escapeCSV(r.Products.map((p) => p.NumberOfUnits).filter(Boolean).join("; ")),
          escapeCSV(joinNames(r.Hazards)),
          escapeCSV(joinNames(r.Injuries)),
          escapeCSV(joinNames(r.Remedies)),
          escapeCSV(r.RemedyOptions.map((o) => o.Option).join(", ")),
          escapeCSV(joinCompanies(r.Manufacturers)),
          escapeCSV(joinCompanies(r.Retailers)),
          escapeCSV(joinCompanies(r.Importers)),
          escapeCSV(joinCompanies(r.Distributors)),
          escapeCSV(r.ManufacturerCountries.map((c) => c.Country).join(", ")),
          escapeCSV(r.Description),
        ];
        return cells.join(",");
      });
      return [header, ...rows].join("\n");
    },
    summary(): string {
      return `recalls: ${recalls.length} results`;
    },
  };
}

/**
 * Penalties are semi-tabular — flatten ProductTypes for display.
 */
function wrapPenalties(penalties: Penalty[]): CpscResult<"penalties"> {
  const flat = penalties.map((p) => ({
    RecallNo: p.RecallNo,
    Firm: p.Firm,
    PenaltyType: p.PenaltyType,
    PenaltyDate: formatDate(p.PenaltyDate),
    Act: p.Act,
    Fine: p.Fine ?? "",
    FiscalYear: p.FiscalYear,
    ProductTypes: p.ProductTypes.map((t) => t.Type).join(", "),
    ReleaseTitle: p.ReleaseTitle,
    ReleaseURL: p.ReleaseURL,
  }));

  const base = createResult(flat, null, "penalties") as GovResult<"penalties">;
  return {
    data: penalties,
    meta: null,
    kind: "penalties",
    toMarkdown: () => base.toMarkdown(),
    toCSV: () => base.toCSV(),
    summary: () => `penalties: ${penalties.length} results`,
  };
}

function wrapPenaltyCompanies(companies: string[]): CpscResult<"penalty-companies"> {
  const rows = companies.map((c) => ({ Company: c }));
  const base = createResult(rows, null, "penalty-companies");
  return {
    data: companies,
    meta: null,
    kind: "penalty-companies",
    toMarkdown: () => base.toMarkdown(),
    toCSV: () => base.toCSV(),
    summary: () => `penalty-companies: ${companies.length} results`,
  };
}

function wrapPenaltyProducts(products: PenaltyProductType[]): CpscResult<"penalty-products"> {
  const base = createResult(products, null, "penalty-products");
  return {
    data: products,
    meta: null,
    kind: "penalty-products",
    toMarkdown: () => base.toMarkdown(),
    toCSV: () => base.toCSV(),
    summary: () => `penalty-products: ${products.length} results`,
  };
}

function wrapPenaltyYears(years: string[]): CpscResult<"penalty-years"> {
  const rows = years.map((y) => ({ FiscalYear: y }));
  const base = createResult(rows, null, "penalty-years");
  return {
    data: years,
    meta: null,
    kind: "penalty-years",
    toMarkdown: () => base.toMarkdown(),
    toCSV: () => base.toCSV(),
    summary: () => `penalty-years: ${years.length} results`,
  };
}

export function wrapResponse<K extends EndpointKind>(
  data: unknown,
  kind: K,
): CpscResult<K> {
  switch (kind) {
    case "recalls":
      return wrapRecalls(data as Recall[]) as CpscResult<K>;
    case "penalties":
      return wrapPenalties(data as Penalty[]) as CpscResult<K>;
    case "penalty-companies":
      return wrapPenaltyCompanies(data as string[]) as CpscResult<K>;
    case "penalty-products":
      return wrapPenaltyProducts(data as PenaltyProductType[]) as CpscResult<K>;
    case "penalty-years":
      return wrapPenaltyYears(data as string[]) as CpscResult<K>;
    default:
      throw new Error(`Unknown kind: ${kind}`);
  }
}
