# Examples

## Library Usage

### Basic query

```ts
import { doge } from "doge-api";

const result = await doge.grants({ sort_by: "savings", per_page: 5 });

console.log(result.data);    // Grant[]
console.log(result.meta);    // { total_results: 15887, pages: 3178 }
console.log(result.kind);    // "grants"
```

### All endpoints

```ts
import { doge } from "doge-api";

const grants    = await doge.grants({ sort_by: "savings" });
const contracts = await doge.contracts({ sort_by: "value", sort_order: "desc" });
const leases    = await doge.leases({ page: 2, per_page: 10 });
const payments  = await doge.payments({ filter: "agency_name", filter_value: "NASA" });
const stats     = await doge.statistics();

// Statistics has a different data shape
console.log(stats.data.agency);       // AgencyStat[]
console.log(stats.data.request_date); // RequestDateStat[]
console.log(stats.data.org_names);    // OrgNameStat[]
```

### Formatting helpers

Every result has `.toMarkdown()`, `.toCSV()`, and `.summary()`:

```ts
const result = await doge.grants({ per_page: 5 });

console.log(result.summary());
// "grants: 5 of 15887 results (3178 pages)"

console.log(result.toMarkdown());
// | date | agency | recipient | value | savings | link | description |
// | --- | --- | --- | --- | --- | --- | --- |
// | 10/2/2025 | DOE | Example Corp | 5000 | 1000 | ... | ... |

console.log(result.toCSV());
// date,agency,recipient,value,savings,link,description
// 10/2/2025,DOE,Example Corp,5000,1000,,Test grant
```

### Auto-pagination

Paginated endpoints (grants, contracts, leases, payments) have `.pages()` and `.all()`:

```ts
// Iterate one page at a time (lazy, memory-efficient)
for await (const page of doge.grants.pages({ sort_by: "savings" })) {
  console.log(page.data);   // Grant[] for this page
  console.log(page.summary());
}

// Collect everything into a single result
const all = await doge.grants.all({ sort_by: "savings" });
console.log(all.data.length); // all grants across all pages

// Safety limit (default: 100 pages)
const limited = await doge.grants.all(
  { sort_by: "savings" },
  { maxPages: 10 },
);
```

### Runtime discoverability

`describe()` returns structured metadata about all endpoints:

```ts
import { doge } from "doge-api";

const info = doge.describe();

for (const endpoint of info.endpoints) {
  console.log(`${endpoint.name} — ${endpoint.description}`);
  console.log(`  Path: ${endpoint.path}`);
  console.log(`  Params:`, endpoint.params);
  console.log(`  Fields:`, endpoint.responseFields);
}

// Example output for grants:
// {
//   name: "grants",
//   path: "/savings/grants",
//   description: "List cancelled grants with savings data",
//   params: [
//     { name: "sort_by", type: "string", required: false, values: ["savings", "value", "date"] },
//     { name: "sort_order", type: "string", required: false, values: ["asc", "desc"] },
//     { name: "page", type: "number", required: false },
//     { name: "per_page", type: "number", required: false },
//   ],
//   responseFields: ["date", "agency", "recipient", "value", "savings", "link", "description"],
// }
```

### Standalone functions

You can also import endpoint functions directly instead of using the `doge` namespace:

```ts
import { grants, contracts, describe } from "doge-api";

const result = await grants({ sort_by: "savings" });
const info = describe();
```

### Custom client

`createDoge()` lets you set default options:

```ts
import { createDoge } from "doge-api";

const client = createDoge({
  maxRetries: 5,
  initialRetryMs: 2000,
});

const result = await client.grants({ per_page: 10 });
```

### Error handling

```ts
import { doge, DogeApiError, DogeRateLimitError, DogeValidationError } from "doge-api";

try {
  await doge.grants({ sort_by: "invalid" });
} catch (err) {
  if (err instanceof DogeValidationError) {
    console.log(err.field);    // "sort_by"
    console.log(err.received); // "invalid"
    console.log(err.expected); // "'savings' | 'value' | 'date'"
    console.log(err.message);  // "sort_by must be 'savings' | 'value' | 'date', got 'invalid'"
  }

  if (err instanceof DogeRateLimitError) {
    console.log(err.retryAfterMs); // milliseconds to wait, or null
  }

  if (err instanceof DogeApiError) {
    console.log(err.status);  // HTTP status code
    console.log(err.message); // error message from API
  }
}
```

---

## CLI Usage

```bash
# Basic queries
bun src/cli.ts grants
bun src/cli.ts contracts --sort-by value --sort-order desc
bun src/cli.ts leases --page 2 --per-page 10
bun src/cli.ts payments --filter agency_name --filter-value NASA
bun src/cli.ts statistics

# Pretty-print JSON
bun src/cli.ts grants --per-page 2 --json

# Combine options
bun src/cli.ts grants --sort-by savings --sort-order desc --per-page 5 --page 3
```
