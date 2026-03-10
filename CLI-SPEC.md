# Govdata CLI Specification

A CLI spec for govdata, synthesized from [clig.dev](https://clig.dev/), [Usage spec](https://usage.jdx.dev/spec/), and emerging agent-friendly CLI patterns from [Poehnelt](https://justin.poehnelt.com/posts/rewrite-your-cli-for-ai-agents/), [Speakeasy](https://www.speakeasy.com/blog/engineering-agent-friendly-cli), and others.

## Command Structure

```
govdata <source> <endpoint> [--param value ...]
```

All CLIs follow the dispatch pattern: source selects a plugin, endpoint selects an operation, flags provide parameters. No positional arguments beyond source and endpoint.

### Source Aliases

Common abbreviations are accepted:

| Alias | Source |
|-------|--------|
| `fr` | `federal-register` |
| `dol` | `dol-open-data-api` |

Aliases resolve before plugin lookup in `dispatch()`.

### Standalone Plugin CLIs

Each plugin also ships a standalone binary (e.g. `doge-api`, `federal-register-cli`) that omits the source argument:

```
doge-api <endpoint> [--param value ...]
```

Standalone CLIs must follow the same spec as the unified CLI.

## Global Flags

These flags are handled before dispatch and apply to all commands:

| Flag | Behavior |
|------|----------|
| `--help` | Show help text and exit 0 |
| `--json` | Pretty-print JSON output (2-space indent) |
| `--quiet` | Suppress all output except the JSON payload on stdout; suppress stderr unless exit code > 0 |
| `--version` | Print version and exit 0 |

Global flags must be stripped from args before passing to endpoint functions.

## Help System

Help is the primary discovery mechanism for both humans and agents.

### Levels

1. **Top-level**: `govdata --help` — lists all sources with endpoint counts
2. **Source-level**: `govdata <source> --help` — lists all endpoints with descriptions
3. **Endpoint-level**: `govdata <source> <endpoint> --help` — shows params, types, allowed values, and response fields

### Human-Readable Help (default)

```
$ govdata doge grants --help

Usage: govdata doge grants [--param value ...]

Parameters:
  --sort-by <string>     Sort field (savings, value, date)
  --sort-order <string>  Sort direction (asc, desc)
  --page <number>        Page number
  --per-page <number>    Results per page

Response fields: date, agency, recipient, value, savings, link, description
```

All content is generated dynamically from `plugin.describe()`.

### Machine-Readable Help (`--help --json`)

When both `--help` and `--json` are present, emit the `describe()` metadata as JSON instead of formatted text. This is the primary agent discovery mechanism.

```bash
$ govdata --help --json
```
```json
{
  "name": "govdata",
  "version": "0.1.0",
  "sources": [
    { "prefix": "doge", "aliases": [], "endpointCount": 5 },
    { "prefix": "federal-register", "aliases": ["fr"], "endpointCount": 9 }
  ]
}
```

```bash
$ govdata doge --help --json
```
```json
{
  "prefix": "doge",
  "endpoints": [
    {
      "name": "grants",
      "path": "/savings/grants",
      "description": "List cancelled grants with savings data",
      "params": [
        { "name": "sort_by", "type": "string", "required": false, "values": ["savings", "value", "date"] },
        { "name": "page", "type": "number", "required": false }
      ],
      "responseFields": ["date", "agency", "recipient", "value", "savings", "link", "description"]
    }
  ]
}
```

```bash
$ govdata doge grants --help --json
```
```json
{
  "name": "grants",
  "path": "/savings/grants",
  "description": "List cancelled grants with savings data",
  "params": [
    { "name": "sort_by", "type": "string", "required": false, "values": ["savings", "value", "date"] },
    { "name": "sort_order", "type": "string", "required": false, "values": ["asc", "desc"] },
    { "name": "page", "type": "number", "required": false },
    { "name": "per_page", "type": "number", "required": false }
  ],
  "responseFields": ["date", "agency", "recipient", "value", "savings", "link", "description"]
}
```

## Output

### Response Envelope

All successful responses use the standard `GovResult` envelope:

```json
{
  "data": "...",
  "meta": { "total": 100, "page": 1, "per_page": 10 },
  "kind": "grants"
}
```

- Without `--json`: compact JSON (no whitespace)
- With `--json`: pretty-printed (2-space indent)
- With `--quiet`: same as without `--json`, but no stderr output

### Streams

- **stdout**: JSON payload only (response envelope or help JSON)
- **stderr**: Error messages, warnings, help text (when not `--json`)

Help text currently goes to stdout for human readability. Machine-readable help (`--help --json`) always goes to stdout.

## Exit Codes

| Code | Meaning | Example |
|------|---------|---------|
| `0` | Success | Normal response or `--help` / `--version` |
| `1` | User error | Unknown source, unknown endpoint, bad flag value |
| `2` | API error | Upstream 4xx/5xx, network failure, timeout |
| `3` | Internal error | Unexpected crash, bug |

Agents can branch on exit code without parsing stderr.

## Flag Parsing

### Conventions

- Long flags only: `--param-name value` (no single-letter shortcuts in dispatch-based CLIs)
- Kebab-case flags are converted to snake_case params: `--sort-by` → `sort_by`
- Boolean flags: `--flag` with no following value → `true`
- Numeric coercion: string values that look numeric are coerced to `number`
- Unknown flags are passed through to the endpoint (validated downstream by Zod schemas)

### No Positional Arguments

Beyond `<source>` and `<endpoint>`, all parameters must be named flags. This keeps the interface uniform and self-documenting. Plugins that previously used positional args (e.g. `naics get 722511`) should migrate to flag style (`naics get --code 722511`).

## Error Messages

Errors should be actionable and suggest corrections:

```
Unknown source 'doj'. Available: doge, naics, dol, federal-register, usaspending
Did you mean 'dol'?
```

```
Unknown endpoint 'grant' for source 'doge'. Available: grants, contracts, leases, payments, statistics
Did you mean 'grants'?
```

```
Missing required parameter 'code' for endpoint 'get'.
Usage: govdata naics get --code <string>
```

## What This Spec Explicitly Skips

These are intentionally deferred — not needed given our current scope:

| Feature | Reason |
|---------|--------|
| `--dry-run` | All endpoints are read-only; no mutations to preview |
| `--params '{...}'` | Flag surface is small enough; raw JSON adds complexity without gain |
| Field masks | Responses are already scoped per-endpoint |
| Shell completions | Low ROI at current plugin count; revisit when > 10 sources |
| Man pages | Same as above |
| Config files | No auth tokens or persistent settings to store |
| Skill files | MCP server already provides typed tool schemas for agents |
| Short flags (`-j`, `-h`) | Keeping it simple; one way to do things |
| Interactive prompts | Not applicable — all commands are non-interactive by design |
| `NO_COLOR` / color | We output JSON, not colored text |

## Implementation Priority

1. **`--help --json`** — Machine-readable describe output (highest agent value)
2. **`--version`** — Trivially expected by all CLI conventions
3. **Semantic exit codes** — 0/1/2/3 instead of just 0/1
4. **Endpoint-level `--help`** — Show params/types/values for a single endpoint
5. **`--quiet`** — Contract for suppressing non-payload output
6. **Source aliases** — `fr`, `dol` shorthand
7. **Standardize CLI styles** — Migrate naics/dol-api to dispatch pattern
8. **Fuzzy suggestions** — "Did you mean?" for typos in source/endpoint names
