#!/usr/bin/env bun
/**
 * Exercises all 9 Federal Register API endpoints via the ORM-like interface.
 * Validates that real API responses parse correctly through our schemas.
 */
import { fr } from "../src/fr";

let passed = 0;
let failed = 0;

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err: any) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
    if (err.issues) console.error(`    ${JSON.stringify(err.issues.slice(0, 3), null, 2)}`);
    failed++;
  }
}

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
}

console.log("\n=== Federal Register API Exercise ===\n");

// 1. Document Search
console.log("1. documents.search()");
await test("basic term search", async () => {
  const result = await fr.documents.search({ term: "executive order", per_page: 3 });
  assert(result.kind === "documents", `kind should be "documents", got "${result.kind}"`);
  assert(Array.isArray(result.data), "data should be array");
  assert(result.data.length > 0, "should have results");
  assert(result.data.length <= 3, `should have at most 3 results, got ${result.data.length}`);
  assert(result.meta !== null, "should have meta");
  assert(result.meta!.total_results > 0, "should have total_results");
  assert(result.meta!.pages > 0, "should have pages");
  // Verify document fields
  const doc = result.data[0];
  assert(typeof doc.document_number === "string", "document_number should be string");
  assert(typeof doc.title === "string", "title should be string");
  assert(typeof doc.type === "string", "type should be string");
  assert(typeof doc.publication_date === "string", "publication_date should be string");
  assert(typeof doc.html_url === "string", "html_url should be string");
  console.log(`    → ${result.meta!.total_results} total, page 1 of ${result.meta!.pages}`);
  console.log(`    → First: "${doc.title.slice(0, 80)}..."`);
});

await test("search with type filter", async () => {
  const result = await fr.documents.search({ type: ["PRESDOCU"], per_page: 3 });
  assert(result.data.length > 0, "should have presidential documents");
  for (const doc of result.data) {
    assert(doc.type === "Presidential Document", `type should be Presidential Document, got "${doc.type}"`);
  }
});

await test("search with date range", async () => {
  const result = await fr.documents.search({
    term: "regulation",
    publication_date_gte: "2025-01-01",
    publication_date_lte: "2025-03-01",
    per_page: 3,
  });
  assert(result.data.length > 0, "should have results in date range");
  for (const doc of result.data) {
    assert(doc.publication_date >= "2025-01-01", `date ${doc.publication_date} should be >= 2025-01-01`);
    assert(doc.publication_date <= "2025-03-01", `date ${doc.publication_date} should be <= 2025-03-01`);
  }
});

await test("search with agency filter", async () => {
  const result = await fr.documents.search({ agencies: ["environmental-protection-agency"], per_page: 3 });
  assert(result.data.length > 0, "should have EPA results");
});

await test("search with fields selection", async () => {
  const result = await fr.documents.search({
    term: "clean energy",
    fields: ["document_number", "title", "type"],
    per_page: 2,
  });
  assert(result.data.length > 0, "should have results");
  const doc = result.data[0];
  assert(typeof doc.document_number === "string", "should have document_number");
  assert(typeof doc.title === "string", "should have title");
});

await test("search with order", async () => {
  const result = await fr.documents.search({ term: "tax", order: "newest", per_page: 3 });
  assert(result.data.length > 0, "should have results");
});

await test("summary() format", async () => {
  const result = await fr.documents.search({ term: "test", per_page: 5 });
  const summary = result.summary();
  assert(summary.includes("documents:"), `summary should start with "documents:", got "${summary}"`);
  assert(summary.includes("of"), `summary should contain "of" for total, got "${summary}"`);
});

await test("toMarkdown() output", async () => {
  const result = await fr.documents.search({ term: "test", per_page: 2 });
  const md = result.toMarkdown();
  assert(md.includes("|"), "markdown should contain table pipes");
  assert(md.includes("document_number"), "markdown should contain column headers");
});

await test("toCSV() output", async () => {
  const result = await fr.documents.search({ term: "test", per_page: 2 });
  const csv = result.toCSV();
  assert(csv.includes(","), "csv should contain commas");
  assert(csv.includes("document_number"), "csv should contain headers");
});

// 2. Document Find
console.log("\n2. documents.find()");
await test("find single document by number", async () => {
  // First search to get a valid document number
  const search = await fr.documents.search({ per_page: 1 });
  const docNum = search.data[0].document_number;

  const result = await fr.documents.find(docNum);
  assert(result.kind === "document", `kind should be "document", got "${result.kind}"`);
  assert(result.data.length === 1, `should have exactly 1 doc, got ${result.data.length}`);
  assert(result.data[0].document_number === docNum, "document_number should match");
  assert(result.meta === null, "meta should be null for single doc");

  // Full document should have more fields
  const doc = result.data[0];
  console.log(`    → "${doc.title.slice(0, 80)}..."`);
  console.log(`    → Type: ${doc.type}, Published: ${doc.publication_date}`);
  if (doc.agencies?.length) {
    console.log(`    → Agencies: ${doc.agencies.map(a => a.name).join(", ")}`);
  }
});

