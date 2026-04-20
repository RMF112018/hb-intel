# P3-E8-T06 — JHA, Daily Pre-Task Plan, Toolbox Prompt Intelligence, and Weekly Toolbox Talk

**Doc ID:** P3-E8-T06
**Parent:** P3-E8 Safety Module — Master Index
**Phase:** 3
**Workstream:** E — Data Models and Field Specifications
**Part:** 6 of 10
**Owner:** Architecture
**Last Updated:** 2026-03-23

---

## 1. JHA and Daily Pre-Task Plan: The Core Distinction

Per Decisions 28 and 29: JHA and Daily Pre-Task Plan are linked but distinct record families.

| Dimension | JHA | Daily Pre-Task Plan |
|---|---|---|
| **What it is** | Governed hazard analysis for a scope of work or activity type | Day-of-work briefing confirming the JHA controls are applied to today's conditions |
| **Frequency** | Once per scope of work (or updated when scope changes) | Once per workday for that scope |
| **Author** | Safety Manager (with project team contributor input) | Project team foreman / superintendent |
| **Approval required** | Yes — Safety Manager approval | No — completion by designated crew lead |
| **Lifecycle** | DRAFT → PENDING_APPROVAL → APPROVED → SUPERSEDED / VOIDED | OPEN → COMPLETE / VOIDED |
| **Contents** | Activity description, scope, step-by-step hazard/control analysis, required PPE, competent person | JHA reference, weather/site conditions today, control confirmation, crew verification |
| **Reference model** | A Daily Pre-Task Plan must reference an APPROVED JHA | A JHA can have many linked Daily Pre-Task Plans |

The JHA governs the hazard analysis for how the work will be done. The Daily Pre-Task Plan confirms that today's conditions are accounted for and the crew is ready to work within that analysis.

---

## 2. JHA Lifecycle and Governance

### 2.1 JHA State Machine

```
DRAFT ──────────────────────► PENDING_APPROVAL
  ▲                                   │
  │ (revise after rejection)    (approve / reject)
  │                                   │
  └─────── APPROVED ◄─────────────────┘
               │
               ├──► SUPERSEDED (when new version approved)
               └──► VOIDED (scope eliminated from project)
```

### 2.2 Approval and Contributor Model

- The Safety Manager is the approving authority for all JHAs
- Project team members (PM, Superintendent, foreman) are contributors — they can add hazard observations and step descriptions, but cannot approve
- A contributor role field on `IJhaRecord` lists who contributed: `contributorIds: string[]`
- JHAs for competent-person-required activities (`requiresCompetentPerson: true`) must reference a valid ACTIVE `ICompetentPersonDesignation` in the `competentPersonDesignationId` field before the Safety Manager can approve

### 2.3 JHA Supersession

When a JHA needs to be updated (scope changes, new hazard discovered, control method changed):
1. Safety Manager creates a new draft JHA linked to the scope
2. New JHA goes through PENDING_APPROVAL → APPROVED
3. Prior JHA transitions to SUPERSEDED (`supersededById` = new JHA ID)
4. Historical Daily Pre-Task Plans remain linked to their original JHA version
5. New Daily Pre-Task Plans must reference the new APPROVED JHA

### 2.4 JHA Step-Hazard-Control Structure

```typescript
// Representation
interface IJhaStep {
  stepNumber: number;
  stepDescription: string;             // What is done in this step
  hazards: IJhaHazard[];               // One or more hazards in this step
}

interface IJhaHazard {
  hazardDescription: string;           // What can go wrong
  riskLevel: HazardRiskLevel;          // HIGH | MEDIUM | LOW (inherent risk, before controls)
  controlMeasures: string[];           // Required controls, listed in hierarchy order
  residualRiskLevel: HazardRiskLevel;  // Risk level after controls applied
}
```

**Risk level rules:**
- `HIGH`: Potential for serious injury, fatality, or major equipment damage; typically requires engineering controls or elimination
- `MEDIUM`: Potential for recordable injury; administrative controls and PPE acceptable
- `LOW`: Minor injury potential; standard PPE and housekeeping controls

### 2.5 JHA Linked Records

