import { withPagination } from "govdata-core";
import type { ClientOptions } from "govdata-core";
import type {
  AwardSearchParams,
  SpendingOverTimeParams,
  CategoryParams,
  GeographyParams,
} from "./domains/search";
import type { SpendingByAgencyParams } from "./domains/spending";
import {
  _searchAwards, _spendingOverTime,
  _spendingByAwardCount, _spendingByCategory,
  _spendingByGeography, _spendingByTransaction,
  _spendingByTransactionCount, _spendingByTransactionGrouped,
  _spendingBySubawardGrouped, _newAwardsOverTime,
  _transactionSpendingSummary,
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
import type { DisasterFilterParams } from "./domains/disaster";
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

export function createUSASpending(defaultOptions?: ClientOptions) {
  return {
    awards: {
      search: withPagination(
        (params?: AwardSearchParams, options?: ClientOptions) =>
          _searchAwards(params, { ...defaultOptions, ...options }),
      ),
      find: (id: string, options?: ClientOptions) =>
        _findAward(id, { ...defaultOptions, ...options }),
      accounts: (id: string, params?: { page?: number; limit?: number }, options?: ClientOptions) =>
        _awardAccounts(id, params, { ...defaultOptions, ...options }),
      countFederalAccount: (id: string, options?: ClientOptions) =>
        _awardCountFederalAccount(id, { ...defaultOptions, ...options }),
      countSubaward: (id: string, options?: ClientOptions) =>
        _awardCountSubaward(id, { ...defaultOptions, ...options }),
      countTransaction: (id: string, options?: ClientOptions) =>
        _awardCountTransaction(id, { ...defaultOptions, ...options }),
      funding: (id: string, params?: { page?: number; limit?: number }, options?: ClientOptions) =>
        _awardFunding(id, params, { ...defaultOptions, ...options }),
      fundingRollup: (id: string, options?: ClientOptions) =>
        _awardFundingRollup(id, { ...defaultOptions, ...options }),
      lastUpdated: (options?: ClientOptions) =>
        _awardLastUpdated({ ...defaultOptions, ...options }),
      spendingByRecipient: (params?: { awarding_agency_id?: number; fiscal_year?: number; page?: number; limit?: number }, options?: ClientOptions) =>
        _awardSpendingRecipient(params, { ...defaultOptions, ...options }),
    },
    agencies: {
      overview: (toptierCode: string, options?: ClientOptions) =>
        _agencyOverview(toptierCode, { ...defaultOptions, ...options }),
      awards: (toptierCode: string, params?: { fiscal_year?: number }, options?: ClientOptions) =>
        _agencyAwards(toptierCode, params, { ...defaultOptions, ...options }),
      newAwardCount: (toptierCode: string, params?: { fiscal_year?: number }, options?: ClientOptions) =>
        _agencyNewAwardCount(toptierCode, params, { ...defaultOptions, ...options }),
      awardsCount: (params?: { fiscal_year?: number }, options?: ClientOptions) =>
        _agencyAwardsCount(params, { ...defaultOptions, ...options }),
      budgetFunction: (toptierCode: string, params?: { fiscal_year?: number }, options?: ClientOptions) =>
        _agencyBudgetFunction(toptierCode, params, { ...defaultOptions, ...options }),
      budgetFunctionCount: (toptierCode: string, params?: { fiscal_year?: number }, options?: ClientOptions) =>
        _agencyBudgetFunctionCount(toptierCode, params, { ...defaultOptions, ...options }),
      budgetaryResources: (toptierCode: string, options?: ClientOptions) =>
        _agencyBudgetaryResources(toptierCode, { ...defaultOptions, ...options }),
      federalAccount: (toptierCode: string, params?: { fiscal_year?: number; page?: number; limit?: number }, options?: ClientOptions) =>
        _agencyFederalAccount(toptierCode, params, { ...defaultOptions, ...options }),
      federalAccountCount: (toptierCode: string, params?: { fiscal_year?: number }, options?: ClientOptions) =>
        _agencyFederalAccountCount(toptierCode, params, { ...defaultOptions, ...options }),
      objectClass: (toptierCode: string, params?: { fiscal_year?: number; page?: number; limit?: number }, options?: ClientOptions) =>
        _agencyObjectClass(toptierCode, params, { ...defaultOptions, ...options }),
      objectClassCount: (toptierCode: string, params?: { fiscal_year?: number }, options?: ClientOptions) =>
        _agencyObjectClassCount(toptierCode, params, { ...defaultOptions, ...options }),
      obligationsByAwardCategory: (toptierCode: string, params?: { fiscal_year?: number }, options?: ClientOptions) =>
        _agencyObligationsByAwardCategory(toptierCode, params, { ...defaultOptions, ...options }),
      programActivity: (toptierCode: string, params?: { fiscal_year?: number; page?: number; limit?: number }, options?: ClientOptions) =>
        _agencyProgramActivity(toptierCode, params, { ...defaultOptions, ...options }),
      programActivityCount: (toptierCode: string, params?: { fiscal_year?: number }, options?: ClientOptions) =>
        _agencyProgramActivityCount(toptierCode, params, { ...defaultOptions, ...options }),
      subAgency: (toptierCode: string, params?: { fiscal_year?: number; page?: number; limit?: number }, options?: ClientOptions) =>
        _agencySubAgency(toptierCode, params, { ...defaultOptions, ...options }),
      subAgencyCount: (toptierCode: string, params?: { fiscal_year?: number }, options?: ClientOptions) =>
        _agencySubAgencyCount(toptierCode, params, { ...defaultOptions, ...options }),
      subComponents: (toptierCode: string, params?: { fiscal_year?: number; page?: number; limit?: number }, options?: ClientOptions) =>
        _agencySubComponents(toptierCode, params, { ...defaultOptions, ...options }),
      treasuryAccountObjectClass: (toptierCode: string, accountCode: string, params?: { fiscal_year?: number; page?: number; limit?: number }, options?: ClientOptions) =>
        _agencyTreasuryAccountObjectClass(toptierCode, accountCode, params, { ...defaultOptions, ...options }),
      treasuryAccountProgramActivity: (toptierCode: string, accountCode: string, params?: { fiscal_year?: number; page?: number; limit?: number }, options?: ClientOptions) =>
        _agencyTreasuryAccountProgramActivity(toptierCode, accountCode, params, { ...defaultOptions, ...options }),
    },
    recipients: {
      list: (params?: { keyword?: string; award_type?: string; page?: number; limit?: number; sort?: string; order?: string }, options?: ClientOptions) =>
        _recipientList(params, { ...defaultOptions, ...options }),
      count: (params?: { keyword?: string; award_type?: string }, options?: ClientOptions) =>
        _recipientCount(params, { ...defaultOptions, ...options }),
      detail: (recipientId: string, params?: { year?: string }, options?: ClientOptions) =>
        _recipientDetail(recipientId, params, { ...defaultOptions, ...options }),
      children: (recipientId: string, params?: { year?: string }, options?: ClientOptions) =>
        _recipientChildren(recipientId, params, { ...defaultOptions, ...options }),
      spendingByState: (options?: ClientOptions) =>
        _spendingByState({ ...defaultOptions, ...options }),
      stateDetail: (fips: string, params?: { year?: number }, options?: ClientOptions) =>
        _stateDetail(fips, params, { ...defaultOptions, ...options }),
      stateAwards: (fips: string, params?: { year?: number }, options?: ClientOptions) =>
        _stateAwards(fips, params, { ...defaultOptions, ...options }),
    },
    spending: {
      byAgency: (params: SpendingByAgencyParams, options?: ClientOptions) =>
        _spendingByAgency(params, { ...defaultOptions, ...options }),
      byState: (options?: ClientOptions) =>
        _spendingByState({ ...defaultOptions, ...options }),
      overTime: (params: SpendingOverTimeParams, options?: ClientOptions) =>
        _spendingOverTime(params, { ...defaultOptions, ...options }),
    },
    search: {
      awardCount: (params: { filters: Record<string, unknown>; subawards?: boolean }, options?: ClientOptions) =>
        _spendingByAwardCount(params, { ...defaultOptions, ...options }),
      byCategory: (subPath: CategorySubPath, params?: CategoryParams, options?: ClientOptions) =>
        _spendingByCategory(subPath, params, { ...defaultOptions, ...options }),
      byGeography: (params: GeographyParams, options?: ClientOptions) =>
        _spendingByGeography(params, { ...defaultOptions, ...options }),
      transactions: withPagination(
        (params?: AwardSearchParams, options?: ClientOptions) =>
          _spendingByTransaction(params, { ...defaultOptions, ...options }),
      ),
      transactionCount: (params: { filters: Record<string, unknown>; subawards?: boolean }, options?: ClientOptions) =>
        _spendingByTransactionCount(params, { ...defaultOptions, ...options }),
      transactionGrouped: withPagination(
        (params?: AwardSearchParams, options?: ClientOptions) =>
          _spendingByTransactionGrouped(params, { ...defaultOptions, ...options }),
      ),
      subawardGrouped: withPagination(
        (params?: AwardSearchParams, options?: ClientOptions) =>
          _spendingBySubawardGrouped(params, { ...defaultOptions, ...options }),
      ),
      newAwardsOverTime: (params: SpendingOverTimeParams, options?: ClientOptions) =>
        _newAwardsOverTime(params, { ...defaultOptions, ...options }),
      transactionSpendingSummary: (params: { filters: Record<string, unknown> }, options?: ClientOptions) =>
        _transactionSpendingSummary(params, { ...defaultOptions, ...options }),
    },
    autocomplete: {
      awardingAgency: (params: { search_text: string; limit?: number }, options?: ClientOptions) =>
        _autocompleteAwardingAgency(params, { ...defaultOptions, ...options }),
      fundingAgency: (params: { search_text: string; limit?: number }, options?: ClientOptions) =>
        _autocompleteFundingAgency(params, { ...defaultOptions, ...options }),
      awardingAgencyOffice: (params: { search_text: string; limit?: number }, options?: ClientOptions) =>
        _autocompleteAwardingAgencyOffice(params, { ...defaultOptions, ...options }),
      fundingAgencyOffice: (params: { search_text: string; limit?: number }, options?: ClientOptions) =>
        _autocompleteFundingAgencyOffice(params, { ...defaultOptions, ...options }),
      cfda: (params: { search_text: string; limit?: number }, options?: ClientOptions) =>
        _autocompleteCfda(params, { ...defaultOptions, ...options }),
      city: (params: { search_text: string; limit?: number; filter?: { country_code: string; scope: string } }, options?: ClientOptions) =>
        _autocompleteCity(params, { ...defaultOptions, ...options }),
      glossary: (params: { search_text: string; limit?: number }, options?: ClientOptions) =>
        _autocompleteGlossary(params, { ...defaultOptions, ...options }),
      location: (params: { search_text: string; limit?: number }, options?: ClientOptions) =>
        _autocompleteLocation(params, { ...defaultOptions, ...options }),
      naics: (params: { search_text: string; limit?: number }, options?: ClientOptions) =>
        _autocompleteNaics(params, { ...defaultOptions, ...options }),
      psc: (params: { search_text: string; limit?: number }, options?: ClientOptions) =>
        _autocompletePsc(params, { ...defaultOptions, ...options }),
      programActivity: (params: { search_text: string; limit?: number }, options?: ClientOptions) =>
        _autocompleteProgramActivity(params, { ...defaultOptions, ...options }),
      recipient: (params: { search_text: string; limit?: number }, options?: ClientOptions) =>
        _autocompleteRecipient(params, { ...defaultOptions, ...options }),
      accountsAid: (params: { filters: { aid?: string; ata?: string; main?: string; sub?: string; bpoa?: string; epoa?: string; a?: string } }, options?: ClientOptions) =>
        _autocompleteAccountsAid(params, { ...defaultOptions, ...options }),
      accountsA: (params: { filters: Record<string, string> }, options?: ClientOptions) =>
        _autocompleteAccountsA(params, { ...defaultOptions, ...options }),
      accountsAta: (params: { filters: Record<string, string> }, options?: ClientOptions) =>
        _autocompleteAccountsAta(params, { ...defaultOptions, ...options }),
      accountsBpoa: (params: { filters: Record<string, string> }, options?: ClientOptions) =>
        _autocompleteAccountsBpoa(params, { ...defaultOptions, ...options }),
      accountsEpoa: (params: { filters: Record<string, string> }, options?: ClientOptions) =>
        _autocompleteAccountsEpoa(params, { ...defaultOptions, ...options }),
      accountsMain: (params: { filters: Record<string, string> }, options?: ClientOptions) =>
        _autocompleteAccountsMain(params, { ...defaultOptions, ...options }),
      accountsSub: (params: { filters: Record<string, string> }, options?: ClientOptions) =>
        _autocompleteAccountsSub(params, { ...defaultOptions, ...options }),
    },
    references: {
      toptierAgencies: (params?: { sort?: string; order?: string }, options?: ClientOptions) =>
        _refToptierAgencies(params, { ...defaultOptions, ...options }),
      agency: (agencyId: number, options?: ClientOptions) =>
        _refAgency(agencyId, { ...defaultOptions, ...options }),
      awardTypes: (options?: ClientOptions) =>
        _refAwardTypes({ ...defaultOptions, ...options }),
      glossary: (params?: { page?: number; limit?: number }, options?: ClientOptions) =>
        _refGlossary(params, { ...defaultOptions, ...options }),
      defCodes: (options?: ClientOptions) =>
        _refDefCodes({ ...defaultOptions, ...options }),
      naics: (params?: { code?: string }, options?: ClientOptions) =>
        _refNaics(params, { ...defaultOptions, ...options }),
      dataDictionary: (options?: ClientOptions) =>
        _refDataDictionary({ ...defaultOptions, ...options }),
      filterHash: (filters: Record<string, unknown>, options?: ClientOptions) =>
        _refFilterHash(filters, { ...defaultOptions, ...options }),
      filterTreePsc: (params?: { depth?: number; filter?: string }, options?: ClientOptions) =>
        _refFilterTreePsc(params, { ...defaultOptions, ...options }),
      filterTreeTas: (params?: { depth?: number; filter?: string }, options?: ClientOptions) =>
        _refFilterTreeTas(params, { ...defaultOptions, ...options }),
      submissionPeriods: (options?: ClientOptions) =>
        _refSubmissionPeriods({ ...defaultOptions, ...options }),
      totalBudgetaryResources: (options?: ClientOptions) =>
        _refTotalBudgetaryResources({ ...defaultOptions, ...options }),
      assistanceListing: (options?: ClientOptions) =>
        _refAssistanceListing({ ...defaultOptions, ...options }),
      cfdaTotals: (params?: { cfda?: string }, options?: ClientOptions) =>
        _refCfdaTotals(params, { ...defaultOptions, ...options }),
    },
    disaster: {
      overview: (options?: ClientOptions) =>
        _disasterOverview(undefined, { ...defaultOptions, ...options }),
      awardAmount: (params?: DisasterFilterParams, options?: ClientOptions) =>
        _disasterAwardAmount(params, { ...defaultOptions, ...options }),
      awardCount: (params?: DisasterFilterParams, options?: ClientOptions) =>
        _disasterAwardCount(params, { ...defaultOptions, ...options }),
      agencySpending: (params?: DisasterFilterParams, options?: ClientOptions) =>
        _disasterAgencySpending(params, { ...defaultOptions, ...options }),
      agencyLoans: (params?: DisasterFilterParams, options?: ClientOptions) =>
        _disasterAgencyLoans(params, { ...defaultOptions, ...options }),
      agencyCount: (params?: DisasterFilterParams, options?: ClientOptions) =>
        _disasterAgencyCount(params, { ...defaultOptions, ...options }),
      cfdaSpending: (params?: DisasterFilterParams, options?: ClientOptions) =>
        _disasterCfdaSpending(params, { ...defaultOptions, ...options }),
      cfdaLoans: (params?: DisasterFilterParams, options?: ClientOptions) =>
        _disasterCfdaLoans(params, { ...defaultOptions, ...options }),
      cfdaCount: (params?: DisasterFilterParams, options?: ClientOptions) =>
        _disasterCfdaCount(params, { ...defaultOptions, ...options }),
      defCodeCount: (params?: DisasterFilterParams, options?: ClientOptions) =>
        _disasterDefCodeCount(params, { ...defaultOptions, ...options }),
      federalAccountSpending: (params?: DisasterFilterParams, options?: ClientOptions) =>
        _disasterFederalAccountSpending(params, { ...defaultOptions, ...options }),
      federalAccountLoans: (params?: DisasterFilterParams, options?: ClientOptions) =>
        _disasterFederalAccountLoans(params, { ...defaultOptions, ...options }),
      federalAccountCount: (params?: DisasterFilterParams, options?: ClientOptions) =>
        _disasterFederalAccountCount(params, { ...defaultOptions, ...options }),
      objectClassSpending: (params?: DisasterFilterParams, options?: ClientOptions) =>
        _disasterObjectClassSpending(params, { ...defaultOptions, ...options }),
      objectClassLoans: (params?: DisasterFilterParams, options?: ClientOptions) =>
        _disasterObjectClassLoans(params, { ...defaultOptions, ...options }),
      objectClassCount: (params?: DisasterFilterParams, options?: ClientOptions) =>
        _disasterObjectClassCount(params, { ...defaultOptions, ...options }),
      recipientSpending: (params?: DisasterFilterParams, options?: ClientOptions) =>
        _disasterRecipientSpending(params, { ...defaultOptions, ...options }),
      recipientLoans: (params?: DisasterFilterParams, options?: ClientOptions) =>
        _disasterRecipientLoans(params, { ...defaultOptions, ...options }),
      recipientCount: (params?: DisasterFilterParams, options?: ClientOptions) =>
        _disasterRecipientCount(params, { ...defaultOptions, ...options }),
      spendingByGeography: (params?: DisasterFilterParams, options?: ClientOptions) =>
        _disasterSpendingByGeography(params, { ...defaultOptions, ...options }),
    },
    federalAccounts: {
      list: (params?: { keyword?: string; page?: number; limit?: number; sort_field?: string; sort_direction?: string }, options?: ClientOptions) =>
        _federalAccountList(params, { ...defaultOptions, ...options }),
      detail: (id: number, options?: ClientOptions) =>
        _federalAccountDetail(id, { ...defaultOptions, ...options }),
      fiscalYearSnapshot: (id: number, fy?: number, options?: ClientOptions) =>
        _federalAccountFiscalYearSnapshot(id, fy, { ...defaultOptions, ...options }),
      availableObjectClasses: (id: number, options?: ClientOptions) =>
        _federalAccountAvailableObjectClasses(id, { ...defaultOptions, ...options }),
      objectClasses: (id: number, params?: { page?: number; limit?: number }, options?: ClientOptions) =>
        _federalAccountObjectClasses(id, params, { ...defaultOptions, ...options }),
      programActivities: (id: number, params?: { page?: number; limit?: number }, options?: ClientOptions) =>
        _federalAccountProgramActivities(id, params, { ...defaultOptions, ...options }),
      programActivitiesTotal: (id: number, params?: { page?: number; limit?: number }, options?: ClientOptions) =>
        _federalAccountProgramActivitiesTotal(id, params, { ...defaultOptions, ...options }),
    },
    idv: {
      accounts: (params?: { award_id?: number; page?: number; limit?: number; sort?: string; order?: string }, options?: ClientOptions) =>
        _idvAccounts(params, { ...defaultOptions, ...options }),
      activity: (params?: { award_id?: number; page?: number; limit?: number }, options?: ClientOptions) =>
        _idvActivity(params, { ...defaultOptions, ...options }),
      amounts: (awardId: string, options?: ClientOptions) =>
        _idvAmounts(awardId, { ...defaultOptions, ...options }),
      childAwards: (params?: { award_id?: number; page?: number; limit?: number; sort?: string; order?: string }, options?: ClientOptions) =>
        _idvChildAwards(params, { ...defaultOptions, ...options }),
      childIdvs: (params?: { award_id?: number; page?: number; limit?: number; sort?: string; order?: string }, options?: ClientOptions) =>
        _idvChildIdvs(params, { ...defaultOptions, ...options }),
      countFederalAccount: (awardId: string, options?: ClientOptions) =>
        _idvCountFederalAccount(awardId, { ...defaultOptions, ...options }),
      fundingRollup: (awardId: string, options?: ClientOptions) =>
        _idvFundingRollup(awardId, { ...defaultOptions, ...options }),
      funding: (params?: { award_id?: number; page?: number; limit?: number; sort?: string; order?: string; piid?: string }, options?: ClientOptions) =>
        _idvFunding(params, { ...defaultOptions, ...options }),
    },
    reporting: {
      agenciesOverview: (params?: { page?: number; limit?: number; sort?: string; order?: "asc" | "desc"; fiscal_year?: number; fiscal_period?: number; filter?: string }, options?: ClientOptions) =>
        _reportingAgenciesOverview(params, { ...defaultOptions, ...options }),
      publishDates: (params?: { page?: number; limit?: number; sort?: string; order?: "asc" | "desc"; fiscal_year?: number; fiscal_period?: number; filter?: string }, options?: ClientOptions) =>
        _reportingPublishDates(params, { ...defaultOptions, ...options }),
      differences: (toptierCode: string, fiscalYear: number, fiscalPeriod: number, params?: { page?: number; limit?: number; sort?: string; order?: "asc" | "desc" }, options?: ClientOptions) =>
        _reportingDifferences(toptierCode, fiscalYear, fiscalPeriod, params, { ...defaultOptions, ...options }),
      discrepancies: (toptierCode: string, fiscalYear: number, fiscalPeriod: number, params?: { page?: number; limit?: number; sort?: string; order?: "asc" | "desc" }, options?: ClientOptions) =>
        _reportingDiscrepancies(toptierCode, fiscalYear, fiscalPeriod, params, { ...defaultOptions, ...options }),
      agencyOverview: (toptierCode: string, params?: { page?: number; limit?: number; sort?: string; order?: "asc" | "desc" }, options?: ClientOptions) =>
        _reportingAgencyOverview(toptierCode, params, { ...defaultOptions, ...options }),
      submissionHistory: (toptierCode: string, fiscalYear: number, fiscalPeriod: number, params?: { page?: number; limit?: number; sort?: string; order?: "asc" | "desc" }, options?: ClientOptions) =>
        _reportingSubmissionHistory(toptierCode, fiscalYear, fiscalPeriod, params, { ...defaultOptions, ...options }),
      unlinkedAssistance: (toptierCode: string, fiscalYear: number, fiscalPeriod: number, options?: ClientOptions) =>
        _reportingUnlinkedAssistance(toptierCode, fiscalYear, fiscalPeriod, { ...defaultOptions, ...options }),
      unlinkedProcurement: (toptierCode: string, fiscalYear: number, fiscalPeriod: number, options?: ClientOptions) =>
        _reportingUnlinkedProcurement(toptierCode, fiscalYear, fiscalPeriod, { ...defaultOptions, ...options }),
    },
    financial: {
      federalObligations: (params: { funding_agency_id: number; fiscal_year: number; page?: number; limit?: number }, options?: ClientOptions) =>
        _financialFederalObligations(params, { ...defaultOptions, ...options }),
      balances: (params: { funding_agency_id: number; fiscal_year: number; page?: number; limit?: number }, options?: ClientOptions) =>
        _financialBalances(params, { ...defaultOptions, ...options }),
      spendingMajorObjectClass: (params: { fiscal_year: number; funding_agency_id: number; page?: number; limit?: number }, options?: ClientOptions) =>
        _financialSpendingMajorObjectClass(params, { ...defaultOptions, ...options }),
      spendingObjectClass: (params: { fiscal_year: number; funding_agency_id: number; major_object_class_code?: number; page?: number; limit?: number }, options?: ClientOptions) =>
        _financialSpendingObjectClass(params, { ...defaultOptions, ...options }),
    },
    subawards: {
      list: (params?: { page?: number; limit?: number; sort?: string; order?: "asc" | "desc"; keyword?: string; award_id?: string }, options?: ClientOptions) =>
        _subawardList(params, { ...defaultOptions, ...options }),
      byAward: (params: { award_id: string; page?: number; limit?: number; sort?: string; order?: "asc" | "desc" }, options?: ClientOptions) =>
        _subawardByAward(params, { ...defaultOptions, ...options }),
      transactions: (params: { award_id: number; page?: number; limit?: number; sort?: string; order?: "asc" | "desc" }, options?: ClientOptions) =>
        _subawardTransactions(params, { ...defaultOptions, ...options }),
    },
    budgetFunctions: {
      list: (options?: ClientOptions) =>
        _budgetFunctionList({ ...defaultOptions, ...options }),
      subfunctions: (budgetFunctionCode: string, options?: ClientOptions) =>
        _budgetFunctionSubfunctions(budgetFunctionCode, { ...defaultOptions, ...options }),
    },
    downloads: {
      count: (params: { filters: Record<string, unknown> }, options?: ClientOptions) =>
        _downloadCount(params, { ...defaultOptions, ...options }),
      awards: (params: { filters: Record<string, unknown>; columns?: string[]; file_format?: "csv" | "tsv" }, options?: ClientOptions) =>
        _downloadAwards(params, { ...defaultOptions, ...options }),
      transactions: (params: { filters: Record<string, unknown>; columns?: string[]; file_format?: "csv" | "tsv" }, options?: ClientOptions) =>
        _downloadTransactions(params, { ...defaultOptions, ...options }),
      idv: (params: { award_id: number; columns?: string[]; file_format?: "csv" | "tsv" }, options?: ClientOptions) =>
        _downloadIdv(params, { ...defaultOptions, ...options }),
      contract: (params: { award_id: number; columns?: string[]; file_format?: "csv" | "tsv" }, options?: ClientOptions) =>
        _downloadContract(params, { ...defaultOptions, ...options }),
      assistance: (params: { award_id: number; columns?: string[]; file_format?: "csv" | "tsv" }, options?: ClientOptions) =>
        _downloadAssistance(params, { ...defaultOptions, ...options }),
      status: (fileName: string, options?: ClientOptions) =>
        _downloadStatus(fileName, { ...defaultOptions, ...options }),
      disaster: (params: { filters: { def_codes: string[]; [key: string]: unknown } }, options?: ClientOptions) =>
        _downloadDisaster(params, { ...defaultOptions, ...options }),
    },
    bulkDownloads: {
      listAgenciesAccounts: (options?: ClientOptions) =>
        _bulkDownloadListAgenciesAccounts({ ...defaultOptions, ...options }),
      listAgenciesAwards: (options?: ClientOptions) =>
        _bulkDownloadListAgenciesAwards({ ...defaultOptions, ...options }),
      listMonthlyFiles: (params: { agency: number | "all"; fiscal_year: number; type: "contracts" | "assistance" | "sub_contracts" | "sub_grants" }, options?: ClientOptions) =>
        _bulkDownloadListMonthlyFiles(params, { ...defaultOptions, ...options }),
      awards: (params: { filters: Record<string, unknown>; file_format?: "csv" | "tsv" }, options?: ClientOptions) =>
        _bulkDownloadAwards(params, { ...defaultOptions, ...options }),
      status: (fileName: string, options?: ClientOptions) =>
        _bulkDownloadStatus(fileName, { ...defaultOptions, ...options }),
    },
    describe,
  };
}

export const usa = createUSASpending();
