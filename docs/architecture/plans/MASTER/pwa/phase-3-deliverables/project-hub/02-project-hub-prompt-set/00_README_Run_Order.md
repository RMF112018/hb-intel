# Project Hub Canvas / Role-Device Default Views — Prompt Set Run Order

## Purpose

This prompt set is designed to be run **in sequence** by a local code agent to:

1. validate the repo-truth audit findings,
2. lock Project Hub UI governance to `@hbc/ui-kit` and the doctrine in `docs/reference/ui-kit/UI-Kit-*.md`,
3. wire the live Project Hub home to `@hbc/project-canvas`,
4. implement role-aware and device-aware default views, and
5. create and validate comprehensive end-to-end test coverage.

## Recommended Run Order

1. `01_Validate_Project_Hub_Audit_Findings.md`
2. `02_Govern_Project_Hub_UI_with_UI_Kit_Doctrine.md`
3. `03_Implement_Project_Hub_Profile_Registry_and_Default_View_Policy.md`
4. `04_Wire_Live_Project_Hub_Home_to_Project_Canvas.md`
5. `05_Create_E2E_Tests_and_Validation_Evidence.md`

## Operating Notes

- Run each prompt in a **fresh agent step** and commit only when the prompt’s acceptance gates are met.
- Do **not** skip Prompt 01. The later prompts assume the findings have been validated against current repo truth.
- If Prompt 01 disproves any prior assumption, later prompts must be adjusted to match repo truth rather than forcing stale assumptions into code.
- The prompts intentionally separate **validation**, **UI governance**, **profile/default-view implementation**, **runtime wiring**, and **E2E validation** so the work can be audited cleanly.

## Embedded Role / Device Default View Policy

These prompts assume the following governed default view policy unless Prompt 01 uncovers a stronger repo-truth reason to refine it:

- **Desktop / large laptop**
  - Portfolio Executive / Executive Reviewer / Executive leadership → `executive-cockpit`
  - Project Executive → `hybrid-operating-layer`
  - Project Manager → `hybrid-operating-layer`
  - Superintendent → `next-move-hub` or `hybrid-operating-layer` if repo truth already strongly favors that shell
  - Field Engineer → `next-move-hub`
  - QA/QC → `canvas-first-operating-layer` or `next-move-hub`
  - Safety leadership → `canvas-first-operating-layer`

- **Tablet**
  - Field-facing roles (Superintendent, Field Engineer, QA/QC, field-oriented Safety) → `field-tablet-split-pane`
  - Executive leadership → `executive-cockpit` compressed tablet variant
  - PM / PE → `canvas-first-operating-layer` or `hybrid-operating-layer` tablet variant based on repo-truth fit

- **Narrow / fallback contexts**
  - Prefer `canvas-first-operating-layer` or a compact `next-move-hub` fallback rather than forcing the full desktop shell.

## Canonical View Profiles

- `hybrid-operating-layer`
- `canvas-first-operating-layer`
- `next-move-hub`
- `executive-cockpit`
- `field-tablet-split-pane`

## Key Architectural Intents Embedded in This Prompt Set

- The Project Hub home must become a **true operating surface**, not a summary-card scaffold or launcher grid.
- `@hbc/project-canvas` must become the governing runtime for the live Project Hub home where canvas-capable profiles apply.
- Mandatory operational regions / tiles must be enforced by code, not merely described in docs.
- UI must be governed by `@hbc/ui-kit` and the doctrine in `docs/reference/ui-kit/UI-Kit-*.md`.
- The implementation must preserve role-aware behavior, project context continuity, runtime honesty, and cross-module work visibility.
