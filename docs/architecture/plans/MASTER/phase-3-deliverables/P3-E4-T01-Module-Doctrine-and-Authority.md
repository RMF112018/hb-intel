# P3-E4 — Financial Module: Module Doctrine and Authority

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E4-T01 |
| **Parent** | [P3-E4 Financial Module Field Specification](P3-E4-Financial-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T01: Module Doctrine and Authority |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-23 |

---

*This file covers: module purpose and boundary, what the module is not, authority model terminology, and version state access rules. See [T02](P3-E4-T02-Budget-Line-Identity-and-Import.md) for the budget line field model and [T03](P3-E4-T03-Forecast-Versioning-and-Checklist.md) for forecast versioning.*

---

## 1. Module Doctrine and Authority

### 1.1 What this module is

The Financial module is a **governed project-financial operating surface**. It supports:

- **Working forecast development** — PM maintains a live working version of the forecast throughout the month, editing line-level estimates and GC/GR projections against budget and actuals.
- **Internal confirmation checkpoints** — PM can confirm an internal version at any point; this creates an immutable confirmed snapshot for review and reference without triggering official publication.
- **Monthly published reporting versions** — One confirmed version per reporting month is selected as the report candidate. Official report publication finalizes that candidate as the published version for the month.
- **Field-level executive review** — Portfolio Executive Reviewers may annotate confirmed versions. Annotations are review-layer only and never mutate source-of-truth records.
- **Buyout control** — Subcontract and vendor commitments are tracked as procurement/commitment-control state, not as work-complete or invoiced-complete state.
- **Variance and history continuity** — Budget line identity is stable across imports and versions. Month-over-month comparison and annotation continuity are explicit design requirements.

### 1.2 What this module is not

- **Not the accounting system of record.** Budget baseline originates in Procore; actual cost data comes from Procore/ERP. Project Hub owns the normalized operational state built from those inputs (P3-E2 §3.3).
- **Not a general-purpose ERP or job-cost ledger.** The module tracks the PM's operating view of project financials, not the full accounting ledger.
- **Not a reporting artifact factory.** The Reports module (P3-F1) owns report drafts, generation, and release. Financial supplies confirmed snapshots; Reports assembles and publishes.
- **Not an approval system for report release.** Report approval and release authority is governed by P3-F1 and the central project-governance policy record.

### 1.3 Authority model terminology

| Term | Meaning |
|------|---------|
| **Leadership** | Department-scoped authority over all projects in a department |
| **Portfolio Executive Reviewer (PER)** | Department-scoped, non-membership review-layer access; may annotate confirmed Financial versions and generate reviewer-generated report runs |
| **Project Executive (PE)** | Project-scoped full operational authority; approves reports, manages project settings |
| **PM / Project Team** | Operational authority over Financial working state; owns all forecast edits and confirmations |

### 1.4 Version state access rules

| Version State | PM Access | PER Access | Leadership Access |
|---------------|-----------|------------|-------------------|
| `Working` | Full read/write | **None** — working draft not visible to PER | Read-only (with membership or authority scope) |
| `ConfirmedInternal` | Full read; derive new working version; designate report candidate | Read + annotate via `@hbc/field-annotations` | Read-only |
| `PublishedMonthly` | Read-only | Read + annotate via `@hbc/field-annotations` | Read-only |
| `Superseded` | Read-only (audit) | Read-only | Read-only |

**Key principle:** PER never sees the PM's working draft. The working version is the PM's in-progress operating state. PER access begins at confirmed snapshots only.

**No "unlock in place" for confirmed versions:** Once a version is confirmed, it is immutable. To make edits, PM derives a new working version from the confirmed version and edits the working version.

### 1.5 Integration boundary with Procore and ERP

The Financial module consumes data from Procore (budget, actuals, committed costs) and the accounting/ERP system (A/R aging). It does not write to either system. The boundary is:

| Data direction | Description |
|----------------|-------------|
| Procore → Financial | Budget line import (CSV today; direct API in future); actuals and committed costs |
| ERP → Financial | A/R aging data via daily sync; read-only display |
| Financial → Reports (P3-F1) | Confirmed snapshot designated as report candidate; published version on finalization |
| Financial → Health spine | Project financial health metrics on confirmation (T08 §8.2) |
| Financial → Work Queue | Action items for PM on reconciliation, overbudget conditions, savings disposition (T08 §8.3) |

---

*Navigation: [Master Index](P3-E4-Financial-Module-Field-Specification.md) | [T02 Budget Line Identity and Import →](P3-E4-T02-Budget-Line-Identity-and-Import.md)*