- `linkedDailyPreTaskIds`: auto-populated when a Daily Pre-Task Plan references this JHA
- `evidenceRecordIds`: supporting documentation (site photos, hazard documentation)
- `correctiveActionsFromJha`: CAs generated when a hazard review reveals an existing unsafe condition requiring immediate corrective action before work can begin

---

## 3. Daily Pre-Task Plan

### 3.1 Execution Model

The Daily Pre-Task Plan is the day-of-work confirmation that:
1. The crew has reviewed the governing JHA
2. Today's site conditions have been assessed
3. Required controls are in place
4. The crew is ready to work

It is not a reanalysis of hazards — it is confirmation of the JHA + today's conditions.

### 3.2 Required JHA Reference

A Daily Pre-Task Plan cannot be created without referencing an APPROVED JHA. The API enforces this:
- `jhaId` is required
- The referenced JHA must be in APPROVED state
- If the JHA is SUPERSEDED or VOIDED, the system blocks creation and surfaces a work queue item to update the JHA reference

### 3.3 Daily Pre-Task Completion Rules

A Daily Pre-Task Plan reaches `COMPLETE` when:
- `controlsConfirmed = true`
- `ppeVerified = true`
- `attendeeCount > 0`
- `completedAt` is set

Sign-in evidence (`signInEvidenceRecordId`) is strongly recommended but not a hard blocker for non-governed-high-risk activities.

---

## 4. Toolbox Prompt Intelligence

### 4.1 Design Decisions

| Decision | Detail |
|---|---|
| Decision 11 | Intelligent toolbox-talk prompts tied to schedule-driven upcoming high-risk activities |
| Decision 12 | Toolbox prompt issuance is governed and acknowledgment-tracked |
| Decision 13 | Schedule risk detection: governed mappings first, intelligent assistance for gaps |
| Decision 14 | Toolbox prompt closure uses governed closure model with proof requirements |

### 4.2 How Toolbox Prompt Intelligence Works

The Safety Module reads the project schedule to identify upcoming high-risk activities. When a high-risk activity is projected to start in the next 1–2 weeks, the system surfaces a toolbox prompt recommendation to the Safety Manager.

**Step 1 — Schedule activity mapping (governed first):**
The Safety Manager maintains a governed mapping table: `IScheduleRiskMapping`. This maps schedule activity types (or activity name patterns) to toolbox prompt categories.

```typescript
interface IScheduleRiskMapping {
  id: string;
  projectId: string | null;             // null = workspace-level mapping
  activityPattern: string;              // Schedule activity name pattern or type key
  associatedHazardCategories: string[]; // Mapped hazard categories
  recommendedPromptIds: string[];       // Specific prompts to surface
  isGoverned: boolean;                  // True = Safety Manager-defined; false = AI-suggested
  active: boolean;
}
```

**Step 2 — Intelligent assistance for gaps:**
For schedule activities that do not match any governed mapping, the platform uses intelligent assistance (AI-assisted pattern recognition) to suggest a mapping. The Safety Manager reviews and either:
- Accepts the suggestion (creates a new governed mapping)
- Overrides with a different prompt
- Marks the activity as "no prompt needed"

Intelligent suggestions are never auto-applied. The Safety Manager's review is required before any AI-suggested mapping becomes a governed record.

**Step 3 — Prompt issuance:**
When the Safety Manager issues a toolbox prompt, the `IToolboxTalkPrompt.issuanceRecord` is populated. Issuance is a deliberate act — the system surfaces a recommendation, but the Safety Manager decides whether and when to issue.

### 4.3 Toolbox Prompt Closure Model

Per Decision 14: governed closure with proof requirements.

| Prompt Type | Closure Requirement |
|---|---|
| Standard prompt | Completion of a Weekly Toolbox Talk Record that references the prompt (`promptId` set) |
| Governed high-risk prompt | Weekly Toolbox Talk Record + at least one of: named attendee list, sign-in sheet evidence, `@hbc/acknowledgment` batch completion |
| CRITICAL activity prompt | All of the above + Safety Manager review of attendance confirmation |

