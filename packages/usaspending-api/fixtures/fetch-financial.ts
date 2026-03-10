#!/usr/bin/env bun
/**
 * Fetch financial endpoint fixtures from USAspending API.
 * Run: bun fixtures/fetch-financial.ts
 */
import { fetchGet, summarize, type FetchResult } from "./fetch-helpers";

const dir = `${import.meta.dir}/financial`;
const results: FetchResult[] = [];

// NASA agency_id = 1125, FY 2024
const AGENCY_ID = 1125;
const FY = 2024;

// 1. Federal obligations
results.push(await fetchGet("federal-obligations", `/api/v2/federal_obligations/?fiscal_year=${FY}&funding_agency_id=${AGENCY_ID}&limit=10`, dir));

// 2. Financial balances by agency
results.push(await fetchGet("financial-balances", `/api/v2/financial_balances/agencies/?fiscal_year=${FY}&funding_agency_id=${AGENCY_ID}`, dir));

// 3. Financial spending by major object class
results.push(await fetchGet("spending-major-object-class", `/api/v2/financial_spending/major_object_class/?fiscal_year=${FY}&funding_agency_id=${AGENCY_ID}&limit=10`, dir));

// 4. Financial spending by object class
results.push(await fetchGet("spending-object-class", `/api/v2/financial_spending/object_class/?fiscal_year=${FY}&funding_agency_id=${AGENCY_ID}&major_object_class_code=25&limit=10`, dir));

summarize(results);
