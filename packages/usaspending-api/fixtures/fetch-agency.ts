#!/usr/bin/env bun
/**
 * Fetch agency endpoint fixtures from USAspending API.
 * Run: bun fixtures/fetch-agency.ts
 */
import { fetchGet, summarize, type FetchResult } from "./fetch-helpers";

const dir = `${import.meta.dir}/agency`;
const results: FetchResult[] = [];

// Use NASA (080) as primary test agency, DoD (097) as secondary
const CODE = "080";
const FY = "2024";

// 1. Agency overview
results.push(await fetchGet("overview", `/api/v2/agency/${CODE}/`, dir));

// 2. Agency awards
results.push(await fetchGet("awards", `/api/v2/agency/${CODE}/awards/?fiscal_year=${FY}`, dir));

// 3. Agency new awards count
results.push(await fetchGet("awards-new-count", `/api/v2/agency/${CODE}/awards/new/count/?fiscal_year=${FY}`, dir));

// 4. All agencies award count
results.push(await fetchGet("awards-count-all", `/api/v2/agency/awards/count/?fiscal_year=${FY}`, dir));

// 5. Budget function
results.push(await fetchGet("budget-function", `/api/v2/agency/${CODE}/budget_function/?fiscal_year=${FY}`, dir));

// 6. Budget function count
results.push(await fetchGet("budget-function-count", `/api/v2/agency/${CODE}/budget_function/count/?fiscal_year=${FY}`, dir));

// 7. Budgetary resources
results.push(await fetchGet("budgetary-resources", `/api/v2/agency/${CODE}/budgetary_resources/`, dir));

// 8. Federal account
results.push(await fetchGet("federal-account", `/api/v2/agency/${CODE}/federal_account/?fiscal_year=${FY}`, dir));

// 9. Federal account count
results.push(await fetchGet("federal-account-count", `/api/v2/agency/${CODE}/federal_account/count/?fiscal_year=${FY}`, dir));

// 10. Object class
results.push(await fetchGet("object-class", `/api/v2/agency/${CODE}/object_class/?fiscal_year=${FY}`, dir));

// 11. Object class count
results.push(await fetchGet("object-class-count", `/api/v2/agency/${CODE}/object_class/count/?fiscal_year=${FY}`, dir));

// 12. Obligations by award category
results.push(await fetchGet("obligations-by-award-category", `/api/v2/agency/${CODE}/obligations_by_award_category/?fiscal_year=${FY}`, dir));

// 13. Program activity
results.push(await fetchGet("program-activity", `/api/v2/agency/${CODE}/program_activity/?fiscal_year=${FY}`, dir));

// 14. Program activity count
results.push(await fetchGet("program-activity-count", `/api/v2/agency/${CODE}/program_activity/count/?fiscal_year=${FY}`, dir));

// 15. Sub-agency
results.push(await fetchGet("sub-agency", `/api/v2/agency/${CODE}/sub_agency/?fiscal_year=${FY}`, dir));

// 16. Sub-agency count
results.push(await fetchGet("sub-agency-count", `/api/v2/agency/${CODE}/sub_agency/count/?fiscal_year=${FY}`, dir));

// 17. Sub-components (bureaus)
results.push(await fetchGet("sub-components", `/api/v2/agency/${CODE}/sub_components/?fiscal_year=${FY}`, dir));

// 18-19. Treasury account object class and program activity
// Need a real TAS symbol - try to find one from the federal account response
// Use a known one: 080-0110 (NASA Exploration)
results.push(await fetchGet("treasury-account-object-class", `/api/v2/agency/treasury_account/080-0110/object_class/`, dir));
results.push(await fetchGet("treasury-account-program-activity", `/api/v2/agency/treasury_account/080-0110/program_activity/`, dir));

// Also fetch DoD overview for variety
results.push(await fetchGet("overview-dod", `/api/v2/agency/097/`, dir));

summarize(results);
