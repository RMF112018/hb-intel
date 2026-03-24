# @hbc/features-project-hub

Project Hub feature package for HB Intel, including Project Health Pulse plus Phase 3 contract-level module implementations for Financial, Schedule, Constraints, Permits, Safety, and Project Closeout.

## 1. Pulse Overview and Value Proposition

Project Health Pulse provides a production-ready, multi-dimension health model for project and portfolio decisions. The package now includes deterministic computation, confidence tiers/reasons, compound-risk escalation, explainability projections, governance controls, triage behavior, and telemetry mapping.

## 2. Confidence + Compound-Risk + Explainability Architecture Summary

Health Pulse is organized by explicit domain seams under `src/health-pulse`:

- `computors/*`: deterministic scoring, confidence, compound-risk, recommendation, office suppression
- `governance/*`: admin policy validation and governance rule enforcement
- `hooks/*`: query/state orchestration and invalidation wiring
- `components/*`: card/detail/tab/admin/inline-edit UI composition
- `integrations/*`: deterministic projections for BIC/notifications/auth/complexity/project-canvas/versioned-record/telemetry

These boundaries are package-domain modules and are not UI-only behavior.

## 3. Top Recommended Action Prioritization Model Summary

Top action ranking is computed from urgency, impact, reversibility window, owner availability, and confidence weighting. Each output includes a reason code and optional source link for auditable action provenance across UI and telemetry consumers.

## 4. Manual-Entry Governance and Office Suppression Policy Summary

Governance and suppression controls are explicit, validated model inputs:

- manual override metadata: reason, actor, timestamp, approval visibility fields
- admin policy validation: weights sum, staleness/override constraints, triage defaults
- office suppression policy: low-impact suppression, clustering window, severity weighting
- override aging and sensitive approval visibility surfaced through hook/component contracts

Manual-entry behavior remains deterministic and policy-driven; no app-route coupling or ad hoc component-only policy logic is used.

## 5. Portfolio Triage Mode Summary

Portfolio triage includes canonical buckets (`attention-now`, `trending-down`, `data-quality-risk`, `recovering`) with deterministic sort/filter behavior and reason projection. Triage updates are driven by pulse recomputation (confidence, compound risk, and recommendation changes) via hook invalidation flows.

## 6. Public Exports

| Subpath | Purpose | Intended Use |
|---|---|---|
| `@hbc/features-project-hub` | Runtime feature surface (contracts, computors, hooks, components, integrations) | App/runtime consumption |
| `@hbc/features-project-hub/testing` | Stable SF21 test fixtures and helpers | Unit tests, Storybook, E2E, harnesses |

Testing exports include canonical fixture factories and state presets:

- `createMockProjectHealthPulse(overrides?)`
- `createMockHealthDimension(overrides?)`
- `createMockHealthMetric(overrides?)`
- `mockProjectHealthStates`

## 7. Boundary Rules and Telemetry Emission Notes

- Health-pulse computors, governance, and telemetry are explicit package boundaries.
- Health-pulse integration adapters live under `src/health-pulse/integrations` and are deterministic projection helpers (no app-route coupling, no side-effect emission).
- App routes must not be imported into package runtime.
- Consumers should use declared package exports (`.` and `./testing`) rather than internal file paths.
- Telemetry payload mapping preserves reason code, confidence context, triage context, compound-risk escalation flag, and decision-quality KPI fields for downstream emitters; emission side effects remain in consuming layers.

## 8. Related SF21 Links

- [SF21 master plan](../../../docs/architecture/plans/shared-features/SF21-Project-Health-Pulse.md)
- [SF21-T09 testing and deployment](../../../docs/architecture/plans/shared-features/SF21-T09-Testing-and-Deployment.md)
- [ADR-0110 project health pulse multi-dimension indicator](../../../docs/architecture/adr/ADR-0110-project-health-pulse-multi-dimension-indicator.md)

## 9. Financial Module (P3-E4) — Stage 7.1

See `src/financial/` for the complete contract-level implementation.

## 10. Schedule Module (P3-E5) — Stage 7.2

See `src/schedule/` for the complete contract-level implementation.

## 11. Constraints Module (P3-E6) — Stage 7.3

T01 Risk Ledger: Risk record model, 8-state lifecycle state machine, 16 governed categories, probability/impact scoring, 6 business rules, health spine metrics, testing fixtures. See `src/constraints/risk-ledger/`.

