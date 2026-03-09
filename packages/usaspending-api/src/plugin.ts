import type { GovDataPlugin, GovResult } from "govdata-core";
import {
  _searchAwards, _spendingOverTime,
  _spendingByAwardCount, _spendingByCategory,
  _spendingByGeography, _spendingByTransaction,
  _spendingByTransactionCount, _spendingByTransactionGrouped,
  _spendingBySubawardGrouped, _newAwardsOverTime,
  _transactionSpendingSummary,
  CATEGORY_SUB_PATHS,
} from "./domains/search";
import type { CategorySubPath } from "./domains/search";
import {
  _findAward,
  _awardAccounts,
  _awardCountFederalAccount,
  _awardCountSubaward,
  _awardCountTransaction,
  _awardFunding,
  _awardFundingRollup,
  _awardLastUpdated,
  _awardSpendingRecipient,
} from "./domains/awards";
import {
  _agencyOverview,
  _agencyAwards,
  _agencyNewAwardCount,
  _agencyAwardsCount,
  _agencyBudgetFunction,
  _agencyBudgetFunctionCount,
  _agencyBudgetaryResources,
  _agencyFederalAccount,
  _agencyFederalAccountCount,
  _agencyObjectClass,
  _agencyObjectClassCount,
  _agencyObligationsByAwardCategory,
  _agencyProgramActivity,
  _agencyProgramActivityCount,
  _agencySubAgency,
  _agencySubAgencyCount,
  _agencySubComponents,
  _agencyTreasuryAccountObjectClass,
  _agencyTreasuryAccountProgramActivity,
} from "./domains/agency";
import { _spendingByAgency } from "./domains/spending";
import {
  _spendingByState,
  _recipientList,
  _recipientCount,
  _recipientDetail,
  _recipientChildren,
  _stateDetail,
  _stateAwards,
} from "./domains/recipient";
import {
  _autocompleteAwardingAgency,
  _autocompleteFundingAgency,
  _autocompleteAwardingAgencyOffice,
  _autocompleteFundingAgencyOffice,
  _autocompleteCfda,
  _autocompleteCity,
  _autocompleteGlossary,
  _autocompleteLocation,
  _autocompleteNaics,
  _autocompletePsc,
  _autocompleteProgramActivity,
  _autocompleteRecipient,
  _autocompleteAccountsAid,
  _autocompleteAccountsA,
  _autocompleteAccountsAta,
  _autocompleteAccountsBpoa,
  _autocompleteAccountsEpoa,
  _autocompleteAccountsMain,
  _autocompleteAccountsSub,
} from "./domains/autocomplete";
import {
  _refToptierAgencies,
  _refAgency,
  _refAwardTypes,
  _refGlossary,
  _refDefCodes,
  _refNaics,
  _refDataDictionary,
  _refFilterHash,
  _refFilterTreePsc,
  _refFilterTreeTas,
  _refSubmissionPeriods,
  _refTotalBudgetaryResources,
  _refAssistanceListing,
  _refCfdaTotals,
} from "./domains/references";
import {
  _disasterOverview,
  _disasterAwardAmount,
  _disasterAwardCount,
  _disasterAgencySpending,
  _disasterAgencyLoans,
  _disasterAgencyCount,
  _disasterCfdaSpending,
  _disasterCfdaLoans,
  _disasterCfdaCount,
  _disasterDefCodeCount,
  _disasterFederalAccountSpending,
  _disasterFederalAccountLoans,
  _disasterFederalAccountCount,
  _disasterObjectClassSpending,
  _disasterObjectClassLoans,
  _disasterObjectClassCount,
  _disasterRecipientSpending,
  _disasterRecipientLoans,
  _disasterRecipientCount,
  _disasterSpendingByGeography,
} from "./domains/disaster";
import {
  _federalAccountList,
  _federalAccountDetail,
  _federalAccountFiscalYearSnapshot,
  _federalAccountAvailableObjectClasses,
  _federalAccountObjectClasses,
  _federalAccountProgramActivities,
  _federalAccountProgramActivitiesTotal,
} from "./domains/federal-accounts";
import {
  _idvAccounts,
  _idvActivity,
  _idvAmounts,
  _idvChildAwards,
  _idvChildIdvs,
  _idvCountFederalAccount,
  _idvFundingRollup,
  _idvFunding,
} from "./domains/idv";
import {
  _reportingAgenciesOverview,
  _reportingPublishDates,
  _reportingDifferences,
  _reportingDiscrepancies,
  _reportingAgencyOverview,
  _reportingSubmissionHistory,
  _reportingUnlinkedAssistance,
  _reportingUnlinkedProcurement,
} from "./domains/reporting";
import {
  _financialFederalObligations,
  _financialBalances,
  _financialSpendingMajorObjectClass,
  _financialSpendingObjectClass,
} from "./domains/financial";
import {
  _subawardList,
  _subawardByAward,
  _subawardTransactions,
} from "./domains/subawards";
import {
  _budgetFunctionList,
  _budgetFunctionSubfunctions,
} from "./domains/budget-functions";
import {
  _downloadCount,
  _downloadAwards,
  _downloadTransactions,
  _downloadIdv,
  _downloadContract,
  _downloadAssistance,
  _downloadStatus,
  _downloadDisaster,
  _bulkDownloadListAgenciesAccounts,
  _bulkDownloadListAgenciesAwards,
  _bulkDownloadListMonthlyFiles,
  _bulkDownloadAwards,
  _bulkDownloadStatus,
} from "./domains/downloads";
import { describe } from "./describe";
import { toNumber, buildFilters } from "./plugin-helpers";
import { USAValidationError } from "./errors";

