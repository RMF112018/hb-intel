# PH7-SF-04: `@hbc/acknowledgment` — Structured Sign-Off & Acknowledgment Primitive

**Priority Tier:** 1 — Foundation (must exist before workflow modules implement sign-off steps)
**Package:** `packages/acknowledgment/`
**Interview Decision:** Q3 — Option B confirmed
**Mold Breaker Source:** UX-MB §4 (Universal Next Move); ux-mold-breaker.md Signature Solution #4; con-tech-ux-study §8 (Ball In Court accountability)

---

## Problem Solved

Across every HB Intel module, there are moments where a specific named person must formally acknowledge receipt, review, or approval of a record — and where that acknowledgment must be tracked, timestamped, and auditable. Today's construction platforms handle this inconsistently: some use email chains, some use comment threads, some use status fields — all of which are invisible to anyone who wasn't CC'd, and none of which create a reliable audit trail.

Specific recurring use cases in HB Intel Phase 7:

- **Project Hub**: Turnover Meeting sign-off (multiple signatories in order)
- **Project Hub**: PMP section approval by each responsible party
- **Business Development**: Go/No-Go scorecard approval by Director of Preconstruction or Chief Estimator
- **Admin**: Provisioning task completion acknowledgment
- **Estimating**: Bid document receipt confirmation

Without a shared package, each module builds its own sign-off widget, generating inconsistent behavior, duplicated API patterns, and audit trails that don't aggregate across modules.

---

## Mold Breaker Rationale

The ux-mold-breaker.md Operating Principle §7.2 (Responsibility-first) applies directly: acknowledgment events are the moment responsibility formally transfers. Every acknowledgment must create a durable, visible, timestamped record of who did what and when. The BIC primitive (`@hbc/bic-next-move`) drives the user to the acknowledgment action; `@hbc/acknowledgment` executes and records it.

The competitive gap: no construction platform provides a cross-module acknowledgment trail. Procore's sign-off exists only on specific item types; it is not generalizable. HB Intel's `@hbc/acknowledgment` makes structured sign-off a platform primitive applicable to any record.

---

## Applicable Modules

| Module | Use Case | Acknowledgment Type |
|---|---|---|
| Project Hub | Turnover Meeting sign-off | Sequential multi-party |
| Project Hub | PMP section approval | Parallel multi-party |
| Project Hub | Monthly Review step completion | Single-party |
| Business Development | Go/No-Go scorecard submission approval | Single-party (Director or CE) |
| Estimating | Bid document receipt | Single-party |
| Admin | Provisioning task sign-off | Single-party |
| `@hbc/workflow-handoff` | Handoff receipt acknowledgment | Single-party |

---

## Interface Contract

```typescript
// packages/acknowledgment/src/types/IAcknowledgment.ts

export type AcknowledgmentMode = 'single' | 'parallel' | 'sequential';
export type AcknowledgmentStatus = 'pending' | 'acknowledged' | 'declined' | 'bypassed';

export interface IAcknowledgmentParty {
  userId: string;
  displayName: string;
  role: string;
  /** Order matters only for sequential mode */
  order?: number;
  /** Whether this party's acknowledgment is required (vs. optional/informational) */
  required: boolean;
}

export interface IAcknowledgmentConfig<T> {
  /** Contextual label shown in the UI (e.g., "Turnover Meeting Sign-Off") */
  label: string;
  /** Mode determines rendering and completion logic */
  mode: AcknowledgmentMode;
  /** Resolves the list of parties who must acknowledge */
  resolveParties: (item: T) => IAcknowledgmentParty[];
  /** Message shown to each acknowledging party */
  resolvePromptMessage: (item: T, party: IAcknowledgmentParty) => string;
  /** Whether the user must type a confirmation phrase (e.g., "I CONFIRM") */
  requireConfirmationPhrase?: boolean;
  /** Whether declining is allowed (shows a decline path with required reason) */
  allowDecline?: boolean;
  /** Called when all required parties have acknowledged */
  onAllAcknowledged?: (item: T, trail: IAcknowledgmentEvent[]) => void;
}

export interface IAcknowledgmentEvent {
  partyUserId: string;
  partyDisplayName: string;
  status: AcknowledgmentStatus;
  acknowledgedAt: string | null; // ISO 8601
  declineReason?: string;
  ipAddress?: string; // for audit-grade trails
}

export interface IAcknowledgmentState {
  config: IAcknowledgmentConfig<unknown>;
  events: IAcknowledgmentEvent[];
  /** True when all required parties have acknowledged */
  isComplete: boolean;
  /** In sequential mode: the party whose turn it currently is */
  currentSequentialParty: IAcknowledgmentParty | null;
  /** Aggregate status for display */
  overallStatus: AcknowledgmentStatus | 'partial';
}
```

