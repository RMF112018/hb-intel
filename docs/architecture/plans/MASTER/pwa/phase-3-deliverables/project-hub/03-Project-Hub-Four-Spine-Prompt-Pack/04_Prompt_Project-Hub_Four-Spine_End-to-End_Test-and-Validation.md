# Prompt 04 — Create Comprehensive End-to-End Tests and Validate the Four-Spine Integration Set

## Objective
Create and validate a comprehensive end-to-end test suite for the completed Phase 3 Project Hub four-spine integration set.

This prompt is not just asking for test scaffolding.
It is asking for full validation that the implemented Project Hub home/runtime now proves the four-spine operating model in a user-realistic way.

The scope includes:
- Activity spine implementation
- Work Queue mandatory home-tile integration
- Related Items mandatory home enforcement
- Health placement validation
- home/runtime governance by `@hbc/project-canvas`
- UI compliance with `@hbc/ui-kit` and `docs/reference/ui-kit/UI-Kit-*.md`

## Critical Directives
- Do not re-read files that are already in your active context window or memory unless needed to resolve a specific contradiction.
- First inspect the repo’s existing test stack and extend it; do not introduce a second E2E framework if one already exists.
- Validate the implementation that now exists rather than testing assumptions from the audit.
- All assertions about UI quality, composition, and runtime states must align with `@hbc/ui-kit` and the doctrine in `docs/reference/ui-kit/UI-Kit-*.md`.
- Do not settle for happy-path-only tests.
- Treat the user’s ability to understand posture, ownership, next action, and cross-module continuity as a core acceptance concern.

## Required Validation Targets
You must create end-to-end coverage for the following behaviors where they are supported by repo truth:

### A. Project Hub home runtime
- home loads through the governed canvas path rather than legacy scaffold behavior
- mandatory operational tiles are present
- mandatory tiles cannot be removed through customization
- saved layout behavior does not violate mandatory tile policy

### B. Activity spine
- project-scoped activity data appears in the home/runtime
- user can open the activity detail/panel/surface
- relevant cross-spine events appear if implemented
- empty, loading, degraded, and failure states are handled honestly

### C. Work Queue
- mandatory tile is visible
- project-scoped data renders correctly
- counts/badges are accurate enough for repo-truth fixtures/mocks
- user can move directly into the associated work/action surface
- empty, loading, degraded, and read-only states are handled honestly

### D. Related Items
- mandatory tile is visible
- related records render correctly
- user can navigate to related records/actions without hunting
- role-aware visibility is respected where applicable
- Activity seam behavior is validated if implemented

### E. Health
- Health tile is present in its intended live-home placement
- visibility persists under customization because it is mandatory
- explainability/detail interaction works
- freshness/runtime honesty indicators appear correctly

### F. Routing and continuity
- project-scoped route context persists correctly
- same-project navigation preserves the intended home/runtime posture
- home continues to behave correctly after refresh / relaunch if the repo supports this

### G. UI-kit governance
- the critical home/tile experiences use expected `@hbc/ui-kit` structures/patterns
- obvious doctrine violations are detected and called out if found

## Required Testing Levels
Implement the strongest practical end-to-end validation available in the repo, and supplement it with integration tests if needed.
At minimum, provide:
- true E2E tests for the major user flows
- supporting integration tests where E2E setup would be too brittle or too indirect
- fixtures/mocks/test data needed to make the flows deterministic

## Required Deliverables
Provide all of the following:

### 1. Test Strategy Summary
Explain:
- existing test stack discovered in the repo
- why you used it
- what E2E vs integration boundaries you selected

### 2. Implemented Tests
Create the test files, helpers, fixtures, and any necessary harness updates.

### 3. Validation Run
Execute the relevant tests and report the results.
If failures occur, fix them where appropriate and re-run.

### 4. Coverage / Confidence Assessment
State whether the four-spine integration set is now:
- implementation-complete but not yet fully validated
- functionally validated with meaningful confidence
- blocked by remaining defects

### 5. Remaining Gaps
Call out anything that still prevents true end-to-end confidence.

## Output Rules
- Do not stop at writing unexecuted test files.
- Do not provide only unit tests unless repo truth makes true E2E impossible.
- Make the validation outcome explicit.
- If any of the four spines still fail operationally, say so directly.
