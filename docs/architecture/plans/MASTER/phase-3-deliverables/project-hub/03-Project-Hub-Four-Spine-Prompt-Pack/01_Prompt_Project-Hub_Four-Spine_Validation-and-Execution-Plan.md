# Prompt 01 — Validate the Audit Findings and Lock the Four-Spine Execution Plan

## Objective
Validate the attached audit findings against repo truth, then convert the validated findings into an execution-ready implementation plan for completing the Phase 3 Project Hub four-spine integration set.

This prompt is not asking for speculative redesign.
This is a repo-truth validation and implementation-planning pass.

The four-spine integration set is:
- Activity implementation
- Work Queue mandatory tile registration
- Related Items mandatory enforcement
- Health placement validation

## Critical Directives
- Do not re-read files that are already in your active context window or memory unless needed to resolve a specific contradiction.
- Treat the repository implementation as source of truth over stale plan language.
- Validate every audit finding before acting on it.
- Do not assume the audit is correct just because it was provided; verify it.
- Do not treat package maturity as equivalent to live home/runtime integration.
- Do not confuse placeholder surfaces, summary cards, or viewer shells with operational implementation.
- All UI recommendations, implementation changes, and acceptance criteria must be governed by `@hbc/ui-kit` and the doctrine defined in `docs/reference/ui-kit/UI-Kit-*.md`.
- Maintain explicit lane ownership between PWA and SPFx.
- Prefer extending existing architecture and packages over introducing parallel patterns.

## Validate These Audit Findings
You must explicitly validate or refute each of the following:

1. The live PWA Project Hub home is still scaffold/MVP behavior rather than a governed project-canvas operating surface.
2. `@hbc/project-canvas` is sufficiently mature to govern the live Project Hub home runtime.
3. Activity is the only true greenfield spine at the canonical implementation layer.
4. Work Queue is package-complete enough that the remaining gap is primarily mandatory home-tile registration and runtime integration.
5. Related Items is package-complete enough that the remaining gap is primarily mandatory enforcement plus Activity seam completion.
6. Health is already implementation-complete at the package level and primarily needs live-home placement validation.
7. The current home/runtime still does not prove the four-spine operating model end to end.
8. The current Project Hub home does not yet satisfy the action-first, persistent next-move, cross-module continuity, and governed-layout expectations defined in the Phase 3 planning materials.

## Required Audit Scope
Inspect enough of the repo to validate the findings, including where applicable:
- `docs/architecture/plans/MASTER/04_Phase-3_Project-Hub-and-Project-Context-Plan.md`
- relevant files under `docs/architecture/plans/MASTER/phase-3-deliverables/*`
- `docs/architecture/blueprint/current-state-map.md`
- `docs/reference/ui-kit/UI-Kit-*.md`
- `packages/project-canvas/*`
- `packages/related-items/*`
- `packages/my-work-feed/*`
- any canonical Health implementation files under `packages/features/project-hub/*`
- PWA Project Hub route registration and page composition under `apps/pwa/*`
- any SPFx companion/runtime files if they affect lane ownership or home behavior
- current tests, fixtures, mocks, and any acceptance artifacts already present

## Execution Requirements
After validation, produce an execution-ready plan that:

1. Clearly marks each audit finding as one of:
   - Validated
   - Partially Validated
   - Refuted
   - Needs Narrow Follow-up

2. For each validated finding, identify:
   - evidence files
   - actual implementation gap
   - whether the gap is architecture, package wiring, routing/shell, UI/workflow, permissions, cross-module wiring, or test/evidence

3. Produce the recommended implementation order for the four-spine set, including dependencies.

4. Identify the exact repo touchpoints likely required for each spine.

5. Call out all places where UI must be brought into compliance with `@hbc/ui-kit` and `docs/reference/ui-kit/UI-Kit-*.md`.

6. Identify whether any phase plan files or acceptance documents should be updated before or after implementation.

## Deliverables
Produce all of the following in one response:

### 1. Validation Table
A table with columns:
- Audit Finding
- Status
- Repo Evidence
- Notes

### 2. Four-Spine Execution Plan
A dependency-aware implementation sequence that covers:
- Activity
- Work Queue tile registration
- Related Items mandatory enforcement
- Health placement validation

### 3. File Touchpoint Map
For each work packet, list likely files/packages/routes/tests to modify.

### 4. UI-Kit Governance Requirements
A section that states how the home/runtime and tile behaviors must conform to `@hbc/ui-kit` and the `UI-Kit-*.md` doctrine.

### 5. Risk Flags
Call out architectural or sequencing risks.

### 6. Go/No-Go Recommendation
State whether the repo is ready to move straight into implementation of the four-spine set or whether a prerequisite correction is needed first.

## Output Rules
- Be precise and implementation-oriented.
- Cite concrete file paths throughout.
- Distinguish clearly between repo truth, plan intent, and recommendation.
- Do not propose broad rewrites without evidence.
- Do not begin coding.
- This prompt ends with validation and execution planning only.
