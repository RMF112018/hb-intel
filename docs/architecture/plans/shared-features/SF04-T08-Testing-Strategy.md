# SF04-T08 — Testing Strategy: `@hbc/acknowledgment`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Decisions Applied:** D-01 through D-10 (all)
**Estimated Effort:** 0.25 sprint-weeks
**Wave:** 4

---

## Objective

Define the complete testing strategy for `@hbc/acknowledgment`: the `testing/` sub-path implementation (D-10), unit test matrix, Storybook story requirements, and Playwright E2E scenarios.

---

## 3-Line Plan

1. Implement all five `testing/` sub-path exports (D-10): factories, canonical states, hook stub, wrapper factory.
2. Write unit tests covering mode logic, gate logic, completion detection, decline blocking, and modal validation.
3. Define Storybook stories for all visual states and Playwright E2E scenarios for all locked decisions.

---

## Testing Sub-Path Exports (D-10)

### `testing/mockAckStates.ts` — 6 Canonical States

```typescript
import type { IAcknowledgmentState } from '../src/types';

const PARTY_1: IAcknowledgmentParty = {
  userId: 'user-1', displayName: 'Jane Smith',
  role: 'Project Manager', order: 1, required: true,
};
const PARTY_2: IAcknowledgmentParty = {
  userId: 'user-2', displayName: 'Tom Reyes',
  role: 'Superintendent', order: 2, required: true,
};
const BASE_CONFIG = {
  label: 'Test Sign-Off',
  mode: 'sequential' as const,
  contextType: 'project-hub-turnover' as const,
  resolveParties: () => [PARTY_1, PARTY_2],
  resolvePromptMessage: () => 'Please confirm.',
};

export const mockAckStates = {
  /** No events — Party 1 is current sequential party. */
  pending: {
    config: BASE_CONFIG,
    events: [],
    isComplete: false,
    currentSequentialParty: PARTY_1,
    overallStatus: 'pending',
  } satisfies IAcknowledgmentState,

  /** Party 1 acknowledged; Party 2 pending (parallel context). */
  partialParallel: {
    config: { ...BASE_CONFIG, mode: 'parallel' },
    events: [
      {
        partyUserId: 'user-1', partyDisplayName: 'Jane Smith',
        status: 'acknowledged', acknowledgedAt: '2026-03-08T09:00:00Z',
      },
    ],
    isComplete: false,
    currentSequentialParty: null,
    overallStatus: 'partial',
  } satisfies IAcknowledgmentState,

  /** All required parties acknowledged. */
  complete: {
    config: BASE_CONFIG,
    events: [
      { partyUserId: 'user-1', partyDisplayName: 'Jane Smith',
        status: 'acknowledged', acknowledgedAt: '2026-03-08T09:00:00Z' },
      { partyUserId: 'user-2', partyDisplayName: 'Tom Reyes',
        status: 'acknowledged', acknowledgedAt: '2026-03-08T09:15:00Z' },
    ],
    isComplete: true,
    currentSequentialParty: null,
    overallStatus: 'acknowledged',
  } satisfies IAcknowledgmentState,

  /** Party 1 declined — workflow blocked (D-09). */
  declined: {
    config: BASE_CONFIG,
    events: [
      { partyUserId: 'user-1', partyDisplayName: 'Jane Smith',
        status: 'declined', acknowledgedAt: '2026-03-08T09:05:00Z',
        declineReason: 'Information is incomplete.' },
    ],
    isComplete: false,
    currentSequentialParty: null,
    overallStatus: 'declined',
  } satisfies IAcknowledgmentState,

  /** Party 1 bypassed by admin (D-01); Party 2 acknowledged; complete. */
  bypassed: {
    config: BASE_CONFIG,
    events: [
      { partyUserId: 'user-1', partyDisplayName: 'Jane Smith',
        status: 'bypassed', acknowledgedAt: '2026-03-08T08:45:00Z',
        isBypass: true, bypassedBy: 'admin@hbc.com' },
      { partyUserId: 'user-2', partyDisplayName: 'Tom Reyes',
        status: 'acknowledged', acknowledgedAt: '2026-03-08T09:10:00Z' },
    ],
    isComplete: true,
    currentSequentialParty: null,
    overallStatus: 'acknowledged',
  } satisfies IAcknowledgmentState,

  /** Party 1's acknowledgment queued offline (D-02). */
  offlinePending: {
    config: BASE_CONFIG,
    events: [
      { partyUserId: 'user-1', partyDisplayName: 'Jane Smith',
        status: 'acknowledged', acknowledgedAt: '2026-03-08T09:00:00Z',
        isPendingSync: true },
    ],
    isComplete: false,
    currentSequentialParty: PARTY_2,
    overallStatus: 'partial',
  } satisfies IAcknowledgmentState,
} as const;
```

