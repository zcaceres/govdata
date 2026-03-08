#!/usr/bin/env bun
/**
 * Thoroughly exercise USAspending API endpoints with varied params.
 * Reports schema parse failures and saves successful responses as fixtures.
 */
import { z } from "zod";
import {
  AwardSearchResponseSchema,
  AwardDetailSchema,
  AgencyOverviewSchema,
  SpendingByAgencyResponseSchema,
  SpendingByStateResponseSchema,
  SpendingOverTimeResponseSchema,
} from "../src/schemas";

const BASE = "https://api.usaspending.gov";

interface TestCase {
  name: string;
  fixture: string;
  method: "GET" | "POST";
  path: string;
  body?: unknown;
  schema: z.ZodType;
}

const cases: TestCase[] = [
  // ---- Award Search variations ----
  {
    name: "award search: keyword only",
    fixture: "award-search-keyword.json",
    method: "POST",
    path: "/api/v2/search/spending_by_award/",
    body: {
      filters: { keywords: ["NASA"], award_type_codes: ["A", "B", "C", "D"] },
      fields: ["Award ID", "Recipient Name", "Start Date", "End Date", "Award Amount", "Awarding Agency", "Awarding Sub Agency", "Award Type", "Description"],
      page: 1, limit: 10, sort: "Award Amount", order: "desc", subawards: false,
    },
    schema: AwardSearchResponseSchema,
  },
  {
    name: "award search: grants by NAICS",
    fixture: "award-search-grants-naics.json",
    method: "POST",
    path: "/api/v2/search/spending_by_award/",
    body: {
      filters: {
        award_type_codes: ["02", "03", "04", "05"],
        naics_codes: { require: ["541330"] },
        time_period: [{ start_date: "2023-01-01", end_date: "2024-12-31" }],
      },
      fields: ["Award ID", "Recipient Name", "Start Date", "End Date", "Award Amount", "Awarding Agency", "Awarding Sub Agency", "Award Type", "Description"],
      page: 1, limit: 10, sort: "Award Amount", order: "desc", subawards: false,
    },
    schema: AwardSearchResponseSchema,
  },
  {
    name: "award search: by agency filter",
    fixture: "award-search-agency.json",
    method: "POST",
    path: "/api/v2/search/spending_by_award/",
    body: {
      filters: {
        keywords: ["defense"],
        agencies: [{ type: "awarding", tier: "toptier", name: "Department of Defense" }],
        award_type_codes: ["A", "B", "C", "D"],
      },
      fields: ["Award ID", "Recipient Name", "Start Date", "End Date", "Award Amount", "Awarding Agency", "Awarding Sub Agency", "Award Type", "Description"],
      page: 1, limit: 5, sort: "Award Amount", order: "desc", subawards: false,
    },
    schema: AwardSearchResponseSchema,
  },
  {
    name: "award search: by recipient",
    fixture: "award-search-recipient.json",
    method: "POST",
    path: "/api/v2/search/spending_by_award/",
    body: {
      filters: {
        recipient_search_text: ["Boeing"],
        award_type_codes: ["A", "B", "C", "D"],
      },
      fields: ["Award ID", "Recipient Name", "Start Date", "End Date", "Award Amount", "Awarding Agency", "Awarding Sub Agency", "Award Type", "Description"],
      page: 1, limit: 5, sort: "Award Amount", order: "desc", subawards: false,
    },
    schema: AwardSearchResponseSchema,
  },
  {
    name: "award search: by state",
    fixture: "award-search-state.json",
    method: "POST",
    path: "/api/v2/search/spending_by_award/",
    body: {
      filters: {
        place_of_performance_locations: [{ country: "USA", state: "CA" }],
        award_type_codes: ["02", "03", "04", "05"],
      },
      fields: ["Award ID", "Recipient Name", "Start Date", "End Date", "Award Amount", "Awarding Agency", "Awarding Sub Agency", "Award Type", "Description"],
      page: 1, limit: 5, sort: "Award Amount", order: "desc", subawards: false,
    },
    schema: AwardSearchResponseSchema,
  },
  {
    name: "award search: loans",
    fixture: "award-search-loans.json",
    method: "POST",
    path: "/api/v2/search/spending_by_award/",
    body: {
      filters: {
        award_type_codes: ["07", "08"],
        time_period: [{ start_date: "2024-01-01", end_date: "2024-12-31" }],
      },
      fields: ["Award ID", "Recipient Name", "Issued Date", "Loan Value", "Subsidy Cost", "Awarding Agency", "Awarding Sub Agency"],
      page: 1, limit: 10, sort: "Loan Value", order: "desc", subawards: false,
    },
    schema: AwardSearchResponseSchema,
  },
  {
    name: "award search: page 2",
    fixture: "award-search-page2.json",
    method: "POST",
    path: "/api/v2/search/spending_by_award/",
    body: {
      filters: { keywords: ["NASA"], award_type_codes: ["A", "B", "C", "D"] },
      fields: ["Award ID", "Recipient Name", "Start Date", "End Date", "Award Amount", "Awarding Agency", "Awarding Sub Agency", "Award Type", "Description"],
      page: 2, limit: 5, sort: "Award Amount", order: "desc", subawards: false,
    },
    schema: AwardSearchResponseSchema,
  },
  {
    name: "award search: subawards",
    fixture: "award-search-subawards.json",
    method: "POST",
    path: "/api/v2/search/spending_by_award/",
    body: {
      filters: { keywords: ["NASA"], award_type_codes: ["A", "B", "C", "D"] },
      fields: ["Sub-Award ID", "Sub-Awardee Name", "Sub-Award Date", "Sub-Award Amount", "Awarding Agency", "Awarding Sub Agency", "Prime Award ID", "Prime Recipient Name"],
      page: 1, limit: 5, sort: "Sub-Award Amount", order: "desc", subawards: true,
    },
    schema: AwardSearchResponseSchema,
  },

  // ---- Award Detail variations ----
  {
    name: "award detail: contract",
    fixture: "award-detail-contract.json",
    method: "GET",
    path: "/api/v2/awards/CONT_AWD_NNM07AB03C_8000_-NONE-_-NONE-/",
    schema: AwardDetailSchema,
  },
  {
    name: "award detail: grant",
    fixture: "award-detail-grant.json",
    method: "GET",
    path: "/api/v2/awards/ASST_NON_80NSSC24K0476_8000/",
    schema: AwardDetailSchema,
  },

  // ---- Agency Overview variations ----
  {
    name: "agency overview: NASA (080)",
    fixture: "agency-overview-nasa.json",
    method: "GET",
    path: "/api/v2/agency/080/",
    schema: AgencyOverviewSchema,
  },
  {
    name: "agency overview: DoD (097)",
    fixture: "agency-overview-dod.json",
    method: "GET",
    path: "/api/v2/agency/097/",
    schema: AgencyOverviewSchema,
  },
  {
    name: "agency overview: HHS (075)",
    fixture: "agency-overview-hhs.json",
    method: "GET",
    path: "/api/v2/agency/075/",
    schema: AgencyOverviewSchema,
  },
  {
    name: "agency overview: EPA (068)",
    fixture: "agency-overview-epa.json",
    method: "GET",
    path: "/api/v2/agency/068/",
    schema: AgencyOverviewSchema,
  },

  // ---- Spending by Agency variations ----
  {
    name: "spending by agency: FY2024 P12",
    fixture: "spending-by-agency-fy2024.json",
    method: "POST",
    path: "/api/v2/spending/",
    body: { type: "agency", filters: { fy: "2024", period: "12" } },
    schema: SpendingByAgencyResponseSchema,
  },
  {
    name: "spending by agency: FY2023 Q4",
    fixture: "spending-by-agency-fy2023-q4.json",
    method: "POST",
    path: "/api/v2/spending/",
    body: { type: "agency", filters: { fy: "2023", quarter: "4" } },
    schema: SpendingByAgencyResponseSchema,
  },
  {
    name: "spending by federal_account",
    fixture: "spending-by-federal-account.json",
    method: "POST",
    path: "/api/v2/spending/",
    body: { type: "federal_account", filters: { fy: "2024", period: "12" } },
    schema: SpendingByAgencyResponseSchema,
  },
  {
    name: "spending by object_class",
    fixture: "spending-by-object-class.json",
    method: "POST",
    path: "/api/v2/spending/",
    body: { type: "object_class", filters: { fy: "2024", period: "12" } },
    schema: SpendingByAgencyResponseSchema,
  },
  {
    name: "spending by budget_function",
    fixture: "spending-by-budget-function.json",
    method: "POST",
    path: "/api/v2/spending/",
    body: { type: "budget_function", filters: { fy: "2024", period: "12" } },
    schema: SpendingByAgencyResponseSchema,
  },

  // ---- Spending by State ----
  {
    name: "spending by state: all states",
    fixture: "spending-by-state-all.json",
    method: "GET",
    path: "/api/v2/recipient/state/",
    schema: SpendingByStateResponseSchema,
  },

  // ---- Spending Over Time variations ----
  {
    name: "spending over time: fiscal_year",
    fixture: "spending-over-time-fy.json",
    method: "POST",
    path: "/api/v2/search/spending_over_time/",
    body: {
      group: "fiscal_year",
      filters: {
        keywords: ["NASA"],
        time_period: [{ start_date: "2018-01-01", end_date: "2024-12-31" }],
      },
    },
    schema: SpendingOverTimeResponseSchema,
  },
  {
    name: "spending over time: quarter",
    fixture: "spending-over-time-quarter.json",
    method: "POST",
    path: "/api/v2/search/spending_over_time/",
    body: {
      group: "quarter",
      filters: {
        keywords: ["climate"],
        time_period: [{ start_date: "2023-01-01", end_date: "2024-12-31" }],
      },
    },
    schema: SpendingOverTimeResponseSchema,
  },
  {
    name: "spending over time: month",
    fixture: "spending-over-time-month.json",
    method: "POST",
    path: "/api/v2/search/spending_over_time/",
    body: {
      group: "month",
      filters: {
        keywords: ["infrastructure"],
        time_period: [{ start_date: "2024-01-01", end_date: "2024-12-31" }],
      },
    },
    schema: SpendingOverTimeResponseSchema,
  },
  {
    name: "spending over time: by award type",
    fixture: "spending-over-time-contracts.json",
    method: "POST",
    path: "/api/v2/search/spending_over_time/",
    body: {
      group: "fiscal_year",
      filters: {
        award_type_codes: ["A", "B", "C", "D"],
        time_period: [{ start_date: "2020-01-01", end_date: "2024-12-31" }],
      },
    },
    schema: SpendingOverTimeResponseSchema,
  },
];

