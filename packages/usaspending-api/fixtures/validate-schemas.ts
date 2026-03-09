#!/usr/bin/env bun
/**
 * Validate saved fixture files against their domain schemas.
 * Imports schemas directly by their actual exported names.
 * Run: bun fixtures/validate-schemas.ts
 */
import { z } from "zod";

// Agency schemas
import {
  AgencyOverviewSchema,
  AgencyAwardsSchema,
  AgencyNewAwardCountSchema,
  AgencyAwardsCountResponseSchema,
  BudgetFunctionResponseSchema,
  BudgetFunctionCountSchema,
  BudgetaryResourcesResponseSchema,
  FederalAccountResponseSchema,
  FederalAccountCountSchema,
  ObjectClassResponseSchema,
  ObjectClassCountSchema,
  ObligationsByCategoryResponseSchema,
  ProgramActivityResponseSchema,
  ProgramActivityCountSchema,
  SubAgencyResponseSchema,
  SubAgencyCountSchema,
  SubComponentsResponseSchema,
} from "../src/domains/agency/schemas";

// Autocomplete schemas
import {
  AutocompleteAgencyResponseSchema,
  AutocompleteCfdaResponseSchema,
  AutocompleteNaicsResponseSchema,
  AutocompletePscResponseSchema,
  AutocompleteRecipientResponseSchema,
  AutocompleteGlossaryResponseSchema,
  AutocompleteCityResponseSchema,
  AutocompleteLocationResponseSchema,
  AutocompleteProgramActivityResponseSchema,
} from "../src/domains/autocomplete/schemas";

// Awards schemas
import {
  AwardDetailSchema,
  AwardAccountsResponseSchema,
  AwardCountTransactionSchema,
  AwardCountSubawardSchema,
  AwardCountFederalAccountSchema,
  AwardFundingResponseSchema,
  AwardFundingRollupSchema,
  AwardLastUpdatedSchema,
} from "../src/domains/awards/schemas";

// Search schemas
import {
  AwardSearchResponseSchema,
  SpendingOverTimeResponseSchema,
  CategoryResponseSchema,
  GeographyResponseSchema,
  TransactionCountResponseSchema,
  TransactionSpendingSummaryResponseSchema,
} from "../src/domains/search/schemas";

// Spending
import { SpendingByAgencyResponseSchema } from "../src/domains/spending/schemas";

// Recipient
import {
  SpendingByStateResponseSchema,
  StateDetailSchema,
  RecipientListResponseSchema,
  RecipientCountSchema,
} from "../src/domains/recipient/schemas";

// References
import {
  ToptierAgenciesResponseSchema,
  AgencyReferenceResponseSchema,
  AwardTypesResponseSchema,
  DefCodesResponseSchema,
  NaicsRefResponseSchema,
  DataDictionaryResponseSchema,
  FilterHashResponseSchema,
  FilterTreeResponseSchema,
  SubmissionPeriodsResponseSchema,
  TotalBudgetaryResourcesResponseSchema,
  CfdaTotalsResponseSchema,
  GlossaryResponseSchema,
} from "../src/domains/references/schemas";

// Disaster
import {
  DisasterSpendingResponseSchema,
  DisasterLoanResponseSchema,
  DisasterCountSchema,
  DisasterCfdaResponseSchema,
  DisasterAwardAmountSchema,
  DisasterGeoResponseSchema,
} from "../src/domains/disaster/schemas";

// Federal accounts
import {
  FederalAccountListResponseSchema,
  FiscalYearSnapshotSchema,
  AvailableObjectClassResponseSchema,
} from "../src/domains/federal-accounts/schemas";

// IDV
import {
  IdvAccountsResponseSchema,
  IdvActivityResponseSchema,
  IdvAmountsSchema,
  IdvAwardsResponseSchema,
  IdvCountSchema,
  IdvFundingResponseSchema,
} from "../src/domains/idv/schemas";

// Reporting
import {
  ReportingAgencyOverviewResponseSchema,
  ReportingPublishDatesResponseSchema,
  ReportingSingleAgencyResponseSchema,
} from "../src/domains/reporting/schemas";

// Financial
import {
  FinancialBalancesResponseSchema,
  SpendingMajorObjectClassResponseSchema,
  SpendingObjectClassResponseSchema,
} from "../src/domains/financial/schemas";

// Subawards
import { SubawardListResponseSchema } from "../src/domains/subawards/schemas";

// Budget functions
import {
  BudgetFunctionListResponseSchema,
  BudgetSubfunctionListResponseSchema,
} from "../src/domains/budget-functions/schemas";

// Downloads
import {
  DownloadCountResponseSchema,
  BulkDownloadListAgenciesResponseSchema,
  BulkDownloadListMonthlyFilesResponseSchema,
} from "../src/domains/downloads/schemas";

