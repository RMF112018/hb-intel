# PH7-BD-6 — Business Development: Decisions, Versioning & Handoff

**Version:** 1.0
**Governed by:** CLAUDE.md v1.2 · HB-Intel-Blueprint-V4.md · `hb-intel-foundation-plan.md`
**Date:** 2026-03-07
**Prerequisite:** PH7-BD-5 (Committee Meeting & Scoring) complete and passing build.
**Purpose:** Implement the decision recording panel (`/bd/$scorecardId/decision`), the full scorecard versioning system (every update creates an immutable version snapshot with per-criterion change comments), the Project Executive / Project Manager assignment handling (Q60), and the handoff package assembly and delivery (Q61).

---

## Prerequisite Checks

Before starting this task:

- [ ] Scorecard can reach `stage: 'DecisionReached'` via PH7-BD-5.
- [ ] `IVersionSnapshot` and `IScorecardHandoffPackage` interfaces are available from `@hbc/models`.
- [ ] `GoNoGoDecision` enum is defined: `Go`, `NoGo`, `Pending`.
- [ ] Azure Functions API endpoints for scorecards exist (PH7-BD-8 will finalize; use stub for now).

---

## Task 1 — Decision Recording Panel

**Route:** `/bd/$scorecardId/decision` (accessible when `stage === 'DecisionReached'`)

**Access:** Director of Preconstruction and VP of Operations only. Estimating Coordinator has read-only view.

**Component:** `apps/pwa/src/components/bd/decision/DecisionPanel.tsx`

**Layout:**

```
┌─ Record Go/No-Go Decision ──────────────────────────────────────┐
│  Lead: {leadName}                                                │
│                                                                  │
│  ─ Score Summary ─────────────────────────────────────────────  │
│  Originator Total: {n}/106  ({Focus/Pursue/Drop})               │
│  Committee Total:  {n}/106  ({Focus/Pursue/Drop})               │
│  Average Total:    {n}/106  ({Focus/Pursue/Drop})               │
│                                                                  │
│  ─ Decision ──────────────────────────────────────────────────  │
│  Decision: [○ GO]  [○ NO-GO]                                    │
│                                                                  │
│  Decision Notes (required):                                      │
│  [Textarea — max 2000 chars]                                     │
│                                                                  │
│  [Record Decision]                                               │
└──────────────────────────────────────────────────────────────────┘
```

**Field mappings (add to `IGoNoGoScorecard`):**
```typescript
decision?: GoNoGoDecision;
decisionNotes?: string;           // required on record
decisionRecordedAt?: string;      // ISO date
decisionRecordedByUserId?: string;
```

**On "Record Decision" — GO:**
1. Stage transitions: `DecisionReached` → `HandedOff`.
2. `decision = 'Go'`, `decisionRecordedAt`, `decisionRecordedByUserId` set.
3. Version snapshot created.
4. Handoff package assembled (Task 3).
5. Notifications fired:
   - Estimating Coordinator (type: `GoDecisionRecorded`)
   - Chief Estimator (type: `GoDecisionRecorded`) — **Q65 Part B** specifies both.
   - Body: "{leadName} has received a GO decision. The handoff package is available in HB Intel."
6. Scorecard is now read-only for all BD roles. It surfaces in Project Hub Preconstruction (cross-module read-only).
7. Toast: "GO decision recorded. Estimating Coordinator and Chief Estimator notified."

**On "Record Decision" — NO-GO:**
1. Stage transitions: `DecisionReached` → `Closed`.
2. `decision = 'NoGo'`, timestamps set.
3. Version snapshot created.
4. Scorecard enters closed state — reopenable per Q59 Part B (see PH7-BD-4 Task 7).
5. Notification fired to BD Manager (type: `NoGoDecisionRecorded`).
6. Toast: "NO-GO decision recorded."

---

## Task 2 — Versioning System

**Governing rule (Q59 Part A):** Every update to the scorecard — by BD Manager, Director, or Committee — creates a new immutable version snapshot. Comments justifying changes are required per criterion (for any criterion where values changed).

### Version Snapshot Shape

**`IVersionSnapshot`** (from `packages/models/src/bd/IGoNoGoWorkflow.ts`):

```typescript
export interface IVersionSnapshot {
  versionNumber: number;           // Auto-incrementing integer, starts at 1
  snapshotAt: string;              // ISO datetime — when snapshot was created
  createdByUserId: string;
  createdByDisplayName: string;
  triggerAction: VersionTriggerAction;
  overallChangeComment: string;    // Top-level comment for this version change
  criterionChanges: ICriterionChange[];
}

export interface ICriterionChange {
  criterion: GoNoGoCriterion;
  fieldChanged: 'originatorScore' | 'committeeScore' | 'originatorComment' | 'committeeComment';
  previousValue: string | number | null;
  newValue: string | number | null;
  changeComment: string;           // Per-criterion comment — required when score value changed
}

export enum VersionTriggerAction {
  InitialDraft = 'InitialDraft',
  Resubmission = 'Resubmission',
  ClarificationResponse = 'ClarificationResponse',
  CommitteeScoring = 'CommitteeScoring',
  WaitSet = 'WaitSet',
  Reopen = 'Reopen',
  DecisionRecorded = 'DecisionRecorded',
  ManualEdit = 'ManualEdit',
}
```