---

## Package Architecture

```
packages/acknowledgment/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts
│   ├── types/
│   │   ├── IAcknowledgment.ts
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useAcknowledgment.ts          # loads state, submits acknowledgment
│   │   └── useAcknowledgmentGate.ts      # returns whether current user can acknowledge
│   └── components/
│       ├── HbcAcknowledgmentPanel.tsx    # Full sign-off UI for record detail pages
│       ├── HbcAcknowledgmentBadge.tsx    # Compact status indicator for list rows
│       ├── HbcAcknowledgmentModal.tsx    # Confirmation modal with phrase input
│       └── index.ts
```

---

## Component Specifications

### `HbcAcknowledgmentPanel` — Detail Page Sign-Off UI

Renders the complete acknowledgment section on a record detail page.

```typescript
interface HbcAcknowledgmentPanelProps<T> {
  item: T;
  config: IAcknowledgmentConfig<T>;
  /** Whether the current user can interact (vs. read-only viewer) */
  canAcknowledge?: boolean;
}
```

**Visual behavior:**

- **Single mode**: One action card — "Your acknowledgment is required." CTA button: "Acknowledge" (or "Decline" if `allowDecline`). Timestamp shown after acknowledgment.
- **Parallel mode**: Party checklist. Each row shows: avatar, name, role, status badge (Pending / ✓ Acknowledged / ✗ Declined), timestamp. Current user's row is actionable.
- **Sequential mode**: Visual stepper showing current party highlighted. Locked rows above (completed); locked rows below (waiting). Current user's step is actionable when it's their turn.

**Acknowledgment flow:**
1. User clicks "Acknowledge"
2. `HbcAcknowledgmentModal` opens with prompt message
3. If `requireConfirmationPhrase`: text input, submit disabled until phrase matches
4. On submit: `POST /api/acknowledgments` → optimistic update → BIC state updates via `@hbc/bic-next-move`
5. If final party: `onAllAcknowledged` callback fires; notification sent to record owner

### `HbcAcknowledgmentBadge` — List Row Status

```typescript
interface HbcAcknowledgmentBadgeProps<T> {
  item: T;
  config: IAcknowledgmentConfig<T>;
}
```

**Visual behavior:**
- Shows aggregate status: ✓ Complete / ⏳ N of M acknowledged / ✗ Declined
- Hovering shows tooltip: names of pending parties

### `HbcAcknowledgmentModal` — Confirmation Dialog

```typescript
interface HbcAcknowledgmentModalProps {
  promptMessage: string;
  requireConfirmationPhrase?: boolean;
  confirmationPhrase?: string; // defaults to "I CONFIRM"
  allowDecline?: boolean;
  onConfirm: () => void;
  onDecline?: (reason: string) => void;
  onCancel: () => void;
  isOpen: boolean;
}
```

---

## Data Model — SharePoint List: `HbcAcknowledgmentEvents`

| Column | Type | Description |
|---|---|---|
| `EventId` | Single line | GUID — primary key |
| `ContextType` | Choice | Module identifier (e.g., `project-hub-pmp`, `bd-scorecard`) |
| `ContextId` | Single line | Record ID (e.g., PMP ID, scorecard ID) |
| `PartyUserId` | Single line | UPN of acknowledging user |
| `PartyDisplayName` | Single line | Display name at time of acknowledgment |
| `Status` | Choice | `acknowledged` / `declined` / `bypassed` |
| `AcknowledgedAt` | Date/Time | UTC timestamp |
| `DeclineReason` | Multiple lines | Reason if declined |
| `PromptMessage` | Multiple lines | Message shown at time of acknowledgment (preserved for audit) |

---

## Module Adoption Guide

