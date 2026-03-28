# Financial Shared Spine Integration Contract

| Field | Value |
|---|---|
| **Doc ID** | Financial-SSIC |
| **Document Type** | Shared Spine Integration Contract |
| **Owner** | Architecture lead |
| **Created** | 2026-03-28 |
| **Status** | Active — governs Financial module's publish/consume obligations across all shared spines |
| **References** | [P3-E4-T08](../../04_Phase-3_Project-Hub-and-Project-Context-Plan.md) (Platform Integration); [Financial-RGC](Financial-Runtime-Governance-Control.md); [Financial-LMG](Financial-Lifecycle-and-Mutation-Governance.md); [Financial-ABMC](Financial-Action-Boundary-and-Mutation-Control.md); [FIN-PR1](FIN-PR1-Financial-Production-Readiness-Maturity-Model.md); [Control Index](Financial-Doctrine-Control-Index.md) |

---

## 1. Purpose

This contract defines how the Financial module publishes to and consumes from the 5 canonical shared spines in Project Hub. It is the implementation reference for building Financial spine adapters, registering canvas tiles, and wiring event publication.

---

## 2. Canonical Shared Spines

| # | Spine | Canonical Package | Interface | Canvas Tile | Tile Mandatory |
|---|-------|------------------|-----------|-------------|---------------|
| 1 | **Activity** | `@hbc/models` | `IProjectActivityEvent` | Project Activity | Yes |
| 2 | **Health Pulse** | `@hbc/features-project-hub` (health-pulse) | `IProjectHealthPulse` | Health Pulse | Yes |
| 3 | **Work Queue** | `@hbc/my-work-feed` | `IMyWorkItem` | Project Work Queue | Yes |
| 4 | **Related Items** | `@hbc/related-items` | `IRelatedItem` | Related Items | Yes |
| 5 | **Workflow Handoff** | `@hbc/workflow-handoff` | Handoff model | Workflow Handoff Inbox | Yes |

---

## 3. Financial Integration Obligations Per Spine

### 3.1 Activity Spine

| Aspect | Value |
|--------|-------|
| **Direction** | **Publish** — Financial generates activity events consumed by the spine |
| **Canonical interface** | `IProjectActivityEvent` from `@hbc/models` |
| **T08 contract** | 10 event types defined in `@hbc/features-project-hub` Financial types |
| **Publication trigger** | Significant Financial actions (version transitions, imports, buyout events) |
| **Implementation pattern** | Financial adapter publishes `IProjectActivityEvent` records; canvas tile displays them |

**10 Financial Activity Event Types (T08 §14.1):**

| Event Type | Trigger | Significance |
|-----------|---------|-------------|
| `BudgetImported` | Budget CSV import batch completes | notable |
| `ForecastVersionConfirmed` | Working → ConfirmedInternal | notable |
| `ForecastVersionDerived` | New Working derived from Confirmed/Published | routine |
| `ReportCandidateDesignated` | PM designates ConfirmedInternal as candidate | notable |
| `ForecastVersionPublished` | ConfirmedInternal → PublishedMonthly (P3-F1) | critical |
| `GCGRUpdated` | GC/GR line edit on Working version | routine |
| `BuyoutLineExecuted` | Buyout status advanced to ContractExecuted | notable |
| `BuyoutSavingsDispositioned` | Savings allocated to destination | routine |
| `CashFlowProjectionUpdated` | Cash flow forecast month edited | routine |
| `ReconciliationConditionResolved` | PM resolves ambiguous import match | routine |

**Adapter status:** Factory `createFinancialActivityEvent()` exists in `spine-events/index.ts`. No runtime adapter wired. Health Pulse demonstrates the adapter pattern via `healthPulseActivityAdapter`.

---

### 3.2 Health Pulse Spine

