#!/usr/bin/env bun
/**
 * Exercise all BLS API endpoints against the real API.
 * Saves responses as fixtures and validates schemas + library output.
 *
 * Run: bun packages/bls-api/fixtures/exercise-api.ts
 *
 * Requires BLS_API_KEY in .env (500 req/day) or runs without (25 req/day).
 */
import {
  BLSResponseSchema,
  SurveysResponseSchema,
  PopularResponseSchema,
  PopularParamsSchema,
  TimeseriesParamsSchema,
} from "../src/schemas";
import { bls } from "../src/endpoints";
import { blsPlugin } from "../src/plugin";
import type { z } from "zod";

const BASE = "https://api.bls.gov/publicAPI/v2";
const DELAY_MS = 300;
const FIXTURE_DIR = import.meta.dir;
let reqCount = 0;

async function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

const apiKey = process.env.BLS_API_KEY;
console.log(`API key: ${apiKey ? "set (500 req/day)" : "NOT set (25 req/day)"}\n`);

// ---- Test cases ----

interface GetCase {
  name: string;
  fixture: string;
  method: "GET";
  path: string;
  schema: z.ZodType;
}

interface PostCase {
  name: string;
  fixture: string;
  method: "POST";
  path: string;
  body: unknown;
  schema: z.ZodType;
}

type TestCase = GetCase | PostCase;

const cases: TestCase[] = [
  // Surveys
  {
    name: "surveys",
    fixture: "surveys.json",
    method: "GET",
    path: "/surveys/",
    schema: SurveysResponseSchema,
  },

  // Popular — unfiltered
  {
    name: "popular (all)",
    fixture: "popular.json",
    method: "GET",
    path: "/timeseries/popular",
    schema: PopularResponseSchema,
  },

  // Popular — filtered by survey
  {
    name: "popular (survey=CU)",
    fixture: "popular-survey-cu.json",
    method: "GET",
    path: "/timeseries/popular?survey=CU",
    schema: PopularResponseSchema,
  },
  {
    name: "popular (survey=LN)",
    fixture: "popular-survey-ln.json",
    method: "GET",
    path: "/timeseries/popular?survey=LN",
    schema: PopularResponseSchema,
  },

  // Timeseries — single series, default range
  {
    name: "timeseries (single, CPI)",
    fixture: "timeseries.json",
    method: "POST",
    path: "/timeseries/data/",
    body: {
      seriesid: ["CUUR0000SA0"],
      ...(apiKey ? { registrationkey: apiKey } : {}),
    },
    schema: BLSResponseSchema,
  },

  // Timeseries — multi series
  {
    name: "timeseries (multi, CPI + unemployment)",
    fixture: "timeseries-multi.json",
    method: "POST",
    path: "/timeseries/data/",
    body: {
      seriesid: ["CUUR0000SA0", "LNS14000000"],
      ...(apiKey ? { registrationkey: apiKey } : {}),
    },
    schema: BLSResponseSchema,
  },

  // Timeseries — year range
  {
    name: "timeseries (year range 2020-2024)",
    fixture: "timeseries-year-range.json",
    method: "POST",
    path: "/timeseries/data/",
    body: {
      seriesid: ["CUUR0000SA0"],
      startyear: "2020",
      endyear: "2024",
      ...(apiKey ? { registrationkey: apiKey } : {}),
    },
    schema: BLSResponseSchema,
  },

  // Timeseries — with calculations + annual averages (requires API key)
  ...(apiKey
    ? [
        {
          name: "timeseries (calculations + annual averages)",
          fixture: "timeseries-calculations.json",
          method: "POST" as const,
          path: "/timeseries/data/",
          body: {
            seriesid: ["CUUR0000SA0"],
            startyear: "2023",
            endyear: "2024",
            calculations: true,
            annualaverage: true,
            registrationkey: apiKey,
          },
          schema: BLSResponseSchema,
        },
        {
          name: "timeseries (catalog metadata)",
          fixture: "timeseries-catalog.json",
          method: "POST" as const,
          path: "/timeseries/data/",
          body: {
            seriesid: ["CUUR0000SA0", "LNS14000000"],
            startyear: "2024",
            endyear: "2024",
            catalog: true,
            registrationkey: apiKey,
          },
          schema: BLSResponseSchema,
        },
        {
          name: "timeseries (aspects)",
          fixture: "timeseries-aspects.json",
          method: "POST" as const,
          path: "/timeseries/data/",
          body: {
            seriesid: ["CUUR0000SA0"],
            startyear: "2024",
            endyear: "2024",
            aspects: true,
            registrationkey: apiKey,
          },
          schema: BLSResponseSchema,
        },
      ]
    : []),
];

