# govdata

A monorepo of typed TypeScript clients for U.S. government data APIs. Each data source is a plugin that shares a common core — one interface, multiple surfaces (library, CLI, MCP server).

## Data Sources

| Source | Status | Endpoints | Description |
|--------|--------|-----------|-------------|
| [doge-api](packages/doge-api) | Stable | 5 | DOGE API — grants, contracts, leases, payments, statistics |
| [federal-register](packages/federal-register) | Stable | 9 | Federal Register — documents, agencies, public inspection, facets |
| [dol-open-data-api](packages/dol-open-data-api) | Stable | 42 | Dept. of Labor — MSHA, OSHA, WHD, and 6 other agencies |
| [naics-api](packages/naics-api) | Stable | 3 | NAICS code lookup (local SQLite, no HTTP) |
| [usaspending-api](packages/usaspending-api) | In Progress | 6 | USAspending.gov — awards, agency spending, state spending |
| [bls-api](packages/bls-api) | Stable | 3 | Bureau of Labor Statistics — time series, surveys, popular series |

**Not yet started:** SEC EDGAR, Census Bureau, EPA, USDA, HHS, FEC, USPTO, data.gov

## Packages

| Package | Description |
|---------|-------------|
| [govdata-core](packages/govdata-core) | Shared primitives: HTTP client, response envelope, pagination, plugin interface |
| [doge-api](packages/doge-api) | DOGE API plugin |
| [federal-register](packages/federal-register) | Federal Register API plugin |
| [dol-open-data-api](packages/dol-open-data-api) | Dept. of Labor open data API plugin |
| [naics-api](packages/naics-api) | NAICS code lookup plugin |
| [usaspending-api](packages/usaspending-api) | USAspending.gov API plugin |
| [bls-api](packages/bls-api) | Bureau of Labor Statistics API plugin |
| [govdata-cli](packages/govdata-cli) | Unified CLI binary for all plugins |
| [govdata-mcp](packages/govdata-mcp) | Unified MCP server for all plugins |

## Quick start

```bash
bun install
```

### Library

```ts
import { doge } from "doge-api";
import { fr } from "federal-register";

const grants = await doge.grants({ sort_by: "savings" });
console.log(grants.summary());

const docs = await fr.documents.search({ term: "climate" });
console.log(docs.toMarkdown());
```

See each package's README for full API docs.

### CLI

```bash
# Unified CLI routes by plugin prefix
bun packages/govdata-cli/src/cli.ts doge grants --sort-by savings --per-page 5
bun packages/govdata-cli/src/cli.ts federal-register documents --term climate
bun packages/govdata-cli/src/cli.ts dol get MSHA accident --limit 10

# Standalone CLIs also work
bun packages/doge-api/src/cli.ts grants --sort-by savings
```

### MCP server

```json
{
  "mcpServers": {
    "govdata": {
      "command": "bun",
      "args": ["packages/govdata-mcp/src/mcp.ts"]
    }
  }
}
```

Registers tools for every plugin across all data sources.

## Adding a new data source

1. Create `packages/<name>-api/` implementing `GovDataPlugin` from `govdata-core`
2. Add it to the `plugins` array in `govdata-cli` and `govdata-mcp`
3. Add it to the `plugins` array in `tests/plugin-contract.test.ts` (and other integration tests)
4. Run `bun test` to verify

## Scripts

```bash
bun test                  # all tests (unit + integration)
bun run test:integration  # root integration tests
bun run test:core         # govdata-core unit tests
bun run test:doge         # doge-api unit tests
bun run test:naics        # naics-api unit tests
bun run test:dol          # dol-open-data-api unit tests
bun run test:fr           # federal-register unit tests
bun run test:usaspending  # usaspending-api unit tests
bun run test:bls          # bls-api unit tests
bun run typecheck         # type-check all packages
```

## Architecture

See [COMPOSITION.md](COMPOSITION.md) for the full design rationale.

Every data source implements `GovDataPlugin`:

```ts
interface GovDataPlugin {
  prefix: string;
  describe(): { endpoints: EndpointDescription[] };
  endpoints: Record<string, (params?: any) => Promise<GovResult>>;
}
```

The `describe()` method provides structured metadata that drives CLI flag parsing, MCP schema generation, and documentation. Adding a source means implementing this interface once — the CLI and MCP server surface it automatically.

## License

Apache-2.0
