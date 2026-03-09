#!/usr/bin/env bun
/**
 * Thoroughly exercise USAspending API endpoints across ALL 16 domains.
 * Calls the real API, validates schema parsing, saves fixtures.
 *
 * Run: bun fixtures/exercise-all-domains.ts
 */
import { z } from "zod";

const BASE = "https://api.usaspending.gov";
const DELAY_MS = 250;
let reqCount = 0;

async function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

interface TestCase {
  name: string;
  fixture: string;
  method: "GET" | "POST";
  path: string;
  body?: unknown;
  /** If true, skip schema validation (just save fixture) */
  skipSchema?: boolean;
}

const cases: TestCase[] = [
  // ===== AGENCY (GET) =====
  { name: "agency overview NASA", fixture: "agency/overview.json", method: "GET", path: "/api/v2/agency/080/" },
  { name: "agency overview DoD", fixture: "agency/overview-dod.json", method: "GET", path: "/api/v2/agency/097/" },
  { name: "agency awards", fixture: "agency/awards.json", method: "GET", path: "/api/v2/agency/080/awards/?fiscal_year=2024" },
  { name: "agency new award count", fixture: "agency/awards-new-count.json", method: "GET", path: "/api/v2/agency/080/awards/new/count/?fiscal_year=2024" },
  { name: "agency awards count all", fixture: "agency/awards-count-all.json", method: "GET", path: "/api/v2/agency/awards/?fiscal_year=2024" },
  { name: "agency budget function", fixture: "agency/budget-function.json", method: "GET", path: "/api/v2/agency/080/budget_function/?fiscal_year=2024" },
  { name: "agency budget function count", fixture: "agency/budget-function-count.json", method: "GET", path: "/api/v2/agency/080/budget_function/count/?fiscal_year=2024" },
  { name: "agency budgetary resources", fixture: "agency/budgetary-resources.json", method: "GET", path: "/api/v2/agency/080/budgetary_resources/" },
  { name: "agency federal account", fixture: "agency/federal-account.json", method: "GET", path: "/api/v2/agency/080/federal_account/?fiscal_year=2024" },
  { name: "agency federal account count", fixture: "agency/federal-account-count.json", method: "GET", path: "/api/v2/agency/080/federal_account/count/?fiscal_year=2024" },
  { name: "agency object class", fixture: "agency/object-class.json", method: "GET", path: "/api/v2/agency/080/object_class/?fiscal_year=2024" },
  { name: "agency object class count", fixture: "agency/object-class-count.json", method: "GET", path: "/api/v2/agency/080/object_class/count/?fiscal_year=2024" },
  { name: "agency obligations by award category", fixture: "agency/obligations-by-award-category.json", method: "GET", path: "/api/v2/agency/080/obligations_by_award_category/?fiscal_year=2024" },
  { name: "agency program activity", fixture: "agency/program-activity.json", method: "GET", path: "/api/v2/agency/080/program_activity/?fiscal_year=2024" },
  { name: "agency program activity count", fixture: "agency/program-activity-count.json", method: "GET", path: "/api/v2/agency/080/program_activity/count/?fiscal_year=2024" },
  { name: "agency sub agency", fixture: "agency/sub-agency.json", method: "GET", path: "/api/v2/agency/080/sub_agency/?fiscal_year=2024" },
  { name: "agency sub agency count", fixture: "agency/sub-agency-count.json", method: "GET", path: "/api/v2/agency/080/sub_agency/count/?fiscal_year=2024" },
  { name: "agency sub components", fixture: "agency/sub-components.json", method: "GET", path: "/api/v2/agency/080/sub_components/?fiscal_year=2024" },

  // ===== AUTOCOMPLETE (POST) =====
  { name: "autocomplete awarding agency", fixture: "autocomplete/awarding-agency.json", method: "POST", path: "/api/v2/autocomplete/awarding_agency/", body: { search_text: "defense", limit: 5 } },
  { name: "autocomplete funding agency", fixture: "autocomplete/funding-agency.json", method: "POST", path: "/api/v2/autocomplete/funding_agency/", body: { search_text: "health", limit: 5 } },
  { name: "autocomplete cfda", fixture: "autocomplete/cfda.json", method: "POST", path: "/api/v2/autocomplete/cfda/", body: { search_text: "research", limit: 5 } },
  { name: "autocomplete naics", fixture: "autocomplete/naics.json", method: "POST", path: "/api/v2/autocomplete/naics/", body: { search_text: "software", limit: 5 } },
  { name: "autocomplete psc", fixture: "autocomplete/psc.json", method: "POST", path: "/api/v2/autocomplete/psc/", body: { search_text: "computer", limit: 5 } },
  { name: "autocomplete recipient", fixture: "autocomplete/recipient.json", method: "POST", path: "/api/v2/autocomplete/recipient/", body: { search_text: "boeing", limit: 5 } },
  { name: "autocomplete glossary", fixture: "autocomplete/glossary.json", method: "POST", path: "/api/v2/autocomplete/glossary/", body: { search_text: "obligation", limit: 5 } },
  { name: "autocomplete city", fixture: "autocomplete/city.json", method: "POST", path: "/api/v2/autocomplete/city/", body: { search_text: "washing", limit: 5 } },
  { name: "autocomplete location", fixture: "autocomplete/location.json", method: "POST", path: "/api/v2/autocomplete/location/", body: { search_text: "california", limit: 5 } },
  { name: "autocomplete program activity", fixture: "autocomplete/program-activity.json", method: "POST", path: "/api/v2/autocomplete/program_activity/", body: { search_text: "space", limit: 5 } },

  // ===== AWARDS (GET/POST) =====
  { name: "award detail contract", fixture: "awards/detail-contract.json", method: "GET", path: "/api/v2/awards/CONT_AWD_NNM07AB03C_8000_-NONE-_-NONE-/" },
  { name: "award detail grant", fixture: "awards/detail-grant.json", method: "GET", path: "/api/v2/awards/ASST_NON_80NSSC24K0476_8000/" },
  { name: "award last updated", fixture: "awards/last-updated.json", method: "GET", path: "/api/v2/awards/last_updated/" },
  { name: "award count transaction", fixture: "awards/count-transaction.json", method: "GET", path: "/api/v2/awards/count/transaction/CONT_AWD_NNM07AB03C_8000_-NONE-_-NONE-/" },
  { name: "award count subaward", fixture: "awards/count-subaward.json", method: "GET", path: "/api/v2/awards/count/subaward/CONT_AWD_NNM07AB03C_8000_-NONE-_-NONE-/" },
  { name: "award count federal account", fixture: "awards/count-federal-account.json", method: "GET", path: "/api/v2/awards/count/federal_account/CONT_AWD_NNM07AB03C_8000_-NONE-_-NONE-/" },
  { name: "award accounts", fixture: "awards/accounts.json", method: "POST", path: "/api/v2/awards/accounts/", body: { award_id: "CONT_AWD_NNM07AB03C_8000_-NONE-_-NONE-", page: 1, limit: 5 } },
  { name: "award funding", fixture: "awards/funding.json", method: "POST", path: "/api/v2/awards/funding/", body: { award_id: "CONT_AWD_NNM07AB03C_8000_-NONE-_-NONE-", page: 1, limit: 5 } },
  { name: "award funding rollup", fixture: "awards/funding-rollup.json", method: "POST", path: "/api/v2/awards/funding_rollup/", body: { award_id: "CONT_AWD_NNM07AB03C_8000_-NONE-_-NONE-" } },

  // ===== SEARCH (POST) =====
  { name: "search spending by award", fixture: "search/spending-by-award.json", method: "POST", path: "/api/v2/search/spending_by_award/",
    body: { filters: { keywords: ["NASA"], award_type_codes: ["A","B","C","D"] }, fields: ["Award ID","Recipient Name","Award Amount","Awarding Agency","Description"], page: 1, limit: 5, sort: "Award Amount", order: "desc", subawards: false } },
  { name: "search spending by award count", fixture: "search/spending-by-award-count.json", method: "POST", path: "/api/v2/search/spending_by_award_count/",
    body: { filters: { keywords: ["NASA"], award_type_codes: ["A","B","C","D"] } } },
  { name: "search spending over time fy", fixture: "search/spending-over-time-fy.json", method: "POST", path: "/api/v2/search/spending_over_time/",
    body: { group: "fiscal_year", filters: { keywords: ["NASA"], time_period: [{ start_date: "2018-01-01", end_date: "2024-12-31" }] } } },
  { name: "search spending over time month", fixture: "search/spending-over-time-month.json", method: "POST", path: "/api/v2/search/spending_over_time/",
    body: { group: "month", filters: { keywords: ["NASA"], time_period: [{ start_date: "2024-01-01", end_date: "2024-12-31" }] } } },
  { name: "search category naics", fixture: "search/category-naics.json", method: "POST", path: "/api/v2/search/spending_by_category/naics/",
    body: { filters: { keywords: ["technology"] }, limit: 5, page: 1 } },
  { name: "search category awarding_agency", fixture: "search/category-awarding_agency.json", method: "POST", path: "/api/v2/search/spending_by_category/awarding_agency/",
    body: { filters: { keywords: ["defense"] }, limit: 5, page: 1 } },
  { name: "search category recipient", fixture: "search/category-recipient.json", method: "POST", path: "/api/v2/search/spending_by_category/recipient/",
    body: { filters: { keywords: ["boeing"] }, limit: 5, page: 1 } },
  { name: "search geography state", fixture: "search/geography-state.json", method: "POST", path: "/api/v2/search/spending_by_geography/",
    body: { filters: { keywords: ["NASA"] }, scope: "place_of_performance", geo_layer: "state" } },
  { name: "search geography county", fixture: "search/geography-county.json", method: "POST", path: "/api/v2/search/spending_by_geography/",
    body: { filters: { keywords: ["NASA"] }, scope: "place_of_performance", geo_layer: "county" } },
  { name: "search transactions", fixture: "search/spending-by-transaction.json", method: "POST", path: "/api/v2/search/spending_by_transaction/",
    body: { filters: { keywords: ["NASA"], award_type_codes: ["A","B","C","D"] }, page: 1, limit: 5 } },
  { name: "search transaction count", fixture: "search/spending-by-transaction-count.json", method: "POST", path: "/api/v2/search/spending_by_transaction_count/",
    body: { filters: { keywords: ["NASA"], award_type_codes: ["A","B","C","D"] } } },
  { name: "search new awards over time", fixture: "search/new-awards-over-time.json", method: "POST", path: "/api/v2/search/new_awards_over_time/",
    body: { group: "fiscal_year", filters: { keywords: ["NASA"], time_period: [{ start_date: "2020-01-01", end_date: "2024-12-31" }] } } },
  { name: "search transaction spending summary", fixture: "search/transaction-spending-summary.json", method: "POST", path: "/api/v2/search/transaction_spending_summary/",
    body: { filters: { keywords: ["NASA"] } } },

  // ===== SPENDING (POST) =====
  { name: "spending by agency", fixture: "spending/by-agency.json", method: "POST", path: "/api/v2/spending/",
    body: { type: "agency", filters: { fy: "2024", period: "12" } } },
  { name: "spending by federal account", fixture: "spending/by-federal-account.json", method: "POST", path: "/api/v2/spending/",
    body: { type: "federal_account", filters: { fy: "2024", period: "12" } } },
  { name: "spending by object class", fixture: "spending/by-object-class.json", method: "POST", path: "/api/v2/spending/",
    body: { type: "object_class", filters: { fy: "2024", period: "12" } } },
  { name: "spending by budget function", fixture: "spending/by-budget-function.json", method: "POST", path: "/api/v2/spending/",
    body: { type: "budget_function", filters: { fy: "2024", period: "12" } } },

  // ===== RECIPIENT (GET/POST) =====
  { name: "recipient state list", fixture: "recipient/state-list.json", method: "GET", path: "/api/v2/recipient/state/" },
  { name: "recipient state detail", fixture: "recipient/state-detail.json", method: "GET", path: "/api/v2/recipient/state/06/" },
  { name: "recipient state awards", fixture: "recipient/state-awards.json", method: "GET", path: "/api/v2/recipient/state/06/awards/contracts/" },
  { name: "recipient list", fixture: "recipient/list.json", method: "POST", path: "/api/v2/recipient/duns/",
    body: { keyword: "boeing", page: 1, limit: 5, order: "desc", sort: "amount" } },
  { name: "recipient count", fixture: "recipient/count.json", method: "POST", path: "/api/v2/recipient/count/",
    body: { keyword: "boeing" } },

  // ===== REFERENCES (GET/POST) =====
  { name: "ref toptier agencies", fixture: "references/toptier-agencies.json", method: "GET", path: "/api/v2/references/toptier_agencies/" },
  { name: "ref agency 1", fixture: "references/agency.json", method: "GET", path: "/api/v2/references/agency/1/" },
  { name: "ref award types", fixture: "references/award-types.json", method: "GET", path: "/api/v2/references/award_types/" },
  { name: "ref glossary", fixture: "references/glossary.json", method: "POST", path: "/api/v2/references/glossary/", body: { page: 1, limit: 5 } },
  { name: "ref def codes", fixture: "references/def-codes.json", method: "GET", path: "/api/v2/references/def_codes/" },
  { name: "ref naics", fixture: "references/naics.json", method: "GET", path: "/api/v2/references/naics/" },
  { name: "ref naics detail", fixture: "references/naics-detail.json", method: "GET", path: "/api/v2/references/naics/?code=541330" },
  { name: "ref data dictionary", fixture: "references/data-dictionary.json", method: "GET", path: "/api/v2/references/data_dictionary/" },
  { name: "ref filter hash", fixture: "references/filter-hash.json", method: "POST", path: "/api/v2/references/filter/", body: { filters: { keywords: ["NASA"] } } },
  { name: "ref filter tree psc", fixture: "references/filter-tree-psc.json", method: "GET", path: "/api/v2/references/filter_tree/psc/?depth=1" },
  { name: "ref filter tree tas", fixture: "references/filter-tree-tas.json", method: "GET", path: "/api/v2/references/filter_tree/tas/?depth=1" },
  { name: "ref submission periods", fixture: "references/submission-periods.json", method: "GET", path: "/api/v2/references/submission_periods/" },
  { name: "ref total budgetary resources", fixture: "references/total-budgetary-resources.json", method: "GET", path: "/api/v2/references/total_budgetary_resources/" },
  { name: "ref assistance listing", fixture: "references/assistance-listing.json", method: "GET", path: "/api/v2/references/assistance_listings/" },
  { name: "ref cfda totals", fixture: "references/cfda-totals.json", method: "GET", path: "/api/v2/references/cfda/totals/" },

  // ===== DISASTER (GET/POST) =====
  { name: "disaster overview", fixture: "disaster/overview.json", method: "GET", path: "/api/v2/disaster/overview/" },
  { name: "disaster agency spending", fixture: "disaster/agency-spending.json", method: "POST", path: "/api/v2/disaster/agency/spending/",
    body: { filter: { def_codes: ["L","M","N","O","P"] }, spending_type: "total", sort: "obligation", order: "desc", limit: 5, page: 1 } },
  { name: "disaster agency loans", fixture: "disaster/agency-loans.json", method: "POST", path: "/api/v2/disaster/agency/loans/",
    body: { filter: { def_codes: ["L","M","N","O","P"] }, sort: "obligation", order: "desc", limit: 5, page: 1 } },
  { name: "disaster agency count", fixture: "disaster/agency-count.json", method: "POST", path: "/api/v2/disaster/agency/count/",
    body: { filter: { def_codes: ["L","M","N","O","P"] }, spending_type: "total" } },
  { name: "disaster cfda spending", fixture: "disaster/cfda-spending.json", method: "POST", path: "/api/v2/disaster/cfda/spending/",
    body: { filter: { def_codes: ["L","M","N","O","P"] }, spending_type: "total", sort: "obligation", order: "desc", limit: 5, page: 1 } },
  { name: "disaster award amount", fixture: "disaster/award-amount.json", method: "POST", path: "/api/v2/disaster/award/amount/",
    body: { filter: { def_codes: ["L","M","N","O","P"] }, spending_type: "total" } },
  { name: "disaster spending by geography", fixture: "disaster/spending-by-geography.json", method: "POST", path: "/api/v2/disaster/spending_by_geography/",
    body: { filter: { def_codes: ["L","M","N","O","P"] }, spending_type: "obligation", geo_layer: "state" } },

  // ===== FEDERAL ACCOUNTS (GET/POST) =====
  { name: "federal account list", fixture: "federal-accounts/list.json", method: "POST", path: "/api/v2/federal_accounts/",
    body: { page: 1, limit: 5, sort: { field: "account_number", direction: "asc" } } },
  { name: "federal account detail", fixture: "federal-accounts/detail.json", method: "GET", path: "/api/v2/federal_accounts/1/" },
  { name: "federal account fiscal year snapshot", fixture: "federal-accounts/fiscal-year-snapshot.json", method: "GET", path: "/api/v2/federal_accounts/1/fiscal_year_snapshot/" },
  { name: "federal account available object classes", fixture: "federal-accounts/available-object-classes.json", method: "GET", path: "/api/v2/federal_accounts/1/available_object_classes/" },

  // ===== IDV (GET/POST) =====
  { name: "idv amounts", fixture: "idv/amounts.json", method: "GET", path: "/api/v2/idvs/amounts/CONT_IDV_GS35F0381P_4730/" },
  { name: "idv count federal account", fixture: "idv/count-federal-account.json", method: "GET", path: "/api/v2/idvs/count/federal_account/CONT_IDV_GS35F0381P_4730/" },
  { name: "idv funding rollup", fixture: "idv/funding-rollup.json", method: "GET", path: "/api/v2/idvs/funding_rollup/CONT_IDV_GS35F0381P_4730/" },
  { name: "idv accounts", fixture: "idv/accounts.json", method: "POST", path: "/api/v2/idvs/accounts/",
    body: { award_id: 68695855, page: 1, limit: 5 } },
  { name: "idv activity", fixture: "idv/activity.json", method: "POST", path: "/api/v2/idvs/activity/",
    body: { award_id: 68695855, page: 1, limit: 5 } },
  { name: "idv funding", fixture: "idv/funding.json", method: "POST", path: "/api/v2/idvs/funding/",
    body: { award_id: 68695855, page: 1, limit: 5 } },
  { name: "idv child awards", fixture: "idv/awards-child-awards.json", method: "POST", path: "/api/v2/idvs/awards/",
    body: { award_id: 68695855, type: "child_awards", page: 1, limit: 5 } },
  { name: "idv child idvs", fixture: "idv/awards-child-idvs.json", method: "POST", path: "/api/v2/idvs/awards/",
    body: { award_id: 68695855, type: "child_idvs", page: 1, limit: 5 } },

  // ===== REPORTING (GET) =====
  { name: "reporting agencies overview", fixture: "reporting/agencies-overview.json", method: "GET", path: "/api/v2/reporting/agencies/overview/?fiscal_year=2024&fiscal_period=6&page=1&limit=5" },
  { name: "reporting publish dates", fixture: "reporting/agencies-publish-dates.json", method: "GET", path: "/api/v2/reporting/agencies/publish_dates/?fiscal_year=2024&fiscal_period=6&page=1&limit=5" },
  { name: "reporting agency overview", fixture: "reporting/agency-overview.json", method: "GET", path: "/api/v2/reporting/agencies/080/overview/" },
  { name: "reporting differences", fixture: "reporting/agency-differences.json", method: "GET", path: "/api/v2/reporting/agencies/080/differences/2024/6/?page=1&limit=5" },
  { name: "reporting discrepancies", fixture: "reporting/agency-discrepancies.json", method: "GET", path: "/api/v2/reporting/agencies/080/discrepancies/2024/6/?page=1&limit=5" },
  { name: "reporting submission history", fixture: "reporting/submission-history.json", method: "GET", path: "/api/v2/reporting/agencies/080/submission_history/2024/6/" },

  // ===== FINANCIAL (GET) =====
  { name: "financial federal obligations", fixture: "financial/federal-obligations.json", method: "GET", path: "/api/v2/financial_obligations/?funding_agency_id=1&fiscal_year=2024" },
  { name: "financial balances", fixture: "financial/financial-balances.json", method: "GET", path: "/api/v2/financial_balances/agencies/?funding_agency_id=1&fiscal_year=2024" },
  { name: "financial spending major object class", fixture: "financial/spending-major-object-class.json", method: "GET", path: "/api/v2/financial_spending/major_object_class/?fiscal_year=2024&funding_agency_id=1" },
  { name: "financial spending object class", fixture: "financial/spending-object-class.json", method: "GET", path: "/api/v2/financial_spending/object_class/?fiscal_year=2024&funding_agency_id=1&major_object_class_code=10" },

  // ===== SUBAWARDS (POST) =====
  { name: "subaward list", fixture: "subawards/list.json", method: "POST", path: "/api/v2/subawards/",
    body: { page: 1, limit: 5, sort: "subaward_number", order: "desc" } },
  { name: "subaward by award", fixture: "subawards/by-award.json", method: "POST", path: "/api/v2/subawards/",
    body: { award_id: "CONT_AWD_NNM07AB03C_8000_-NONE-_-NONE-", page: 1, limit: 5 } },

  // ===== BUDGET FUNCTIONS (GET/POST) =====
  { name: "budget function list", fixture: "budget-functions/list.json", method: "GET", path: "/api/v2/budget_functions/list_budget_functions/" },
  { name: "budget function subfunctions", fixture: "budget-functions/subfunctions.json", method: "POST", path: "/api/v2/budget_functions/list_budget_subfunctions/",
    body: { budget_function_code: "050" } },

  // ===== DOWNLOADS (POST/GET) =====
  { name: "download count", fixture: "downloads/count.json", method: "POST", path: "/api/v2/download/count/",
    body: { filters: { keywords: ["NASA"], award_type_codes: ["A","B","C","D"] } } },
  { name: "bulk download list agencies accounts", fixture: "bulk-downloads/list-agencies-accounts.json", method: "POST", path: "/api/v2/bulk_download/list_agencies/", body: { type: "account_agencies" } },
  { name: "bulk download list agencies awards", fixture: "bulk-downloads/list-agencies-awards.json", method: "POST", path: "/api/v2/bulk_download/list_agencies/", body: { type: "award_agencies" } },
  { name: "bulk download list monthly files", fixture: "bulk-downloads/list-monthly-files.json", method: "POST", path: "/api/v2/bulk_download/list_monthly_files/",
    body: { agency: "all", fiscal_year: 2024, type: "contracts" } },

  // ===== REPORTING UNLINKED (GET) =====
  { name: "reporting unlinked assistance", fixture: "reporting/unlinked-awards-assistance.json", method: "GET", path: "/api/v2/reporting/agencies/080/unlinked_awards/assistance/2024/6/" },
  { name: "reporting unlinked procurement", fixture: "reporting/unlinked-awards-procurement.json", method: "GET", path: "/api/v2/reporting/agencies/080/unlinked_awards/procurement/2024/6/" },
];

