# P3-E8-T09 — Publication Contracts, Project Hub, PER, and Reports

**Doc ID:** P3-E8-T09
**Parent:** P3-E8 Safety Module — Master Index
**Phase:** 3
**Workstream:** E — Data Models and Field Specifications
**Part:** 9 of 10
**Owner:** Architecture
**Last Updated:** 2026-03-23

---

## 1. Publication Model Overview

The Safety Module publishes outward via three contracts:

1. **Composite safety scorecard** → Project Hub and PER (read-only projections)
2. **Activity spine events** → cross-module activity history
3. **Work queue items** → `@hbc/my-work-feed` via adapter

The Safety Module does **not** expose full record payloads to Project Hub or PER. It publishes governed projections: derived summaries, computed metrics, and readiness decisions. Full record access stays within the Safety workspace.

Per Decision 2: scorecard and trend published to Project Hub; checklist execution remains in Safety workspace.

---

## 2. Composite Safety Scorecard

Per Decision 39: Project Hub / PER scorecards combine inspection trend, corrective actions, readiness, blockers, and compliance completion.

### 2.1 Scorecard Composition

```typescript
interface ISafetyCompositeScorecard {
  projectId: string;
  computedAt: string;

  // Dimension 1: Inspection score trend
  inspectionTrend: {
    latestNormalizedScore: number | null;
    trendDirection: 'IMPROVING' | 'STABLE' | 'DECLINING' | 'INSUFFICIENT_DATA';
    windowWeeks: number;
    inspectionCount: number;
    latestInspectionDate: string | null;
  };

  // Dimension 2: Corrective action health
  correctiveActions: {
    openCount: number;
    overdueCount: number;
    criticalOpenCount: number;
    averageDaysOpen: number | null;
    majorOverdueCount: number;
  };

  // Dimension 3: Readiness posture
  readiness: {
    projectDecision: ReadinessDecision;
    subcontractorsNotReady: number;
    activitiesWithHardBlockers: number;
    activeProjectBlockers: number;
    activeExceptions: number;
  };

  // Dimension 4: Blocker and exception state
  blockers: {
    hardBlockersActive: number;
    softBlockersActive: number;
    exceptionsActive: number;
    overridesActive: number;
  };

  // Dimension 5: Compliance completion
  compliance: {
    ssspStatus: SSSPStatus;            // DRAFT | PENDING_APPROVAL | APPROVED | SUPERSEDED
    inspectionCurrentWeekComplete: boolean;
    subcontractorsWithMissingSubmissions: number;
    certificationsExpiringSoon: number;
    certificationsExpired: number;
    orientationCompletionRate: number | null;  // null when insufficient data
  };

  // Derived overall posture (for Project Hub visual indicator)
  overallPosture: SafetyPosture;       // See §2.2
}
```

### 2.2 Overall Safety Posture

The overall posture is the single visual indicator shown on Project Hub tiles. It is derived from the five dimensions above, not stored.

```typescript
type SafetyPosture = 'CRITICAL' | 'AT_RISK' | 'ATTENTION' | 'NORMAL' | 'INSUFFICIENT_DATA';
```

| Posture | Trigger Conditions (any one is sufficient for that tier) |
|---|---|
| `CRITICAL` | Any HARD blocker active at project level; any CRITICAL CA open > 1 business day; any LITIGATED incident active; `NOT_READY` project decision |
| `AT_RISK` | Any MAJOR CA overdue; 2+ subcontractors NOT_READY; `READY_WITH_EXCEPTION` project decision with unresolved root conditions; inspection score < 70 |
| `ATTENTION` | `READY_WITH_EXCEPTION` project decision; inspection trend DECLINING; 1 subcontractor NOT_READY; 1+ certifications EXPIRED |
| `NORMAL` | No active blockers, no overdue critical CAs, trend STABLE or IMPROVING, project READY |
| `INSUFFICIENT_DATA` | Project mobilized < 2 weeks; no inspections completed yet |

**Priority:** `CRITICAL` > `AT_RISK` > `ATTENTION` > `NORMAL`. The most severe applicable tier is used.

### 2.3 PER Scorecard (Sanitized)

Per T01 §5.3: PER receives a sanitized version of the scorecard. The sanitized PER projection strips raw scores and replaces with bands:

