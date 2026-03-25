# P3-E15: Project Hub QC Module — Master Index

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E15 |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Document Type** | Module Field Specification — T-File Master Index |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-24 |
| **Status** | Specification — T01 through T10 authored; Stage 7 submittal-advisory complete in `@hbc/features-project-hub` v0.1.97 |
| **Related contracts** | P3-E1 §3.7, P3-E2, P3-D1, P3-D2, P3-D3, P3-D4, P3-E5, P3-E8, P3-E9, P3-E10, P3-E11, P3-E14, P3-G1 §4.7, P3-G2, P3-H1, Phase 6 |

---

## T-File Index

This document is the master index for the complete P3-E15 Project Hub QC Module T-file family. T01 through T10 together define the full Phase 3 QC operating model, publication seams, downstream handoffs, and implementation gate for Project Hub quality control.

| T-File | Title | Authored | Key coverage |
|---|---|---|---|
| [T01](P3-E15-T01-Module-Scope-Operating-Model-and-Lane-Boundary.md) | Module Scope, Operating Model, and Lane Boundary | ✓ | Module purpose, user outcomes, anti-goals, lifecycle boundary, internal-only access posture, Project Hub vs Site Controls split, cross-module relationship map, and explicit Phase 3 deferrals |
| [T02](P3-E15-T02-Governance-Ownership-and-Versioning.md) | Governance, Ownership, and Versioning | ✓ | Governed-core vs project-extension model, enterprise publishing authority, promotion-to-core flow, role matrix, project snapshot/version model, update notices, adoption rules, and governance policy ownership |
| [T03](P3-E15-T03-Record-Families-Authority-and-Data-Model.md) | Record Families, Authority, and Data Model | ✓ | Full record-family inventory, source-of-truth ownership, identifiers, metadata sets, state foundations, version/publication expectations, lineage rules, handoffs, and shared-package reuse boundaries |
| [T04](P3-E15-T04-Quality-Plans-Reviews-and-Control-Gates.md) | Quality Plans, Reviews, and Control Gates | ✓ | Full `WorkPackageQualityPlan` and `PreconstructionReviewPackage` operating model; mandatory coverage vs additive high-risk expansion; governed standards and best-practice packet mapping; typed control-gate families (preinstallation meetings, mockups, tests, hold points, witness points); soft-gate statuses; review-finding structure; and required lineage from plan → review package → finding → issue |
| [T05](P3-E15-T05-Issues-Corrective-Actions-and-Work-Queue-Publication.md) | Issues, Corrective Actions, and Work Queue Publication | ✓ | Authoritative `QcIssue` and `CorrectiveAction` ledger; finding/gate/ad hoc origination modes; issue/action lifecycle model; assignment and verifier-close rules; normalized My Work publication contract; SLA/aging/escalation behavior; root-cause qualification hook; and drillback/drilldown rules for scorecards and reports |
| [T06](P3-E15-T06-Deviations-Evidence-and-External-Approval-Dependencies.md) | Deviations, Evidence, and External Approval Dependencies | ✓ | First-class `DeviationOrWaiverRecord`, `EvidenceReference`, and `ExternalApprovalDependency` controls; approved-condition model; governed minimum evidence expectations by use case; internal tracking of AOR/consultant/third-party approvals; conflict handling for newer external or official sources; and readiness / closure effects of unresolved exceptions or approvals |
| [T07](P3-E15-T07-Submittal-Completeness-Advisory.md) | Submittal Completeness Advisory | ✓ | Defines the QC advisory record-family and workflow seam for `SubmittalItemRecord`, `DocumentInventoryEntry`, `OfficialSourceReferenceEntry`, `AdvisoryVerdict`, `AdvisoryException`, `VersionDriftAlert`, and `DownstreamQcActivationMapping`; locks spec/package anchoring, assisted inventory confirmation, manufacturer/official-publisher currentness rules, conflict/recheck logic, and the downstream activation contract into [T03](P3-E15-T03-Record-Families-Authority-and-Data-Model.md), [T04](P3-E15-T04-Quality-Plans-Reviews-and-Control-Gates.md), [T06](P3-E15-T06-Deviations-Evidence-and-External-Approval-Dependencies.md), and [04_Phase-3_Unified-Documents-Enabling-Plan.md](04_Phase-3_Unified-Documents-Enabling-Plan.md) |
| [T08](P3-E15-T08-Health-Scorecards-Root-Cause-and-Responsible-Org-Performance.md) | Health, Scorecards, Root Cause, Recurrence, and Responsible-Org Rollups | ✓ | Governing derived read-model for `QualityHealthSnapshot`, scorecard/drilldown logic, `ResponsibleOrgPerformanceRollupInput`, governed root-cause and recurrence coding, learning-pipeline promotion signals, and project-versus-enterprise quality reporting boundaries aligned to the Health spine |
| [T09](P3-E15-T09-Schedule-Awareness-Lifecycle-Handoffs-and-Downstream-Integrations.md) | Schedule Awareness, Lifecycle Handoffs, and Downstream Integrations | ✓ | Read-only schedule-awareness model; mapping of quality plans, gates, approvals, and advisory activations to activities, milestones, phases, and look-ahead windows; baseline-visible readiness signaling; and preserved-lineage handoff seams to Closeout, Startup, Warranty, and future Site Controls |
| [T10](P3-E15-T10-Implementation-and-Acceptance.md) | Implementation and Acceptance | ✓ | Hard implementation guide with shared-package blockers, stage-gated implementation order, no-go conditions, acceptance criteria by T-file area, validation expectations, and the completed Phase 3 cross-file reconciliation checklist |

