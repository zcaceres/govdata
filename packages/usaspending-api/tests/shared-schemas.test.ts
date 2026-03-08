import { describe, it, expect } from "bun:test";
import {
  CursorPageMetaSchema,
  OffsetPageMetaSchema,
  cursorPaginatedResponse,
  offsetPaginatedResponse,
  simpleResultsResponse,
  AwardSearchFiltersSchema,
  TimePeriodSchema,
  AwardTypeCodes,
} from "../src/shared-schemas";
import { z } from "zod";

describe("CursorPageMetaSchema", () => {
  it("parses valid cursor pagination metadata", () => {
    const result = CursorPageMetaSchema.parse({
      page: 1,
      hasNext: true,
      last_record_unique_id: 12345,
      last_record_sort_value: "100.00",
    });
    expect(result.page).toBe(1);
    expect(result.hasNext).toBe(true);
  });

  it("accepts string unique_id", () => {
    const result = CursorPageMetaSchema.parse({
      page: 1,
      hasNext: false,
      last_record_unique_id: "abc-123",
    });
    expect(result.last_record_unique_id).toBe("abc-123");
  });

  it("accepts null unique_id", () => {
    const result = CursorPageMetaSchema.parse({
      page: 1,
      hasNext: false,
      last_record_unique_id: null,
    });
    expect(result.last_record_unique_id).toBeNull();
  });
});

describe("OffsetPageMetaSchema", () => {
  it("parses valid offset pagination metadata", () => {
    const result = OffsetPageMetaSchema.parse({
      page: 1,
      count: 100,
      next: 2,
      previous: null,
      hasNext: true,
      hasPrevious: false,
    });
    expect(result.page).toBe(1);
    expect(result.hasNext).toBe(true);
    expect(result.hasPrevious).toBe(false);
  });
});

describe("cursorPaginatedResponse", () => {
  it("creates a schema that parses paginated data", () => {
    const itemSchema = z.object({ id: z.number(), name: z.string() });
    const schema = cursorPaginatedResponse(itemSchema);
    const result = schema.parse({
      results: [{ id: 1, name: "test" }],
      page_metadata: { page: 1, hasNext: false },
      limit: 10,
    });
    expect(result.results.length).toBe(1);
    expect(result.results[0].name).toBe("test");
  });
});

describe("offsetPaginatedResponse", () => {
  it("creates a schema that parses offset-paginated data", () => {
    const itemSchema = z.object({ value: z.string() });
    const schema = offsetPaginatedResponse(itemSchema);
    const result = schema.parse({
      results: [{ value: "a" }, { value: "b" }],
      page_metadata: { page: 1, hasNext: true, hasPrevious: false },
    });
    expect(result.results.length).toBe(2);
  });
});

describe("simpleResultsResponse", () => {
  it("creates a schema for simple results arrays", () => {
    const itemSchema = z.object({ label: z.string() });
    const schema = simpleResultsResponse(itemSchema);
    const result = schema.parse({
      results: [{ label: "x" }],
      messages: ["warning"],
    });
    expect(result.results.length).toBe(1);
    expect(result.messages).toEqual(["warning"]);
  });
});

describe("AwardSearchFiltersSchema", () => {
  it("accepts keyword filter", () => {
    const result = AwardSearchFiltersSchema.safeParse({ keywords: ["NASA"] });
    expect(result.success).toBe(true);
  });

  it("accepts time_period filter", () => {
    const result = AwardSearchFiltersSchema.safeParse({
      time_period: [{ start_date: "2024-01-01", end_date: "2024-12-31" }],
    });
    expect(result.success).toBe(true);
  });

  it("accepts naics_codes as array", () => {
    const result = AwardSearchFiltersSchema.safeParse({
      naics_codes: ["541330"],
    });
    expect(result.success).toBe(true);
  });

  it("accepts naics_codes as require/exclude object", () => {
    const result = AwardSearchFiltersSchema.safeParse({
      naics_codes: { require: ["541330"], exclude: ["999999"] },
    });
    expect(result.success).toBe(true);
  });

  it("accepts agencies array", () => {
    const result = AwardSearchFiltersSchema.safeParse({
      agencies: [{ type: "awarding", tier: "toptier", name: "NASA" }],
    });
    expect(result.success).toBe(true);
  });

  it("is passthrough (allows unknown fields)", () => {
    const result = AwardSearchFiltersSchema.parse({
      keywords: ["test"],
      some_future_field: true,
    });
    expect((result as any).some_future_field).toBe(true);
  });
});

describe("AwardTypeCodes", () => {
  it("has all expected categories", () => {
    expect(AwardTypeCodes.contracts).toEqual(["A", "B", "C", "D"]);
    expect(AwardTypeCodes.grants).toEqual(["02", "03", "04", "05"]);
    expect(AwardTypeCodes.loans).toEqual(["07", "08"]);
    expect(AwardTypeCodes.direct_payments).toEqual(["06", "10"]);
    expect(AwardTypeCodes.other).toEqual(["09", "11"]);
    expect(AwardTypeCodes.idvs.length).toBeGreaterThan(0);
  });
});
