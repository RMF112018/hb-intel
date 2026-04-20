# P3-E10-T02 — Record Families, Identity, Field Architecture, and Publication States

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E10-T02 |
| **Parent** | [P3-E10 Project Closeout Module](P3-E10-Project-Closeout-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T02 of 11 |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-24 |
| **Status** | Governing — locked architecture |

---

## 1. Record Family Overview and Relationships

```
ChecklistTemplate (MOE-governed, versioned)
  └─ CloseoutChecklist (1 per project)
       ├─ CloseoutChecklistSection (7 per checklist)
       │    └─ CloseoutChecklistItem (governed + overlay items)
       └─ CloseoutMilestone (13 per project)

SubcontractorScorecard (1+ per project × sub)
  ├─ ScorecardSection (6 per scorecard)
  │    └─ ScorecardCriterion (4–5 per section = 28 total)
  └─ [PE approval] → SubIntelligenceIndexEntry (org read model)

LessonEntry (rolling; 0+ per project)
  └─ LessonsLearningReport (synthesis container; 1 per project)
       └─ [PE approval] → LessonsIntelligenceIndexEntry (org read model)

AutopsyRecord (1 per project)
  ├─ AutopsySection (up to 12 thematic sections)
  ├─ AutopsyPreSurveyResponse (1 per invited participant)
  ├─ AutopsyFinding (0+ per autopsy; may span sections)
  │    └─ FindingEvidenceRef (cross-references to supporting records)
  ├─ AutopsyAction (0+ per autopsy)
  └─ LearningLegacyOutput (0+ per autopsy)
       └─ [PE approval] → LearningLegacyFeedEntry (org read model)
```

**Governing rule:** Org read model records (Class 2 in T01) are derived, not stored in the `@hbc/project-closeout` package. They are produced by the org intelligence layer responding to publication events. Closeout owns the source records; the org layer owns the derived indexes.

---

## 2. Publication State Model

All Closeout records eligible for org-wide publication use the same six-state model. The states govern both record mutability and org intelligence eligibility.

```
Draft → Submitted → PEReview → PEApproved → PublishedToOrgIndex
                         ↓                           ↓
                   RevisionRequired           Superseded (rare)
                         ↓
                       Draft

Any state → Archived (project close; never published if not approved)
```

| State | Code | Editable | Org eligible | Description |
|---|---|---|---|---|
| Draft | `DRAFT` | Yes | No | Working; PM/SUPT can edit freely |
| Submitted | `SUBMITTED` | No | No | PM submitted; locked for PE review; work queue item raised for PE |
| PE Review | `PE_REVIEW` | No | No | PE has opened for review; may annotate via `@hbc/field-annotations` |
| Revision Required | `REVISION_REQUIRED` | Yes (PM) | No | PE rejected; PM must revise and resubmit |
| PE Approved | `PE_APPROVED` | No | Yes | PE approved; eligible for org publication at archive event |
| Published to Org Index | `PUBLISHED` | No | — | Permanent; immutable; part of org intelligence |
| Superseded | `SUPERSEDED` | No | No | A newer publication from a later project overwrites this entry for the same sub (SubIntelligence only) |
| Archived | `ARCHIVED` | No | No | Project archived without PE approval; records preserved but not published |

### 2.1 Record-Level Publication State Applicability

| Record Family | Uses Publication States | Notes |
|---|---|---|
| `CloseoutChecklist` | No | Uses lifecycle state machine (T04); not publishable to org |
| `CloseoutChecklistItem` | No | Item-level result states only (T04) |
| `SubcontractorScorecard` (FinalCloseout) | **Yes** | Full 6-state model |
| `SubcontractorScorecard` (Interim) | Partial (`DRAFT`, `SUBMITTED`, `ARCHIVED`) | Not org-eligible by default |
| `LessonEntry` | **Yes** | Individual entries follow their parent report's publication state |
| `LessonsLearningReport` | **Yes** | Full 6-state model; gates individual entry publication |
| `AutopsyRecord` | **Yes** | Full 6-state model; gates LearningLegacyOutput publication |
| `LearningLegacyOutput` | **Yes** | Each output has independent PE approval within the autopsy |
| `AutopsyFinding` | No | Project-scoped; discoverable in org context only via `LearningLegacyOutput` references |
| `AutopsyAction` | No | Project-scoped; assigned to users via Work Queue; not publishable |

---

## 3. Lineage and Provenance Requirements

Every org intelligence record must carry full lineage from its source Closeout record.

### 3.1 SubIntelligenceIndexEntry Provenance

```typescript
interface SubIntelligenceIndexEntry {
  // Provenance
  indexEntryId: string;
  sourceProjectId: string;
  sourceProjectName: string;
  sourceProjectNumber: string;
  sourceScorecardId: string;
  sourceEvaluationType: 'FinalCloseout' | 'InterimException';
  publishedAt: datetime;
  publishedFromLifecycleState: 'ARCHIVED';       // Must be ARCHIVED — never earlier
  peApprovedBy: string;                           // userId
  peApprovedAt: datetime;
  isInterimException: boolean;                    // True if not FinalCloseout

  // Intelligence payload
  subcontractorName: string;
  subcontractorId: string | null;
  tradeScope: string;
  marketSector: MarketSector;
  projectSizeBand: ProjectSizeBand;
  deliveryMethod: DeliveryMethod;
  contractValue: number;                          // Visible to PE/MOE only
  finalCost: number | null;                       // Visible to PE/MOE only
  evaluationDate: date;
  safetyScore: number;
  qualityScore: number;
  scheduleScore: number;
  costMgmtScore: number;
  communicationScore: number;
  workforceScore: number;
  overallWeightedScore: number;
  performanceRating: PerformanceRating;
  reBidRecommendation: ReBidRecommendation;
  // Narratives — restricted: PE, PER, MOE only
  keyStrengths: string | null;
  areasForImprovement: string | null;
  notableIncidentsOrIssues: string | null;
}
```

### 3.2 LessonsIntelligenceIndexEntry Provenance

```typescript
interface LessonsIntelligenceIndexEntry {
  // Provenance
  indexEntryId: string;
  sourceProjectId: string;
  sourceProjectName: string;
  sourceProjectNumber: string;
  sourceLessonId: string;
  sourceReportId: string;
  publishedAt: datetime;
  publishedFromLifecycleState: 'ARCHIVED';
  peApprovedBy: string;
  peApprovedAt: datetime;

  // Intelligence payload (all fields broadly visible)
  category: LessonCategory;
  phaseEncountered: string;
  applicability: number;           // 1–5
  keywords: string[];
  situation: string;
  rootCause: string;
  recommendation: string;          // Must begin with action verb
  impactMagnitude: ImpactMagnitude;
  marketSector: MarketSector;
  deliveryMethod: DeliveryMethod;
  projectSizeBand: ProjectSizeBand;
  complexityRating: number;
  reportDate: date;
}
```

### 3.3 LearningLegacyFeedEntry Provenance

```typescript
interface LearningLegacyFeedEntry {
  // Provenance
  feedEntryId: string;
  sourceProjectId: string;
  sourceProjectName: string;
  sourceAutopsyId: string;
  sourceOutputId: string;
  publishedAt: datetime;
  peApprovedBy: string;
  peApprovedAt: datetime;

  // Intelligence payload
  outputType: LearningLegacyOutputType;
  title: string;
  summary: string;
  fullContent: string;
  actionableRecommendations: string[];
  targetAudience: string[];
  applicableProjectTypes: string[];   // sector + method + size tags
  tags: string[];                     // minimum 3
  recurrenceRiskSignals: RecurrenceRisk[];
}
```

---

## 4. Complete Field Architecture

### 4.1 CloseoutChecklist

| Field | Type | Req | Immutable after | Rule |
|---|---|---|---|---|
| `checklistId` | `string` | Yes | Creation | UUID; one per project |
| `projectId` | `string` | Yes | Creation | FK; unique constraint |
| `projectName` | `string` | Yes | Creation | Snapshot at instantiation |
| `projectNumber` | `string` | Yes | Creation | Snapshot at instantiation |
| `projectLocation` | `string` | No | — | Snapshot; null if absent |
| `projectType` | `string` | No | — | Snapshot; null if absent |
| `jurisdiction` | `enum` | Yes | Creation | `PBC` \| `Other`; governs Section 7 |
| `templateId` | `string` | Yes | Creation | FK to `ChecklistTemplate.templateId` |
| `templateVersion` | `string` | Yes | Creation | Semantic version; locked at instantiation |
| `lifecycleState` | `enum` | Yes | — | Full state machine per T04; not a flat status |
| `completionPercentage` | `number` | Yes | — | Derived; (Yes items / applicable items) × 100; N/A excluded |
| `createdAt` | `datetime` | Yes | Creation | System timestamp |
| `createdBy` | `string` | Yes | Creation | userId |
| `lastModifiedAt` | `datetime` | Yes | — | Updated on any child mutation |
| `lastModifiedBy` | `string` | No | — | userId |
| `notes` | `string` | No | — | Project-level notes |

### 4.2 CloseoutChecklistItem

Full metadata schema per T03. See T03 §3 for the complete governed item catalog including all metadata columns.

| Field | Type | Req | Immutable after | Rule |
|---|---|---|---|---|
| `itemId` | `string` | Yes | Creation | UUID |
| `sectionId` | `string` | Yes | Creation | FK to section |
| `itemNumber` | `string` | Yes | Creation | e.g., "3.11"; overlay items use `{section}.OL-{n}` |
| `itemDescription` | `string` | Yes | Creation (governed) | Governed items: immutable. Overlay: editable while Draft |
| `isGoverned` | `boolean` | Yes | Creation | `true` = baseline template; `false` = project overlay |
| `isRequired` | `boolean` | Yes | Creation | `true` = cannot be NA without documented justification |
| `responsibleRole` | `enum` | Yes | Creation | `PM` \| `SUPT` \| `PE` \| `OWNER` \| `AHJ` \| `ARCHITECT` \| `ENGINEER` \| `MOE` |
| `sourceBasis` | `string` | No | Creation | Regulatory reference, company policy, or contract clause |
| `lifecycleStageTrigger` | `enum` | Yes | Creation | `ALWAYS` \| `INSPECTIONS` \| `TURNOVER` \| `POST_TURNOVER` \| `FINAL_COMPLETION` \| `ARCHIVE_READY` |
| `hasDateField` | `boolean` | Yes | Creation | Item accepts a date when result = Yes |
| `hasEvidenceRequirement` | `boolean` | Yes | Creation | If true, notes/doc attachment recommended before Yes |
| `evidenceHint` | `string` | No | Creation | UI hint: "Attach letter from structural engineer" |
| `linkedModuleHint` | `string` | No | Creation | e.g., `permits`, `financial`, `safety` |
| `linkedRelationshipKey` | `string` | No | Creation | Registered key in `@hbc/related-items` registry for this item type |
| `isCalculated` | `boolean` | Yes | Creation | `true` = system-derived; user entry blocked |
| `calculationSource` | `string` | No | Creation | Human-readable formula (e.g., "item4.13.date + 80 days") |
| `spineEventOnCompletion` | `string` | No | Creation | Activity Spine event key emitted when this item = Yes |
| `milestoneGateKey` | `string` | No | Creation | If completion of this item gates a milestone, the `CloseoutMilestoneKey` |
| `result` | `enum` | Yes | — | `Yes` \| `No` \| `NA` \| `Pending` |
| `resultDate` | `datetime` | No | — | System timestamp on each result change |
| `itemDate` | `date` | No | — | User-entered date for date-tracked items |
| `calculatedDate` | `date` | No | — | Derived date (e.g., item 4.14) |
| `naJustification` | `string` | No | — | Required when `isRequired = true` and `result = NA` |
| `notes` | `string` | No | — | Item-level notes |
| `evidencePrefilled` | `boolean` | No | — | True when a related-items signal suggested readiness (but user must confirm) |

### 4.3 SubcontractorScorecard

| Field | Type | Req | Immutable after | Rule |
|---|---|---|---|---|
| `scorecardId` | `string` | Yes | Creation | UUID |
| `projectId` | `string` | Yes | Creation | FK to project |
| `subcontractorId` | `string` | No | — | FK to org sub registry if registered |
| `subcontractorName` | `string` | Yes | SUBMITTED | Display name; used for org index matching |
| `tradeScope` | `string` | Yes | SUBMITTED | Scope of work |
| `evaluationType` | `enum` | Yes | Creation | `Interim` \| `FinalCloseout` |
| `evaluationSequence` | `number` | Yes | Creation | Auto-assigned; 1 = first eval of this type for this sub on this project |
| `publicationStatus` | `enum` | Yes | — | 6-state model per §2 |
| `contractValue` | `number` | Yes | SUBMITTED | USD decimal 2 places |
| `finalCost` | `number` | No | — | USD; null until finalized |
| `scheduledCompletion` | `date` | Yes | SUBMITTED | ISO 8601 from contract |
| `actualCompletion` | `date` | No | — | ISO 8601; null if still working |
| `evaluatorUserId` | `string` | Yes | SUBMITTED | userId of primary evaluator |
| `evaluatorName` | `string` | Yes | SUBMITTED | Display name |
| `evaluatorTitle` | `string` | No | SUBMITTED | e.g., "Project Manager" |
| `evaluationDate` | `date` | Yes | SUBMITTED | ISO 8601; must be ≤ today |
| `reBidRecommendation` | `enum` | Yes | SUBMITTED | `Yes` \| `YesWithConditions` \| `No` |
| `overallWeightedScore` | `number` | No | — | Derived from section averages; rounded 2 dec |
| `performanceRating` | `enum` | No | — | Derived from score; see T06 §3.3 |
| `keyStrengths` | `string` | No | SUBMITTED | Rich text |
| `areasForImprovement` | `string` | No | SUBMITTED | Rich text |
| `notableIncidentsOrIssues` | `string` | No | SUBMITTED | Rich text |
| `overallNarrativeSummary` | `string` | No | SUBMITTED | Rich text |
| `pmSignedAt` | `datetime` | No | — | When PM signed |
| `superintendentSignedAt` | `datetime` | No | — | When SUPT signed |
| `peApprovedAt` | `datetime` | No | — | PE approval timestamp |
| `peApprovedBy` | `string` | No | — | userId |
| `publishedToOrgIndexAt` | `datetime` | No | — | Publication timestamp |
| `eligibleForPublication` | `boolean` | Yes | — | Default `true` for FinalCloseout; `false` for Interim unless PE exception |

### 4.4 LessonEntry

| Field | Type | Req | Immutable after | Rule |
|---|---|---|---|---|
| `lessonId` | `string` | Yes | Creation | UUID |
| `projectId` | `string` | Yes | Creation | FK to project |
| `reportId` | `string` | No | — | FK to `LessonsLearningReport` once synthesized; null during delivery |
| `lessonNumber` | `number` | Yes | Creation | Sequential within project; never reused |
| `category` | `enum` | Yes | PE_APPROVED | See T05 §2.1 |
| `phaseEncountered` | `string` | Yes | PE_APPROVED | Free-text project phase |
| `applicability` | `number` | Yes | PE_APPROVED | Integer 1–5 |
| `keywords` | `string[]` | No | — | Deduplicated array |
| `situation` | `string` | Yes | PE_APPROVED | Rich text; what/when/who |
| `impact` | `string` | Yes | PE_APPROVED | Rich text; quantified where possible |
| `impactMagnitude` | `enum` | Yes | — | **Derived** — not user-selected; see T05 §3 |
| `rootCause` | `string` | Yes | PE_APPROVED | Rich text |
| `response` | `string` | No | — | Rich text; corrective actions on this project |
| `recommendation` | `string` | Yes | PE_APPROVED | Rich text; MUST start with action verb |
| `supportingDocuments` | `string` | No | — | File refs, RFI/CO numbers, URLs |
| `publicationStatus` | `enum` | Yes | — | Follows parent `LessonsLearningReport` status |
| `createdAt` | `datetime` | Yes | Creation | System timestamp |
| `createdBy` | `string` | Yes | Creation | userId |
| `lastModifiedAt` | `datetime` | Yes | — | System timestamp |

### 4.5 LessonsLearningReport

| Field | Type | Req | Immutable after | Rule |
|---|---|---|---|---|
| `reportId` | `string` | Yes | Creation | UUID; one per project |
| `projectId` | `string` | Yes | Creation | FK; unique constraint |
| `originalContractValue` | `number` | Yes | SUBMITTED | USD decimal 2 |
| `finalContractValue` | `number` | Yes | SUBMITTED | USD decimal 2 |
| `contractVariance` | `number` | Yes | — | Derived: `final - original`; positive = overrun |
| `scheduledCompletion` | `date` | Yes | SUBMITTED | ISO 8601 |
| `actualCompletion` | `date` | Yes | SUBMITTED | ISO 8601 |
| `daysVariance` | `number` | Yes | — | Derived: `datediff(actual, scheduled)`; negative = early |
| `projectManager` | `string` | Yes | SUBMITTED | Display name |
| `superintendent` | `string` | No | SUBMITTED | Display name |
| `projectExecutive` | `string` | No | SUBMITTED | Display name |
| `reportPreparedBy` | `string` | Yes | SUBMITTED | userId |
| `reportDate` | `date` | Yes | SUBMITTED | ISO 8601 |
| `deliveryMethod` | `enum` | Yes | SUBMITTED | See T05 §2.2 |
| `marketSector` | `enum` | Yes | SUBMITTED | See T05 §2.2 |
| `projectSizeBand` | `enum` | Yes | SUBMITTED | See T05 §2.2 |
| `complexityRating` | `number` | Yes | SUBMITTED | Integer 1–5 |
| `entryCount` | `number` | Yes | — | Count of linked LessonEntry records |
| `publicationStatus` | `enum` | Yes | — | 6-state model per §2 |
| `peApprovedAt` | `datetime` | No | — | Null until approved |
| `peApprovedBy` | `string` | No | — | userId |
| `publishedToOrgIndexAt` | `datetime` | No | — | Null until published |

---

## 5. Autopsy Record Family

Full field architecture for Autopsy records is defined in T07. This section provides the identity model and key invariants for cross-reference.

### 5.1 Invariants

| Invariant | Rule |
|---|---|
| One autopsy per project | `AutopsyRecord` has unique constraint on `projectId` |
| PE leads | `leadFacilitatorUserId` defaults to PE; any delegation requires PE annotation |
| Findings are not lessons | `AutopsyFinding` is distinct from `LessonEntry`; findings may *reference* lessons by ID |
| Actions are not findings | `AutopsyAction` is a commitment created from a finding; findings may exist without actions |
| Outputs require individual PE approval | Each `LearningLegacyOutput` has its own `publicationStatus`; PE approves each independently |
| Publication requires ARCHIVE_READY | `LearningLegacyOutput` records cannot be published until the project reaches `ARCHIVED` lifecycle state |

### 5.2 Key Relationships to Other Records

| Source | Target | Relationship | Direction |
|---|---|---|---|
| `AutopsyFinding` | `LessonEntry` | `referencesLesson` | Finding → Lesson (read-only ref; does not modify lesson) |
| `AutopsyFinding` | `ScorecardCriterion` | `referencesCriterion` | Finding → Criterion (read-only ref) |
| `AutopsyAction` | `AutopsyFinding` | `derivedFrom` | Action → Finding (optional; may be cross-cutting) |
| `LearningLegacyOutput` | `AutopsyFinding` | `synthesizesFindings` | Output → Findings (many) |
| `LearningLegacyOutput` | `LessonEntry` | `synthesizesLessons` | Output → Lessons (many) |

---

## 6. Immutability Summary

| Record | Field category | Immutable from |
|---|---|---|
| `CloseoutChecklist` | Identity fields | Creation |
| `CloseoutChecklistItem` (governed) | All definition fields | Template instantiation |
| `CloseoutChecklistItem` | `result`, `itemDate`, `notes` | Never (until ARCHIVED) |
| `SubcontractorScorecard` | All score/narrative fields | `SUBMITTED` |
| `LessonEntry` | All content fields | `PE_APPROVED` |
| `LessonsLearningReport` | All header fields | `PE_APPROVED` |
| `AutopsyRecord` | Identity, facilitator | Creation |
| `AutopsyFinding` | All fields | `PE_APPROVED` on parent autopsy |
| `LearningLegacyOutput` | All fields | `PUBLISHED` |
| Org index entries | All fields | Creation (immutable; corrections require new project record) |

---

*[← T01](P3-E10-T01-Operating-Model-Scope-Surface-Map-SoT-Boundaries.md) | [Master Index](P3-E10-Project-Closeout-Module-Field-Specification.md) | [T03 →](P3-E10-T03-Closeout-Execution-Checklist-Template-Library-Overlay-Model.md)*
