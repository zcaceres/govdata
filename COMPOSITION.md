# Composing Government Data Tools

How to scale the doge-api pattern into a general suite of government data tools.

## Plugin Interface

Every data source implements a common contract:

```ts
interface GovDataPlugin {
  prefix: string;                           // "doge", "usaspending", "sam"
  describe(): { endpoints: EndpointDescription[] };
  endpoints: Record<string, (params?: any) => Promise<GovResult>>;
}
```

The `describe()` method is the key primitive. It provides structured metadata about endpoints, parameters, and response fields — enough to auto-generate MCP tool schemas, CLI subcommands, and documentation.

`GovResult` is a generic response envelope (evolved from `DogeResult`):

```ts
interface GovResult<K extends string = string> {
  readonly data: unknown;
  readonly meta: Meta | null;
  readonly kind: K;
  toMarkdown(): string;
  toCSV(): string;
  summary(): string;
}
```

## Layer Strategies

Each layer has different composition needs but shares the same plugin interface underneath.

### Library: Separate Packages, Shared Core

Users install only what they need. A small shared core provides the response envelope, retry logic, pagination, and the `describe()` interface contract.

```
govdata-core        # GovResult, retry, pagination, describe protocol, types
doge-api            # depends on govdata-core
usaspending-api     # depends on govdata-core
sam-api             # depends on govdata-core
regulations-api     # depends on govdata-core
census-api          # depends on govdata-core
```

Each package is independently installable:

```ts
import { doge } from "doge-api";
const grants = await doge.grants({ sort_by: "savings" });
grants.toMarkdown();
```

An optional umbrella package can re-export everything for convenience:

```ts
// govdata — optional convenience package
export { doge } from "doge-api";
export { usaspending } from "usaspending-api";
export { sam } from "sam-api";
```

### CLI: Single Binary, Subcommand Routing

CLI users expect one tool. A single `govdata` binary routes to plugins via subcommands:

```bash
govdata doge grants --sort-by savings
govdata usaspending awards --agency NASA
govdata sam entities --search "Lockheed"
```

The implementation dispatches using the plugin interface:

```ts
const plugin = plugins[process.argv[2]];   // "doge" -> doge plugin
const endpoint = plugin.endpoints[process.argv[3]]; // "grants" -> grants fn
const result = await endpoint(parseFlags(process.argv.slice(4)));
console.log(JSON.stringify({ data: result.data, meta: result.meta, kind: result.kind }));
```

Flag names come from `describe().params`, same pattern the MCP schema generation already uses. Individual source binaries (like `doge-api`) can still exist as standalone shortcuts.

### MCP: Single Server, Plugin Registry

Agents get unified tool discovery through a single `govdata-mcp` server that loads plugins and registers tools from each:

```ts
for (const plugin of plugins) {
  for (const endpoint of plugin.describe().endpoints) {
    server.tool(
      `${plugin.prefix}_${endpoint.name}`,  // doge_grants, sam_entities
      endpoint.description,
      buildSchema(endpoint),                 // Zod schema from describe() params
      async (args) => { /* dispatch */ }
    );
  }
}
```

Plugins can be loaded from a config file, npm packages, or a directory convention. This is exactly what `src/mcp.ts` already does for a single source — it just needs one more level of indirection.

Agents configure a single server:

```json
{
  "mcpServers": {
    "govdata": {
      "command": "govdata-mcp"
    }
  }
}
```

## Summary

| Layer | Strategy | Rationale |
|-------|----------|-----------|
| **Library** | Separate packages, shared core | Install only what you need |
| **CLI** | Single binary, subcommand routing | CLI users expect one tool |
| **MCP** | Single server, plugin registry | Agents want unified discovery |

All three layers share the same plugin interface and `describe()` contract. Adding a new government data source means implementing `GovDataPlugin` once — the CLI, MCP server, and library surface it automatically.

## Potential Sources

| Source | API | Data |
|--------|-----|------|
| DOGE | api.doge.gov | Cancelled grants, contracts, leases, payments |
| USAspending | api.usaspending.gov | Federal spending, awards, recipients |
| SAM.gov | api.sam.gov | Contract opportunities, entity registrations |
| regulations.gov | api.regulations.gov | Rulemaking dockets, public comments |
| Census Bureau | api.census.gov | Demographics, economic surveys |
| data.gov | Various | 300k+ federal datasets (catalog/metadata) |

## What Already Exists

The doge-api codebase already has the key primitives:

- **`describe()`** — structured endpoint metadata (params, types, allowed values, response fields)
- **`DogeResult`** — response envelope with `toMarkdown()`, `toCSV()`, `summary()`
- **MCP schema generation** — `src/mcp.ts` builds Zod schemas from `describe()` output
- **CLI flag parsing** — `src/cli.ts` maps `--kebab-case` flags to `snake_case` params
- **Retry + pagination** — exponential backoff on 429, `.pages()` and `.all()` helpers

These generalize directly into `govdata-core` with minimal changes.

## Monorepo Structure

Bun workspaces with a root `package.json` (`"workspaces": ["packages/*"]`). All packages live under `packages/`.

```
govdata/
  package.json              # root workspace config (private: true)
  packages/
    govdata-core/           # shared types, retry, pagination, describe protocol
    doge-api/               # DOGE plugin, depends on govdata-core
    usaspending-api/        # USAspending plugin, depends on govdata-core
    govdata-cli/            # unified CLI binary
    govdata-mcp/            # unified MCP server binary
```

Cross-package dependencies use `"workspace:*"` references. `bun install` at the root symlinks everything — no publishing needed during development.

### Unified Binaries: Static Imports

The `govdata-cli` and `govdata-mcp` packages use static imports to include all plugins:

```ts
import { doge } from "doge-api";
import { usaspending } from "usaspending-api";
const plugins = [doge, usaspending];
```

Adding a new data source means adding one import line in each. `bun build --compile` produces fully self-contained binaries.

### Per-Plugin Binaries

Each plugin package can still declare its own `bin` entries and compile standalone binaries (e.g. `doge-api`, `doge-mcp`). Users who only need one source don't need the unified package.

### Why Not Dynamic Plugin Discovery

A dynamic approach (load plugins from config/directory at runtime) would prevent `bun build --compile` from producing a self-contained binary. It's worth considering later if third-party plugins become a goal, but static imports are simpler and sufficient for now.
