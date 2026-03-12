# @hbc/features-project-hub

Project Hub feature package for HB Intel, including the SF21 Project Health Pulse scaffold.

## 1. Pulse Overview and Value Proposition

Project Health Pulse provides a multi-dimension, confidence-aware health signal for project and portfolio decision-making. The SF21-T01 deliverable creates package boundaries and public contracts only; business computation logic is intentionally deferred.

## 2. Confidence + Compound-Risk + Explainability Architecture Summary

The scaffold introduces explicit domain seams under `src/health-pulse` for:

- confidence computation boundaries
- compound-risk boundaries
- recommendation boundaries
- explainability-ready type contracts

These boundaries are package/domain modules and are not UI-only behavior.

## 3. Top Recommended Action Prioritization Model Summary

The recommendation seam is modeled as a dedicated computor boundary (`computors/recommendation`) so future ranking logic can combine urgency, impact, confidence weighting, and reason codes without coupling to presentation layers.

## 4. Manual-Entry Governance and Office Suppression Policy Summary

Governance and office suppression boundaries are explicitly separated:

- `governance`: manual-entry metadata, policy, and approval semantics
- `computors/office-suppression`: office signal suppression/noise policy seam

T01 provides compile-safe placeholders only; policy implementation is deferred to later SF21 tasks.

## 5. Portfolio Triage Mode Summary

Triage capabilities are modeled as part of the health-pulse domain boundary and will be implemented in later SF21 tasks. The T01 scaffold ensures triage-related contracts can evolve through the package public API instead of internal deep imports.

## 6. Public Exports

| Subpath | Purpose | Intended Use |
|---|---|---|
| `@hbc/features-project-hub` | Runtime feature surface (including `health-pulse` contracts, constants, and barrels) | App/runtime consumption |
| `@hbc/features-project-hub/testing` | Stable SF21 test fixtures and helpers | Unit tests, Storybook, E2E, harnesses |

## 7. Boundary Rules and Telemetry Emission Notes

- Health-pulse computors, governance, and telemetry are explicit package boundaries.
- App routes must not be imported into package runtime.
- Consumers should use declared package exports (`.` and `./testing`) rather than internal file paths.
- Telemetry ownership seam is defined at `src/health-pulse/telemetry`; real emission logic is deferred to SF21-T07.

## 8. Related SF21 Links

- [SF21 master plan](../../../docs/architecture/plans/shared-features/SF21-Project-Health-Pulse.md)
- [SF21-T09 testing and deployment](../../../docs/architecture/plans/shared-features/SF21-T09-Testing-and-Deployment.md)
- [ADR-0110 project health pulse multi-dimension indicator](../../../docs/architecture/adr/ADR-0110-project-health-pulse-multi-dimension-indicator.md)
