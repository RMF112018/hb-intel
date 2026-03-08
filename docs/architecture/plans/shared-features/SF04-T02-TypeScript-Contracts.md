# SF04-T02 — TypeScript Contracts: `@hbc/acknowledgment`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Decisions Applied:** D-01 (bypass flag), D-03 (confirmation phrase), D-04 (decline reasons), D-08 (context types), D-09 (decline logic)
**Estimated Effort:** 0.25 sprint-weeks
**Wave:** 1

---

## Objective

Define every TypeScript interface, type, constant, and utility that the rest of the package depends on. All contracts must be stable before hooks and components begin implementation.

---

## 3-Line Plan

1. Write `src/types/IAcknowledgment.ts` — all interfaces, types, and enumerations.
2. Write `src/config/contextTypes.ts` — `ACK_CONTEXT_TYPES` registry and derived `AckContextType`.
3. Export everything through barrels; verify `typecheck` passes with zero errors.

---

## `src/types/IAcknowledgment.ts`

```typescript
// ─── Primitive Types ────────────────────────────────────────────────────────

export type AcknowledgmentMode = 'single' | 'parallel' | 'sequential';

export type AcknowledgmentStatus =
  | 'pending'
  | 'acknowledged'
  | 'declined'
  | 'bypassed';

// ─── Party ──────────────────────────────────────────────────────────────────

export interface IAcknowledgmentParty {
  userId: string;
  displayName: string;
  role: string;
  /** Order matters only for sequential mode. 1-indexed. */
  order?: number;
  /** Whether this party's acknowledgment is required for isComplete to be true. */
  required: boolean;
}

// ─── Config ─────────────────────────────────────────────────────────────────

export interface IAcknowledgmentConfig<T> {
  /** Contextual label shown in the UI (e.g., "Turnover Meeting Sign-Off"). */
  label: string;

  /** Mode determines rendering and completion logic. */
  mode: AcknowledgmentMode;

  /**
   * Typed context identifier. Use ACK_CONTEXT_TYPES values to ensure
   * consistent audit trail keys. (D-08)
   */
  contextType: AckContextType;

  /** Resolves the list of parties who must acknowledge. */
  resolveParties: (item: T) => IAcknowledgmentParty[];

  /** Message shown to each acknowledging party at the moment of sign-off.
   *  Preserved verbatim in the audit trail. */
  resolvePromptMessage: (item: T, party: IAcknowledgmentParty) => string;

  /**
   * Whether the user must type a confirmation phrase before submitting.
   * Defaults to false. (D-03)
   */
  requireConfirmationPhrase?: boolean;

  /**
   * The phrase the user must type. Defaults to "I CONFIRM". (D-03)
   * Add a JSDoc note on the config to encourage consistent phrasing.
   */
  confirmationPhrase?: string;

  /**
   * Whether declining is allowed. Shows a decline path with a required reason.
   * Defaults to false.
   */
  allowDecline?: boolean;

  /**
   * Optional list of predefined decline reason categories. (D-04)
   * If absent: free-text textarea (min 10 chars).
   * If provided: radio button list + optional elaboration field.
   */
  declineReasons?: string[];

  /**
   * Called when all required parties have acknowledged.
   * Fires client-side for UI effects only (D-06).
   * Server-side completion triggers (BIC, notifications) are handled
   * by the Azure Function.
   */
  onAllAcknowledged?: (item: T, trail: IAcknowledgmentEvent[]) => void;
}

// ─── Event ──────────────────────────────────────────────────────────────────

export interface IAcknowledgmentEvent {
  partyUserId: string;
  partyDisplayName: string;
  status: AcknowledgmentStatus;
  /** ISO 8601. Client timestamp for offline-queued events (D-02). */
  acknowledgedAt: string | null;
  declineReason?: string;
  /** Selected category from declineReasons[] if configured (D-04). */
  declineCategory?: string;
  /** IP address for audit-grade trails. Present when server captures it. */
  ipAddress?: string;
  /** True when bypassSequentialOrder was used (D-01). */
  isBypass?: boolean;
  /** UPN of the AcknowledgmentAdmin who authorised the bypass (D-01). */
  bypassedBy?: string;
  /** True when this event is pending offline sync (D-02). */
  isPendingSync?: boolean;
}

// ─── State ──────────────────────────────────────────────────────────────────

export interface IAcknowledgmentState {
  config: IAcknowledgmentConfig<unknown>;
  events: IAcknowledgmentEvent[];
  /** True when all required parties have acknowledged. */
  isComplete: boolean;
  /** In sequential mode: the party whose turn it currently is. Null when complete. */
  currentSequentialParty: IAcknowledgmentParty | null;
  /** Aggregate status for display. */
  overallStatus: AcknowledgmentStatus | 'partial';
}

// ─── API Request / Response ──────────────────────────────────────────────────

export interface ISubmitAcknowledgmentRequest {
  contextType: AckContextType;
  contextId: string;
  partyUserId: string;
  status: Extract<AcknowledgmentStatus, 'acknowledged' | 'declined'>;
  declineReason?: string;
  declineCategory?: string;
  /** Client-side ISO timestamp (D-02). */
  acknowledgedAt: string;
  /**
   * Requires AcknowledgmentAdmin role on the Azure Function (D-01).
   * Bypasses sequential order enforcement for the submitting party.
   */
  bypassSequentialOrder?: boolean;
}

export interface ISubmitAcknowledgmentResponse {
  event: IAcknowledgmentEvent;
  updatedState: IAcknowledgmentState;
  /** True when this submission completed all required parties. */
  isComplete: boolean;
}

// ─── Hook Return Types ───────────────────────────────────────────────────────

export interface IUseAcknowledgmentReturn {
  state: IAcknowledgmentState | undefined;
  isLoading: boolean;
  isError: boolean;
  /** Submit an acknowledgment or decline for the current user. */
  submit: (params: ISubmitAcknowledgmentParams) => Promise<void>;
  isSubmitting: boolean;
}

export interface ISubmitAcknowledgmentParams {
  status: Extract<AcknowledgmentStatus, 'acknowledged' | 'declined'>;
  declineReason?: string;
  declineCategory?: string;
  bypassSequentialOrder?: boolean;
}

export interface IUseAcknowledgmentGateReturn {
  /** True when the current user is an eligible, pending acknowledging party. */
  canAcknowledge: boolean;
  /**
   * In sequential mode: true only when it is this user's turn.
   * In parallel mode: true when this user is a required party and has not yet acknowledged.
   * In single mode: true when this user is the single required party.
   */
  isCurrentTurn: boolean;
  /** The current user's party record, if they are a listed party. */
  party: IAcknowledgmentParty | null;
}

// ─── Re-export contextType for convenience ───────────────────────────────────

export type { AckContextType } from '../config/contextTypes';
```

