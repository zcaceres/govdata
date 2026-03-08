import { describe, it, expect } from "bun:test";
import { buildSchemaFromParams } from "../src/mcp-utils";
import { z } from "zod";

describe("buildSchemaFromParams", () => {
  it("builds enum schema for params with values", () => {
    const shape = buildSchemaFromParams([
      { name: "sort_by", type: "string", required: false, values: ["savings", "value", "date"] },
    ]);
    expect(shape.sort_by).toBeDefined();
    const result = (shape.sort_by as z.ZodOptional<z.ZodEnum<any>>).safeParse("savings");
    expect(result.success).toBe(true);
  });

  it("builds number schema for number params", () => {
    const shape = buildSchemaFromParams([
      { name: "page", type: "number", required: false },
    ]);
    expect(shape.page).toBeDefined();
  });

  it("builds string schema for string params", () => {
    const shape = buildSchemaFromParams([
      { name: "filter", type: "string", required: true },
    ]);
    expect(shape.filter).toBeDefined();
  });

  it("number param with min: 0 accepts zero", () => {
    const shape = buildSchemaFromParams([
      { name: "offset", type: "number", required: false, min: 0 },
    ]);
    const result = (shape.offset as z.ZodOptional<z.ZodNumber>).safeParse(0);
    expect(result.success).toBe(true);
  });

  it("number param without min rejects zero (positive only)", () => {
    const shape = buildSchemaFromParams([
      { name: "page", type: "number", required: false },
    ]);
    const result = (shape.page as z.ZodOptional<z.ZodNumber>).safeParse(0);
    expect(result.success).toBe(false);
  });
});
