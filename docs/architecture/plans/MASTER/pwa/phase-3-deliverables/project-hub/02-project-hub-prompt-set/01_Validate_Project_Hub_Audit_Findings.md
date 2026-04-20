# Prompt 01 — Validate Project Hub Audit Findings Against Repo Truth

```text
You are acting as a senior repo-truth, architecture, routing, shell-composition, UX-governance, Project Hub, PWA, SPFx, and implementation-readiness reviewer for HB Intel.

## Objective
Validate the prior Project Hub audit findings against the current repository state before any implementation work proceeds.

Your job is to determine which findings are still true, which have changed, and which need refinement based on current code.

## Critical Instruction
Do not re-read files that are already in your active context window or memory. Only open additional files when needed to close a concrete evidence gap.

## Required Authority Order
Use the following authority order when evidence conflicts:
1. live implementation / routes / page composition / package wiring,
2. `docs/architecture/blueprint/current-state-map.md` for present-state documentation,
3. relevant plan files under `docs/architecture/plans/MASTER/04_Phase-3_Project-Hub-and-Project-Context-Plan.md` and `docs/architecture/plans/MASTER/phase-3-deliverables/*`,
4. your recommendation.

## Findings To Validate
Validate whether the following repo-truth findings are still correct:

1. The live PWA Project Hub is still too flat and/or scaffolded to qualify as the intended project-scoped operating layer.
2. The current Project Hub home still behaves like summary-card / table / scaffold behavior rather than a governed operating surface.
3. `@hbc/project-canvas` already contains the core primitives needed to govern Project Hub home composition, including mandatory / locked tiles, role-default tile support, and persistence.
4. The Project Hub home is not yet sufficiently wired to mandatory operational surfaces such as health, work queue / next moves, related items, activity, and reporting posture.
5. Role-aware and device-aware default view profiles are not yet fully implemented as a governed Project Hub runtime.
6. The current UI governance for Project Hub is not yet fully aligned to `@hbc/ui-kit` and the doctrine in `docs/reference/ui-kit/UI-Kit-*.md`.
7. The current test evidence is not yet sufficient to prove end-to-end correctness for Project Hub role/device defaults, canvas persistence, mandatory tile enforcement, and direct user action flows.

## Audit Scope
Inspect enough of the repo to prove or disprove the findings, including where needed:
- `apps/pwa/*` Project Hub routes, pages, shell composition, and page ownership
- `packages/project-canvas/*`
- `packages/features/project-hub/*`
- any Project Hub-specific registries, layout config, or profile/default-view logic
- any relevant work queue / related items / activity / health consumers
- `@hbc/ui-kit` consumer patterns and the UI doctrine docs
- tests, fixtures, mocks, story-like examples, or E2E coverage relevant to Project Hub

## Validation Tasks
1. Validate each finding individually.
2. For each finding, classify it as:
   - Confirmed
   - Partially Confirmed
   - Disproven
   - Needs Narrowing
3. Cite the exact file paths and code/doc evidence for each conclusion.
4. Identify the minimum implementation implications of the confirmed findings.
5. If any finding is disproven, revise the downstream implementation assumptions accordingly.

## Additional Required Lens
You must explicitly validate whether the current repo already supports or partially supports a governed default-view system using these target profile IDs:
- `hybrid-operating-layer`
- `canvas-first-operating-layer`
- `next-move-hub`
- `executive-cockpit`
- `field-tablet-split-pane`

If not present, state precisely what is missing:
- profile registry
- role/device resolver
- shell-level layout profiles
- tile policy / mandatory tile policy
- persistence model
- test coverage

## Deliverables
Produce:

### 1. Validation Matrix
A concise matrix:
- Finding
- Status
- Evidence
- Implementation implication

### 2. Repo-Truth Corrections
Any changes needed to the audit assumptions before implementation begins.

### 3. Implementation Prerequisite List
A short list of prerequisites that must be satisfied before wiring the live Project Hub home to `@hbc/project-canvas`.

## Acceptance Standard
Do not move into implementation in this prompt.
This prompt is complete only when the findings are either confirmed or corrected with concrete repo evidence.
```
