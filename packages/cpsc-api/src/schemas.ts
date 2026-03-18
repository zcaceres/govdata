import { z } from "zod";

// --- Param schemas (.strict() to catch typos) ---

export const RecallParamsSchema = z
  .object({
    RecallID: z.coerce.number().int().positive().optional(),
    RecallNumber: z.string().optional(),
    RecallDateStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD format").optional(),
    RecallDateEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD format").optional(),
    LastPublishDateStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD format").optional(),
    LastPublishDateEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD format").optional(),
    RecallTitle: z.string().optional(),
    RecallDescription: z.string().optional(),
    ProductName: z.string().optional(),
    ProductDescription: z.string().optional(),
    ProductModel: z.string().optional(),
    ProductType: z.string().optional(),
    Hazard: z.string().optional(),
    Manufacturer: z.string().optional(),
    Retailer: z.string().optional(),
    Importer: z.string().optional(),
    Distributor: z.string().optional(),
    ManufacturerCountry: z.string().optional(),
    UPC: z.string().optional(),
    Remedy: z.string().optional(),
    RemedyOption: z.string().optional(),
    ConsumerContact: z.string().optional(),
    RecallURL: z.string().optional(),
    ImageURL: z.string().optional(),
    InconjunctionURL: z.string().optional(),
  })
  .strict()
  .refine(
    (d) => {
      if (d.RecallDateStart && d.RecallDateEnd) {
        return d.RecallDateStart <= d.RecallDateEnd;
      }
      return true;
    },
    { message: "RecallDateStart must be <= RecallDateEnd", path: ["RecallDateStart"] },
  )
  .refine(
    (d) => {
      if (d.LastPublishDateStart && d.LastPublishDateEnd) {
        return d.LastPublishDateStart <= d.LastPublishDateEnd;
      }
      return true;
    },
    { message: "LastPublishDateStart must be <= LastPublishDateEnd", path: ["LastPublishDateStart"] },
  );

export const PenaltyParamsSchema = z
  .object({
    penaltytype: z.enum(["civil", "criminal"]).default("civil"),
    company: z.string().optional(),
    product: z.string().optional(),
    fiscalyear: z.string().optional(),
  })
  .strict();

export const PenaltyListParamsSchema = z
  .object({
    penaltytype: z.enum(["civil", "criminal"]).default("civil"),
  })
  .strict();

// --- Response schemas (NOT .strict() — APIs may add fields) ---

const ProductSchema = z.object({
  Name: z.string(),
  Description: z.string(),
  Model: z.string(),
  Type: z.string(),
  CategoryID: z.string(),
  NumberOfUnits: z.string(),
});

const ImageSchema = z.object({
  URL: z.string(),
  Caption: z.string(),
});

const InjurySchema = z.object({
  Name: z.string(),
});

const CompanySchema = z.object({
  Name: z.string(),
  CompanyID: z.string(),
});

const CountrySchema = z.object({
  Country: z.string(),
});

const UPCSchema = z.object({
  UPC: z.string(),
});

const HazardSchema = z.object({
  Name: z.string(),
  HazardType: z.string(),
  HazardTypeID: z.string(),
});

const RemedySchema = z.object({
  Name: z.string(),
});

const RemedyOptionSchema = z.object({
  Option: z.string(),
});

const InconjunctionSchema = z.object({
  URL: z.string(),
});

export const RecallSchema = z.object({
  RecallID: z.number(),
  RecallNumber: z.string(),
  RecallDate: z.string(),
  Description: z.string(),
  URL: z.string(),
  Title: z.string(),
  ConsumerContact: z.string(),
  LastPublishDate: z.string(),
  Products: z.array(ProductSchema),
  Inconjunctions: z.array(InconjunctionSchema),
  Images: z.array(ImageSchema),
  Injuries: z.array(InjurySchema),
  Manufacturers: z.array(CompanySchema),
  Retailers: z.array(CompanySchema),
  Importers: z.array(CompanySchema),
  Distributors: z.array(CompanySchema),
  SoldAtLabel: z.string().nullable(),
  ManufacturerCountries: z.array(CountrySchema),
  ProductUPCs: z.array(UPCSchema),
  Hazards: z.array(HazardSchema),
  Remedies: z.array(RemedySchema),
  RemedyOptions: z.array(RemedyOptionSchema),
});

export const RecallsResponseSchema = z.array(RecallSchema);

const PenaltyProductTypeSchema = z.object({
  Type: z.string(),
  CategoryID: z.string(),
});

export const PenaltySchema = z.object({
  RecallNo: z.string(),
  Firm: z.string(),
  PenaltyType: z.string(),
  PenaltyDate: z.string(),
  Act: z.string(),
  Fine: z.string().nullable(),
  FiscalYear: z.string(),
  ReleaseTitle: z.string(),
  ReleaseURL: z.string(),
  PenaltyID: z.number(),
  CompanyID: z.string().nullable(),
  ProductTypes: z.array(PenaltyProductTypeSchema),
});

export const PenaltiesResponseSchema = z.array(PenaltySchema);
export const PenaltyCompaniesResponseSchema = z.array(z.string());
export const PenaltyProductsResponseSchema = z.array(PenaltyProductTypeSchema);
export const PenaltyYearsResponseSchema = z.array(z.string());