---

## `src/config/contextTypes.ts` (D-08)

```typescript
/**
 * ACK_CONTEXT_TYPES — Authoritative registry of acknowledgment context identifiers.
 *
 * IMPORTANT: All values in this registry must be unique kebab-case strings.
 * These values are stored verbatim in the HbcAcknowledgmentEvents SharePoint list
 * and in audit logs. Changing a value after production data exists will split
 * the audit trail for that context type.
 *
 * To add a new context type:
 * 1. Add a new key/value pair to this object.
 * 2. Open a PR to @hbc/acknowledgment with a brief description of the use case.
 * 3. Import ACK_CONTEXT_TYPES in your module config — never use raw strings.
 */
export const ACK_CONTEXT_TYPES = {
  /** Project Hub — PMP section approval (parallel multi-party) */
  PROJECT_HUB_PMP: 'project-hub-pmp',
  /** Project Hub — Turnover Meeting sign-off (sequential multi-party) */
  PROJECT_HUB_TURNOVER: 'project-hub-turnover',
  /** Project Hub — Monthly Review step completion (single-party) */
  PROJECT_HUB_MONTHLY_REVIEW: 'project-hub-monthly-review',
  /** Business Development — Go/No-Go scorecard approval (single-party) */
  BD_SCORECARD: 'bd-scorecard',
  /** Estimating — Bid document receipt confirmation (single-party) */
  ESTIMATING_BID_RECEIPT: 'estimating-bid-receipt',
  /** Admin — Provisioning task sign-off (single-party) */
  ADMIN_PROVISIONING: 'admin-provisioning',
  /** @hbc/workflow-handoff — Handoff receipt acknowledgment (single-party) */
  WORKFLOW_HANDOFF: 'workflow-handoff',
} as const;

/** Union type of all registered context type values. */
export type AckContextType = (typeof ACK_CONTEXT_TYPES)[keyof typeof ACK_CONTEXT_TYPES];
```

---

## Pure Utility Functions

### `src/utils/acknowledmentLogic.ts`