// ---- Run all API calls ----

let passed = 0;
let failed = 0;
const failures: { name: string; error: string; status?: number }[] = [];

console.log(`Exercising ${cases.length} BLS API endpoints...\n`);

for (const tc of cases) {
  if (reqCount > 0) await delay(DELAY_MS);
  reqCount++;

  process.stdout.write(`  ${tc.method.padEnd(4)} ${tc.name}...`);
  try {
    let url = `${BASE}${tc.path}`;
    // Append API key to GET requests as query param
    if (tc.method === "GET" && apiKey) {
      const sep = url.includes("?") ? "&" : "?";
      url += `${sep}registrationkey=${encodeURIComponent(apiKey)}`;
    }
    const init: RequestInit | undefined =
      tc.method === "POST"
        ? {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify((tc as PostCase).body),
          }
        : undefined;

    const res = await fetch(url, init);

    if (!res.ok) {
      const text = await res.text();
      console.log(` FAIL (HTTP ${res.status})`);
      failures.push({ name: tc.name, error: text.slice(0, 300), status: res.status });
      failed++;
      continue;
    }

    const json = await res.json();

    // Check for in-band errors
    if (json.status && json.status !== "REQUEST_SUCCEEDED") {
      const msg = json.message?.join("; ") ?? "Unknown error";
      console.log(` FAIL (${json.status}: ${msg})`);
      failures.push({ name: tc.name, error: msg });
      failed++;
      continue;
    }

    // Validate schema
    const parseResult = tc.schema.safeParse(json);
    if (!parseResult.success) {
      console.log(` FAIL (schema validation)`);
      failures.push({ name: tc.name, error: JSON.stringify(parseResult.error.issues.slice(0, 3)) });
      failed++;
      // Still save the fixture so we can inspect it
      await Bun.write(`${FIXTURE_DIR}/${tc.fixture}`, JSON.stringify(json, null, 2));
      continue;
    }

    // Save fixture
    await Bun.write(`${FIXTURE_DIR}/${tc.fixture}`, JSON.stringify(json, null, 2));
    console.log(` OK`);
    passed++;
  } catch (err: any) {
    console.log(` FAIL`);
    failures.push({ name: tc.name, error: err.message });
    failed++;
  }
}

// ---- Exercise library API with saved fixtures ----

console.log(`\n--- Library API tests (using saved fixtures) ---\n`);

let libPassed = 0;
let libFailed = 0;

async function libTest(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    libPassed++;
  } catch (err: any) {
    console.log(`  ✗ ${name}: ${err.message}`);
    libFailed++;
  }
}

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(msg);
}

// Use real API for library tests (these reuse cached responses mostly)
await libTest("bls.surveys() returns data", async () => {
  const result = await bls.surveys();
  assert(result.kind === "surveys", `kind should be surveys, got ${result.kind}`);
  assert(result.data.length > 50, `expected 50+ surveys, got ${result.data.length}`);
  assert(result.data[0].survey_abbreviation.length > 0, "survey_abbreviation should be non-empty");
  const md = result.toMarkdown();
  assert(md.includes("survey_abbreviation"), "markdown should have header");
  assert(!md.includes("[object Object]"), "markdown should not have [object Object]");
  const csv = result.toCSV();
  assert(csv.includes("survey_abbreviation,survey_name"), "CSV should have header");
  const summary = result.summary();
  assert(summary.includes("surveys"), "summary should mention surveys");
});