### Version Creation Logic

**File:** `apps/pwa/src/utils/bd/scorecardVersioning.ts`

```typescript
export function buildVersionSnapshot(
  previousScorecard: IGoNoGoScorecard,
  updatedScorecard: IGoNoGoScorecard,
  triggerAction: VersionTriggerAction,
  overallChangeComment: string,
  currentUser: { userId: string; displayName: string }
): IVersionSnapshot {
  const criterionChanges: ICriterionChange[] = [];

  for (const criterion of updatedScorecard.criteria) {
    const prev = previousScorecard.criteria.find(c => c.criterion === criterion.criterion);
    if (!prev) continue;

    if (criterion.originatorScore !== prev.originatorScore) {
      criterionChanges.push({
        criterion: criterion.criterion,
        fieldChanged: 'originatorScore',
        previousValue: prev.originatorScore ?? null,
        newValue: criterion.originatorScore ?? null,
        changeComment: criterion.originatorComment ?? '',
      });
    }
    if (criterion.committeeScore !== prev.committeeScore) {
      criterionChanges.push({
        criterion: criterion.criterion,
        fieldChanged: 'committeeScore',
        previousValue: prev.committeeScore ?? null,
        newValue: criterion.committeeScore ?? null,
        changeComment: criterion.committeeComment ?? '',
      });
    }
  }

  return {
    versionNumber: (previousScorecard.currentVersion ?? 0) + 1,
    snapshotAt: new Date().toISOString(),
    createdByUserId: currentUser.userId,
    createdByDisplayName: currentUser.displayName,
    triggerAction,
    overallChangeComment,
    criterionChanges,
  };
}
```

### Version History UI

**Component:** `apps/pwa/src/components/bd/VersionHistoryPanel.tsx`

Collapsible panel on the scorecard read view:

```
Version History (v{current})
▼ v3 — 2026-03-07  [Committee Scoring]  by Estimating Coordinator
  Overall: "Committee aligned on criteria 6 & 16 after discussion"
  Changed: Criterion 6 (Committee): 4 → 6 — "Competitive bid environment discussed"
           Criterion 16 (Committee): 5 → 7 — "Strong margin potential confirmed"
▶ v2 — 2026-03-06  [Resubmission]  by BD Manager
▶ v1 — 2026-03-05  [InitialDraft]  by BD Manager
```

Each version is expandable to show all `criterionChanges`.

---

## Task 3 — Handoff Package Assembly (Q61 = Part A: iii)

Per Q61 Part A (Option iii), a **complete handoff package is auto-assembled** from project data when a GO decision is recorded.

**`IScorecardHandoffPackage`** fields (assemble from live scorecard data):

```typescript
export interface IScorecardHandoffPackage {
  scorecardId: string;
  scorecardVersion: number;
  assembledAt: string;
  leadName: string;
  clientName: string;
  projectSector: ProjectSector;
  hbcRegion: HbcRegion;
  deliveryMethod: DeliveryMethod;
  estimatedConstructionValue?: number;
  estimatedGcFee?: number;
  bidDate?: string;
  bdManager: { userId: string; displayName: string };
  directorOfPrecon: { userId: string; displayName: string };
  projectExecutive?: { userId: string; displayName: string };
  projectManager?: { userId: string; displayName: string };
  scoreSummary: {
    originatorTotal: number;
    committeeTotal: number;
    averageTotal: number;
    category: ScorecardCategory;
  };
  criteriaScores: Array<{
    criterionName: string;
    originatorScore: number;
    committeeScore: number;
    delta: number;
  }>;
  strategicPursuitAnswer: StrategicPursuitAnswer;
  decisionNotes: string;
  departmentalSections: IDepartmentalSectionEntry[];
  versionHistory: IVersionSnapshot[];
  attachedDocuments: IHandoffDocument[];
}

export interface IHandoffDocument {
  documentName: string;
  sharepointUrl: string;
  uploadedAt: string;
  uploadedByUserId: string;
}
```

**Assembly function:**

**File:** `apps/pwa/src/utils/bd/handoffPackageBuilder.ts`

```typescript
export function assembleHandoffPackage(
  scorecard: IGoNoGoScorecard,
  criterionDefs: typeof CRITERION_DEFINITIONS
): IScorecardHandoffPackage {
  // Maps scorecard data to IScorecardHandoffPackage
  // Calls getScoreGuideCategory() for category
  // Computes delta per criterion
  // Includes version history and attached documents
}
```

**Document copy to SharePoint (Q61 Part 2: ii):**

