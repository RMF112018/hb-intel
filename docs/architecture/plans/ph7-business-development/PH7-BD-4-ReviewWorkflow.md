# PH7-BD-4 — Business Development: Director Review Workflow

**Version:** 1.0
**Governed by:** CLAUDE.md v1.2 · HB-Intel-Blueprint-V4.md · `hb-intel-foundation-plan.md`
**Date:** 2026-03-07
**Prerequisite:** PH7-BD-3 (Scorecard Form) complete and passing build.
**Purpose:** Implement the Director of Preconstruction review panel (`/bd/$scorecardId/review`). Covers: receiving submitted scorecards, requesting clarification, accepting with deadline, rejecting with required reason, and the WAIT state (follow-up date + versioning). Also covers the "reopen" capability for BD Manager and Director after a No-Go decision.

---

## Prerequisite Checks

Before starting this task:

- [ ] Scorecard form (PH7-BD-3) can submit a scorecard to `stage: 'Submitted'`.
- [ ] `SCORECARD_STAGE_TRANSITIONS` is defined in `@hbc/models`.
- [ ] `IScorecardNotification` interface is available.
- [ ] `HbcModal`, `HbcConfirmDialog`, `HbcButton`, `HbcTextField`, `HbcSelect` are importable.

---

## Task 1 — Review Panel Route & Access Guard

**File:** `apps/pwa/src/routes/bd/$scorecardId/review.tsx`

**Access rule:** Only `DirectorOfPreconstruction` and `VPOfOperations` can navigate to this route. All other roles are redirected to the scorecard read view (`/bd/$scorecardId`).

**Route guard in `beforeLoad`:**
```typescript
if (!role.isDirector && !role.isVP) {
  throw redirect({ to: '/bd/$scorecardId', params: { scorecardId } });
}
```

---

## Task 2 — Review Panel Layout

**Component:** `apps/pwa/src/components/bd/review/DirectorReviewPanel.tsx`

Layout:

```
┌─ Header ─────────────────────────────────────────────────────┐
│  [Lead Name]   Stage: Under Review   Version: {n}            │
│  BD Manager: {name}   Submitted: {date}                       │
└──────────────────────────────────────────────────────────────┘

┌─ Scorecard Summary (read-only) ──────────────────────────────┐
│  [Full read-only scorecard panel from PH7-BD-3 Task 6]       │
│  Score: {total}/106  Category: {Focus/Pursue/Drop}            │
└──────────────────────────────────────────────────────────────┘

┌─ BD Manager Comments ────────────────────────────────────────┐
│  {bdManagerSubmitComment}                                    │
└──────────────────────────────────────────────────────────────┘

┌─ Director Actions ───────────────────────────────────────────┐
│  [Request Clarification]  [Reject]  [Accept]                 │
└──────────────────────────────────────────────────────────────┘
```

---

## Task 3 — Action: Request Clarification (Q57 — Part i & ii)

Per Q57, the Director can request **both clarification on the scorecard content AND additional information** (both i and ii are combined into a single "Request Clarification" action).

**UI Flow:**

1. Director clicks "Request Clarification".
2. `HbcModal` opens with:
   - `HbcTextField` (multi-line): "Clarification Request" — required, max 1000 chars.
   - Toggle: "Request additional information from BD Manager" (optional secondary note).
   - "Send Request" button / "Cancel" button.
3. On confirm:
   - Stage transitions: `UnderReview` → `NeedsClarification`.
   - `directorClarificationRequest` field set on scorecard.
   - `directorClarificationRequestedAt` timestamp set.
   - Notification fired: `IScorecardNotification` to BD Manager (type: `ClarificationRequested`).
   - Toast: "Clarification request sent to {bdManagerName}."

**BD Manager response to clarification:**
- BD Manager sees a banner on the scorecard read view when `stage === 'NeedsClarification'`:
  > "Director of Preconstruction has requested clarification: {directorClarificationRequest}"
  > [Respond / Update Scorecard] button → navigates to `/bd/$scorecardId/edit` with wizard pre-filled.
- After BD Manager resubmits (new version created), stage returns to `Submitted` → `UnderReview`.

