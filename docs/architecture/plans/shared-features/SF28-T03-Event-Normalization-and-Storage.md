# SF28-T03 - Event Normalization and Storage: Activity Timeline

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-28-Shared-Feature-Activity-Timeline.md`
**Decisions Applied:** L-01 through L-07, L-09, L-10
**Estimated Effort:** 0.9 sprint-weeks
**Depends On:** T02

> **Doc Classification:** Canonical Normative Plan - SF28-T03 lifecycle/storage task; sub-plan of `SF28-Activity-Timeline.md`.

---

## Objective

Define deterministic event lifecycle transitions, append-only persistence rules, normalization/dedupe boundaries, replay semantics, and storage migration seams without losing audit evidence.

---

## Lifecycle Contract

- activity event lifecycle is `emit -> validate -> normalize -> append -> project/query -> render`
- source emitters provide emission input only; normalization remains primitive-owned
- raw stored events are immutable and append-only
- read models may group, summarize, or dedupe for readability, but must preserve reference back to raw evidence
- timeline render state must distinguish authoritative, queued-local, replayed, and degraded events

---

## SharePoint MVP Storage Model

The MVP storage path is a SharePoint-backed append-only event list plus read-optimized query projection.

- stored record contains immutable event id, correlation id, causation id, source module, timestamp, actor attribution, object refs, and serialized diff/context payload
- query adapter reads raw rows and normalizes them into canonical event pages
- read-model grouping and dedupe occur after append, never before persistence
- projection queries support record, related, and workspace modes without changing stored evidence

This path is selected because it fits current repo truth and preserves a future adapter migration to Azure without rewriting the public contract.

---

## Future Azure Event Store Seam

- future adapter path may append the same normalized storage record shape into Azure-backed storage
- projection reader may move to a dedicated read model or event-projection service
- public event/query/filter contracts must not change when the storage adapter changes
- full platform-wide event sourcing is explicitly out of MVP scope; Azure guidance supports using event-style append-only history selectively without forcing every state transition to be event-sourced

---

## Provenance and Correlation Contract

- every stored event includes:
  - immutable `eventId`
  - `correlationId`
  - `causationId`
  - source module stamp
  - source record/version/publish/handoff identifiers where applicable
  - actor attribution payload
  - creation timestamp
- diff summarization must preserve original field identity even when the rendered popover truncates values
- source mismatch or degraded context must downgrade confidence rather than rewriting history

---

## Dedupe, Replay, and Recovery Contract

- dedupe is projection-only hygiene for duplicate emissions, replayed queued events, or correlation-collapse rules
- dedupe must preserve raw evidence and expose a reason code
- local queued events from `@hbc/session-state` remain visibly pending until authoritative persistence is confirmed
- replayed events must carry explicit replay state and correlation back to the queued-local source
- degraded or partial source context must remain visible rather than silently dropping the event

---

## Governance Contract

- timeline evidence remains append-only
- source adapters may not hard-delete or mutate persisted event history
- dismissal, hiding, or compact grouping in UI must never imply deletion from storage
- event storage and projections must support auditable troubleshooting for “what happened” and “why did the system do that”

---

## Verification Commands

```bash
pnpm --filter @hbc/activity-timeline check-types
pnpm --filter @hbc/activity-timeline test -- normalization
pnpm --filter @hbc/activity-timeline test -- storage
```
