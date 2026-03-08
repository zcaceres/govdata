#!/usr/bin/env bun
/**
 * Fetch search endpoint fixtures from USAspending API.
 * Run: bun fixtures/fetch-search.ts
 */
import { fetchPost, summarize, type FetchResult } from "./fetch-helpers";

const dir = `${import.meta.dir}/search`;
const results: FetchResult[] = [];

const defaultFilters = {
  keywords: ["NASA"],
  time_period: [{ start_date: "2024-01-01", end_date: "2024-12-31" }],
  award_type_codes: ["A", "B", "C", "D"],
};

// 1. spending_by_award
results.push(await fetchPost("spending-by-award", "/api/v2/search/spending_by_award/", {
  filters: defaultFilters,
  fields: ["Award ID", "Recipient Name", "Start Date", "End Date", "Award Amount", "Awarding Agency", "Award Type", "Description"],
  page: 1, limit: 10, sort: "Award Amount", order: "desc", subawards: false,
}, dir));

// 2. spending_by_award_count
results.push(await fetchPost("spending-by-award-count", "/api/v2/search/spending_by_award_count/", {
  filters: defaultFilters,
}, dir));

// 3-18. spending_by_category sub-endpoints
const categories = [
  "awarding_agency", "awarding_subagency", "cfda", "country", "county",
  "defc", "district", "federal_account", "funding_agency", "funding_subagency",
  "naics", "psc", "recipient", "recipient_duns", "state_territory",
];

for (const cat of categories) {
  results.push(await fetchPost(`category-${cat}`, `/api/v2/search/spending_by_category/${cat}/`, {
    filters: { ...defaultFilters, award_type_codes: ["A", "B", "C", "D", "02", "03", "04", "05"] },
    limit: 10,
    page: 1,
  }, dir));
}

// Also try spending_by_category without subpath (generic)
results.push(await fetchPost("category-generic", "/api/v2/search/spending_by_category/", {
  category: "awarding_agency",
  filters: defaultFilters,
  limit: 10,
  page: 1,
}, dir));

// 19. spending_by_geography - state
results.push(await fetchPost("geography-state", "/api/v2/search/spending_by_geography/", {
  filters: defaultFilters,
  scope: "place_of_performance",
  geo_layer: "state",
}, dir));

// spending_by_geography - county
results.push(await fetchPost("geography-county", "/api/v2/search/spending_by_geography/", {
  filters: defaultFilters,
  scope: "place_of_performance",
  geo_layer: "county",
  geo_layer_filters: ["06"], // California FIPS
}, dir));

// spending_by_geography - district
results.push(await fetchPost("geography-district", "/api/v2/search/spending_by_geography/", {
  filters: defaultFilters,
  scope: "place_of_performance",
  geo_layer: "district",
  geo_layer_filters: ["06"], // California FIPS
}, dir));

// 20. spending_by_transaction
results.push(await fetchPost("spending-by-transaction", "/api/v2/search/spending_by_transaction/", {
  filters: { ...defaultFilters, award_type_codes: ["A", "B", "C", "D"] },
  fields: ["Award ID", "Recipient Name", "Action Date", "Transaction Amount", "Awarding Agency", "Award Type"],
  sort: "Transaction Amount",
  limit: 10,
  page: 1,
  order: "desc",
}, dir));

// 21. spending_by_transaction_count
results.push(await fetchPost("spending-by-transaction-count", "/api/v2/search/spending_by_transaction_count/", {
  filters: defaultFilters,
}, dir));

// 22. spending_over_time - fiscal_year
results.push(await fetchPost("spending-over-time-fy", "/api/v2/search/spending_over_time/", {
  group: "fiscal_year",
  filters: { keywords: ["NASA"], time_period: [{ start_date: "2018-01-01", end_date: "2024-12-31" }] },
}, dir));

// spending_over_time - quarter
results.push(await fetchPost("spending-over-time-quarter", "/api/v2/search/spending_over_time/", {
  group: "quarter",
  filters: { keywords: ["climate"], time_period: [{ start_date: "2023-01-01", end_date: "2024-12-31" }] },
}, dir));

// spending_over_time - month
results.push(await fetchPost("spending-over-time-month", "/api/v2/search/spending_over_time/", {
  group: "month",
  filters: { keywords: ["infrastructure"], time_period: [{ start_date: "2024-01-01", end_date: "2024-12-31" }] },
}, dir));

// 23. new_awards_over_time
// Need a recipient_id - use a known hash. This endpoint requires recipient_id + time_period.
results.push(await fetchPost("new-awards-over-time", "/api/v2/search/new_awards_over_time/", {
  group: "fiscal_year",
  filters: {
    time_period: [{ start_date: "2020-01-01", end_date: "2024-12-31" }],
    recipient_id: "f75c5884-be89-7e16-e438-f9e96e72898e-C",
  },
}, dir));

// 24. transaction_spending_summary
results.push(await fetchPost("transaction-spending-summary", "/api/v2/search/transaction_spending_summary/", {
  filters: defaultFilters,
}, dir));

// 25. spending_by_subaward_grouped
results.push(await fetchPost("spending-by-subaward-grouped", "/api/v2/search/spending_by_subaward_grouped/", {
  filters: defaultFilters,
  page: 1,
  limit: 10,
}, dir));

// 26. spending_by_transaction_grouped
results.push(await fetchPost("spending-by-transaction-grouped", "/api/v2/search/spending_by_transaction_grouped/", {
  filters: defaultFilters,
  page: 1,
  limit: 10,
}, dir));

summarize(results);