T02 Constraint Ledger: Constraint record model, 7-state lifecycle state machine, 26 governed categories, 4-level priority, daysOpen calculation, 8 business rules, 6 health spine metrics, testing fixtures. See `src/constraints/constraint-ledger/`.

T03 Delay Ledger: Delay record model with nested time/commercial impact records, 7-state lifecycle with evidence gates, dual schedule reference model, 9 enumerations, 7 business rules, 5 health spine metrics, claims-ready B+/C evidence orientation. See `src/constraints/delay-ledger/`.

T04 Change Ledger: Change event model with line items, Procore mapping record, 9-state lifecycle with approval gate, ManualNative/IntegratedWithProcore dual mode, 7 business rules, 5 health spine metrics. See `src/constraints/change-ledger/`.

T05 Cross-Ledger Lineage: Immutable lineage records, 3 spawn paths with seed data, peer links with bidirectional validation, @hbc/related-items registrations, 5 lineage business rules. See `src/constraints/lineage/`.

T06 Publication & Governance: Live/published state model, record snapshots, review packages, publication authority matrix, 32-team BIC registry, governance configurability framework. See `src/constraints/publication/`.

T07 Platform Integration: 11 shared packages, 14 spine events, 5 handoffs, 8 notifications, 9 work items, 11 health metrics, 7 work queue items, 6 report types. See `src/constraints/integration/`.

T08 Implementation Closure: Contract-level complete. 44 source files, 17 test files, 331 tests. 44 of 53 acceptance items satisfied; 9 runtime/UAT scope.

## 12. Permits Module (P3-E7) — Stage 7.4

T01 Foundation: Thread model, authority matrix, compliance health doctrine (derived, no manual score), 15 locked decisions. See `src/permits/foundation/`.

T02 Record Architecture: 7 record families (PermitApplication, IssuedPermit, RequiredInspectionCheckpoint, InspectionVisit, InspectionDeficiency, PermitLifecycleAction, PermitEvidenceRecord), 15 enumerations, responsibility envelopes. See `src/permits/records/`.

T03 Lifecycle & Governance: Dual state machines (application + issued permit via lifecycle actions), 20-rule transition table, governance constraints, system-driven transitions, API contracts. See `src/permits/lifecycle/`.

T04 Inspection & Compliance: Checkpoint templates (14 master building), deficiency health impact, expiration risk tiers, compliance closeout gate, xlsx import validation. See `src/permits/inspection/`.

T05 Workflow & Downstream: 21 spine events, 18 health metrics, 15 work queue rules, 5 related items, 6 handoffs, 7 BIC prompts, PER annotation scopes. See `src/permits/workflow/`.

T06 UX Surface & Reporting: 5 views, 12 list columns, health indicators, 11 detail sections, 6 dashboard tiles, 6 report types, PER annotation UX. See `src/permits/views/`.

T07 Migration & Import: Flat-to-multi-record mapping (4 record families), status/result tables, migration defaults, validation checklist, evidence upload config, versioned record tracking, future integration points. See `src/permits/migration/`.

T08 Implementation Closure: Contract-level complete. 30 source files, 10 test files, 214 tests. 42 of 52 acceptance items satisfied; 10 runtime/UAT/migration scope.

## 13. Safety Module (P3-E8) — Stage 7.5

T01 Foundation: Module scope, operating model, 16 record families, authority matrix (Safety Manager/Officer primary), incident privacy tiers (3-tier: STANDARD/SENSITIVE/RESTRICTED), PER visibility tiers, composite scorecard dimensions, lane ownership split, 15 locked decisions. See `src/safety/foundation/`.

T02 Workspace Architecture: 16 record family interfaces (SSSP, Addendum, Template, Inspection, CA, Incident, JHA, Pre-Task, Toolbox Prompt, Toolbox Talk, Orientation, Submission, Certification, SDS, Competent-Person Designation, Evidence). See `src/safety/records/`.

T03 SSSP Governance: Governed/instance section model, joint approval (SM+PM+Super), 4-state lifecycle (DRAFT/PENDING_APPROVAL/APPROVED/SUPERSEDED), material change detection, addendum with operationallyAffected routing, rendered PDF document config. See `src/safety/lifecycle/`.

T04 Inspection Program: 12-section standard template with version governance, normalized scoring algorithm (N/A section exclusion, weight renormalization), scorecard snapshot publication, CA auto-generation on failed items. See `src/safety/inspection/`.

T05 Corrective Actions and Incidents: Centralized CA ledger (5 source types), severity-based due dates, isOverdue daily sweep, 4-state lifecycle with verification workflow, 3-tier incident privacy model, LITIGATION_HOLD evidence retention. See `src/safety/corrective-actions/`.

