// Re-export all endpoint functions from domains for backward compatibility
export { _searchAwards, _spendingOverTime } from "./domains/search";
export { _findAward } from "./domains/awards";
export { _agencyOverview } from "./domains/agency";
export { _spendingByAgency } from "./domains/spending";
export { _spendingByState } from "./domains/recipient";