---

## Task 4 — Action: Reject (Q57 — Rejection requires reason)

**UI Flow:**

1. Director clicks "Reject".
2. `HbcConfirmDialog` opens with:
   - Title: "Reject Scorecard"
   - Body: "This scorecard will be closed. A reason is required."
   - `HbcTextField` (multi-line): "Rejection Reason" — **required**, max 1000 chars.
   - `HbcButton` "Confirm Rejection" (destructive variant) / "Cancel".
3. On confirm:
   - Stage transitions: `UnderReview` → `Rejected`.
   - `directorRejectionReason` field set on scorecard.
   - `directorRejectedAt` timestamp set.
   - `directorId` set (who rejected).
   - Notification fired: `IScorecardNotification` to BD Manager (type: `ScorecardRejected`), notification body includes rejection reason.
   - Toast: "Scorecard rejected."

**Rejection reason field** (add to `IGoNoGoScorecard`):
```typescript
directorRejectionReason?: string;
directorRejectedAt?: string; // ISO date
```

---

## Task 5 — Action: Accept (Q57 — Acceptance with deadline)

Per Q57, acceptance includes a **meeting deadline** (the Director sets a date by which the committee meeting must be scheduled).

**UI Flow:**

1. Director clicks "Accept".
2. `HbcModal` opens with:
   - Title: "Accept Scorecard for Committee Review"
   - `HbcTextField` (date): "Committee Meeting Deadline" — required. The Estimating Coordinator must schedule the meeting by this date.
   - `HbcTextField` (multi-line, optional): "Notes to Estimating Coordinator" — max 500 chars.
   - "Accept" button / "Cancel" button.
3. On confirm:
   - Stage transitions: `UnderReview` → `Accepted`.
   - `directorAcceptedAt` timestamp set.
   - `committeeMeetingDeadline` field set.
   - `directorNotesToEstimatingCoordinator` field set (if provided).
   - `directorId` set (who accepted).
   - Notification fired: `IScorecardNotification` to **Estimating Coordinator** (type: `ScorecardAccepted`). Notification body includes project name, BD Manager name, and meeting deadline.
   - Toast: "Scorecard accepted. Estimating Coordinator notified to schedule committee meeting."

**Acceptance fields** (add to `IGoNoGoScorecard`):
```typescript
directorAcceptedAt?: string;        // ISO date
committeeMeetingDeadline?: string;  // ISO date — required on accept
directorNotesToEstimatingCoordinator?: string;
```

---

## Task 6 — WAIT State (Q59 — Part A: option i)

Per Q59 Part A, a BD Manager (or Director) can place a scorecard in a WAIT state, setting a **follow-up date**. Every update to the scorecard (including WAIT status changes) creates a new version with required change comments.

**Who can set WAIT:** BD Manager (own scorecards), Director of Preconstruction (any scorecard).

**Valid stages for WAIT transition:** `Draft`, `Submitted`, `NeedsClarification` — i.e., before acceptance. A scorecard that has been accepted/in committee cannot be sent back to WAIT.

**UI:** "Place on Wait" button visible on scorecard read view (BD Manager + Director) when stage is in the valid pre-acceptance set.

**WAIT Modal:**

```
Title: "Place Scorecard on Wait"
Fields:
  - Follow-Up Date (date picker) — required
  - Reason for Wait (textarea) — required, stored as versionChangeComment
  - [Confirm Wait] / [Cancel]
```

On confirm:
- New version snapshot created (PH7-BD-6).
- Stage transitions to `Waiting`.
- `waitFollowUpDate` and `waitReason` set on scorecard.
- Toast: "Scorecard placed on wait. Follow-up date: {date}."

**WAIT list indicator:** On the BD home page list, scorecards in `Waiting` stage show the follow-up date in the Stage column as: `Waiting (Follow-up: MM/DD/YYYY)`. Due or overdue follow-up dates render in orange/red.

---

## Task 7 — Reopen After No-Go (Q59 — Part B)

Per Q59 Part B, after a No-Go decision has been recorded, the **BD Manager or Director of Preconstruction** can reopen the scorecard and make changes. Reopening creates a new version with required change comments.