```typescript
interface ISafetyScorecardPERProjection {
  projectId: string;
  computedAt: string;

  overallPosture: SafetyPosture;
  inspectionScoreBand: 'HIGH' | 'MED' | 'LOW' | null;    // HIGH=≥90, MED=70-89, LOW=<70
  trendDirection: 'IMPROVING' | 'STABLE' | 'DECLINING' | 'INSUFFICIENT_DATA';
  openCorrectiveActionCount: number;
  overdueCorrectiveActionCount: number;
  projectReadinessDecision: ReadinessDecision;
  activeBlockerCount: number;
  incidentCountThisMonth: number;                         // Count only; no details
  incidentTypeSummary: Record<IncidentType, number>;      // Count by type; anonymized
  ssspApproved: boolean;
}
```

No raw normalized scores, no individual incident details, no person names, no CA details exposed to PER.

---

## 3. Activity Spine Events

Safety Module events that publish to the cross-module activity spine:

| Event | Event Type | Actor | Visibility |
|---|---|---|---|
| SSSP base plan submitted for approval | `SSSP_SUBMITTED_FOR_APPROVAL` | Safety Manager | Project team |
| SSSP base plan approved | `SSSP_APPROVED` | System (all approvers signed) | Project team |
| Inspection completed | `INSPECTION_COMPLETED` | Safety Manager | Project team |
| CRITICAL corrective action created | `CRITICAL_CA_CREATED` | Safety Manager / System | Project team + PM |
| Corrective action closed | `CORRECTIVE_ACTION_CLOSED` | Safety Manager | Project team |
| Incident reported | `INCIDENT_REPORTED` | Safety Manager | Tier-dependent (see T05 §2.3) |
| JHA approved | `JHA_APPROVED` | Safety Manager | Project team |
| Subcontractor submission approved | `SUBCONTRACTOR_SUBMISSION_APPROVED` | Safety Manager | Project team |
| Subcontractor submission rejected | `SUBCONTRACTOR_SUBMISSION_REJECTED` | Safety Manager | Project team |
| Toolbox talk completed | `TOOLBOX_TALK_COMPLETED` | Safety Manager | Project team |
| Readiness decision changes | `READINESS_DECISION_CHANGED` | System | Project team + PM |
| Readiness override acknowledged | `READINESS_OVERRIDE_ACKNOWLEDGED` | System (all signers) | Project team + PM |
| SSSP addendum approved | `SSSP_ADDENDUM_APPROVED` | System (all approvers signed) | Project team |
| Orientation completed (subcontractor crew) | `CREW_ORIENTATION_COMPLETED` | Safety Manager | Project team |
| Certification expired (blocking scope) | `CERTIFICATION_EXPIRED_BLOCKING` | System | Safety Manager + PM |
| Worker orientation missing (pre-mobilization check) | `ORIENTATION_GAP_DETECTED` | System | Safety Manager |
| Override lapsed | `READINESS_OVERRIDE_LAPSED` | System | Safety Manager + PM |
| Inspection score DECLINING trend detected | `INSPECTION_TREND_DECLINING` | System | Safety Manager + PM |

---

## 4. Work Queue Rules

The Safety Module generates work queue items for `@hbc/my-work-feed`. All work queue items reference the source record ID, include a clear title and description, and specify the assignee(s).

### 4.1 Master Work Queue Rule Table

