# doge-api

Typed TypeScript client for the [DOGE API](https://api.doge.gov) (api.doge.gov). Query government savings from cancelled grants, contracts, and leases, plus federal payment records.

- Single dependency ([Zod](https://github.com/colinhacks/zod))
- All inputs and outputs validated at runtime
- Automatic retry with exponential backoff on rate limiting (429)
- Auto-pagination with `.pages()` and `.all()`
- Formatting helpers: `.toMarkdown()`, `.toCSV()`, `.summary()`
- Runtime discoverability via `describe()`
- Agent-ready CLI with structured JSON output

## Install

```bash
bun add doge-api
```

## Library usage

```ts
import { doge } from "doge-api";

// Cancelled grants, sorted by savings
const grants = await doge.grants({ sort_by: "savings", sort_order: "desc", per_page: 10 });
console.log(grants.data);   // Grant[]
console.log(grants.meta);   // { total_results: number, pages: number }
console.log(grants.kind);   // "grants"

// Cancelled contracts
const contracts = await doge.contracts({ sort_by: "value", page: 2 });

// Cancelled leases
const leases = await doge.leases({ per_page: 50 });

// Payments, filtered by agency
const payments = await doge.payments({
  filter: "agency_name",
  filter_value: "NASA",
  sort_by: "amount",
  sort_order: "desc",
});

// Payment statistics (no params)
const stats = await doge.statistics();
console.log(stats.data.agency);       // { agency_name: string, count: number }[]
console.log(stats.data.request_date); // { date: string, count: number }[]
console.log(stats.data.org_names);    // { org_name: string, count: number }[]
```

### Formatting helpers

Every result has `.summary()`, `.toMarkdown()`, and `.toCSV()`:

```ts
const result = await doge.grants({ per_page: 5 });

result.summary();    // "grants: 5 of 15887 results (3178 pages)"
result.toMarkdown(); // markdown table
result.toCSV();      // CSV with proper escaping
```

### Auto-pagination

Paginated endpoints have `.pages()` and `.all()`:

```ts
// Lazy iteration — one page at a time
for await (const page of doge.grants.pages({ sort_by: "savings" })) {
  console.log(page.data);
}

// Collect everything
const all = await doge.grants.all({ sort_by: "savings" });
console.log(all.data.length); // all grants across all pages

// Safety limit (default: 100 pages)
const limited = await doge.grants.all({ sort_by: "savings" }, { maxPages: 10 });
```

### Runtime discoverability

`describe()` returns structured metadata about all endpoints — useful for agents that need to discover the API at runtime:

```ts
const info = doge.describe();

for (const endpoint of info.endpoints) {
  console.log(endpoint.name);           // "grants"
  console.log(endpoint.path);           // "/savings/grants"
  console.log(endpoint.description);    // "List cancelled grants with savings data"
  console.log(endpoint.params);         // [{ name: "sort_by", values: ["savings", "value", "date"], ... }]
  console.log(endpoint.responseFields); // ["date", "agency", "recipient", ...]
}
```

### Custom client

```ts
import { createDoge } from "doge-api";

const client = createDoge({
  maxRetries: 5,
  initialRetryMs: 2000,
});

const grants = await client.grants({ per_page: 10 });
```

### Standalone imports

```ts
import { grants, contracts, describe } from "doge-api";

const result = await grants({ sort_by: "savings" });
const info = describe();
```

### Error handling

```ts
import { doge, DogeApiError, DogeRateLimitError, DogeValidationError } from "doge-api";

try {
  await doge.grants({ sort_by: "invalid" });
} catch (err) {
  if (err instanceof DogeValidationError) {
    // "sort_by must be 'savings' | 'value' | 'date', got 'invalid'"
    console.log(err.field, err.received, err.expected);
  }
  if (err instanceof DogeRateLimitError) {
    console.log(err.retryAfterMs);
  }
  if (err instanceof DogeApiError) {
    console.log(err.status, err.message);
  }
}
```

### Types

```ts
import type {
  Grant, Contract, Lease, Payment, Meta,
  AgencyStat, RequestDateStat, OrgNameStat,
  SavingsParams, PaymentsParams, ClientOptions,
  DogeResult, GrantsResult, PaginatedEndpoint,
  EndpointDescription, ParamDescription,
} from "doge-api";
```

## CLI

Standalone binaries are available on the [releases page](https://github.com/zcaceres/doge-api/releases) — no runtime needed:

```bash
# Download (macOS Apple Silicon example)
curl -L https://github.com/zcaceres/doge-api/releases/latest/download/doge-api-darwin-arm64 -o doge-api
chmod +x doge-api

# Or run with bun directly
bun doge-api grants --per-page 5
```

Structured JSON output, suitable for piping into `jq` or agent toolchains:

```bash
# Query endpoints
doge-api grants --sort-by savings --sort-order desc --per-page 10
doge-api contracts --page 2
doge-api leases --per-page 50
doge-api payments --filter agency_name --filter-value NASA
doge-api statistics

# Pretty-print
doge-api grants --per-page 2 --json
```

Output shape:

```json
{
  "data": [{ "agency": "DOE", "savings": 6290830, ... }],
  "meta": { "total_results": 15887, "pages": 7944 },
  "kind": "grants"
}
```

## MCP Server

The MCP server lets AI agents (Claude Desktop, etc.) call the DOGE API directly as tools. A standalone binary is available on the [releases page](https://github.com/zcaceres/doge-api/releases).

Add to your Claude Desktop config (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "doge-api": {
      "command": "/path/to/doge-mcp"
    }
  }
}
```

Or run with bun:

```json
{
  "mcpServers": {
    "doge-api": {
      "command": "bun",
      "args": ["run", "/path/to/doge-api/src/mcp.ts"]
    }
  }
}
```

Tools: `doge_grants`, `doge_contracts`, `doge_leases`, `doge_payments`, `doge_statistics`, `doge_describe`. Each tool accepts a `format` param (`markdown`, `csv`, or `json`).

## API endpoints

| Function | Endpoint | Sort fields |
|---|---|---|
| `doge.grants()` | `/savings/grants` | `savings`, `value`, `date` |
| `doge.contracts()` | `/savings/contracts` | `savings`, `value`, `date` |
| `doge.leases()` | `/savings/leases` | `savings`, `value`, `date` |
| `doge.payments()` | `/payments` | `amount`, `date` |
| `doge.statistics()` | `/payments/statistics` | — |

All savings endpoints accept `sort_by`, `sort_order`, `page`, and `per_page`. Payments additionally accepts `filter` and `filter_value`.

## Development

```bash
bun install
bun test
bun run typecheck
```

See [EXAMPLES.md](EXAMPLES.md) for more detailed usage examples.