await delay(DELAY_MS);

await libTest("bls.popular() returns 25 series", async () => {
  const result = await bls.popular();
  assert(result.kind === "popular", `kind should be popular, got ${result.kind}`);
  assert(result.data.length === 25, `expected 25 popular, got ${result.data.length}`);
  const md = result.toMarkdown();
  assert(md.includes("seriesID"), "markdown should have seriesID header");
});

await delay(DELAY_MS);

await libTest("bls.popular({ survey: 'CU' }) filters correctly", async () => {
  const result = await bls.popular({ survey: "CU" });
  assert(result.data.length === 25, `expected 25, got ${result.data.length}`);
  for (const s of result.data) {
    assert(s.seriesID.startsWith("CU"), `expected CU prefix, got ${s.seriesID}`);
  }
});

await delay(DELAY_MS);

await libTest("bls.timeseries() single series", async () => {
  const result = await bls.timeseries({ series_id: "CUUR0000SA0" });
  assert(result.kind === "timeseries", `kind should be timeseries`);
  assert(result.data.length === 1, `expected 1 series`);
  assert(result.data[0].seriesID === "CUUR0000SA0", "wrong seriesID");
  assert((result.data[0].data?.length ?? 0) > 0, "should have data points");

  // Test formatters
  const md = result.toMarkdown();
  assert(md.includes("### CUUR0000SA0"), "markdown should have series header");
  assert(md.includes("| Year | Period | Value |"), "markdown should have table header");
  assert(!md.includes("[object Object]"), "no [object Object]");

  const csv = result.toCSV();
  assert(csv.includes("seriesID,year,period,periodName,value"), "CSV header");

  const summary = result.summary();
  assert(summary.includes("1 series"), "summary should say 1 series");
  assert(summary.includes("data points"), "summary should mention data points");
});

await delay(DELAY_MS);

await libTest("bls.timeseries() multi series", async () => {
  const result = await bls.timeseries({ series_id: ["CUUR0000SA0", "LNS14000000"] });
  assert(result.data.length === 2, `expected 2 series, got ${result.data.length}`);
  const ids = result.data.map((s) => s.seriesID).sort();
  assert(ids.includes("CUUR0000SA0"), "should have CPI");
  assert(ids.includes("LNS14000000"), "should have unemployment");

  const md = result.toMarkdown();
  assert(md.includes("### CUUR0000SA0"), "markdown should have CPI header");
  assert(md.includes("### LNS14000000"), "markdown should have unemployment header");

  const summary = result.summary();
  assert(summary.includes("2 series"), "summary should say 2 series");
});

await delay(DELAY_MS);

await libTest("bls.timeseries() with year range", async () => {
  const result = await bls.timeseries({ series_id: "CUUR0000SA0", start_year: 2023, end_year: 2024 });
  const years = new Set(result.data[0].data?.map((p) => p.year));
  assert(years.has("2023"), "should have 2023");
  assert(years.has("2024"), "should have 2024");
  assert(!years.has("2022"), "should not have 2022");
  assert(!years.has("2025"), "should not have 2025");
});

await delay(DELAY_MS);

await libTest("plugin adapter: timeseries with string coercion", async () => {
  // Simulate CLI input (parseFlags converts numbers, booleans stay as strings)
  const result = await blsPlugin.endpoints.timeseries({
    series_id: "CUUR0000SA0",
    start_year: 2024,
    end_year: 2024,
    calculations: "false",
  });
  assert(result.kind === "timeseries", "should return timeseries");
  assert(result.data.length === 1, "should have 1 series");
});

await delay(DELAY_MS);

