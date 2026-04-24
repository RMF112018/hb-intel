# Prioritized Remediation Plan

Date: 2026-04-24

## R-01 — Govern Safety runtime binding and deploy proof

- **Gap closed:** G-01, G-02, G-12, G-13
- **Implementation direction:** Replace property-pane-only backend binding with a governed runtime config source or deployment-time injected authority. `acceptedBackendOrigin` must be independent of `functionAppUrl`.
- **Impact:** Prevents a hosted app from silently pointing to the wrong backend/audience.
- **Cross-layer implications:** SPFx packaging, app catalog deployment, Azure Function CORS/auth config, tenant API permission approval.
- **When:** Now
- **Type:** Structural redesign

## R-02 — Lock route/auth contract authority into the frontend

- **Gap closed:** G-03
- **Implementation direction:** Create a Safety route capability matrix aligned to backend `authorizeSafetyRoute()`. Surface preview/ingest/replay capability in UI and tests.
- **Impact:** Reduces unexplained 403s and makes Safety roles understandable.
- **Cross-layer implications:** Backend auth constants, frontend auth bootstrap, UI disabled/action copy.
- **When:** Now
- **Type:** Refinement with contract tests

## R-03 — Align upload intake validation to backend/parser authority

- **Gap closed:** G-04, G-05, G-06, G-07, G-15
- **Implementation direction:** Share or duplicate exact plain calendar date and positive integer validation. Enforce reporting-period status rules. Replace `_hbcUpn` fallback with authenticated user context or backend-claim authority.
- **Impact:** Reduces avoidable 400/422s and improves audit truth.
- **Cross-layer implications:** Upload page, parser/domain types, backend parseIngestionBody tests, UI tests.
- **When:** Now
- **Type:** Refinement

## R-04 — Add production client telemetry and trace correlation

- **Gap closed:** G-08
- **Implementation direction:** Emit structured frontend telemetry for preview/commit/replay/read flows. Include frontend request ID, backend request ID, failure class, route action, role capability, and safe user/session identifiers. Add W3C `traceparent` or equivalent correlation if feasible.
- **Impact:** Makes production support materially easier.
- **Cross-layer implications:** Frontend telemetry package, backend logging, Application Insights/OpenTelemetry conventions.
- **When:** Now / early Wave 02
- **Type:** Structural observability enhancement

## R-05 — Remove or quarantine obsolete REST ingestion helpers

- **Gap closed:** G-09, G-14
- **Implementation direction:** Identify unreachable direct REST commit code and remove it, mark it test-only, or split read-side SharePoint repository from backend command repository.
- **Impact:** Prevents accidental reintroduction of old ingestion model.
- **Cross-layer implications:** Shared package adapters, tests, docs.
- **When:** Wave 02
- **Type:** Structural cleanup

## R-06 — Add replay impact preview / supersede confirmation

- **Gap closed:** G-11
- **Implementation direction:** Before replay with supersede, show retained run metadata, prior inspection, duplicate risk, supersede effect, and explicit confirmation.
- **Impact:** Makes replay behavior match governed commit posture.
- **Cross-layer implications:** Review queue UI, backend replay response details, tests.
- **When:** Wave 02
- **Type:** UX / contract refinement

## R-07 — Clarify provisioning ownership

- **Gap closed:** G-10
- **Implementation direction:** Decide whether provisioning is admin-run external workflow or a separate Safety admin UI. Do not hide provisioning in operator upload flow.
- **Impact:** Avoids admin surface leakage and operator confusion.
- **Cross-layer implications:** Admin route docs, SPFx admin app, runbooks.
- **When:** Now as documentation; implementation later if needed
- **Type:** Governance decision