const DIR = import.meta.dir;

interface SchemaCheck {
  fixture: string;
  schema: z.ZodType;
  name: string;
}

const checks: SchemaCheck[] = [
  // Agency
  { fixture: "agency/overview.json", schema: AgencyOverviewSchema, name: "AgencyOverview" },
  { fixture: "agency/overview-dod.json", schema: AgencyOverviewSchema, name: "AgencyOverview (DoD)" },
  { fixture: "agency/awards.json", schema: AgencyAwardsSchema, name: "AgencyAwards" },
  { fixture: "agency/awards-new-count.json", schema: AgencyNewAwardCountSchema, name: "AgencyNewAwardCount" },
  { fixture: "agency/budget-function.json", schema: BudgetFunctionResponseSchema, name: "BudgetFunctionResponse" },
  { fixture: "agency/budget-function-count.json", schema: BudgetFunctionCountSchema, name: "BudgetFunctionCount" },
  { fixture: "agency/budgetary-resources.json", schema: BudgetaryResourcesResponseSchema, name: "BudgetaryResourcesResponse" },
  { fixture: "agency/federal-account.json", schema: FederalAccountResponseSchema, name: "FederalAccountResponse" },
  { fixture: "agency/federal-account-count.json", schema: FederalAccountCountSchema, name: "FederalAccountCount" },
  { fixture: "agency/object-class.json", schema: ObjectClassResponseSchema, name: "ObjectClassResponse" },
  { fixture: "agency/object-class-count.json", schema: ObjectClassCountSchema, name: "ObjectClassCount" },
  { fixture: "agency/obligations-by-award-category.json", schema: ObligationsByCategoryResponseSchema, name: "ObligationsByCategoryResponse" },
  { fixture: "agency/program-activity.json", schema: ProgramActivityResponseSchema, name: "ProgramActivityResponse" },
  { fixture: "agency/program-activity-count.json", schema: ProgramActivityCountSchema, name: "ProgramActivityCount" },
  { fixture: "agency/sub-agency.json", schema: SubAgencyResponseSchema, name: "SubAgencyResponse" },
  { fixture: "agency/sub-agency-count.json", schema: SubAgencyCountSchema, name: "SubAgencyCount" },
  { fixture: "agency/sub-components.json", schema: SubComponentsResponseSchema, name: "SubComponentsResponse" },

  // Autocomplete
  { fixture: "autocomplete/awarding-agency.json", schema: AutocompleteAgencyResponseSchema, name: "Autocomplete AwardingAgency" },
  { fixture: "autocomplete/funding-agency.json", schema: AutocompleteAgencyResponseSchema, name: "Autocomplete FundingAgency" },
  { fixture: "autocomplete/cfda.json", schema: AutocompleteCfdaResponseSchema, name: "Autocomplete CFDA" },
  { fixture: "autocomplete/naics.json", schema: AutocompleteNaicsResponseSchema, name: "Autocomplete NAICS" },
  { fixture: "autocomplete/psc.json", schema: AutocompletePscResponseSchema, name: "Autocomplete PSC" },
  { fixture: "autocomplete/recipient.json", schema: AutocompleteRecipientResponseSchema, name: "Autocomplete Recipient" },
  { fixture: "autocomplete/glossary.json", schema: AutocompleteGlossaryResponseSchema, name: "Autocomplete Glossary" },
  { fixture: "autocomplete/location.json", schema: AutocompleteLocationResponseSchema, name: "Autocomplete Location" },
  { fixture: "autocomplete/program-activity.json", schema: AutocompleteProgramActivityResponseSchema, name: "Autocomplete ProgramActivity" },

  // Awards
  { fixture: "awards/detail-contract.json", schema: AwardDetailSchema, name: "AwardDetail (contract)" },
  { fixture: "awards/detail-grant.json", schema: AwardDetailSchema, name: "AwardDetail (grant)" },
  { fixture: "awards/last-updated.json", schema: AwardLastUpdatedSchema, name: "AwardLastUpdated" },
  { fixture: "awards/count-transaction.json", schema: AwardCountTransactionSchema, name: "AwardCount (transaction)" },
  { fixture: "awards/count-subaward.json", schema: AwardCountSubawardSchema, name: "AwardCount (subaward)" },
  { fixture: "awards/count-federal-account.json", schema: AwardCountFederalAccountSchema, name: "AwardCount (federal-account)" },
  { fixture: "awards/accounts.json", schema: AwardAccountsResponseSchema, name: "AwardAccounts" },
  { fixture: "awards/funding.json", schema: AwardFundingResponseSchema, name: "AwardFunding" },
  { fixture: "awards/funding-rollup.json", schema: AwardFundingRollupSchema, name: "AwardFundingRollup" },

  // Search
  { fixture: "search/spending-by-award.json", schema: AwardSearchResponseSchema, name: "AwardSearch" },
  { fixture: "search/spending-by-award-count.json", schema: TransactionCountResponseSchema, name: "SpendingByAwardCount" },
  { fixture: "search/spending-over-time-fy.json", schema: SpendingOverTimeResponseSchema, name: "SpendingOverTime (fy)" },
  { fixture: "search/spending-over-time-month.json", schema: SpendingOverTimeResponseSchema, name: "SpendingOverTime (month)" },
  { fixture: "search/category-naics.json", schema: CategoryResponseSchema, name: "Category (naics)" },
  { fixture: "search/category-awarding_agency.json", schema: CategoryResponseSchema, name: "Category (awarding_agency)" },
  { fixture: "search/category-recipient.json", schema: CategoryResponseSchema, name: "Category (recipient)" },
  { fixture: "search/geography-state.json", schema: GeographyResponseSchema, name: "Geography (state)" },
  { fixture: "search/geography-county.json", schema: GeographyResponseSchema, name: "Geography (county)" },
  { fixture: "search/transaction-spending-summary.json", schema: TransactionSpendingSummaryResponseSchema, name: "TransactionSpendingSummary" },

  // Spending
  { fixture: "spending/by-agency.json", schema: SpendingByAgencyResponseSchema, name: "SpendingByAgency (agency)" },
  { fixture: "spending/by-federal-account.json", schema: SpendingByAgencyResponseSchema, name: "SpendingByAgency (federal_account)" },
  { fixture: "spending/by-object-class.json", schema: SpendingByAgencyResponseSchema, name: "SpendingByAgency (object_class)" },
  { fixture: "spending/by-budget-function.json", schema: SpendingByAgencyResponseSchema, name: "SpendingByAgency (budget_function)" },

  // Recipient
  { fixture: "recipient/state-list.json", schema: SpendingByStateResponseSchema, name: "SpendingByState" },
  { fixture: "recipient/state-detail.json", schema: StateDetailSchema, name: "StateDetail" },
  { fixture: "recipient/list.json", schema: RecipientListResponseSchema, name: "RecipientList" },
  { fixture: "recipient/count.json", schema: RecipientCountSchema, name: "RecipientCount" },

  // References
  { fixture: "references/toptier-agencies.json", schema: ToptierAgenciesResponseSchema, name: "ToptierAgencies" },
  { fixture: "references/agency.json", schema: AgencyReferenceResponseSchema, name: "RefAgency" },
  { fixture: "references/award-types.json", schema: AwardTypesResponseSchema, name: "AwardTypes" },
  { fixture: "references/def-codes.json", schema: DefCodesResponseSchema, name: "DefCodes" },
  { fixture: "references/naics.json", schema: NaicsRefResponseSchema, name: "RefNaics" },
  { fixture: "references/naics-detail.json", schema: NaicsRefResponseSchema, name: "RefNaics (detail)" },
  { fixture: "references/data-dictionary.json", schema: DataDictionaryResponseSchema, name: "DataDictionary" },
  { fixture: "references/filter-hash.json", schema: FilterHashResponseSchema, name: "FilterHash" },
  { fixture: "references/filter-tree-psc.json", schema: FilterTreeResponseSchema, name: "FilterTree (PSC)" },
  { fixture: "references/filter-tree-tas.json", schema: FilterTreeResponseSchema, name: "FilterTree (TAS)" },
  { fixture: "references/submission-periods.json", schema: SubmissionPeriodsResponseSchema, name: "SubmissionPeriods" },
  { fixture: "references/total-budgetary-resources.json", schema: TotalBudgetaryResourcesResponseSchema, name: "TotalBudgetaryResources" },
  { fixture: "references/cfda-totals.json", schema: CfdaTotalsResponseSchema, name: "CfdaTotals" },

  // Disaster
  { fixture: "disaster/agency-spending.json", schema: DisasterSpendingResponseSchema, name: "DisasterAgencySpending" },
  { fixture: "disaster/agency-loans.json", schema: DisasterLoanResponseSchema, name: "DisasterAgencyLoans" },
  { fixture: "disaster/agency-count.json", schema: DisasterCountSchema, name: "DisasterCount (agency)" },
  { fixture: "disaster/cfda-spending.json", schema: DisasterCfdaResponseSchema, name: "DisasterCfdaSpending" },
  { fixture: "disaster/award-amount.json", schema: DisasterAwardAmountSchema, name: "DisasterAwardAmount" },
  { fixture: "disaster/spending-by-geography.json", schema: DisasterGeoResponseSchema, name: "DisasterSpendingByGeography" },

  // Federal accounts
  { fixture: "federal-accounts/list.json", schema: FederalAccountListResponseSchema, name: "FederalAccountList" },
  { fixture: "federal-accounts/fiscal-year-snapshot.json", schema: FiscalYearSnapshotSchema, name: "FederalAccountFiscalYearSnapshot" },
  { fixture: "federal-accounts/available-object-classes.json", schema: AvailableObjectClassResponseSchema, name: "FederalAccountAvailableObjectClasses" },

  // IDV
  { fixture: "idv/amounts.json", schema: IdvAmountsSchema, name: "IdvAmounts" },
  { fixture: "idv/count-federal-account.json", schema: IdvCountSchema, name: "IdvCountFederalAccount" },
  { fixture: "idv/accounts.json", schema: IdvAccountsResponseSchema, name: "IdvAccounts" },
  { fixture: "idv/activity.json", schema: IdvActivityResponseSchema, name: "IdvActivity" },
  { fixture: "idv/funding.json", schema: IdvFundingResponseSchema, name: "IdvFunding" },
  { fixture: "idv/awards-child-awards.json", schema: IdvAwardsResponseSchema, name: "IdvChildAwards" },
  { fixture: "idv/awards-child-idvs.json", schema: IdvAwardsResponseSchema, name: "IdvChildIdvs" },

  // Reporting
  { fixture: "reporting/agencies-overview.json", schema: ReportingAgencyOverviewResponseSchema, name: "ReportingAgenciesOverview" },
  { fixture: "reporting/agencies-publish-dates.json", schema: ReportingPublishDatesResponseSchema, name: "ReportingPublishDates" },
  { fixture: "reporting/agency-overview.json", schema: ReportingSingleAgencyResponseSchema, name: "ReportingAgencyOverview" },

  // Financial
  { fixture: "financial/financial-balances.json", schema: FinancialBalancesResponseSchema, name: "FinancialBalances" },
  { fixture: "financial/spending-major-object-class.json", schema: SpendingMajorObjectClassResponseSchema, name: "FinancialSpendingMajorObjectClass" },
  { fixture: "financial/spending-object-class.json", schema: SpendingObjectClassResponseSchema, name: "FinancialSpendingObjectClass" },

  // Subawards
  { fixture: "subawards/list.json", schema: SubawardListResponseSchema, name: "SubawardList" },
  { fixture: "subawards/by-award.json", schema: SubawardListResponseSchema, name: "SubawardByAward" },

  // Budget functions
  { fixture: "budget-functions/list.json", schema: BudgetFunctionListResponseSchema, name: "BudgetFunctionList" },
  { fixture: "budget-functions/subfunctions.json", schema: BudgetSubfunctionListResponseSchema, name: "BudgetFunctionSubfunctions" },

  // Downloads
  { fixture: "downloads/count.json", schema: DownloadCountResponseSchema, name: "DownloadCount" },
  { fixture: "bulk-downloads/list-agencies-accounts.json", schema: BulkDownloadListAgenciesResponseSchema, name: "BulkDownloadListAgencies (accounts)" },
  { fixture: "bulk-downloads/list-agencies-awards.json", schema: BulkDownloadListAgenciesResponseSchema, name: "BulkDownloadListAgencies (awards)" },
  { fixture: "bulk-downloads/list-monthly-files.json", schema: BulkDownloadListMonthlyFilesResponseSchema, name: "BulkDownloadListMonthlyFiles" },
];

