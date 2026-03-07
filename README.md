# govdata

A monorepo of typed TypeScript clients for U.S. government data APIs. Each data source is a plugin that shares a common core — one interface, multiple surfaces (library, CLI, MCP server).

## Packages

| Package | Description |
|---------|-------------|
| [govdata-core](packages/govdata-core) | Shared primitives: HTTP client, response envelope, pagination, plugin interface |
| [doge-api](packages/doge-api) | DOGE API plugin — grants, contracts, leases, payments ([README](packages/doge-api/README.md)) |
| [govdata-cli](packages/govdata-cli) | Unified CLI binary for all plugins |
| [govdata-mcp](packages/govdata-mcp) | Unified MCP server for all plugins |

## Quick start

```bash
bun install
```

### Library

```ts
import { doge } from "doge-api";

const grants = await doge.grants({ sort_by: "savings" });
console.log(grants.summary());
```

See the [doge-api README](packages/doge-api/README.md) for full API docs.

### CLI

```bash
# Unified CLI routes by plugin prefix
bun packages/govdata-cli/src/cli.ts doge grants --sort-by savings --per-page 5

# Standalone doge CLI still works
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

Registers tools for every plugin: `doge_grants`, `doge_contracts`, `doge_leases`, `doge_payments`, `doge_statistics`, `doge_describe`.

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
