# Public Dataset API/Wrapper/MCP Gap Analysis

Date: February 15, 2026

## Context
This note captures public datasets similar to NAICS where there appears to be a strong product opportunity because:

- there is no good existing API consumption path (even if data is public),
- there are no strong maintained wrapper libraries,
- there is no clear AI-agent integration path (MCP or equivalent) for practical use.

## Top Opportunities

## 1) BLS QCEW (Quarterly Census of Employment and Wages)
- API gap: BLS indicates publication DB/API coverage is less than 10% of QCEW; full access depends on bulk/open files.
- Library gap: Existing wrappers appear thin or stale (examples include older npm/Python/R efforts).
- AI agent gap: No dominant QCEW-specific MCP implementation found.

Why this is strong:
- Large, economically important labor dataset.
- Regular updates and heavy analyst demand.
- Significant friction between raw files and developer-ready usage.

## 2) NCES CIP + CIP↔SOC Crosswalk
- API gap: Delivery appears centered on browse/download resources and manuals, not a robust modern developer API.
- Library gap: No obvious maintained, widely adopted Python/JS SDK surfaced.
- AI agent gap: No dedicated CIP/CIP-SOC MCP surfaced.

Why this is strong:
- Classification/crosswalk problem aligns with NAICS-style developer workflows.
- High value for education-to-occupation analytics and workforce tooling.

## 3) OMB/Census Metropolitan Delineation (CBSA/MSA)
- API gap: Census delineations are distributed as files/tables rather than a clear API product.
- Library gap: Existing packages appear narrow/single-purpose.
- AI agent gap: No common dedicated delineation MCP surfaced.

Why this is strong:
- Essential geography primitives for regional economic analysis.
- High integration pain for analysts and product teams.

## 4) IRS SOI Geographic Tax Statistics
- API gap: Delivery is largely yearly file downloads (XLSX/ZIP/CSV), not a clean query API.
- Library gap: Existing wrappers are ad hoc and workflow-specific.
- AI agent gap: No mainstream SOI-focused MCP surfaced.

Why this is strong:
- Valuable tax/income geography insights.
- Repeated ETL burden for users.

## 5) CDC WONDER (Geographic/Public Health analytics workflows)
- API gap: XML-over-POST with database-specific query constraints; harder than modern JSON APIs.
- Library gap: Existing wrappers are limited or early-stage.
- AI agent gap: No widely adopted dedicated WONDER MCP surfaced.

Why this is strong:
- Important public health and mortality analytics source.
- Data access complexity blocks practical use.

## 6) CDC NIOCCS (industry/occupation coding)
- API gap: CDC indicates web API is no longer supported.
- Library gap: No clear maintained successor ecosystem surfaced.
- AI agent gap: No dedicated NIOCCS MCP surfaced.

Why this is strong:
- Concrete coding workflow that maps well to agent/tool automation.

## Recommended Prioritization
If building from a NAICS foundation, highest leverage appears to be:

1. QCEW developer SDK + MCP
2. CIP/CIP-SOC SDK + MCP
3. CBSA delineation/crosswalk SDK + MCP

Rationale:
- Similar classification/crosswalk patterns as NAICS.
- Regular updates and recurring user demand.
- Strong “file-based public data -> ergonomic API/SDK/agent tool” conversion opportunity.

## Source Links
- BLS QCEW data files + API coverage context:
  - https://www.bls.gov/cew/about-data/data-files-guide.htm
  - https://www.bls.gov/cew/data-overview.htm
- Example wrapper/library references (age/maintenance signal):
  - https://rdrr.io/github/jjchern/qcewAPI/
  - https://www.skypack.dev/view/qcew
  - https://pypi.org/project/bls-datasets/
- NCES CIP and crosswalk resources:
  - https://nces.ed.gov/ipeds/cipcode/
  - https://nces.ed.gov/ipeds/cipcode/resources.aspx?y=56
  - https://nces.ed.gov/ipeds/cipcode/Files/IES2020_CIP_SOC_Crosswalk_508C.pdf
- Census metropolitan delineation files:
  - https://www.census.gov/programs-surveys/metro-micro/about/delineation-files.html
  - https://pypi.org/project/ziptocbsa/
- IRS SOI geographic data:
  - https://www.irs.gov/statistics/soi-tax-stats-county-data
  - https://www.irs.gov/statistics/soi-tax-stats-data-by-geographic-area
- CDC WONDER API + wrappers:
  - https://wonder.cdc.gov/wonder/help/wonder-api.html
  - https://pypi.org/project/cdcwonderpy/
  - https://socdatar.github.io/wonderapi/
- CDC NIOCCS:
  - https://wwwn.cdc.gov/nioccs/
- MCP baseline/reference list used for absence checks:
  - https://github.com/modelcontextprotocol/servers