---

### `testing/createMockAckConfig.ts`

```typescript
import type { IAcknowledgmentConfig } from '../src/types';

export function createMockAckConfig<T = unknown>(
  overrides?: Partial<IAcknowledgmentConfig<T>>
): IAcknowledgmentConfig<T> {
  return {
    label: 'Mock Sign-Off',
    mode: 'single',
    contextType: 'admin-provisioning',
    resolveParties: () => [
      { userId: 'user-1', displayName: 'Jane Smith', role: 'PM', order: 1, required: true },
      { userId: 'user-2', displayName: 'Tom Reyes', role: 'Super', order: 2, required: true },
    ],
    resolvePromptMessage: (_item, party) =>
      `${party.displayName}, please confirm you have reviewed this document.`,
    requireConfirmationPhrase: false,
    confirmationPhrase: 'I CONFIRM',
    allowDecline: false,
    ...overrides,
  };
}
```

---

### `testing/createMockAckState.ts`

```typescript
import { mockAckStates } from './mockAckStates';
import type { IAcknowledgmentState } from '../src/types';

export function createMockAckState(
  overrides?: Partial<IAcknowledgmentState>
): IAcknowledgmentState {
  return { ...mockAckStates.pending, ...overrides };
}
```

---

### `testing/mockUseAcknowledgment.ts`

```typescript
import { vi } from 'vitest';
import type { IUseAcknowledgmentReturn, IAcknowledgmentState } from '../src/types';

export function mockUseAcknowledgment(
  state: IAcknowledgmentState = mockAckStates.pending
): IUseAcknowledgmentReturn {
  return {
    state,
    isLoading: false,
    isError: false,
    submit: vi.fn().mockResolvedValue(undefined),
    isSubmitting: false,
  };
}
```

---

### `testing/createAckWrapper.tsx`

```typescript
import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { IAcknowledgmentState } from '../src/types';

export function createAckWrapper(state: IAcknowledgmentState) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return function AckWrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}
```

---

## Unit Test Matrix

### `acknowledgmentLogic.ts`

| Test | Covers |
|---|---|
| `computeIsComplete` — all acknowledged → true | D-09 |
| `computeIsComplete` — one declined → false | D-09 |
| `computeIsComplete` — bypassed counts as complete | D-01 |
| `computeIsComplete` — optional party pending → still complete | T02 spec |
| `computeOverallStatus` — any decline → `'declined'` | D-09 |
| `computeOverallStatus` — all acknowledged → `'acknowledged'` | core |
| `computeOverallStatus` — partial → `'partial'` | core |
| `computeOverallStatus` — bypass present → `'acknowledged'` | D-01 |
| `resolveCurrentSequentialParty` — no events → Party 1 | core |
| `resolveCurrentSequentialParty` — Party 1 ack'd → Party 2 | core |
| `resolveCurrentSequentialParty` — all ack'd → null | core |
| `resolveCurrentSequentialParty` — decline → null (blocked) | D-09 |
| `isNetworkFailure` — TypeError: Failed to fetch → true | D-02 |
| `isNetworkFailure` — 403 response → false | D-02 |
| `isNetworkFailure` — 503 response → true | D-02 |

### `useAcknowledgmentGate`

| Test | Covers |
|---|---|
| Sequential: current party → canAcknowledge = true | D-01 |
| Sequential: non-current party → canAcknowledge = false | D-01 |
| Sequential: declined state → canAcknowledge = false | D-09 |
| Parallel: required pending party → canAcknowledge = true | core |
| Parallel: declined state → canAcknowledge = false | D-09 |
| Parallel: optional party → canAcknowledge = false | core |
| Single: listed party → canAcknowledge = true | core |
| Any mode: already acknowledged → canAcknowledge = false | core |
| Any mode: non-party user → canAcknowledge = false, party = null | core |
| Any mode: isComplete → canAcknowledge = false | core |

### `HbcAcknowledgmentModal`

| Test | Covers |
|---|---|
| Confirm button enabled when no phrase required | D-03 |
| Confirm button disabled until correct phrase typed | D-03 |
| Custom phrase accepted (not just "I CONFIRM") | D-03 |
| Mismatch hint shown on wrong phrase | D-03 |
| Free-text decline: submit disabled below 10 chars | D-04 |
| Free-text decline: submit enabled at 10+ chars | D-04 |
| Category decline: submit disabled with no selection | D-04 |
| Category decline: "Other" shows free-text field | D-04 |
| Cancel fires onCancel | core |
| Escape key fires onCancel | core |

