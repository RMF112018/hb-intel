# SF23 - Record Form (`@hbc/features-*` adapters over `@hbc/record-form`)

**Plan Version:** 1.1
**Date:** 2026-03-12
**Source Spec:** `docs/explanation/feature-decisions/PH7-SF-23-Shared-Feature-Record-Form.md`
**Priority Tier:** 2 - Application Layer (shared package; cross-module record lifecycle)
**Estimated Effort:** 4-6 sprint-weeks
**ADR Required:** `docs/architecture/adr/ADR-0114-record-form.md` + companion `@hbc/record-form` ADR

> **Doc Classification:** Canonical Normative Plan - SF23 implementation master plan for Record Form; governs SF23-T01 through SF23-T09.

---

## Purpose

SF23 defines a shared record authoring runtime as module adapters over Tier-1 `@hbc/record-form`, standardizing create/edit/duplicate/template/review flows, draft recovery, review and submission handoffs, offline replay, and telemetry across platform modules.
Industry baseline framing: enterprise platforms commonly expose configurable forms and validation controls, but SF23 remains differentiated by governed cross-module authoring runtime, state explainability, immutable provenance, and first-class offline submission continuity.

---

## Locked Interview Decisions

| # | Decision | Locked Choice |
|---|---|---|
| L-01 | Primitive abstraction | Lifecycle runtime, offline behavior, AI actions, BIC orchestration, and telemetry are owned by Tier-1 `@hbc/record-form` |
| L-02 | BIC ownership | Review/approval and post-submit handoff steps create granular BIC ownership with avatar projection in submit bar + My Work |
| L-03 | Complexity behavior | Essential minimal fields + simple submit bar; Standard full renderer + inline validation + read-only review; Expert retrospective adjustments + full preview + configure link |
| L-04 | Offline resilience | Service worker caching + IndexedDB persistence via `@hbc/versioned-record` + Background Sync replay + optimistic statuses |
| L-05 | AI embedding | Inline AI actions/placeholders only in field/review/submit surfaces; source citation + explicit approval required |
| L-06 | Deep-linking/provenance/telemetry | Deep-links via `@hbc/related-items`, My Work via `@hbc/project-canvas`, immutable provenance/snapshot via `@hbc/versioned-record`, five UX KPIs |

---

## Architectural Enhancement Status

This enhancement pass realigns SF23 to mold-breaker standards already established elsewhere in PH7.

- trust and implementation truth are now explicit: blocked, warning, queued, degraded, restored, partially recovered, and synced states must all explain themselves to the user
- review and handoff semantics are now operationally specific: blocking vs non-blocking, pre-submit vs post-submit, owner attribution, reassignment history, and downstream My Work visibility are all first-class plan concerns
- repeated authoring friction is reduced through explicit expectations for contextual defaults, restore-last-draft behavior, duplicate/template flows, recent-value reuse, and guarded destructive actions
- top recommended action and state confidence become required primitive concepts rather than ad hoc UI copy
- reusable visual component ownership is realigned to `@hbc/ui-kit` per `CLAUDE.md` while preserving `@hbc/record-form` as the runtime/orchestration owner

---

## Lifecycle and Trust Expectations

The SF23 family must use a shared vocabulary across all tasks:

- `blocked`
- `valid-with-warnings`
- `saved-locally`
- `queued-to-sync`
- `degraded`
- `recovered-needs-review`
- `partially-recovered`
- `top recommended action`
- `blocking review step`
- `non-blocking review step`
- `state confidence`

The package must make it clear to the user:

- why they cannot submit
- why a warning appears
- why a review step exists
- why a recovery banner is shown
- whether the visible state is local-only, queued, synced, degraded, or restored
- whether the current form state is trustworthy enough to continue, review, submit, or defer

Users must not be forced to infer lifecycle meaning from generic status text.

---

## Authoring Pattern Differentiation

SF23 must distinguish supported authoring patterns rather than relying on generic “works for all forms” wording.

- short-form records
  - minimal friction, low section count, direct submit orientation
- multi-step or wizard records
  - section sequencing, dependency-driven reveal logic, draft persistence at step boundaries, `@hbc/step-wizard` composition
- review-heavy records
  - explicit review-step contracts, downstream ownership, gate clarity, preview emphasis
