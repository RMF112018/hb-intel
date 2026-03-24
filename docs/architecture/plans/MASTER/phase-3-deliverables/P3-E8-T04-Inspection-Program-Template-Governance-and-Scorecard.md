# P3-E8-T04 — Inspection Program, Template Governance, Scoring, and Scorecard

**Doc ID:** P3-E8-T04
**Parent:** P3-E8 Safety Module — Master Index
**Phase:** 3
**Workstream:** E — Data Models and Field Specifications
**Part:** 4 of 10
**Owner:** Architecture
**Last Updated:** 2026-03-23

---

## 1. Inspection Program Overview

The Safety Module's inspection program is the **Safety Manager's program**, not a project team activity. Weekly inspections are completed exclusively by the Safety Manager or Safety Officer. The project team sees results, receives corrective action assignments, and is responsible for resolution — but does not conduct inspections.

### 1.1 Design Decisions

| Decision | Detail |
|---|---|
| Decision 2 | Scorecard and trend published to Project Hub; checklist execution in Safety workspace |
| Decision 3 | Weekly inspections completed by Safety Manager, not project team |
| Decision 8 | Weekly checklist templates are governed and versioned |
| Decision 9 | Every completed inspection is tied to the exact template/scoring version used |
| Decision 10 | Project Hub consumes immutable per-inspection summary projections |
| Decision 38 | Weekly inspection scoring normalizes for applicable sections only |

---

## 2. Inspection Checklist Template Governance

### 2.1 Template Lifecycle

Inspection checklist templates are created, versioned, and retired by the Safety Manager. No project team member can modify a template.

```
DRAFT → ACTIVE → RETIRED
         ▲
         │ (new version created; prior version remains ACTIVE until explicitly retired)
```

When a template is revised:
- A new template record is created with `templateVersion` incremented
- The prior version remains `ACTIVE` until the Safety Manager explicitly retires it
- In-progress inspections using the prior version may complete against their pinned version
- New inspections created after the new version is ACTIVE use the new version by default

### 2.2 Standard 12-Section Inspection Template

The Safety Module ships with a standard governed 12-section template. The Safety Manager may customize items within sections and adjust scoring weights, but the 12-section structure is the reference baseline.

| # | Section Key | Section Name | Default Weight |
|---|---|---|---|
| 1 | `housekeeping` | Housekeeping and General Site Conditions | 10% |
| 2 | `ppe` | Personal Protective Equipment | 10% |
| 3 | `fall_protection` | Fall Protection | 12% |
| 4 | `scaffolding` | Scaffolding and Elevated Work Platforms | 8% |
| 5 | `electrical` | Electrical Safety and Temporary Power | 8% |
| 6 | `excavation_trenching` | Excavation and Trenching | 8% |
| 7 | `fire_prevention` | Fire Prevention and Hot Work | 7% |
| 8 | `tools_equipment` | Tools and Equipment | 7% |
| 9 | `materials_storage` | Materials Storage and Handling | 6% |
| 10 | `cranes_rigging` | Cranes, Rigging, and Heavy Equipment | 8% |
| 11 | `hazmat_hazcom` | Hazardous Materials and HazCom | 8% |
| 12 | `emergency_access` | Emergency Access, Signage, and First Aid | 8% |

**Total: 100%.** The Safety Manager may redistribute weights across sections when project conditions warrant (e.g., excavation-heavy project may increase section 6 weight). All redistributions must still total 100%.

### 2.3 Applicability Rules

Not all sections apply to all project phases. The template supports `applicableSectionLogic` — a governed set of rules that determines when a section is marked Not Applicable (N/A).

```typescript
interface IApplicabilityRule {
  sectionKey: string;
  condition: ApplicabilityCondition;     // 'PROJECT_PHASE' | 'ACTIVITY_PRESENT' | 'ALWAYS_APPLICABLE' | 'SAFETY_MANAGER_OVERRIDE'
  conditionValue: string | null;         // e.g., 'DEMOLITION' | 'EXCAVATION_ACTIVE'
  notesRequired: boolean;                // True: Safety Manager must note why section is N/A
}
```

Per Decision 38: normalized score uses only applicable sections. If a project has no cranes on site, section 10 is marked N/A. The score is computed over the remaining 11 applicable sections, reweighted proportionally.

### 2.4 Version Pinning

