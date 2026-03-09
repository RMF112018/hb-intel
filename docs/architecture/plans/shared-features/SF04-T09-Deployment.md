# SF04-T09 — Deployment: `@hbc/acknowledgment`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Decisions Applied:** D-01 through D-10 (all)
**Estimated Effort:** 0.25 sprint-weeks
**Wave:** 4

---

## Objective

Produce the pre-deployment checklist, the ADR documenting all ten locked decisions, the module adoption guide, and the blueprint progress comment — completing the `@hbc/acknowledgment` package deliverable.

---

## 3-Line Plan

1. Run the pre-deployment checklist to confirm all prior tasks (T01–T08) meet the Definition of Done.
2. Write `docs/architecture/adr/0013-acknowledgment-platform-primitive.md` documenting all ten decisions.
3. Publish the module adoption guide and insert blueprint/foundation plan progress comments.

---

## Pre-Deployment Checklist

### Code Quality

- [ ] `pnpm --filter @hbc/acknowledgment typecheck` — zero errors
- [ ] `pnpm --filter @hbc/acknowledgment lint` — zero warnings
- [ ] `pnpm --filter @hbc/acknowledgment build` — zero errors; `dist/` populated
- [ ] `pnpm --filter @hbc/acknowledgment test:coverage` — all four thresholds ≥ 95%
- [ ] No `any` types outside explicit `// eslint-disable-next-line` with justification
- [ ] No direct SharePoint list writes from component code (all writes via Azure Function)

### Contract Stability

- [ ] `IAcknowledgmentConfig<T>` matches T02 specification exactly
- [ ] `IAcknowledgmentState` matches T02 specification exactly
- [ ] `ACK_CONTEXT_TYPES` exports 7 entries; values are stable kebab-case strings (D-08)
- [ ] `@hbc/acknowledgment/testing` exports all five utilities (D-10)
- [ ] `DEFAULT_CONFIRMATION_PHRASE = 'I CONFIRM'` — verified in source (D-03)
- [ ] `DECLINE_REASON_MIN_LENGTH = 10` — verified in source (D-04)

### Documentation

- [ ] `docs/architecture/adr/0013-acknowledgment-platform-primitive.md` written and merged
- [ ] `docs/how-to/developer/acknowledgment-adoption-guide.md` written and merged
- [ ] Blueprint progress comment inserted
- [ ] Foundation Plan progress comment inserted

### Integration Verification

- [ ] `POST /api/acknowledgments` returns 403 for sequential out-of-order submission without bypass flag (D-01)
- [ ] `POST /api/acknowledgments` accepts `bypassSequentialOrder: true` with `AcknowledgmentAdmin` role; writes `status: 'bypassed'` (D-01)
- [ ] `POST /api/acknowledgments` returns 403 for `bypassSequentialOrder: true` without `AcknowledgmentAdmin` role (D-01)
- [ ] `POST /api/acknowledgments` returns 409 when prior decline blocks (D-09)
- [ ] Optimistic update visible instantly on submit; rollback on 4xx response (D-02)
- [ ] Network failure routes to `@hbc/session-state` queue; `isPendingSync: true` shown in panel (D-02)
- [ ] Queued acknowledgment replays on reconnect; `isPendingSync` clears after successful replay (D-02)
- [ ] `HbcAcknowledgmentPanel` Essential tier shows CTA only — no party list rendered (D-07)
- [ ] `HbcAcknowledgmentPanel` Expert tier shows full audit trail with timestamps (D-07)
- [ ] `HbcAcknowledgmentBadge` Essential tier shows count (floor = Standard) (D-07)
- [ ] `HbcAcknowledgmentBadge` Expert tier shows tooltip with pending party names (D-07)
- [ ] Azure Function fires BIC transfer on completion (D-06) — smoke tested in DEV
- [ ] Azure Function dispatches Watch-tier notification to record owner on completion (D-06)
- [ ] `HbcAcknowledgmentEvents` SharePoint list deployed with all columns including `IsBypass`, `BypassedBy`, `DeclineCategory` (T06)

### Storybook

