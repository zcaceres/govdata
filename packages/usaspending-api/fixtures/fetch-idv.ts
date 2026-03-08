#!/usr/bin/env bun
/**
 * Fetch IDV endpoint fixtures from USAspending API.
 * Run: bun fixtures/fetch-idv.ts
 */
import { fetchGet, fetchPost, summarize, type FetchResult } from "./fetch-helpers";

const dir = `${import.meta.dir}/idv`;
const results: FetchResult[] = [];

// Use a large NASA IDV that should have data
const IDV_ID = "CONT_IDV_NNJ16GU21B_8000";

// 1. IDV accounts
results.push(await fetchPost("accounts", "/api/v2/idvs/accounts/", {
  award_id: IDV_ID,
  page: 1,
  limit: 10,
}, dir));

// 2. IDV activity
results.push(await fetchPost("activity", "/api/v2/idvs/activity/", {
  award_id: IDV_ID,
  page: 1,
  limit: 10,
}, dir));

// 3. IDV amounts
results.push(await fetchGet("amounts", `/api/v2/idvs/amounts/${IDV_ID}/`, dir));

// 4. IDV awards (child IDVs)
results.push(await fetchPost("awards-child-idvs", "/api/v2/idvs/awards/", {
  award_id: IDV_ID,
  type: "child_idvs",
  page: 1,
  limit: 10,
}, dir));

// 5. IDV awards (child awards)
results.push(await fetchPost("awards-child-awards", "/api/v2/idvs/awards/", {
  award_id: IDV_ID,
  type: "child_awards",
  page: 1,
  limit: 10,
}, dir));

// 6. IDV federal account count
results.push(await fetchGet("count-federal-account", `/api/v2/idvs/count/federal_account/${IDV_ID}/`, dir));

// 7. IDV funding
results.push(await fetchPost("funding", "/api/v2/idvs/funding/", {
  award_id: IDV_ID,
  page: 1,
  limit: 10,
}, dir));

// 8. IDV funding rollup
results.push(await fetchPost("funding-rollup", "/api/v2/idvs/funding_rollup/", {
  award_id: IDV_ID,
}, dir));

summarize(results);