**Step 1: Define the acknowledgment config for your record type**
```typescript
import { IAcknowledgmentConfig } from '@hbc/acknowledgment';
import { ITurnoverMeeting } from '../types';

export const turnoverMeetingAckConfig: IAcknowledgmentConfig<ITurnoverMeeting> = {
  label: 'Turnover Meeting Sign-Off',
  mode: 'sequential',
  resolveParties: (meeting) => [
    { userId: meeting.pmId, displayName: meeting.pmName, role: 'Project Manager', order: 1, required: true },
    { userId: meeting.superintendentId, displayName: meeting.superintendentName, role: 'Superintendent', order: 2, required: true },
    { userId: meeting.chiefEstimatorId, displayName: meeting.chiefEstimatorName, role: 'Chief Estimator', order: 3, required: true },
  ],
  resolvePromptMessage: (meeting, party) =>
    `By acknowledging, you confirm you have reviewed the Turnover Meeting package for ${meeting.projectName} and accept the information as accurate.`,
  requireConfirmationPhrase: true,
  allowDecline: true,
  onAllAcknowledged: (meeting, trail) => triggerNextWorkflowStep(meeting.id, trail),
};
```

**Step 2: Render in detail view**
```typescript
import { HbcAcknowledgmentPanel } from '@hbc/acknowledgment';

<HbcAcknowledgmentPanel
  item={turnoverMeeting}
  config={turnoverMeetingAckConfig}
  canAcknowledge={currentUser.id === currentSequentialParty?.userId}
/>
```

**Step 3: Render badge in list rows**
```typescript
import { HbcAcknowledgmentBadge } from '@hbc/acknowledgment';

<HbcAcknowledgmentBadge item={turnoverMeeting} config={turnoverMeetingAckConfig} />
```

---

## Integration Points

| Package | Integration |
|---|---|
| `@hbc/bic-next-move` | Acknowledgment due = BIC state; completing acknowledgment triggers BIC transfer to next owner |
| `@hbc/notification-intelligence` | Acknowledgment request → Immediate-tier notification to pending parties; completion → Watch-tier to record owner |
| `@hbc/workflow-handoff` | Handoff receipt triggers an acknowledgment event; acknowledgment completion unblocks the handoff |
| `@hbc/complexity` | Essential: single-party CTA only; Standard: full party list; Expert: full audit trail with timestamps |
| PH9b My Work Feed (§A) | Pending acknowledgment items appear in My Work Feed under "Action Required" |

---

## SPFx Constraints

- `HbcAcknowledgmentPanel` imports from `@hbc/ui-kit` in PWA; `@hbc/ui-kit/app-shell` in SPFx breakout contexts
- `POST /api/acknowledgments` routes through Azure Functions backend — no direct SharePoint list writes from webparts
- Acknowledgment events are cached in `@hbc/session-state` for offline resilience; sync on reconnect

---

## Priority & ROI

**Priority:** P0 — Required by Project Hub Turnover Meeting, PMP, and BD scorecard approval workflows before any of those screens can be considered production-ready
**Estimated build effort:** 3–4 sprint-weeks (three components, three modes, API, SharePoint list, notification integration)
**ROI:** Eliminates email-based sign-off chains; creates cross-module audit trail; makes BIC accountability visible at every sign-off step; zero implementation cost for future modules that adopt the config contract

---

## Definition of Done

- [ ] `IAcknowledgmentConfig<T>` contract defined and exported
- [ ] `useAcknowledgment` loads and mutates acknowledgment state
- [ ] `useAcknowledgmentGate` returns current user's eligibility
- [ ] `HbcAcknowledgmentPanel` renders correctly in single, parallel, and sequential modes
- [ ] `HbcAcknowledgmentBadge` renders aggregate status in list rows
- [ ] `HbcAcknowledgmentModal` handles confirmation phrase, decline reason, optimistic update
- [ ] `HbcAcknowledgmentEvents` SharePoint list deployed via setup script
- [ ] `POST /api/acknowledgments` Azure Function implemented with audit-grade logging
- [ ] BIC state update triggered on acknowledgment completion
- [ ] Notification registration: acknowledgment request → Immediate; completion → Watch
- [ ] `@hbc/complexity` integration verified
- [ ] Offline queue via `@hbc/session-state` — acknowledgment attempts retry on reconnect
- [ ] Unit tests ≥95% on mode logic, gate logic, and completion detection
- [ ] Storybook: all three modes, declined state, bypass state

---

## ADR Reference

Create `docs/architecture/adr/0013-acknowledgment-platform-primitive.md` documenting the decision to build a shared acknowledgment package rather than per-module sign-off implementations, the three-mode model rationale, and the audit-trail persistence strategy.
