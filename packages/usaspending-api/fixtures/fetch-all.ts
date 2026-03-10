#!/usr/bin/env bun
/**
 * Fetch ALL domain fixtures from USAspending API.
 * Run: bun fixtures/fetch-all.ts
 *
 * Or fetch individual domains:
 *   bun fixtures/fetch-agency.ts
 *   bun fixtures/fetch-autocomplete.ts
 *   etc.
 */
import { $ } from "bun";

const scripts = [
  "fetch-agency.ts",
  "fetch-autocomplete.ts",
  "fetch-awards.ts",
  "fetch-search.ts",
  "fetch-recipient.ts",
  "fetch-references.ts",
  "fetch-disaster.ts",
  "fetch-federal-accounts.ts",
  "fetch-financial.ts",
  "fetch-idv.ts",
  "fetch-reporting.ts",
  "fetch-remaining.ts",
];

for (const script of scripts) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`Running ${script}...`);
  console.log("=".repeat(60));
  await $`bun ${import.meta.dir}/${script}`.quiet().then(
    (result) => process.stdout.write(result.stdout),
    (err) => console.error(`  Script failed: ${err.message}`),
  );
}

console.log(`\n${"=".repeat(60)}`);
console.log("All fixture fetches complete!");
console.log("=".repeat(60));
