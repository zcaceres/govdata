# Govdata

Bun workspace monorepo providing typed clients, CLI tools, and MCP servers for US government data APIs.

## Quick Reference

```bash
bun test                        # all tests
bun test --cwd packages/<pkg>   # single package tests
bun run typecheck               # tsc -b across all packages
bun test tests/                 # integration tests only
```

## Architecture

### Plugin System

Every data source implements `GovDataPlugin` (defined in `govdata-core/src/plugin.ts`):

```ts
interface GovDataPlugin {
  prefix: string;
  describe(): { endpoints: EndpointDescription[] };
  endpoints: Record<string, (params?: any) => Promise<GovResult>>;
}
```

Every plugin runs in three modes:
- **Library** — import as a typed SDK with an ORM-style API (see below)
- **CLI** — standalone binary via `cli.ts`, also aggregated in `govdata-cli`
- **MCP** — standalone MCP server via `mcp.ts`, also aggregated in `govdata-mcp`

Plugins are statically imported in CLI and MCP packages — no dynamic discovery. This is intentional to support `bun build --compile` for standalone binaries.

### ORM-Style Library API

Each plugin exposes a `create*()` factory and a default singleton. The factory accepts `defaultOptions` (e.g. custom headers) and returns an object with endpoints grouped by resource, resembling an ORM:

```ts
// doge-api — flat namespace
import { doge } from "doge-api";
const result = await doge.grants({ sort: "amount", order: "desc" });
const all    = await doge.grants.all({ sort: "amount" }); // paginated: collect all pages

// federal-register — nested namespaces by resource
import { fr } from "federal-register";
const docs     = await fr.documents.search({ term: "climate" });
const agency   = await fr.agencies.find(333);
const allDocs  = await fr.documents.search.all({ term: "climate" });
```

Key patterns:
- `create*(defaultOptions?)` returns a bound instance; the bare singleton (e.g. `doge`, `fr`) calls `create*()` with no defaults
- Paginated endpoints get `.pages()` (async generator) and `.all()` via `withPagination()`
- Every instance also has a `describe()` method for introspection
- Nested grouping (e.g. `fr.documents.search`, `fr.agencies.find`) is preferred when a data source has distinct resource types

### Packages

| Package | Role |
|---------|------|
| `govdata-core` | Shared core: errors, HTTP client (`govGet`), response envelope (`createResult`), pagination (`withPagination`), plugin interface, CLI/MCP utilities |
| `doge-api` | DOGE API client (api.doge.gov) |
| `naics-api` | NAICS code lookup (local SQLite, no HTTP) |
| `federal-register` | Federal Register API (custom `frGet` client for bracket-syntax params) |
| `dol-open-data-api` | Department of Labor open data API |
| `govdata-cli` | Unified CLI using `dispatch()` from core |
| `govdata-mcp` | Unified MCP server looping over all plugins |

### Core Patterns

- **Response envelope**: `GovResult` with `data`, `meta`, `kind`. `data` is `unknown` in core; plugins narrow via type aliases (e.g. `DogeResult<"grants">`)
- **HTTP client**: `govGet(path, schema, params?, options?)` — requires `baseUrl` in options. Retries on 429 with exponential backoff. Plugin-specific wrappers (e.g. `dogeGet`) set the base URL.
- **Pagination**: `withPagination(fn)` adds `.pages()` (async generator) and `.all()` (collect all pages) to any endpoint function
- **Describe**: Each plugin exports `describe()` returning endpoint metadata. Used by CLI for help and MCP for tool schema generation.
- **Param coercion**: CLI's `parseFlags` converts numeric-looking strings to numbers. Plugin wrappers in `plugin.ts` must coerce back with `String()` / `Number()` where the underlying API expects a specific type.

## Adding a New Plugin

1. Create `packages/<name>/` with `src/index.ts` exporting the plugin object
2. Implement the ORM-style library API: `create*()` factory + default singleton with endpoints grouped by resource
3. Implement `GovDataPlugin` interface: `prefix`, `describe()`, `endpoints` — this is the flat adapter used by CLI/MCP
4. Create `describe.ts` with endpoint metadata (name, path, params, responseFields)
5. Wrap endpoint functions in `plugin.ts` with param coercion for CLI compatibility
6. Add `cli.ts` and `mcp.ts` standalone binaries for the plugin. CLI must support `--help` (see CLI conventions below)
7. Write a `README.md` documenting library usage, CLI usage, MCP usage, and available endpoints
8. Add `workspace:*` dependency in root `package.json`
9. Import plugin statically in `govdata-cli` and `govdata-mcp`
10. Add `test:<name>` script to root `package.json`
11. Add to `typecheck` script in root `package.json`

