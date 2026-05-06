# 01 — State Model Doctrine Matrix

## Purpose

Convert the governing Wave 15A, UI-kit, SPFx surface, and PCC product-readiness requirements into implementation checks for Wave E.

## Governing Requirement Matrix

| Governing source | Requirement | Wave E implementation implication | Evidence required |
|---|---|---|---|
| Wave 15A README | Wave 15A is a shared-system and product-readiness correction wave, not surface polish. | State language must be treated as a product contract across all surfaces. | File map, tests, screenshot evidence, closeout. |
| Wave 15A state-language standard | Every state must explain what is available, what is not available, why, next action, and owner where applicable. | Shared state model must expose fields for these concepts; surface copy must populate them when state is not self-evident. | State taxonomy matrix and per-surface usage inventory. |
| SPFx State Model Standard | Governed surfaces and major widgets must handle loading, empty, error, success, partial/degraded, authorization, and freshness where relevant. | PCC state kinds must cover `loading`, `empty`, `error`, `live/success`, `degraded`, `blocked`, `unavailable`, `setupRequired`, `readOnly`, and permission constraints. | Tests for state specs, surface states, source-status mapping, and disabled controls. |
| SPFx Surface Scorecard | State-model completeness and interaction completeness are scored categories; missing loading/empty/error handling can be a hard-stop failure. | No surface can rely on a generic fallback as primary user experience. | Scorecard impact log and hard-stop checklist. |
| UI doctrine / command-center composition | State changes must preserve hierarchy and scan path. | State panels must not dominate priority cards unless operationally severe. | Screenshot set across widths and surfaces. |
| Accessibility / keyboard behavior | State and disabled controls must be understandable without hover-only behavior. | Error state uses alert semantics where appropriate; loading uses busy semantics; disabled actions expose reason through visible text and `aria-describedby`. | Accessibility assertions and keyboard notes. |
| Host-runtime resilience | State transitions must remain stable in SharePoint-constrained widths. | State copy must not cause layout collapse or overflow. | Responsive screenshots and bento/card tests. |

## PCC-Specific Adaptation of Homepage Scorecard

The homepage scorecard is adapted to PCC as follows:

| Homepage scorecard category | PCC Wave E adaptation |
|---|---|
| Doctrine and host compliance | State model must comply with SPFx full-page app/widget doctrine and not duplicate SharePoint chrome. |
| UI-kit / premium-stack compliance | Shared PCC primitives should be used instead of ad-hoc banners, cards, or disabled buttons. |
| Token and styling discipline | State severity must use governed tone tokens/classes, not one-off colors. |
| Purpose-fit sophistication | State copy must read like a construction project command center, not a developer preview. |
| Surface composition and hierarchy | State messages should support the primary workflow hierarchy, not become the workflow. |
| Interaction completeness | Disabled controls must be explained or replaced with preview-safe alternatives. |
| State-model completeness | All major state types must be explicit and tested. |
| Contract/data/backend seam rigor | Source-status mapping must distinguish backend unavailable, source unavailable, missing config, stale, unauthorized, and forbidden. |
| Accessibility and keyboard behavior | State and disabled affordances must be readable, keyboard reachable where appropriate, and not hover-only. |
| Validation and closure proof | Screenshot, test, and closeout evidence must accompany the wave. |

## Acceptance Gate Matrix

| Gate | Pass condition |
|---|---|
| Shared state catalog | All allowed state kinds have definitions, severity, required copy fields, and tests. |
| Product copy | No primary UI string uses forbidden developer vocabulary. |
| Surface adoption | All routed PCC surfaces either consume shared state primitives or document a justified exception. |
| Disabled actions | Every inert action has a visible explanation and accessible relation. |
| Diagnostics placement | Build/wave/fixture/read-model diagnostics are not primary user-facing content. |
| Source mapping | Read-model source status maps to operational user language with clear consequence. |
| Evidence | Tests, screenshots, and accessibility notes are captured or explicitly operator-pending. |

## Non-Overclaim Rule

Wave E can improve state-model clarity, interaction affordance, product confidence, accessibility confidence, and visual hierarchy. It cannot independently claim 56/56 readiness because tenant-hosted evidence, full screenshot coverage, and later surface remediation waves remain outside this package.