**Reopen action** visible on scorecard read view when `stage === 'Rejected'` OR when `decision === 'NoGo'` (from committee stage — see PH7-BD-6).

**Reopen Modal:**

```
Title: "Reopen Scorecard for Reconsideration"
Fields:
  - Reason for Reopening (textarea) — required, stored as versionChangeComment
  - [Confirm Reopen] / [Cancel]
```

On confirm:
- New version snapshot created.
- Stage transitions to `Draft`.
- `reopenedAt` and `reopenedByUserId` set on scorecard.
- Toast: "Scorecard reopened. You may now edit and resubmit."

---

## Task 8 — Notification Payloads

All notifications use `IScorecardNotification` shape (from `IGoNoGoWorkflow.ts`). Implement a client-side notification dispatch helper:

**File:** `apps/pwa/src/services/bdNotificationService.ts`

```typescript
export async function dispatchScorecardNotification(
  payload: IScorecardNotification
): Promise<void> {
  // POST /api/bd/notifications
  // Backend Azure Function handles email via MS Graph or Teams adaptive card
}
```

Notification types triggered in this task file:

| Event | Recipients | Subject Template |
|---|---|---|
| `ClarificationRequested` | BD Manager | "Clarification Requested: {leadName}" |
| `ScorecardRejected` | BD Manager | "Scorecard Rejected: {leadName}" |
| `ScorecardAccepted` | Estimating Coordinator | "Scorecard Ready for Scheduling: {leadName} — Deadline {date}" |

---

## Task 9 — Stage Transition Enforcement

**File:** `apps/pwa/src/utils/bd/scorecardStageGuards.ts`

```typescript
import { SCORECARD_STAGE_TRANSITIONS, ScorecardStage } from '@hbc/models';

export function canTransition(
  from: ScorecardStage,
  to: ScorecardStage
): boolean {
  return SCORECARD_STAGE_TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertTransition(
  from: ScorecardStage,
  to: ScorecardStage
): void {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid stage transition: ${from} → ${to}`);
  }
}
```

All action handlers in this task file call `assertTransition` before calling the API.

---

## Task 10 — Verification

```bash
pnpm turbo run build
pnpm turbo run type-check

# Manual verification:
# 1. Submit a scorecard as BD Manager — stage becomes 'Submitted' → 'UnderReview'
# 2. Login as Director — review panel renders with read-only scorecard
# 3. Request clarification — modal, BD Manager notified, stage → NeedsClarification
# 4. BD Manager resubmits — stage returns to UnderReview
# 5. Reject — required reason enforced, BD Manager notified, stage → Rejected
# 6. Accept — deadline required, Estimating Coordinator notified, stage → Accepted
# 7. Place on Wait — follow-up date set, stage → Waiting
# 8. Reopen after rejection — new version created, stage → Draft
```

---

## Success Criteria

- [ ] BD-4.1 Director review panel is accessible only to Director and VP roles.
- [ ] BD-4.2 Request Clarification fires notification to BD Manager and sets stage to `NeedsClarification`.
- [ ] BD-4.3 BD Manager can update and resubmit from `NeedsClarification` → `Submitted`.
- [ ] BD-4.4 Reject action requires a non-empty rejection reason.
- [ ] BD-4.5 Reject fires notification to BD Manager with reason included.
- [ ] BD-4.6 Accept action requires a committee meeting deadline date.
- [ ] BD-4.7 Accept fires notification to Estimating Coordinator with project name and deadline.
- [ ] BD-4.8 WAIT state sets follow-up date and creates a new version snapshot.
- [ ] BD-4.9 WAIT follow-up dates render with color coding on the home page list.
- [ ] BD-4.10 Reopen after No-Go creates a new version and returns stage to `Draft`.
- [ ] BD-4.11 `canTransition()` guard prevents invalid stage transitions.
- [ ] BD-4.12 Build passes with zero TypeScript errors.

<!-- IMPLEMENTATION PROGRESS & NOTES
Plan created: 2026-03-07
Status: Ready for implementation
Prerequisite: PH7-BD-3 complete
-->
