# ADR-0092 — Acknowledgment as a Platform Primitive

**Status:** Accepted
**Date:** 2026-03-09
**Deciders:** HB Intel Architecture Team
**Supersedes:** None
**Related ADRs:** ADR-0011 (BIC Next Move), ADR-0081 (Complexity Dial)

---

## Context

Multiple HB Intel modules require structured sign-off: a named person formally
acknowledging a record with a timestamped, auditable event. Without a shared package,
each module builds its own sign-off widget — producing inconsistent behaviour,
duplicated API patterns, and audit trails that cannot aggregate across modules.

`@hbc/acknowledgment` makes structured sign-off a platform primitive with a generic
`IAcknowledgmentConfig<T>` contract, three acknowledgment modes, and a cross-module
audit trail stored in `HbcAcknowledgmentEvents`.

---

## Decision 1 (D-01) — Sequential Enforcement: Hard Server-Side + Auditable Bypass

**Decision:** `POST /api/acknowledgments` validates that the submitting user is the
current sequential party before writing. Out-of-order submissions return HTTP 403.
An optional `bypassSequentialOrder: true` flag is accepted when the submitting user
holds the `AcknowledgmentAdmin` role. Bypass events are written with
`status: 'bypassed'` and `IsBypass: true` on the SharePoint list.

**Rejected:** UI-only soft enforcement (bypasses possible from API clients; no audit
trail for out-of-order events).

**Consequences:** Sequential integrity is server-guaranteed. Bypass events are
permanently visible in the audit trail with the admin's UPN. The `bypassed` status
is defined in `AcknowledgmentStatus` — the spec anticipated this requirement.

---

## Decision 2 (D-02) — Optimistic Updates + Offline Queue

**Decision:** TanStack Query `onMutate` immediately updates the cache optimistically.
On `onError` with a network failure (TypeError, status 0/408/503/504), the attempt is
written to `@hbc/session-state` offline queue with an idempotency key and the party
row shows `isPendingSync: true`. On logical failure (4xx), the cache snapshot is
restored. The queue replays in `enqueuedAt` ascending order on reconnect.

**Rejected:** Optimistic-only without offline queue (loses acknowledgments on poor
connectivity); spinner-only without optimistic update (sluggish UX for field staff).

**Consequences:** Field staff on job sites with poor connectivity can complete sign-off
actions; the action is displayed as "pending sync" rather than failed. Client-side
`acknowledgedAt` timestamps are accepted as authoritative — appropriate for construction
workflows where the moment of intent matters.

---

## Decision 3 (D-03) — Confirmation Phrase: Configurable, Default "I CONFIRM"

**Decision:** `IAcknowledgmentConfig` accepts `confirmationPhrase?: string` (default
`"I CONFIRM"`). The modal renders: "Type [phrase] to proceed." Module authors may
specify alternative phrases (e.g., `"APPROVED"`, `"I ACCEPT"`).

**Rejected:** Fixed `"I CONFIRM"` platform-wide (prevents module-specific language for
stronger psychological commitment); per-party phrase (excessive complexity).

**Consequences:** `HbcAcknowledgmentModalProps.confirmationPhrase` is already defined
in the spec — design anticipated this. JSDoc note encourages consistent phrasing within
the monorepo. No allowlist required for a controlled internal API surface.

---

## Decision 4 (D-04) — Decline Reason: Configurable (Free-Text Default, Categories Optional)

**Decision:** `IAcknowledgmentConfig` accepts `declineReasons?: string[]`. If absent:
free-text textarea with 10-character minimum. If provided: radio button list of the
supplied categories, each with an optional free-text elaboration field.

**Rejected:** Required category selection platform-wide (requires platform-level
taxonomy maintenance; inappropriate for simple receipt-confirmation workflows);
free-text only (prevents structured decline analytics for workflows that need it).

**Consequences:** Each module config defines its own decline reason set. Cross-module
decline aggregation deferred to a reporting phase when production patterns emerge.

---

## Decision 5 (D-05) — Data Fetching: 60-Second Poll + Window-Focus Refetch