---

## Module Overview

Project Hub QC is the **internal quality planning, review, oversight, readiness, issue-governance, and management-projection surface for Phase 3**. It is intentionally not a field-first execution engine. QC owns the governed operating layer that turns quality requirements into plans, reviews, obligations, soft gates, issue/corrective-action governance, evidence references, deviation control, health projection, and versioned project snapshots from preconstruction through pre-punch and turnover-quality readiness.

The module is **baseline-visible in Project Hub**. That baseline visibility does not mean "summary-only." It means the Project Hub lane owns internal planning and control depth while deeper field/mobile execution remains deferred. Phase 3 QC therefore includes real internal control-surface depth for PM, PE, PA, Superintendent, Quality Control Manager, and designated verifiers, while explicitly deferring mobile-first execution, punch operations, and broader site collaboration to [07_Phase-6_Field-First-HB-Site-Control-Plan.md](../07_Phase-6_Field-First-HB-Site-Control-Plan.md).

QC owns non-field-driven planning and management-visible projection through the end of turnover-quality readiness. It does **not** own formal punch, startup commissioning, warranty operations, closeout artifact assembly, or a full submittal workflow. QC also does **not** store package files. It stores governed metadata, references, lineage, decisions, and obligation state while file storage remains in governed document systems.

### Operating Model Summary

| Operating pillar | Phase 3 QC responsibility |
|---|---|
| Governed content | MOE/Admin publishes governed standards, taxonomies, minimum evidence rules, mapping logic, scorecard formulas, and mandatory coverage sets |
| Project control | Projects instantiate quality plans, review packages, issues, deviations, approval dependencies, and advisory records within governed bounds |
| Readiness | QC governs soft-gated readiness for hold points, mockups, tests, preinstallation meetings, and pre-punch / turnover-quality readiness |
| Issue authority | QC is authoritative for the first-class issue and corrective-action ledger and publishes obligations into My Work / Project Work Queue |
| Verification | Responsible parties complete actions; centrally eligible, project-designated HB verifiers verify and close |
| Management projection | QC publishes health snapshots, responsible-organization rollups, root-cause signals, update notices, and versioned project snapshots into Project Hub context |

### Project Hub vs Site Controls Statement

