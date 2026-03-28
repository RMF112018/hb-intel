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

## 6. Tool × Spine Integration Matrix

This matrix defines, for each Financial tool and each spine, whether publication is **mandatory** (M), **conditional** (C — only when the specified condition is met), or **none** (—). Where a tool consumes a spine, it is marked **consume** (R).

### 7.1 Activity Spine Publication

| Tool | Publishes | Event Type | Trigger | Condition |
|------|-----------|-----------|---------|-----------|
| Budget Import | **M** | `BudgetImported` | Import batch completes | Always on successful import |
| Budget Import | **C** | `ReconciliationConditionResolved` | PM resolves condition | Only when conditions exist |
| Forecast Summary | — | — | — | Edits are routine; no activity event |
| Forecast Versioning | **M** | `ForecastVersionConfirmed` | Working → Confirmed (T3) | Always on confirmation |
| Forecast Versioning | **M** | `ForecastVersionDerived` | New Working derived (T2) | Always on derivation |
| Forecast Versioning | **M** | `ReportCandidateDesignated` | PM designates candidate (T4) | Always on designation |
| Forecast Versioning | **M** | `ForecastVersionPublished` | Confirmed → Published (T5) | Always on publication |
| GC/GR | **C** | `GCGRUpdated` | GC/GR line edit on Working | Only when material change (threshold TBD) |
| Cash Flow | **C** | `CashFlowProjectionUpdated` | Forecast month edited | Only when material change (threshold TBD) |
| Buyout | **M** | `BuyoutLineExecuted` | Status advances to ContractExecuted | Always on gate passage |
| Buyout | **C** | `BuyoutSavingsDispositioned` | Savings allocated | Only when disposition created |
| Forecast Checklist | — | — | — | Checklist completion is captured implicitly via `ForecastVersionConfirmed` (T3), not a discrete checklist event |
| Review / PER | — | — | — | Review events use Handoff spine, not Activity |
| Publication / Export | — | — | — | Publication covered by `ForecastVersionPublished` |
| History / Audit | — | — | — | History is a consumer, not a publisher |

**Entity linkage required:** Every activity event must include `projectId`, `sourceRecordId`, `sourceRecordType`, and `href` (deep-link to the source Financial tool route).

### 7.2 Health Pulse Metric Publication

| Tool | Publishes | Metric Keys | Trigger | Condition |
|------|-----------|------------|---------|-----------|
| Forecast Summary | **M** | `projectedOverUnder`, `profitMargin`, `estimatedCostAtCompletion` | Version confirmed or published | Snapshot on immutable version |
| Budget Lines | **M** | `totalCostExposureToDate` | Version confirmed | Aggregated from confirmed budget lines |
| Buyout | **M** | `percentBuyoutCompleteDollarWeighted`, `totalRealizedBuyoutSavings`, `totalUndispositionedSavings`, `buyoutToCommittedCostsReconciliation` | `ContractExecuted` gate passage or `BuyoutSavingsDispositioned` event | Publish on each ContractExecuted and each savings disposition — not version-scoped |
| Cash Flow | **M** | `peakCashRequirement`, `cashFlowAtRisk` | Version confirmed | Snapshot from confirmed cash flow |
| GC/GR | — | — | — | GC/GR metrics feed into forecast summary; no direct health publication |
| Checklist | — | — | — | Checklist state is a readiness indicator, not a health metric |

**Publication rule:** Health metrics are published on **version confirmation** (T3) and **version publication** (T5), not on every Working-state edit. This prevents noisy metric churn.

**Prohibited:** Publishing health metrics from Working version data. Health Pulse must reflect confirmed/published state only.

### 7.3 Work Queue Item Publication

| Tool | Publishes | Item Type | Trigger | Priority | Auto-Resolve |
|------|-----------|----------|---------|----------|-------------|
| Budget Import | **M** | `BudgetReconciliationRequired` | Ambiguous import match | `now` | Yes — resolves when PM resolves condition |
| Forecast Checklist | **C** | `ForecastChecklistIncomplete` | Required items incomplete when confirmation gate is evaluated (G2 check; not time-gated) | `soon` | Yes — resolves when all 15 of 19 required items complete |
| Budget Lines | **C** | `BudgetLineOverbudget` | FTC exceeds 10% threshold (T07) | `soon` | Yes — resolves when FTC adjusted |
| Forecast Summary | **C** | `NegativeProfitForecast` | Profit falls below 0% | `now` | Yes — resolves when profit ≥ 0% |
| Cash Flow | **C** | `CashFlowDeficit` | Cumulative cash flow turns negative | `soon` | Yes — resolves when deficit cleared |
| Buyout | **C** | `BuyoutOverbudget` | contractAmount exceeds budgetAmount | `soon` | Yes — resolves when amounts reconciled |
| Buyout | **C** | `UndispositionedBuyoutSavings` | Savings exist without disposition | `watch` | Yes — resolves when fully dispositioned |
| Buyout | **M** | `BuyoutComplianceGateBlocked` | ContractExecuted gate fails | `now` | Yes — resolves when gate passes |

