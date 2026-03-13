# SF28 - Activity Timeline (`@hbc/activity-timeline` + `@hbc/ui-kit` timeline surfaces)

**Plan Version:** 1.0
**Date:** 2026-03-12
**Source Spec:** `docs/explanation/feature-decisions/PH7-SF-28-Shared-Feature-Activity-Timeline.md`
**Priority Tier:** 2 - Application Layer (shared package; cross-module history and transparency utility)
**Estimated Effort:** 4-5 sprint-weeks
**ADR Required:** `docs/architecture/adr/ADR-0114-activity-timeline.md` + companion `@hbc/activity-timeline` ADR

> **Doc Classification:** Canonical Normative Plan - SF28 implementation master plan for Activity Timeline; governs SF28-T01 through SF28-T09.

---

## Purpose

SF28 defines a shared cross-module activity-history runtime that standardizes event emission, event normalization, append-only persistence, timeline querying, diff summarization, and readable event rendering across HB Intel modules.
Industry baseline framing: enterprise platforms commonly expose activity logs and audit feeds, but SF28 remains differentiated by governed cross-module event truth, readable operational narratives, and explicit user-versus-system transparency.

---

## Locked Interview Decisions

| # | Decision | Locked Choice |
|---|---|---|
| L-01 | Primitive ownership | `@hbc/activity-timeline` owns normalized event contracts, emitter helpers, normalization, storage adapters, query orchestration, summarization, grouping, telemetry, and testing utilities |
| L-02 | Truth model | Timeline truth is append-only and audit-friendly; summaries are readable projections, not the system of record |
| L-03 | Version relationship | `@hbc/versioned-record` remains the authoritative snapshot primitive; activity timeline narrates operational history around those snapshots |
| L-04 | Storage strategy | MVP storage is SharePoint-backed append-only event persistence with read-optimized query projection; future Azure event store is a compatibility seam, not an MVP dependency |
| L-05 | Actor attribution | Actor attribution distinguishes user, system, workflow, and service-account execution, including `initiatedBy`, `executedBy`, `onBehalfOf`, and correlation context where available |
| L-06 | Query modes | record, related, and workspace timelines are projections over one canonical event model |
| L-07 | Dedupe boundary | dedupe and correlation are permitted only as read-model hygiene; raw event evidence is never silently discarded |
| L-08 | UI ownership | reusable timeline surfaces belong in `@hbc/ui-kit`; `@hbc/activity-timeline` exports runtime state and thin composition shells only |
| L-09 | Offline truth | `@hbc/session-state` integration may surface queued local events with explicit sync truth; local pending rows must never be rendered as persisted audit history |
| L-10 | Explainability | every timeline row must answer what changed, who did it, when, what it affected, whether it was user or system initiated, and what to open next for context |

---

## Architectural Enhancement Status

This plan family aligns SF28 to the same PH7 mold-breaker standards established for trust, transparency, and cross-module coherence.

- transparent systems are now explicit: system-originated, workflow-originated, replayed, deduplicated, and queued-local events must identify themselves
- audit-friendly truth is first-class: append-only evidence is preserved even when read models collapse duplicates or group events for readability
- cross-record context is now operationally useful: record, related, and workspace feeds all project from one normalized event model
- repeated audit friction is reduced through relative-date grouping, recommended-open targets, concise summaries, and filter defaults that surface signal before noise
- reusable visual ownership is aligned to `@hbc/ui-kit` per `CLAUDE.md`; `@hbc/activity-timeline` remains runtime-first and adapter-safe

---

## Transparent Systems Expectations

The SF28 family must use a shared vocabulary across all tasks:

- `authoritative event`
- `replayed event`
- `queued local event`
- `deduplicated projection`
- `diff available`
- `system initiated`
- `user initiated`
- `workflow initiated`
- `event confidence`

The package must make it clear to the user:

- what changed
- who initiated and who executed the change
- what record, version, handoff, export, or related object the event affected
- whether the event is authoritative, pending local, replayed, degraded, or deduplicated in the current view
- what should be opened next to understand the surrounding context

Users must never be forced to infer whether “the system did something” or “a person did something” from wording alone.

---

## Event Truth and Provenance Expectations

SF28 must distinguish narrative, evidence, and projection explicitly.

- authoritative event
  - immutable stored event evidence with source metadata, actor attribution, and timestamps
- normalized event
  - canonical event shape used by all query modes and UI surfaces
- read-model projection
  - grouped, deduplicated, or filtered output for user consumption
- source truth stamp
  - module, record, version, correlation, causation, and storage metadata proving where the event came from