| Aspect | Value |
|--------|-------|
| **Direction** | **Publish** — Financial contributes health metrics consumed by Health Pulse |
| **Canonical interface** | `IProjectHealthPulse` from `@hbc/features-project-hub` health-pulse |
| **T08 contract** | 10 metric definitions in Financial types |
| **Publication trigger** | Version confirmation, period close, significant value changes |
| **Integration pattern** | Financial publishes metric snapshots; Health Pulse aggregates into composite score |

**10 Financial Health Metrics (T08 §14.2):**

| Metric Key | Source | Domain |
|-----------|--------|--------|
| `projectedOverUnder` | Forecast summary | Cost |
| `profitMargin` | Forecast summary | Cost |
| `estimatedCostAtCompletion` | Forecast summary | Cost |
| `totalCostExposureToDate` | Budget lines | Cost |
| `percentBuyoutCompleteDollarWeighted` | Buyout lines | Procurement |
| `totalRealizedBuyoutSavings` | Buyout dispositions | Procurement |
| `totalUndispositionedSavings` | Buyout dispositions | Procurement |
| `peakCashRequirement` | Cash flow model | Liquidity |
| `cashFlowAtRisk` | Cash flow model | Liquidity |
| `buyoutToCommittedCostsReconciliation` | Buyout vs. commitments | Reconciliation |

**Adapter status:** Factory `createFinancialHealthSnapshot()` exists in `spine-events/index.ts`. No runtime adapter. Health Pulse is its own source of truth; Financial must push metric data for Health Pulse to incorporate into its composite scoring.

---

### 3.3 Work Queue Spine

| Aspect | Value |
|--------|-------|
| **Direction** | **Publish** — Financial generates work items consumed by My Work Feed |
| **Canonical interface** | `IMyWorkItem` from `@hbc/my-work-feed` |
| **T08 contract** | 8 work queue item types in Financial types |
| **Publication trigger** | Reconciliation conditions created, overbudget detected, savings undispositioned, compliance gate blocked |
| **Integration pattern** | Financial source adapter publishes `IMyWorkItem` records; My Work Feed aggregates and displays |

**8 Financial Work Queue Item Types (T08 §14.3):**

| Item Type | Trigger | Priority | Class |
|----------|---------|----------|-------|
| `BudgetReconciliationRequired` | Ambiguous import creates reconciliation condition | now | owned-action |
| `ForecastChecklistIncomplete` | Required checklist items not completed near period end | soon | owned-action |
| `BudgetLineOverbudget` | Budget line FTC exceeds threshold (10% per T07) | soon | attention-item |
| `NegativeProfitForecast` | Forecast summary shows negative profit | now | attention-item |
| `CashFlowDeficit` | Cash flow projection shows deficit | soon | attention-item |
| `BuyoutOverbudget` | Buyout contractAmount exceeds budgetAmount | soon | attention-item |
| `UndispositionedBuyoutSavings` | Savings exist without disposition | watch | queued-follow-up |
| `BuyoutComplianceGateBlocked` | ContractExecuted gate fails for buyout line | now | owned-action |

**Adapter status:** Factory `createFinancialWorkQueueItem()` exists in `spine-events/index.ts`. No source adapter implementing `IMyWorkSourceAdapter`.

---

### 3.4 Related Items Spine

| Aspect | Value |
|--------|-------|
| **Direction** | **Publish** — Financial declares relationships to other modules' records |
| **Canonical interface** | `IRelatedItem` / `IRelationshipDefinition` from `@hbc/related-items` |
| **T08 contract** | 11 relationship type mappings defined in T09 §18.1 |
| **Publication trigger** | Record creation/update that establishes or changes cross-module linkage |
| **Integration pattern** | Financial registers relationship types; Related Items panel renders navigable links |

**Financial Relationship Types (T09 §18.1):**

Financial records link to:
- Budget lines ↔ Procore commitment references
- Buyout lines ↔ Subcontract execution readiness records
- Forecast versions ↔ Publication records
- Forecast versions ↔ Review custody records
- Budget import sessions ↔ Budget line lineage
- Financial audit events ↔ Source records

**Adapter status:** No Financial relationship adapter or type registrations exist in code. Related Items package expects relationship type declarations from consuming modules.

