# cpsc-api

Typed client, CLI tool, and MCP server for the **US Consumer Product Safety Commission (CPSC)** SaferProducts API. Search product recalls, civil/criminal penalties, and related reference data.

## Library Usage

```ts
import { cpsc } from "cpsc-api";

// Search recalls by date range
const recent = await cpsc.recalls({
  RecallDateStart: "2025-01-01",
  RecallDateEnd: "2025-01-31",
});

// Find a specific recall
const recall = await cpsc.recalls({ RecallID: 10141 });

// Search by product, manufacturer, hazard, etc.
const results = await cpsc.recalls({
  ProductName: "hair dryer",
  ManufacturerCountry: "China",
});

// Search civil penalties
const fines = await cpsc.penalties({
  penaltytype: "civil",
  fiscalyear: "2025",
});

// List penalty companies, products, fiscal years
const companies = await cpsc.penaltyCompanies({ penaltytype: "civil" });
const products = await cpsc.penaltyProducts({ penaltytype: "criminal" });
const years = await cpsc.penaltyYears();
```

### Factory

```ts
import { createCpsc } from "cpsc-api";

const client = createCpsc({ maxRetries: 5 });
const result = await client.recalls({ RecallDateStart: "2025-01-01" });
```

## CLI Usage

```bash
# Search recalls
cpsc-api recalls --RecallDateStart 2025-01-01 --RecallDateEnd 2025-01-31
cpsc-api recalls --RecallID 10141
cpsc-api recalls --ProductName mattress --ManufacturerCountry China

# Search penalties
cpsc-api penalties --penaltytype civil --fiscalyear 2025
cpsc-api penalties --penaltytype criminal

# List reference data
cpsc-api penalty-companies
cpsc-api penalty-products --penaltytype criminal
cpsc-api penalty-years

# JSON output
cpsc-api recalls --RecallID 10141 --json

# Help
cpsc-api --help
```

## MCP Server

```json
{
  "mcpServers": {
    "cpsc": {
      "command": "bun",
      "args": ["run", "packages/cpsc-api/src/mcp.ts"]
    }
  }
}
```

### Tools

| Tool | Description |
|------|-------------|
| `cpsc_recalls` | Search product recalls |
| `cpsc_penalties` | Search civil/criminal penalties |
| `cpsc_penalty-companies` | List penalty companies |
| `cpsc_penalty-products` | List penalty product types |
| `cpsc_penalty-years` | List penalty fiscal years |
| `cpsc_describe` | Describe all endpoints |

## API Details

- **Base URL**: `https://www.saferproducts.gov/RestWebServices/`
- **Authentication**: None required
- **Rate limiting**: None documented
- **Pagination**: None — use date ranges to limit result size

## Endpoints

### recalls

Search product recalls. All parameters are optional wildcard/case-insensitive searches.

| Parameter | Type | Description |
|-----------|------|-------------|
| `RecallID` | number | Recall ID |
| `RecallNumber` | string | Recall number |
| `RecallDateStart` | string | Start date (YYYY-MM-DD) |
| `RecallDateEnd` | string | End date (YYYY-MM-DD) |
| `RecallTitle` | string | Search in title |
| `ProductName` | string | Product name |
| `ProductType` | string | Product type |
| `Hazard` | string | Hazard description |
| `Manufacturer` | string | Manufacturer name |
| `ManufacturerCountry` | string | Country of manufacture |
| `RemedyOption` | string | Refund, Replace, or Repair |

### penalties

Search civil or criminal penalties.

| Parameter | Type | Description |
|-----------|------|-------------|
| `penaltytype` | string | `civil` or `criminal` (default: civil) |
| `company` | string | Company name filter |
| `product` | string | Product type filter |
| `fiscalyear` | string | Fiscal year filter |

### penalty-companies / penalty-products / penalty-years

List reference data for penalties. All accept optional `penaltytype` (default: civil).