T06 JHA and Toolbox: JHA step-hazard-control structure, competent-person pre-condition enforcement, daily pre-task validation, governed toolbox prompt library, schedule-risk mapping, AI-assisted gap detection (SM review required), hybrid proof model. See `src/safety/jha-toolbox/`.

T07 Orientation and Compliance: Worker orientation with hybrid identity, subcontractor submission review lifecycle, certification expiration sweep (EXPIRING_SOON/EXPIRED), HazCom SDS compliance, competent-person designation with certification linkage. See `src/safety/compliance/`.

T08 Readiness Engine: 3-level evaluation (project/subcontractor/activity), 24 governed blockers (HARD/SOFT), exception model (SM-only), override workflow (joint approval), daily/event-driven re-evaluation, summary projection. See `src/safety/readiness/`.

T09 Publication Contracts: Composite scorecard (5 dimensions + SafetyPosture derivation), sanitized PER projection, 18 activity spine events, 25 work queue rules, 8 related items, 7 reports, 6 handoffs, 7 BIC prompts. See `src/safety/publication/`.

T10 Implementation Closure: Contract-level complete. 45 source files, 17 test files, 507 tests. 54 of 60 acceptance items satisfied; 6 runtime/integration/UAT scope.

## 14. Project Closeout Module (P3-E10) — Stage 7.8

T01 Foundation: Three-class surface model (operational/derived/consumption), 16 owned record families, 10 enumerations, SoT boundary matrix (11 rows), always-on activation model (5 phases), 12 cross-contract references, 14 locked architecture decisions, 7 shared package requirements, 5 operating principles, 10 business rules. See `src/closeout/foundation/`.

T02 Records: 8-state publication model, publication state applicability matrix (10 families), 7 T02 enumerations, 5 operational record interfaces (CloseoutChecklist, CloseoutChecklistItem, SubcontractorScorecard, LessonEntry, LessonsLearningReport), 3 org intelligence provenance contracts (SubIntelligenceIndexEntry, LessonsIntelligenceIndexEntry, LearningLegacyFeedEntry), record family hierarchy (15 relationships), 6 autopsy invariants, 5 autopsy relationships, 10 immutability rules, 12 business rules, testing fixtures. See `src/closeout/records/`.

T03 Checklist: 70-item governed baseline (7 sections), MOE-controlled template library with semantic versioning, jurisdiction variants (PBC/Other), project overlay model (max 5/section), 9-step instantiation sequence, 9 milestone gates, 7 spine events, completion logic (item/section/overall with NA exclusion), 5 calculated items (including 80-day lien deadline), Section 6 integration rules, 13 business rules, testing fixtures. See `src/closeout/checklist/`.

T04 Lifecycle: 9-state project-level lifecycle state machine (8 transitions, 3 PE-gated), 13 milestones with evidence types and external dependency flags, 5 milestone statuses, 6 evidence types, 8-criterion archive-ready gate, 12-row PE approval authority matrix, 8 work queue trigger rules, state machine/milestone/archive-ready business rules, testing fixtures. See `src/closeout/lifecycle/`.

T05 Lessons: 15 lesson categories, 7 delivery methods, 13 market sectors, 6 project size bands, 4 impact magnitudes, system-derived impact magnitude engine (cost/schedule signal extraction, multi-signal resolution), 32 approved action verbs with recommendation validation, 3-layer architecture, 4-step workflow, 9 business rules, Reports snapshot contract with aggregate stats, testing fixtures. See `src/closeout/lessons/`.

T06 Scorecard: 6-section weighted scoring model (29 criteria, weights sum to 1.00), 5-point scale with NA, system-derived performance ratings (5 ranges), section average and overall weighted score formulas, submission validation, FinalCloseout amendment workflow, interim publication exception, 8-row visibility matrix, 3-row org access rules, testing fixtures. See `src/closeout/scorecard/`.

T07 Autopsy: 12 thematic sections (10 always + 2 conditional), 5 finding types, 8 action types, 8 learning legacy output types, 14 root-cause categories, pre-survey model, 10-block workshop agenda, 10 pre-briefing data sources, 4 root-cause levels, per-output PE approval with three-condition publication gate, waiver model, section applicability rules, testing fixtures. See `src/closeout/autopsy/`.

