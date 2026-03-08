#!/usr/bin/env bun
/**
 * Fetch recipient endpoint fixtures from USAspending API.
 * Run: bun fixtures/fetch-recipient.ts
 */
import { fetchGet, fetchPost, summarize, type FetchResult } from "./fetch-helpers";

const dir = `${import.meta.dir}/recipient`;
const results: FetchResult[] = [];

// 1. Recipient list
results.push(await fetchPost("list", "/api/v2/recipient/", {
  page: 1,
  limit: 10,
  order: "desc",
  sort: "amount",
}, dir));

// Use real recipient IDs from the list response
// Lockheed Martin parent: b97d19b0-833c-8d8f-3a2c-157d04ea55ef-P
const RECIPIENT_HASH = "b97d19b0-833c-8d8f-3a2c-157d04ea55ef-P";
const RECIPIENT_UEI = "ZFN2JJXBLZT3"; // Lockheed Martin UEI

// 2. Recipient detail
results.push(await fetchGet("detail", `/api/v2/recipient/${RECIPIENT_HASH}/?year=latest`, dir));

// 3. Recipient children
results.push(await fetchGet("children", `/api/v2/recipient/children/${RECIPIENT_UEI}/?year=latest`, dir));

// 4. Recipient count
results.push(await fetchPost("count", "/api/v2/recipient/count/", {
  filters: { keyword: "Lockheed" },
}, dir));

// 5. Recipient state list (all states)
results.push(await fetchGet("state-list", "/api/v2/recipient/state/", dir));

// 6. Recipient state detail (California FIPS = 06)
results.push(await fetchGet("state-detail", "/api/v2/recipient/state/06/?year=latest", dir));

// 7. Recipient state awards (California)
results.push(await fetchGet("state-awards", "/api/v2/recipient/state/awards/06/?year=latest", dir));

summarize(results);
