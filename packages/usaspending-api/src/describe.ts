import type { ParamDescription, EndpointDescription } from "govdata-core";
import { agencyEndpoints } from "./domains/agency";
import { autocompleteEndpoints } from "./domains/autocomplete";
import { awardsEndpoints } from "./domains/awards";
import { disasterEndpoints } from "./domains/disaster";
import { federalAccountsEndpoints } from "./domains/federal-accounts";
import { idvEndpoints } from "./domains/idv";
import { recipientEndpoints } from "./domains/recipient";
import { referencesEndpoints } from "./domains/references";
import { reportingEndpoints } from "./domains/reporting";
import { searchEndpoints } from "./domains/search";
import { spendingEndpoints } from "./domains/spending";

export type { ParamDescription, EndpointDescription };

const endpoints: EndpointDescription[] = [
  ...searchEndpoints,
  ...awardsEndpoints,
  ...agencyEndpoints,
  ...spendingEndpoints,
  ...recipientEndpoints,
  ...autocompleteEndpoints,
  ...referencesEndpoints,
  ...disasterEndpoints,
  ...federalAccountsEndpoints,
  ...idvEndpoints,
  ...reportingEndpoints,
];

export function describe(): { endpoints: EndpointDescription[] } {
  return { endpoints };
}