Project Hub QC owns the **planning-and-control layer** for quality. Future Site Controls owns the **deeper field/mobile execution layer**. In Phase 3:

- Project Hub QC owns plans, preconstruction reviews, governed standards, issue governance, deviations, evidence references, external approvals, health projection, and submittal-completeness advisory.
- Site Controls is the future home for deeper field capture, on-site routing, mobile-first execution, degraded-connectivity behavior, and rich field workflows that exceed the controlled Project Hub scope.
- QC is therefore **baseline-visible in Project Hub and explicitly defers deep field execution to Site Controls**.

---

## Locked Decisions Register

The following decisions are binding for the P3-E15 family. T01 through T03 establish the governing base; T04 through T10 must conform to these decisions.

| # | Decision |
|---|---|
| 1 | QC is a hybrid lifecycle module: Project Hub owns internal quality planning, review, oversight, readiness, and management-visible projection; Site Controls owns deeper field/mobile execution later |
| 2 | QC is internal-only in Phase 3; no owner portal, subcontractor portal, or external collaborative workspace is in scope |
| 3 | QC remains baseline-visible in Project Hub and explicitly defers deep field execution to Site Controls |
| 4 | QC is authoritative from preconstruction through pre-punch and turnover-quality readiness; downstream punch, startup, and warranty domains retain their own operational authority |
| 5 | Governed enterprise QC core with controlled project extensions is mandatory; project teams may not create uncontrolled parallel standards |
| 6 | Approved project-created elements may be promoted into governed core only through central governance owner plus discipline-reviewer approval |
| 7 | MOE/Admin is the enterprise governance owner and governed publisher |
| 8 | Quality Control Manager may author candidate governed content, but may not publish governed core without MOE/Admin action |
| 9 | Governed standards / best-practice library is a first-class record family |
| 10 | Work-package quality plans are first-class records, and governed mandatory plan sets may be supplemented by project-selected high-risk additions |
| 11 | Preconstruction review packages and findings are first-class records |
| 12 | QC issue / corrective-action ledger is first-class and authoritative for quality obligations |
| 13 | Review findings may spawn downstream QC issues with preserved lineage; both structured-origin and ad hoc QC issues are allowed |
| 14 | Deviation / waiver records, evidence references, and external approval dependencies are first-class records |
| 15 | Responsible organization plus optional individual is mandatory across plan, issue, corrective-action, deviation, approval-dependency, and advisory follow-up records |
| 16 | Verifier eligibility is centrally governed and project/work-package designated; responsible parties complete work, authorized HB reviewers verify and close |
| 17 | Hold points, mockups, tests, and preinstallation meetings are soft-gated with approvals and escalations, not hard technical stops in Phase 3 |
| 18 | Governed taxonomy plus controlled project extensions applies to standards, plan sets, document families, mapping logic, root-cause models, and scorecard drilldowns |
| 19 | Governed SLA / aging matrix plus controlled project adjustments applies to issues, corrective actions, deviations, and approval dependencies |
| 20 | Governed root-cause / recurrence model plus governed learning pipeline is required |
| 21 | Governed quality health / scorecard model with drilldown and responsible-organization performance rollup is required |
| 22 | QC is schedule-aware and baseline-visible; it publishes readiness signals and versioned project snapshots with governed update notices |
| 23 | QC stores metadata and inventory references only; it does not become a file repository |
| 24 | Submittal-completeness advisory is not a submittal review or workflow tool; it answers completeness/currentness questions only |
| 25 | The submittal advisory uses governed HB baselines plus project/spec overlays, governed document-family taxonomy, product-specific requirements, and official manufacturer / publisher sources only for currentness |
| 26 | The submittal advisory primary record is `SubmittalItemRecord`; spec linkage and package reference are required; before API integration a current document-system package reference is required, and after API integration the canonical Procore submittal reference becomes required where possible |
| 27 | Inventory capture for the submittal advisory is assisted extraction with user confirmation; QC stores inventory metadata and references, not the package files |
| 28 | Advisory results are governed multi-axis verdicts: package completeness, document currentness, reference-match confidence, and manual-review-required |
| 29 | `UnableToVerify` is a governed currentness status and forces manual review |
| 30 | Governed mapping engine plus controlled project overlays determine downstream QC guidance and issue/advisory projection |
| 31 | Submittal advisory activation is two-stage: preliminary guidance at item creation, then full package-dependent activation after acceptable advisory status or approved exception |
| 32 | Approved project basis governs when newer official sources conflict with the selected project basis; newer official versions trigger conflict and recheck advisories, not automatic adoption |
| 33 | Ongoing watch plus change alerts for later version drift is required once the item exists |
| 34 | PH7.7 remains historical input only; the P3-E15 family supersedes the earlier checklist-centric QC concept for Phase 3 planning purposes |

