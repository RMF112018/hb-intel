# P3-E9 — Reports Module Field Specification (Master Index)

**Status:** Refactored into T-file family — this file is the master index and reading guide. T01 foundation implementation complete in `@hbc/features-project-hub` v0.2.6.
**Governing contract:** P3-F1 — Reports Workspace / Definition / Run / Release Contract Package.
**Replaces:** Monolithic `P3-E9-Reports-Module-Field-Specification.md` (1,260 lines).
**Pattern:** Follows T-file family structure established by P3-E4 through P3-E8.

---

## 1. Module Summary

Reports is the governed report-production and distribution architecture for HB Intel. It owns:

- the corporate template library (family definitions, section schemas, approval/release governance),
- project-level governed extension and registration,
- the draft/snapshot/narrative configuration layer,
- the run ledger (all generation, approval, and release records),
- artifact production pipeline (async PDF generation, SharePoint storage),
- spine publication (Activity, Health, Work Queue, Related Items),
- and enforcement of the central project-governance policy record.

Reports does **not** own source-of-truth data from originating modules. It assembles governed report artifacts from immutable module snapshots provided at generation time.

**Ownership boundary for sub-scorecard and lessons-learned:** P3-E10 (Project Closeout) owns all operational data — evaluations, lesson entries, scoring — for subcontractor scorecards and lessons-learned reports. Reports assembles these into governed release artifacts but does not own or re-derive the source data.

---

## 2. Locked Decisions

These 12 decisions are locked and govern all T-file content. They may not be reversed without an explicit ADR.

| # | Decision | Implication |
|---|----------|-------------|
| LD-REP-01 | Reports owns: native report families, integration-driven artifact families, project-level governed extensions — NOT source-of-truth from originating modules | Reports assembles from snapshots; it does not own module data |
| LD-REP-02 | Native families: `px-review`, `owner-report`; `sub-scorecard` and `lessons-learned` are integration-driven artifacts owned by P3-E10/Closeout | E10 is the source-of-truth for sub-scorecard and lessons-learned operational data |
| LD-REP-03 | Controlled project-level extension model — corporate templates with guardrails | Projects may register family extensions within MOE-approved governance bounds |
| LD-REP-04 | PM drafts/configures, PE approves/activates project-specific families; MOE/Admin owns global governance | Authority split enforced at the API layer |
| LD-REP-05 | Controlled structural customization within approved templates only | Section add/remove requires PE re-approval; field-level edits stay within allowed schema |
| LD-REP-06 | PX Review is a locked corporate template — MOE-only modification | No project-level override of PX Review structure or approval gate |
| LD-REP-07 | Post-activation structural changes require PE re-approval; draft vs. active configuration version model required | Active config is immutable once PE-activated; structural edits create a new draft version pending re-approval |
| LD-REP-08 | Allowed section content: approved source-module snapshots, approved calculated rollups, project-authored narrative-only; NOT project-authored data bindings or calculation logic | PM narrative sections are text only; data comes from approved snapshot sources |
| LD-REP-09 | Governed selectable approval/release classes per template; PM chooses within allowed set; PE approves | Release class is template-governed, not PM-free-form |
| LD-REP-10 | Governed selectable audience/release target classes per template; PE approves class changes; external distribution only where template permits | External release is template-gated; PE approval required for audience changes |
| LD-REP-11 | Promotion path from project family to corporate template via MOE/Admin review | Proven project extensions may be elevated to corporate templates after MOE review |
| LD-REP-12 | E9 governs a Reports architecture covering template library, project registrations, draft state, frozen snapshots, reviewer overlay boundary, run ledger, approval/release/distribution governance, artifact provenance, source-module artifact ingestion, cross-spine publication, lane/surface visibility, and acceptance requirements | The monolithic "four-family flat spec" is replaced by a full governed architecture |

---

## 3. T-File Index

