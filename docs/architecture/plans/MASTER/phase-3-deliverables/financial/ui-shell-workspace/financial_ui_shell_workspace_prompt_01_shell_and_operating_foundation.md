# Financial UI / Shell / Workspace — Prompt 01
## Objective
Complete the first UI / shell / workspace workstream for the Financial module by implementing the canonical Financial shell, module home posture, and shared operating-surface foundation required for the Financial module to behave as a real project-scoped operational workspace rather than a passive viewer or log surface.

## Context
You are working inside the HB Intel repo. Your task in this prompt is to implement the Financial module’s core UI / shell / workspace foundation in a way that is aligned with repo truth, Financial doctrine, Project Hub doctrine, and UI governance.

This prompt is not a broad product redesign.
This prompt is not a doctrine-authoring pass except where tiny documentation-adjacent adjustments are strictly required to keep repo truth aligned with the implemented shell behavior.
This prompt is the first implementation pass for the Financial module’s operational UI foundation.

## Critical Guardrails
- Follow repo-truth order strictly:
  1. `docs/architecture/blueprint/current-state-map.md`
  2. authoritative target-architecture / blueprint files
  3. master plans
  4. phase deliverables
  5. local file comments / inferred intent
- Govern all UI through `@hbc/ui-kit` and the doctrine in `docs/reference/ui-kit/UI-Kit-*.md`.
- Use the Financial doctrine package, route/context contract, lane doctrine, source-of-truth/action-boundary doctrine, runtime-governance doctrine, and shared-spine doctrine already completed or updated in prior passes.
- Do not build passive dashboard cards as a substitute for operational surfaces.
- Do not create ad hoc visual patterns outside `@hbc/ui-kit` unless a missing primitive is clearly required; if so, extend the UI kit or document the gap explicitly.
- Do not re-read files that are already in your active context or current memory unless needed to verify a contradiction or retrieve exact evidence.
- Do not blur shell/layout work with backend/runtime shortcuts that violate the established domain boundaries.
- Keep the implementation theme-aware and aligned with the existing app shell and Project Hub experience.

## Files to Inspect First
Inspect the repo directly and ground your work in actual file content, especially:

### Core repo-truth and governing docs
- `docs/architecture/blueprint/current-state-map.md`
- `docs/architecture/plans/MASTER/04_Phase-3_Project-Hub-and-Project-Context-Plan.md`
- `docs/architecture/plans/MASTER/05_Phase-4_Core-Business-Domain-Completion-Plan.md`
- `docs/architecture/plans/MASTER/phase-3-deliverables/financial/`
- the Financial doctrine control index
- route/context doctrine
- lane / cross-lane doctrine
- source-of-truth / action-boundary doctrine
- runtime-governance doctrine
- shared-spine doctrine

### UI governance
- `docs/reference/ui-kit/UI-Kit-*.md`
- any Project Hub UI wireframe / control-center / canvas-first governing files relevant to the Financial module
- any mold-breaker / UX governance docs relevant to workspace design

### Current implementation seams
- `apps/pwa`
- Financial pages, routes, shells, loaders, layouts, and page-level workspace surfaces
- Project Hub host / module shell surfaces
- `packages/features-project-hub`
- `packages/project-canvas`
- `packages/shell`
- `packages/app-shell`
- `packages/ui-kit`
- shared workspace / navigation / page-header / command-rail / panel / layout primitives
- any tests covering current Financial surface behavior

## Required Actions
1. Implement the canonical Financial shell posture.
   - Ensure the Financial module renders as a governed operating workspace within the Project Hub / PWA shell architecture.
   - Establish the correct page composition for:
     - module header / context band
     - project / reporting-period / version posture
     - command area / next-step workspace controls
     - main working region
     - secondary context region where appropriate
   - Remove or refactor any shell behavior that leaves the module acting like a passive viewer, generic table page, or log console.

2. Implement the Financial module home / landing posture.
   - The home surface must act as an operational entry point, not a dashboard-only summary.
   - It must expose actual posture such as:
     - readiness / blockers / stale state
     - ownership / next move
     - workflow state for current period / version
     - links into the governed tool workflows
     - visibility of exceptions requiring attention
   - It must be project-scoped and consistent with the canonical route/context contract.

3. Build the shared operating-surface primitives required by downstream Financial tools.
   - Create or refine reusable workspace patterns for:
     - page header / posture header
     - state ribbons / trust-state disclosure
     - command rail / action clusters
     - workspace tabs or sectional navigation where governed
     - side-panel / drill-in / contextual detail surfaces
     - empty, loading, blocked, stale, review, and published states
   - These patterns must be reusable across Budget Import, Forecast Summary, Checklist, GC-GR, Cash Flow, Buyout, Review/Export, and History/Audit.

4. Ensure route-safe and context-safe shell behavior.
   - The Financial shell must correctly reflect project, period, version, and governed mode where applicable.
   - Deep-link entry, re-entry, and context restoration must not produce broken or ambiguous workspace state.
   - The shell must not hide material context required for safe financial action.

5. Integrate the shared-spine visibility posture at the UI layer where governed.
   - Surface relevant activity / health / work-queue / related-item posture in a way that is operationally useful without turning the page into a passive dashboard.
   - Preserve clear separation between operational work surfaces and secondary awareness surfaces.

6. Tighten theme-aware rendering and UI quality.
   - Ensure light/dark theme fidelity.
   - Ensure layouts support desktop-first operational use and remain structurally sound in narrower widths if current doctrine requires it.
   - Ensure the implementation reflects the intended polish and hierarchy of the existing UI doctrine.

7. Add or update tests.
   - Add focused tests that validate shell composition, posture rendering, key state visibility, and route-safe context behavior.
   - Do not stop at smoke rendering; assert operationally meaningful UI behavior.

## Deliverables
1. Implemented Financial shell / workspace foundation.
2. Implemented Financial module home / landing surface posture.
3. Reusable shared operating-surface UI primitives or governed extensions.
4. Updated route-aware / context-aware shell behavior for the Financial module.
5. Focused tests covering shell / posture / context behavior.
6. A concise changed-files summary.
7. A short list of remaining downstream workspace tasks for Prompt 02.

## Definition of Done
This prompt is complete only when:
- the Financial module has a real governed shell and operating-surface foundation,
- the module home is operational and actionable rather than passive,
- shared UI patterns needed by downstream Financial tools exist and are governed by `@hbc/ui-kit`,
- project / period / version posture is visible and route-safe,
- and the implementation is ready for the individual tool workspace build-out in the next prompt.

## Output Format
Return:
1. objective completed
2. files changed
3. shell / home posture changes made
4. shared workspace primitives created or refined
5. tests added or updated
6. remaining downstream workspace tasks
