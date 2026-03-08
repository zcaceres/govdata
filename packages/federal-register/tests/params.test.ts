import { describe, expect, it } from "bun:test";
import { serializeParams } from "../src/params";

describe("serializeParams", () => {
  it("serializes a simple term", () => {
    expect(serializeParams({ term: "clean energy" })).toBe(
      "conditions[term]=clean%20energy",
    );
  });

  it("serializes array conditions with bracket syntax", () => {
    const result = serializeParams({ agencies: ["epa", "doe"] });
    expect(result).toBe(
      "conditions[agencies][]=epa&conditions[agencies][]=doe",
    );
  });

  it("serializes single agency as array bracket", () => {
    const result = serializeParams({ agencies: ["epa"] });
    expect(result).toBe("conditions[agencies][]=epa");
  });

  it("serializes type array", () => {
    const result = serializeParams({ type: ["RULE", "PRORULE"] });
    expect(result).toBe("conditions[type][]=RULE&conditions[type][]=PRORULE");
  });

  it("serializes date range params with nested brackets", () => {
    const result = serializeParams({ publication_date_gte: "2024-01-01" });
    expect(result).toBe("conditions[publication_date][gte]=2024-01-01");
  });

  it("serializes multiple date params", () => {
    const result = serializeParams({
      publication_date_gte: "2024-01-01",
      publication_date_lte: "2024-12-31",
    });
    expect(result).toContain("conditions[publication_date][gte]=2024-01-01");
    expect(result).toContain("conditions[publication_date][lte]=2024-12-31");
  });

  it("serializes effective_date params", () => {
    expect(serializeParams({ effective_date_is: "2024-06-01" })).toBe(
      "conditions[effective_date][is]=2024-06-01",
    );
  });

  it("serializes fields as bracket arrays", () => {
    const result = serializeParams({ fields: ["title", "abstract"] });
    expect(result).toBe("fields[]=title&fields[]=abstract");
  });

  it("keeps page, per_page, order as top-level params", () => {
    const result = serializeParams({ page: 2, per_page: 25, order: "newest" });
    expect(result).toContain("page=2");
    expect(result).toContain("per_page=25");
    expect(result).toContain("order=newest");
    expect(result).not.toContain("conditions[page]");
  });

  it("handles mixed params", () => {
    const result = serializeParams({
      term: "regulation",
      agencies: ["epa"],
      publication_date_gte: "2024-01-01",
      fields: ["title"],
      page: 1,
      per_page: 20,
    });
    expect(result).toContain("conditions[term]=regulation");
    expect(result).toContain("conditions[agencies][]=epa");
    expect(result).toContain("conditions[publication_date][gte]=2024-01-01");
    expect(result).toContain("fields[]=title");
    expect(result).toContain("page=1");
    expect(result).toContain("per_page=20");
  });

  it("skips undefined and null values", () => {
    const result = serializeParams({ term: "test", agencies: undefined, page: null as any });
    expect(result).toBe("conditions[term]=test");
  });

  it("serializes significant as condition", () => {
    const result = serializeParams({ significant: 1 });
    expect(result).toBe("conditions[significant]=1");
  });

  it("serializes comment_date and signing_date ranges", () => {
    expect(serializeParams({ comment_date_gte: "2024-01-01" })).toBe(
      "conditions[comment_date][gte]=2024-01-01",
    );
    expect(serializeParams({ signing_date_lte: "2024-12-31" })).toBe(
      "conditions[signing_date][lte]=2024-12-31",
    );
  });

  it("encodes special characters in values", () => {
    const result = serializeParams({ term: "clean & safe" });
    expect(result).toBe("conditions[term]=clean%20%26%20safe");
  });
});
