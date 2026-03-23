# SF27 - Bulk Actions (`@hbc/bulk-actions` + `@hbc/ui-kit` bulk-action surfaces)

**Plan Version:** 1.0
**Date:** 2026-03-12
**Source Spec:** `docs/explanation/feature-decisions/PH7-SF-27-Shared-Feature-Bulk-Actions.md`
**Priority Tier:** 2 - Application Layer (shared package; cross-module operational utility)
**Estimated Effort:** 4-5 sprint-weeks
**ADR Required:** `docs/architecture/adr/ADR-0114-bulk-actions.md` + companion `@hbc/bulk-actions` ADR

> **Doc Classification:** Canonical Normative Plan - SF27 implementation master plan for Bulk Actions; governs SF27-T01 through SF27-T09.

---

## Purpose

SF27 defines a shared multi-select action runtime that standardizes selection semantics, per-item eligibility evaluation, confirmation behavior, chunked execution, mixed-result reporting, and safe queue-scale action handling across HB Intel modules.
Industry baseline framing: enterprise systems commonly expose ad hoc mass-edit flows, but SF27 remains differentiated by explicit selection truth, per-item action eligibility, deterministic mixed-result handling, and reusable batch-action safety semantics.

---

## Locked Decisions

| # | Decision | Locked Choice |
|---|---|---|
| L-01 | Runtime ownership | `@hbc/bulk-actions` owns canonical contracts, selection semantics, eligibility orchestration, execution lifecycle, result aggregation, telemetry, and testing utilities |
| L-02 | UI ownership | reusable bulk-action surfaces belong in `@hbc/ui-kit`; `@hbc/bulk-actions` exports headless state and thin composition helpers only |
| L-03 | Selection truth | selection truth distinguishes current page, visible rows, and filtered set explicitly; implicit whole-dataset actions are disallowed by default |
| L-04 | Eligibility granularity | eligibility is evaluated per item, not only per batch, and must surface ineligible reasons before execution |
| L-05 | Execution default | bulk execution is partial-success-first by default; no implicit rollback unless an action explicitly declares transactional semantics |
| L-06 | Action model | immediate and configured bulk actions share one action contract and one result model |
| L-07 | Safety warnings | destructive and externally visible actions require exact count truth, explicit confirmation, and elevated warnings |
| L-08 | Result truth | execution progress and final results separately represent intent, attempted items, succeeded items, skipped items, failed items, and retryable items |
| L-09 | Filtered-set scope | filtered-set selection is captured as an explicit scope snapshot and exact filtered count, not inferred from the grid at confirmation time |
| L-10 | Integration posture | telemetry and future audit/event emission must make mass actions transparent without making `@hbc/activity-timeline` or `@hbc/publish-workflow` MVP dependencies |

---

## Architectural Enhancement Status

This plan family aligns SF27 to the strengthened PH7 standards for trust, explainability, and workflow-scale productivity.

- selection truth is now first-class: users must know whether they selected a page subset, visible set, or filtered set before anything runs
- mixed outcomes are now the standard model rather than an edge case: skipped, failed, and retryable results must be visible and explainable
- high-risk batch actions are now operationally safe: destructive actions, externally visible actions, and permission-sensitive actions must surface warnings before execution
- current table/list seams are reused rather than bypassed: `HbcDataTable` row selection and `ListLayout` bulk bar become the primary integration points
- reusable UI ownership is aligned to `@hbc/ui-kit` per `CLAUDE.md`; `@hbc/bulk-actions` remains runtime-first and adapter-safe

---

## Selection and Result Truth Expectations

The SF27 family must use a shared vocabulary across all tasks:

- `page selection`
- `visible selection`
- `filtered selection`
- `exact attempted count`
- `eligible`
- `ineligible`
- `permission blocked`
- `destructive warning`
- `mixed result`
- `retryable item`

The package must make it clear to the user:

- what set of items will be affected
- whether the action applies to selected rows only or the filtered result set
- how many items are eligible, ineligible, blocked, or warning-gated
- whether the action is immediate or requires input/configuration
- what actually happened after execution, including skipped and failed items

Users must never be forced to infer whether “3 selected” means 3 visible rows, 3 rows on this page, or all rows in the filtered dataset.

---

## Attention Management Expectations

SF27 must reduce repetitive operational friction without increasing accidental-action risk.

- immediate actions stay lightweight for low-risk batch work
- configured actions open a shared input/confirm path only when needed
- results summarize patterns first so users do not inspect every row to understand a partial outcome
- retry flows operate on failed/retryable subsets by default

This package should help users process work at batch scale while staying confident about scope and outcome.

---

## Bulk Action Pattern Differentiation

SF27 must distinguish supported action patterns rather than relying on generic “bulk action” wording.

- immediate bulk action
  - no extra input required after selection and confirmation
- configured bulk action
  - requires lightweight input before execution
- destructive bulk action
  - archive, revoke, close, or otherwise high-impact action requiring elevated warning
- externally visible bulk action
  - publish, notify, route, or other actions with broader downstream visibility

These patterns share one contract model, one scope model, and one result model.

---

## UI Ownership Alignment