| Rule ID | Trigger | Item Title | Priority | Assignee(s) |
|---|---|---|---|---|
| WQ-SAF-01 | No SSSP record on a project that has mobilized | Create Site Specific Safety Plan | CRITICAL | Safety Manager |
| WQ-SAF-02 | SSSP in PENDING_APPROVAL, specific approver not signed | Sign SSSP for [Project] | HIGH | Unsigned approver |
| WQ-SAF-03 | No weekly inspection initiated in current ISO week (after mobilization) | Conduct weekly safety inspection | HIGH | Safety Manager |
| WQ-SAF-04 | Inspection IN_PROGRESS for > 48 hours | Complete in-progress safety inspection | MEDIUM | Safety Manager |
| WQ-SAF-05 | Inspection completed with normalized score < 70 | Review low safety inspection score | HIGH | Safety Manager + PM |
| WQ-SAF-06 | Inspection completed with CRITICAL CA generated | Respond to critical safety finding | CRITICAL | PM + Safety Manager |
| WQ-SAF-07 | CRITICAL CA OPEN for > 4 hours without IN_PROGRESS | Address critical safety corrective action | CRITICAL | Safety Manager + PM |
| WQ-SAF-08 | CRITICAL CA overdue (dueDate passed, not CLOSED) | OVERDUE: critical safety corrective action | CRITICAL | Safety Manager + PM |
| WQ-SAF-09 | MAJOR CA overdue | OVERDUE: safety corrective action | HIGH | Assigned party + Safety Manager |
| WQ-SAF-10 | MINOR CA overdue | OVERDUE: safety corrective action | MEDIUM | Assigned party |
| WQ-SAF-11 | CA in PENDING_VERIFICATION for > 2 business days | Verify corrective action completion | MEDIUM | Safety Manager |
| WQ-SAF-12 | Incident in UNDER_INVESTIGATION for > 5 business days (non-LITIGATED) | Complete incident investigation | HIGH | Safety Manager |
| WQ-SAF-13 | No toolbox talk record in current ISO week (after mobilization) | Conduct weekly toolbox talk | MEDIUM | Safety Manager |
| WQ-SAF-14 | Governed high-risk toolbox prompt issued but not closed within 7 days | Complete toolbox prompt closure | HIGH | Safety Manager |
| WQ-SAF-15 | Subcontractor expected on site with no safety submission in APPROVED state | Obtain subcontractor safety submissions | HIGH | Safety Manager |
| WQ-SAF-16 | Subcontractor submission in PENDING_REVIEW for > 5 business days | Review subcontractor safety submission | MEDIUM | Safety Manager |
| WQ-SAF-17 | Worker on site without completed orientation | Complete worker orientation | HIGH | Safety Manager |
| WQ-SAF-18 | Certification in EXPIRING_SOON state, required for active scope | Certification expiring — schedule renewal | HIGH | Safety Manager |
| WQ-SAF-19 | Certification EXPIRED, required for active scope | Certification expired — action required | CRITICAL | Safety Manager |
| WQ-SAF-20 | Competent-person designation EXPIRED with active JHA requiring it | Re-designate competent person | CRITICAL | Safety Manager |
| WQ-SAF-21 | Project HARD blocker active (NOT_READY) | Resolve safety readiness blocker | CRITICAL | Safety Manager |
| WQ-SAF-22 | Subcontractor HARD blocker active with workers on site | Subcontractor safety clearance required | CRITICAL | Safety Manager |
| WQ-SAF-23 | Activity-level HARD blocker active, work scheduled | Activity blocked: safety condition unresolved | CRITICAL | Safety Manager + PM |
| WQ-SAF-24 | Readiness override approaching expiration (< 4 hours) | Safety override expiring — review status | HIGH | Safety Manager + PM |
| WQ-SAF-25 | SSSP older than 365 days without formal review action | Review SSSP currency | MEDIUM | Safety Manager |

### 4.2 Work Queue Item Resolution Triggers

| Work Queue Item Type | Resolution Trigger |
|---|---|
| Inspection conduct items (WQ-SAF-03, WQ-SAF-04) | Inspection reaches COMPLETED status |
| CA items (WQ-SAF-06 through WQ-SAF-11) | CA reaches CLOSED or VOIDED |
| Toolbox talk items (WQ-SAF-13, WQ-SAF-14) | Toolbox talk reaches COMPLETE; prompt closure confirmed |
| Subcontractor items (WQ-SAF-15, WQ-SAF-16) | Submission reaches APPROVED |
| Orientation items (WQ-SAF-17) | Orientation record created with COMPLETE status |
| Certification items (WQ-SAF-18, WQ-SAF-19, WQ-SAF-20) | Certification status returns to ACTIVE; or designation re-evaluated |
| Readiness blocker items (WQ-SAF-21, WQ-SAF-22, WQ-SAF-23) | Blocker condition resolved or exception accepted |
| Override expiration (WQ-SAF-24) | Override renewed, revoked, or expired |

---

## 5. `@hbc/related-items` Integration

Safety records participate in the related-items registry with the following declared relationship types:

