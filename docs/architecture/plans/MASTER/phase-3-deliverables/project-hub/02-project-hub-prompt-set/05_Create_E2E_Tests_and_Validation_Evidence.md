# Prompt 05 — Create Comprehensive End-to-End Tests and Validation Evidence

```text
You are acting as a senior QA architecture, end-to-end testing, acceptance-evidence, repo-truth, Project Hub, and implementation-quality engineer for HB Intel.

## Objective
Create and validate comprehensive end-to-end coverage for the Project Hub home after the role/device-aware profile system and `@hbc/project-canvas` wiring are implemented.

## Critical Instruction
Do not re-read files that are already in your active context window or memory. Only open additional files when needed to close a concrete evidence gap.

## Required Context
Assume Prompts 01–04 have already been completed.
This prompt must test the actual implemented runtime, not the intended design only.

## Core Testing Requirement
You must create end-to-end coverage that proves the Project Hub home is:
- role-aware,
- device-aware,
- UI-kit governed,
- canvas-wired where appropriate,
- operationally actionable,
- and stable under real user navigation and persistence conditions.

## Mandatory Test Areas
Create and validate E2E tests for at least the following:

### A. Audit-Finding Validation Through Behavior
- the live Project Hub home no longer behaves as a pure summary scaffold where the new runtime should apply,
- the profile resolver is active,
- mandatory operational surfaces are present.

### B. Role / Device Default View Resolution
Test the correct default profile selection for representative roles and devices:
- executive desktop → `executive-cockpit`
- project manager desktop → `hybrid-operating-layer`
- project executive desktop → `hybrid-operating-layer`
- superintendent desktop → configured work-first/hybrid default per implementation
- field engineer tablet → `field-tablet-split-pane`
- QA/QC tablet → `field-tablet-split-pane` or other validated governed default
- fallback narrow context → compact governed fallback

### C. Project Canvas Wiring
For canvas-capable profiles, prove:
- the page is rendered through `@hbc/project-canvas`,
- mandatory tiles cannot be removed,
- allowed tiles can be rearranged if that behavior is supported,
- layout persistence works as intended,
- profile-specific mandatory region/tiles remain intact after reload.

### D. Project Context Continuity
- direct entry to a project-scoped hub preserves the correct project context,
- refresh preserves the same project + profile + allowed layout state,
- switching projects follows the intended fallback / same-section rules if already implemented,
- profile persistence does not leak across projects or device classes.

### E. Operational Actionability
- health / next move / related item / activity / reporting posture surfaces are present where required,
- selecting a module/tile/work item updates the dependent contextual surfaces correctly,
- direct CTAs are visible and meaningful,
- runtime honesty states are visible where required (read-only, stale, escalates, sync posture, etc.).

### F. UI Governance / Theme / Responsiveness
- verify theme-aware rendering,
- verify responsive behavior per profile,
- verify no critical overflow / broken region collapse / inaccessible touch targets in tablet mode,
- verify `@hbc/ui-kit` governed surfaces remain stable under interaction.

### G. Regression and Error Paths
- unauthorized or unsupported profile/device combinations degrade gracefully,
- missing data / no-data states remain operationally honest,
- persistence corruption or missing saved layout falls back safely to governed defaults,
- field sync / capture status surfaces behave honestly if relevant mocks exist.

## Required Test Artifacts
Produce:
- E2E tests
- any required fixtures / mocks / seed data updates
- a validation summary
- a concise acceptance checklist with pass/fail evidence

## Evidence Requirements
Show:
- which scenarios were added,
- which representative roles/devices were exercised,
- any limitations in local execution,
- the exact commands run,
- pass/fail results,
- any remaining gaps that prevent full confidence.

## Constraints
- Do not stop at unit tests.
- Do not claim correctness based on visual inspection only.
- Do not omit tablet/field profile validation.
- Do not omit persistence and mandatory tile enforcement tests.

## Acceptance Criteria
This prompt is complete only when:
- comprehensive E2E coverage exists for role/device default views and live Project Hub home behavior,
- validation results are reported honestly,
- remaining gaps, if any, are explicitly documented with concrete next actions.
```
