#!/usr/bin/env bun
/**
 * Fetch disaster endpoint fixtures from USAspending API.
 * Run: bun fixtures/fetch-disaster.ts
 */
import { fetchGet, fetchPost, summarize, type FetchResult } from "./fetch-helpers";

const dir = `${import.meta.dir}/disaster`;
const results: FetchResult[] = [];

// COVID DEFC codes (L, M, N, O, P, U, V)
const defCodes = ["L", "M", "N", "O", "P"];

const baseFilter = { def_codes: defCodes };
const pagination = { page: 1, limit: 10, order: "desc", sort: "obligation" };

// 1. Overview (GET - no auth needed)
results.push(await fetchGet("overview", "/api/v2/disaster/overview/", dir));

// 2. Agency count
results.push(await fetchPost("agency-count", "/api/v2/disaster/agency/count/", {
  filter: baseFilter,
  spending_type: "total",
}, dir));

// 3. Agency loans
results.push(await fetchPost("agency-loans", "/api/v2/disaster/agency/loans/", {
  filter: baseFilter,
  pagination,
}, dir));

// 4. Agency spending
results.push(await fetchPost("agency-spending", "/api/v2/disaster/agency/spending/", {
  filter: baseFilter,
  spending_type: "total",
  pagination,
}, dir));

// 5. Award amount
results.push(await fetchPost("award-amount", "/api/v2/disaster/award/amount/", {
  filter: baseFilter,
}, dir));

// 6. Award count
results.push(await fetchPost("award-count", "/api/v2/disaster/award/count/", {
  filter: baseFilter,
}, dir));

// 7. CFDA count
results.push(await fetchPost("cfda-count", "/api/v2/disaster/cfda/count/", {
  filter: baseFilter,
}, dir));

// 8. CFDA loans
results.push(await fetchPost("cfda-loans", "/api/v2/disaster/cfda/loans/", {
  filter: baseFilter,
  pagination,
}, dir));

// 9. CFDA spending
results.push(await fetchPost("cfda-spending", "/api/v2/disaster/cfda/spending/", {
  filter: baseFilter,
  spending_type: "total",
  pagination,
}, dir));

// 10. DEF code count
results.push(await fetchPost("def-code-count", "/api/v2/disaster/def_code/count/", {
  filter: baseFilter,
}, dir));

// 11. Federal account count
results.push(await fetchPost("federal-account-count", "/api/v2/disaster/federal_account/count/", {
  filter: baseFilter,
}, dir));

// 12. Federal account loans
results.push(await fetchPost("federal-account-loans", "/api/v2/disaster/federal_account/loans/", {
  filter: baseFilter,
  pagination,
}, dir));

// 13. Federal account spending
results.push(await fetchPost("federal-account-spending", "/api/v2/disaster/federal_account/spending/", {
  filter: baseFilter,
  spending_type: "total",
  pagination,
}, dir));

// 14. Object class count
results.push(await fetchPost("object-class-count", "/api/v2/disaster/object_class/count/", {
  filter: baseFilter,
}, dir));

// 15. Object class loans
results.push(await fetchPost("object-class-loans", "/api/v2/disaster/object_class/loans/", {
  filter: baseFilter,
  pagination,
}, dir));

// 16. Object class spending
results.push(await fetchPost("object-class-spending", "/api/v2/disaster/object_class/spending/", {
  filter: baseFilter,
  spending_type: "total",
  pagination,
}, dir));

// 17. Recipient count
results.push(await fetchPost("recipient-count", "/api/v2/disaster/recipient/count/", {
  filter: baseFilter,
}, dir));

// 18. Recipient loans
results.push(await fetchPost("recipient-loans", "/api/v2/disaster/recipient/loans/", {
  filter: baseFilter,
  pagination,
}, dir));

// 19. Recipient spending
results.push(await fetchPost("recipient-spending", "/api/v2/disaster/recipient/spending/", {
  filter: baseFilter,
  spending_type: "total",
  pagination,
}, dir));

// 20. Spending by geography
results.push(await fetchPost("spending-by-geography", "/api/v2/disaster/spending_by_geography/", {
  filter: baseFilter,
  geo_layer: "state",
  scope: "recipient_location",
  spending_type: "obligation",
}, dir));

summarize(results);
