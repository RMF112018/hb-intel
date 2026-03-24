# @hbc/features-project-hub

Project Hub feature package for HB Intel, including SF21 Project Health Pulse contracts, computation, hooks, UI surfaces, and reference integrations.

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