## Conventions

### TypeScript
- Target: ESNext, Module: ESNext, moduleResolution: bundler
- Strict mode enabled
- All packages are `"type": "module"` (ESM)
- tsconfig `include` should list `src/**/*.ts` only — exclude tests to prevent dist/ duplication
- Zod 4 is used throughout. Key gotchas:
  - `z.record()` requires TWO args: `z.record(keySchema, valueSchema)`. Single-arg crashes at runtime.
  - Enum validation errors use `issue.message` (not `.options` on the issue object)

### Testing
- Bun test runner (`import { describe, it, expect, mock, afterEach }`)
- Mock `globalThis.fetch` directly, restore in `afterEach`
- Load JSON fixtures with `Bun.file(...).json()`
- Test files live in `tests/` directory within each package
- Integration tests at repo root `tests/` verify plugin contract and CLI/MCP dispatch

### Naming
- Plugin prefix is kebab-case: `"federal-register"`, `"doge"`, `"naics"`
- MCP tool names: `${prefix}_${endpointName}` (e.g. `doge_grants`)
- Error classes may be aliased (e.g. `GovApiError as DogeApiError`) — same class at runtime

### Files
- Each plugin has: `client.ts`, `endpoints.ts` (or domain-specific), `describe.ts`, `plugin.ts`, `index.ts`
- Standalone binaries: `cli.ts`, `mcp.ts` per plugin (for individual use outside the unified tools)
- `plugin.ts` is the adapter that wraps typed endpoints for the generic `GovDataPlugin` interface
- Every plugin must have a `README.md` documenting library API, CLI usage, and MCP setup

### CLI Conventions
- Every standalone `cli.ts` must support `--help` that lists all endpoints with descriptions and exits with code 0
- `--help` with no command shows top-level usage; the unified `govdata-cli` also supports `govdata <source> --help` for per-source help via `dispatch()`
- CLIs should be agent-friendly: clear output, structured errors, discoverable via `--help`
- Pattern: check for `--help` in args or empty args before dispatching; use `plugin.describe()` to generate help text dynamically

### Three-Mode Requirement
Every plugin must work as:
1. **Library** — ORM-style typed SDK importable by other TypeScript/JS projects
2. **CLI** — standalone `cli.ts` binary with `--help` support + integration with `govdata-cli`
3. **MCP** — standalone `mcp.ts` server + integration with `govdata-mcp`

## Plugin Validation Principles

These principles are derived from bugs found across multiple plugin audits. Follow them when building or modifying any plugin.

### 1. Defend against `parseFlags` type coercion
`parseFlags` converts `"123"` → `123` and bare `--flag` → `true`. Every plugin endpoint that receives CLI params must handle the possibility that types don't match what the schema or API expects. If the API needs a string, coerce with `String()`. If it needs a number, coerce with `Number()`. Don't assume the type is correct just because TypeScript says so — CLI input bypasses compile-time types.

### 2. Use `.strict()` on param schemas
Zod's `.object()` silently strips unknown keys by default. This means typos like `--sortby` (instead of `--sort-by`) succeed silently with the param ignored. Always use `.strict()` on param schemas that validate user input so unrecognized keys produce clear errors. (Response schemas should NOT use `.strict()` — APIs may add fields.)

### 3. Treat empty string as a distinct case from absent
`parseFlags` can produce empty strings (`--flag ""`), which behave differently from `undefined` in Zod validation and at the API level. Optional string params should consider whether `""` is a valid value or should be treated as absent. Use `.refine()` or explicit checks when empty strings would cause silent misbehavior.

### 4. Don't re-template Zod error messages
Zod's `issue.message` is already a human-readable sentence (e.g. `"Invalid option: expected one of ..."`). Don't wrap it in another sentence template like `"must be {message}"`. Pass it through directly or use a neutral format like `"field: {message} (got 'value')"`.