T08 Consumption: 3 data classes (operational/published intelligence/read-only), 3 org intelligence indexes (LessonsIntelligence/SubIntelligence/LearningLegacy) with search dimensions, contextual relevance scoring, 3 Project Hub consumption surfaces, 17 activity spine events, 4 health spine metrics, 2 report artifact families with snapshot preconditions, 7 UI data class rules, role-gated query enforcement, testing fixtures. See `src/closeout/consumption/`.

T09 Permissions: 6 roles, 31-row master role matrix, 2-regime intelligence visibility, 16-field SubIntelligence field visibility, annotation isolation contract (PE/PER annotations never write to operational records), PE approval vs. annotation formal distinction (7 dimensions), 7 PE formal review surfaces, 6 SUPT checklist section scopes, 5 PE work queue items, role-based business rules, testing fixtures. See `src/closeout/permissions/`.

T10 Integration: Package identity (@hbc/project-closeout L5 Feature), 5-surface PWA/SPFx classification, 7 shared package contracts (related-items, versioned-record, field-annotations, workflow-handoff, acknowledgment, bic-next-move, notification-intelligence), 3 spine contracts, 6 prohibited dependencies, 7 lane capabilities, auto-write blocking, testing fixtures. See `src/closeout/integration/`.

## 15. Project Startup Module (P3-E11) — Planning Status

Project Startup is not yet implemented in this package. Its planning and governance set is now aligned to the T01-T10 readiness-program model in the Phase 3 deliverables:

- Startup is a top-level readiness program with six governed subordinate surfaces, not five peer forms.
- The governing lifecycle is the eight-state readiness model with separate certification, PE mobilization authorization, stabilization, and baseline-lock phases.
- The T02 record layer is fixed as 28 Startup-owned record families across four tiers, with the org-governed `StartupTaskTemplate` separated from project-scoped operational records.
- The T03 checklist surface is a governed template-instance model: MOE owns the `StartupTaskTemplate` catalog and each project gets 55 `StartupTaskInstance` records across 4 sections, with first-class `TaskBlocker` handling.
- The T04 contract-review surface is a governed `ContractObligationsRegister`: an active monitoring ledger with `flagForMonitoring`-driven routing, canonical obligation lifecycle states, due-date and recurrence handling, and certification based on documented review/routing/acknowledgment rather than blanket closure.
- The T05 responsibility-routing surface is a governed `ResponsibilityMatrix` engine with 7 PM assignment columns across 71 assignment-bearing rows plus 11 reminder-only rows, 5 Field assignment columns across 27 assignment-bearing rows, category-level named-`Primary` coverage, and critical-category acknowledgment gates.
- The T06 execution-baseline surface treats the PM Plan as an 11-section structured `ProjectExecutionBaseline`, with typed baseline fields, categorized `ExecutionAssumption` records, PM/PX signatures plus PX approval before certification, and immutable `StartupBaseline` continuity into Closeout.
- Readiness review is modeled through six `ReadinessCertification` records plus PE `ReadinessGateRecord` / `ReadinessGateCriterion` evaluation, with `ExceptionWaiverRecord` and `ProgramBlocker` governance for unresolved launch exceptions.
- Closeout continuity is handled through the immutable `StartupBaseline` read model; Startup writes it and Closeout reads it.

Use the canonical planning set before implementation:

- `docs/architecture/plans/MASTER/phase-3-deliverables/P3-E11-Project-Startup-Module-Field-Specification.md`
- `docs/architecture/plans/MASTER/phase-3-deliverables/P3-E11-T01-Operating-Model-Scope-Surface-Map-Lifecycle-Continuity.md`
- `docs/architecture/plans/MASTER/phase-3-deliverables/P3-E11-T02-Record-Families-Identity-Lifecycle-Certifications-Waivers.md`
- `docs/architecture/plans/MASTER/phase-3-deliverables/P3-E11-T03-Startup-Program-Checklist-Library-Readiness-Tasks-Blockers-Evidence.md`
- `docs/architecture/plans/MASTER/phase-3-deliverables/P3-E11-T04-Contract-Obligations-Register-Operating-Model.md`
- `docs/architecture/plans/MASTER/phase-3-deliverables/P3-E11-T05-Responsibility-Routing-and-Accountability-Engine.md`
- `docs/architecture/plans/MASTER/phase-3-deliverables/P3-E11-T06-Project-Execution-Baseline-Startup-Baselines-and-Closeout-Continuity.md`
- `docs/architecture/plans/MASTER/phase-3-deliverables/P3-E11-T10-Implementation-and-Acceptance-Guide.md`