### `HbcAcknowledgmentBadge`

| Test | Covers |
|---|---|
| Essential tier renders same as Standard (floor) | D-07 |
| Standard: shows "N of M acknowledged" count | D-07 |
| Expert: renders tooltip with pending party names | D-07 |
| No tooltip when all parties acknowledged | D-07 |
| overallStatus `'declined'` → danger styling | D-09 |
| bypass event present → shows bypass label | D-01 |

---

## Storybook Stories

### `HbcAcknowledgmentPanel.stories.tsx`

| Story Name | State | Tier | Notes |
|---|---|---|---|
| `SingleModePending` | `pending` (single) | Standard | CTA visible, canAcknowledge=true |
| `SingleModeComplete` | `complete` | Standard | ✓ Complete banner |
| `ParallelModePartial` | `partialParallel` | Standard | One row checked, one pending |
| `ParallelModeDeclined` | `declined` | Standard | Decline-blocked banner (D-09) |
| `SequentialModeStep1` | `pending` | Standard | Stepper: Party 1 active, Party 2 locked |
| `SequentialModeStep2` | `partialParallel` (sequential) | Standard | Stepper: Party 1 ✓, Party 2 active |
| `SequentialModeBypassed` | `bypassed` | Expert | ⚠️ Bypass annotation visible (D-01) |
| `ExpertAuditTrail` | `complete` | Expert | Full timestamps + prompt message |
| `OfflinePendingSync` | `offlinePending` | Standard | ⏳ Pending sync indicator (D-02) |
| `EssentialCTAOnly` | `pending` | Essential | Only CTA rendered (D-07) |

### `HbcAcknowledgmentBadge.stories.tsx`

| Story Name | State | Tier |
|---|---|---|
| `Pending` | `pending` | Standard |
| `Partial` | `partialParallel` | Standard |
| `Complete` | `complete` | Standard |
| `Declined` | `declined` | Standard |
| `Bypassed` | `bypassed` | Expert |
| `ExpertWithTooltip` | `partialParallel` | Expert |

### `HbcAcknowledgmentModal.stories.tsx`

| Story Name | Config |
|---|---|
| `AcknowledgeSimple` | requireConfirmationPhrase=false |
| `AcknowledgeWithPhrase` | requireConfirmationPhrase=true, phrase="I CONFIRM" |
| `AcknowledgeCustomPhrase` | requireConfirmationPhrase=true, phrase="APPROVED" |
| `DeclineFreeText` | declineReasons=undefined |
| `DeclineWithCategories` | declineReasons=["Incomplete","Incorrect","Other"] |

---

## Playwright E2E Scenarios

| # | Scenario | Decision Verified |
|---|---|---|
| E2E-01 | Single-mode: click Acknowledge → modal opens → type phrase → confirm → panel shows ✓ Complete | D-03 |
| E2E-02 | Single-mode: click Decline → select category "Other" → type reason → confirm → panel shows ✗ Declined banner | D-04, D-09 |
| E2E-03 | Parallel-mode: Party 1 declines → Party 2's row becomes inactive → "workflow blocked" banner shown | D-09 |
| E2E-04 | Sequential-mode: Party 2 cannot act until Party 1 has acknowledged → submit button absent for Party 2 | D-01 |
| E2E-05 | Sequential-mode: Party 1 acknowledges → Party 2 sees their row become active (60s poll or manual refresh) | D-05 |
| E2E-06 | Offline: go offline → acknowledge → panel shows ⏳ Pending sync → go online → panel updates to ✓ timestamp | D-02 |
| E2E-07 | Expert tier: full audit trail visible with timestamps and prompt message | D-07 |
| E2E-08 | Essential tier: only CTA rendered; no party list visible | D-07 |

---

## Verification Commands

```bash
# Testing sub-path exports
node -e "import('@hbc/acknowledgment/testing').then(m => console.log(Object.keys(m)))"
# Expected: ['createMockAckConfig', 'createMockAckState', 'mockAckStates',
#            'mockUseAcknowledgment', 'createAckWrapper']

# Unit tests with coverage
pnpm --filter @hbc/acknowledgment test:coverage

# Storybook build (verify no story errors)
pnpm --filter @hbc/acknowledgment storybook:build

# E2E (from workspace root)
pnpm playwright test --grep acknowledgment
```
