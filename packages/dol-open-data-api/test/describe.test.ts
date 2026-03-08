import { describe, expect, test } from "bun:test";
import { createDescribe } from "../src/describe.js";
import metadataFixture from "./fixtures/msha-accident-metadata.json";
import datasetsFixture from "./fixtures/datasets-list.json";

describe("createDescribe", () => {
  let metaCalls = 0;
  let datasetCalls = 0;

  const describeFn = createDescribe({
    getMetadata: async () => {
      metaCalls++;
      return metadataFixture;
    },
    listDatasets: async () => {
      datasetCalls++;
      return datasetsFixture as any;
    },
  });

  test("returns columns from metadata", async () => {
    const desc = await describeFn("MSHA", "accident");
    expect(desc.columns.length).toBe(10);
    expect(desc.columns[0].name).toBe("mine_id");
    expect(desc.columns[0].type).toBe("varchar");
    expect(desc.columns[0].description).toContain("Mine ID");
  });

  test("returns dataset info from datasets listing", async () => {
    const desc = await describeFn("MSHA", "accident");
    expect(desc.name).toBe("Accident");
    expect(desc.description).toContain("accidents, injuries");
    expect(desc.frequency).toBe("Weekly");
    expect(desc.tags).toContain("accidents");
  });

  test("includes filter operators", async () => {
    const desc = await describeFn("MSHA", "accident");
    expect(desc.filterOperators).toContain("eq");
    expect(desc.filterOperators).toContain("like");
    expect(desc.filterOperators).toContain("not_in");
  });

  test("includes textSummary", async () => {
    const desc = await describeFn("MSHA", "accident");
    expect(desc.textSummary).toContain("MSHA/accident");
    expect(desc.textSummary).toContain("mine_id");
  });

  test("caches results", async () => {
    metaCalls = 0;
    datasetCalls = 0;
    const desc2 = createDescribe({
      getMetadata: async () => { metaCalls++; return metadataFixture; },
      listDatasets: async () => { datasetCalls++; return datasetsFixture as any; },
    });
    await desc2("MSHA", "accident");
    await desc2("MSHA", "accident");
    expect(metaCalls).toBe(1);
    expect(datasetCalls).toBe(1);
  });
});