At the moment a new `ICompletedInspection` record is created (status: `IN_PROGRESS`), the current ACTIVE template version is pinned to that inspection:
- `templateId` = the governing template record ID
- `templateVersion` = the template version at creation time
- These fields are immutable after the inspection record is created

This ensures every completed inspection is an accurate record of what was evaluated against which criteria and weights, regardless of subsequent template changes.

---

## 3. Inspection Execution Workflow

### 3.1 Execution Sequence

1. Safety Manager initiates a new inspection (creates `ICompletedInspection` with `status: IN_PROGRESS`)
2. System pins the current ACTIVE template version
3. Safety Manager walks the site, completing each applicable section's items
4. For each item:
   - Records response (PASS / FAIL / N/A based on `responseType`)
   - For FAIL responses: adds notes (required), optionally captures evidence, generates corrective action if `requiresCorrectiveActionOnFail = true`
5. Safety Manager marks each section complete
6. Safety Manager completes the inspection (`status: COMPLETED`)
7. System computes normalized score, sets `applicableSectionCount`, `rawScore`, `maxPossibleScore`, `normalizedScore`
8. System publishes immutable `IInspectionScorecardSnapshot` to Project Hub

### 3.2 Section Response Record

```typescript
interface IInspectionSectionResponse {
  sectionKey: string;
  isApplicable: boolean;
  notApplicableReason: string | null;

  itemResponses: IInspectionItemResponse[];

  sectionScore: number | null;           // Null if not applicable
  sectionMaxScore: number | null;
  sectionNotes: string | null;
}

interface IInspectionItemResponse {
  itemKey: string;
  response: 'PASS' | 'FAIL' | 'N_A';
  numericValue: number | null;           // For NUMERIC_RATING items
  notes: string | null;                 // Required on FAIL
  correctiveActionId: string | null;    // Linked SCA if generated
  evidenceRecordIds: string[];
}
```

---

## 4. Scoring Model

### 4.1 Normalization Algorithm

```typescript
function computeInspectionScore(
  sectionResponses: IInspectionSectionResponse[],
  scoringWeights: ISectionScoringWeight[]
): {
  applicableSectionCount: number;
  rawScore: number;
  maxPossibleScore: number;
  normalizedScore: number;
} {
  const applicableSections = sectionResponses.filter(s => s.isApplicable);
  const applicableSectionCount = applicableSections.length;

  if (applicableSectionCount === 0) {
    return { applicableSectionCount: 0, rawScore: 0, maxPossibleScore: 0, normalizedScore: 0 };
  }

  // Get weights for applicable sections only
  const applicableWeights = scoringWeights
    .filter(w => applicableSections.some(s => s.sectionKey === w.sectionKey));

  // Renormalize weights to sum to 100 across applicable sections only
  const totalApplicableWeight = applicableWeights.reduce((sum, w) => sum + w.weight, 0);

  let rawScore = 0;
  let maxPossibleScore = 0;

  for (const section of applicableSections) {
    const weight = applicableWeights.find(w => w.sectionKey === section.sectionKey)!;
    const normalizedWeight = (weight.weight / totalApplicableWeight) * 100;

    const passCount = section.itemResponses.filter(i => i.response === 'PASS').length;
    const applicableItemCount = section.itemResponses.filter(i => i.response !== 'N_A').length;

    if (applicableItemCount > 0) {
      const sectionScore = (passCount / applicableItemCount) * normalizedWeight;
      rawScore += sectionScore;
    }
    maxPossibleScore += normalizedWeight;
  }

  const normalizedScore = maxPossibleScore > 0
    ? Math.round((rawScore / maxPossibleScore) * 1000) / 10  // One decimal place
    : 0;

  return { applicableSectionCount, rawScore, maxPossibleScore, normalizedScore };
}
```

### 4.2 Scorecard Snapshot (Published to Project Hub)

On inspection completion, the system creates an immutable `IInspectionScorecardSnapshot`:

```typescript
interface IInspectionScorecardSnapshot {
  inspectionId: string;
  projectId: string;
  inspectionDate: string;
  inspectionWeek: string;
  templateId: string;
  templateVersion: number;

  normalizedScore: number;               // 0–100
  applicableSectionCount: number;
  totalSectionCount: number;

  failedItemCount: number;
  naItemCount: number;

  correctiveActionsGeneratedCount: number;
  criticalCorrectiveActionsCount: number;

  sectionScoreSummary: ISectionScoreSummary[];
  publishedAt: string;
}

interface ISectionScoreSummary {
  sectionKey: string;
  sectionName: string;
  isApplicable: boolean;
  score: number | null;                  // Null if N/A
  failedItems: number;
}
```

