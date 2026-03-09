# federal-register

Typed TypeScript client for the [Federal Register API](https://www.federalregister.gov/developers/documentation/api/v1) (federalregister.gov/api/v1). Search and retrieve rules, proposed rules, notices, and presidential documents published since 1994.

No API key required.

- Single dependency ([Zod](https://github.com/colinhacks/zod))
- All inputs and outputs validated at runtime
- Automatic retry with exponential backoff on rate limiting (429)
- Auto-pagination with `.pages()` and `.all()`
- Formatting helpers: `.toMarkdown()`, `.toCSV()`, `.summary()`
- Runtime discoverability via `describe()`
- Agent-ready CLI with structured JSON output

## Setup

This package is part of the [govdata](../../README.md) monorepo. It's available as a workspace dependency:

```json
{
  "dependencies": {
    "federal-register": "workspace:*"
  }
}
```

## Library usage

```ts
import { fr } from "federal-register";

// Search documents
const result = await fr.documents.search({
  term: "clean energy",
  agencies: ["environmental-protection-agency"],
  type: ["RULE", "PRORULE"],
  publication_date_gte: "2024-01-01",
  per_page: 10,
});
console.log(result.data);  // Document[]
console.log(result.meta);  // { total_results: number, pages: number }

// Find a single document by number
const doc = await fr.documents.find("2025-07743");
console.log(doc.data[0].title);
console.log(doc.data[0].agencies);

// Find multiple documents at once
const multi = await fr.documents.findMany(["2025-07743", "2025-00574"]);
console.log(multi.data.length);

// List all agencies
const agencies = await fr.agencies.all();
console.log(agencies.data.length); // ~470

// Find a specific agency by ID
const epa = await fr.agencies.find(145);
console.log(epa.data[0].name); // "Environmental Protection Agency"

// Search public inspection documents
const pi = await fr.publicInspection.search({ per_page: 5 });
console.log(pi.data); // PIDocument[]

// Get documents currently on public inspection
const current = await fr.publicInspection.current();

// Get faceted counts (by agency, daily, topic, section, or type)
const facets = await fr.facets.get("agency", { term: "regulation" });
// { "epa": { count: 1234, name: "Environmental Protection Agency" }, ... }

// Get curated suggested search topics
const suggestions = await fr.suggestedSearches.all();
```

### Search parameters

Document search supports a wide range of filters:

```ts
await fr.documents.search({
  // Full-text
  term: "climate change",

  // Filter by document type
  type: ["RULE", "PRORULE", "NOTICE", "PRESDOCU"],

  // Filter by agency slug
  agencies: ["environmental-protection-agency", "energy-department"],

  // Date ranges (publication, effective, comment, signing)
  publication_date_gte: "2024-01-01",
  publication_date_lte: "2024-12-31",
  effective_date_gte: "2024-06-01",
  comment_date_lte: "2024-03-01",

  // Presidential documents
  presidential_document_type: ["executive_order"],
  president: ["joe-biden"],

  // Regulatory identifiers
  docket_id: "EPA-HQ-OAR-2021-0317",
  regulation_id_number: "2060-AV67",

  // Select specific fields (reduces response size)
  fields: ["document_number", "title", "type", "abstract"],

  // Sort order
  order: "newest", // "relevance" | "newest" | "oldest" | "executive_order_number"

  // Pagination
  per_page: 20,
  page: 1,
});
```

### Formatting helpers

Every result has `.summary()`, `.toMarkdown()`, and `.toCSV()`:

```ts
const result = await fr.documents.search({ term: "tax", per_page: 5 });

result.summary();    // "documents: 5 of 10000 results (2000 pages)"
result.toMarkdown(); // markdown table
result.toCSV();      // CSV with proper escaping
```

### Auto-pagination

Paginated endpoints (`documents.search`, `publicInspection.search`) have `.pages()` and `.all()`:

```ts
// Lazy iteration — one page at a time
for await (const page of fr.documents.search.pages({ term: "energy" })) {
  console.log(page.data);
}

// Collect everything
const all = await fr.documents.search.all({ term: "energy" });
console.log(all.data.length); // all documents across all pages

// Safety limit (default: 100 pages)
const limited = await fr.documents.search.all(
  { term: "energy" },
  { maxPages: 10 },
);
```

### Runtime discoverability

`describe()` returns structured metadata about all endpoints — useful for agents that need to discover the API at runtime:

```ts
const info = fr.describe();

for (const endpoint of info.endpoints) {
  console.log(endpoint.name);           // "documents"
  console.log(endpoint.path);           // "/documents.json"
  console.log(endpoint.description);    // "Search Federal Register documents..."
  console.log(endpoint.params);         // [{ name: "term", type: "string", ... }]
  console.log(endpoint.responseFields); // ["document_number", "title", ...]
}
```

### Custom client

```ts
import { createFederalRegister } from "federal-register";

const client = createFederalRegister({
  maxRetries: 5,
  initialRetryMs: 2000,
});

const result = await client.documents.search({ term: "energy" });
```

### Error handling

```ts
import { fr, FRApiError, FRRateLimitError, FRValidationError } from "federal-register";

try {
  await fr.documents.search({ order: "invalid" as any });
} catch (err) {
  if (err instanceof FRValidationError) {
    console.log(err.field, err.received, err.expected);
  }
  if (err instanceof FRRateLimitError) {
    console.log(err.retryAfterMs);
  }
  if (err instanceof FRApiError) {
    console.log(err.status, err.message);
  }
}
```

### Types

```ts
import type {
  Document, Agency, PIDocument,
  DocumentSearchParams, PISearchParams, FacetTypeValue,
  FRResult, EndpointKind, ClientOptions, PaginatedEndpoint,
  EndpointDescription, ParamDescription,
} from "federal-register";
```

## CLI

```bash
# Run with bun directly
bun packages/federal-register/src/cli.ts documents --term "executive order" --type PRESDOCU --per-page 5

# Or via the unified govdata CLI
bun packages/govdata-cli/src/cli.ts federal-register documents --term "clean energy"
```

Structured JSON output, suitable for piping into `jq` or agent toolchains:

```bash
# Search documents
federal-register documents --term "regulation" --agencies epa --per-page 10

# Get a single document
federal-register document --document-number 2025-07743

# List agencies
federal-register agencies

# Get an agency
federal-register agency --id 145

# Public inspection
federal-register public_inspection --per-page 5
federal-register public_inspection_current

# Facets
federal-register facets --facet-type agency --term regulation
federal-register facets --facet-type daily --publication-date-gte 2025-01-01

# Suggested searches
federal-register suggested_searches

# Pretty-print
federal-register documents --term energy --per-page 3 --json
```

Output shape:

```json
{
  "data": [{ "document_number": "2025-07743", "title": "...", "type": "Rule", ... }],
  "meta": { "total_results": 10000, "pages": 50 },
  "kind": "documents"
}
```

## MCP Server

The MCP server lets AI agents (Claude Desktop, etc.) query the Federal Register directly as tools.

Add to your Claude Desktop config (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "federal-register": {
      "command": "bun",
      "args": ["run", "/path/to/federal-register/src/mcp.ts"]
    }
  }
}
```

Tools: `federal-register_documents`, `federal-register_document`, `federal-register_documents_multi`, `federal-register_agencies`, `federal-register_agency`, `federal-register_public_inspection`, `federal-register_public_inspection_current`, `federal-register_facets`, `federal-register_suggested_searches`, `federal-register_describe`. Each tool accepts a `format` param (`markdown`, `csv`, or `json`).

## API endpoints

| Method | Endpoint | Paginated |
|---|---|---|
| `fr.documents.search()` | `GET /documents.json` | Yes |
| `fr.documents.find(num)` | `GET /documents/{num}.json` | No |
| `fr.documents.findMany(nums)` | `GET /documents/{n1},{n2}.json` | No |
| `fr.agencies.all()` | `GET /agencies.json` | No |
| `fr.agencies.find(id)` | `GET /agencies/{id}.json` | No |
| `fr.publicInspection.search()` | `GET /public-inspection-documents.json` | Yes |
| `fr.publicInspection.current()` | `GET /public-inspection-documents/current.json` | No |
| `fr.facets.get(type)` | `GET /documents/facets/{facet_type}` | No |
| `fr.suggestedSearches.all()` | `GET /suggested_searches.json` | No |

Facet types: `agency`, `daily`, `topic`, `section`, `type`.

## Development

```bash
bun install
bun test                          # 89 unit tests
bun fixtures/fetch-fixtures.ts    # refresh API fixtures
bun fixtures/exercise-api.ts      # run live API integration tests
```

## Data source

All data comes from the [Federal Register](https://www.federalregister.gov/), the daily journal of the United States government. The API is maintained by the [Office of the Federal Register](https://www.archives.gov/federal-register) (National Archives). Data is available from 1994 to present.