function requireParam(params: Record<string, unknown> | undefined, name: string): string {
  const val = params?.[name];
  if (val == null) throw new USAValidationError(name, undefined, "required");
  return String(val);
}

function toOrder(val: unknown): "asc" | "desc" | undefined {
  if (val == null) return undefined;
  const s = String(val);
  if (s !== "asc" && s !== "desc") throw new USAValidationError("order", val, "one of: asc, desc");
  return s;
}

function requireEnum<T extends string>(params: Record<string, unknown> | undefined, name: string, values: readonly T[]): T {
  const val = requireParam(params, name);
  if (!values.includes(val as T)) throw new USAValidationError(name, val, `one of: ${values.join(", ")}`);
  return val as T;
}

function requireNumber(params: Record<string, unknown> | undefined, name: string): number {
  const val = params?.[name];
  if (val == null) throw new USAValidationError(name, undefined, "required");
  const n = Number(val);
  if (!Number.isFinite(n)) throw new USAValidationError(name, val, "a valid number");
  return n;
}

async function awards(params?: Record<string, unknown>): Promise<GovResult> {
  const filters = params ? buildFilters(params) : {};
  return _searchAwards({
    filters,
    page: toNumber(params?.page),
    limit: toNumber(params?.limit),
    sort: params?.sort != null ? String(params.sort) : undefined,
    order: toOrder(params?.order),
  });
}

async function award(params?: Record<string, unknown>): Promise<GovResult> {
  const id = requireParam(params, "id");
  return _findAward(id);
}

async function agency(params?: Record<string, unknown>): Promise<GovResult> {
  const toptierCode = requireParam(params, "toptier_code");
  return _agencyOverview(toptierCode);
}

const SPENDING_BY_AGENCY_TYPES = ["agency", "federal_account", "object_class", "budget_function", "budget_subfunction", "recipient", "award", "program_activity"] as const;
const SPENDING_TIME_GROUPS = ["fiscal_year", "quarter", "month"] as const;

async function spending_by_agency(params?: Record<string, unknown>): Promise<GovResult> {
  return _spendingByAgency({
    type: requireEnum(params, "type", SPENDING_BY_AGENCY_TYPES) as any,
    filters: {
      fy: requireParam(params, "fy"),
      period: params?.period != null ? String(params.period) : undefined,
      quarter: params?.quarter != null ? String(params.quarter) : undefined,
    },
  });
}

async function spending_by_state(): Promise<GovResult> {
  return _spendingByState();
}

async function spending_over_time(params?: Record<string, unknown>): Promise<GovResult> {
  const filters = params ? buildFilters(params) : {};
  return _spendingOverTime({
    group: requireEnum(params, "group", SPENDING_TIME_GROUPS) as any,
    filters,
  });
}

// --- New search endpoints ---

async function award_count(params?: Record<string, unknown>): Promise<GovResult> {
  const filters = params ? buildFilters(params) : {};
  return _spendingByAwardCount({ filters });
}

function makeCategoryEndpoint(subPath: CategorySubPath) {
  return async (params?: Record<string, unknown>): Promise<GovResult> => {
    const filters = params ? buildFilters(params) : {};
    return _spendingByCategory(subPath, {
      filters,
      limit: toNumber(params?.limit),
      page: toNumber(params?.page),
    });
  };
}

async function spending_by_geography(params?: Record<string, unknown>): Promise<GovResult> {
  const filters = params ? buildFilters(params) : {};
  return _spendingByGeography({
    filters,
    scope: params?.scope != null ? String(params.scope) as any : undefined,
    geo_layer: params?.geo_layer != null ? String(params.geo_layer) as any : undefined,
  });
}

async function transactions(params?: Record<string, unknown>): Promise<GovResult> {
  const filters = params ? buildFilters(params) : {};
  return _spendingByTransaction({
    filters,
    page: toNumber(params?.page),
    limit: toNumber(params?.limit),
    sort: params?.sort != null ? String(params.sort) : undefined,
    order: toOrder(params?.order),
  });
}

async function transaction_count(params?: Record<string, unknown>): Promise<GovResult> {
  const filters = params ? buildFilters(params) : {};
  return _spendingByTransactionCount({ filters });
}

async function transaction_grouped(params?: Record<string, unknown>): Promise<GovResult> {
  const filters = params ? buildFilters(params) : {};
  return _spendingByTransactionGrouped({
    filters,
    page: toNumber(params?.page),
    limit: toNumber(params?.limit),
    sort: params?.sort != null ? String(params.sort) : undefined,
    order: toOrder(params?.order),
  });
}

async function subaward_grouped(params?: Record<string, unknown>): Promise<GovResult> {
  const filters = params ? buildFilters(params) : {};
  return _spendingBySubawardGrouped({
    filters,
    page: toNumber(params?.page),
    limit: toNumber(params?.limit),
    sort: params?.sort != null ? String(params.sort) : undefined,
    order: toOrder(params?.order),
  });
}

async function new_awards_over_time(params?: Record<string, unknown>): Promise<GovResult> {
  const filters = params ? buildFilters(params) : {};
  return _newAwardsOverTime({
    group: requireEnum(params, "group", SPENDING_TIME_GROUPS) as any,
    filters,
  });
}

