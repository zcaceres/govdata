# Tech Debt

## Standardize plugin param validation patterns

**Status**: Idea for future

Currently each plugin handles CLI input params differently:

- **doge-api, federal-register**: CLI params flow directly through `validateParams` → `schema.parse()`. Zod does all validation. Schemas use `.strict()` to reject unknown keys.
- **usaspending-api**: `plugin.ts` manually picks specific keys from raw params and restructures them into nested POST bodies via `buildFilters()`. Zod validates the constructed object downstream, not raw CLI input. Unknown CLI flags are silently ignored.
- **dol-open-data-api**: `plugin.ts` `makeEndpoint` manually extracts known keys (`limit`, `offset`, `sort`, etc.) and coerces types. Zod validates downstream in `client.ts`. Unknown CLI flags are silently ignored.
- **naics-api**: No Zod for params at all. Imperative validation in `params.ts` with manual checks.

The doge/FR pattern (Zod end-to-end with `.strict()`) is the cleanest. The others can't use it directly because their APIs need structural transformation (flat CLI flags → nested POST bodies) that a simple `.parse()` can't express.

A possible future approach: define a "CLI params schema" per plugin that validates the flat input, then a separate transform step that reshapes into the API's expected structure. This would give every plugin consistent unknown-key rejection and validation error messages.
