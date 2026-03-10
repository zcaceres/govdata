#!/usr/bin/env bun
/**
 * Fetches real API responses from USAspending.gov and saves as JSON fixtures.
 * Run: bun fixtures/fetch-fixtures.ts
 */

const BASE = "https://api.usaspending.gov";

async function fetchAndSave(name: string, url: string, options?: RequestInit) {
  console.log(`Fetching ${name}...`);
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      console.error(`  ${name}: HTTP ${res.status}`);
      const text = await res.text();
      console.error(`  ${text.slice(0, 200)}`);
      return;
    }
    const json = await res.json();
    const path = `${import.meta.dir}/${name}.json`;
    await Bun.write(path, JSON.stringify(json, null, 2));
    console.log(`  Saved ${name}.json`);
  } catch (err) {
    console.error(`  ${name}: ${(err as Error).message}`);
  }
}

// POST: Search awards
await fetchAndSave("award-search", `${BASE}/api/v2/search/spending_by_award/`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    filters: {
      keywords: ["NASA"],
      time_period: [{ start_date: "2024-01-01", end_date: "2024-12-31" }],
      award_type_codes: ["A", "B", "C", "D"],
    },
    fields: [
      "Award ID", "Recipient Name", "Start Date", "End Date",
      "Award Amount", "Awarding Agency", "Awarding Sub Agency",
      "Award Type", "Description",
    ],
    page: 1,
    limit: 10,
    sort: "Award Amount",
    order: "desc",
    subawards: false,
  }),
});

// GET: Award detail
await fetchAndSave("award-detail", `${BASE}/api/v2/awards/CONT_AWD_80NSSC21CA050_8000_80NSSC18D0007_8000/`);

// GET: Agency overview
await fetchAndSave("agency-overview", `${BASE}/api/v2/agency/080/`);

// POST: Spending by agency
await fetchAndSave("spending-by-agency", `${BASE}/api/v2/spending/`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    type: "agency",
    filters: {
      fy: "2024",
    },
  }),
});

// GET: Spending by state (all states)
await fetchAndSave("spending-by-state", `${BASE}/api/v2/recipient/state/`);

// POST: Spending over time
await fetchAndSave("spending-over-time", `${BASE}/api/v2/search/spending_over_time/`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    group: "fiscal_year",
    filters: {
      keywords: ["NASA"],
      time_period: [{ start_date: "2020-01-01", end_date: "2024-12-31" }],
    },
  }),
});

console.log("\nDone!");
