# P3-E10: Project Closeout Module — Master Index

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E10 |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Document Type** | Module Field Specification — T-File Master Index |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-24 |
| **Status** | Specification — locked architecture; T-files govern |
| **Related contracts** | P3-E1 §3.9, P3-E2 §14, P3-H1 §18.5, P3-E9 (Reports), P3-E15 (QC continuity seam), P3-D1 (Activity), P3-D2 (Health), P3-D3 (Work Queue), P3-D4 (Related Items) |

---

## T-File Index

This document is the master index for the P3-E10 Project Closeout Module T-file set. The original single-file specification has been superseded by 11 T-files, each covering a distinct architectural concern. The T-files govern where they conflict with any earlier prose.

| T-File | Title | Key coverage |
|---|---|---|
| [T01](P3-E10-T01-Operating-Model-Scope-Surface-Map-SoT-Boundaries.md) | Operating Model, Scope, Surface Map, SoT Boundaries | Three-class surface model; always-on activation; SoT boundary matrix; what Closeout owns and does not own |
| [T02](P3-E10-T02-Record-Families-Identity-Field-Architecture-Publication-States.md) | Record Families, Identity, Field Architecture, Publication States | All 10+ record families; full field tables; 6-state publication model; immutability rules; org index interfaces |
| [T03](P3-E10-T03-Closeout-Execution-Checklist-Template-Library-Overlay-Model.md) | Closeout Execution Checklist, Template Library, Overlay Model | MOE-governed template library with semantic versioning; complete 70-item catalog with 15-column metadata schema; overlay model; instantiation sequence |
| [T04](P3-E10-T04-Lifecycle-State-Machine-Milestones-Evidence-Gates-Approval-Rules.md) | Lifecycle State Machine, Milestones, Evidence Gates, Approval Rules | 9-state lifecycle machine; 13 milestone definitions with evidence types; 8-criterion Archive-Ready gate; PE vs. PM authority matrix; Work Queue items |
| [T05](P3-E10-T05-Lessons-Learned-Operating-Model-and-Intelligence-Publication.md) | Lessons Learned Operating Model and Intelligence Publication | Rolling entry model; synthesis container; impact magnitude derivation engine (backend); recommendation action-verb validation; PE-gated publication; `LessonsLearnedPublicationSnapshot` contract |
| [T06](P3-E10-T06-Subcontractor-Scorecard-Model-and-Intelligence-Publication.md) | Subcontractor Scorecard Model and Intelligence Publication | Interim vs. FinalCloseout evaluation types; full 6-section, 28-criterion reference with evidence guidance; scoring formulas; publication workflow; SubIntelligence index snapshot |
| [T07](P3-E10-T07-Project-Autopsy-and-Learning-Legacy.md) | Project Autopsy and Learning Legacy | `AutopsyRecord`, `AutopsyFinding`, `AutopsyAction`, `LearningLegacyOutput`; pre-survey model; pre-briefing pack; 12 thematic sections; workshop facilitation; tagging model; org feed publication |
| [T08](P3-E10-T08-Project-Hub-Consumption-Derived-Intelligence-Indexes-and-Reporting.md) | Project Hub Consumption, Derived Intelligence Indexes, and Reporting | Org intelligence as derived read models; three indexes (LessonsIntelligence, SubIntelligence, LearningLegacy feed); Project Hub consumption surfaces; 17 Activity Spine events; 4 Health dimensions; Reports snapshot API |
| [T09](P3-E10-T09-Permissions-Visibility-Executive-Review-Role-Matrix.md) | Permissions, Visibility, Executive Review, Role Matrix | Master role matrix; lessons vs. sub intelligence visibility model; `SUB_INTELLIGENCE_VIEWER` grant rules; annotation isolation contract; PE annotation vs. PE approval formal distinction; targeted executive review doctrine |
| [T10](P3-E10-T10-Lane-Ownership-and-Shared-Package-Reuse.md) | Lane Ownership and Shared Package Reuse | Package identity (L5 Feature); PWA vs. SPFx surface classification; shared package integration contracts for all 7 required packages with blocker risk; prohibited dependencies; P3-G1 lane reconciliation |
| [T11](P3-E10-T11-Implementation-and-Acceptance-Guide.md) | Implementation and Acceptance Guide | Where to start; shared package blockers and no-go conditions; 7-stage implementation sequence with per-stage acceptance gates; required cross-module API contracts; acceptance criteria; testing concerns |