async function transaction_spending_summary(params?: Record<string, unknown>): Promise<GovResult> {
  const filters = params ? buildFilters(params) : {};
  return _transactionSpendingSummary({ filters });
}

// --- Recipient endpoints ---

async function recipient_list(params?: Record<string, unknown>): Promise<GovResult> {
  return _recipientList({
    keyword: params?.keyword != null ? String(params.keyword) : undefined,
    award_type: params?.award_type != null ? String(params.award_type) : undefined,
    page: toNumber(params?.page),
    limit: toNumber(params?.limit),
    sort: params?.sort != null ? String(params.sort) : undefined,
    order: toOrder(params?.order),
  });
}

async function recipient_count(params?: Record<string, unknown>): Promise<GovResult> {
  return _recipientCount({
    keyword: params?.keyword != null ? String(params.keyword) : undefined,
    award_type: params?.award_type != null ? String(params.award_type) : undefined,
  });
}

async function recipient_detail(params?: Record<string, unknown>): Promise<GovResult> {
  return _recipientDetail(requireParam(params, "recipient_id"), {
    year: params?.year != null ? String(params.year) : undefined,
  });
}

async function recipient_children(params?: Record<string, unknown>): Promise<GovResult> {
  return _recipientChildren(requireParam(params, "recipient_id"), {
    year: params?.year != null ? String(params.year) : undefined,
  });
}

async function state_detail(params?: Record<string, unknown>): Promise<GovResult> {
  return _stateDetail(requireParam(params, "fips"), {
    year: toNumber(params?.year),
  });
}

async function state_awards(params?: Record<string, unknown>): Promise<GovResult> {
  return _stateAwards(requireParam(params, "fips"), {
    year: toNumber(params?.year),
  });
}

// --- Autocomplete endpoints ---

function makeAutocompleteEndpoint(fn: (params: { search_text: string; limit?: number }, options?: any) => Promise<GovResult>) {
  return async (params?: Record<string, unknown>): Promise<GovResult> => {
    return fn({
      search_text: requireParam(params, "search_text"),
      limit: toNumber(params?.limit),
    });
  };
}

// --- References endpoints ---

async function ref_toptier_agencies(params?: Record<string, unknown>): Promise<GovResult> {
  return _refToptierAgencies({
    sort: params?.sort != null ? String(params.sort) : undefined,
    order: toOrder(params?.order),
  });
}

async function ref_agency(params?: Record<string, unknown>): Promise<GovResult> {
  return _refAgency(requireNumber(params, "agency_id"));
}

async function ref_glossary(params?: Record<string, unknown>): Promise<GovResult> {
  return _refGlossary({
    page: toNumber(params?.page),
    limit: toNumber(params?.limit),
  });
}

async function ref_naics(params?: Record<string, unknown>): Promise<GovResult> {
  return _refNaics({
    code: params?.code != null ? String(params.code) : undefined,
  });
}

async function ref_filter_hash(params?: Record<string, unknown>): Promise<GovResult> {
  const filters = params ? buildFilters(params) : {};
  return _refFilterHash(filters);
}

async function ref_filter_tree_psc(params?: Record<string, unknown>): Promise<GovResult> {
  return _refFilterTreePsc({
    depth: toNumber(params?.depth),
    filter: params?.filter != null ? String(params.filter) : undefined,
  });
}

async function ref_filter_tree_tas(params?: Record<string, unknown>): Promise<GovResult> {
  return _refFilterTreeTas({
    depth: toNumber(params?.depth),
    filter: params?.filter != null ? String(params.filter) : undefined,
  });
}

async function ref_cfda_totals(params?: Record<string, unknown>): Promise<GovResult> {
  return _refCfdaTotals({
    cfda: params?.cfda != null ? String(params.cfda) : undefined,
  });
}

// --- Agency endpoints ---

async function agency_awards(params?: Record<string, unknown>): Promise<GovResult> {
  return _agencyAwards(requireParam(params, "toptier_code"), {
    fiscal_year: toNumber(params?.fiscal_year),
  });
}

async function agency_new_award_count(params?: Record<string, unknown>): Promise<GovResult> {
  return _agencyNewAwardCount(requireParam(params, "toptier_code"), {
    fiscal_year: toNumber(params?.fiscal_year),
  });
}

async function agency_awards_count(params?: Record<string, unknown>): Promise<GovResult> {
  return _agencyAwardsCount({
    fiscal_year: toNumber(params?.fiscal_year),
  });
}

async function agency_budget_function(params?: Record<string, unknown>): Promise<GovResult> {
  return _agencyBudgetFunction(requireParam(params, "toptier_code"), {
    fiscal_year: toNumber(params?.fiscal_year),
  });
}

async function agency_budget_function_count(params?: Record<string, unknown>): Promise<GovResult> {
  return _agencyBudgetFunctionCount(requireParam(params, "toptier_code"), {
    fiscal_year: toNumber(params?.fiscal_year),
  });
}

async function agency_budgetary_resources(params?: Record<string, unknown>): Promise<GovResult> {
  return _agencyBudgetaryResources(requireParam(params, "toptier_code"));
}