- template-seeded or duplicate-from-existing flows
  - contextual defaults, inherited values, provenance and comparison expectations

The primitive chooses runtime behavior by pattern, but module adapters still own schema and domain rules.

---

## UI Ownership Alignment

`@hbc/record-form` owns runtime, contracts, orchestration hooks, adapters, lifecycle logic, and headless state interpretation.
Reusable visual primitives and reusable presentational surfaces belong in `@hbc/ui-kit` per the active UI Ownership Rule in `CLAUDE.md`.
Feature and shared packages may provide thin composition shells only when they do not introduce a new reusable visual primitive.

SF23 task docs must therefore:

- reuse `@hbc/ui-kit` primitives first
- treat `HbcRecordForm`, `HbcRecordSubmitBar`, `HbcRecordReviewPanel`, and `HbcRecordRecoveryBanner` as runtime-driven composition surfaces
- factor any reusable visual abstraction into `@hbc/ui-kit` instead of re-creating it locally

---

## Package Directory Structure

```text
packages/record-form/
|- package.json
|- README.md
|- tsconfig.json
|- vitest.config.ts
|- src/
|  |- index.ts
|  |- types/
|  |- model/
|  |- api/
|  |- hooks/
|  |- components/
|  |- adapters/
|- testing/

packages/features/business-development/
|- src/record-form/
|  |- profiles/
|  |- adapters/
|  |- hooks/
|  |- components/
|  |- telemetry/

packages/features/estimating/
|- src/record-form/
|  |- profiles/
|  |- adapters/
|  |- hooks/
|  |- components/
|  |- telemetry/
```

The primitive remains runtime-first; any reusable visual expansion triggered by SF23 belongs in `@hbc/ui-kit`.

---

## Definition of Done

- [ ] SF23 is documented as module adapters over `@hbc/record-form`
- [ ] all L-01 through L-06 decisions are represented in plan-family documents
- [ ] lifecycle state, trust state, and next recommended action semantics are explicit across T02-T06
- [ ] blocked, warning, queued, degraded, restored, and partially recovered states are all documented with user-facing explainability expectations
- [ ] review/handoff ownership, avatar projection, reassignment history, and My Work placement contracts are documented
- [ ] complexity behavior is explicit for Essential/Standard/Expert without contradictory lifecycle truth
- [ ] offline queue/replay model with `Saved locally` and `Queued to sync` is documented
- [ ] stale-draft comparison, restore/discard safeguards, and recovery-trust semantics are documented
- [ ] inline AI citation/approval constraints are documented with no sidecar behavior
- [ ] deep-link, canvas, provenance, snapshot freeze, and session-state boundaries are documented
- [ ] five SF23 telemetry KPIs are documented with operational value emphasis
- [ ] SF23-T09 includes trust/recovery/review closure criteria and PH7 governance checks
- [ ] `current-state-map.md` update requirements include SF23 and ADR-0114 linkage

---

## Task File Index

| File | Contents |
|---|---|
| `SF23-T01-Package-Scaffold.md` | primitive + adapter scaffolds, headless/runtime seams, README requirements, trust/review/recovery exports |
| `SF23-T02-TypeScript-Contracts.md` | canonical primitive contracts, trust/explainability models, review semantics, recovery and next-action projections |
| `SF23-T03-Record-Lifecycle-and-Storage.md` | lifecycle states, local/server/restored draft distinctions, replay/conflict rules, destructive-action safeguards |
| `SF23-T04-Hooks-and-State-Model.md` | primitive hooks, derived explainability, confidence state, next-step computation, and replay-safe orchestration |
| `SF23-T05-HbcRecordForm-and-HbcRecordSubmitBar.md` | form and submit-bar UX contracts, blocked/warning visibility, recommended action, and safe submit behavior |
| `SF23-T06-HbcRecordReviewPanel-and-Recovery-Banner.md` | review/recovery behavior, stale-draft compare flows, restore/discard trust semantics, and retry guidance |
| `SF23-T07-Reference-Integrations.md` | Tier-1 integration boundaries, provenance obligations, step-wizard and session-state composition rules |
| `SF23-T08-Testing-Strategy.md` | fixtures, trust/recovery/review scenario matrix, quality gates |
| `SF23-T09-Testing-and-Deployment.md` | closure checklist, ADR/docs/index/state-map updates, and trust/recovery/review verification commands |