---

### 3.5 Workflow Handoff Spine

| Aspect | Value |
|--------|-------|
| **Direction** | **Publish** — Financial creates handoff items for ownership transitions |
| **Canonical interface** | Handoff model from `@hbc/workflow-handoff` |
| **T08 contract** | 5 workflow handoff types defined in T09 §18.2 |
| **Publication trigger** | Version confirmation, review submission, publication handoff, period close, buyout gate passage |

**Financial Workflow Handoff Types (T09 §18.2):**

| Handoff Type | From | To | Trigger |
|-------------|------|-----|---------|
| `ForecastConfirmationHandoff` | PM | System/Review | Version confirmed |
| `ReviewSubmissionHandoff` | PM | PER | Version submitted for review |
| `PublicationHandoff` | System | Reports (P3-F1) | Version promoted to Published |
| `PeriodCloseHandoff` | System | PM | Period closed; new period begins |
| `BuyoutComplianceHandoff` | PM | Compliance | ContractExecuted gate passed |

**Adapter status:** No Financial handoff source adapter exists. `@hbc/workflow-handoff` package is mature (v0.1.0) and provides the platform primitive.

---

## 4. Integration Status Summary

| Spine | T08 Types | Factory Functions | Runtime Adapter | Canvas Tile Wired | Overall Stage |
|-------|-----------|------------------|----------------|-------------------|--------------|
| Activity | 10 types | Yes | **No** | Tile exists (no Financial data) | Stage 3 — Scaffold |
| Health Pulse | 10 metrics | Yes | **No** | Tile exists (no Financial data) | Stage 3 — Scaffold |
| Work Queue | 8 types | Yes | **No** | Tile exists (no Financial data) | Stage 3 — Scaffold |
| Related Items | 11 types (doctrine) | **No** | **No** | Tile exists (no Financial data) | Stage 2 — Defined |
| Workflow Handoff | 5 types (doctrine) | **No** | **No** | Tile exists (no Financial data) | Stage 2 — Defined |

**Module-level spine integration: Stage 2–3** (types and factories exist for Activity/Health/Work Queue; Related Items and Handoff are doctrine-only).

---

## 5. Implementation Sequence

| Step | What | Unblocks |
|------|------|----------|
| 1 | Implement Financial Activity adapter (follow `healthPulseActivityAdapter` pattern) | Activity events surface on canvas tile |
| 2 | Implement Financial Health metric publisher | Health Pulse incorporates Financial cost/procurement/liquidity data |
| 3 | Implement Financial Work Queue source adapter (`IMyWorkSourceAdapter`) | PM work items surface in My Work Feed |
| 4 | Register Financial relationship types with `@hbc/related-items` | Related Items panel shows Financial cross-module links |
| 5 | Implement Financial handoff source adapter | Workflow Handoff Inbox shows Financial ownership transitions |

**Dependency:** Steps 1–3 require `IFinancialRepository` (Financial-RGC §7 Step 1) to provide real data. Step 4 requires relationship type registration in the Related Items package. Step 5 requires handoff type registration in the Workflow Handoff package.

---

## 6. Remaining Risks

| # | Risk | Impact | Mitigation |
|---|------|--------|------------|
| 1 | No runtime spine adapters exist | Canvas tiles show no Financial data; spines have no Financial events | Implement adapters after `IFinancialRepository` exists (Stage 4) |
| 2 | Related Items relationship types not yet registered | Financial records cannot link to other modules' records | Register types when implementing Financial adapter |
| 3 | Workflow Handoff types not yet registered | Ownership transitions not visible in handoff inbox | Register types when implementing Financial adapter |
| 4 | Health Pulse integration model unclear — push vs. pull | Financial may need to push snapshots or Health Pulse may query | Follow Health Pulse's existing integration pattern (adapter-based push) |
| 5 | Canvas tile display of Financial spine data depends on mock-to-real data migration | Tiles currently render mock data from hooks | Migrate hooks to `IFinancialRepository` first |