```typescript
import type {
  IAcknowledgmentParty,
  IAcknowledgmentEvent,
  IAcknowledgmentState,
  AcknowledgmentStatus,
} from '../types/IAcknowledgment';

/**
 * Determines the current sequential party given the party list and event history.
 * Returns null when all required parties have acknowledged (or sequencing is complete).
 */
export function resolveCurrentSequentialParty(
  parties: IAcknowledgmentParty[],
  events: IAcknowledgmentEvent[]
): IAcknowledgmentParty | null {
  const ordered = [...parties]
    .filter((p) => p.required)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  for (const party of ordered) {
    const event = events.find((e) => e.partyUserId === party.userId);
    if (!event || event.status === 'pending') return party;
    if (event.status === 'declined') return null; // blocked (D-09)
  }
  return null; // all acknowledged
}

/**
 * Computes isComplete for a given mode and event set.
 * parallel/single: all required parties acknowledged.
 * sequential: all required parties acknowledged in order (no declines).
 * Any required decline → false (D-09).
 */
export function computeIsComplete(
  parties: IAcknowledgmentParty[],
  events: IAcknowledgmentEvent[]
): boolean {
  const required = parties.filter((p) => p.required);
  return required.every((party) => {
    const event = events.find((e) => e.partyUserId === party.userId);
    return event?.status === 'acknowledged' || event?.status === 'bypassed';
  });
}

/**
 * Computes the aggregate overallStatus.
 *
 * Priority order:
 * 1. 'declined'  — any required party has declined (D-09)
 * 2. 'acknowledged' — all required parties acknowledged/bypassed
 * 3. 'partial'   — some (but not all) required parties acknowledged
 * 4. 'pending'   — no acknowledgments yet
 */
export function computeOverallStatus(
  parties: IAcknowledgmentParty[],
  events: IAcknowledgmentEvent[]
): IAcknowledgmentState['overallStatus'] {
  const required = parties.filter((p) => p.required);

  const hasDecline = required.some((party) => {
    const event = events.find((e) => e.partyUserId === party.userId);
    return event?.status === 'declined';
  });
  if (hasDecline) return 'declined';

  const acknowledgedCount = required.filter((party) => {
    const event = events.find((e) => e.partyUserId === party.userId);
    return event?.status === 'acknowledged' || event?.status === 'bypassed';
  }).length;

  if (acknowledgedCount === required.length) return 'acknowledged';
  if (acknowledgedCount > 0) return 'partial';
  return 'pending';
}

/**
 * Derives a complete IAcknowledgmentState from raw API data.
 * Used in useAcknowledgment to transform API responses into typed state.
 */
export function deriveAcknowledgmentState(
  config: IAcknowledgmentState['config'],
  parties: IAcknowledgmentParty[],
  events: IAcknowledgmentEvent[]
): IAcknowledgmentState {
  const isComplete = computeIsComplete(parties, events);
  const overallStatus = computeOverallStatus(parties, events);
  const currentSequentialParty =
    config.mode === 'sequential'
      ? resolveCurrentSequentialParty(parties, events)
      : null;

  return {
    config,
    events,
    isComplete,
    currentSequentialParty,
    overallStatus,
  };
}

/**
 * Detects whether a submission failure is a network failure
 * (vs. a logical/server rejection). Network failures are queued
 * offline; logical failures are shown as error toasts. (D-02)
 */
export function isNetworkFailure(error: unknown): boolean {
  if (error instanceof TypeError && error.message.includes('fetch')) return true;
  if (error instanceof Response) {
    return [0, 408, 503, 504].includes(error.status);
  }
  return false;
}

/** Default confirmation phrase (D-03). */
export const DEFAULT_CONFIRMATION_PHRASE = 'I CONFIRM';

/** Minimum characters for free-text decline reason (D-04). */
export const DECLINE_REASON_MIN_LENGTH = 10;
```

---

## Verification Commands

```bash
# Typecheck — zero errors
pnpm --filter @hbc/acknowledgment typecheck

# Confirm ACK_CONTEXT_TYPES exports correctly
node -e "
  import('@hbc/acknowledgment').then(m => {
    console.log(Object.keys(m.ACK_CONTEXT_TYPES));
  });
"
# Expected: ['PROJECT_HUB_PMP', 'PROJECT_HUB_TURNOVER', 'PROJECT_HUB_MONTHLY_REVIEW',
#            'BD_SCORECARD', 'ESTIMATING_BID_RECEIPT', 'ADMIN_PROVISIONING', 'WORKFLOW_HANDOFF']
```
