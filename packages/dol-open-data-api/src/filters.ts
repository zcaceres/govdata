import type { FilterCondition, FilterExpression } from "./schemas.js";

type ScalarValue = string | number;
type FilterValue = ScalarValue | ScalarValue[];

const condition = (field: string, operator: FilterCondition["operator"], value: FilterValue): FilterCondition => ({
  field,
  operator,
  value,
});

export const eq = (field: string, value: ScalarValue): FilterCondition => condition(field, "eq", value);
export const neq = (field: string, value: ScalarValue): FilterCondition => condition(field, "neq", value);
export const gt = (field: string, value: ScalarValue): FilterCondition => condition(field, "gt", value);
export const lt = (field: string, value: ScalarValue): FilterCondition => condition(field, "lt", value);
export const like = (field: string, value: string): FilterCondition => condition(field, "like", value);
export const isIn = (field: string, value: ScalarValue[]): FilterCondition => condition(field, "in", value);
export const notIn = (field: string, value: ScalarValue[]): FilterCondition => condition(field, "not_in", value);

export const and = (...exprs: FilterExpression[]): FilterExpression => ({ and: exprs });
export const or = (...exprs: FilterExpression[]): FilterExpression => ({ or: exprs });

function expressionToApi(expr: FilterExpression): unknown {
  if ("and" in expr) {
    return { and: expr.and.map(expressionToApi) };
  }
  if ("or" in expr) {
    return { or: expr.or.map(expressionToApi) };
  }
  const { field, operator, value } = expr as FilterCondition;
  return { column: field, comparator: operator, value };
}

export function serializeFilter(expr: FilterExpression): string {
  return encodeURIComponent(JSON.stringify(expressionToApi(expr)));
}