// ---- Run all cases ----
let passed = 0;
let failed = 0;
const failures: { name: string; error: string }[] = [];

for (const tc of cases) {
  process.stdout.write(`  ${tc.name}...`);
  try {
    const url = `${BASE}${tc.path}`;
    const init: RequestInit | undefined = tc.method === "POST"
      ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(tc.body) }
      : undefined;

    const res = await fetch(url, init);

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
    }

    const json = await res.json();

    // Attempt schema parse
    const parsed = tc.schema.parse(json);

    // Save fixture
    await Bun.write(`${import.meta.dir}/${tc.fixture}`, JSON.stringify(json, null, 2));
    console.log(` OK`);
    passed++;
  } catch (err: any) {
    console.log(` FAIL`);
    const msg = err instanceof z.ZodError
      ? err.issues.map((i: any) => `  ${i.path.join(".")}: ${i.message} (code: ${i.code})`).join("\n")
      : `  ${err.message}`;
    failures.push({ name: tc.name, error: msg });
    failed++;
  }
}

console.log(`\n========================================`);
console.log(`Results: ${passed} passed, ${failed} failed out of ${cases.length} total`);

if (failures.length > 0) {
  console.log(`\n--- FAILURES ---`);
  for (const f of failures) {
    console.log(`\n${f.name}:`);
    console.log(f.error);
  }
}
