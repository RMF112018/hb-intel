# PH7-BD-5 — Business Development: Committee Meeting & Scoring

**Version:** 1.0
**Governed by:** CLAUDE.md v1.2 · HB-Intel-Blueprint-V4.md · `hb-intel-foundation-plan.md`
**Date:** 2026-03-07
**Prerequisite:** PH7-BD-4 (Director Review Workflow) complete and passing build.
**Purpose:** Implement the Committee Scoring session (`/bd/$scorecardId/committee`). Covers: Estimating Coordinator schedules meeting and assembles committee, committee composition rules (Q58), facilitator-led live scoring interface (Q54), and the Committee scoring column on the scorecard.

---

## Prerequisite Checks

Before starting this task:

- [ ] Scorecard can reach `stage: 'Accepted'` via PH7-BD-4.
- [ ] `IGoNoGoScorecard` includes `committeeMeetingDeadline`, `committeeMembers`, and all committee scoring fields.
- [ ] `IScorecardNotification` supports `MeetingScheduled` and `CommitteeSessionOpened` types.
- [ ] `HbcPeoplePicker`, `HbcDataTable`, `HbcModal`, `HbcButton`, `HbcFormSection` importable.

---

## Task 1 — Estimating Coordinator: Schedule Meeting Page

**Route:** `/bd/$scorecardId/committee` (when `stage === 'Accepted'`)

**Access:** Estimating Coordinator only. All other roles see read-only committee panel.

**UI: Meeting Scheduling Form**

```
┌─ Schedule Go/No-Go Committee Meeting ───────────────────────────┐
│  Lead: {leadName}   BD Manager: {bdManagerName}                  │
│  Acceptance Deadline: {committeeMeetingDeadline}                 │
│                                                                   │
│  Meeting Date & Time:  [Date Picker]  [Time Picker]              │
│  Meeting Location / Link:  [Text Field]                          │
│                                                                   │
│  ─ Committee Composition ──────────────────────────────────────  │
│                                                                   │
│  Core Members (auto-populated, read-only):                       │
│    • Director of Preconstruction — {directorName}                │
│    • BD Manager — {bdManagerName}                                │
│    • Vice President of Operations — [HbcPeoplePicker]           │
│                                                                   │
│  Additional Invitees (per Director/BD Manager request):          │
│    [HbcPeoplePicker — multi-select]  [Add]                       │
│    {list of added invitees with [Remove] per row}                │
│                                                                   │
│  [Schedule Meeting]                                              │
└──────────────────────────────────────────────────────────────────┘
```

**Committee composition rules (Q58 = Option C):**

- **Fixed core members** (always present):
  - Director of Preconstruction (auto-populated from `directorOfPreconId`)
  - BD Manager (auto-populated from `bdManagerId`)
  - Vice President of Operations (Estimating Coordinator selects from `HbcPeoplePicker`)
- **Additional invitees**: The Director of Preconstruction, BD Manager, or Vice President of Operations may request that the Estimating Coordinator add specific individuals. These are added via the multi-select `HbcPeoplePicker` and stored in `committeeAdditionalInvitees`.

**On "Schedule Meeting" confirm:**
- `committeeMeetingDate` and `committeeMeetingLocation` set on scorecard.
- `committeeMembers` array populated (core + additional).
- Stage transitions: `Accepted` → `MeetingScheduled`.
- Notifications fired (`IScorecardNotification` type `MeetingScheduled`) to:
  - All `committeeMembers`
  - BD Manager
  - Director of Preconstruction
- Toast: "Meeting scheduled. All committee members notified."

**Notification fields** (add to `IGoNoGoScorecard`):
```typescript
committeeMeetingDate?: string;          // ISO datetime
committeeMeetingLocation?: string;      // Free text or URL
committeeMembers: ICommitteeMember[];   // core + additional
committeeAdditionalInvitees: ICommitteeMember[];
```

**`ICommitteeMember` interface:**
```typescript
export interface ICommitteeMember {
  userId: string;
  displayName: string;
  email: string;
  isCore: boolean;   // true for Director, BD Manager, VP
  addedByUserId?: string;
}
```

---

## Task 2 — Open Committee Scoring Session

**Route:** `/bd/$scorecardId/committee` (when `stage === 'MeetingScheduled'`)

After the meeting is scheduled, the Estimating Coordinator (or facilitator) opens the live scoring session.

**UI:** "Open Scoring Session" button visible when `stage === 'MeetingScheduled'`.

On click:
- `HbcConfirmDialog`: "Open the committee scoring session? This will allow committee members to enter scores."
- On confirm: Stage → `CommitteeScoring`. `committeeScoringOpenedAt` timestamp set.
- Notification fired (`CommitteeSessionOpened`) to all `committeeMembers`.

---

## Task 3 — Facilitator-Led Live Scoring Interface (Q54 = Option C)

**Component:** `apps/pwa/src/components/bd/committee/CommitteeScoringPanel.tsx`

Per Q54 (Option C — facilitator-led live scoring on screen), the committee scores are entered by the **Estimating Coordinator acting as facilitator** during the live meeting. The committee discusses each criterion and the facilitator records the agreed-upon score.

**This is NOT distributed scoring** — there is one scoring operator (Estimating Coordinator), one screen, one value per criterion for the Committee column.

**Layout:**