await test("find with fields selection", async () => {
  const search = await fr.documents.search({ per_page: 1 });
  const docNum = search.data[0].document_number;
  const result = await fr.documents.find(docNum, { fields: ["document_number", "title"] });
  assert(result.data[0].document_number === docNum, "should find correct doc");
});

// 3. Document FindMany
console.log("\n3. documents.findMany()");
await test("find multiple documents", async () => {
  const search = await fr.documents.search({ per_page: 3 });
  const nums = search.data.map(d => d.document_number);

  const result = await fr.documents.findMany(nums);
  assert(result.kind === "documents_multi", `kind should be "documents_multi", got "${result.kind}"`);
  assert(result.data.length >= 1, "should have at least 1 result");
  console.log(`    → Found ${result.data.length} of ${nums.length} requested`);
});

// 4. Agencies All
console.log("\n4. agencies.all()");
await test("list all agencies", async () => {
  const result = await fr.agencies.all();
  assert(result.kind === "agencies", `kind should be "agencies", got "${result.kind}"`);
  assert(result.data.length > 100, `should have many agencies, got ${result.data.length}`);
  assert(result.meta === null, "meta should be null");

  const agency = result.data[0];
  assert(typeof agency.id === "number", "id should be number");
  assert(typeof agency.name === "string", "name should be string");
  assert(typeof agency.slug === "string", "slug should be string");
  console.log(`    → ${result.data.length} agencies total`);

  // Spot check a known agency
  const epa = result.data.find(a => a.slug === "environmental-protection-agency");
  assert(epa !== undefined, "should find EPA");
  console.log(`    → EPA: id=${epa!.id}, name="${epa!.name}"`);
});

// 5. Agency Find
console.log("\n5. agencies.find()");
await test("find agency by ID", async () => {
  // Get EPA's ID from the list
  const all = await fr.agencies.all();
  const epa = all.data.find(a => a.slug === "environmental-protection-agency");
  assert(epa !== undefined, "should find EPA in list");

  const result = await fr.agencies.find(epa!.id);
  assert(result.kind === "agency", `kind should be "agency", got "${result.kind}"`);
  assert(result.data.length === 1, "should have exactly 1 agency");
  assert(result.data[0].id === epa!.id, "id should match");
  assert(result.data[0].name === epa!.name, "name should match");
  console.log(`    → ${result.data[0].name} (id=${result.data[0].id})`);
});

// 6. Public Inspection Search
console.log("\n6. publicInspection.search()");
await test("search public inspection documents", async () => {
  const result = await fr.publicInspection.search({ per_page: 3 });
  assert(result.kind === "public_inspection", `kind should be "public_inspection", got "${result.kind}"`);
  assert(result.meta !== null, "should have meta");
  assert(result.meta!.total_results > 0, "should have total_results");
  if (result.data.length > 0) {
    const doc = result.data[0];
    assert(typeof doc.document_number === "string", "document_number should be string");
    assert(typeof doc.title === "string", "title should be string");
    console.log(`    → ${result.meta!.total_results} total, first: "${doc.title.slice(0, 80)}..."`);
  } else {
    console.log(`    → 0 results (may be empty outside business hours)`);
  }
});

// 7. Public Inspection Current
console.log("\n7. publicInspection.current()");
await test("get current public inspection documents", async () => {
  const result = await fr.publicInspection.current();
  assert(result.kind === "public_inspection_current", `kind should be "public_inspection_current"`);
  assert(result.meta === null, "meta should be null");
  console.log(`    → ${result.data.length} documents currently on inspection`);
  if (result.data.length > 0) {
    const doc = result.data[0];
    assert(typeof doc.document_number === "string", "document_number should be string");
  }
});

// 8. Facets
console.log("\n8. facets.get()");
await test("get agency facets", async () => {
  const result = await fr.facets.get("agency", { term: "regulation" });
  assert(result.kind === "facets", `kind should be "facets", got "${result.kind}"`);
  const entries = Object.entries(result.data);
  assert(entries.length > 0, "should have facet entries");
  const [slug, entry] = entries[0];
  assert(typeof slug === "string", "key should be string (agency slug)");
  assert(typeof entry.count === "number", "count should be number");
  assert(typeof entry.name === "string", "name should be string");
  console.log(`    → ${entries.length} agencies, top: ${entry.name} (${entry.count})`);
  assert(result.summary().includes("facets:"), "summary should mention facets");
});

