# P3-E4 — Financial Module: Forecast Versioning and Checklist

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E4-T03 |
| **Parent** | [P3-E4 Financial Module Field Specification](P3-E4-Financial-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T03: Forecast Versioning and Checklist |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-23 |

---

*This file covers: forecast version types, version record structure, derivation rules, confirmation lifecycle, report-candidate designation, version-level staleness model, and the forecast checklist model and confirmation gate. See [T02](P3-E4-T02-Budget-Line-Identity-and-Import.md) for the budget line import model and [T04](P3-E4-T04-Forecast-Summary-and-GC-GR.md) for forecast summary and GC/GR fields.*

---

## 3. Forecast Ledger Versioning Model

### 3.1 Design intent

The Financial module maintains a **versioned forecast ledger** — an ordered set of forecast versions for the project's lifetime. Versions are never deleted. The ledger supports working development, internal confirmation checkpoints, monthly publication, and full history.

### 3.2 Version types

| Version Type | Description | Editability |
|--------------|-------------|-------------|
| `Working` | The current draft. Only one working version at a time. PM edits all forecast fields freely. | Fully editable by PM |
| `ConfirmedInternal` | An immutable snapshot created when PM confirms. Multiple may exist in a month. | Immutable; PER-annotatable |
| `PublishedMonthly` | The official monthly version. Exactly one per reporting month. Finalized by report publication. | Immutable; PER-annotatable |
| `Superseded` | Any earlier version replaced by a later confirmed or published version; retained for audit. | Immutable; read-only |

### 3.3 Forecast version record

```typescript
interface IForecastVersion {
  forecastVersionId: string;           // UUID; stable identifier for this version
  projectId: string;
  versionType: ForecastVersionType;    // 'Working' | 'ConfirmedInternal' | 'PublishedMonthly' | 'Superseded'
  versionNumber: number;               // Monotonically increasing per project; assigned at creation
  reportingMonth: string | null;       // ISO 8601 year-month (e.g., '2026-03') for PublishedMonthly; null for Working and ConfirmedInternal
  derivedFromVersionId: string | null; // FK to the version this one was derived from; null for the initial version
  derivationReason: ForecastDerivationReason | null; // Why this version was created
  isReportCandidate: boolean;          // True if PM has designated this as the report-candidate; only one ConfirmedInternal per project may have this = true at a time
  createdAt: string;                   // ISO 8601 timestamp
  createdBy: string;                   // userId of PM who created or triggered derivation
  confirmedAt: string | null;          // When PM confirmed (for ConfirmedInternal and PublishedMonthly)
  confirmedBy: string | null;          // userId of confirming PM
  publishedAt: string | null;          // When report publication finalized this as PublishedMonthly
  publishedByRunId: string | null;     // FK to the P3-F1 run-ledger entry that triggered publication
  staleBudgetLineCount: number;        // Count of budget lines with unresolved reconciliation conditions; confirmation blocked if > 0
  checklistCompletedAt: string | null; // When forecast checklist was completed for this version
  notes: string | null;               // Optional PM notes on this version
}

type ForecastVersionType = 'Working' | 'ConfirmedInternal' | 'PublishedMonthly' | 'Superseded';

type ForecastDerivationReason =
  | 'InitialSetup'          // First version created for the project
  | 'BudgetImport'          // New budget import triggered derivation
  | 'PostConfirmationEdit'  // PM derived working version from a confirmed version to make edits
  | 'ScheduleRefresh'       // Downstream source refresh triggered derivation
  | 'ManualDerivation';     // PM explicitly created a new working version
```

### 3.4 Derivation rules

**A new derived working version is automatically created when:**
1. A new budget import succeeds (reason: `BudgetImport`); the prior working version (if one exists) is transitioned to `Superseded`.
2. PM explicitly initiates a new working version derived from a confirmed version (reason: `PostConfirmationEdit`).

**A PM may not edit the fields of a confirmed version in place.** The "unlock and revise" model does not exist. Instead:
- PM derives a new working version from the confirmed version.
- The confirmed version is preserved with `versionType = ConfirmedInternal`.
- The new working version inherits the data state of the confirmed version as its starting point.
- PM edits the new working version freely.

**A new working version may be manually created at any time** (reason: `ManualDerivation`) to start fresh from the current confirmed state.

**When a new working version is derived, the following data is copied from the source version:**
- All budget line records (`forecastToComplete` included)
- All GC/GR line records
- All cash flow records (actuals + forecast)
- All forecast summary fields
- The checklist is **NOT** copied; the new working version starts with an empty checklist
- `derivedFromVersionId` and `derivationReason` are set on the new version
- Open annotation carry-forward runs per T08 §8.5

### 3.5 Confirmation lifecycle

```
Working → [PM confirms, checklist complete] → ConfirmedInternal
ConfirmedInternal → [PM designates as report candidate] → isReportCandidate = true
ConfirmedInternal (with isReportCandidate = true) → [Report published by P3-F1] → PublishedMonthly
ConfirmedInternal / Working → [superseded by newer version] → Superseded
```

**PM may create multiple ConfirmedInternal versions in a month.** Only the most recently designated report-candidate is submitted to report publication.

**Confirmation requirements:**
1. All forecast checklist required items completed (§4.3)
2. All financial fields in forecast summary populated and valid
3. No unresolved budget line reconciliation conditions (`staleBudgetLineCount = 0`)
4. No budget lines with EAC exceeding `projectedBudget` by more than 200% without PM notes

### 3.6 Report-candidate designation

PM designates one `ConfirmedInternal` version as the report candidate by setting `isReportCandidate = true`. At most one version may hold `isReportCandidate = true` at any time; setting it on a new version clears it on the prior holder.

The `ConfirmedInternal` version designated as report candidate is the version that:
- The Reports module (P3-F1) includes in the PX Review and Owner Report module snapshot pull
- Becomes the `PublishedMonthly` version when report publication finalizes

The Financial module surfaces the report-candidate designation clearly in the UI so PER can identify which confirmed version is the designated reporting version.

### 3.7 Version-specific staleness

Staleness in the versioning model is **version-specific**, not a whole-module flag:

| Staleness event | Effect |
|-----------------|--------|
| New budget import arrives | The current working version (if one exists) is superseded; a new working version is derived. Prior confirmed versions are unaffected. |
| GC/GR estimate changes | The change is recorded in the current working version. Prior confirmed versions are unaffected and remain valid. |
| Confirmed version designated as report candidate becomes stale | PM should derive a new working version, apply changes, re-confirm, and re-designate the report candidate. The original confirmed version remains in the ledger. |

There is no whole-module `Stale` status. Staleness is resolved by deriving and confirming a new version — not by mutating a confirmed version.

---

## 4. Forecast Checklist Model

The Forecast Checklist is completed by the PM before confirming a forecast version. A working version cannot be confirmed until all required checklist items are completed.

### 4.1 Checklist structure

| itemId (stable) | group | label (exact from template) | required |
|-----------------|-------|----------------------------|----------|
| `doc_procore_budget` | RequiredDocuments | Procore Budget export attached | Yes |
| `doc_forecast_summary` | RequiredDocuments | Forecast Summary completed | Yes |
| `doc_gc_gr_log` | RequiredDocuments | GC/GR Log completed | Yes |
| `doc_cash_flow` | RequiredDocuments | Cash Flow projection completed | Yes |
| `doc_sdi_log` | RequiredDocuments | SDI Log attached | Yes |
| `doc_buyout_log` | RequiredDocuments | Buyout Log completed | Yes |
| `profit_changes_noted` | ProfitForecast | Profit changes noted in working files | Yes |
| `profit_negative_flagged` | ProfitForecast | Negative profit values flagged for review | Yes |
| `profit_gc_savings_confirmed` | ProfitForecast | GC/buyout savings confirmed | Yes |
| `profit_events_documented` | ProfitForecast | Projected events documented | Yes |
| `schedule_status_current` | Schedule | Schedule status current (within 7 days) | Yes |
| `schedule_brewing_items_noted` | Schedule | Brewing issues noted | Yes |
| `schedule_gc_gr_confirmed` | Schedule | GC/GR schedule confirmed | Yes |
| `schedule_delay_notices_sent` | Schedule | Delay notices sent (if applicable) | Conditional |
| `reserve_contingency_confirmed` | Additional | Contingency reserve confirmed | Yes |
| `reserve_gc_confirmed` | Additional | GC estimate at completion confirmed | Yes |
| `ar_aging_reviewed` | Additional | A/R aging reviewed (cash flow impact) | Yes |
| `buyout_savings_dispositioned` | Additional | Buyout savings dispositioned (if undispositioned savings exist) | Conditional |
| `executive_approval_noted` | Additional | Executive review completed (optional) | Conditional |

### 4.2 Checklist item record structure

| Field Name (camelCase) | TypeScript Type | Required | Description |
|------------------------|-----------------|----------|-------------|
| `checklistId` | `string` | Yes | UUID; identifies this checklist instance |
| `forecastVersionId` | `string` | Yes | FK to `IForecastVersion`; this checklist belongs to a specific version |
| `itemId` | `string` | Yes | Stable item identifier from §4.1 |
| `group` | `ForecastChecklistGroup` | Yes | Enum: `RequiredDocuments` \| `ProfitForecast` \| `Schedule` \| `Additional` |
| `label` | `string` | Yes | Display text |
| `completed` | `boolean` | Yes | true = PM has checked off this item |
| `completedBy` | `string \| null` | No | userId of PM who checked item |
| `completedAt` | `string \| null` | No | ISO 8601 timestamp when checked |
| `notes` | `string \| null` | No | Optional PM notes |
| `required` | `boolean` | Yes | true = item must be completed to confirm; false = informational only |

### 4.3 Checklist completion and version confirmation

**Confirmation gate:**
A working version may only be confirmed when:
1. All required checklist items (`required = true`) have `completed = true`
2. All financial summary fields are populated and valid
3. `staleBudgetLineCount = 0` (no unresolved reconciliation conditions)
4. No buyout line with `undispositionedBuyoutSavings > 0` if the conditional item `buyout_savings_dispositioned` is relevant (T06 §6.6)

**Confirmation action:**
- PM clicks "Confirm Version"
- System validates all conditions; if any fail, displays clear error listing unfulfilled requirements
- On success: sets `versionType = ConfirmedInternal`, `confirmedAt = now`, `confirmedBy = userId`, `checklistCompletedAt = now`
- Version is immutable after confirmation
- If this is to be the report candidate, PM designates it via §3.6

**No "unlock in place":** To make edits after confirming, PM derives a new working version from the confirmed version (§3.4).

---

*Navigation: [← T02 Budget Line Identity and Import](P3-E4-T02-Budget-Line-Identity-and-Import.md) | [Master Index](P3-E4-Financial-Module-Field-Specification.md) | [T04 Forecast Summary and GC/GR →](P3-E4-T04-Forecast-Summary-and-GC-GR.md)*
