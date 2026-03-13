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