**Work queue lifecycle:** All Financial work queue items are self-resolving — they are automatically superseded when the triggering condition is cleared. Items must include `context.projectId`, `context.moduleKey: 'financial'`, `context.recordId`, and `context.versionId` (where applicable) for correct routing.

**Prohibited:** Creating work queue items from Working-version edits that are immediately superseded by the next edit. Items should be generated from **state evaluation** (e.g., confirmation gate check, threshold evaluation), not from **every mutation**.

### 7.4 Related Items Publication

| Tool | Publishes | Relationship | Direction | When Registered |
|------|-----------|-------------|-----------|-----------------|
| Budget Import | **M** | Budget line ↔ Procore commitment reference | Outbound | On import with identity match |
| Budget Import | **M** | Import session ↔ Budget line lineage | Outbound | On batch execution |
| Buyout | **M** | Buyout line ↔ Subcontract execution readiness record | Outbound | On ContractExecuted gate passage |
| Forecast Versioning | **M** | Version ↔ Publication record | Outbound | On publication (T5) |
| Forecast Versioning | **C** | Version ↔ Review custody record | Outbound | When review custody is implemented |
| Review / PER | **C** | Annotation ↔ Source budget line (via `canonicalBudgetLineId`) | Outbound | On annotation creation |

**Entity linkage required:** Every relationship must include both `sourceItemId` and `targetItemId` with navigable `href` links where applicable.

### 7.5 Workflow Handoff Publication

| Tool | Publishes | Handoff Type | From → To | Trigger |
|------|-----------|-------------|-----------|---------|
| Forecast Versioning | **M** | `ForecastConfirmationHandoff` | PM → System/Review | Version confirmed (T3) |
| Review / PER | **C** | `ReviewSubmissionHandoff` | PM → PER | Version submitted for review (when implemented) |
| Publication / Export | **M** | `PublicationHandoff` | System → Reports (P3-F1) | Version promoted to Published (T5) |
| Period lifecycle (System — `IFinancialPeriodRepository`) | **M** | `PeriodCloseHandoff` | System → PM | Period closed; new period begins. System-initiated handoff, not tool-initiated. |
| Buyout | **M** | `BuyoutComplianceHandoff` | PM → Compliance | ContractExecuted gate passed |

**Handoff lifecycle:** Handoffs are one-directional ownership transfers. The receiving party's acknowledgment (when applicable) closes the handoff. Handoffs must include `projectId`, `sourceRecordId`, and the canonical Financial tool route as `targetHref`.

### 7.6 Consumption (Financial Reads from Spines)

| Spine | Consumed By | Purpose |
|-------|-----------|---------|
| Activity | History / Audit tool | Displays project-wide activity timeline including Financial events |
| Health Pulse | Financial Control Center ([ui/01_Financial_Control_Center_UI_Spec](ui/01_Financial_Control_Center_UI_Spec.md)) | Displays project health posture alongside Financial tool posture |
| Work Queue | Financial Control Center ([ui/01_Financial_Control_Center_UI_Spec](ui/01_Financial_Control_Center_UI_Spec.md)) | Displays PM's pending Financial actions |
| Related Items | All Financial tools | Navigable links to related records across modules |
| Workflow Handoff | Review / PER tool | Pending handoffs affecting review custody |

---

## 7. Remaining Risks

| # | Risk | Impact | Mitigation |
|---|------|--------|------------|
| 1 | No runtime spine adapters exist | Canvas tiles show no Financial data; spines have no Financial events | Implement adapters after `IFinancialRepository` exists (Stage 4) |
| 2 | Related Items relationship types not yet registered | Financial records cannot link to other modules' records | Register types when implementing Financial adapter |
| 3 | Workflow Handoff types not yet registered | Ownership transitions not visible in handoff inbox | Register types when implementing Financial adapter |
| 4 | Health Pulse publication model is adapter-based push; Financial adapter not yet created | Health Pulse cannot incorporate Financial cost/procurement/liquidity metrics | Implement Financial health adapter following `healthPulseActivityAdapter` pattern |
| 5 | Canvas tile display of Financial spine data depends on mock-to-real data migration | Tiles currently render mock data from hooks | Migrate hooks to `IFinancialRepository` first |
| 6 | GC/GR and Cash Flow "material change" thresholds for Activity events not defined | Too many or too few activity events generated | Define thresholds during adapter implementation; start with "any save" and refine |
| 7 | Work queue item generation timing not defined (per-save vs. per-evaluation) | Risk of noisy self-superseding items | Generate on state evaluation (gate check, threshold evaluation), not per-mutation |
