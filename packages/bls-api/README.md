# bls-api

Typed client, CLI, and MCP server for the [Bureau of Labor Statistics (BLS) Public Data API](https://www.bls.gov/developers/).

## Library Usage

```ts
import { bls, createBls } from "bls-api";

// Fetch CPI data
const result = await bls.timeseries({
  series_id: "CUUR0000SA0",
  start_year: 2020,
  end_year: 2025,
});
console.log(result.data); // Series[]

// Multiple series at once
const multi = await bls.timeseries({
  series_id: ["CUUR0000SA0", "LNS14000000"],
});

// List available surveys
const surveys = await bls.surveys();

// Get popular series IDs
const popular = await bls.popular();

// Factory with custom options
const client = createBls({ maxRetries: 5 });
```

## CLI Usage

```bash
# Fetch CPI time series
bls-api timeseries --series-id CUUR0000SA0

# Multiple series (comma-separated)
bls-api timeseries --series-id CUUR0000SA0,CES0500000001 --start-year 2020 --end-year 2025

# List surveys
bls-api surveys

# Popular series
bls-api popular

# JSON output
bls-api timeseries --series-id CUUR0000SA0 --json

# Help
bls-api --help
```

## MCP Server

```json
{
  "mcpServers": {
    "bls": {
      "command": "bun",
      "args": ["run", "packages/bls-api/src/mcp.ts"]
    }
  }
}
```

Tools: `bls_timeseries`, `bls_surveys`, `bls_popular`, `bls_describe`

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `BLS_API_KEY` | No | API registration key. Without: 25 queries/day. With: 500 queries/day. |

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `timeseries` | POST | Fetch time series data for BLS series IDs |
| `surveys` | GET | List all available BLS surveys |
| `popular` | GET | Get the 25 most popular BLS time series |

## Common Series IDs

| ID | Description |
|----|-------------|
| `CUUR0000SA0` | CPI-U (All items, US city average) |
| `LNS14000000` | Unemployment rate |
| `CES0500000001` | Total nonfarm employment |
| `WPUFD4` | PPI - Final demand |
