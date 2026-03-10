#!/usr/bin/env bun
/**
 * Fetches real Federal Register API responses and saves them as test fixtures.
 * Run: bun fixtures/fetch-fixtures.ts
 */

const BASE = "https://www.federalregister.gov/api/v1";

interface Fixture {
  name: string;
  url: string;
}

const fixtures: Fixture[] = [
  {
    name: "documents-search",
    url: `${BASE}/documents.json?conditions[term]=clean+energy&per_page=3`,
  },
  {
    name: "document-single",
    url: `${BASE}/documents/2024-02585.json`,
  },
  {
    name: "documents-multi",
    url: `${BASE}/documents/2024-02585,2024-00574.json`,
  },
  {
    name: "agencies-list",
    url: `${BASE}/agencies.json`,
  },
  {
    name: "agency-single",
    url: `${BASE}/agencies/12.json`,
  },
  {
    name: "public-inspection-search",
    url: `${BASE}/public-inspection-documents.json?per_page=3`,
  },
  {
    name: "public-inspection-current",
    url: `${BASE}/public-inspection-documents/current.json`,
  },
  {
    name: "facets-agency",
    url: `${BASE}/documents/facets/agency?conditions[term]=regulation`,
  },
  {
    name: "facets-daily",
    url: `${BASE}/documents/facets/daily?conditions[term]=regulation`,
  },
  {
    name: "suggested-searches",
    url: `${BASE}/suggested_searches.json`,
  },
];

async function fetchFixture(fixture: Fixture): Promise<void> {
  console.log(`Fetching ${fixture.name}...`);
  const response = await fetch(fixture.url);
  if (!response.ok) {
    console.error(`  FAILED: ${response.status} ${response.statusText}`);
    return;
  }
  const data = await response.json();
  const path = `${import.meta.dir}/${fixture.name}.json`;
  await Bun.write(path, JSON.stringify(data, null, 2));
  console.log(`  Saved to ${path}`);
}

async function main() {
  console.log("Fetching Federal Register API fixtures...\n");
  for (const fixture of fixtures) {
    await fetchFixture(fixture);
  }
  console.log("\nDone!");
}

main().catch(console.error);
