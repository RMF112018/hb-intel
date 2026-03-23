# P3-E4 — Financial Module: Field and Data Model Specification

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E4 |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Document Type** | Module Field Specification (master index) |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-23 |
| **Related Contracts** | P3-E1 §3.1, §9.1; P3-E2 §3; P3-F1; P3-H1 §6.1 |

---

## Purpose

This specification defines the complete data model, field definitions, status enumerations, business rules, and required workflows for the Financial module implementation. It is organized as a **master index + numbered detail files** to keep each topic navigable and implementation-ready.

Every field defined in the T-files **MUST** be implemented. A developer reading this specification must have no ambiguity about what to build.

---

## Operating Model

The Financial module is a **governed project-financial operating surface** — not an ERP mirror and not a spreadsheet clone. It supports:

- **Working forecast development** — PM maintains a live working version of the forecast throughout the month, editing line-level estimates and GC/GR projections against budget and actuals.
- **Internal confirmation checkpoints** — PM confirms immutable snapshots for review and reference without triggering official publication.
- **Monthly published reporting versions** — One confirmed version per reporting month is selected as the report candidate; report publication finalizes it as the published version.
- **Field-level executive review** — Portfolio Executive Reviewers annotate confirmed versions. Annotations are review-layer only and never mutate source-of-truth records.
- **Buyout control** — Subcontract and vendor commitments tracked as procurement/commitment-control state.
- **Variance and history continuity** — Budget line identity is stable across imports and versions.

---

## Source Files

| File | Purpose |
|------|---------|
| `docs/reference/example/Procore_Budget.csv` | Budget line item model (21 columns) |
| `docs/reference/example/Financial Forecast Summary & Checklist.xlsx` | Forecast summary and checklist |
| `docs/reference/example/GC-GR Forecast.xlsm` | GC/GR working model |
| `docs/reference/example/HB Draw Schedule -Cash Flow.xlsx` | Cash flow projection |
| `docs/reference/example/cash-flow.json` | JSON cash flow model |
| `docs/reference/example/ar-aging.json` | A/R aging display model |
| `docs/reference/example/Buyout Log_Template 2025.xlsx` | Buyout tracking |
| `docs/reference/example/cost-code-dictionary.csv` | 7,566 CSI cost codes |
| `docs/reference/example/csi-code-dictionary.csv` | CSI code reference |

---

## File Index

| File | Part | Contents |
|------|------|----------|
| **[P3-E4-T01-Module-Doctrine-and-Authority.md](P3-E4-T01-Module-Doctrine-and-Authority.md)** | T01 | Module purpose and boundary, what the module is not, authority model terminology, version state access rules |
| **[P3-E4-T02-Budget-Line-Identity-and-Import.md](P3-E4-T02-Budget-Line-Identity-and-Import.md)** | T02 | Budget line identity layers, identity resolution on import, reconciliation conditions, complete budget line field table, cost model, PM editing rules, CSV import workflow |
| **[P3-E4-T03-Forecast-Versioning-and-Checklist.md](P3-E4-T03-Forecast-Versioning-and-Checklist.md)** | T03 | Forecast version types, version record structure, derivation rules, confirmation lifecycle, report-candidate designation, staleness model, forecast checklist model and confirmation gate |
| **[P3-E4-T04-Forecast-Summary-and-GC-GR.md](P3-E4-T04-Forecast-Summary-and-GC-GR.md)** | T04 | Financial forecast summary fields (project metadata, schedule, financial summary, contingency, GC), GC/GR working model line record and category enumeration |
| **[P3-E4-T05-Cash-Flow-Working-Model.md](P3-E4-T05-Cash-Flow-Working-Model.md)** | T05 | Monthly actual cash flow record, forecast cash flow record, summary aggregate, retention calculation model, A/R aging display model |
| **[P3-E4-T06-Buyout-Sub-Domain.md](P3-E4-T06-Buyout-Sub-Domain.md)** | T06 | Buyout line item record, procurement status enumeration, ContractExecuted gate rule, dollar-weighted completion metric, savings tracking, savings disposition workflow and destinations |
| **[P3-E4-T07-Business-Rules-and-Calculations.md](P3-E4-T07-Business-Rules-and-Calculations.md)** | T07 | Sign convention and display rules, all calculated field formulas, status and lifecycle enumerations, version derivation rules, field summary index |
| **[P3-E4-T08-Platform-Integration-and-Annotation-Scope.md](P3-E4-T08-Platform-Integration-and-Annotation-Scope.md)** | T08 | Required capabilities, activity spine events, health spine metrics, work queue items, executive review annotation scope, annotation anchor model, annotation carry-forward on version derivation |
| **[P3-E4-T09-Implementation-and-Acceptance.md](P3-E4-T09-Implementation-and-Acceptance.md)** | T09 | Implementation guide (staged sub-scopes FIN.0–FIN.9), package blockers and status, cross-file follow-up notes, data import and migration strategy, full acceptance gate (AC-FIN-01 through AC-FIN-NN) |

### Reading guide

- **For data model and field questions:** T02 (budget lines), T03 (versions), T04 (summary and GC/GR), T05 (cash flow), T06 (buyout)
- **For calculation and formula questions:** T07
- **For integration and platform questions:** T08
- **For implementation sequencing:** T09 §9.1 Implementation Guide
- **For acceptance criteria:** T09 §9.4 Acceptance Gate
- **For module boundary and authority:** T01

---

*Navigation: [Master Index](P3-E4-Financial-Module-Field-Specification.md) | [T01 Module Doctrine →](P3-E4-T01-Module-Doctrine-and-Authority.md)*
