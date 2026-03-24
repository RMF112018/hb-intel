# P3-E10-T01 — Operating Model, Scope, Surface Map, and Source-of-Truth Boundaries

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E10-T01 |
| **Parent** | [P3-E10 Project Closeout Module](P3-E10-Project-Closeout-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T01 of 11 |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-24 |
| **Status** | Governing — locked architecture |

---

## 1. Module Purpose

Project Closeout is the **governed operational surface for project completion, institutional learning capture, and curated intelligence publication** in HB Intel. It serves two distinct functions that must be kept architecturally separate:

**Function A — Project-Scoped Operations:** Provides the PM, Superintendent, and PE with tracked, auditable tools to execute and evidence the closure of a specific project — checklist, evaluations, lessons, and structured reflection.

**Function B — Intelligence Publication:** With PE approval, elevates curated project records into org-wide read models (Lessons Intelligence Index, SubIntelligence Index, Learning Legacy Feed) that future teams can query for decision support.

These two functions share a data lineage but must never share a write path. Function B reads from Function A's PE-approved records. Nothing in Function B writes back to Function A.

---

## 2. Surface Map

### 2.1 Three Surface Classes

Project Closeout operates across three distinct surface classes. Implementation teams must understand which class each surface belongs to before designing UI, APIs, or permissions.

```
┌─────────────────────────────────────────────────────────────────────┐
│  CLASS 1 — PROJECT-SCOPED OPERATIONAL SURFACES                      │
│  (project team writes; PE gates formal transitions)                 │
│                                                                     │
│  ┌──────────────────┐  ┌────────────────────┐  ┌────────────────┐  │
│  │ Closeout          │  │ Subcontractor      │  │ Lessons        │  │
│  │ Execution         │  │ Scorecard          │  │ Learned        │  │
│  │ Checklist         │  │ (Interim + Final)  │  │ (Rolling       │  │
│  │                   │  │                    │  │  Ledger)       │  │
│  └──────────────────┘  └────────────────────┘  └────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ Project Autopsy & Learning Legacy                            │   │
│  │ (PE-led synthesis; workshop; findings; actions; outputs)     │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
         │
         │  PE approval + ARCHIVE_READY gate
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│  CLASS 2 — ORG-WIDE DERIVED READ MODELS                             │
│  (populated from PE-approved project records; no direct mutation)   │
│                                                                     │
│  ┌──────────────────┐  ┌────────────────────┐  ┌────────────────┐  │
│  │ Lessons           │  │ SubIntelligence    │  │ Learning       │  │
│  │ Intelligence      │  │ Index              │  │ Legacy Feed    │  │
│  │ Index             │  │ (role-restricted)  │  │                │  │
│  └──────────────────┘  └────────────────────┘  └────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
         │
         │  Read-only query
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│  CLASS 3 — PROJECT HUB CONSUMPTION SURFACES                         │
│  (curated projections surfaced to other project teams; no mutation) │
│                                                                     │
│  Contextual Lessons Panel  │  Sub Vetting Intelligence  │  Feed     │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Surface Definitions

#### Class 1 — Project-Scoped Operational Surfaces

| Surface | Description | Primary Operator | PE Involvement |
|---|---|---|---|
| **Closeout Execution Checklist** | Governed 70-item tri-state checklist with template library, project overlay, and milestone gate integration | PM | Approves formal stage transitions; annotates; no routine item-level authority |
| **Subcontractor Scorecard** | Structured per-sub evaluation tool; supports interim reviews during delivery plus a mandatory final closeout evaluation | PM, Superintendent | Required approval before FinalCloseout record is published to org |
| **Lessons Learned (Rolling Ledger)** | Continuous structured lesson capture from any project phase; synthesized into a publication package at closeout | PM, Superintendent | Required approval before lessons are published to org |
| **Project Autopsy & Learning Legacy** | PE-led closeout synthesis workshop; structured findings; action register; feed-forward outputs | PE (lead), PM (coordinator) | PE is the lead facilitator and sole approval authority |

#### Class 2 — Org-Wide Derived Read Models

| Index | Source | Who Populates | Who Reads |
|---|---|---|---|
| **LessonsIntelligence Index** | PE-approved `LessonEntry` records | Automated on archive event | Broadly available — all internal users with Project Hub access |
| **SubIntelligence Index** | PE-approved `FinalCloseout` scorecard records | Automated on archive event | Restricted — PE, PER, `SUB_INTELLIGENCE_VIEWER` role only |
| **LearningLegacy Feed** | PE-approved `LearningLegacyOutput` records from Autopsy | Automated on archive event | Broadly available; full content gated by role for sensitive findings |

**Governing rule:** No user session operating inside Project Closeout may directly write to a Class 2 index. Publication is exclusively driven by the `closeout.archived` event and the PE-approval state of contributing records. The org intelligence layer processes events and maintains the indexes asynchronously.

#### Class 3 — Project Hub Consumption Surfaces

| Consumption Point | Source Index | User Can Do | User Cannot Do |
|---|---|---|---|
| **Contextual Lessons Panel** (new/active project) | LessonsIntelligence Index | Filter by sector/method/size; read entries; open finding detail | Edit, annotate, delete, flag |
| **Sub Vetting Intelligence Panel** (procurement) | SubIntelligence Index | Filter by sub name; view historical performance; read summaries | Edit, override, publish new evaluation |
| **Learning Legacy Feed** | LearningLegacy Feed | Browse by type/tag; retrieve applicable outputs | Edit, re-publish, delete |

---

## 3. Module Scope — What Closeout Owns

### 3.1 Owned Record Families

Project Closeout is the exclusive SoT writer for:

| Record Family | Key | Notes |
|---|---|---|
| `CloseoutChecklist` | `checklistId` | One per project; never recreated |
| `CloseoutChecklistSection` | `sectionId` | 7 per checklist; template-driven |
| `CloseoutChecklistItem` | `itemId` | ~70 governed + project overlays |
| `ChecklistTemplate` | `templateId` + `version` | MOE-governed baseline; versioned |
| `CloseoutMilestone` | `milestoneId` | 13 defined milestones per T04 |
| `SubcontractorScorecard` | `scorecardId` | 1+ per project (one per sub × multiple eval types) |
| `ScorecardSection` | `sectionId` | 6 per scorecard; fixed |
| `ScorecardCriterion` | `criterionId` | 28 per scorecard; fixed |
| `LessonEntry` | `lessonId` | Rolling; 0+ per project |
| `LessonsLearningReport` | `reportId` | Closeout synthesis container; 1 per project |
| `AutopsyRecord` | `autopsyId` | 1 per project |
| `AutopsySection` | `sectionId` | Up to 12 thematic sections per T07 |
| `AutopsyFinding` | `findingId` | 0+ per autopsy |
| `AutopsyAction` | `actionId` | 0+ per autopsy |
| `AutopsyPreSurveyResponse` | `responseId` | 1 per invited participant |
| `LearningLegacyOutput` | `outputId` | 0+ per autopsy |

### 3.2 What Closeout Reads (Read-Only Cross-Module)

| Source | Consumed Data | Purpose | Mutation Permitted |
|---|---|---|---|
| P3-E4 Financial | Final cost variance, contingency usage | Autopsy briefing pack; checklist item 6.4 signal | **No** |
| P3-E5/E6 Schedule | Schedule variance, milestone actuals, float history | Autopsy briefing pack; evidence on checklist items | **No** |
| P3-E7 Permits | Permit lifecycle, C.O. status, inspection pass/fail | Checklist items 3.x; related-items links | **No** |
| P3-E8 Safety | TRIR, recordable incidents, near-misses | Scorecard Safety section evidence; autopsy input | **No** |
| `@hbc/related-items` registry | Cross-module record links | Pre-fill evidence suggestions; readiness signals | **No — suggestions only; user confirms** |

**Critical rule:** Related records may suggest readiness for checklist items but must not auto-resolve any item to `Yes`. The user must confirm every item result. Related records are read-only evidence sources, not backdoor state writers.

### 3.3 What Closeout Does Not Own

| Out of scope | Correct owner |
|---|---|
| Org-wide SubIntelligence Index (write path) | Org Intelligence Layer; populated from PE-approved events |
| Org-wide LessonsIntelligence Index (write path) | Org Intelligence Layer |
| Report artifact generation (PDF/HTML) | P3-E9 Reports; Closeout provides approved snapshots |
| Financial cost variance calculation | P3-E4 Financial |
| Permit inspection records | P3-E7 Permits |
| Safety incident records | P3-E8 Safety |
| Document management / file storage | SharePoint / document management layer |
| Work Queue routing infrastructure | P3-D3 Work Queue contract |

---

## 4. Always-On Activation Model

Closeout is an **always-on module** — not a terminal phase-only feature. This is operationally significant:

| Phase | Closeout activity |
|---|---|
| Preconstruction / Bid | Module exists but no operational Closeout records yet |
| Execution (early) | PM and Superintendent may begin capturing `LessonEntry` records at any time |
| Execution (any phase) | Interim `SubcontractorScorecard` evaluations may be created; lessons may be logged |
| Closeout phase activation | `CloseoutChecklist` is instantiated; Autopsy is activated; `LessonsLearningReport` container created |
| Archive / publication | PE-approved records published to org intelligence indexes |

**Implementation rule:** The Lessons Learned and Subcontractor Scorecard sub-surfaces must be accessible from the Project Hub sidebar at any point in the project lifecycle. The Checklist and Autopsy sub-surfaces are accessible from the Closeout phase activation event forward.

---

## 5. SoT Boundary Matrix

The following matrix defines the authoritative write boundary for every Closeout-adjacent data concern:

| Data Concern | SoT Owner | Who Writes | Who Reads |
|---|---|---|---|
| Checklist item result | `@hbc/project-closeout` | PM, SUPT | PM, SUPT, PE, PER, Reports (snapshot) |
| Checklist template baseline | `ChecklistTemplate` store (MOE-governed) | MOE/Admin only | Closeout (at instantiation) |
| Scorecard criterion score | `@hbc/project-closeout` | PM, SUPT | PM, SUPT, PE, PER |
| PE annotation on scorecard | `@hbc/field-annotations` | PE, PER | PM, SUPT, PE, PER |
| Lesson entry content | `@hbc/project-closeout` | PM, SUPT | PM, SUPT, PE, PER, Autopsy (cross-ref) |
| Autopsy finding | `@hbc/project-closeout` | PE, PM (with PE) | PE, PM, PER |
| Learning legacy output | `@hbc/project-closeout` | PE, PM | PE, PM, PER; org feed on publication |
| Org SubIntelligence entry | Org Intelligence Layer | Automated from PE-approved events | PE, PER, SUB_INTELLIGENCE_VIEWER |
| Org Lessons entry | Org Intelligence Layer | Automated from PE-approved events | All internal users (Project Hub access) |
| Org Learning Legacy entry | Org Intelligence Layer | Automated from PE-approved events | All internal users (Project Hub access) |
| Cost variance | P3-E4 Financial | Financial module only | Closeout (read signal for item 6.4) |
| C.O. status | P3-E7 Permits | Permits module only | Closeout (related-items read) |

---

## 6. Cross-Contract Positioning

| Contract | Relationship |
|---|---|
| P3-E1 §3.1 | Module classification — review-capable, lifecycle module, project-scoped SoT |
| P3-E2 §3 | Source-of-truth boundaries and action authority matrix |
| P3-D1 Activity Spine | Closeout emits lifecycle events, checklist milestones, autopsy completion |
| P3-D2 Health Spine | Closeout emits closeout completion %, scorecard coverage, autopsy readiness |
| P3-D3 Work Queue | Closeout raises items for C.O. deadlines, lien deadlines, overdue evaluations, PE approvals, autopsy actions |
| P3-D4 Related Items | Closeout registers checklist → permit, checklist → financial, autopsy → lesson links |
| P3-E4 Financial | Read-only: final cost variance for item 6.4 and autopsy briefing pack |
| P3-E7 Permits | Read-only: permit lifecycle and C.O. date for checklist items 3.x |
| P3-E8 Safety | Read-only: TRIR and incident summary for scorecard Safety section and autopsy |
| P3-E9 Reports | Reports assembles `sub-scorecard` and `lessons-learned` artifacts from PE-approved Closeout snapshots |
| P3-G1 Lane Capability Matrix | Closeout lane capabilities including new Autopsy surface |
| P3-H1 §18.5 | Closeout acceptance gate — updated per T11 |

---

*[Master Index](P3-E10-Project-Closeout-Module-Field-Specification.md) | [T02 →](P3-E10-T02-Record-Families-Identity-Field-Architecture-Publication-States.md)*
