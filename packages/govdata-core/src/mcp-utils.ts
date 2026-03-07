import { z } from "zod";
import type { ParamDescription } from "./describe";

export function buildSchemaFromParams(
  params: ParamDescription[],
): Record<string, z.ZodTypeAny> {
  const schemaShape: Record<string, z.ZodTypeAny> = {};
  for (const param of params) {
    let schema: z.ZodTypeAny;
    if (param.values) {
      schema = z.enum(param.values as [string, ...string[]]);
    } else if (param.type === "number") {
      schema = z.number().int().positive();
    } else {
      schema = z.string();
    }
    if (!param.required) {
      schema = schema.optional();
    }
    schemaShape[param.name] = schema.describe(
      param.values ? `One of: ${param.values.join(", ")}` : param.type,
    );
  }
  return schemaShape;
}