---

## Module Overview

Project Closeout is an **always-on lifecycle module** that activates when a project enters the closeout phase and remains active through archive. It provides five operational sub-surfaces and publishes derived intelligence to org-wide indexes on project archive.

### Sub-surfaces

| # | Sub-surface | Description |
|---|---|---|
| 1 | **Closeout Execution Checklist** | 70-item governed tri-state checklist with MOE-controlled template library, project overlay model, and PE-gated milestone transitions |
| 2 | **Subcontractor Scorecard** | Multi-sub weighted evaluation — Interim and FinalCloseout types; 6-section, 28-criterion model; PE-gated publication to org SubIntelligence index |
| 3 | **Lessons Learned** | Rolling structured lesson capture with closeout synthesis, backend impact magnitude derivation, recommendation validation, and PE-gated publication to org LessonsIntelligence index |
| 4 | **Project Autopsy & Learning Legacy** | Collaborative post-project synthesis; pre-survey and pre-briefing pack; 12-section workshop framework; `AutopsyFinding`, `AutopsyAction`, `LearningLegacyOutput` records; PE-gated publication to org LearningLegacy feed |
| 5 | **Executive Review Layer** | PE/PER annotation via `@hbc/field-annotations` across all sub-surfaces; stored exclusively in annotation layer; zero writes to operational records |

### Architecture Model

```
Class 1 — Operational (project-scoped writes)
  CloseoutChecklist  SubcontractorScorecard  LessonEntry  AutopsyRecord
          ↓ PE approval + ARCHIVED state trigger
Class 2 — Org Intelligence (derived read models; PE-approved publication events)
  LessonsIntelligenceIndex  SubIntelligenceIndex  LearningLegacyFeed
          ↓ consumed by
Class 3 — Project Hub (read-only contextual surfaces)
  Contextual lessons panel  Sub vetting panel  Learning legacy feed
```

### Governance Boundaries

- `@hbc/project-closeout` (L5 Feature) owns all operational state. No other feature package writes to Closeout records.
- Org intelligence indexes are **derived read models** populated from PE-approved publication events at `ARCHIVED` state — not editable ledgers within Closeout.
- Reports module consumes Closeout data exclusively via the snapshot API (`GET /api/closeout/{projectId}/scorecard/{id}/snapshot` and `GET /api/closeout/{projectId}/lessons/snapshot`). Precondition: `PE_APPROVED` + PE role.
- PE annotation (`@hbc/field-annotations`) and PE approval (record-level action) are categorically distinct. Annotation does not advance any status.

---

## Locked Architecture Decisions

The following 14 decisions are binding. All T-files conform to these decisions. Any implementation that contradicts them requires an explicit architecture review.

| # | Decision |
|---|---|
| 1 | Closeout is always-on for the life of the project, not a phase-gated unlock |
| 2 | Checklist template is MOE-governed with semantic versioning; project overlay is bounded (max 5 items/section) |
| 3 | Subcontractor performance index is an org-wide derived read model — not an editable ledger |
| 4 | Lessons intelligence is an org-wide derived read model — not an editable ledger |
| 5 | No direct cross-feature imports; cross-module data flows via Spine and snapshot API only |
| 6 | PE approval (gated record transition) is distinct from PE annotation (non-blocking observation) |
| 7 | Subcontractor performance data is restricted by role; `SUB_INTELLIGENCE_VIEWER` grant is explicit, not inherited |
| 8 | Lessons intelligence is broadly visible to all internal Project Hub users |
| 9 | Impact magnitude is backend-derived from text signals; PM cannot set or override |
| 10 | Reports ingests PE-approved Closeout snapshots; Reports does not own or recompute any Closeout data |
| 11 | Project Autopsy is a first-class sub-surface; `AUTOPSY_COMPLETE` milestone is required for Archive-Ready gate |
| 12 | Archive-Ready is an 8-criterion gate that PE must explicitly approve |
| 13 | `ARCHIVED` is terminal; no mutation of any Closeout record is permitted after archiving |
| 14 | FinalCloseout scorecard is unique per subcontractor per project; duplicate attempts return 409 |

