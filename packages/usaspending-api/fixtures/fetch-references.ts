#!/usr/bin/env bun
/**
 * Fetch references endpoint fixtures from USAspending API.
 * Run: bun fixtures/fetch-references.ts
 */
import { fetchGet, fetchPost, summarize, type FetchResult } from "./fetch-helpers";

const dir = `${import.meta.dir}/references`;
const results: FetchResult[] = [];

// 1. Agency by ID
results.push(await fetchGet("agency", "/api/v2/references/agency/1125/", dir));

// 2. Assistance listings
results.push(await fetchGet("assistance-listing", "/api/v2/references/assistance_listing/", dir));

// 3. Award types
results.push(await fetchGet("award-types", "/api/v2/references/award_types/", dir));

// 4. CFDA totals (all)
results.push(await fetchGet("cfda-totals", "/api/v2/references/cfda/totals/", dir));

// 5. CFDA totals for specific program
results.push(await fetchGet("cfda-totals-single", "/api/v2/references/cfda/totals/43.001/", dir));

// 6. Data dictionary
results.push(await fetchGet("data-dictionary", "/api/v2/references/data_dictionary/", dir));

// 7. DEF codes
results.push(await fetchGet("def-codes", "/api/v2/references/def_codes/", dir));

// 8. Filter hash (POST)
results.push(await fetchPost("filter-hash", "/api/v2/references/filter/", {
  filters: { keywords: ["NASA"], award_type_codes: ["A", "B", "C", "D"] },
}, dir));

// 9. Filter tree PSC (top level)
results.push(await fetchGet("filter-tree-psc", "/api/v2/references/filter_tree/psc/", dir));

// 10. Filter tree PSC group
results.push(await fetchGet("filter-tree-psc-group", "/api/v2/references/filter_tree/psc/Product/", dir));

// 11. Filter tree TAS (top level)
results.push(await fetchGet("filter-tree-tas", "/api/v2/references/filter_tree/tas/", dir));

// 12. Filter tree TAS agency
results.push(await fetchGet("filter-tree-tas-agency", "/api/v2/references/filter_tree/tas/080/", dir));

// 13. Glossary
results.push(await fetchGet("glossary", "/api/v2/references/glossary/?limit=10", dir));

// 14. NAICS (top level)
results.push(await fetchGet("naics", "/api/v2/references/naics/", dir));

// 15. NAICS detail
results.push(await fetchGet("naics-detail", "/api/v2/references/naics/54/", dir));

// 16. Submission periods
results.push(await fetchGet("submission-periods", "/api/v2/references/submission_periods/", dir));

// 17. Toptier agencies
results.push(await fetchGet("toptier-agencies", "/api/v2/references/toptier_agencies/", dir));

// 18. Total budgetary resources
results.push(await fetchGet("total-budgetary-resources", "/api/v2/references/total_budgetary_resources/", dir));

summarize(results);