function makeAgencyPaginatedEndpoint(
  fn: (toptierCode: string, params?: any, options?: any) => Promise<GovResult>,
) {
  return async (params?: Record<string, unknown>): Promise<GovResult> => {
    return fn(requireParam(params, "toptier_code"), {
      fiscal_year: toNumber(params?.fiscal_year),
      page: toNumber(params?.page),
      limit: toNumber(params?.limit),
      order: toOrder(params?.order),
      sort: params?.sort != null ? String(params.sort) : undefined,
    });
  };
}

async function agency_federal_account_count(params?: Record<string, unknown>): Promise<GovResult> {
  return _agencyFederalAccountCount(requireParam(params, "toptier_code"), {
    fiscal_year: toNumber(params?.fiscal_year),
  });
}

async function agency_object_class_count(params?: Record<string, unknown>): Promise<GovResult> {
  return _agencyObjectClassCount(requireParam(params, "toptier_code"), {
    fiscal_year: toNumber(params?.fiscal_year),
  });
}

async function agency_obligations_by_award_category(params?: Record<string, unknown>): Promise<GovResult> {
  return _agencyObligationsByAwardCategory(requireParam(params, "toptier_code"), {
    fiscal_year: toNumber(params?.fiscal_year),
  });
}

async function agency_program_activity_count(params?: Record<string, unknown>): Promise<GovResult> {
  return _agencyProgramActivityCount(requireParam(params, "toptier_code"), {
    fiscal_year: toNumber(params?.fiscal_year),
  });
}

async function agency_sub_agency_count(params?: Record<string, unknown>): Promise<GovResult> {
  return _agencySubAgencyCount(requireParam(params, "toptier_code"), {
    fiscal_year: toNumber(params?.fiscal_year),
  });
}

async function agency_treasury_account_object_class(params?: Record<string, unknown>): Promise<GovResult> {
  return _agencyTreasuryAccountObjectClass(
    requireParam(params, "toptier_code"),
    requireParam(params, "account_code"),
    { fiscal_year: toNumber(params?.fiscal_year), page: toNumber(params?.page), limit: toNumber(params?.limit) },
  );
}

async function agency_treasury_account_program_activity(params?: Record<string, unknown>): Promise<GovResult> {
  return _agencyTreasuryAccountProgramActivity(
    requireParam(params, "toptier_code"),
    requireParam(params, "account_code"),
    { fiscal_year: toNumber(params?.fiscal_year), page: toNumber(params?.page), limit: toNumber(params?.limit) },
  );
}

// --- Disaster endpoint factory ---

function makeDisasterEndpoint(fn: (params?: any, options?: any) => Promise<GovResult>) {
  return async (params?: Record<string, unknown>): Promise<GovResult> => {
    return fn({
      def_codes: params?.def_codes != null ? String(params.def_codes).split(",").map(s => s.trim()) : undefined,
      spending_type: params?.spending_type != null ? String(params.spending_type) : undefined,
      sort: params?.sort != null ? String(params.sort) : undefined,
      order: toOrder(params?.order),
      page: toNumber(params?.page),
      limit: toNumber(params?.limit),
    });
  };
}

// Build category endpoint map
const categoryEndpoints: Record<string, (params?: Record<string, unknown>) => Promise<GovResult>> = {};
for (const subPath of CATEGORY_SUB_PATHS) {
  categoryEndpoints[`category_${subPath}`] = makeCategoryEndpoint(subPath);
}