await libTest("plugin adapter: popular with survey", async () => {
  const result = await blsPlugin.endpoints.popular({ survey: "LN" });
  assert(result.kind === "popular", "should return popular");
  assert(result.data.length === 25, "should have 25 series");
});

await delay(DELAY_MS);

await libTest("plugin adapter: comma-separated series_id", async () => {
  const result = await blsPlugin.endpoints.timeseries({
    series_id: "CUUR0000SA0,LNS14000000",
  });
  assert(result.data.length === 2, `expected 2 series, got ${result.data.length}`);
});

await delay(DELAY_MS);

await libTest("empty series returns (no data) markdown", async () => {
  // Use a series with very narrow year range that might return empty
  // Actually, just test the formatter directly with known empty
  const { wrapResponse } = await import("../src/response");
  const result = wrapResponse([], "timeseries");
  assert(result.toMarkdown() === "(no data)", "empty should return (no data)");
  assert(result.toCSV() === "", "empty CSV should be empty string");
});

if (apiKey) {
  await delay(DELAY_MS);

  await libTest("bls.timeseries() with catalog=true returns metadata", async () => {
    const result = await bls.timeseries({
      series_id: ["CUUR0000SA0"],
      start_year: 2024,
      end_year: 2024,
      catalog: true,
    });
    const series = result.data[0];
    assert(series.catalog != null, "catalog should be present with API key");
    assert(typeof series.catalog === "object", "catalog should be an object");
  });

  await delay(DELAY_MS);

  await libTest("bls.timeseries() with calculations returns extra fields", async () => {
    const result = await bls.timeseries({
      series_id: "CUUR0000SA0",
      start_year: 2024,
      end_year: 2024,
      calculations: true,
      annual_averages: true,
    });
    const points = result.data[0].data ?? [];
    // Check if any point has calculations
    const hasCalcs = points.some((p) => p.calculations != null);
    assert(hasCalcs, "at least one point should have calculations");
    // Check for annual average period
    const hasAnnual = points.some((p) => p.period === "M13");
    assert(hasAnnual, "should have M13 (annual average) period");

    // Calculations should appear in markdown output
    const md = result.toMarkdown();
    assert(md.includes("Pct Chg"), "markdown should have Pct Chg columns with calculations");
    assert(md.includes("Net Chg"), "markdown should have Net Chg columns with calculations");

    // CSV should have calculation columns
    const csv = result.toCSV();
    assert(csv.includes("pct_chg_1m"), "CSV should have pct_chg columns");
    assert(csv.includes("net_chg_1m"), "CSV should have net_chg columns");
  });

  await delay(DELAY_MS);

  await libTest("bls.timeseries() with aspects=true", async () => {
    const result = await bls.timeseries({
      series_id: "CUUR0000SA0",
      start_year: 2024,
      end_year: 2024,
      aspects: true,
    });
    assert(result.kind === "timeseries", "should return timeseries");
    // aspects may or may not be present depending on the series
    // (not many BLS series include aspects data)
  });

  await delay(DELAY_MS);

  await libTest("catalog metadata appears in markdown", async () => {
    const result = await bls.timeseries({
      series_id: "CUUR0000SA0",
      start_year: 2024,
      end_year: 2024,
      catalog: true,
    });
    const md = result.toMarkdown();
    assert(md.includes("survey_name"), "markdown should include catalog metadata");
    const summary = result.summary();
    assert(summary.includes("catalog"), "summary should mention catalog");
  });
}

// ---- Final report ----

console.log(`\n========================================`);
console.log(`API calls:    ${passed} passed, ${failed} failed out of ${cases.length}`);
console.log(`Library tests: ${libPassed} passed, ${libFailed} failed`);

if (failures.length > 0) {
  console.log(`\n--- API FAILURES ---`);
  for (const f of failures) {
    console.log(`\n  ${f.name}${f.status ? ` (HTTP ${f.status})` : ""}:`);
    console.log(`    ${f.error.slice(0, 200)}`);
  }
}

process.exit(failed + libFailed > 0 ? 1 : 0);
