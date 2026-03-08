#!/usr/bin/env bun
/**
 * Fetch autocomplete endpoint fixtures from USAspending API.
 * Run: bun fixtures/fetch-autocomplete.ts
 */
import { fetchPost, summarize, type FetchResult } from "./fetch-helpers";

const dir = `${import.meta.dir}/autocomplete`;
const results: FetchResult[] = [];

// Simple search_text + limit autocomplete endpoints
const simpleEndpoints = [
  { name: "awarding-agency", path: "/api/v2/autocomplete/awarding_agency/" },
  { name: "awarding-agency-office", path: "/api/v2/autocomplete/awarding_agency_office/" },
  { name: "funding-agency", path: "/api/v2/autocomplete/funding_agency/" },
  { name: "funding-agency-office", path: "/api/v2/autocomplete/funding_agency_office/" },
  { name: "cfda", path: "/api/v2/autocomplete/cfda/" },
  { name: "glossary", path: "/api/v2/autocomplete/glossary/" },
  { name: "location", path: "/api/v2/autocomplete/location" },
  { name: "naics", path: "/api/v2/autocomplete/naics/" },
  { name: "psc", path: "/api/v2/autocomplete/psc/" },
  { name: "recipient", path: "/api/v2/autocomplete/recipient/" },
];

for (const ep of simpleEndpoints) {
  results.push(await fetchPost(ep.name, ep.path, { search_text: "NASA", limit: 10 }, dir));
}

// City autocomplete requires filter.country_code and filter.scope
results.push(await fetchPost("city", "/api/v2/autocomplete/city/", {
  search_text: "Houston",
  limit: 10,
  filter: { country_code: "USA", scope: "recipient_location" },
}, dir));

// Program activity autocomplete
results.push(await fetchPost("program-activity", "/api/v2/autocomplete/program_activity/", {
  search_text: "research",
  limit: 10,
}, dir));

// Account component autocomplete endpoints (different body shape - use filters)
const accountEndpoints = [
  { name: "accounts-aid", path: "/api/v2/autocomplete/accounts/aid/" },
  { name: "accounts-ata", path: "/api/v2/autocomplete/accounts/ata/" },
  { name: "accounts-a", path: "/api/v2/autocomplete/accounts/a/" },
  { name: "accounts-bpoa", path: "/api/v2/autocomplete/accounts/bpoa/" },
  { name: "accounts-epoa", path: "/api/v2/autocomplete/accounts/epoa/" },
  { name: "accounts-main", path: "/api/v2/autocomplete/accounts/main/" },
  { name: "accounts-sub", path: "/api/v2/autocomplete/accounts/sub/" },
];

for (const ep of accountEndpoints) {
  results.push(await fetchPost(ep.name, ep.path, {
    filters: { aid: "080" },
    limit: 10,
  }, dir));
}

summarize(results);
