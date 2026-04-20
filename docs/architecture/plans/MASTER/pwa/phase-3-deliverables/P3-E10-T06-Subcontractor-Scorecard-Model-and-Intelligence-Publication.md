# P3-E10-T06 — Subcontractor Scorecard Model and Subcontractor Intelligence Publication

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E10-T06 |
| **Parent** | [P3-E10 Project Closeout Module](P3-E10-Project-Closeout-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T06 of 11 |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-24 |
| **Status** | Governing — locked architecture |

---

## 1. Scorecard Architecture Overview

### 1.1 Two Evaluation Types

The scorecard model supports two evaluation types per subcontractor per project:

| Type | Code | Cardinality | Purpose | Org publication |
|---|---|---|---|---|
| Interim | `Interim` | 0+ per sub per project | Mid-project performance tracking; early warning; course correction | Not eligible by default |
| Final Closeout | `FinalCloseout` | Exactly 1 per sub per project | Definitive performance record for org intelligence | Eligible — requires PE approval |

**Governing rule:** Interim evaluations are project-scoped records. They remain visible only within the project team unless PE explicitly grants a publication exception (edge case: sub defaulted mid-project; no FinalCloseout will exist). The FinalCloseout evaluation is the primary published intelligence record.

### 1.2 Relationship to ARCHIVE_READY Gate

Every sub that received contract value must have a `FinalCloseout` scorecard in `PE_APPROVED` state before the project can reach `ARCHIVE_READY`. This is enforced at the gate check (T04 §4.3 criterion 5). There is no bypass without PE documented exception.

---

## 2. Scoring Model

### 2.1 Universal 5-Point Scale

| Score | Label | Definition |
|---|---|---|
| 5 | Exceptional | Significantly exceeded expectations; set a standard for excellence |
| 4 | Above Average | Exceeded expectations; minor issues resolved quickly |
| 3 | Satisfactory | Met expectations; acceptable performance within contract scope |
| 2 | Below Average | Partially met expectations; recurring issues; required GC intervention |
| 1 | Unsatisfactory | Failed to meet expectations; serious deficiencies; would not re-bid |
| NA | Not Applicable | Criterion not applicable to this sub's scope; excluded from section average |

### 2.2 Section Weights

| Section key | Label | Weight | Criteria count | Per-criterion weight |
|---|---|---|---|---|
| `Safety` | Safety & Compliance | 0.20 | 5 | 0.20 |
| `Quality` | Quality of Work | 0.20 | 5 | 0.20 |
| `Schedule` | Schedule Performance | 0.20 | 5 | 0.20 |
| `CostMgmt` | Cost Management | 0.15 | 5 | 0.20 |
| `Communication` | Communication & Management | 0.15 | 5 | 0.20 |
| `Workforce` | Workforce & Labor | 0.10 | 4 | 0.25 |

Total weight: 1.00. Total criteria: 28.

### 2.3 Complete Criterion Reference

**Safety & Compliance (weight 0.20)**

| # | Criterion | Evidence guidance |
|---|---|---|
| S1 | Adherence to site safety plan and OSHA standards | Incidents, near-misses, OSHA citations, safety observations |
| S2 | PPE compliance and toolbox-talk participation | Attendance records, field observations, sign-in sheets |
| S3 | Housekeeping and site cleanliness | Daily clean standards, lay-down areas, debris removal |
| S4 | Incident / injury rate on this project | TRIR, recordables, first-aid events |
| S5 | Corrective action response to safety issues | Days to close NCRs, safety violation response time |

**Quality of Work (weight 0.20)**

| # | Criterion | Evidence guidance |
|---|---|---|
| Q1 | Workmanship quality and craftsmanship | Punch list density, rework areas, GC observations |
| Q2 | Compliance with plans, specs, and approved submittals | RFI frequency from their scope; revision compliance |
| Q3 | First-time inspection pass rate | AHJ and third-party inspection results |
| Q4 | Materials and equipment quality | Substitution requests, as-specified compliance |
| Q5 | Closeout documentation completeness | O&Ms, warranties, as-builts, attic stock, cert letters |

**Schedule Performance (weight 0.20)**

| # | Criterion | Evidence guidance |
|---|---|---|
| Sc1 | On-time mobilization | Actual vs. planned start date |
| Sc2 | 3-week look-ahead participation and reliability | % commitments kept (Last Planner or equivalent) |
| Sc3 | Progress relative to baseline schedule | Float consumption, milestone compliance |
| Sc4 | Recovery effort when behind schedule | Added crew, extended hours, phasing coordination |
| Sc5 | Trade coordination with other subs | BIM and pre-construction coordination, field conflicts |

**Cost Management (weight 0.15)**

| # | Criterion | Evidence guidance |
|---|---|---|
| C1 | Budget adherence — no unwarranted overruns | CO volume relative to genuine scope growth |
| C2 | Change order pricing accuracy and timeliness | Days to submit COs; pricing reasonableness |
| C3 | Back-charge exposure created | Back-charges assessed by GC |
| C4 | Material procurement and financial stability | No stoppages from unpaid suppliers |
| C5 | Billing accuracy and schedule of values quality | Overbilling instances; retainage disputes |

**Communication & Management (weight 0.15)**

| # | Criterion | Evidence guidance |
|---|---|---|
| M1 | Responsiveness to RFIs, emails, and calls | Average response time; dropped items |
| M2 | Quality of superintendent / foreman leadership | Decision authority; problem ownership; escalation |
| M3 | Submittals: accuracy, completeness, timeliness | Resubmittal rate; lead times met |
| M4 | Participation in OAC and coordination meetings | Attendance; action item closure |
| M5 | Issue escalation and conflict resolution | Transparent communication vs. avoidance |

**Workforce & Labor (weight 0.10)**

| # | Criterion | Evidence guidance |
|---|---|---|
| W1 | Adequate and consistent crew staffing | Planned vs. actual headcount |
| W2 | Workforce skill level and supervision ratio | Journeyman/apprentice mix; field leadership quality |
| W3 | Compliance with labor requirements | MBE/DBE, prevailing wage, union requirements if applicable |
| W4 | Sub-tier sub management | Sub-tier oversight, insurance, payment verification |

---

## 3. Scoring Formulas

### 3.1 Section Average

```
sectionAvg =
  Σ(score × criterionWeight  FOR each criterion WHERE isNA = false)
  ÷ Σ(criterionWeight        FOR each criterion WHERE isNA = false)
```

- Rounded to 2 decimal places.
- If all criteria in a section are NA: `sectionAvg = null`; section excluded from overall calculation.

### 3.2 Overall Weighted Score

```
overallWeightedScore =
  Σ(sectionAvg × sectionWeight  FOR each section WHERE sectionAvg ≠ null)
```

- Rounded to 2 decimal places.
- Range: 1.00–5.00 when computable.
- If no section yields a calculable average: `overallWeightedScore = null`; form cannot be submitted.

### 3.3 Performance Rating Derivation

`performanceRating` is **system-derived** from `overallWeightedScore`. Not user-selectable.

| Score range | Rating |
|---|---|
| 4.50 – 5.00 | `Exceptional` |
| 3.50 – 4.49 | `AboveAverage` |
| 2.50 – 3.49 | `Satisfactory` |
| 1.50 – 2.49 | `BelowAverage` |
| 1.00 – 1.49 | `Unsatisfactory` |

---

## 4. Evaluation Workflow

### 4.1 Creating a Scorecard

1. PM or SUPT opens the Subcontractor Scorecard sub-surface.
2. Creates a new scorecard: enters sub name, trade scope, contract value, evaluation type (Interim or FinalCloseout), and evaluation date.
3. System validates uniqueness: if `FinalCloseout` for this sub + project already exists, API returns 409 Conflict with message: "A FinalCloseout evaluation already exists for [Sub Name] on this project."
4. System instantiates 6 `ScorecardSection` records and 28 `ScorecardCriterion` records from the governed template.
5. Evaluator scores each criterion (1–5) or marks NA. Section averages and overall weighted score update in real time.
6. Evaluator fills in narrative fields and `reBidRecommendation`.

### 4.2 Submission

1. Evaluator clicks Submit.
2. API validates: `overallWeightedScore` is non-null; `reBidRecommendation` is set; `evaluationDate ≤ today`.
3. Record transitions to `publicationStatus = SUBMITTED`. Record locked.
4. PM and Superintendent sign-off timestamps recorded via `@hbc/acknowledgment`.
5. For `FinalCloseout` type: Work Queue item raised for PE: "[Project Name] — FinalCloseout scorecard for [Sub] requires PE review."

### 4.3 PE Review

1. PE opens scorecard from Work Queue.
2. PE may annotate any section, criterion, or narrative field via `@hbc/field-annotations`. Annotations do not modify scores.
3. PE may request revision: `publicationStatus → REVISION_REQUIRED`. PM receives Work Queue item. PM must create a new scorecard (interim evaluations cannot be "un-submitted"; a new FinalCloseout requires PE exception approval to replace an existing one — see §4.5).
4. PE approves: `publicationStatus → PE_APPROVED`.
5. Approval triggers: `SCORECARDS_COMPLETE` milestone check re-evaluated; if all subs now have PE_APPROVED FinalCloseout, milestone transitions to `APPROVED`.

### 4.4 Org Index Publication

At project `ARCHIVED` state:
1. All `FinalCloseout` scorecards with `publicationStatus = PE_APPROVED` are published.
2. System creates `SubIntelligenceIndexEntry` for each (provenance + intelligence payload per T02 §3.1).
3. Entry is immutable in org index.
4. `publicationStatus → PUBLISHED`.
5. `closeout.scorecard-published` event emitted.

### 4.5 FinalCloseout Amendment (Edge Case)

If PE approves a FinalCloseout and subsequently determines scores should be revised:

- Once `PE_APPROVED`, no edit is permitted.
- PE must annotate the record with the correction context via `@hbc/field-annotations`.
- A new FinalCloseout evaluation may be created for the same sub only with explicit PE authorization (PE sets `allowAmendment = true` on the existing record, which unlocks creation of a new FinalCloseout).
- The original FinalCloseout is transitioned to `SUPERSEDED`.
- The new FinalCloseout goes through the full submission/PE approval workflow.

---

## 5. Visibility and Role-Based Access

### 5.1 Project-Scoped Access

| Action | PM | SUPT | PE | PER |
|---|---|---|---|---|
| Create Interim scorecard | Yes | Yes | No | No |
| Create FinalCloseout scorecard | Yes | Yes | No | No |
| Score criteria | Yes | Yes | No | No |
| Submit scorecard | Yes | Yes | No | No |
| Sign off on submission | Yes | Yes | No | No |
| View project scorecards | Yes | Yes | Yes | Yes |
| Annotate via `@hbc/field-annotations` | No | No | Yes | Yes |
| Approve for org publication | No | No | **Yes** | No |

### 5.2 Interim Evaluation Publication Exception

PE may grant a publication exception for an interim evaluation (e.g., sub defaulted mid-project):

1. PE sets `eligibleForPublication = true` on the interim scorecard and provides an annotation explaining the exception.
2. The org index entry is flagged: `isInterimException = true`.
3. UI renders the entry in the SubIntelligence index with a visible badge: "Interim evaluation — project context available."
4. This exception is rare and requires PE deliberate action. It cannot be triggered by PM.

### 5.3 Org-Wide Access (SubIntelligence Index)

See T09 for the full visibility matrix. Summary:

| User type | Access |
|---|---|
| PE, PER, MOE | Full SubIntelligence index access; all fields including narratives |
| `SUB_INTELLIGENCE_VIEWER` grant | Access to sub name, trade, scores, rating, reBid recommendation; no narratives, no financial data |
| All other Project Hub users | No SubIntelligence access |

### 5.4 Project Hub Vetting Surface

When a Project Hub user with `SUB_INTELLIGENCE_VIEWER` access is evaluating a sub for award:

1. User searches by sub name or registered `subcontractorId`.
2. System queries `SubIntelligence` index and returns matching entries sorted by `evaluationDate DESC`.
3. Display: sub name, trade scope, market sector, project size, eval date, section scores (5 bars), overall score, rating badge, reBid recommendation.
4. User cannot see source project financial data, raw narratives, or individual criterion comments.
5. User can navigate to the source project's Closeout module (read-only) if they have project access.
6. No mutation is possible from this surface.

**Key rule:** SubIntelligence data informs a vetting decision — it does not make it. The user is expected to exercise professional judgment, particularly for entries with low scores or mixed histories.

---

## 6. TypeScript Enums

```typescript
enum EvaluationType {
  Interim = 'Interim',
  FinalCloseout = 'FinalCloseout',
}

enum ReBidRecommendation {
  Yes = 'Yes',
  YesWithConditions = 'YesWithConditions',
  No = 'No',
}

enum PerformanceRating {
  Exceptional = 'Exceptional',
  AboveAverage = 'AboveAverage',
  Satisfactory = 'Satisfactory',
  BelowAverage = 'BelowAverage',
  Unsatisfactory = 'Unsatisfactory',
}
```

---

*[← T05](P3-E10-T05-Lessons-Learned-Operating-Model-and-Intelligence-Publication.md) | [Master Index](P3-E10-Project-Closeout-Module-Field-Specification.md) | [T07 →](P3-E10-T07-Project-Autopsy-and-Learning-Legacy.md)*
