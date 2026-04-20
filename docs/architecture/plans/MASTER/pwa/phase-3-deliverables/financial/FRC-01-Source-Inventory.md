# FRC-01 — Financial Source Inventory

| Property | Value |
|----------|-------|
| **Doc ID** | FRC-01 |
| **Parent** | [FRC-00 Financial Replacement Crosswalk](FRC-00-Financial-Replacement-Crosswalk.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | Source Inventory |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-27 |

---

*This file inventories each operating file in [`docs/reference/example/financial/`](../../../../reference/example/financial/) and describes the business process it supports, the roles that use it, and how it fits into the replacement target classification (source baseline, working model, review gate, or output).*

---

## 1. Inventory Methodology

The inventory is drawn from `docs/reference/example/financial/` as the canonical set of current-state operating files. These files were moved from `docs/reference/example/` to the `financial/` subdirectory to establish the Financial module replacement baseline.

Each entry records:
- **Format and structure** — file type, columns/tabs/fields, data organization
- **Current usage** — how the file is used in the monthly financial cycle
- **User roles** — who creates, edits, reviews, and consumes the data
- **Data flow** — how data moves between this artifact and other artifacts or systems
- **Classification** — source baseline, working model, review gate, or output
- **Known pain points** — operational gaps that the future runtime model addresses

---

## 2. Procore_Budget.csv

### 2.1 Format and structure

CSV file with 21 columns:

| Column | Description | Example |
|--------|-------------|---------|
| Sub Job | Project/sub-job identifier | `1000 - TROPICAL WORLD NURSERY-CONSTR` |
| Cost Code Tier 1 | Top-level cost division | `10 - GENERAL CONDITIONS` |
| Cost Code Tier 2 | Sub-division | `10-01 - GENERAL CONDITIONS` |
| Cost Code Tier 3 | Specific cost code | `10-01-318 - PROJECT MANAGER` |
| Cost Type | Expense category | `LAB - Labor`, `MAT - Materials`, `LBN - Labor Burden` |
| Budget Code | Composite budget identifier | `1000.10-01-318.LAB` |
| Budget Code Description | Human-readable description | `TROPICAL WORLD NURSERY-CONSTR.PROJECT MANAGER.Labor` |
| Original Budget Amount | Original budgeted amount (USD) | `557541.43` |
| Budget Modifications | Approved modifications (USD) | `-268572.49` |
| Approved COs | Approved change orders (USD) | `0.0` |
| Revised Budget | Original + Modifications + COs | `288968.94` |
| Pending Budget Changes | Unapproved budget changes | `0.0` |
| Projected Budget | Revised + Pending | `288968.94` |
| Committed Costs | Contracted/committed amounts | `0.0` |
| Direct Costs | Direct cost expenditures | `52791.6` |
| Job to Date Costs | Total costs incurred to date | `52791.6` |
| Pending Cost Changes | Unapproved cost changes | `0.0` |
| Projected Costs | JTD + Pending | `52791.6` |
| Forecast To Complete | Remaining forecast cost | `236177.34` |
| Estimated Cost at Completion | JTD + FTC | `288968.94` |
| Projected Over/Under | Revised Budget - EAC | `0.0` |

Multi-project support via Sub Job field. Cost-code hierarchy organized in 3 tiers. Cost types: MAT (Materials), LAB (Labor), LBN (Labor Burden). All dollar amounts at 2 decimal precision.

### 2.2 Current usage

Exported from Procore monthly (or ad hoc). PM downloads the CSV, reviews line items, and manually reconciles budget amounts against the forecast spreadsheet. Serves as the authoritative budget baseline and actual cost source.

### 2.3 User roles

| Role | Action |
|------|--------|
| Accounting | Initiates Procore export |
| PM | Downloads, reviews, reconciles against forecast |
| PE | Reviews summary-level budget position |

### 2.4 Data flow

```
Procore → CSV export → PM desktop → manual comparison with Forecast Summary spreadsheet
                                   → manual comparison with GC/GR workbook
```

### 2.5 Classification

**Source baseline.** The Procore budget export is the external source of truth for budget amounts and actual costs. It feeds all downstream forecast and variance calculations.

### 2.6 Known pain points

- No stable line identity across exports — composite keys may shift when cost codes are added or renamed
- Manual reconciliation between CSV and forecast is error-prone and time-consuming
- No version control on the export — PM may work from an outdated file
- No automated import pipeline; PM must manually download and compare

---

## 3. Financial Forecast Summary & Checklist.xlsx

### 3.1 Format and structure

Multi-tab Excel workbook with key tabs:

| Tab | Contents |
|-----|----------|
| **Summary** | Project metadata (name, number, contract type), schedule fields (original completion, approved extensions, revised completion), financial summary (contract value, estimated cost, profit, margin), contingency tracking (original, current, expected at completion, expected use), GC summary |
| **Checklist** | Monthly forecast completion items organized by group: Required Documents, Profit Forecast, Schedule, Additional. Per-item completion checkbox and date. |
| **Detail** | Line-level forecast overrides — PM adjusts FTC per budget line with notes |

### 3.2 Current usage

PM maintains this workbook monthly. Updates summary fields with current contract values, completes checklist items to confirm all forecast inputs are current, and adjusts line-level FTCs in the detail tab. Shared via email or SharePoint to PE for review.

### 3.3 User roles

| Role | Action |
|------|--------|
| PM | Authors and maintains monthly; updates all tabs |
| PE | Reviews emailed or SharePoint-shared workbook |
| PER | Annotates printed/PDF version during executive review |

### 3.4 Data flow

```
PM edits locally → emails/shares to PE → PE reviews → PM revises → final PDF assembled for distribution
                                                                  → GC summary values transcribed from GC/GR workbook
```

### 3.5 Classification

**Working model + review gate.** The forecast summary is the central financial working model. The checklist functions as an informal review gate (not enforced).

### 3.6 Known pain points

- No version immutability — PM can overwrite any prior state
- Checklist completion is honor-system; not enforced as a gate
- No annotation audit trail — PER markups on printed copies are disconnected from source
- GC summary values are manually transcribed from a separate workbook
- No structured approval workflow; review is informal email exchange

---

## 4. GC-GR Forecast.xlsm

### 4.1 Format and structure

Macro-enabled Excel workbook with VBA automation. Contains:

- Division-level rows for General Conditions (GC) and General Requirements (GR) categories
- Per-row fields: category, description, original estimate, current EAC, variance
- VBA macros that compute subtotals, variances, and category-level aggregation
- GC/GR categories include: Personnel, Project Office, Equipment, Site Operations, Insurance, Permits, Subcontracts

### 4.2 Current usage

PM maintains GC and GR projections monthly. VBA macros compute subtotals and variance automatically within the workbook. Results are manually transcribed into the Forecast Summary spreadsheet's GC summary section.

### 4.3 User roles

| Role | Action |
|------|--------|
| PM | Sole editor (macro dependency discourages sharing) |

### 4.4 Data flow

```
PM edits GC/GR workbook locally → VBA computes variances → PM manually transcribes GC/GR totals into Forecast Summary
```

### 4.5 Classification

**Working model.** The GC/GR workbook is an isolated working model whose outputs feed the forecast summary through manual transcription.

### 4.6 Known pain points

- Macro dependency — `.xlsm` format limits sharing and introduces security warnings
- Single-user file — macros break if multiple users access simultaneously
- Manual transcription of results to Forecast Summary is error-prone
- No version history; no connection to the forecast version lifecycle
- VBA macros are opaque and difficult to audit

---

## 5. HB Draw Schedule - Cash Flow.xlsx

### 5.1 Format and structure

Multi-month cash flow projection workbook with:

- Monthly columns spanning project duration
- **Inflow categories:** owner payments, change orders, retention release, loans, other
- **Outflow categories:** subcontractor payments, material costs, labor costs, equipment costs, overhead
- Cumulative cash flow running total
- Working capital tracking
- Retention held per month
- Draw schedule alignment (billing timing tied to project milestones)

### 5.2 Current usage

PM updates monthly. Links cash flow projections to the draw schedule for billing timing. Accounting consumes the output for billing forecasts and accounts receivable planning.

### 5.3 User roles

| Role | Action |
|------|--------|
| PM | Authors and updates monthly projections |
| Accounting | Consumes for billing forecasts and A/R planning |
| PE | Reviews cumulative cash position |

### 5.4 Data flow

```
PM edits cash flow projections → Accounting consumes for billing timing
                               → PE reviews cumulative position
                               → No automated actual-vs-forecast comparison
```

### 5.5 Classification

**Working model.** The cash flow spreadsheet is an active working model updated monthly with projected inflows and outflows.

### 5.6 Known pain points

- No actual-vs-forecast comparison — forecast accuracy is not tracked
- Retention is manually tracked with no configurable rate
- No cumulative cash flow visualization (no chart showing deficit months)
- Draw schedule timing is not connected to project milestones in a structured way
- No connection to A/R aging data

---

## 6. Buyout Log_Template 2025.xlsx

### 6.1 Format and structure

Division-by-division buyout tracking template with columns:

| Column | Description |
|--------|-------------|
| Division Code | CSI division identifier |
| Division Description | Human-readable division name |
| Subcontractor/Vendor | Name of contracted party |
| Original Budget | Budget amount for this scope |
| Contract Amount | Executed contract value (if awarded) |
| LOI Date to be Sent | Target date for Letter of Intent |
| LOI Returned/Executed | Date LOI was returned executed |
| Contract Executed Date | Date subcontract was executed |
| Status | Current procurement status (informal text) |
| Notes | Free-text notes |

### 6.2 Current usage

PM tracks procurement status per subcontract/vendor scope. Updated as procurement events occur (LOI sent, LOI returned, contract executed). PE reviews periodically to monitor buyout progress.

### 6.3 User roles

| Role | Action |
|------|--------|
| PM | Authors and maintains; tracks each subcontract |
| PE | Reviews buyout progress periodically |
| Accounting | References for commitment tracking |

### 6.4 Data flow

```
PM maintains buyout log → PE reviews → no automated downstream consumption
                                     → no savings tracking
                                     → no compliance gate integration
```

### 6.5 Classification

**Working model.** The buyout log is an active tracking tool for procurement lifecycle.

### 6.6 Known pain points

- No savings disposition workflow — when contract < budget, savings are not tracked or routed
- Count-based completion tracking — no dollar-weighted buyout completion metric
- No compliance gate integration — no enforcement that compliance checklist (P3-E12) is satisfied before `ContractExecuted`
- Informal status values — no standardized procurement lifecycle states
- No over/under calculation at the template level

---

## 7. cash-flow.json

### 7.1 Format and structure

JSON file with multi-project cash flow data. Structure per project:

```
{
  "project_id": number,
  "name": string,
  "cashFlowData": {
    "summary": {
      "totalInflows", "totalOutflows", "netCashFlow",
      "peakCashRequirement", "cashFlowAtRisk", "workingCapital", "lastUpdated"
    },
    "monthlyData": [
      {
        "month": "YYYY-MM",
        "inflows": { "ownerPayments", "loans", "changeOrders", "retentionRelease", "other", "total" },
        "outflows": { "subcontractorPayments", "materialCosts", "laborCosts", "equipmentCosts", "overhead", "other", "total" },
        "netCashFlow", "cumulativeCashFlow", "workingCapital", "retentionHeld", "forecastAccuracy"
      }
    ]
  }
}
```

### 7.2 Current usage

System-generated reference data. Not directly edited by users. Consumed by reporting dashboards for cash flow visibility.

### 7.3 User roles

| Role | Action |
|------|--------|
| System | Generates/updates |
| PM, PE | Read-only consumption |

### 7.4 Classification

**Source baseline / reference.** The JSON structure serves as the data model reference for how cash flow data is organized. It is a structural predecessor to `ICashFlowActualRecord` and `ICashFlowForecastRecord` (P3-E4-T05).

### 7.5 Known pain points

- Read-only reference with no editing capability
- No distinction between actual and forecast months
- No confidence scoring on forecast months

---

## 8. ar-aging.json

### 8.1 Format and structure

JSON array of per-project A/R aging records:

```json
{
  "project_id": number,
  "project_name": string,
  "project_manager": string,
  "percent_complete": number,
  "balance_to_finish": number,
  "retainage": number,
  "total_ar": number,
  "current": number,
  "days_1_30": number,
  "days_31_60": number,
  "days_60_plus": number,
  "comments": string
}
```

### 8.2 Current usage

ERP-sourced data (Sage Intacct). Consumed for accounts receivable visibility and aging analysis. Read-only — not edited by project teams.

### 8.3 User roles

| Role | Action |
|------|--------|
| ERP system | Source of truth |
| Accounting | Primary consumer |
| PM, PE | Read-only visibility |

### 8.4 Classification

**Source baseline, read-only.** A/R aging data is imported and displayed but never edited in the Financial module.

### 8.5 Relationship to future model

Maps directly to `IARAgingRecord` (P3-E4-T05 §7.5). Field mapping:

| JSON field | Runtime field |
|-----------|---------------|
| `project_id` | `projectId` |
| `project_name` | `projectName` |
| `project_manager` | `projectManager` |
| `percent_complete` | `percentComplete` |
| `balance_to_finish` | `balanceToFinish` |
| `retainage` | `retainage` |
| `total_ar` | `totalAR` |
| `current` | `current0To30` |
| `days_1_30` | `current30To60` |
| `days_31_60` | `current60To90` |
| `days_60_plus` | `current90Plus` |
| `comments` | `comments` |

---

## 9. Procore Budget Report (PDF) and Budget Details (Numbers)

### 9.1 Procore budget report.pdf

Rendered PDF version of Procore budget data. Used as a formatted reference document for meetings and reviews. Not a source of truth — the CSV export contains the same data in a machine-readable format.

**Classification:** Output / consumption artifact.

### 9.2 budget_details.numbers

Apple Numbers spreadsheet with budget detail in an alternate format. Used by team members who prefer Numbers over Excel.

**Classification:** Output / consumption artifact (alternate format).

---

## 10. Composite Workflow: Monthly Review / Release Packet

This is not a single file but a composite workflow that draws from multiple source artifacts to produce the monthly financial review package.

### 10.1 Current process

1. PM updates Forecast Summary with current values
2. PM updates GC/GR workbook; transcribes GC totals to Forecast Summary
3. PM updates Cash Flow projections
4. PM updates Buyout Log with current procurement status
5. PM completes Forecast Checklist items (informal, not enforced)
6. PM assembles all outputs into a review packet (PDF or email package)
7. PM emails packet to PE for review
8. PE reviews packet; provides feedback via email or meeting
9. PM revises if needed
10. PER annotates printed copy during executive review session
11. Final packet distributed to stakeholders

### 10.2 Current cadence

Monthly, aligned with the company's financial reporting cycle.

### 10.3 Current roles

| Role | Responsibility |
|------|---------------|
| PM | Assembles all inputs; maintains all source files; produces review packet |
| PE | Reviews packet; provides feedback; approves informally |
| PER | Annotates during executive review (post-distribution) |
| Accounting | Consumes cash flow and A/R data for billing |
| Leadership | Receives final distributed packet |

### 10.4 Known pain points

- **Manual assembly** — PM must gather data from 5+ separate files
- **No enforced completeness** — checklist is informal; PM may skip items
- **No governed approval workflow** — review is email-based; no structured gate
- **Annotations disconnected** — PER markups on printed copies have no audit trail and are not linked to source data
- **No version immutability** — PM can modify the packet after review without detection
- **No version history** — no record of what was reviewed vs. what was distributed
- **No downstream event system** — no notifications, no work queue items, no health metrics

---

*Navigation: [← FRC-00 Master Index](FRC-00-Financial-Replacement-Crosswalk.md) | [FRC-02 Detailed Crosswalk →](FRC-02-Detailed-Crosswalk.md)*
