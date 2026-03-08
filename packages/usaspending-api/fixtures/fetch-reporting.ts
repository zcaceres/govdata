#!/usr/bin/env bun
/**
 * Fetch reporting endpoint fixtures from USAspending API.
 * Run: bun fixtures/fetch-reporting.ts
 */
import { fetchGet, summarize, type FetchResult } from "./fetch-helpers";

const dir = `${import.meta.dir}/reporting`;
const results: FetchResult[] = [];

const CODE = "080"; // NASA
const FY = 2024;
const PERIOD = 6; // Q2

// 1. Agencies overview
results.push(await fetchGet("agencies-overview", `/api/v2/reporting/agencies/overview/?fiscal_year=${FY}&fiscal_period=${PERIOD}&limit=10`, dir));

// 2. Agencies publish dates
results.push(await fetchGet("agencies-publish-dates", `/api/v2/reporting/agencies/publish_dates/?fiscal_year=${FY}&fiscal_period=${PERIOD}&limit=10`, dir));

// 3. Agency differences
results.push(await fetchGet("agency-differences", `/api/v2/reporting/agencies/${CODE}/differences/?fiscal_year=${FY}&fiscal_period=${PERIOD}&limit=10`, dir));

// 4. Agency discrepancies
results.push(await fetchGet("agency-discrepancies", `/api/v2/reporting/agencies/${CODE}/discrepancies/?fiscal_year=${FY}&fiscal_period=${PERIOD}&limit=10`, dir));

// 5. Agency overview (specific)
results.push(await fetchGet("agency-overview", `/api/v2/reporting/agencies/${CODE}/overview/?fiscal_year=${FY}&fiscal_period=${PERIOD}`, dir));

// 6. Submission history
results.push(await fetchGet("submission-history", `/api/v2/reporting/agencies/${CODE}/${FY}/${PERIOD}/submission_history/`, dir));

// 7. Unlinked awards - assistance
results.push(await fetchGet("unlinked-awards-assistance", `/api/v2/reporting/agencies/${CODE}/${FY}/${PERIOD}/unlinked_awards/assistance/`, dir));

// 8. Unlinked awards - procurement
results.push(await fetchGet("unlinked-awards-procurement", `/api/v2/reporting/agencies/${CODE}/${FY}/${PERIOD}/unlinked_awards/procurement/`, dir));

summarize(results);