- [ ] All 10 `HbcAcknowledgmentPanel` stories render without console errors
- [ ] All 6 `HbcAcknowledgmentBadge` stories render without console errors
- [ ] All 5 `HbcAcknowledgmentModal` stories render without console errors
- [ ] `SequentialModeBypassed` story shows ⚠️ bypass annotation (D-01)
- [ ] `OfflinePendingSync` story shows ⏳ Pending sync indicator (D-02)
- [ ] `ExpertAuditTrail` story shows prompt message, IP placeholder, timestamps (D-07)

### Turborepo Build

- [ ] `pnpm turbo run build` — zero errors across full workspace
- [ ] `pnpm turbo run typecheck` — zero errors
- [ ] `pnpm turbo run test` — all tests pass
- [ ] Testing sub-path resolves: `node -e "import('@hbc/acknowledgment/testing').then(m => console.log(Object.keys(m)))"`

---

## ADR: `docs/architecture/adr/0013-acknowledgment-platform-primitive.md`

```markdown
# ADR-0013 — Acknowledgment as a Platform Primitive

**Status:** Accepted
**Date:** 2026-03-08
**Deciders:** HB Intel Architecture Team
**Supersedes:** None
**Related ADRs:** ADR-0011 (BIC Next Move), ADR-0012 (Complexity Dial)

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
```

---

## Module Adoption Guide

Published at `docs/how-to/developer/acknowledgment-adoption-guide.md`:

```markdown
# How-To: Adopt `@hbc/acknowledgment` in a Module

## Step 1 — Register your context type

Open a PR to add your context type to `packages/acknowledgment/src/config/contextTypes.ts`:

​```typescript
export const ACK_CONTEXT_TYPES = {
  // ... existing entries ...
  MY_MODULE_THING: 'my-module-thing',  // ← add your entry
} as const;
​```

## Step 2 — Define your config

​```typescript
import { IAcknowledgmentConfig, ACK_CONTEXT_TYPES } from '@hbc/acknowledgment';
import { IMyRecord } from '../types';

export const myRecordAckConfig: IAcknowledgmentConfig<IMyRecord> = {
  label: 'My Record Sign-Off',
  mode: 'single',                                   // or 'parallel' / 'sequential'
  contextType: ACK_CONTEXT_TYPES.MY_MODULE_THING,
  resolveParties: (record) => [{
    userId: record.assigneeId,
    displayName: record.assigneeName,
    role: 'Assignee',
    required: true,
  }],
  resolvePromptMessage: (record, party) =>
    `By acknowledging, you confirm receipt of ${record.title}.`,
  requireConfirmationPhrase: false,
  allowDecline: true,
  declineReasons: ['Wrong record', 'Not my responsibility', 'Other'],
};
​```

## Step 3 — Render in detail view

​```typescript
import { HbcAcknowledgmentPanel } from '@hbc/acknowledgment';

<HbcAcknowledgmentPanel
  item={myRecord}
  config={myRecordAckConfig}
  contextId={myRecord.id}
  currentUserId={currentUser.id}
/>
​```

## Step 4 — Render badge in list rows

​```typescript
import { HbcAcknowledgmentBadge } from '@hbc/acknowledgment';

<HbcAcknowledgmentBadge
  item={myRecord}
  config={myRecordAckConfig}
  contextId={myRecord.id}
/>
​```

## Step 5 — Write tests

​```typescript
import { createMockAckConfig, createAckWrapper, mockAckStates } from '@hbc/acknowledgment/testing';
import { renderHook } from '@testing-library/react';
import { useAcknowledgmentGate } from '@hbc/acknowledgment';

const config = createMockAckConfig({ mode: 'single', contextType: ACK_CONTEXT_TYPES.MY_MODULE_THING });
const { result } = renderHook(
  () => useAcknowledgmentGate(config, mockAckStates.pending, myRecord, 'user-1'),
  { wrapper: createAckWrapper(mockAckStates.pending) }
);
expect(result.current.canAcknowledge).toBe(true);
​```
```

---

## Blueprint Progress Comment

Insert at end of `docs/architecture/blueprint/HB-Intel-Blueprint-V4.md`:

