# Financial Runtime Governance Control

| Field | Value |
|---|---|
| **Doc ID** | Financial-RGC |
| **Document Type** | Runtime Governance Control |
| **Owner** | Architecture lead |
| **Created** | 2026-03-28 |
| **Status** | Active — governs persistence, repository, and mutation implementation |
| **References** | [FRM-04](FRM-04-Repository-and-Provider-Seam-Model.md); [BIP-04](BIP-04-Repository-Provider-and-Persistence-Seams.md); [FVC-04](FVC-04-Repository-Provider-and-Persistence-Seams.md); [PH3-FIN-SOTL](PH3-FIN-SOTL-Financial-Source-of-Truth-Lock.md); [FIN-PR1](FIN-PR1-Financial-Production-Readiness-Maturity-Model.md); [Control Index](Financial-Doctrine-Control-Index.md) |

---

## 1. Purpose

This document locks the runtime persistence families, repository seam boundaries, and domain ownership rules required for production-safe Financial module implementation. It synthesizes decisions from FRM-04 (repository seam model), BIP-04 (budget import seams), FVC-04 (versioning seams), FRM-01/03 (entity model and lifecycle), and PH3-FIN-SOTL (source-of-truth authority) into a single implementation-control surface.

**Use this document** when implementing Financial data access, repository interfaces, persistence schemas, or mutation operations. It answers: what records persist, who owns writes, where logic lives, and what is transitional vs final.

---

## 2. Persistence Families

### 2.1 Canonical Persistence Families (16 families)

Per FRM-04 §5.2, the Financial module requires 16 persistence families for production. Each family is classified by its ownership tier (per FRM-01 §1.1).

| # | Family | Record Type | Ownership Tier | Scope | Purpose |
|---|--------|-------------|----------------|-------|---------|
| 1 | Reporting periods | `FinancialReportingPeriod` | G (Governed) | Project | Period governance, close/reopen |
| 2 | Forecast versions | `ForecastVersion` | W→G lifecycle | Project | Version ledger: Working → ConfirmedInternal → PublishedMonthly → Superseded |
| 3 | Budget lines | `BudgetLine` | W (Working) | Version-scoped | PM working edits, FTC, derived cost fields |
| 4 | Summary snapshots | `ForecastSummarySnapshot` | D (Derived) | Version-scoped | Confirmed point-in-time snapshot |
| 5 | GC/GR lines | `GCGRLine` | W (Working) | Version-scoped | Division-level variance tracking |
| 6 | Checklist items | `ForecastChecklistItem` | W (Working) | Version-scoped | Completion tracking against canonical template |
| 7 | Cash flow forecast | `CashFlowForecastMonth` | W (Working) | Version-scoped | PM-authored future months (18-month horizon) |
| 8 | Cash flow actuals | `CashFlowActualMonth` | I (Imported) | Project | Read-only actuals synced from source |
| 9 | A/R aging | `ARAgingRecord` | E (External) | Project | ERP-synced receivables reference |
| 10 | Commitment refs | `CommitmentReference` | E (External) | Project | Procore-mirrored commitment data |
| 11 | Buyout lines | `BuyoutLineItem` | W (Working) | Project | Procurement lifecycle tracking |
| 12 | Disposition items | `BuyoutSavingsDispositionItem` | W (Working) | Project | Three-destination savings treatment |
| 13 | Review custody | `FinancialReviewCustodyRecord` | A (Audit) | Version-scoped | Annotation ownership, approval gates |
| 14 | Publication records | `PublicationRecord` | G (Governed) | Project | Outcome history, P3-F1 handoff |
| 15 | Export runs | `FinancialExportRun` | A (Audit) | Project | Cutover/workbook-retirement evidence |
| 16 | Audit events | `FinancialAuditEvent` | A (Audit) | Project | Immutable operational event history |

### 2.2 Budget Import Ledger Families (6 families)

Per BIP-04 §5.2, the budget import pipeline requires 6 additional ledger families:

