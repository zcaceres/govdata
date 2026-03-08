#!/usr/bin/env bun
import { fetchGet, fetchPost } from "./fetch-helpers";

// Retry references/agency
const r1 = await fetchGet("agency", "/api/v2/references/agency/1125/", `${import.meta.dir}/references`);
console.log(r1.ok ? "references/agency: OK" : `references/agency: ${r1.error}`);

// Retry disaster overview
const r2 = await fetchGet("overview", "/api/v2/disaster/overview/", `${import.meta.dir}/disaster`);
console.log(r2.ok ? "disaster/overview: OK" : `disaster/overview: ${r2.error}`);

// Fetch city autocomplete with correct params
const r3 = await fetchPost("city", "/api/v2/autocomplete/city/", {
  search_text: "Houston",
  limit: 10,
  filter: { country_code: "USA", scope: "domestic" },
}, `${import.meta.dir}/autocomplete`);
console.log(r3.ok ? "autocomplete/city: OK" : `autocomplete/city: ${r3.error}`);

// Retry spending by recipient with smaller scope
const r4 = await fetchPost("by-recipient", "/api/v2/spending/", {
  type: "recipient",
  filters: { fy: "2024", period: "12" },
  limit: 10,
}, `${import.meta.dir}/spending`);
console.log(r4.ok ? "spending/by-recipient: OK" : `spending/by-recipient: ${r4.error}`);