```typescript
interface IToolboxPromptIssuance {
  // ...
  closureRequired: boolean;
  closureType: PromptClosureType;       // STANDARD | HIGH_RISK | CRITICAL
  closedAt: string | null;
  closureProofRecordId: string | null;  // Evidence record or acknowledgment batch ID
  closureVerifiedById: string | null;   // Safety Manager verification for CRITICAL
}
```

---

## 5. Weekly Toolbox Talk Record

### 5.1 Design Decision

Per Decision 29: weekly toolbox talks are their own governed record family — not a note on an inspection or a checkbox on the SSSP.

Per Decision 30: toolbox talk proof uses a hybrid model: baseline count + sign-in evidence; named records required for governed high-risk talks.

### 5.2 Record Governance

The weekly toolbox talk is owned by the Safety Manager (or a Safety Manager-designated presenter). It is a formal record of:
- What topic was covered
- When it was held
- Who attended (at minimum, a count; named list for high-risk governed talks)
- What proof of completion exists

### 5.3 Proof Model

| Scenario | Required Proof | Optional Enhancement |
|---|---|---|
| Standard weekly talk | `attendeeCount > 0`, `status = COMPLETE` | Sign-in sheet evidence, prompt reference |
| High-risk governed talk (`isHighRiskGoverned = true`) | `attendeeCount > 0`, `namedAttendees` populated, at least one proof element | `@hbc/acknowledgment` batch |
| Governed prompt closure | See §4.3 | |

### 5.4 `@hbc/acknowledgment` Integration

For high-risk toolbox talks where digital acknowledgment is desired, the platform integrates with `@hbc/acknowledgment`:

1. Safety Manager creates the toolbox talk record
2. Safety Manager initiates an acknowledgment batch via `@hbc/acknowledgment` (list of workers)
3. Workers receive acknowledgment request (digital or in-app)
4. Completions flow back to `IWeeklyToolboxTalkRecord.namedAttendees[].acknowledgedAt`
5. `acknowledgmentBatchId` stored on the talk record for audit

Workers without app access can be recorded as `VERBAL_CONFIRMED` in `namedAttendees` with the Safety Manager entering the record.

### 5.5 Work Queue Items from Toolbox Talks

| Trigger | Work Queue Item | Priority | Assignee |
|---|---|---|---|
| Current week has no toolbox talk record | Conduct weekly toolbox talk | MEDIUM | Safety Manager |
| Issued high-risk prompt not closed within 7 days | Complete toolbox prompt closure | HIGH | Safety Manager |
| Governed high-risk talk in DRAFT for > 3 days | Complete toolbox talk record | MEDIUM | Safety Manager |

---

## 6. Schedule Integration

The Safety Module's toolbox prompt intelligence requires read access to the project schedule. This is a cross-module read dependency:

- Safety reads schedule activity data (activity name, planned start date, activity type)
- Safety does not write to the schedule
- The integration is read-only and uses the published schedule activity projection

The Safety Module does not require real-time schedule sync. A daily or on-demand pull of upcoming activities (next 14 days) is sufficient for toolbox prompt intelligence.

---

## 7. Locked Decisions Reinforced in This File

| Decision | Reinforced Here |
|---|---|
| 11 — Toolbox-talk prompts tied to schedule-driven high-risk activities | §4.2 |
| 12 — Toolbox prompt issuance governed and acknowledgment-tracked | §4.2, §4.3 |
| 13 — Schedule risk detection: governed mappings first, intelligent assistance for gaps | §4.2 |
| 14 — Toolbox prompt closure uses governed closure model with proof requirements | §4.3 |
| 28 — JHA and Daily Pre-Task Plan are linked but distinct record families | §1 |
| 29 — Weekly toolbox talks are their own governed record family | §5.1 |
| 30 — Toolbox talk proof: hybrid model — baseline count + sign-in; named for high-risk | §5.3 |

---

*[← T05](P3-E8-T05-Corrective-Actions-Incidents-Evidence-and-Privacy.md) | [Master Index](P3-E8-Safety-Module-Field-Specification.md) | [T07 →](P3-E8-T07-Orientation-Subcontractor-Qualifications-SDS-CompetentPerson.md)*