**Decision:** `useAcknowledgment` uses `staleTime: 30_000`, `refetchOnWindowFocus: true`,
`refetchInterval: 60_000`. Mutations invalidate immediately.

**Rejected:** No background poll (stale sequential state persists if panel left open;
Party 2 cannot detect Party 1's acknowledgment without refresh); fetch-once (same problem).

**Consequences:** Sequential mode awareness is maintained with ≤60s latency. Consistent
with `@hbc/bic-next-move` polling strategy (SF02 D-07). Detail pages have short dwell
time (user acts then navigates away), limiting API load from background polling.

---

## Decision 6 (D-06) — Completion Trigger: Azure Function Authoritative

**Decision:** `POST /api/acknowledgments` detects completion server-side and fires BIC
transfer + Watch-tier notification as side-effects. Client-side `onAllAcknowledged`
callback handles local UI effects only (completion banner, panel state). Both trigger
independently — server owns durability, client owns UX.

**Rejected:** Client-only trigger (lost if user closes tab immediately after submit);
optimistic-only trigger (fires before server confirmation; inconsistent on rollback).

**Consequences:** BIC transfer and notifications are guaranteed even when the browser is
closed immediately after sign-off. Non-fatal error handling on the Azure Function
ensures a BIC/notification failure does not block the acknowledgment write.

---

## Decision 7 (D-07) — Complexity Integration: Panel Gated, Badge Floor = Standard

**Decision:** `HbcAcknowledgmentPanel`: Essential = CTA only, Standard = full party list,
Expert = full audit trail with timestamps. `HbcAcknowledgmentBadge`: floor = Standard
(count + icon always shown regardless of complexity tier); Expert adds hover tooltip
listing pending party names.

**Rejected:** Badge gated at Essential (suppresses "N of M" count — actively harms field
staff ability to prioritise sign-off tasks); full gating on badge (no meaningful UX
difference at lower tiers; badge is already minimal).

**Consequences:** Field staff in Essential tier still see sign-off progress in list rows.
Expert users see the full audit trail without navigating to a separate view.

---

## Decision 8 (D-08) — Context Type Identity: `ACK_CONTEXT_TYPES` Registry

**Decision:** `src/config/contextTypes.ts` exports `ACK_CONTEXT_TYPES` as a typed
`const` object. `IAcknowledgmentConfig.contextType` is typed as the union of values.
New adoptions add a PR to register their context type.

**Rejected:** Free-form strings (typos split the audit trail permanently; no
discoverability); dev-mode runtime allowlist check (type safety lost in production).

**Consequences:** Type-safe, IDE-autocomplete-discoverable, typo-proof context keys. The
PR requirement is a feature — it creates a centralised registry of every module that
uses acknowledgment, providing architectural visibility.

---

## Decision 9 (D-09) — Parallel Decline Logic: Any Decline = Immediate Block

**Decision:** Any required party decline sets `overallStatus: 'declined'`,
`isComplete: false`, and prevents all further acknowledgments. The Azure Function
returns 409 for subsequent submissions when a decline exists. Record owner must resolve.

**Rejected:** Decline marks party but allows others to continue (creates false records
where a package with a formal objection is partially approved); retraction window
(useful, but adds state machine complexity — deferred as a future config flag).

**Consequences:** Construction-industry-appropriate: one formal "no" blocks the workflow.
Retraction can be added as `allowRetraction?: boolean` in a future iteration without
breaking the base contract.

---

## Decision 10 (D-10) — Testing Sub-Path: `@hbc/acknowledgment/testing`

**Decision:** `testing/` sub-path exports: `createMockAckConfig<T>`, `createMockAckState`,
`mockAckStates` (6 canonical states: `pending`, `partialParallel`, `complete`, `declined`,
`bypassed`, `offlinePending`), `mockUseAcknowledgment`, `createAckWrapper`.

**Rejected:** Minimal (factories only — each consumer reinvents hook mocks); full
`AckTestPanel` rendered harness (useful but premature for this phase; Storybook stories
can use `createAckWrapper` directly).

**Consequences:** Consistent with SF02 and SF03 testing patterns. One-liner test setup
for consuming modules. Zero mock drift risk. Testing code excluded from production bundle.
