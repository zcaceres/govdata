#!/usr/bin/env bun
/**
 * Fetch federal accounts endpoint fixtures from USAspending API.
 * Run: bun fixtures/fetch-federal-accounts.ts
 */
import { fetchGet, fetchPost, summarize, type FetchResult } from "./fetch-helpers";

const dir = `${import.meta.dir}/federal-accounts`;
const results: FetchResult[] = [];

// NASA account: code 080-0110, numeric id 5623
const ACCOUNT_CODE = "080-0110";
const ACCOUNT_ID = "5623";

// 1. Federal accounts list
results.push(await fetchPost("list", "/api/v2/federal_accounts/", {
  filters: { agency_identifier: "080" },
  sort: { field: "account_name", direction: "asc" },
  page: 1,
  limit: 10,
}, dir));

// 2. Federal account detail (uses code with dash)
results.push(await fetchGet("detail", `/api/v2/federal_accounts/${ACCOUNT_CODE}/`, dir));

// 3. Available object classes (uses numeric ID)
results.push(await fetchGet("available-object-classes", `/api/v2/federal_accounts/${ACCOUNT_ID}/available_object_classes/`, dir));

// 4. Fiscal year snapshot (uses numeric ID)
results.push(await fetchGet("fiscal-year-snapshot", `/api/v2/federal_accounts/${ACCOUNT_ID}/fiscal_year_snapshot/`, dir));

// 5. Fiscal year snapshot (specific year)
results.push(await fetchGet("fiscal-year-snapshot-2024", `/api/v2/federal_accounts/${ACCOUNT_ID}/fiscal_year_snapshot/2024/`, dir));

// 6. Object classes total (POST, uses numeric ID)
results.push(await fetchPost("object-classes-total", `/api/v2/federal_accounts/${ACCOUNT_CODE}/object_classes/total/`, {
  fiscal_year: 2024,
}, dir));

// 7. Program activities (uses code with dash)
results.push(await fetchGet("program-activities", `/api/v2/federal_accounts/${ACCOUNT_CODE}/program_activities/`, dir));

// 8. Program activities total (POST)
results.push(await fetchPost("program-activities-total", `/api/v2/federal_accounts/${ACCOUNT_CODE}/program_activities/total/`, {
  fiscal_year: 2024,
}, dir));

summarize(results);
