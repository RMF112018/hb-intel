# UI Kit Governance Supersession Map

## Purpose

This registry records the current governance status of UI-kit reference docs without bulk-editing each legacy file.

## Status Definitions

- `active`: current governing or actively used normative document.
- `Layer 3 reference`: implementation/API/pattern reference that cannot override doctrine.
- `historical`: background/progress/change-history artifact; not governing authority.
- `superseded`: replaced by newer authority for governance decisions.
- `deprecated`: intentionally retired guidance/tokens with migration posture.
- `unknown`: requires future classification clarification.

## Core Governance Status

| Document                                                                          | Status | Rationale                                                                 |
| --------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------- |
| `docs/reference/ui-kit/README.md`                                                 | active | Primary index and routing authority for UI-kit governance docs.           |
| `docs/reference/ui-kit/doctrine/README.md`                                        | active | Doctrine index and applicability map.                                     |
| `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`           | active | Primary SPFx runtime doctrine authority.                                  |
| `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`             | active | Homepage-specific runtime overlay authority.                              |
| `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Full-Page-App-Widget-Overlay.md` | active | Binding non-homepage SPFx full-page/widget/PCC runtime overlay authority. |
| `docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md`      | active | Binding SPFx scoring and closure enforcement model.                       |
| `docs/reference/ui-kit/doctrine/UI-Doctrine-PWA-Governing-Standard.md`            | active | Primary PWA runtime doctrine authority.                                   |
| `docs/reference/ui-kit/entry-points.md`                                           | active | Entry-point and import-policy authority.                                  |
| `docs/reference/ui-kit/GOVERNANCE-MAP.md`                                         | active | Consumer-type governance routing map.                                     |
| `docs/reference/ui-kit/GOVERNANCE-SUPERSESSION.md`                                | active | Central status map for legacy/current classification.                     |

## Layer 3 Reference Status

| Document Group                                                         | Status            | Rationale                                                                  |
| ---------------------------------------------------------------------- | ----------------- | -------------------------------------------------------------------------- |
| `docs/reference/ui-kit/Hbc*.md`                                        | Layer 3 reference | Component API/usage docs; not doctrine authority.                          |
| `docs/reference/ui-kit/DashboardLayout.md`                             | Layer 3 reference | Layout reference, not runtime governance authority.                        |
| `docs/reference/ui-kit/ListLayout.md`                                  | Layer 3 reference | Layout reference, not runtime governance authority.                        |
| `docs/reference/ui-kit/WorkspacePageShell.md`                          | Layer 3 reference | Shell usage reference; runtime doctrine governs fit/behavior.              |
| `docs/reference/ui-kit/Productive-Lane-Standard.md`                    | Layer 3 reference | Lane-level design/implementation standard subordinate to runtime doctrine. |
| `docs/reference/ui-kit/Presentation-Lane-Standard.md`                  | Layer 3 reference | Lane-level design/implementation standard subordinate to runtime doctrine. |
| `docs/reference/ui-kit/UI-System-Layer-Model.md`                       | Layer 3 reference | Structural model reference that supports doctrine routing.                 |
| `docs/reference/ui-kit/UI-Kit-Usage-and-Composition-Guide.md`          | Layer 3 reference | Composition guidance; not runtime governance authority.                    |
| `docs/reference/ui-kit/UI-Kit-Visual-Language-Guide.md`                | Layer 3 reference | Visual language guidance; not runtime governance authority.                |
| `docs/reference/ui-kit/UI-Kit-Visual-Hierarchy-and-Depth-Standards.md` | Layer 3 reference | Implementation-level hierarchy guidance.                                   |
| `docs/reference/ui-kit/UI-Kit-Field-Readability-Standards.md`          | Layer 3 reference | Implementation-level readability guidance.                                 |
| `docs/reference/ui-kit/UI-Kit-Adaptive-Data-Surface-Patterns.md`       | Layer 3 reference | Pattern reference guidance.                                                |
| `docs/reference/ui-kit/UI-Kit-Wave1-Page-Patterns.md`                  | Layer 3 reference | Pattern reference guidance.                                                |
| `docs/reference/ui-kit/accessibility-patterns.md`                      | Layer 3 reference | Accessibility implementation patterns.                                     |

## Historical and Evidence-Oriented Status

| Document Group                                                             | Status     | Rationale                                            |
| -------------------------------------------------------------------------- | ---------- | ---------------------------------------------------- |
| `docs/reference/ui-kit/UI-Kit-Release-Notes.md`                            | historical | Changelog history; not governing authority.          |
| `docs/reference/ui-kit/UI-Kit-Residual-Debt-Register.md`                   | historical | Debt tracking record; not governing authority.       |
| `docs/reference/ui-kit/UI-Kit-Wave1-Consumer-Map.md`                       | historical | Wave-scoped consumer map from earlier phase context. |
| `docs/reference/ui-kit/UI-Kit-Verification-Coverage-Plan.md`               | historical | Planning artifact for verification posture.          |
| `docs/reference/ui-kit/reference-audit-2026-03-06.md`                      | historical | Point-in-time audit evidence.                        |
| `docs/reference/ui-kit/homepage-webpart-benchmark.md`                      | historical | Benchmark evidence artifact.                         |
| `docs/reference/ui-kit/UI-Kit-Accessibility-Findings.md`                   | historical | Findings/evidence report.                            |
| `docs/reference/ui-kit/UI-Kit-Application-Standards-Conformance-Report.md` | historical | Conformance evidence artifact.                       |
| `docs/reference/ui-kit/UI-Kit-Competitive-Benchmark-Matrix.md`             | historical | Benchmark matrix evidence artifact.                  |
| `docs/reference/ui-kit/UI-Kit-Component-Maturity-Matrix.md`                | historical | Maturity scoring artifact.                           |
| `docs/reference/ui-kit/UI-Kit-Composition-Review.md`                       | historical | Composition review artifact.                         |
| `docs/reference/ui-kit/UI-Kit-Production-Readiness-Scorecard.md`           | historical | Readiness score artifact.                            |

## Deprecated and Unknown

| Document                                          | Status     | Rationale                                                                 |
| ------------------------------------------------- | ---------- | ------------------------------------------------------------------------- |
| `docs/reference/ui-kit/deprecated-tokens.md`      | deprecated | Explicit deprecated-token guidance.                                       |
| `docs/reference/ui-kit/complexity-sensitivity.md` | unknown    | Governance-adjacent file needing targeted classification in later prompt. |

## Supersession Rule

When any Layer 3 reference or historical guidance conflicts with runtime doctrine, runtime doctrine governs.

Prompt 03 keeps supersession centralized in this map and does not bulk-edit every legacy doc header.