---

## T-File Family Map

### T01 — Scope, Operating Model, and Lane Boundary

T01 defines what Project Hub QC is and is not. It locks the module purpose, the user outcomes, the anti-goals, the lifecycle start and end points, the internal-only access posture, the Project Hub vs Site Controls boundary, the relationship map to Startup, Closeout, Warranty, Schedule, Reports, My Work, and Related Items, and the explicit Phase 3 deferral list. It is the file that prevents QC from drifting into punch, documents, or field-first execution scope.

### T02 — Governance, Ownership, and Versioning

T02 defines how governed QC content is created, extended, promoted, versioned, published, adopted, and retired. It locks MOE/Admin as publisher, the Quality Control Manager candidate-author role, the governed-core vs controlled project-extension model, the promotion-to-core workflow, the versioned project snapshot and update-notice model, approved-project-basis conflict handling, and the role matrix for authoring, reviewing, verifying, closing, approving deviations, publishing core content, and designating verifiers.

### T03 — Record Families, Authority, and Data Model

T03 defines the canonical record vocabulary and the authority model for the module. It inventories every first-class family, defines identifiers, metadata sets, lifecycle foundations, version/publication expectations, lineage rules, and handoff seams, and establishes the shared-package reuse rules. It is the source of truth for what records QC owns and how they connect.

### T04 — Quality Plans, Reviews, and Control Gates

T04 locks the full project quality-planning system. It defines `WorkPackageQualityPlan` as the authoritative plan object, `PreconstructionReviewPackage` as the authoritative package/phase/discipline review object, and soft-gated control families for required preinstallation meetings, mockups, tests, hold points, and witness points. It also establishes mandatory coverage vs additive high-risk expansion, controlled addenda/override rules, review-finding structure, and the required lineage from plan through review and into downstream issues.

### T05 — Issues, Corrective Actions, and Work Queue Publication

T05 defines QC's authoritative obligation ledger. It locks the issue-origination modes, the `QcIssue` and `CorrectiveAction` object models, reviewer/verifier-close behavior, SLA/aging/escalation rules, root-cause qualification hooks, and the exact normalized publication contract into My Work / Project Work Queue. It also separates what is published outward for routing from what remains authoritative only inside QC.

### T06 — Deviations, Evidence, and External Approval Dependencies

T06 defines the first-class control records that let QC operate with rigor under real project constraints: `DeviationOrWaiverRecord` for approved exceptions, `EvidenceReference` for governed metadata-based proof, and `ExternalApprovalDependency` for internally tracked outside approvals. It locks lifecycle states, auditability, minimum evidence expectations, approved-condition handling, and conflict handling between approved project basis and later external or official source changes.

### T07 — Submittal Completeness Advisory

