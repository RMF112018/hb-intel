# Financial UI / Shell / Workspace — Prompt 02
## Objective
Complete the second UI / shell / workspace workstream for the Financial module by implementing the governed tool workspaces and workflow surfaces for the Financial module so each major Financial capability is actionable, operational, and aligned with repo truth.

## Context
Prompt 01 should already be complete.
Use the implemented Financial shell, module home posture, shared workspace primitives, route/context contract, runtime-governance package, source-of-truth/action-boundary package, and shared-spine package as the foundation for this pass.

This prompt is a workspace implementation pass.
It is not a doctrine-only pass.
It is not a backend redesign pass.

## Critical Guardrails
- Stay grounded in repo truth and the live doctrine package.
- Govern all UI through `@hbc/ui-kit` and the doctrine in `docs/reference/ui-kit/UI-Kit-*.md`.
- Implement real work surfaces, not read-only proxies or summary-only mockups.
- Do not collapse distinct tool workflows into one generic page if doctrine defines separate operational posture.
- Preserve route/context correctness, authority boundaries, trust-state visibility, and runtime honesty.
- Do not re-read files that are already in your active context or current memory unless needed to verify a contradiction or retrieve exact evidence.
- Do not shortcut workflow behavior by bypassing the established repositories, facades, or governed action seams.

## Files to Inspect First
Inspect the repo directly and ground this pass in actual file content, especially:

### Governing doctrine and prior implementation foundation
- the Financial doctrine control index
- route/context doctrine
- lane / cross-lane doctrine
- source-of-truth / action-boundary doctrine
- runtime-governance doctrine
- shared-spine doctrine
- Prompt 01 implementation surfaces and tests

### Financial tool-specific doctrine
- Budget Import governance files
- Forecast Summary governance files
- Forecast Checklist governance files
- GC-GR governance files
- Cash Flow governance files
- Buyout governance files
- Review / PER / Publication / Export governance files
- History / Audit governance files

### Current implementation seams
- all Financial page / route / component surfaces in `apps/pwa`
- Project Hub host surfaces if they materially affect tool rendering
- `packages/features-project-hub`
- `packages/ui-kit`
- any Financial repositories, hooks, providers, panels, drawers, forms, and test files

## Required Actions
1. Implement the real Budget Import operating surface.
   - Build a project-scoped, operational workspace for import review, validation posture, reconciliation visibility, import-session history, and actionable next steps.
   - Do not leave this as a log viewer or thin upload wrapper.

2. Implement or complete the Forecast Summary workspace.
   - The surface must behave as the core PM / PX financial working surface for the current reporting period and version posture.
   - It must expose readiness, ownership, narrative posture, blockers, and governed drill-through into underlying financial tools.

3. Implement or complete the Forecast Checklist workspace.
   - Checklist state must be visible, actionable, and gating where doctrine requires.
   - Return / revise / resolve behavior must be reflected in the UI.

4. Implement or complete the GC-GR workspace.
   - Provide a real editing / review workspace aligned to governed calculation and summary behavior.
   - Preserve trust-state and lineage visibility where required.

5. Implement or complete the Cash Flow workspace.
   - Support the governed monthly operating behavior, including actuals/freeze posture, overrides where allowed, and period continuity cues.
   - Make state and authority visible.

6. Implement or complete the Buyout workspace.
   - Support actionable buyout workflow posture, ownership, readiness, risk, and disposition visibility.
   - Do not reduce it to a flat log or static table.

7. Implement or complete Review / PER / Publication / Export workspaces.
   - Build the review-custody surfaces and publication/export interaction model required by doctrine.
   - Ensure users can understand status, required action, eligibility, and artifact posture.

8. Implement or complete the History / Audit workspace.
   - This must behave as an investigation and traceability surface, not a passive changelog page.
   - Support clear case-based navigation into prior periods, versions, releases, or events where doctrine requires.

9. Normalize the workspace interaction model across tools.
   - Ensure consistent command placement, trust-state treatment, posture disclosure, panel behavior, status handling, and route-driven navigation.
   - Reuse the shared workspace primitives from Prompt 01.

10. Add or update tests.
   - Add meaningful tests covering the core operational states and workflows for each implemented tool surface.
   - Prefer tests that prove actionability, state disclosure, and guarded transitions over superficial render checks.

## Deliverables
1. Implemented or completed Financial tool workspaces.
2. Consistent governed interaction model across Financial tools.
3. Updated route-aware navigation between tool surfaces.
4. Focused tests for the major tool workspaces.
5. A concise changed-files summary.
6. A short list of remaining gaps to validate in Prompt 03.

## Definition of Done
This prompt is complete only when:
- the major Financial tools render as real workspaces rather than passive viewers,
- the implemented surfaces reflect governed posture, authority, trust-state, and next-step behavior,
- the interaction model is consistent across the Financial module,
- and the package is ready for operational validation and implementation-safety review.

## Output Format
Return:
1. objective completed
2. files changed
3. tool workspaces implemented or completed
4. key workflow / posture behaviors now surfaced
5. tests added or updated
6. remaining gaps to validate