---

## Cross-Reference Map

| Concern | Governing source |
|---|---|
| Module classification | P3-E1 §3.9 |
| SoT and action boundary | P3-E2 §14 |
| Activity Spine publication contract | P3-D1 + T08 §5.1 |
| Health Spine publication contract | P3-D2 + T08 §5.2 |
| Work Queue items | P3-D3 + T04 §7 |
| Related-items relationship pairs | P3-D4 + T10 §3.1 |
| Reports snapshot ingestion | P3-E9-T06 §5 |
| Lane capability (PWA / SPFx) | P3-G1 §4.8 + T10 §2 |
| Acceptance criteria | P3-H1 §18.5 + T11 §5 |
| Shared package integration | T10 §3 |
| Role and visibility governance | T09 |
| Startup Baseline read API (upstream dependency) | P3-E11-T10 §4; P3-E11-T02 §7.2 — Closeout consumes `GET /api/startup/{projectId}/baseline` as read-only input; no Closeout record is written to the Startup module |
| QC turnover-quality continuity seam (upstream dependency) | P3-E15-T09 + P3-E15-T10 — Closeout may read QC turnover-quality readiness, unresolved issue posture, approved deviations, and evidence lineage as read-only continuity context; Closeout never mutates QC records |

---

## Implementation Read Order

For an implementation team starting Closeout work, the recommended read sequence is:

1. **T11 §1** — where to start; shared package blocker check
2. **T01 §1–2** — three-class surface model and SoT boundaries
3. **T03 §1–3** — template governance and checklist item metadata schema
4. **T04 §2–4** — lifecycle state machine, milestones, Archive-Ready gate
5. **T05–T07** — Lessons, Scorecard, Autopsy (per implementation stage)
6. **T08** — Org intelligence and Reports snapshot API
7. **T09** — Role and visibility rules (implement alongside each sub-surface)
8. **T10** — Package placement, shared package contracts, prohibited dependencies

---

## What This T-File Set Supersedes

The original single-file specification (2026-03-23) has been fully superseded. Key architectural corrections from the original:

| Original (superseded) | Correct (T-files govern) |
|---|---|
| Flat `DRAFT / IN_PROGRESS / COMPLETE / ARCHIVED` status enum | 9-state `CloseoutLifecycleState` machine + 6-state publication model (T04, T02) |
| "Aggregation Dashboard" as a peer editable ledger | `SubIntelligenceIndex` as derived read model populated on archive (T01, T08) |
| "Lessons Database" as a peer editable ledger | `LessonsIntelligenceIndex` as derived read model populated on archive (T01, T08) |
| Section 6 completion items as publication trigger | PE-approval-gated + `ARCHIVED` state as publication trigger (T04, T05, T06) |
| Single-type scorecard evaluation | Interim vs. FinalCloseout evaluation types with distinct cardinality and org eligibility (T06) |
| No Autopsy sub-surface | Project Autopsy & Learning Legacy as first-class sub-surface with full field architecture (T07) |
| No template library | MOE-governed `ChecklistTemplate` with semantic versioning and overlay model (T03) |
| P3-E8 (Safety) as downstream snapshot consumer | P3-E9 (Reports) is the correct downstream snapshot consumer |

---

*[T01 →](P3-E10-T01-Operating-Model-Scope-Surface-Map-SoT-Boundaries.md)*