T07 defines the governed advisory seam for determining whether a product/material/system package is complete and current without turning QC into a submittal routing engine. It governs `SubmittalItemRecord`, `DocumentInventoryEntry`, `OfficialSourceReferenceEntry`, `AdvisoryVerdict`, revision history, approved-project-basis conflict and recheck logic, later `VersionDriftAlert` behavior, and the activation mapping that feeds [T04](P3-E15-T04-Quality-Plans-Reviews-and-Control-Gates.md) while relying on [T06](P3-E15-T06-Deviations-Evidence-and-External-Approval-Dependencies.md) for exceptions and [04_Phase-3_Unified-Documents-Enabling-Plan.md](04_Phase-3_Unified-Documents-Enabling-Plan.md) for document-link and no-file-storage boundaries.

### T08 — Health, Scorecards, Root Cause, Recurrence, and Responsible-Org Rollups

T08 defines the derived health model: `QualityHealthSnapshot`, governed scorecard composition, root-cause and recurrence capture, management-visible drilldowns, responsible-organization performance rollups, and the learning pipeline that turns confirmed QC outcomes into governed improvement candidates and update notices. It establishes how QC contributes a quality dimension into Project Hub and leadership visibility without turning scorecards or learning outputs into editable operational records.

### T09 — Schedule Awareness, Lifecycle Handoffs, and Downstream Integrations

T09 defines how QC reads schedule context, publishes readiness signals, hands quality-baseline context into Startup, Closeout, Warranty, and future Site Controls seams, and preserves lineage through those handoffs. It also defines what is baseline-visible in Project Hub now versus what remains deferred to Schedule and field-first Site Controls execution.

### T10 — Implementation and Acceptance

T10 defines implementation sequencing, no-go conditions, shared-package blockers, acceptance criteria, and validation expectations for the full QC family. It also records the Phase 3 cross-file reconciliations completed to integrate P3-E15 into the broader planning set.

---

## Cross-Reference Map

| Concern | Governing or adjacent source |
|---|---|
| Phase 3 module classification | [P3-E1](P3-E1-Phase-3-Module-Classification-Matrix.md) §3.7 |
| Phase 3 action-boundary baseline | [P3-E2](P3-E2-Module-Source-of-Truth-Action-Boundary-Matrix.md) |
| Schedule context and baseline awareness | [P3-E5](P3-E5-Schedule-Module-Field-Specification.md) |
| Safety control-surface and readiness parallels | [P3-E8](P3-E8-Safety-Module-Field-Specification.md) |
| Reports consumption and governed publication patterns | [P3-E9](P3-E9-Reports-Module-Field-Specification.md) |
| Closeout turnover-quality seam | [P3-E10](P3-E10-Project-Closeout-Module-Field-Specification.md) |
| Startup readiness and commissioning seam | [P3-E11](P3-E11-Project-Startup-Module-Field-Specification.md) |
| Warranty downstream seam | [P3-E14](P3-E14-Project-Warranty-Module-Field-Specification.md) |
| Activity publication | [P3-D1](P3-D1-Project-Activity-Contract.md) |
| Health projection | [P3-D2](P3-D2-Project-Health-Contract.md) |
| My Work / Project Work Queue publication | [P3-D3](P3-D3-Project-Work-Queue-Contract.md) |
| Related Items registration | [P3-D4](P3-D4-Related-Items-Registry-Presentation-Contract.md) |
| Lane depth and baseline visibility | [P3-G1](P3-G1-Lane-Capability-Matrix.md) §4.7 |
| Cross-lane navigation and handoff patterns | [P3-G2](P3-G2-Cross-Lane-Navigation-and-Handoff-Map.md) |
| Phase 3 master doctrine | [04_Phase-3_Project-Hub-and-Project-Context-Plan.md](../04_Phase-3_Project-Hub-and-Project-Context-Plan.md) |
| Future field-first execution target | [07_Phase-6_Field-First-HB-Site-Control-Plan.md](../07_Phase-6_Field-First-HB-Site-Control-Plan.md) |
| Historical QC input only | [PH7-ProjectHub-7-QualityControl.md](../../ph7-project-hub/PH7-ProjectHub-7-QualityControl.md) |

---

## Implementation Sequencing Overview

The full P3-E15 family should be read and implemented in this order:

1. T01 — lock scope, lifecycle, lane boundary, and adjacent-module seams before any record modeling.
2. T02 — implement governance ownership, role authority, versioning, snapshot, update-notice, and adoption rules.
3. T03 — implement record-family contracts, identifiers, metadata sets, state foundations, lineage, and shared-package boundaries.
4. T04 — implement quality plans, preconstruction reviews, and soft-gate structures because they create the upstream lineage for the rest of the module.
5. T05 — implement issue/corrective-action ledger and Work Queue publication.
6. T06 — implement deviations, evidence references, and external approval dependencies.
7. T07 — implement the submittal-completeness advisory as a parallel advisory surface, not a workflow engine.
8. T08 — implement health, root-cause, scorecards, responsible-organization rollups, and the governed learning pipeline once the operational QC records are stable.
9. T09 — complete schedule-aware projections, lifecycle handoffs, and future Site Controls seams after plans, issues, advisory, and health projections exist.
10. T10 — use the implementation guide and acceptance criteria as the gate for coding kickoff, publication readiness, and verification that the broader Phase 3 reconciliation remains aligned.

---

## Top Blockers, Dependencies, and Governed Prerequisites

| Type | Requirement | Why it matters |
|---|---|---|
| Governance | MOE/Admin-governed quality standard library, taxonomy floor, evidence minimums, SLA matrices, root-cause model, scorecard logic, and document-family rules | QC cannot safely operate on project extensions alone |
| Role authority | Clear project-role mapping plus centrally governed verifier-eligibility policy | Verification and closure authority is core to QC correctness |
| Shared packages | `@hbc/versioned-record`, `@hbc/record-form`, `@hbc/saved-views`, `@hbc/publish-workflow`, `@hbc/my-work-feed`, `@hbc/related-items`, `@hbc/project-canvas`, `@hbc/notification-intelligence`, `@hbc/session-state`, and `@hbc/sharepoint-docs` | QC must reuse shared runtime and must not invent local substitutes |
| Adjacent seams | Startup commissioning seam, Closeout turnover-quality seam, Warranty downstream seam, Schedule baseline-awareness seam, and future Site Controls field-execution seam | QC lineage, readiness projection, and lifecycle handoff fidelity depend on adjacent modules |
| Source policy | Official-source currentness policy for submittal advisory and approved-project-basis adoption rules | Currentness, conflict, and recheck behavior must be governed centrally |
| Boundary discipline | Explicit prohibition on punch ownership, field-first mobile execution, external collaboration, and file-repository behavior | Prevents QC from violating Phase 3 and Phase 6 scope boundaries |

---

## Acceptance Framing

The P3-E15 family is acceptance-ready when:

- Phase 3 QC is clearly defined as a Project Hub internal control surface with explicit Site Controls deferral for deep field execution.
- Governance authority is unambiguous: MOE/Admin publishes governed core, Quality Control Manager authors candidates only, and project extensions remain controlled.
- Every first-class record family has a clear owner, identifier model, metadata floor, lifecycle foundation, lineage rule, and handoff posture.
- The submittal-completeness advisory is clearly bounded as an advisory surface rather than a submittal workflow engine.
- The docs explicitly prohibit file-repository drift and require reuse of the shared platform packages listed in this family.
- Derived health, scorecard, and handoff projections remain read-only layers over QC source records rather than alternate operational workspaces.

---

## Supersession Note

PH7.7 (`PH7-ProjectHub-7-QualityControl.md`) remains a **historical input** only. Its checklist-centric Phase 1 concept informs background context, but it does not govern Phase 3 QC architecture. P3-E15 supersedes that earlier model for Phase 3 planning by defining a broader governed quality-control surface centered on plans, reviews, issues, deviations, evidence references, advisory signals, and lifecycle handoffs rather than on a flat checklist tool.

---

*[T01 →](P3-E15-T01-Module-Scope-Operating-Model-and-Lane-Boundary.md)*
