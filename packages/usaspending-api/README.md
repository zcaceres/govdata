# usaspending-api

Typed client, CLI tool, and MCP server for [USAspending.gov](https://www.usaspending.gov) — the official source for federal spending data.

## Library Usage

```ts
import { usa, createUSASpending } from "usaspending-api";

// Search federal awards
const awards = await usa.awards.search({
  filters: {
    keywords: ["NASA"],
    time_period: [{ start_date: "2024-01-01", end_date: "2024-12-31" }],
    award_type_codes: ["A", "B", "C", "D"],
  },
  limit: 10,
  sort: "Award Amount",
  order: "desc",
});

// Paginate through all results
const allAwards = await usa.awards.search.all({
  filters: { keywords: ["NASA"] },
});

// Get award detail
const award = await usa.awards.find("CONT_AWD_NNM07AB03C_8000_-NONE-_-NONE-");

// Agency overview
const agency = await usa.agencies.overview("080"); // NASA

// Spending by agency
const spending = await usa.spending.byAgency({
  type: "agency",
  filters: { fy: "2024", period: "12" },
});

// Spending by state
const states = await usa.spending.byState();

// Spending over time
const trend = await usa.spending.overTime({
  group: "fiscal_year",
  filters: {
    keywords: ["climate"],
    time_period: [{ start_date: "2020-01-01", end_date: "2024-12-31" }],
  },
});

// Custom instance with options
const custom = createUSASpending({ maxRetries: 5 });
```

## CLI Usage

```bash
# Search awards
bun run packages/usaspending-api/src/cli.ts awards --keyword NASA --limit 5

# Get award detail
bun run packages/usaspending-api/src/cli.ts award --id CONT_AWD_NNM07AB03C_8000_-NONE-_-NONE-

# Agency overview
bun run packages/usaspending-api/src/cli.ts agency --toptier-code 080

# Spending by agency
bun run packages/usaspending-api/src/cli.ts spending_by_agency --type agency --fy 2024 --period 12

# Spending by state
bun run packages/usaspending-api/src/cli.ts spending_by_state

# Spending over time
bun run packages/usaspending-api/src/cli.ts spending_over_time --group fiscal_year --keyword NASA

# JSON output
bun run packages/usaspending-api/src/cli.ts awards --keyword NASA --json
```

Or via the unified CLI:

```bash
govdata usaspending awards --keyword NASA --limit 5
govdata usaspending spending_by_state
```

## MCP Usage

### Standalone

```json
{
  "mcpServers": {
    "usaspending": {
      "command": "bun",
      "args": ["run", "/path/to/packages/usaspending-api/src/mcp.ts"]
    }
  }
}
```

### Unified (govdata-mcp)

The usaspending plugin is included in the unified `govdata-mcp` server.

## Endpoints

| Name | Method | Description |
|------|--------|-------------|
| `awards` | POST | Search federal awards with keyword, date, type, agency, NAICS, recipient, state filters |
| `award` | GET | Get detailed information about a specific award |
| `agency` | GET | Get agency overview by toptier code |
| `spending_by_agency` | POST | Federal spending breakdown by agency for a fiscal year |
| `spending_by_state` | GET | Total federal spending by state/territory |
| `spending_over_time` | POST | Spending trends by fiscal year, quarter, or month |

## Award Type Codes

When using the CLI/MCP, pass human-readable award type names:

| Name | API Codes |
|------|-----------|
| `contracts` | A, B, C, D |
| `idvs` | IDV_A, IDV_B, IDV_B_A, etc. |
| `grants` | 02, 03, 04, 05 |
| `direct_payments` | 06, 10 |
| `loans` | 07, 08 |
| `other` | 09, 11 |

## Development

```bash
bun test --cwd packages/usaspending-api  # unit tests
bun test tests/                           # integration tests
bun run fixtures --cwd packages/usaspending-api  # refresh fixtures
```
