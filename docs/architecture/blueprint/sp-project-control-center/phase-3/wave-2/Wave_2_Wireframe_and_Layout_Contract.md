# Wave 2 Wireframe & Flexible Layout Contract — PCC SPFx Shell Frame

This document specifies the structural layout contract for the Wave 2 PCC Shell Frame. It complements `Wave_2_UIUX_Basis_of_Design.md` (visual direction) and is binding for the implementation prompts that follow Prompt 01.

---

## 1. Layout Model

- The PCC Shell Frame uses a **controlled flexible bento/masonry composition** (W2-ODR-018). It does **not** reuse the homepage paired-row layout.
- Composition is anchored to `docs/reference/ui-kit/dashboard/dashboard-basis-of-design.png` (W2-ODR-019).
- Cards have intentionally varied spans and heights. Uniform card grids are out of scope.
- The shell is composed from `@hbc/ui-kit` primitives only. No new reusable visual primitives are introduced in this app.

## 2. Responsive Contract (Real-Container Derived)

- Span, column count, and stacking are derived from **real container measurements**, not from hardcoded viewport widths.
- The shell must compose meaningfully across at least: ultrawide, laptop, tablet, phone, split-screen, and browser zoom conditions, consistent with the SPFx Governing Standard.
- At narrow widths the bento collapses to a single-column stack while preserving authored hierarchy (primary surfaces first).
- At wide widths the bento expresses asymmetric spans; primary regions take wider footprints, supporting strips take narrower or shorter footprints.
- Layout transitions must avoid sudden focus loss and must preserve visible state during reflow.

## 3. Surface Lanes (One per `PCC_MVP_SURFACE_IDS`)

Each MVP surface enumerated in `PCC_MVP_SURFACE_IDS` (`@hbc/models/pcc`) is realized as a coherent region in the shell. Wave 2 contracts per surface:

| Surface id                | Wave 2 region role                                                                                                              | Key constraints                                                                                                    |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `project-home`            | Densest authored composition; primary entry surface; project profile, priority actions, headline status.                        | Composes existing `@hbc/ui-kit` primitives; no live data; persona gating is display-only.                          |
| `team-and-access`         | Project team summary placeholder + access-request entry placeholder.                                                            | No permission mutation, no group mutation, no approval execution (W2-ODR-016).                                     |
| `documents`               | Unified launch hub for SharePoint Drive, OneDrive, Procore Files, Document Crunch, Adobe Sign source cards/launch placeholders. | No document-management workflow, no upload/edit/check-in/check-out (W2-ODR-013).                                   |
| `project-readiness`       | Read-model summary and entry placeholders for readiness items.                                                                  | No live readiness execution.                                                                                       |
| `approvals`               | Read-model summary of approval checkpoints; entry placeholders only.                                                            | No approval execution (W2-ODR-012).                                                                                |
| `external-systems`        | Launch links + missing-configuration states.                                                                                    | No sync, no mirror, no write-back, no API client, no secrets, no direct SPFx-to-external-system path (W2-ODR-014). |
| `control-center-settings` | Settings entry surface scoped to the PCC settings model.                                                                        | Display-only in Wave 2; no tenant mutation.                                                                        |
| `site-health`             | Read-model summary/indicator frame + repair-request entry placeholder.                                                          | No scanner, no runner, no repair executor, no Graph/PnP, no backend persistence (W2-ODR-015).                      |

## 4. Required States per Region (W2-ODR-009)

Every region above must visibly distinguish: preview, empty, loading, error, missing-config, unavailable-fixture, and unauthorized-persona. The detailed per-state contract is defined in `Wave_2_UIUX_Basis_of_Design.md` §5. Implementations must not collapse multiple states into one. Where a region is gated (e.g. unauthorized persona), the gating UI is display-only and must not assert authoritative authorization.

## 5. Persona, Capability, and Card-Level Contracts

- Persona and capability metadata from `@hbc/models/pcc` (`PccUserRoles.ts`, `PccCapabilities.ts`) governs **display gating only** (W2-ODR-008). Persona-driven hide/show is never an authorization control.
- Conditional fact chips and per-lane markers in card composition follow the workspace pattern: chips render per their own source field, and multi-lane composition tests assert markers per-lane rather than by exact global counts.
- Imperative actions tied to disabled inputs must return structured `{ opened, reason }` results, never silent no-ops. This applies to all entry placeholders (access requests, repair requests, configuration prompts).
- Placeholder copy must be product-safe. It must never reference prompts, waves, "coming soon," or developer/implementation sequencing.
- Generated image labels are fallback a11y labels, never editorial alt text.

## 6. Navigation Contract

- Navigation across surfaces is internal state/tab navigation keyed by `PCC_MVP_SURFACE_IDS` (W2-ODR-006).
- No router library is added in Wave 2.
- The shell must preserve the active surface across reflows.
- Deep-link entry into a specific surface is acceptable via component prop or app-local convention; it must not depend on a routing library or on SharePoint host routing.

## 7. Data Binding Contract

- Sole data source: `PCC_FIXTURES` from `@hbc/models/pcc` (W2-ODR-007).
- Optional injected runtime context is permitted as non-live display input only.
- View-models are app-local under `apps/project-control-center/src/` (W2-ODR-005). View-model evolution is additive; fields are removed only after a workspace-wide grep proves no consumer.
- View-models referencing project records must use only record-backed fields. Missing values render as "Not listed" or omit the field; preview placeholders are acceptable only when clearly labeled.

## 8. Forbidden Layout Patterns

- Reuse of the `hb-intel-homepage` paired-row layout in any form (W2-ODR-018).
- Generic, uniform enterprise card grids without authored variety.
- Hardcoded viewport-width breakpoints (must be real-container derived).
- Single combined empty state covering both page-body-empty and section-secondary-empty cases.
- Silent no-op actions on disabled inputs.

## 9. Out of Scope for the Layout Contract

- Live data wiring of any kind, including Graph/PnP/Procore.
- Permission, group, approval, workflow, repair, or scanner execution.
- New reusable visual primitives outside `@hbc/ui-kit`.
- Dev-harness tab wiring (W2-ODR-004, dev-harness portion — Deferred).
- Manifest, package, or workspace changes; SharePoint manifest version bumps.

## 10. Closeout Posture for Prompt 01

This document is added under `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-2/` only. No code, manifests, scaffolds, or other repo state is changed.