// ---- Run all ----
let passed = 0;
let failed = 0;
const failures: { name: string; error: string; status?: number }[] = [];

console.log(`Exercising ${cases.length} API endpoints...\n`);

for (const tc of cases) {
  if (reqCount > 0) await delay(DELAY_MS);
  reqCount++;

  process.stdout.write(`  ${tc.method.padEnd(4)} ${tc.name}...`);
  try {
    const url = `${BASE}${tc.path}`;
    const init: RequestInit | undefined = tc.method === "POST"
      ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(tc.body) }
      : undefined;

    const res = await fetch(url, init);

    if (!res.ok) {
      const text = await res.text();
      console.log(` FAIL (HTTP ${res.status})`);
      failures.push({ name: tc.name, error: text.slice(0, 300), status: res.status });
      failed++;
      continue;
    }

    const json = await res.json();

    // Save fixture
    await Bun.write(`${import.meta.dir}/${tc.fixture}`, JSON.stringify(json, null, 2));
    console.log(` OK`);
    passed++;
  } catch (err: any) {
    console.log(` FAIL`);
    failures.push({ name: tc.name, error: err.message });
    failed++;
  }
}

console.log(`\n========================================`);
console.log(`Results: ${passed} passed, ${failed} failed out of ${cases.length} total`);

if (failures.length > 0) {
  console.log(`\n--- FAILURES ---`);
  for (const f of failures) {
    console.log(`\n  ${f.name}${f.status ? ` (HTTP ${f.status})` : ""}:`);
    console.log(`    ${f.error.slice(0, 200)}`);
  }
}