export const usaspendingPlugin: GovDataPlugin = {
  prefix: "usaspending",
  describe,
  endpoints: {
    awards,
    award,
    award_accounts: async (params?: Record<string, unknown>): Promise<GovResult> => {
      return _awardAccounts(requireParam(params, "id"), {
        page: toNumber(params?.page),
        limit: toNumber(params?.limit),
      });
    },
    award_count_federal_account: async (params?: Record<string, unknown>): Promise<GovResult> => {
      return _awardCountFederalAccount(requireParam(params, "id"));
    },
    award_count_subaward: async (params?: Record<string, unknown>): Promise<GovResult> => {
      return _awardCountSubaward(requireParam(params, "id"));
    },
    award_count_transaction: async (params?: Record<string, unknown>): Promise<GovResult> => {
      return _awardCountTransaction(requireParam(params, "id"));
    },
    award_funding: async (params?: Record<string, unknown>): Promise<GovResult> => {
      return _awardFunding(requireParam(params, "id"), {
        page: toNumber(params?.page),
        limit: toNumber(params?.limit),
      });
    },
    award_funding_rollup: async (params?: Record<string, unknown>): Promise<GovResult> => {
      return _awardFundingRollup(requireParam(params, "id"));
    },
    award_last_updated: async (): Promise<GovResult> => {
      return _awardLastUpdated();
    },
    award_spending_recipient: async (params?: Record<string, unknown>): Promise<GovResult> => {
      return _awardSpendingRecipient({
        awarding_agency_id: toNumber(params?.awarding_agency_id),
        fiscal_year: toNumber(params?.fiscal_year),
        page: toNumber(params?.page),
        limit: toNumber(params?.limit),
      });
    },
    agency,
    agency_awards,
    agency_new_award_count,
    agency_awards_count,
    agency_budget_function,
    agency_budget_function_count,
    agency_budgetary_resources,
    agency_federal_account: makeAgencyPaginatedEndpoint(_agencyFederalAccount),
    agency_federal_account_count,
    agency_object_class: makeAgencyPaginatedEndpoint(_agencyObjectClass),
    agency_object_class_count,
    agency_obligations_by_award_category,
    agency_program_activity: makeAgencyPaginatedEndpoint(_agencyProgramActivity),
    agency_program_activity_count,
    agency_sub_agency: makeAgencyPaginatedEndpoint(_agencySubAgency),
    agency_sub_agency_count,
    agency_sub_components: makeAgencyPaginatedEndpoint(_agencySubComponents),
    agency_treasury_account_object_class,
    agency_treasury_account_program_activity,
    spending_by_agency,
    spending_by_state,
    spending_over_time,
    recipient_list,
    recipient_count,
    recipient_detail,
    recipient_children,
    state_detail,
    state_awards,
    autocomplete_awarding_agency: makeAutocompleteEndpoint(_autocompleteAwardingAgency),
    autocomplete_funding_agency: makeAutocompleteEndpoint(_autocompleteFundingAgency),
    autocomplete_awarding_agency_office: makeAutocompleteEndpoint(_autocompleteAwardingAgencyOffice),
    autocomplete_funding_agency_office: makeAutocompleteEndpoint(_autocompleteFundingAgencyOffice),
    autocomplete_cfda: makeAutocompleteEndpoint(_autocompleteCfda),
    autocomplete_city: async (params?: Record<string, unknown>): Promise<GovResult> => {
      return _autocompleteCity({
        search_text: requireParam(params, "search_text"),
        limit: toNumber(params?.limit),
        filter: params?.country_code != null ? { country_code: String(params.country_code), scope: String(params.scope ?? "recipient_location") } : undefined,
      });
    },
    autocomplete_glossary: makeAutocompleteEndpoint(_autocompleteGlossary),
    autocomplete_location: makeAutocompleteEndpoint(_autocompleteLocation),
    autocomplete_naics: makeAutocompleteEndpoint(_autocompleteNaics),
    autocomplete_psc: makeAutocompleteEndpoint(_autocompletePsc),
    autocomplete_program_activity: makeAutocompleteEndpoint(_autocompleteProgramActivity),
    autocomplete_recipient: makeAutocompleteEndpoint(_autocompleteRecipient),
    autocomplete_accounts_aid: async (params?: Record<string, unknown>): Promise<GovResult> => {
      const filters: Record<string, string> = {};
      for (const key of ["aid", "ata", "main", "sub", "bpoa", "epoa", "a"]) {
        if (params?.[key] != null) filters[key] = String(params[key]);
      }
      return _autocompleteAccountsAid({ filters });
    },
    autocomplete_accounts_a: async (params?: Record<string, unknown>): Promise<GovResult> => {
      const filters: Record<string, string> = {};
      if (params?.search_text != null) filters.search_text = String(params.search_text);
      return _autocompleteAccountsA({ filters });
    },
    autocomplete_accounts_ata: async (params?: Record<string, unknown>): Promise<GovResult> => {
      const filters: Record<string, string> = {};
      if (params?.search_text != null) filters.search_text = String(params.search_text);
      return _autocompleteAccountsAta({ filters });
    },
    autocomplete_accounts_bpoa: async (params?: Record<string, unknown>): Promise<GovResult> => {
      const filters: Record<string, string> = {};
      if (params?.search_text != null) filters.search_text = String(params.search_text);
      return _autocompleteAccountsBpoa({ filters });
    },
    autocomplete_accounts_epoa: async (params?: Record<string, unknown>): Promise<GovResult> => {
      const filters: Record<string, string> = {};
      if (params?.search_text != null) filters.search_text = String(params.search_text);
      return _autocompleteAccountsEpoa({ filters });
    },
    autocomplete_accounts_main: async (params?: Record<string, unknown>): Promise<GovResult> => {
      const filters: Record<string, string> = {};
      if (params?.search_text != null) filters.search_text = String(params.search_text);
      return _autocompleteAccountsMain({ filters });
    },
    autocomplete_accounts_sub: async (params?: Record<string, unknown>): Promise<GovResult> => {
      const filters: Record<string, string> = {};
      if (params?.search_text != null) filters.search_text = String(params.search_text);
      return _autocompleteAccountsSub({ filters });
    },
    ref_toptier_agencies,
    ref_agency,
    ref_award_types: async (): Promise<GovResult> => _refAwardTypes(),
    ref_glossary,
    ref_def_codes: async (): Promise<GovResult> => _refDefCodes(),
    ref_naics,
    ref_data_dictionary: async (): Promise<GovResult> => _refDataDictionary(),
    ref_filter_hash,
    ref_filter_tree_psc,
    ref_filter_tree_tas,
    ref_submission_periods: async (): Promise<GovResult> => _refSubmissionPeriods(),
    ref_total_budgetary_resources: async (): Promise<GovResult> => _refTotalBudgetaryResources(),
    ref_assistance_listing: async (): Promise<GovResult> => _refAssistanceListing(),
    ref_cfda_totals,
    award_count,
    ...categoryEndpoints,
    spending_by_geography,
    transactions,
    transaction_count,
    transaction_grouped,
    subaward_grouped,
    new_awards_over_time,
    transaction_spending_summary,

    // --- Disaster endpoints ---
    disaster_overview: async (): Promise<GovResult> => _disasterOverview(),
    disaster_award_amount: makeDisasterEndpoint(_disasterAwardAmount),
    disaster_award_count: makeDisasterEndpoint(_disasterAwardCount),
    disaster_agency_spending: makeDisasterEndpoint(_disasterAgencySpending),
    disaster_agency_loans: makeDisasterEndpoint(_disasterAgencyLoans),
    disaster_agency_count: makeDisasterEndpoint(_disasterAgencyCount),
    disaster_cfda_spending: makeDisasterEndpoint(_disasterCfdaSpending),
    disaster_cfda_loans: makeDisasterEndpoint(_disasterCfdaLoans),
    disaster_cfda_count: makeDisasterEndpoint(_disasterCfdaCount),
    disaster_def_code_count: makeDisasterEndpoint(_disasterDefCodeCount),
    disaster_federal_account_spending: makeDisasterEndpoint(_disasterFederalAccountSpending),
    disaster_federal_account_loans: makeDisasterEndpoint(_disasterFederalAccountLoans),
    disaster_federal_account_count: makeDisasterEndpoint(_disasterFederalAccountCount),
    disaster_object_class_spending: makeDisasterEndpoint(_disasterObjectClassSpending),
    disaster_object_class_loans: makeDisasterEndpoint(_disasterObjectClassLoans),
    disaster_object_class_count: makeDisasterEndpoint(_disasterObjectClassCount),
    disaster_recipient_spending: makeDisasterEndpoint(_disasterRecipientSpending),
    disaster_recipient_loans: makeDisasterEndpoint(_disasterRecipientLoans),
    disaster_recipient_count: makeDisasterEndpoint(_disasterRecipientCount),
    disaster_spending_by_geography: async (params?: Record<string, unknown>): Promise<GovResult> => {
      return _disasterSpendingByGeography({
        def_codes: params?.def_codes != null ? String(params.def_codes).split(",").map(s => s.trim()) : undefined,
        spending_type: params?.spending_type != null ? String(params.spending_type) : undefined,
        geo_layer: params?.geo_layer != null ? String(params.geo_layer) : undefined,
        scope: params?.scope != null ? String(params.scope) : undefined,
      });
    },

    // --- Federal accounts endpoints ---
    federal_account_list: async (params?: Record<string, unknown>): Promise<GovResult> => {
      return _federalAccountList({
        keyword: params?.keyword != null ? String(params.keyword) : undefined,
        page: toNumber(params?.page),
        limit: toNumber(params?.limit),
        sort_field: params?.sort_field != null ? String(params.sort_field) : undefined,
        sort_direction: params?.sort_direction != null ? String(params.sort_direction) : undefined,
      });
    },
    federal_account_detail: async (params?: Record<string, unknown>): Promise<GovResult> => {
      return _federalAccountDetail(requireNumber(params, "id"));
    },
    federal_account_fiscal_year_snapshot: async (params?: Record<string, unknown>): Promise<GovResult> => {
      return _federalAccountFiscalYearSnapshot(requireNumber(params, "id"), toNumber(params?.fy));
    },
    federal_account_available_object_classes: async (params?: Record<string, unknown>): Promise<GovResult> => {
      return _federalAccountAvailableObjectClasses(requireNumber(params, "id"));
    },
    federal_account_object_classes: async (params?: Record<string, unknown>): Promise<GovResult> => {
      return _federalAccountObjectClasses(requireNumber(params, "id"), {
        page: toNumber(params?.page),
        limit: toNumber(params?.limit),
      });
    },
    federal_account_program_activities: async (params?: Record<string, unknown>): Promise<GovResult> => {
      return _federalAccountProgramActivities(requireNumber(params, "id"), {
        page: toNumber(params?.page),
        limit: toNumber(params?.limit),
      });
    },
    federal_account_program_activities_total: async (params?: Record<string, unknown>): Promise<GovResult> => {
      return _federalAccountProgramActivitiesTotal(requireNumber(params, "id"), {
        page: toNumber(params?.page),
        limit: toNumber(params?.limit),
      });
    },

    // --- IDV endpoints ---
    idv_accounts: async (params?: Record<string, unknown>): Promise<GovResult> => {
      return _idvAccounts({
        award_id: requireNumber(params, "award_id"),
        page: toNumber(params?.page),
        limit: toNumber(params?.limit),
        sort: params?.sort != null ? String(params.sort) : undefined,
        order: toOrder(params?.order),
      });
    },
    idv_activity: async (params?: Record<string, unknown>): Promise<GovResult> => {
      return _idvActivity({
        award_id: requireNumber(params, "award_id"),
        page: toNumber(params?.page),
        limit: toNumber(params?.limit),
      });
    },
    idv_amounts: async (params?: Record<string, unknown>): Promise<GovResult> => {
      return _idvAmounts(requireParam(params, "award_id"));
    },
    idv_child_awards: async (params?: Record<string, unknown>): Promise<GovResult> => {
      return _idvChildAwards({
        award_id: requireNumber(params, "award_id"),
        page: toNumber(params?.page),
        limit: toNumber(params?.limit),
        sort: params?.sort != null ? String(params.sort) : undefined,
        order: toOrder(params?.order),
      });
    },
    idv_child_idvs: async (params?: Record<string, unknown>): Promise<GovResult> => {
      return _idvChildIdvs({
        award_id: requireNumber(params, "award_id"),
        page: toNumber(params?.page),
        limit: toNumber(params?.limit),
        sort: params?.sort != null ? String(params.sort) : undefined,
        order: toOrder(params?.order),
      });
    },
    idv_count_federal_account: async (params?: Record<string, unknown>): Promise<GovResult> => {
      return _idvCountFederalAccount(requireParam(params, "award_id"));
    },
    idv_funding_rollup: async (params?: Record<string, unknown>): Promise<GovResult> => {
      return _idvFundingRollup(requireParam(params, "award_id"));
    },
    idv_funding: async (params?: Record<string, unknown>): Promise<GovResult> => {
      return _idvFunding({
        award_id: requireNumber(params, "award_id"),
        page: toNumber(params?.page),
        limit: toNumber(params?.limit),
        sort: params?.sort != null ? String(params.sort) : undefined,
        order: toOrder(params?.order),
        piid: params?.piid != null ? String(params.piid) : undefined,
      });
    },

    // --- Reporting endpoints ---
    reporting_agencies_overview: async (params?: Record<string, unknown>): Promise<GovResult> => {
      return _reportingAgenciesOverview({
        page: toNumber(params?.page),
        limit: toNumber(params?.limit),
        sort: params?.sort != null ? String(params.sort) : undefined,
        order: toOrder(params?.order),
        fiscal_year: toNumber(params?.fiscal_year),
        fiscal_period: toNumber(params?.fiscal_period),
        filter: params?.filter != null ? String(params.filter) : undefined,
      });
    },
    reporting_publish_dates: async (params?: Record<string, unknown>): Promise<GovResult> => {
      return _reportingPublishDates({
        page: toNumber(params?.page),
        limit: toNumber(params?.limit),
        sort: params?.sort != null ? String(params.sort) : undefined,
        order: toOrder(params?.order),
        fiscal_year: toNumber(params?.fiscal_year),
        fiscal_period: toNumber(params?.fiscal_period),
        filter: params?.filter != null ? String(params.filter) : undefined,
      });
    },
    reporting_differences: async (params?: Record<string, unknown>): Promise<GovResult> => {
      return _reportingDifferences(
        requireParam(params, "toptier_code"),
        requireNumber(params, "fiscal_year"),
        requireNumber(params, "fiscal_period"),
        {
          page: toNumber(params?.page),
          limit: toNumber(params?.limit),
          sort: params?.sort != null ? String(params.sort) : undefined,
          order: toOrder(params?.order),
        },
      );
    },
    reporting_discrepancies: async (params?: Record<string, unknown>): Promise<GovResult> => {
      return _reportingDiscrepancies(
        requireParam(params, "toptier_code"),
        requireNumber(params, "fiscal_year"),
        requireNumber(params, "fiscal_period"),
        {
          page: toNumber(params?.page),
          limit: toNumber(params?.limit),
          sort: params?.sort != null ? String(params.sort) : undefined,
          order: toOrder(params?.order),
        },
      );
    },
    reporting_agency_overview: async (params?: Record<string, unknown>): Promise<GovResult> => {
      return _reportingAgencyOverview(
        requireParam(params, "toptier_code"),
        {
          page: toNumber(params?.page),
          limit: toNumber(params?.limit),
          sort: params?.sort != null ? String(params.sort) : undefined,
          order: toOrder(params?.order),
        },
      );
    },
    reporting_submission_history: async (params?: Record<string, unknown>): Promise<GovResult> => {
      return _reportingSubmissionHistory(
        requireParam(params, "toptier_code"),
        requireNumber(params, "fiscal_year"),
        requireNumber(params, "fiscal_period"),
        {
          page: toNumber(params?.page),
          limit: toNumber(params?.limit),
          sort: params?.sort != null ? String(params.sort) : undefined,
          order: toOrder(params?.order),
        },
      );
    },
    reporting_unlinked_assistance: async (params?: Record<string, unknown>): Promise<GovResult> => {
      return _reportingUnlinkedAssistance(
        requireParam(params, "toptier_code"),
        requireNumber(params, "fiscal_year"),
        requireNumber(params, "fiscal_period"),
      );
    },
    reporting_unlinked_procurement: async (params?: Record<string, unknown>): Promise<GovResult> => {
      return _reportingUnlinkedProcurement(
        requireParam(params, "toptier_code"),
        requireNumber(params, "fiscal_year"),
        requireNumber(params, "fiscal_period"),
      );
    },

    // --- Financial endpoints ---
    financial_federal_obligations: async (params?: Record<string, unknown>): Promise<GovResult> => {
      return _financialFederalObligations({
        funding_agency_id: requireNumber(params, "funding_agency_id"),
        fiscal_year: requireNumber(params, "fiscal_year"),
        page: toNumber(params?.page),
        limit: toNumber(params?.limit),
      });
    },
    financial_balances: async (params?: Record<string, unknown>): Promise<GovResult> => {
      return _financialBalances({
        funding_agency_id: requireNumber(params, "funding_agency_id"),
        fiscal_year: requireNumber(params, "fiscal_year"),
        page: toNumber(params?.page),
        limit: toNumber(params?.limit),
      });
    },
    financial_spending_major_object_class: async (params?: Record<string, unknown>): Promise<GovResult> => {
      return _financialSpendingMajorObjectClass({
        fiscal_year: requireNumber(params, "fiscal_year"),
        funding_agency_id: requireNumber(params, "funding_agency_id"),
        page: toNumber(params?.page),
        limit: toNumber(params?.limit),
      });
    },
    financial_spending_object_class: async (params?: Record<string, unknown>): Promise<GovResult> => {
      return _financialSpendingObjectClass({
        fiscal_year: requireNumber(params, "fiscal_year"),
        funding_agency_id: requireNumber(params, "funding_agency_id"),
        major_object_class_code: toNumber(params?.major_object_class_code),
        page: toNumber(params?.page),
        limit: toNumber(params?.limit),
      });
    },

    // --- Subaward endpoints ---
    subaward_list: async (params?: Record<string, unknown>): Promise<GovResult> => {
      return _subawardList({
        page: toNumber(params?.page),
        limit: toNumber(params?.limit),
        sort: params?.sort != null ? String(params.sort) : undefined,
        order: toOrder(params?.order),
        keyword: params?.keyword != null ? String(params.keyword) : undefined,
        award_id: params?.award_id != null ? String(params.award_id) : undefined,
      });
    },
    subaward_by_award: async (params?: Record<string, unknown>): Promise<GovResult> => {
      return _subawardByAward({
        award_id: requireParam(params, "award_id"),
        page: toNumber(params?.page),
        limit: toNumber(params?.limit),
        sort: params?.sort != null ? String(params.sort) : undefined,
        order: toOrder(params?.order),
      });
    },
    subaward_transactions: async (params?: Record<string, unknown>): Promise<GovResult> => {
      return _subawardTransactions({
        award_id: requireNumber(params, "award_id"),
        page: toNumber(params?.page),
        limit: toNumber(params?.limit),
        sort: params?.sort != null ? String(params.sort) : undefined,
        order: toOrder(params?.order),
      });
    },

    // --- Budget functions endpoints ---
    budget_function_list: async (): Promise<GovResult> => {
      return _budgetFunctionList();
    },
    budget_function_subfunctions: async (params?: Record<string, unknown>): Promise<GovResult> => {
      return _budgetFunctionSubfunctions(requireParam(params, "budget_function_code"));
    },

    // --- Download endpoints ---
    download_count: async (params?: Record<string, unknown>): Promise<GovResult> => {
      const filters = params ? buildFilters(params) : {};
      return _downloadCount({ filters });
    },
    download_awards: async (params?: Record<string, unknown>): Promise<GovResult> => {
      const filters = params ? buildFilters(params) : {};
      return _downloadAwards({
        filters,
        columns: params?.columns != null ? String(params.columns).split(",").map(s => s.trim()) : undefined,
        file_format: params?.file_format != null ? String(params.file_format) as "csv" | "tsv" : undefined,
      });
    },
    download_transactions: async (params?: Record<string, unknown>): Promise<GovResult> => {
      const filters = params ? buildFilters(params) : {};
      return _downloadTransactions({
        filters,
        columns: params?.columns != null ? String(params.columns).split(",").map(s => s.trim()) : undefined,
        file_format: params?.file_format != null ? String(params.file_format) as "csv" | "tsv" : undefined,
      });
    },
    download_idv: async (params?: Record<string, unknown>): Promise<GovResult> => {
      return _downloadIdv({
        award_id: requireNumber(params, "award_id"),
        columns: params?.columns != null ? String(params.columns).split(",").map(s => s.trim()) : undefined,
        file_format: params?.file_format != null ? String(params.file_format) as "csv" | "tsv" : undefined,
      });
    },
    download_contract: async (params?: Record<string, unknown>): Promise<GovResult> => {
      return _downloadContract({
        award_id: requireNumber(params, "award_id"),
        columns: params?.columns != null ? String(params.columns).split(",").map(s => s.trim()) : undefined,
        file_format: params?.file_format != null ? String(params.file_format) as "csv" | "tsv" : undefined,
      });
    },
    download_assistance: async (params?: Record<string, unknown>): Promise<GovResult> => {
      return _downloadAssistance({
        award_id: requireNumber(params, "award_id"),
        columns: params?.columns != null ? String(params.columns).split(",").map(s => s.trim()) : undefined,
        file_format: params?.file_format != null ? String(params.file_format) as "csv" | "tsv" : undefined,
      });
    },
    download_status: async (params?: Record<string, unknown>): Promise<GovResult> => {
      return _downloadStatus(requireParam(params, "file_name"));
    },
    download_disaster: async (params?: Record<string, unknown>): Promise<GovResult> => {
      const def_codes = params?.def_codes != null
        ? String(params.def_codes).split(",").map(s => s.trim())
        : ["L", "M", "N", "O", "P", "U", "V"];
      return _downloadDisaster({ filters: { def_codes } });
    },
    bulk_download_list_agencies_accounts: async (): Promise<GovResult> => {
      return _bulkDownloadListAgenciesAccounts();
    },
    bulk_download_list_agencies_awards: async (): Promise<GovResult> => {
      return _bulkDownloadListAgenciesAwards();
    },
    bulk_download_list_monthly_files: async (params?: Record<string, unknown>): Promise<GovResult> => {
      const agencyRaw = requireParam(params, "agency");
      return _bulkDownloadListMonthlyFiles({
        agency: agencyRaw === "all" ? "all" : requireNumber(params, "agency"),
        fiscal_year: requireNumber(params, "fiscal_year"),
        type: requireParam(params, "type") as any,
      });
    },
    bulk_download_awards: async (params?: Record<string, unknown>): Promise<GovResult> => {
      const filters = params ? buildFilters(params) : {};
      return _bulkDownloadAwards({
        filters,
        file_format: params?.file_format != null ? String(params.file_format) as "csv" | "tsv" : undefined,
      });
    },
    bulk_download_status: async (params?: Record<string, unknown>): Promise<GovResult> => {
      return _bulkDownloadStatus(requireParam(params, "file_name"));
    },
  },
};
