# P3-E10-T09 — Permissions, Visibility, Executive Review, and Role Matrix

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E10-T09 |
| **Parent** | [P3-E10 Project Closeout Module](P3-E10-Project-Closeout-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T09 of 11 |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-24 |
| **Status** | Governing — locked architecture |

---

## 1. Role Definitions

| Role Code | Display Name | Scope | Description |
|---|---|---|---|
| `PM` | Project Manager | Project-scoped | Primary operator; owns all Closeout operational execution; submits scorecards, lessons, and autopsy records for PE review |
| `SUPT` | Superintendent | Project-scoped | Field contributor; creates lesson entries and scorecard evaluations; marks checklist items within field scope; no approval authority |
| `PE` | Project Executive | Project-scoped + org | Formal approval authority at all milestone gates, all publication approvals, and org intelligence releases; also Autopsy workshop lead |
| `PER` | Portfolio Executive Reviewer | Read + annotate across assigned projects | Cross-project visibility and annotation; no mutation authority; no approval authority |
| `MOE` | Management of Execution / Admin | Org-wide | Governs template library, pre-survey templates, and `SUB_INTELLIGENCE_VIEWER` grant issuance; no project operational access |
| `SUB_INTELLIGENCE_VIEWER` | Sub Intelligence Viewer | Org-wide (read-only) | Explicit grant; enables access to SubIntelligence index excluding narratives and financial fields; does not inherit from general Project Hub access |

---

## 2. Master Role Matrix

The table below is the consolidated authority reference. Detailed per-surface matrices follow in §3.

### 2.1 Closeout Operational Actions

| Action | PM | SUPT | PE | PER | MOE |
|---|:---:|:---:|:---:|:---:|:---:|
| **Checklist** | | | | | |
| View checklist | ✓ | ✓ | ✓ | ✓ | — |
| Mark items Yes/No/NA | ✓ | ✓ (field scope) | — | — | — |
| Add overlay items | ✓ | — | — | — | — |
| **Scorecards** | | | | | |
| Create Interim or FinalCloseout scorecard | ✓ | ✓ | — | — | — |
| Score criteria | ✓ | ✓ | — | — | — |
| Submit scorecard | ✓ | ✓ | — | — | — |
| Sign off on submission | ✓ | ✓ | — | — | — |
| Approve FinalCloseout for org publication | — | — | **✓** | — | — |
| View project-scoped scorecards | ✓ | ✓ | ✓ | ✓ | — |
| **Lessons Learned** | | | | | |
| Create `LessonEntry` | ✓ | ✓ | — | — | — |
| Edit `LessonEntry` (Draft only) | ✓ | ✓ (own) | — | — | — |
| Submit `LessonsLearningReport` | ✓ | — | — | — | — |
| Approve lessons for org publication | — | — | **✓** | — | — |
| View project-scoped lessons | ✓ | ✓ | ✓ | ✓ | — |
| **Autopsy** | | | | | |
| Activate Autopsy sub-surface | ✓ | — | ✓ | — | — |
| Issue pre-survey | — | — | **✓** | — | — |
| Log findings and actions | ✓ | — | ✓ | — | — |
| Create `LearningLegacyOutput` | ✓ | — | ✓ | — | — |
| Approve `AutopsyRecord` | — | — | **✓** | — | — |
| Approve individual `LearningLegacyOutput` | — | — | **✓** | — | — |
| View autopsy detail | ✓ | — | ✓ | ✓ | — |
| **Lifecycle gates** | | | | | |
| Advance to `OWNER_ACCEPTANCE` (submit evidence) | ✓ submit | — | ✓ approve | — | — |
| Approve `ARCHIVE_READY` | — | — | **✓** | — | — |
| Trigger `ARCHIVED` | — | — | **✓** | — | — |
| **Annotations** | | | | | |
| Annotate any Closeout record | — | — | ✓ | ✓ | — |
| View PE annotations | ✓ | ✓ | ✓ | ✓ | — |
| View PER annotations | ✓ | — | ✓ | ✓ | — |
| **Template library** | | | | | |
| View checklist template | ✓ | — | ✓ | — | ✓ |
| Create / update / retire template version | — | — | — | — | **✓** |
| Manage pre-survey templates | — | — | — | — | **✓** |
| Issue `SUB_INTELLIGENCE_VIEWER` grant | — | — | ✓ | — | **✓** |

---

## 3. Visibility Model

### 3.1 Governing Principle

Two distinct visibility regimes apply to org intelligence derived from Closeout records:

| Intelligence class | Visibility regime | Rationale |
|---|---|---|
| `LessonsIntelligence` index | Broadly available — all internal Project Hub users | Lessons are professional knowledge that improves all future project delivery; no reputational or legal risk in broad availability |
| `SubIntelligence` index | Restricted — requires explicit role or grant | Subcontractor performance data carries reputational harm and legal exposure risk; access must be intentional, not inherited |
| `LearningLegacy` feed | Broadly available — all internal Project Hub users | Derived institutional knowledge; same visibility rationale as LessonsIntelligence |
| Project-scoped operational records | Project team only (PM, SUPT, PE on project; PER in scope) | Raw data; not yet PE-approved; not yet org-indexed |

### 3.2 LessonsIntelligence Index — Field Visibility

| Field | Org index (all users) | Project-scoped (PM, SUPT, PE, PER) |
|---|:---:|:---:|
| `category` | ✓ | ✓ |
| `recommendation` | ✓ | ✓ |
| `situation` | ✓ | ✓ |
| `rootCause` | ✓ | ✓ |
| `impactMagnitude` | ✓ | ✓ |
| `applicability` | ✓ | ✓ |
| `keywords` | ✓ | ✓ |
| `phaseEncountered` | ✓ | ✓ |
| `sourceProjectName` | ✓ | ✓ |
| `marketSector`, `deliveryMethod`, `projectSizeBand` | ✓ | ✓ |
| `supportingDocuments` | — (not published to org index) | ✓ |
| `createdBy` (author identity) | — (not published to org index) | ✓ |
| `lessonNumber` | ✓ (for citation reference) | ✓ |

### 3.3 SubIntelligence Index — Field Visibility by Access Level

| Field | PE / PER / MOE | `SUB_INTELLIGENCE_VIEWER` grant | General Project Hub user |
|---|:---:|:---:|:---:|
| `subcontractorName` | ✓ | ✓ | — |
| `tradeScope` | ✓ | ✓ | — |
| `overallWeightedScore` | ✓ | ✓ | — |
| `performanceRating` | ✓ | ✓ | — |
| `reBidRecommendation` | ✓ | ✓ | — |
| Section scores (Safety, Quality, Schedule, CostMgmt, Communication, Workforce) | ✓ | ✓ | — |
| `evaluationDate` | ✓ | ✓ | — |
| `sourceProjectName` | ✓ | ✓ | — |
| `marketSector`, `deliveryMethod`, `projectSizeBand` | ✓ | ✓ | — |
| `isInterimException` flag | ✓ | ✓ | — |
| `keyStrengths` | ✓ | — | — |
| `areasForImprovement` | ✓ | — | — |
| `notableIncidentsOrIssues` | ✓ | — | — |
| `overallNarrativeSummary` | ✓ | — | — |
| `contractValue`, `finalCost` | PE and MOE only | — | — |

### 3.4 SUB_INTELLIGENCE_VIEWER Grant Rules

- The grant is explicit and must be issued by MOE or PE.
- It is not inherited from general Project Hub access, project team membership, or any other role.
- The grant must be stored as a named role assignment on the user's org-level profile, not embedded in project membership.
- Grant issuance is auditable — who issued, when, and to whom.
- MOE may revoke the grant at any time; revocation takes effect on the next session.
- Implementation must query for this grant at the API layer before returning any SubIntelligence records.

---

## 4. Annotation Isolation Contract

### 4.1 Core Rule

PE and PER annotations are stored exclusively in `@hbc/field-annotations`. **They must not write any field on any operational Closeout record.** This is a hard architectural boundary.

```
Operational record (e.g., SubcontractorScorecard)
  → Read by PE
  → PE observation stored in @hbc/field-annotations, attached by (entityType, entityId, fieldPath)
  → Operational record: UNCHANGED

No annotation action may cause a write to the operational record.
```

### 4.2 What Annotations Are

| Annotation property | Rule |
|---|---|
| Storage | `@hbc/field-annotations` only; annotation records reference the Closeout entity by (entityType, entityId) + optional `fieldPath` |
| Mutability | Annotations are write-once; PE may add new annotations but not edit prior ones (audit trail preserved) |
| Visibility | Governed by §4.3 below |
| Retention | Indefinite; annotations survive project archive |
| Relationship to approval | Annotations are observations, not approvals; adding an annotation does not advance any status |

### 4.3 Annotation Visibility Rules

| Annotation source | Visible to PM | Visible to SUPT | Visible to PE | Visible to PER |
|---|:---:|:---:|:---:|:---:|
| PE annotation on any Closeout record | ✓ | ✓ | ✓ | ✓ |
| PER annotation on any Closeout record | ✓ | — | ✓ | ✓ |

**Note:** SUPT does not see PER annotations. SUPT has field-level operational authority but is not a governance actor; PER annotations are strategic review observations not intended for field staff.

### 4.4 Push-Through Exception (Annotation → Approval Path)

Annotations never auto-propagate to approval state. However, a PE annotation may be the preceding context for a subsequent explicit approval action:

1. PE adds annotation: "Recommend revising Safety section score before approval."
2. PM receives annotation, revises scoring, resubmits.
3. PE takes explicit `APPROVE` action → `publicationStatus → PE_APPROVED`.

Step 3 is always an explicit separate API action. Step 2 is not triggered by Step 1 automatically. There is no "annotation implies approval" pathway.

---

## 5. PE Approval vs. PE Annotation — Formal Contract

These are categorically different capabilities. The distinction must be enforced in both the API and the UI.

| Dimension | PE Annotation | PE Approval |
|---|---|---|
| **What it does** | Non-blocking review observation; does not change record state | Formal gated state transition; advances `publicationStatus` or `lifecycleState` |
| **Storage** | `@hbc/field-annotations` (annotation layer) | Closeout record itself (`peApprovedAt`, `peApprovedBy` fields) |
| **API action** | `POST /annotations/{entityType}/{entityId}` | Explicit approval action: e.g., `POST /closeout/{projectId}/scorecard/{id}/approve` |
| **Reversibility** | Annotation is permanent (audit); new annotation can clarify | Approval is permanent; reversion requires PE-documented exception |
| **Effect on workflow** | None — checklist items do not resolve; publication status does not advance | Advances publication status or lifecycle state; triggers downstream events |
| **UI treatment** | Rendered as "PE Review Note" adjacent to the field; never in the action bar | Rendered as primary gated action button requiring explicit confirmation |
| **Required before** | Nothing — may be added at any time | Required milestone completions and evidence gates per T04 |

**Implementation rule:** The approval button must never appear inside the annotation interface. Annotations and approvals must be reachable only through separate UI paths. A PE who annotates a record and then navigates away has **not** approved it.

---

## 6. Executive Review Doctrine — Targeted, Not Routine

Per the locked architecture decisions, PE review is **targeted on defined formal surfaces only.** PE is not a reviewer of routine PM operational checklist execution.

### 6.1 PE Formal Review Surfaces

| Surface | PE Action | Trigger |
|---|---|---|
| `OWNER_ACCEPTANCE` milestone | Approve | PM submits owner acceptance evidence |
| `FinalCloseout` scorecard | Approve for org publication | PM/SUPT submits FinalCloseout scorecard |
| `LessonsLearningReport` | Approve for org publication | PM submits lessons report |
| `AutopsyRecord` | Approve (PE is workshop lead) | Workshop complete; record submitted |
| Individual `LearningLegacyOutput` | Approve for org feed publication | PM or PE creates output and submits |
| `ARCHIVE_READY` gate | Approve | All 8 criteria pass; PM requests |
| `ARCHIVED` state trigger | Trigger | PE-initiated after ARCHIVE_READY approval |

### 6.2 What Does NOT Generate a PE Work Queue Item

The following routine PM operations must not route a Work Queue item to PE:
- Marking any checklist item Yes/No/NA
- Adding an overlay item
- Creating a lesson entry
- Creating an Interim scorecard
- Updating autopsy pre-briefing pack
- Responding to a PER annotation

PE Work Queue items are reserved for formal approval gates. Over-surfacing PE review requests defeats the targeted review model and causes signal noise.

### 6.3 Work Queue Items to PE (Exhaustive List)

| Item | Priority | Auto-close when |
|---|---|---|
| Owner Acceptance evidence submitted — PE review needed | High | Milestone approved or declined |
| FinalCloseout scorecard submitted — PE review needed | Medium | Scorecard approved or revision requested |
| Lessons report submitted — PE review needed | Medium | Report approved or revision requested |
| Autopsy record submitted — PE approval needed | Medium | Autopsy approved or revision requested |
| Archive Ready — all criteria pass, PE approval needed | High | Milestone approved or declined |

---

## 7. SUPT Checklist Access Scope

Superintendent access to checklist item mutation is intentionally scoped to field-execution sections. This is a business requirement, not a Phase 3 implementation constraint.

| Section | SUPT mutation authority |
|---|---|
| Section 1 — Tasks and Pre-Work | ✓ (within field scope) |
| Section 2 — Construction Completion Documents | Read only — document submission authority is PM |
| Section 3 — Inspections and Certificate of Occupancy | ✓ (SUPT typically coordinates AHJ inspections) |
| Section 4 — Turnover and Owner Handoff | ✓ (field components); PM handles financial/contractual items |
| Section 5 — Estimating and File Return | Read only |
| Section 6 — Closeout Intelligence Artifacts | Read only — these are PM submission and PE approval surfaces |

**API enforcement:** Phase 3 implementation should enforce this at the UI layer through display constraints. API-level item-by-item role enforcement may be added in a subsequent phase. PM retains override authority on any item SUPT has marked.

---

*[← T08](P3-E10-T08-Project-Hub-Consumption-Derived-Intelligence-Indexes-and-Reporting.md) | [Master Index](P3-E10-Project-Closeout-Module-Field-Specification.md) | [T10 →](P3-E10-T10-Lane-Ownership-and-Shared-Package-Reuse.md)*
