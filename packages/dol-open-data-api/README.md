# dol-open-data-api

TypeScript client for the [U.S. Department of Labor Open Data API](https://developer.dol.gov/).

## Getting an API Key

1. Go to [data.dol.gov](https://data.dol.gov/getting-started)
2. Click **"Sign In / Register"** (top right, or [direct link](https://data.dol.gov/registration))
3. Authenticate with **LOGIN.GOV** (create an account if you don't have one)
4. Complete the registration to receive your API key

## Quick Start

```bash
bun install
```

### Save your API key

The easiest way — saves to `.env` so all future commands pick it up automatically:

```bash
dol-api setup YOUR_API_KEY
```

This writes `DOL_API_KEY=...` to a `.env` file in the project root. The CLI reads `.env` and `.env.local` automatically.

You can also pass the key per-command or export it:

```bash
# Per-command
dol-api get MSHA accident -l 5 -k YOUR_API_KEY

# Environment variable
export DOL_API_KEY=YOUR_API_KEY
dol-api get MSHA accident -l 5
```

### CLI Usage

```bash
# List all available datasets (no key needed)
dol-api datasets

# Fetch data
dol-api get MSHA accident -l 10
dol-api get MSHA accident -l 10 --format markdown
dol-api get MSHA accident -l 10 --format csv
dol-api get MSHA accident -l 10 --summary

# Describe a dataset (columns, types, metadata)
dol-api describe MSHA accident

# Fetch column metadata
dol-api metadata MSHA accident
```

### Library Usage

```ts
import { createDol } from "dol-open-data-api";

const dol = createDol({ apiKey: process.env.DOL_API_KEY! });

// ORM-style access — no strings to memorize
const result = await dol.msha.accident({ limit: 100 });

// Agent-friendly output
result.toMarkdown();  // pipe-delimited table
result.toCSV();       // RFC 4180
result.summary();     // "MSHA/accident: 100 rows, 59 columns (mine_id, cntctr_id, ...)"

// Paginate
for await (const page of dol.msha.accident.pages({}, 100)) {
  console.log(page.data.length, "rows");
}

// Fetch all pages
const all = await dol.msha.accident.all({}, 1000);

// Self-describe an endpoint
const desc = await dol.msha.accident.describe();
console.log(desc.columns);  // [{ name: "mine_id", type: "varchar" }, ...]
```

### Low-Level Client

The original string-based API is still available:

```ts
import { createClient, listDatasets } from "dol-open-data-api";

const client = createClient({ apiKey: process.env.DOL_API_KEY! });

const data = await client.getData("MSHA", "accident", { limit: 10 });
const meta = await client.getMetadata("MSHA", "accident");
const datasets = await listDatasets();
```

## Available Agencies and Endpoints

42 datasets across 9 agencies. All verified against the live API.

### EBSA — Employee Benefits Security Administration

| Endpoint | Columns |
| --- | --- |
| `ocats` | 12 |

### ETA — Employment and Training Administration

| Endpoint | Columns |
| --- | --- |
| `otaa_petition` | 66 |
| `apprenticeship_data` | 34 |
| `ui_national_weekly_claims` | 10 |
| `ui_state_weekly_claims` | 25 |

### ILAB — Bureau of International Labor Affairs

| Endpoint | Columns |
| --- | --- |
| `Child_Labor_Report__2016_to_2022` | 73 |
| `ImportWatch_Goods_HS` | 3 |
| `ImportWatch_Core_Data` | 10 |
| `ImportWatch_Country_Codes` | 8 |
| `LaborShield_ReportingData` | 62 |
| `LaborShield_Goods` | 8 |
| `LaborShield_SuggestedActions` | 6 |

### MSHA — Mine Safety and Health Administration

| Endpoint | Columns |
| --- | --- |
| `accident` | 59 |
| `address_of_records_mines` | 21 |
| `assessed_violations` | 12 |
| `commodity_lookup` | 9 |
| `contractor_employment_production_annual` | 8 |
| `contractor_employment_production_quarterly` | 12 |
| `contractor_history_at_mines` | 6 |
| `contractor_name_id_lookup` | 3 |
| `controller_history` | 7 |
| `inspection` | 54 |
| `mines` | 62 |
| `operator_employment_production_annual` | 7 |
| `operator_employment_production_quarterly` | 11 |
| `operator_history_at_mines` | 7 |
| `violation` | 55 |

### OSHA — Occupational Safety and Health Administration

| Endpoint | Columns |
| --- | --- |
| `accident` | 16 |
| `accident_abstract` | 4 |
| `accident_injury` | 21 |
| `accident_lookup2` | 5 |
| `emphasis_codes` | 4 |
| `inspection` | 36 |
| `optional_code_info` | 6 |
| `related_activity` | 6 |
| `violation` | 29 |
| `violation_event` | 10 |
| `violation_gen_duty_std` | 5 |

### TRNG — Training Administration

| Endpoint | Columns |
| --- | --- |
| `training_dataset_industries` | 3 |

### VETS — Veterans' Employment and Training Service

| Endpoint | Columns |
| --- | --- |
| `4212` | 78 |

### WB — Women's Bureau

| Endpoint | Columns |
| --- | --- |
| `ndcp` | 370 |

### WHD — Wage and Hour Division

| Endpoint | Columns |
| --- | --- |
| `enforcement` | 110 |

## Development

```bash
bun test            # run tests
bun run typecheck   # type check
```
