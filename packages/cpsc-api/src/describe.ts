import type { ParamDescription, EndpointDescription } from "govdata-core";

export type { ParamDescription, EndpointDescription };

const endpoints: EndpointDescription[] = [
  {
    name: "recalls",
    path: "/RestWebServices/Recall",
    description: "Search CPSC product recalls by date, product, hazard, manufacturer, and more",
    params: [
      { name: "RecallID", type: "number", required: false, description: "Recall ID" },
      { name: "RecallNumber", type: "string", required: false, description: "Recall number" },
      { name: "RecallDateStart", type: "string", required: false, description: "Start date (YYYY-MM-DD)" },
      { name: "RecallDateEnd", type: "string", required: false, description: "End date (YYYY-MM-DD)" },
      { name: "LastPublishDateStart", type: "string", required: false, description: "Last publish start date (YYYY-MM-DD)" },
      { name: "LastPublishDateEnd", type: "string", required: false, description: "Last publish end date (YYYY-MM-DD)" },
      { name: "RecallTitle", type: "string", required: false, description: "Search in recall title" },
      { name: "RecallDescription", type: "string", required: false, description: "Search in description" },
      { name: "ConsumerContact", type: "string", required: false, description: "Search in consumer contact info" },
      { name: "ProductName", type: "string", required: false, description: "Product name" },
      { name: "ProductDescription", type: "string", required: false, description: "Search in product description" },
      { name: "ProductModel", type: "string", required: false, description: "Product model" },
      { name: "ProductType", type: "string", required: false, description: "Product type" },
      { name: "Hazard", type: "string", required: false, description: "Hazard description" },
      { name: "Manufacturer", type: "string", required: false, description: "Manufacturer name" },
      { name: "Retailer", type: "string", required: false, description: "Retailer name" },
      { name: "Importer", type: "string", required: false, description: "Importer name" },
      { name: "Distributor", type: "string", required: false, description: "Distributor name" },
      { name: "ManufacturerCountry", type: "string", required: false, description: "Country of manufacture" },
      { name: "UPC", type: "string", required: false, description: "UPC code" },
      { name: "Remedy", type: "string", required: false, description: "Search in remedy text" },
      { name: "RemedyOption", type: "string", required: false, description: "Remedy option (Refund, Replace, Repair)" },
      { name: "RecallURL", type: "string", required: false, description: "Filter by recall URL" },
      { name: "ImageURL", type: "string", required: false, description: "Filter by image URL" },
      { name: "InconjunctionURL", type: "string", required: false, description: "Filter by inconjunction URL" },
    ],
    responseFields: [
      "RecallNumber", "RecallDate", "Title", "Products", "Hazards",
      "Injuries", "Remedies", "RemedyOptions", "Manufacturers",
      "Retailers", "Importers", "Distributors", "ManufacturerCountries", "URL",
    ],
  },
  {
    name: "penalties",
    path: "/RestWebServices/Penalty/Penalty",
    description: "Search CPSC civil or criminal penalties by company, product, or fiscal year",
    params: [
      { name: "penaltytype", type: "string", required: false, description: "Penalty type: civil or criminal (default: civil)" },
      { name: "company", type: "string", required: false, description: "Company name filter" },
      { name: "product", type: "string", required: false, description: "Product type filter" },
      { name: "fiscalyear", type: "string", required: false, description: "Fiscal year filter" },
    ],
    responseFields: [
      "RecallNo", "Firm", "PenaltyType", "PenaltyDate", "Act",
      "Fine", "FiscalYear", "ProductTypes", "ReleaseTitle", "ReleaseURL",
    ],
  },
  {
    name: "penalty_companies",
    path: "/RestWebServices/Penalty/Company",
    description: "List companies with CPSC penalties",
    params: [
      { name: "penaltytype", type: "string", required: false, description: "Penalty type: civil or criminal (default: civil)" },
    ],
    responseFields: ["Company"],
  },
  {
    name: "penalty_products",
    path: "/RestWebServices/Penalty/Product",
    description: "List product types associated with CPSC penalties",
    params: [
      { name: "penaltytype", type: "string", required: false, description: "Penalty type: civil or criminal (default: civil)" },
    ],
    responseFields: ["Type", "CategoryID"],
  },
  {
    name: "penalty_years",
    path: "/RestWebServices/Penalty/FiscalYear",
    description: "List fiscal years with CPSC penalty records",
    params: [
      { name: "penaltytype", type: "string", required: false, description: "Penalty type: civil or criminal (default: civil)" },
    ],
    responseFields: ["FiscalYear"],
  },
];

export function describe(): { endpoints: EndpointDescription[] } {
  return { endpoints };
}