### 5. Validate interdependent params explicitly
APIs often have params that only make sense together (e.g. `filter`/`filter_value`, date range start/end). Zod's `.object()` validates each field independently. Use `.refine()` for cross-field rules — otherwise orphaned params get silently ignored by the API and users don't know their query is wrong.

### 6. Keep `describe()` in sync with schemas
When endpoints gain or lose params, `describe.ts` must be updated in the same change. `describe()` metadata drives CLI `--help` output and MCP tool schemas — if it drifts from the actual schemas, users won't discover available params and agents will construct invalid tool calls.

### 7. Guard `Number()` coercion with `Number.isFinite()`
`Number("abc")` returns `NaN`, not an error. Any plugin code that coerces user input with `Number()` must check `Number.isFinite()` before using the result — otherwise NaN propagates into URLs, API calls, or pagination logic silently. Same applies to `parseInt()` of external strings like HTTP headers.

### 8. Non-tabular data needs dedicated result builders
`createResult` from govdata-core formats data as markdown/CSV tables by calling `String()` on values. This produces `[object Object]` for nested objects. If an endpoint returns non-tabular data (e.g. `Record<string, {...}>` like facets, or objects with nested fields), build the `GovResult` object directly with custom `toMarkdown`/`toCSV`/`summary` methods — don't create via `createResult` then monkey-patch with `as any`. Use function overloads on `wrapResponse` to keep call sites type-safe.

### 9. Redact secrets from error messages
API keys or tokens appearing in URLs must be masked in error `.message` (e.g. `X-API-KEY=***`). Keep the raw value on structured fields like `.url` for programmatic use. Users copy-paste error messages into logs and issues.

### 10. Pagination: check empty before yield
In async generators that paginate, check `result.data.length === 0` and break *before* yielding — not after. Yielding then checking means callers receive one useless empty page.

### 11. Every new plugin must be added to integration tests
When adding a plugin, also add it to `tests/plugin-contract.test.ts` (plugin interface consistency) and `tests/mcp-integration.test.ts` (schema generation + tool dispatch). Include minimal fixtures for each endpoint. Without this, describe/endpoint mismatches and schema bugs ship undetected.

### 12. Escape markdown special characters in table output
Pipe `|` and newline `\n` characters in data values break markdown table rendering. Any `toMarkdown` implementation must escape these before interpolation.

### 13. Validate required params exist before coercion in plugin.ts
`String(undefined)` produces `"undefined"` and `Number(undefined) || 0` silently defaults to `0`. Plugin endpoint functions must check required params exist (`if (!params?.id) throw new ValidationError(...)`) before applying `String()`/`Number()`. Otherwise the API receives garbage values and returns confusing errors unrelated to the actual problem.

### 14. MCP tool handlers must catch endpoint errors
An unhandled throw from a plugin endpoint crashes the MCP server process. Every MCP tool handler must wrap its endpoint call in try/catch and return `{ content: [{ type: "text", text: error.message }], isError: true }` on failure. This applies to both standalone `mcp.ts` and `govdata-mcp`.

### 15. Custom clients should handle varied API error response shapes
Government APIs return errors in different formats: `{message: "..."}`, `{errors: {field: "msg"}}`, or plain text. Client error extraction must check for multiple shapes, not just `body.message`. Extract the most specific error text available so CLI users see actionable messages (e.g. `"agencies: invalid value"` instead of `"HTTP 400"`).

### 16. Never guess data shapes — fetch real data first
Do not invent response schemas, field names, or payload structures based on documentation alone or assumptions. Always fetch real data from the API and save it as a fixture before writing schemas, types, or response handling. Real responses reveal actual field names, nesting, null patterns, and edge cases that docs omit or get wrong. Use these fixtures to drive implementation and tests.

## Do Not

- Do not use dynamic imports for plugins (breaks `bun build --compile`)
- Do not use `rm` or destructive file operations — use `trash` CLI instead (enforced by hook)
- Do not add tests to tsconfig `include` arrays (causes dist/ duplication)
- Do not use single-arg `z.record(valueSchema)` — always pass key and value schemas
- Do not assume `govGet` works for all APIs — some (like Federal Register) need custom clients for non-standard param serialization