| # | Family | Purpose | Ownership Tier |
|---|--------|---------|----------------|
| 17 | Session ledger | `BudgetImportSession`, `BudgetImportFileArtifact` | A (Audit) |
| 18 | Row lineage | `RawBudgetImportRow`, `NormalizedBudgetImportRow` | I (Imported) |
| 19 | Validation ledger | `BudgetImportValidationReport`, error records | A (Audit) |
| 20 | Identity/reconciliation ledger | `BudgetIdentityResolutionRecord`, `BudgetLineReconciliationCondition` | W (Working) |
| 21 | Execution ledger | `BudgetImportExecutionRecord`, `VersionDerivationRecord` | A (Audit) |
| 22 | Import audit ledger | `BudgetImportAuditEvent` | A (Audit) |

**Total: 22 persistence families** (16 core + 6 import pipeline).

---

## 3. Repository Seam Model

### 3.1 Architecture: 12 Sub-Domain Repositories Behind UI Facade

Per FRM-04 §2, the Financial module uses 12 focused sub-domain repositories behind a single `IFinancialRepository` UI facade. The facade shields UI hooks from sub-repository fragmentation while preserving domain-boundary clarity.

| # | Repository | Owns | Source Doc |
|---|-----------|------|-----------|
| 1 | `IFinancialPeriodRepository` | Period close/reopen, one-published-per-month enforcement | FRM-04 §2.1 |
| 2 | `IBudgetImportRepository` | Import sessions, validation, identity resolution, reconciliation, execution | BIP-04 §2 |
| 3 | `IForecastVersionRepository` | Version lifecycle, current-working selection, version history | FVC-04 §2.2 |
| 4 | `IBudgetLineRepository` | Version-scoped budget lines, FTC edits, stale resolution | FRM-04 §2.3 |
| 5 | `IForecastSummaryRepository` | Summary snapshots, editable fields, recomputation | FRM-04 §2.4 |
| 6 | `IGCGRRepository` | GC/GR lines, variance recomputation, summary rollup | FRM-04 §2.5 |
| 7 | `ICashFlowRepository` | Actual/forecast months, summary, retention config, A/R | FRM-04 §2.6 |
| 8 | `IBuyoutRepository` | Buyout lifecycle, completion weighting, compliance gates | FRM-04 §2.7 |
| 9 | `ICommitmentReferenceRepository` | External commitment mirrors, reconciliation support | FRM-04 §2.8 |
| 10 | `IFinancialReviewRepository` | Review custody, annotations, return-for-revision | FRM-04 §2.9 |
| 11 | `IFinancialPublicationRepository` | Publication records, candidate enforcement, P3-F1 handoff | FRM-04 §2.10 |
| 12 | `IFinancialAuditRepository` | Immutable operational event history | FRM-04 §2.11 |

### 3.2 UI Facade: `IFinancialRepository`

The UI facade is the **only interface that view hooks consume**. It composes sub-domain repositories and returns project-scoped view models. Per FRM-04 §4, the facade exposes 7 mutation categories:

| Category | Operations | Sub-Repositories Involved |
|----------|-----------|--------------------------|
| Budget | Import batch, resolve reconciliation, update FTC | 2, 4 |
| Forecast | Update summary, toggle checklist, confirm, derive, designate candidate | 3, 5, 6 |
| GC/GR | Update line, load category summaries | 6 |
| Cash Flow | Update forecast month, refresh actual/reference data | 7 |
| Buyout | Create/update line, advance status, create disposition | 8 |
| Review | Load annotation context, submit/reopen/review custody | 10 |
| Publication | Handoff receive, mark published, export snapshot | 11 |

### 3.3 Implementation Status

| Component | Status | Evidence |
|-----------|--------|----------|
| `IFinancialRepository` facade | **Does not exist** | Glob search returns 0 code files |
| 12 sub-domain repositories | **Does not exist** | No interface/type definitions in code |
| Factory registration | **Not registered** | `data-access/factory.ts` lists 11 repos; Financial absent |
| Mock adapters | **Do not exist** | No `MockFinancialRepository` file found |
| View hooks | **Mock data only** | 5 hooks return hardcoded mock objects |