```
┌─ Committee Scoring Session ──────────────────────────────────────┐
│  Lead: {leadName}   Meeting Date: {date}   Facilitator: {name}   │
│  Session Status: OPEN   Opened: {time}                           │
│                                                                   │
│  ─ Scoring Table ────────────────────────────────────────────── │
│  # │ Criterion               │ Originator │ Committee │ Δ        │
│  ──┼─────────────────────────┼────────────┼───────────┼────────  │
│  1 │ Relationship w/ Client  │ 6 (High)   │ [Select]  │ {diff}   │
│  2 │ Relationship w/ Design  │ 3 (Avg)    │ [Select]  │ {diff}   │
│  … │ …                       │ …          │ …         │ …        │
│                                                                   │
│  Subtotal Part A: Orig {x}/50  Comm {y}/50                       │
│  Subtotal Part B: Orig {x}/56  Comm {y}/56                       │
│  TOTAL:           Orig {x}/106  Comm {y}/106                     │
│                                                                   │
│  ─ Version Change Comment (required) ─────────────────────────  │
│  [Textarea — required per criterion with committee score change]  │
│                                                                   │
│  [Save Progress]  [Close Session & Record Scores]                │
└──────────────────────────────────────────────────────────────────┘
```

**Scoring input per criterion (Committee column):**

Same radio-button design as BD Manager form:
- "High ({hv})" / "Average ({av})" / "Low ({lv})"
- Pre-populated with Originator score as default starting point.
- Committee score stored as `committeeScore` on `IGoNoGoScorecardCriterion`.

**Divergence column (Δ):**
- Shows `|originatorScore - committeeScore|` per criterion.
- Non-zero divergences are highlighted (orange if Δ ≥ 2).

**Version change comment rules (Q59 — Part A):**

Per Q59, "updates to the scorecard from either BD Manager OR Committee will create a new version, comments justifying the changes need to be applied per category regardless of which side of the scorecard the update occurs on."

For Committee scoring:
- A `committeeComment` field is required on **every criterion where the committee score differs from the originator score**.
- A criterion where committee score = originator score does not require a comment.
- Form validation enforces this before "Close Session & Record Scores" is enabled.

---

## Task 4 — Session Comment Requirement Validation

**Hook:** `apps/pwa/src/hooks/useCommitteeScoringValidation.ts`

```typescript
export function validateCommitteeScoring(
  criteria: IGoNoGoScorecardCriterion[]
): { isValid: boolean; missingComments: GoNoGoCriterion[] } {
  const missingComments = criteria
    .filter(c => c.committeeScore !== c.originatorScore && !c.committeeComment?.trim())
    .map(c => c.criterion);

  return { isValid: missingComments.length === 0, missingComments };
}
```

If `missingComments.length > 0`, a banner shows: "Committee comment required for: {criterion names}." The "Close Session" button is disabled until all comments are filled.

---

## Task 5 — Save Progress (Intermediate Save)

"Save Progress" button calls `PATCH /api/bd/scorecards/{id}/committee-scores` with current criterion values. Does **not** advance stage. Useful for saving mid-session if meeting is interrupted.

No version snapshot is created on intermediate saves — only on "Close Session."

---

## Task 6 — Close Session & Record Scores

"Close Session & Record Scores" button:

1. Calls `validateCommitteeScoring` — disabled if invalid.
2. `HbcConfirmDialog`: "Close scoring session? Committee scores will be recorded and a version snapshot created."
3. On confirm:
   - New version snapshot created (see PH7-BD-6).
   - `committeeScoresRecordedAt` timestamp set.
   - `committeeScoresRecordedByUserId` set (Estimating Coordinator).
   - Stage transitions: `CommitteeScoring` → `DecisionReached`.
   - Notification fired (`CommitteeScoringComplete`) to Director of Preconstruction, BD Manager, VP of Operations.
   - Toast: "Committee scores recorded. Decision panel now available."

---

## Task 7 — Committee Panel Read View (Non-Facilitator Roles)

When `stage` is `MeetingScheduled` or `CommitteeScoring` or later, and the current user is NOT the Estimating Coordinator, the committee panel renders as read-only:

- Meeting date, location, committee member list.
- If scoring is complete: side-by-side Originator / Committee score table with divergence column.
- Session status badge.

---

## Task 8 — Verification

```bash
pnpm turbo run build
pnpm turbo run type-check

# Manual verification:
# 1. Login as Estimating Coordinator on an 'Accepted' scorecard
# 2. Schedule meeting — core members pre-populated, additional invitees addable
# 3. All committee members notified on schedule
# 4. Open scoring session — stage → CommitteeScoring
# 5. Enter committee scores — divergences shown in Δ column
# 6. Attempt to close without filling required criterion comments → validation banner
# 7. Fill all required comments → Close Session enabled
# 8. Close session → version snapshot created, stage → DecisionReached
# 9. Non-facilitator roles see read-only committee panel
```

---

## Success Criteria

- [ ] BD-5.1 Estimating Coordinator can schedule meeting with date, location, and committee composition.
- [ ] BD-5.2 Fixed core committee members are auto-populated; additional invitees are selectable.
- [ ] BD-5.3 All committee members and BD Manager receive `MeetingScheduled` notification.
- [ ] BD-5.4 Scoring session opens via Estimating Coordinator action; stage → `CommitteeScoring`.
- [ ] BD-5.5 Committee scoring panel renders Originator scores pre-populated as defaults.
- [ ] BD-5.6 Divergence (Δ) column shows per-criterion score differences with color coding.
- [ ] BD-5.7 Criterion comment required when committee score differs from originator score.
- [ ] BD-5.8 "Close Session" is disabled until all required criterion comments are filled.
- [ ] BD-5.9 Closing session creates a version snapshot and advances stage to `DecisionReached`.
- [ ] BD-5.10 Non-facilitator roles see read-only committee panel.
- [ ] BD-5.11 Build passes with zero TypeScript errors.

<!-- IMPLEMENTATION PROGRESS & NOTES
Plan created: 2026-03-07
Status: Ready for implementation
Prerequisite: PH7-BD-4 complete
-->