| File | Title | Primary Content |
|------|-------|-----------------|
| [T01](P3-E9-T01-Reports-Scope-Operating-Model-and-Family-Typology.md) | Reports Scope, Operating Model, and Family Typology | Module boundary, report family taxonomy, authority model, operating principles |
| [T02](P3-E9-T02-TypeScript-Contracts-and-Registry-Model.md) | TypeScript Contracts and Registry Model | All interfaces, enums, type unions, registry contract |
| [T03](P3-E9-T03-Draft-Snapshot-Narrative-Refresh-and-Freeze-Model.md) | Draft, Snapshot, Narrative, Refresh, and Freeze Model | Draft configuration lifecycle, PM narrative, snapshot freeze, staleness, configuration versioning |
| [T04](P3-E9-T04-Run-Ledger-Approval-Release-and-Distribution-Lifecycle.md) | Run Ledger, Approval, Release, and Distribution Lifecycle | Generation pipeline, run ledger structure, status transitions, approval gate, release/distribution governance |
| [T05](P3-E9-T05-Template-Governance-Project-Extension-and-Promotion-Workflow.md) | Template Governance, Project Extension, and Promotion Workflow | Corporate template library, project extension model, PE activation, promotion workflow |
| [T06](P3-E9-T06-Section-Source-Model-Rollups-and-Artifact-Ingestion.md) | Section Source Model, Rollups, and Artifact Ingestion | Allowed section content types, prohibited bindings, sub-scorecard and lessons-learned ingestion from E10 |
| [T07](P3-E9-T07-Review-Boundaries-PER-Behavior-Visibility-and-Lane-Depth.md) | Review Boundaries, PER Behavior, Visibility, and Lane Depth | PER permissions, reviewer-generated runs, field-annotation boundary, lane depth matrix |
| [T08](P3-E9-T08-Spine-Publication-Work-Queue-Related-Items-and-Health.md) | Spine Publication, Work Queue, Related Items, and Health | Activity events, health metric, work queue items, related items registry |
| [T09](P3-E9-T09-Shared-Feature-Integration-and-Surface-Consumption.md) | Shared Feature Integration and Surface Consumption | P3-F1 contract, E10 integration, shared packages, SharePoint, cross-lane navigation |
| [T10](P3-E9-T10-Implementation-Guide-Acceptance-and-Cross-File-Updates.md) | Implementation Guide, Acceptance, and Cross-File Updates | Package blockers, implementation stages, acceptance gate, cross-file update notes |

---

## 4. Cross-File References

Files that reference P3-E9 and should be read alongside the T-file family:

| File | Relationship |
|------|--------------|
| P3-F1 | **Governing contract** — locks report-definition registry, draft/snapshot model, generation pipeline, run-ledger, approval model, release/distribution, PER permissions, central project-governance policy record, PM↔PE review chain |
| P3-E10 *(master index + T01–T11)* | Source-of-truth for sub-scorecard, lessons-learned, and autopsy operational data; E9 consumes sub-scorecard and lessons-learned via governed artifact ingestion. Snapshot precondition: `publicationStatus ≥ PE_APPROVED`; PE role required on snapshot API call. See P3-E10-T11 §4 for API contract paths; see P3-E10-T06 and T05 for scoring and lessons field contracts. |
| P3-E15 *(master index + T01–T10)* | QC remains the source-of-truth for quality plans, issues, deviations, advisory, and health/readiness records. Reports may consume only governed QC snapshots or publication outputs where a report family explicitly binds to them; Reports does not own or mutate QC source data. |
| P3-E1 §9 | Module classification and review-capable surface designation |
| P3-E2 §14 | Source-of-truth and action boundary for Project Closeout (primary source) and PER annotation layer |
| P3-G1 §4.6, §4.9 | Lane capability matrix for Reports and executive review posture (§4.9 after addition of lifecycle module section §4.8) |
| P3-G2 §8.6 | Cross-lane navigation for Reports (run-ledger history, advanced draft editing) |
| P3-G3 §8 | Lane-specific acceptance for Reports and PER permissions |
| P3-H1 §6.9 | Acceptance staging checklist for Reports T-file family |

---

## 5. Reading Guide

**Starting the implementation:** Read T01 (scope and operating model) → T02 (type contracts) → T05 (template governance) → T03 (draft/snapshot). This sequence establishes the architecture before the lifecycle details.

**Understanding the run lifecycle:** Read T04 (run ledger, approval, release) with P3-F1 §6–§10 open alongside.

**Implementing PER behavior:** Read T07 (review boundaries) with P3-E2 §8.4 and P3-F1 §8.5–§8.6.

**Closeout integration:** Read T06 (section source model and artifact ingestion) with P3-E10-T05 (lessons-learned model and `LessonsLearnedPublicationSnapshot`) and P3-E10-T06 (sub-scorecard model, scoring formulas, and `SubScorecardSnapshot`) for sub-scorecard and lessons-learned data contracts. Snapshot precondition is `PE_APPROVED`; the trigger is PE approval action on the record, not Section 6 item completion.

**Verification and acceptance:** Read T10 for the staged acceptance gate and implementation sequence. Use T08 for spine publication verification.

**Cross-file updates after implementation:** T10 §7 lists all required cross-file changes triggered by E9 work.