The snapshot is immutable after publication. Project Hub renders the snapshot, not the live inspection record. This ensures Project Hub always has a consistent, point-in-time record even if inspection notes are edited post-completion.

---

## 5. Inspection Score Trend

### 5.1 Trend Computation

The composite safety scorecard (T09) includes an inspection score trend. The trend is computed from the rolling window of completed inspections for the project.

```typescript
interface IInspectionScoreTrend {
  projectId: string;
  computedAt: string;
  windowWeeks: number;                   // Default: 4-week rolling window
  dataPoints: IInspectionTrendDataPoint[];
  trendDirection: 'IMPROVING' | 'STABLE' | 'DECLINING' | 'INSUFFICIENT_DATA';
  latestScore: number | null;
  averageScore: number | null;
  lowestScoreInWindow: number | null;
}

interface IInspectionTrendDataPoint {
  inspectionWeek: string;
  normalizedScore: number;
  inspectionDate: string;
  inspectionId: string;
}
```

**Trend direction rules:**
- `INSUFFICIENT_DATA`: fewer than 2 inspections in window
- `IMPROVING`: average of most recent 2 inspections > average of prior inspections in window by ≥ 5 points
- `DECLINING`: average of most recent 2 inspections < average of prior inspections in window by ≥ 5 points
- `STABLE`: within ±5 points

### 5.2 Score Band for PER

Per T01 §5.3: PER receives a sanitized score band, not the raw normalized score.

| Band | Score Range |
|---|---|
| HIGH | ≥ 90 |
| MED | 70–89 |
| LOW | < 70 |

PER never receives the raw `normalizedScore` value — only the band.

---

## 6. Corrective Actions from Inspections

When an inspection item fails:

- If `requiresCorrectiveActionOnFail = true`: the API automatically creates a `ISafetyCorrectiveAction` record with `sourceType: 'INSPECTION'` and `sourceRecordId` pointing to the inspection
- The corrective action lands in the centralized Safety Corrective Action Ledger (T05)
- The corrective action ID is stored in both `IInspectionItemResponse.correctiveActionId` and `ICompletedInspection.correctiveActionIds`
- The Safety Manager assigns the corrective action to the responsible party
- Due date is set per severity: CRITICAL = same day; MAJOR = 3 business days; MINOR = 7 business days (Safety Manager may override)

---

## 7. Inspection Work Queue Items

| Trigger | Work Queue Item | Priority | Assignee |
|---|---|---|---|
| Current week has no inspection initiated | Conduct weekly safety inspection | HIGH | Safety Manager |
| Inspection is IN_PROGRESS for > 48 hours | Complete in-progress inspection | MEDIUM | Safety Manager |
| Inspection completed with CRITICAL corrective action | Respond to critical safety finding | CRITICAL | PM + Safety Manager |
| Inspection completed with score < 70 | Review low safety inspection score | HIGH | Safety Manager + PM |

---

## 8. Inspection Template Versioning — Impact on Historical Records

- Historical inspection records retain their pinned `templateId` and `templateVersion`
- Score trends compare normalized scores across different template versions; a version note is included in trend data points when the version differs from the current active version
- The Safety Manager may add a version-change note when retiring a template, visible in trend displays

---

## 9. Locked Decisions Reinforced in This File

| Decision | Reinforced Here |
|---|---|
| 2 — Scorecard and trend to Project Hub; execution in Safety workspace | §4.2, §5 |
| 3 — Weekly inspections completed by Safety Manager only | §1, §3.1 |
| 8 — Weekly checklist templates are governed and versioned | §2.1 |
| 9 — Every inspection tied to exact template/scoring version | §2.4 |
| 10 — Project Hub consumes immutable per-inspection summary projections | §4.2 |
| 38 — Scoring normalizes for applicable sections only | §4.1 |

---

*[← T03](P3-E8-T03-SSSP-Base-Plan-Addenda-and-Approval-Governance.md) | [Master Index](P3-E8-Safety-Module-Field-Specification.md) | [T05 →](P3-E8-T05-Corrective-Actions-Incidents-Evidence-and-Privacy.md)*