await test("get daily facets", async () => {
  const result = await fr.facets.get("daily", {
    term: "regulation",
    publication_date_gte: "2025-01-01",
    publication_date_lte: "2025-01-31",
  });
  const entries = Object.entries(result.data);
  assert(entries.length > 0, "should have daily entries");
  console.log(`    → ${entries.length} days with data`);
});

await test("get topic facets", async () => {
  const result = await fr.facets.get("topic", { term: "energy" });
  const entries = Object.entries(result.data);
  assert(entries.length > 0, "should have topic entries");
  console.log(`    → ${entries.length} topics`);
});

await test("get section facets", async () => {
  const result = await fr.facets.get("section", { term: "energy" });
  const entries = Object.entries(result.data);
  assert(entries.length > 0, "should have section entries");
  console.log(`    → ${entries.length} sections`);
});

await test("get type facets", async () => {
  const result = await fr.facets.get("type", { term: "energy" });
  const entries = Object.entries(result.data);
  assert(entries.length > 0, "should have type entries");
  console.log(`    → Types: ${entries.map(([k, v]) => `${v.name}(${v.count})`).join(", ")}`);
});

// 9. Suggested Searches
console.log("\n9. suggestedSearches.all()");
await test("list all suggested searches", async () => {
  const result = await fr.suggestedSearches.all();
  assert(result.kind === "suggested_searches", `kind should be "suggested_searches"`);
  const sections = Object.keys(result.data);
  assert(sections.length > 0, "should have sections");
  const totalSearches = Object.values(result.data).reduce((sum, arr) => sum + arr.length, 0);
  console.log(`    → ${totalSearches} searches across ${sections.length} sections: ${sections.join(", ")}`);

  // Verify structure of a search
  const firstSection = result.data[sections[0]];
  assert(firstSection.length > 0, "first section should have searches");
  const search = firstSection[0];
  assert(typeof search.slug === "string", "slug should be string");
  assert(typeof search.title === "string", "title should be string");
  assert(typeof search.section === "string", "section should be string");
  assert(typeof search.documents_in_last_year === "number", "documents_in_last_year should be number");
  assert(result.summary().includes("searches across"), "summary should mention searches");
});

// 10. Pagination
console.log("\n10. Pagination (.pages generator)");
await test("iterate pages with async generator", async () => {
  let pageCount = 0;
  let totalDocs = 0;
  for await (const page of fr.documents.search.pages({ term: "clean air", per_page: 5 })) {
    pageCount++;
    totalDocs += page.data.length;
    if (pageCount >= 2) break; // Only test first 2 pages
  }
  assert(pageCount === 2, `should have iterated 2 pages, got ${pageCount}`);
  assert(totalDocs > 5, `should have more than 5 docs across 2 pages, got ${totalDocs}`);
  console.log(`    → ${totalDocs} docs across ${pageCount} pages`);
});

// 11. Plugin interface
console.log("\n11. Plugin interface (CLI param coercion)");
await test("plugin endpoints work with string params", async () => {
  const { federalRegisterPlugin } = await import("../src/plugin");

  // Simulate CLI-style params (all strings, comma-separated)
  const result = await federalRegisterPlugin.endpoints.documents({
    term: "energy",
    per_page: 3, // CLI sends as number
    type: "RULE,PRORULE", // CLI sends comma-separated
  });
  assert(result.kind === "documents", "should return documents");
  assert(Array.isArray(result.data), "data should be array");
});

await test("plugin document endpoint", async () => {
  const { federalRegisterPlugin } = await import("../src/plugin");
  const search = await fr.documents.search({ per_page: 1 });
  const docNum = search.data[0].document_number;

  const result = await federalRegisterPlugin.endpoints.document({ document_number: docNum });
  assert(result.kind === "document", "should return document");
});

await test("plugin facets endpoint", async () => {
  const { federalRegisterPlugin } = await import("../src/plugin");
  const result = await federalRegisterPlugin.endpoints.facets({
    facet_type: "agency",
    term: "regulation",
  });
  assert(result.kind === "facets", "should return facets");
});

await test("plugin describe()", async () => {
  const { federalRegisterPlugin } = await import("../src/plugin");
  const desc = federalRegisterPlugin.describe();
  assert(desc.endpoints.length === 9, `should have 9 endpoints, got ${desc.endpoints.length}`);
  assert(federalRegisterPlugin.prefix === "federal-register", `prefix should be "federal-register"`);
});

// Summary
console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
if (failed > 0) process.exit(1);