let passed = 0;
let failed = 0;
const failures: { name: string; error: string }[] = [];
const skipped: string[] = [];

console.log(`Validating ${checks.length} fixtures against schemas...\n`);

for (const check of checks) {
  const path = `${DIR}/${check.fixture}`;
  const file = Bun.file(path);
  if (!(await file.exists())) {
    skipped.push(check.name);
    continue;
  }

  process.stdout.write(`  ${check.name}...`);
  try {
    const json = await file.json();
    check.schema.parse(json);
    console.log(` OK`);
    passed++;
  } catch (err: any) {
    console.log(` FAIL`);
    if (err instanceof z.ZodError) {
      const issues = err.issues.map((i: any) => `    ${i.path.join(".")}: ${i.message}`).join("\n");
      failures.push({ name: check.name, error: issues });
    } else {
      failures.push({ name: check.name, error: err.message });
    }
    failed++;
  }
}

console.log(`\n========================================`);
console.log(`Results: ${passed} passed, ${failed} failed, ${skipped.length} skipped`);

if (failures.length > 0) {
  console.log(`\n--- SCHEMA FAILURES ---`);
  for (const f of failures) {
    console.log(`\n  ${f.name}:`);
    console.log(f.error);
  }
}

if (skipped.length > 0) {
  console.log(`\n--- SKIPPED (fixture not found) ---`);
  for (const s of skipped) {
    console.log(`  ${s}`);
  }
}