`@hbc/bulk-actions` owns runtime, contracts, selection state, eligibility evaluation, execution orchestration, result-state interpretation, and telemetry.
Reusable visual primitives and reusable presentational surfaces belong in `@hbc/ui-kit` per the active UI Ownership Rule in `CLAUDE.md`.
Feature and shared packages may provide thin composition shells only when they do not introduce a new reusable visual primitive.

SF27 task docs must therefore:

- reuse `@hbc/ui-kit` primitives first
- treat `BulkSelectionBar`, `BulkActionMenu`, `BulkActionConfirmDialog`, `BulkActionInputDialog`, `BulkActionResultsPanel`, and `SelectAllFilteredBanner` as reusable runtime-driven surfaces
- factor any reusable visual bulk-action abstraction into `@hbc/ui-kit` instead of re-creating it in `@hbc/bulk-actions`

---

## Package Directory Structure

```text
packages/bulk-actions/
|- package.json
|- README.md
|- tsconfig.json
|- vitest.config.ts
|- src/
|  |- index.ts
|  |- types/
|  |- model/
|  |- selection/
|  |- execution/
|  |- adapters/
|  |- hooks/
|  |- telemetry/
|- testing/

packages/ui-kit/
|- src/BulkSelectionBar/
|- src/BulkActionMenu/
|- src/BulkActionConfirmDialog/
|- src/BulkActionInputDialog/
|- src/BulkActionResultsPanel/
|- src/SelectAllFilteredBanner/
```

The runtime remains headless-first; any reusable visual expansion triggered by SF27 belongs in `@hbc/ui-kit`.

---

## Phase 3 Integration

**Phase 3 Stage:** Stage 5 — Shared Feature Infrastructure Completion (Stage 5.6)
**Phase 3 Workstream:** Workstream I — Shared Feature Infrastructure
**Governing Plan:** `docs/architecture/plans/MASTER/phase-3-deliverables/README.md`

SF27 is incorporated into Phase 3 as Workstream I item 5.6 and is the last shared feature delivered in Stage 5. All Phase 3 modules with queue or grid surfaces — Financial, Schedule, Constraints, Permits, Safety, Reports, Project Closeout, Project Startup, and Subcontract Compliance — support multi-select and batch action patterns (bulk status updates, bulk assignment changes, bulk archive, bulk export). SF27 produces `@hbc/bulk-actions` with the shared selection runtime, eligibility framework, and `IBulkActionExecutionContext` handoff surface. Stage 5.6 depends on Stage 5.4 (SF26 Saved Views) because the `ISavedViewContext` snapshot feeds the bulk-action execution scope. Stage 5.6 must complete before module-level bulk-action integration begins in Stage 6. See P3-E1 §13 for per-module integration contracts.

---

## Definition of Done

- [ ] SF27 is documented as a shared selection and bulk-execution runtime over `@hbc/bulk-actions`
- [ ] all L-01 through L-10 decisions are represented in plan-family documents
- [ ] page, visible, and filtered selection semantics are explicit across T02-T06
- [ ] immediate and configured actions are documented over one canonical action contract
- [ ] eligibility, permission, destructive-warning, and mixed-result semantics are documented with user-facing explainability expectations
- [ ] chunked execution, retryable failures, and no-rollback-by-default behavior are documented
- [ ] `HbcDataTable` and `ListLayout` selection seams are documented as current integration points
- [ ] future-only seams (`saved-views`, `publish-workflow`, `activity-timeline`) are documented without becoming MVP dependencies
- [ ] result reporting includes succeeded, skipped, failed, and retryable states with grouped reason patterns
- [ ] five SF27 telemetry KPIs are documented with operational value emphasis
- [ ] SF27-T09 includes truth/safety/result transparency closure criteria and PH7 governance checks
- [ ] `current-state-map.md` update requirements include SF27 and ADR-0114 linkage

---

## Task File Index

| File | Contents |
|---|---|
| `SF27-T01-Package-Scaffold.md` | package scaffold, runtime/headless seams, ui-kit ownership boundary, and README requirements |
| `SF27-T02-TypeScript-Contracts.md` | canonical selection/action/eligibility/execution/result contracts and reason-code models |
| `SF27-T03-Selection-Lifecycle-and-Execution.md` | select/scope/evaluate/confirm/execute/report lifecycle, chunking, and retry semantics |
| `SF27-T04-Hooks-and-State-Model.md` | primitive hooks, scope state, eligibility state, execution state, and result-state interpretation |
| `SF27-T05-BulkSelectionBar-and-BulkActionMenu.md` | selection bar/menu rendering contracts, action availability, and scope disclosure |
| `SF27-T06-BulkActionConfirmDialog-and-ResultsPanel.md` | confirm/input/results behavior, safety warnings, and grouped mixed-result reporting |
| `SF27-T07-Reference-Integrations.md` | current/future integration boundaries, selection-source seams, and side-effect posture |
| `SF27-T08-Testing-Strategy.md` | fixtures, selection/eligibility/execution scenario matrix, and quality gates |
| `SF27-T09-Testing-and-Deployment.md` | closure checklist, ADR/docs/index/state-map updates, and truth/safety verification commands |
