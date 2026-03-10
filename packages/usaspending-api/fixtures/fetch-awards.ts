#!/usr/bin/env bun
/**
 * Fetch awards endpoint fixtures from USAspending API.
 * Run: bun fixtures/fetch-awards.ts
 */
import { fetchGet, fetchPost, summarize, type FetchResult } from "./fetch-helpers";

const dir = `${import.meta.dir}/awards`;
const results: FetchResult[] = [];

// Use known real award IDs
const CONTRACT_ID = "CONT_AWD_NNM07AB03C_8000_-NONE-_-NONE-";
const GRANT_ID = "ASST_NON_80NSSC24K0476_8000";

// 1. Award detail - contract
results.push(await fetchGet("detail-contract", `/api/v2/awards/${CONTRACT_ID}/`, dir));

// 2. Award detail - grant
results.push(await fetchGet("detail-grant", `/api/v2/awards/${GRANT_ID}/`, dir));

// 3. Award accounts
results.push(await fetchPost("accounts", "/api/v2/awards/accounts/", {
  award_id: CONTRACT_ID,
  page: 1,
  limit: 10,
}, dir));

// 4. Award federal account count
results.push(await fetchGet("count-federal-account", `/api/v2/awards/count/federal_account/${CONTRACT_ID}/`, dir));

// 5. Award subaward count
results.push(await fetchGet("count-subaward", `/api/v2/awards/count/subaward/${CONTRACT_ID}/`, dir));

// 6. Award transaction count
results.push(await fetchGet("count-transaction", `/api/v2/awards/count/transaction/${CONTRACT_ID}/`, dir));

// 7. Award funding
results.push(await fetchPost("funding", "/api/v2/awards/funding/", {
  award_id: CONTRACT_ID,
  page: 1,
  limit: 10,
}, dir));

// 8. Award funding rollup
results.push(await fetchPost("funding-rollup", "/api/v2/awards/funding_rollup/", {
  award_id: CONTRACT_ID,
}, dir));

// 9. Awards last updated
results.push(await fetchGet("last-updated", "/api/v2/awards/last_updated/", dir));

// 10. Award spending by recipient
results.push(await fetchGet("spending-recipient", `/api/v2/award_spending/recipient/?fiscal_year=2024&awarding_agency_id=1125`, dir));

summarize(results);