Per Q61 Part 2 (Option ii), on GO decision, all documents attached to the scorecard are copied to the project's SharePoint document library. This is performed by an Azure Function trigger (see PH7-BD-8):

- `POST /api/bd/scorecards/{id}/copy-documents-to-project`
- Called automatically on GO decision.
- Copies from BD document library → Project Hub SharePoint document library for the provisioned project.

---

## Task 4 — Project Executive / PM Assignment (Q60)

Per Q60:
- **Part A (option ii):** PE and PM assignment happens **outside of HB Intel** (not in the BD module). Fields `projectExecutiveId` and `projectManagerId` on the scorecard are optional "if known at bid time" fields only.
- **Part B (option ii):** The configurable role (Executive Override) for post-committee override is a **configurable system role**, not hardcoded. Implementation: an `executiveOverrideRoleId` setting in the HB Intel admin config table. Any user assigned that role can trigger the override.

**Executive Override action** (available after `DecisionReached`, before `HandedOff`):
- Visible only to users with the `executiveOverrideRoleId` system role.
- Allows changing the committee-recorded decision before handoff.
- Requires a mandatory override reason (stored in `executiveOverrideReason`).
- Creates a version snapshot with `VersionTriggerAction.DecisionRecorded`.

**Fields** (add to `IGoNoGoScorecard`):
```typescript
executiveOverrideReason?: string;
executiveOverrideByUserId?: string;
executiveOverrideAt?: string;
```

---

## Task 5 — Handoff View in BD Module

**Component:** `apps/pwa/src/components/bd/decision/HandoffSummaryPanel.tsx`

After GO decision, the scorecard view shows a "Handoff Complete" panel:

```
┌─ GO Decision — Handoff Complete ───────────────────────────────┐
│  Decision: GO   Recorded: {date} by {name}                     │
│  Notified: Estimating Coordinator, Chief Estimator             │
│                                                                 │
│  Handoff Package:                                              │
│    Total Score: {avg}/106  ({category})                        │
│    Version: v{n}                                               │
│    Documents copied to project SharePoint: {count} files       │
│                                                                 │
│  This scorecard is now read-only.                              │
│  View it in Project Hub → Preconstruction → Go/No-Go           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Task 6 — Cross-Module Read-Only Surface (Project Hub)

Per the cross-module integration rule in `PH7-ProjectHub-Features-Plan.md`:

> "Go/No-Go Scorecard lives in Business Development; Project Hub shows a read-only view of the BD record for the current project."

**Implementation contract** (to be fulfilled in PH7-ProjectHub-4):

- BD module exposes a `GET /api/bd/scorecards/by-project/{projectId}` endpoint returning the final GO scorecard for that project.
- Project Hub Preconstruction tab fetches this endpoint and renders the `HandoffSummaryPanel` and full read-only scorecard view.
- No write operations on the scorecard from within Project Hub.

---

## Task 7 — Verification

```bash
pnpm turbo run build
pnpm turbo run type-check

# Manual verification:
# 1. From DecisionReached stage — Director opens decision panel
# 2. Select GO + required notes → Record Decision
# 3. Stage → HandedOff; Estimating Coordinator + Chief Estimator notified
# 4. Scorecard is read-only after GO
# 5. Select NO-GO + required notes → Closed; BD Manager notified
# 6. Version snapshot created on each update — verify version number increments
# 7. Criterion change comments required for changed scores
# 8. Version history panel expands to show changes per version
# 9. Executive override visible only to override role; creates version snapshot
# 10. Document copy trigger fires on GO decision
```

---

## Success Criteria

- [ ] BD-6.1 Decision panel is accessible only to Director and VP after `DecisionReached`.
- [ ] BD-6.2 GO decision transitions stage to `HandedOff` and fires notifications to both Estimating Coordinator and Chief Estimator.
- [ ] BD-6.3 NO-GO decision transitions stage to `Closed` and fires notification to BD Manager.
- [ ] BD-6.4 Decision notes are required before recording any decision.
- [ ] BD-6.5 Every scorecard update creates an immutable version snapshot with incremented version number.
- [ ] BD-6.6 Per-criterion change comments are required when score values change.
- [ ] BD-6.7 `buildVersionSnapshot()` correctly identifies changed criterion fields and records previous/new values.
- [ ] BD-6.8 Version history panel displays all versions with expand/collapse per version.
- [ ] BD-6.9 `assembleHandoffPackage()` produces complete `IScorecardHandoffPackage` from scorecard data.
- [ ] BD-6.10 Document copy to project SharePoint is triggered on GO decision.
- [ ] BD-6.11 Executive override action is visible only to users with the configurable override role.
- [ ] BD-6.12 Handoff summary panel renders correctly after GO decision.
- [ ] BD-6.13 Scorecard is read-only in BD module after GO decision.
- [ ] BD-6.14 Build passes with zero TypeScript errors.

<!-- IMPLEMENTATION PROGRESS & NOTES
Plan created: 2026-03-07
Status: Ready for implementation
Prerequisite: PH7-BD-5 complete
-->
