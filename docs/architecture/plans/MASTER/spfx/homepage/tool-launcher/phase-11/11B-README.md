# Phase 11B Prompt Package — Tool Launcher Composition Re-Architecture

## Purpose

This package instructs the local code agent to execute **Phase 11B**, which corresponds to the previously defined **Phase 01** for the Tool Launcher / Work Hub rebuild.

Phase mapping:
- Phase 11A = prior Phase 00
- Phase 11B = prior Phase 01
- Phase 11C = prior Phase 02
- Phase 11D = prior Phase 03
- Phase 11E = prior Phase 04
- Phase 11F = prior Phase 05
- Phase 11G = prior Phase 06
- Phase 11H = prior Phase 07

This phase is the first implementation phase. Its job is to **replace the weak current composition model** with a stronger flagship launcher composition while preserving the live data and runtime seams already identified in Phase 11A.

## Objective

Rebuild the **visual composition architecture** of the Tool Launcher / Work Hub so the surface behaves like a premium homepage command-and-discovery module rather than a generic grid of cards.

This phase should focus on:

- command surface hierarchy
- flagship stage composition
- support / status placement logic
- workflow shelf composition rhythm
- width usage and page-canvas authority
- stronger asymmetry and focal sequence
- host-safe SharePoint behavior
- authoring-safe degraded states

This phase should **not** yet become a deep data-model rewrite or advanced search/discovery rewrite. Those belong to later phases.

## Required Inputs

Use all of the following as primary inputs:

- `docs/architecture/reviews/tool-launcher/phase-11a-tool-launcher-rebuild-readme.md`
- `docs/architecture/reviews/tool-launcher/phase-11a-tool-launcher-rebuild-change-boundaries.md`
- `docs/architecture/reviews/tool-launcher/phase-11a-tool-launcher-rebuild-validation-checklist.md`
- `apps/hb-webparts/src/webparts/toolLauncherWorkHub/`
- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/src/homepage/data/toolLauncherNormalization.ts`
- `apps/hb-webparts/src/homepage/data/useToolLauncherData.ts`
- `apps/hb-webparts/src/homepage/webparts/toolLauncherContracts.ts`
- `packages/ui-kit/`
- `docs/reference/ui-kit/`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`

## Deliverables

The code agent should produce:

1. updated Tool Launcher composition files under:
   - `apps/hb-webparts/src/webparts/toolLauncherWorkHub/`
2. a concise implementation summary:
   - `docs/architecture/reviews/tool-launcher/phase-11b-composition-rearchitecture-summary.md`
3. a validation note:
   - `docs/architecture/reviews/tool-launcher/phase-11b-composition-rearchitecture-validation.md`

## Guardrails

- Do not re-read files that are already in current context or memory.
- Preserve live SharePoint list sourcing and the existing mount/runtime seam.
- Preserve host-safe SPFx behavior.
- Do not revert to a generic card-grid outcome.
- Do not widen scope to unrelated homepage webparts.
- Do not perform a stale-build investigation in this phase.
- Do not let fallback legacy composition dictate the flagship visual system.
- Keep search functionality working, but do not spend this phase trying to fully reinvent search behavior.
- Do not break authoring-mode or empty/loading/error behavior.

## Acceptance Standard

Phase 11B is complete only when the resulting launcher:

- has materially stronger visual hierarchy
- uses the page canvas with more authority
- presents a real command surface and flagship stage
- improves support/status placement and legibility
- keeps runtime data seams intact
- remains host-safe and authoring-safe
- compiles cleanly
- is documented with summary and validation markdown

## Suggested Next Step After Approval

Proceed to **Phase 11C**, which should harden and enrich the presentation model and data behavior.