| Record A | Relationship Type | Record B |
|---|---|---|
| `ISafetyCorrectiveAction` | ORIGINATED_FROM | `ICompletedInspection` |
| `ISafetyCorrectiveAction` | ORIGINATED_FROM | `IIncidentRecord` |
| `ISafetyCorrectiveAction` | ORIGINATED_FROM | `IJhaRecord` |
| `IIncidentRecord` | GENERATED | `ISafetyCorrectiveAction` |
| `IJhaRecord` | GOVERNS | `IDailyPreTaskPlan` |
| `IWeeklyToolboxTalkRecord` | FULFILLS | `IToolboxTalkPrompt` (issuance) |
| `ICompetentPersonDesignation` | QUALIFIES_FOR | `IJhaRecord` |
| `ISSSPAddendum` | AMENDS | `ISiteSpecificSafetyPlan` |

These relationships are registered in the `@hbc/related-items` declarative relationship registry. Safety module records surface related items in the sidebar of the Safety workspace detail views.

---

## 6. Reports Workspace

The Safety Module exposes a governed reports workspace. Available reports:

| Report | Description | Audience |
|---|---|---|
| Weekly Safety Summary | Inspection score, CAs opened/closed, readiness posture, toolbox talk completion — for current week | Safety Manager, PM, Superintendent |
| Inspection History | All completed inspections with scores, section breakdowns, and CA counts | Safety Manager |
| Corrective Action Aging Report | All open CAs by severity, age, assignee, subcontractor | Safety Manager, PM |
| Incident Register | All incidents by type, date, status, CA count — privacy tier enforced in output | Safety Manager; limited version for PM |
| Subcontractor Compliance Summary | Submission status, certification status, orientation completion rate per subcontractor | Safety Manager |
| Safety Trend Report | 4-week or 12-week inspection score trend with corrective action overlay | Safety Manager, PM |
| SSSP Version History | Base plan versions, addendum history, approval records | Safety Manager |

All reports are generated on-demand. No scheduled report distribution in Phase 3. Report data respects privacy tier enforcement — incident reports generated for PM-level access are automatically filtered per SENSITIVE/RESTRICTED privacy rules.

---

## 7. `@hbc/workflow-handoff` Integration

Safety module uses `@hbc/workflow-handoff` for transitions that require explicit role-to-role handoff:

| Scenario | From Role | To Role | Handoff Reason |
|---|---|---|---|
| SSSP submitted for PM signature | Safety Manager | PM | Approval required |
| SSSP submitted for Superintendent signature | Safety Manager | Superintendent | Approval required |
| Corrective action submitted for verification | Assigned party | Safety Manager | Verification required |
| Subcontractor submission to Safety Manager review | System (on upload) | Safety Manager | Review required |
| Readiness override request | PM | Safety Manager | Acknowledgment required |
| JHA submitted for Safety Manager approval | Contributor | Safety Manager | Approval required |

---

## 8. `@hbc/bic-next-move` Next-Move Prompts

Safety workspace next-move prompts registered with `@hbc/bic-next-move`:

| Context | Prompt | Condition |
|---|---|---|
| Safety workspace opened, no SSSP | "Create your Site Specific Safety Plan to establish the project safety foundation" | No SSSP record |
| Safety workspace opened, inspection overdue | "Weekly inspection for [project] is overdue — conduct inspection now" | No inspection in current week |
| Safety workspace opened, CRITICAL CA open | "Critical corrective action requires immediate attention" | CRITICAL CA in OPEN state |
| Safety workspace opened, READY_WITH_EXCEPTION | "Review active safety exceptions for [project]" | Active exceptions exist |
| Safety workspace opened, subcontractor NOT_READY | "Subcontractor [name] has unresolved safety compliance issues" | Subcontractor HARD blocker |
| Inspection just completed | "Review generated corrective actions from today's inspection" | CAs generated from most recent inspection |
| After SSSP approval | "Issue toolbox talk topic for project mobilization" | First toolbox talk record not yet created |

---

## 9. Locked Decisions Reinforced in This File

| Decision | Reinforced Here |
|---|---|
| 2 — Scorecard and trend to Project Hub; execution in Safety workspace | §1, §2 |
| 37 — PER/executive visibility tiered | §2.3 |
| 39 — Composite scorecard combines inspection trend, CAs, readiness, blockers, compliance | §2.1 |

---

*[← T08](P3-E8-T08-Readiness-Evaluation-Blocker-Matrix-and-Override-Workflow.md) | [Master Index](P3-E8-Safety-Module-Field-Specification.md) | [T10 →](P3-E8-T10-Implementation-and-Acceptance.md)*
