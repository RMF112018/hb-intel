# PCC Prompt 04 Split Package — SPFx Unified Lifecycle Client, Fixtures, Seams, and Readiness

## Purpose

This package splits the original Prompt 04 scope into four controlled implementation prompts. The original Prompt 04 combined SPFx API clients, deterministic fixtures, reusable surface seams/components, and rendering/test hardening in one pass. This package separates that work into smaller, reviewable commits.

## Canonical Backend Baseline

Use Prompt 03 commit:

`8d55565bd91ec9f67bf11bbd9e245452327e3113`

Prompt 03 added canonical backend read-model routes:

- `pcc/projects/{projectId}/unified-lifecycle`
- `pcc/projects/{projectId}/project-memory`
- `pcc/projects/{projectId}/project-lenses`
- `pcc/projects/{projectId}/project-traceability`
- `pcc/projects/{projectId}/warranty-trace`
- `pcc/projects/{projectId}/cross-project-knowledge`
- `pcc/projects/{projectId}/unified-search`

Do **not** introduce or use these older/non-canonical route IDs:

- `lifecycle-timeline`
- `traceability-graph`
- `closed-project-references`

Those concepts are internal read-model structures, not public backend/SPFx route IDs.

## Prompt Sequence

1. `04A_SPFX_UNIFIED_LIFECYCLE_CLIENT_PARITY.md`
   - Typed SPFx API client + fixture-client parity only.
   - No UI components.

2. `04B_SPFX_UNIFIED_LIFECYCLE_ADAPTERS_VIEW_MODELS.md`
   - Adapter/view-model normalization and hook seams.
   - No visual component build.

3. `04C_SPFX_UNIFIED_LIFECYCLE_PREVIEW_COMPONENTS.md`
   - Reusable preview components only.
   - No Project Home / Project Readiness integration.

4. `04D_SPFX_UNIFIED_LIFECYCLE_SEAM_HARDENING_CLOSEOUT.md`
   - Test hardening, accessibility/preview-state verification, and readiness closeout.
   - Prepares for Prompt 05 surface integration.

## Global Guardrails

Every prompt must:

- preserve unrelated/user-owned workspace changes;
- avoid backend/model changes unless explicitly required for a compile-blocking issue;
- avoid live external calls;
- avoid tenant mutation;
- avoid package/dependency/lockfile changes;
- avoid broad CSS/theme/shell navigation overhaul;
- preserve canonical route IDs and method names;
- maintain fixture-backed, preview-safe behavior.

## Recommended Commit Style

- Prompt 04A: `feat(spfx-pcc): add unified lifecycle read-model client parity`
- Prompt 04B: `feat(spfx-pcc): add unified lifecycle adapters and view models`
- Prompt 04C: `feat(spfx-pcc): add unified lifecycle preview seams`
- Prompt 04D: `test(spfx-pcc): harden unified lifecycle seam readiness`
