import { createResult } from "govdata-core";
import type { GovResult, Meta } from "govdata-core";
import type { AgencyKindMap } from "./domains/agency";
import type { AutocompleteKindMap } from "./domains/autocomplete";
import type { AwardsKindMap } from "./domains/awards";
import type { FederalAccountsKindMap } from "./domains/federal-accounts";
import type { RecipientKindMap } from "./domains/recipient";
import type { ReferencesKindMap } from "./domains/references";
import type { SearchKindMap } from "./domains/search";
import type { SpendingKindMap } from "./domains/spending";
import type { IdvKindMap } from "./domains/idv";
import type { ReportingKindMap } from "./domains/reporting";
import type { DisasterKindMap } from "./domains/disaster";
import type { BudgetFunctionsKindMap } from "./domains/budget-functions";
import type { FinancialKindMap } from "./domains/financial";
import type { SubawardsKindMap } from "./domains/subawards";
import type { DownloadsKindMap } from "./domains/downloads";

export type KindDataMap =
  & AgencyKindMap
  & AutocompleteKindMap
  & AwardsKindMap
  & BudgetFunctionsKindMap
  & DownloadsKindMap
  & FederalAccountsKindMap
  & FinancialKindMap
  & IdvKindMap
  & RecipientKindMap
  & ReferencesKindMap
  & SearchKindMap
  & SpendingKindMap
  & ReportingKindMap
  & DisasterKindMap
  & SubawardsKindMap;

export type EndpointKind = keyof KindDataMap;

export interface USAResult<K extends EndpointKind = EndpointKind> extends GovResult<K> {
  readonly data: KindDataMap[K];
  readonly meta: Meta | null;
}

export function wrapResponse<K extends EndpointKind>(
  data: KindDataMap[K],
  meta: Meta | null,
  kind: K,
): USAResult<K> {
  return createResult(data, meta, kind) as USAResult<K>;
}
