# Prompt 03 — Canonical Project Hub Routing End-to-End Tests And Validation

You are acting as a senior quality engineer and implementation validator for HB Intel, with expertise in end-to-end testing, route correctness, shell behavior, continuity validation, state recovery, and operational acceptance evidence.

You are working inside the local HB Intel monorepo with direct file access.

## Objective

Create comprehensive end-to-end tests and execution evidence for the canonical PWA Project Hub routing implementation completed in Prompt 02.

The goal is not merely to add smoke tests. The goal is to prove that the routing contract, continuity model, and lane expectations actually work in real user flows.

## Critical Working Rule

Do not re-read files that are already within your current active context or memory unless you need to verify changed content, recover lost context, or inspect a newly relevant dependency.

## First Step

Before adding tests, validate the repo's current testing stack and align with it.

- If a first-class end-to-end stack already exists, use it.
- If multiple test stacks exist, use the one most aligned to current production-facing route validation.
- If no suitable end-to-end stack exists, add the lightest-weight maintainable option that fits repo conventions and explain why.

Do not guess. Inspect the repo and follow the strongest existing testing pattern.

## Required Coverage Areas

Your test suite must validate the routing contract end to end.

### 1. Portfolio Root Behavior
Create tests proving:
- a multi-project user navigating to `/project-hub` lands on the portfolio root
- a single-project user navigating to `/project-hub` is canonicalized to that project
- a user with no accessible projects receives a stable in-shell no-access / unavailable state
- portfolio search/filter/sort state is preserved when drilling into a project and returning

### 2. Project-Scoped Control Center Behavior
Create tests proving:
- direct navigation to `/project-hub/:projectId` resolves the correct project
- refresh on `/project-hub/:projectId` preserves the same project context
- invalid project IDs render an honest unavailable/no-access condition
- unauthorized project IDs render an honest unavailable/no-access condition
- the project-scoped shell/layout reflects the correct active workspace and project context

### 3. Section Route Behavior
Create tests proving:
- direct navigation to `/project-hub/:projectId/:section` lands on the correct section
- refresh on a section route preserves the same project and section
- same-section project switching remains on the same section when allowed
- same-section project switching falls back cleanly to the project root when the destination section is unavailable

### 4. Context Durability And Recovery
Create tests proving:
- route params remain authoritative over cached session/store state
- per-project continuity data does not leak between projects
- project-scoped continuity is restored correctly after a refresh or relaunch within the test model
- portfolio continuity and per-project continuity are isolated from each other

### 5. SPFx / External Launch Compatibility
Where feasible in the existing test stack, create tests or validation coverage proving:
- canonical PWA URLs can be opened from external launch entry conditions
- querystring or launch metadata does not break canonical project resolution
- launch-origin metadata does not override route identity

### 6. Negative And Edge Cases
Include tests for:
- malformed route params
- stale or missing continuity state
- destination-project switch while current section is unsupported
- navigation from portfolio to project and back through explicit UI controls
- hard reload on a project route after continuity state has been populated

## Additional Validation Work

In addition to automated tests:
- inspect whether type checks, lint, and any router-specific validation commands should be run
- run the appropriate validation commands
- collect concrete evidence of pass/fail status
- if any test cannot be automated cleanly, explain why and provide a precise manual validation script

## Test Data / Fixture Rules

- Reuse existing fixtures and mock patterns where possible.
- If new fixtures are needed, keep them minimal and deterministic.
- Do not create test data that obscures route correctness.
- Ensure accessible-project scenarios are explicit and easy to reason about.

## Required Deliverables

### 1. End-to-End Test Files
Add the necessary end-to-end test files and helpers.

### 2. Supporting Fixtures Or Mocks
Add or update only what is required to make the tests deterministic.

### 3. Validation Evidence Summary
Provide a final summary that includes:
- test files added/updated
- test scenarios covered
- commands executed
- pass/fail results
- unresolved failures, if any
- manual validation steps for anything not covered automatically

### 4. Acceptance Crosswalk
Map the completed tests to these acceptance criteria:
- canonical portfolio-root behavior
- canonical project-scoped routing
- durable same-project refresh behavior
- deterministic same-section project switching
- honest invalid/unauthorized handling
- project-scoped continuity isolation
- route-over-store/session precedence
- external launch compatibility

## Constraints

- Do not add shallow smoke tests and call the work complete.
- Do not mock away the routing contract so aggressively that the tests stop proving real behavior.
- Do not bypass real shell or continuity behavior unless the repo's existing test architecture requires controlled mocking.
- Do not leave the implementation unvalidated if the test stack supports full route testing.
- Do not silently ignore failures; report them precisely.

## Success Standard

This prompt is complete only when the repo contains comprehensive end-to-end validation and execution evidence showing that the canonical PWA Project Hub routing contract works as intended in realistic user flows.