The timeline is not a replacement for full snapshots, raw logs, or version payloads. It is the consistent narrative surface that makes platform actions understandable without sacrificing auditability.

---

## Timeline Pattern Differentiation

SF28 must distinguish supported timeline modes rather than relying on vague “activity feed” wording.

- record timeline
  - operational history for a single record or artifact
- related activity timeline
  - cross-record history through `primaryRef` and `relatedRefs`
- workspace activity feed
  - recent activity across a module, project, or work context

These modes share one event model, one filter model, and one summarization model.

---

## UI Ownership Alignment

`@hbc/activity-timeline` owns runtime, contracts, normalization, emitter helpers, adapters, query/state interpretation, and telemetry.
Reusable visual primitives and reusable presentational surfaces belong in `@hbc/ui-kit` per the active UI Ownership Rule in `CLAUDE.md`.
Feature and shared packages may provide thin composition shells only when they do not introduce a new reusable visual primitive.

SF28 task docs must therefore:

- reuse `@hbc/ui-kit` primitives first
- treat `HbcActivityTimeline`, `ActivityEventRow`, `ActivityEventIcon`, `ActivityFilterBar`, `ActivityDiffPopover`, and `ActivityEmptyState` as runtime-driven reusable surfaces
- factor any reusable visual timeline abstraction into `@hbc/ui-kit` instead of re-creating it in `@hbc/activity-timeline`

---

## Package Directory Structure

```text
packages/activity-timeline/
|- package.json
|- README.md
|- tsconfig.json
|- vitest.config.ts
|- src/
|  |- index.ts
|  |- types/
|  |- model/
|  |- formatters/
|  |- storage/
|  |- adapters/
|  |- hooks/
|  |- telemetry/
|- testing/

packages/ui-kit/
|- src/HbcActivityTimeline/
|- src/ActivityEventRow/
|- src/ActivityEventIcon/
|- src/ActivityFilterBar/
|- src/ActivityDiffPopover/
|- src/ActivityEmptyState/
```

The runtime remains headless-first; any reusable visual expansion triggered by SF28 belongs in `@hbc/ui-kit`.

---

## Definition of Done

- [ ] SF28 is documented as a shared append-only activity-history runtime over `@hbc/activity-timeline`
- [ ] all L-01 through L-10 decisions are represented in plan-family documents
- [ ] event truth, provenance, and explainability semantics are explicit across T02-T06
- [ ] record, related, and workspace timelines are documented as projections over one canonical event model
- [ ] authoritative, replayed, queued-local, degraded, and deduplicated projection states are documented with user-facing explainability expectations
- [ ] actor attribution, correlation, and system-vs-user transparency rules are documented
- [ ] diff summarization, filter behavior, and recommended-open semantics are documented
- [ ] SharePoint-backed MVP storage and future Azure event store migration seam are documented
- [ ] offline/session-state pending-event behavior is documented without contradictory audit messaging
- [ ] related-items, workflow-handoff, versioned-record, acknowledgment, and notification integrations are documented
- [ ] five SF28 telemetry KPIs are documented with operational value emphasis
- [ ] SF28-T09 includes trust/transparency/testing closure criteria and PH7 governance checks
- [ ] `current-state-map.md` update requirements include SF28 and ADR-0114 linkage

---

## Task File Index

| File | Contents |
|---|---|
| `SF28-T01-Package-Scaffold.md` | package scaffold, runtime/headless seams, ui-kit ownership boundary, and README requirements |
| `SF28-T02-TypeScript-Contracts.md` | canonical event contracts, actor attribution, provenance, query/filter, and confidence models |
| `SF28-T03-Event-Normalization-and-Storage.md` | emit/normalize/append/query lifecycle, SharePoint MVP storage, dedupe, replay, and migration seam |
| `SF28-T04-Hooks-and-State-Model.md` | primitive hooks, derived summaries, filter state, source health, and pending-event interpretation |
| `SF28-T05-ActivityTimeline-and-EventRow.md` | timeline and event-row rendering contracts, chronology, grouping, context links, and accessible iconography |
| `SF28-T06-ActivityFilters-and-DiffPopover.md` | filter bar, diff popover, empty/degraded states, and audit-friction reduction expectations |
| `SF28-T07-Event-Emitter-and-Source-Adapters.md` | shared emitter helper and current/future package adapter seams |
| `SF28-T08-Testing-Strategy.md` | fixtures, normalization/filter/diff scenario matrix, and quality gates |
| `SF28-T09-Testing-and-Deployment.md` | closure checklist, ADR/docs/index/state-map updates, and transparency verification commands |