```markdown
<!-- IMPLEMENTATION PROGRESS & NOTES
Phase 2 — Shared Package: @hbc/acknowledgment
Completed: 2026-03-08

Task files produced:
  docs/architecture/plans/shared-features/SF04-Acknowledgment.md
  docs/architecture/plans/shared-features/SF04-T01-Package-Scaffold.md
  docs/architecture/plans/shared-features/SF04-T02-TypeScript-Contracts.md
  docs/architecture/plans/shared-features/SF04-T03-Hooks.md
  docs/architecture/plans/shared-features/SF04-T04-Panel.md
  docs/architecture/plans/shared-features/SF04-T05-Badge-and-Modal.md
  docs/architecture/plans/shared-features/SF04-T06-API-and-SharePoint.md
  docs/architecture/plans/shared-features/SF04-T07-Offline-Queue.md
  docs/architecture/plans/shared-features/SF04-T08-Testing-Strategy.md
  docs/architecture/plans/shared-features/SF04-T09-Deployment.md

Documentation added:
  docs/architecture/adr/0013-acknowledgment-platform-primitive.md
  docs/how-to/developer/acknowledgment-adoption-guide.md

All 10 decisions locked (D-01 through D-10).
Estimated effort: 3.5 sprint-weeks.
Next: SF05 or Phase 3 (dev-harness) per Foundation Plan sequencing.
-->
```

---

## Foundation Plan Progress Comment

```markdown
<!-- PROGRESS: SF04 @hbc/acknowledgment — Planning complete 2026-03-08.
  All 9 task files written. ADR-0013 authored.
  Implementation begins Wave 1 (T01+T02+T06): scaffold, contracts, SharePoint list.
-->
```

---

## Verification Commands

```bash
# Code quality
pnpm --filter @hbc/acknowledgment typecheck
pnpm --filter @hbc/acknowledgment lint
pnpm --filter @hbc/acknowledgment build
pnpm --filter @hbc/acknowledgment test:coverage

# Testing sub-path
node -e "import('@hbc/acknowledgment/testing').then(m => console.log(Object.keys(m)))"
# Expected: ['createMockAckConfig', 'createMockAckState', 'mockAckStates',
#            'mockUseAcknowledgment', 'createAckWrapper']

# Full workspace
pnpm turbo run build
pnpm turbo run typecheck
pnpm turbo run test

# Documentation files
ls docs/architecture/adr/0013-acknowledgment-platform-primitive.md
ls docs/how-to/developer/acknowledgment-adoption-guide.md

# SharePoint list deployed
m365 spo list get --title "HbcAcknowledgmentEvents" --webUrl $SP_SITE_URL

# Azure Function deployed
func azure functionapp publish $FUNCTION_APP_NAME
curl -X POST https://$FUNCTION_APP_NAME.azurewebsites.net/api/acknowledgments \
  -H "Authorization: Bearer $AAD_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "contextType": "admin-provisioning", "contextId": "smoke-001",
        "partyUserId": "test@hbc.com", "status": "acknowledged",
        "acknowledgedAt": "2026-03-08T10:00:00Z" }'
# Expected: 200 with updatedState.isComplete

# E2E tests
pnpm playwright test --grep acknowledgment
```

<!-- PROGRESS: SF04-T09 completed 2026-03-09
  Pre-deployment gates: build ✓, check-types ✓, lint ✓, test:coverage ✓ (97 tests, ≥95% all metrics)
  Contract stability: IAcknowledgmentConfig<T> ✓, IAcknowledgmentState ✓, ACK_CONTEXT_TYPES (7) ✓, testing exports (5) ✓, DEFAULT_CONFIRMATION_PHRASE ✓, DECLINE_REASON_MIN_LENGTH ✓
  Deliverables created:
    docs/architecture/adr/ADR-0092-acknowledgment-platform-primitive.md (10 decisions)
    docs/how-to/developer/acknowledgment-adoption-guide.md (5-step guide)
    packages/acknowledgment/README.md (full API reference)
  Progress comments inserted: Blueprint V4, Foundation Plan, SF04-Acknowledgment.md
  ADR numbering: ADR-0092 (corrected from spec's ADR-0013 per CLAUDE.md §6.3.2)
-->