Per FIN-PR1 §3.2: Financial data access is at **Stage 1 (Doctrine-Defined)**. Advancing to Stage 4 (Partially Operational) requires creating the facade, registering it, and wiring at least one real data path.

---

## 4. Domain Ownership and Write Boundaries

### 4.1 Authority Rules (per PH3-FIN-SOTL §4)

| Data Domain | Authority Source | Financial Module Role | Write Rule |
|-------------|-----------------|----------------------|------------|
| Budget baseline | Procore import | Store copies, history, mappings | **No direct authoring** — import-only |
| Actual cost | ERP/external system | Sync and use for comparisons | **Read-only** — no Financial writes |
| Monthly forecast | **Financial module** | Owns working versions, review, approval, archival | **Full write authority** on working state |
| Buyout working state | **Hybrid** | Owns internal orchestration/enrichment | Financial owns internal layer; Procore owns formal commitments |
| Cash flow forecast | **Financial module** | Owns working and confirmed versions | **Full write authority** |
| Commitments | Hybrid (Procore primary) | Core fields from Procore; enrichment fields internal | **Enrichment writes only** — no core field mutation |
| Receivables / A/R | Hybrid (ERP facts) | Facts from ERP; own interpretation/collection-risk layer | **Interpretation writes only** — no fact mutation |
| Contingency / savings | **Hybrid with governance gates** | Authoritative for working-period treatment | **PE approval required** for material contingency decisions |

### 4.2 Mutation Ownership by Persistence Family

Every persistence family has a single write owner. Repository implementations must enforce these boundaries.

| Family | Write Owner | Mutation Guard |
|--------|-----------|---------------|
| Reporting periods (1) | `IFinancialPeriodRepository` | Close/reopen requires governance gate |
| Forecast versions (2) | `IForecastVersionRepository` | State transitions per FRM-03 lifecycle; derivation-first (no unlock-in-place) |
| Budget lines (3) | `IBudgetLineRepository` | FTC edits on Working version only; imported fields are read-only |
| Summary snapshots (4) | `IForecastSummaryRepository` | Editable fields on Working only; derived fields are computed, not edited |
| GC/GR lines (5) | `IGCGRRepository` | Editable on Working version only |
| Checklist items (6) | `IForecastVersionRepository` | PM-owned completion; confirmation gate validates before lifecycle transition |
| Cash flow forecast (7) | `ICashFlowRepository` | Working version only; closed months are immutable |
| Cash flow actuals (8) | **Import-only** (no Financial writes) | Read-only synced from source |
| A/R aging (9) | **Import-only** (no Financial writes) | Read-only ERP sync |
| Commitment refs (10) | **Import-only** (enrichment writes for internal fields) | Core Procore fields are read-only |
| Buyout lines (11) | `IBuyoutRepository` | Status lifecycle per FRM-03; `ContractExecuted` gate enforced via P3-E13 |
| Disposition items (12) | `IBuyoutRepository` | Three-destination workflow; requires explicit disposition action |
| Review custody (13) | `IFinancialReviewRepository` | Append-only state transitions |
| Publication records (14) | `IFinancialPublicationRepository` | One report-candidate per project; immutable after publication |
| Export runs (15) | `IFinancialPublicationRepository` | Append-only evidence records |
| Audit events (16) | `IFinancialAuditRepository` | **Immutable** — append-only, never edited or deleted |

---

## 5. Transitional vs Final Persistence

### 5.1 Current SharePoint Lists (Transitional)

The 5 existing SharePoint lists in `backend/functions/src/config/financial-list-definitions.ts` are **transitional provisioning-era artifacts**:

| List | Doctrine Match | Final Status |
|------|---------------|-------------|
| Buyout Log (16 fields) | Partial — covers `BuyoutLineItem` basics | **Transitional** — must evolve to include status lifecycle, compliance gates |
| Buyout Bid Lines (11 fields) | Partial — covers bid tracking | **Transitional** — limited to pre-award phase |
| Draw Schedule (11 fields) | Partial — simplified `BudgetLine` | **Transitional** — no version-scoping, no FTC provenance |
| Financial Forecast Status (13 fields) | Partial — checklist template only | **Transitional** — not instance-level tracking per version |
| Subcontract Compliance Log (11 fields) | Not aligned to doctrine families | **Transitional** — may be absorbed by buyout compliance gates |

