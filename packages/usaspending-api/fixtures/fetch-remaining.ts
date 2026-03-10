#!/usr/bin/env bun
/**
 * Fetch remaining domain fixtures: spending, subawards, transactions,
 * budget-functions, downloads, bulk-downloads.
 * Run: bun fixtures/fetch-remaining.ts
 */
import { fetchGet, fetchPost, summarize, type FetchResult } from "./fetch-helpers";

const results: FetchResult[] = [];

// === Spending (already exists but refresh in domain dir) ===
const spendingDir = `${import.meta.dir}/spending`;
results.push(await fetchPost("by-agency", "/api/v2/spending/", {
  type: "agency",
  filters: { fy: "2024", period: "12" },
}, spendingDir));

results.push(await fetchPost("by-federal-account", "/api/v2/spending/", {
  type: "federal_account",
  filters: { fy: "2024", period: "12" },
}, spendingDir));

results.push(await fetchPost("by-object-class", "/api/v2/spending/", {
  type: "object_class",
  filters: { fy: "2024", period: "12" },
}, spendingDir));

results.push(await fetchPost("by-budget-function", "/api/v2/spending/", {
  type: "budget_function",
  filters: { fy: "2024", period: "12" },
}, spendingDir));

results.push(await fetchPost("by-recipient", "/api/v2/spending/", {
  type: "recipient",
  filters: { fy: "2024", period: "12" },
}, spendingDir));

// === Subawards ===
const subawardsDir = `${import.meta.dir}/subawards`;
results.push(await fetchPost("list", "/api/v2/subawards/", {
  page: 1,
  limit: 10,
  sort: "amount",
  order: "desc",
}, subawardsDir));

// Subawards for a specific award
results.push(await fetchPost("by-award", "/api/v2/subawards/", {
  award_id: "CONT_AWD_NNM07AB03C_8000_-NONE-_-NONE-",
  page: 1,
  limit: 10,
  sort: "amount",
  order: "desc",
}, subawardsDir));

// === Transactions ===
// Transactions endpoint is at /api/v2/transactions/ but it might be subawards-adjacent
results.push(await fetchPost("transactions", "/api/v2/transactions/", {
  award_id: "CONT_AWD_NNM07AB03C_8000_-NONE-_-NONE-",
  page: 1,
  limit: 10,
  sort: "action_date",
  order: "desc",
}, subawardsDir));

// === Budget Functions ===
const budgetDir = `${import.meta.dir}/budget-functions`;
results.push(await fetchGet("list", "/api/v2/budget_functions/list_budget_functions/", budgetDir));

results.push(await fetchPost("subfunctions", "/api/v2/budget_functions/list_budget_subfunctions/", {
  budget_function: "050",
}, budgetDir));

// === Downloads (just test status/count, don't trigger actual downloads) ===
const downloadsDir = `${import.meta.dir}/downloads`;

// Download count
results.push(await fetchPost("count", "/api/v2/download/count/", {
  filters: {
    keywords: ["NASA"],
    time_period: [{ start_date: "2024-01-01", end_date: "2024-06-30" }],
    award_type_codes: ["A", "B", "C", "D"],
  },
}, downloadsDir));

// === Bulk Downloads ===
const bulkDir = `${import.meta.dir}/bulk-downloads`;

// List agencies for bulk download
results.push(await fetchPost("list-agencies-awards", "/api/v2/bulk_download/list_agencies/", {
  type: "award_agencies",
}, bulkDir));

results.push(await fetchPost("list-agencies-accounts", "/api/v2/bulk_download/list_agencies/", {
  type: "account_agencies",
}, bulkDir));

// List monthly files
results.push(await fetchPost("list-monthly-files", "/api/v2/bulk_download/list_monthly_files/", {
  agency: 80,
  fiscal_year: 2024,
  type: "awards",
}, bulkDir));

summarize(results);
