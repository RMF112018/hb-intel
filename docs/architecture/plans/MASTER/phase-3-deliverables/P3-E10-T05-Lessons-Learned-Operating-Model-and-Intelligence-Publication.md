# P3-E10-T05 — Lessons Learned Operating Model and Lessons Intelligence Publication

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E10-T05 |
| **Parent** | [P3-E10 Project Closeout Module](P3-E10-Project-Closeout-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T05 of 11 |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-24 |
| **Status** | Governing — locked architecture |

---

## 1. Architecture Overview and Layer Model

Lessons Learned is a **standalone operational tool** — a rolling structured ledger of learning events captured throughout project delivery. It is not a terminal closeout artifact that is assembled at the end.

The lesson architecture has three distinct layers. These layers must not be collapsed:

| Layer | Record | When | Who creates | Purpose |
|---|---|---|---|---|
| **Raw learning ledger** | `LessonEntry` | Any project phase | PM, SUPT | Captures individual structured learning events as they occur |
| **Closeout synthesis container** | `LessonsLearningReport` | Closeout phase | PM | Assembles rolling entries; adds project-level context; packages for PE approval |
| **Institutional synthesis** | `AutopsyRecord` + `LearningLegacyOutput` | Closeout workshop | PE (lead), PM | Cross-cutting pattern analysis; feed-forward outputs (see T07) |

**Governing rule:** The `LessonsLearningReport` is **not** a separate synthesis artifact sitting alongside Autopsy. It is the approval and publication packaging container for the raw lesson ledger. The Autopsy is the deeper synthesis event that draws on the ledger. There is no "separate lessons synthesis report" layer between the ledger and the Autopsy.

### 1.1 What This Means for Implementation

- `LessonEntry` records can and should be created at any point — during bid, pre-con, framing, MEP rough-in, closeout.
- The `LessonsLearningReport` is created at closeout activation (or auto-created if entries already exist) as a packaging shell.
- The PM links all project `LessonEntry` records to the report, fills in project context fields, and submits.
- PE approves — this gates org index publication of the individual lesson entries.
- The Autopsy then draws on the approved lesson ledger as source material, creates its own `AutopsyFinding` records (not copies of lessons), and produces `LearningLegacyOutput` records as the institutional-level artifacts.
- Lessons and Autopsy findings are **distinct records**. An Autopsy finding may reference one or more lessons by ID but never copies or replaces them.

---

## 2. Lesson Category and Classification Enums

### 2.1 LessonCategory

```typescript
enum LessonCategory {
  PreConstruction = 'PreConstruction',      // Planning, scope, constructability, BIM, owner alignment
  EstimatingBid = 'EstimatingBid',          // Takeoffs, bid strategy, allowances, exclusions
  Procurement = 'Procurement',              // Lead times, sub selection, material escalation
  Schedule = 'Schedule',                    // CPM, float, look-ahead, milestone tracking
  CostBudget = 'CostBudget',               // Contingency, change orders, GMP risk, buyout
  Safety = 'Safety',                        // Incidents, near-misses, culture, PPE, compliance
  Quality = 'Quality',                      // Rework, punch list, inspections, mock-ups
  Subcontractors = 'Subcontractors',        // Sub selection, performance, default, contract clarity
  DesignRFIs = 'DesignRFIs',               // Design gaps, RFI volume, architect responsiveness
  OwnerClient = 'OwnerClient',             // Scope creep, decision latency, design freeze
  TechnologyBIM = 'TechnologyBIM',          // BIM clashes, drone, PM software, digital twins
  WorkforceLabor = 'WorkforceLabor',        // Productivity, craft shortage, overtime, union
  Commissioning = 'Commissioning',          // Startup, OAC sign-off, deficiencies, owner training
  CloseoutTurnover = 'CloseoutTurnover',   // As-builts, O&Ms, warranties, attic stock, COO
  Other = 'Other',                          // Novel, external events, doesn't fit above
}
```

### 2.2 Report-Level Enums

```typescript
enum DeliveryMethod {
  DesignBidBuild = 'DesignBidBuild',
  DesignBuild = 'DesignBuild',
  CMAtRisk = 'CMAtRisk',
  GMP = 'GMP',
  LumpSum = 'LumpSum',
  IDIQJobOrder = 'IDIQJobOrder',
  PublicPrivateP3 = 'PublicPrivateP3',
}

enum MarketSector {
  K12Education = 'K12Education',
  HigherEducation = 'HigherEducation',
  HealthcareMedical = 'HealthcareMedical',
  GovernmentCivic = 'GovernmentCivic',
  OfficeCommercial = 'OfficeCommercial',
  IndustrialMfg = 'IndustrialMfg',
  RetailHospitality = 'RetailHospitality',
  ResidentialMixedUse = 'ResidentialMixedUse',
  TransportationInfra = 'TransportationInfra',
  DataCenterTech = 'DataCenterTech',
  MissionCritical = 'MissionCritical',
  RenovationHistoric = 'RenovationHistoric',
  Other = 'Other',
}

enum ProjectSizeBand {
  Under1M = 'Under1M',
  OneToFiveM = 'OneToFiveM',
  FiveToFifteenM = 'FiveToFifteenM',
  FifteenToFiftyM = 'FifteenToFiftyM',
  FiftyToOneHundredM = 'FiftyToOneHundredM',
  OverOneHundredM = 'OverOneHundredM',
}

enum ImpactMagnitude {
  Minor = 'Minor',           // < $10K OR < 2 days
  Moderate = 'Moderate',     // $10K–$50K OR 2–10 days
  Significant = 'Significant', // $50K–$200K OR 10–30 days
  Critical = 'Critical',     // > $200K OR > 30 days
}
```

---

## 3. Impact Magnitude Derivation Engine

`impactMagnitude` is **system-derived and not user-selectable**. This is a strict business rule. The derivation logic must be implemented as a backend service, not as client-side JavaScript (to prevent bypass).

### 3.1 Derivation Rules

The backend parses the `impact` field text for quantified signals:

| Signal type | Detection pattern | Threshold assignment |
|---|---|---|
| Cost — dollar value | Regex for `$N`, `$Nm`, `$N thousand`, `$N million`, `N dollars` | Compare N to thresholds below |
| Cost — magnitude word | `"minor cost"`, `"significant cost"` | Conservative threshold assumed |
| Schedule — day count | Regex for `N days`, `N calendar days`, `N weeks` (× 5 for working days) | Compare N to thresholds below |
| Schedule — vague | `"minor delay"`, `"significant delay"`, `"project-defining"` | Conservative threshold assumed |

### 3.2 Threshold Table

| Magnitude | Cost condition | OR | Schedule condition |
|---|---|---|---|
| `Minor` | < $10,000 | OR | < 2 calendar days |
| `Moderate` | $10,000 – $50,000 | OR | 2 – 10 calendar days |
| `Significant` | $50,001 – $200,000 | OR | 11 – 30 calendar days |
| `Critical` | > $200,000 | OR | > 30 calendar days |

**Multi-signal rule:** If both cost and schedule signals are present, the higher magnitude governs.

**No signal present:** The save API returns a 422 with message: `"Impact field must contain a quantified cost (e.g., '$50,000') or schedule (e.g., '15 days') signal before saving. Please revise the impact statement."` The UI surfaces this as an inline validation error.

**PM cannot override:** If the PM believes the derived magnitude is wrong, the only remedy is to revise the impact text to include more accurate quantification.

---

## 4. Recommendation Validation

The `recommendation` field must begin with an approved action verb. This is enforced at the API boundary (422 returned on violation).

**Validation:** The first whitespace-delimited token of `recommendation.trim()` is checked against the controlled action verb list. Case-insensitive.

**Approved action verb list (non-exhaustive; MOE may extend):**

Assign, Audit, Build, Clarify, Codify, Conduct, Confirm, Create, Define, Deploy, Develop, Document, Ensure, Establish, Evaluate, Implement, Include, Incorporate, Mandate, Pilot, Prepare, Publish, Require, Review, Revise, Schedule, Standardize, Train, Update, Use, Validate, Verify.

**Error message on violation:** `"Recommendation must begin with an action verb (e.g., 'Establish...', 'Require...', 'Implement...'). Revise the recommendation to start with a directive."`

---

## 5. Lesson Entry Workflow

### 5.1 Rolling Capture (During Delivery)

1. PM or SUPT opens Lessons Learned sub-surface (accessible at any project lifecycle state).
2. Creates a new `LessonEntry`. `reportId = null` (not yet linked to synthesis container).
3. Fills in: `category`, `phaseEncountered`, `applicability`, `situation`, `impact`, `rootCause`, `recommendation`.
4. System validates impact magnitude. If no quantification found: 422, user must revise.
5. System validates recommendation action verb. If fails: 422.
6. Entry saved in `publicationStatus = DRAFT`.
7. Entry visible to PM, SUPT, PE on the project.

### 5.2 Closeout Synthesis

1. On closeout phase activation (or earlier if PM initiates), a `LessonsLearningReport` container is created.
2. PM reviews all `LessonEntry` records on the project, edits any that need refinement, and links them to the report by setting `reportId`.
3. Unlinked entries are flagged in the UI: "This lesson has not been included in the closeout report — include or archive?"
4. PM fills in report-level context: contract values, dates, delivery method, market sector, size band, complexity rating.
5. PM submits: `LessonsLearningReport.publicationStatus → SUBMITTED`. All linked entries: `publicationStatus → SUBMITTED`. Record locked.
6. Work Queue item raised for PE: "[Project Name] — Lessons Learned report submitted for review."

### 5.3 PE Review and Approval

1. PE opens the lessons report from their Work Queue.
2. PE may annotate individual entry fields via `@hbc/field-annotations` — these do not mutate entry content.
3. PE may request revision: `publicationStatus → REVISION_REQUIRED`. PM receives Work Queue item with PE's notes. PM revises entries, re-links if needed, and resubmits.
4. PE approves: `LessonsLearningReport.publicationStatus → PE_APPROVED`. All linked entries: `publicationStatus → PE_APPROVED`.
5. PE approval triggers:
   - Checklist item 6.5 auto-resolves to Yes.
   - `closeout.lessons-approved` Activity Spine event emitted.
   - `LESSONS_APPROVED` milestone transitions to `APPROVED`.

### 5.4 Org Index Publication

Publication to the `LessonsIntelligenceIndex` occurs at project archive:

1. Project reaches `ARCHIVED` lifecycle state.
2. System iterates over all `LessonEntry` records where `publicationStatus = PE_APPROVED`.
3. For each entry, creates a `LessonsIntelligenceIndexEntry` (provenance + intelligence payload per T02 §3.2).
4. Entries are immutable in the org index.
5. `LessonEntry.publicationStatus → PUBLISHED`.
6. `closeout.lessons-published` Activity Spine event emitted with count of published entries.

---

## 6. Business Rules

1. **Rolling capture:** Lesson entries may be created at any project lifecycle state. PM and SUPT do not need to wait for closeout phase.
2. **One report per project:** `LessonsLearningReport` enforces unique constraint on `projectId` at API level.
3. **Minimum one entry:** A `LessonsLearningReport` must have at least one linked `LessonEntry` before it may be submitted.
4. **All entries must be linked:** Unlinked entries are flagged; PM must either link them or explicitly archive them before report submission is accepted.
5. **Sequential numbering:** `LessonEntry.lessonNumber` is auto-assigned and never reused, even if entries are archived or removed from the report.
6. **PE approval gates item 6.5:** Checklist item 6.5 resolves only on `PE_APPROVED` — not on `SUBMITTED`. This is locked.
7. **Immutability after PE approval:** All `LessonEntry` content fields and the `LessonsLearningReport` header fields are immutable after `PE_APPROVED`.
8. **Keyword deduplication:** Keywords are stored as a deduplicated string array; stored normalized (lowercase, trimmed).
9. **Reports module consumption:** Reports module receives a frozen snapshot (per §7 below) — it does not read live lesson records.

---

## 7. Reports Module Snapshot Contract

When P3-E9 Reports generates a `lessons-learned` PDF artifact, it calls the Closeout snapshot API:

```
GET /api/closeout/{projectId}/lessons/snapshot
Authorization: PE role required
Precondition: LessonsLearningReport.publicationStatus ≥ PE_APPROVED
```

```typescript
interface LessonsLearnedPublicationSnapshot {
  snapshotId: string;
  projectId: string;
  generatedAt: datetime;
  reportId: string;
  peApprovedBy: string;
  peApprovedAt: datetime;
  reportHeader: {
    projectName: string;
    projectNumber: string;
    deliveryMethod: DeliveryMethod;
    marketSector: MarketSector;
    projectSizeBand: ProjectSizeBand;
    complexityRating: number;
    originalContractValue: number;
    finalContractValue: number;
    contractVariance: number;
    scheduledCompletion: date;
    actualCompletion: date;
    daysVariance: number;
    projectManager: string;
    superintendent: string | null;
    projectExecutive: string | null;
    reportDate: date;
  };
  entries: Array<{
    lessonNumber: number;
    category: LessonCategory;
    phaseEncountered: string;
    applicability: number;
    keywords: string[];
    situation: string;
    impact: string;
    impactMagnitude: ImpactMagnitude;
    rootCause: string;
    response: string | null;
    recommendation: string;
  }>;
  entryCount: number;
  aggregateStats: {
    categoryCounts: Record<LessonCategory, number>;
    magnitudeCounts: Record<ImpactMagnitude, number>;
    highApplicabilityCount: number;   // applicability >= 4
    criticalAndSignificantCount: number;
  };
}
```

The Reports module assembles the PDF from this frozen snapshot. It does not reach into operational Closeout records.

---

## 8. Relationship to Project Autopsy

| Lessons Learned | Project Autopsy |
|---|---|
| Raw learning ledger | Cross-cutting synthesis and institutional learning engine |
| PM and SUPT are primary operators | PE leads; PM coordinates |
| Entries are created throughout delivery | Autopsy occurs at closeout |
| Each entry is a discrete observed learning event | Findings synthesize patterns across multiple entries and other sources |
| PE approves for org publication as a package | PE approves each `LearningLegacyOutput` individually |
| Published to LessonsIntelligence index | Published to LearningLegacy feed |
| Individual lessons are searchable | Learning legacy outputs are browsable; tagging enables retrieval |

An `AutopsyFinding` may reference multiple `LessonEntry` records by ID (read-only cross-reference). It does not copy or duplicate lesson content. The Autopsy is the event that interprets the lessons; it does not replace them.

---

*[← T04](P3-E10-T04-Lifecycle-State-Machine-Milestones-Evidence-Gates-Approval-Rules.md) | [Master Index](P3-E10-Project-Closeout-Module-Field-Specification.md) | [T06 →](P3-E10-T06-Subcontractor-Scorecard-Model-and-Intelligence-Publication.md)*