### 5.2 Prohibited Final-State Patterns (per FRM-04 §5.3)

The following persistence patterns are **explicitly prohibited** in the final runtime design:

1. One generic Financial list for all record types
2. Only the current provisioning-era list family
3. Single record with JSON blobs for child collections
4. Publication/review history stored only as columns on parent records
5. No audit trail or version-scoped child records

### 5.3 Migration Path

Current transitional lists may be:
- **Evolved** — enhanced with additional fields, version-scoping, and audit columns (preferred for Buyout Log, Draw Schedule)
- **Replaced** — superseded by new purpose-built persistence families (likely for Forecast Status, Compliance Log)
- **Retained as reference** — kept for backward compatibility during migration but not treated as authoritative

The specific migration strategy per list is a future implementation decision, not a doctrine decision. This document governs the target-state requirements; the migration path will be determined during implementation.

---

## 6. Versioning and Immutability Rules

Per FRM-03, the Financial module uses a **derivation-first lifecycle** with no unlock-in-place:

| Version State | Mutability | Transition |
|---------------|-----------|------------|
| **Working** | Mutable — PM can edit FTC, checklist, GC/GR, cash flow forecast | Derived from previous confirmed or created as initial |
| **ConfirmedInternal** | **Immutable** — no edits; PER can annotate | Confirmed from Working when checklist gate passes |
| **PublishedMonthly** | **Immutable** — no edits; PER can annotate | Promoted from ConfirmedInternal via P3-F1 handoff |
| **Superseded** | **Immutable** — read-only historical record | Previous version after new Working is derived |

**Repository enforcement requirement:** Every repository that handles version-scoped records must verify the version state before allowing mutation. No write operation may proceed on a record belonging to a ConfirmedInternal, PublishedMonthly, or Superseded version.

---

## 7. Implementation Sequence

For an implementer advancing Financial from Stage 1 (Doctrine-Defined) to Stage 4 (Partially Operational), the recommended implementation sequence is:

| Step | What | Unblocks |
|------|------|----------|
| 1 | Create `IFinancialRepository` facade interface in `packages/data-access/src/ports/` | Standard consumption pattern for view hooks |
| 2 | Create `MockFinancialRepository` adapter returning current mock data | Factory registration; hook migration from inline mocks |
| 3 | Register `createFinancialRepository()` in `packages/data-access/src/factory.ts` | Standard repository instantiation |
| 4 | Migrate 5 view hooks from inline mock data to facade consumption | Consistent data access path |
| 5 | Complete T04 source contracts (`IFinancialForecastSummary`, `IGCGRLine`) | Forecast Summary and GC/GR advance to Stage 3 |
| 6 | Implement first real sub-domain repository (Budget or Buyout — closest to existing SharePoint lists) | Stage 4 for first capability |
| 7 | Implement URL-routed sub-tool navigation | Deep-link durability, project-switch preservation |
| 8 | Implement remaining sub-domain repositories | Full Stage 4 across capabilities |

---

## 8. Unresolved Runtime Governance Risks

| # | Risk | Impact | Mitigation |
|---|------|--------|------------|
| 1 | T04 source contracts unwritten | Forecast Summary and GC/GR blocked at Stage 2 | Author T04 before implementing these repositories |
| 2 | SharePoint list migration strategy not yet determined | Transitional lists may constrain early implementation | Start with MockFinancialRepository; defer real persistence decisions |
| 3 | No authority enforcement in code | Domain ownership rules exist only in doctrine | Repository implementations must validate ownership tier before writes |
| 4 | Audit event schema not finalized | FinancialAuditEvent structure needs field-level specification | Audit repository can start with generic event envelope |
| 5 | P3-F1 publication handoff interface not defined | Publication repository needs handoff contract | Stub-ready via `promoteToPublished()` — needs runtime wiring |
