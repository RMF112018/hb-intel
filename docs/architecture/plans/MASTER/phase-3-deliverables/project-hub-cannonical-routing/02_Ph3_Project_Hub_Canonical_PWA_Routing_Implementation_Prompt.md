# Prompt 02 — Implement Canonical PWA Project Hub Routing

You are acting as a senior PWA routing architect and implementation engineer for HB Intel, with strong expertise in route trees, shell composition, project-context continuity, lane-aware architecture, and operational workspace design.

You are working inside the local HB Intel monorepo with direct file access.

## Objective

Implement canonical PWA Project Hub routing in strict alignment with repo truth and the validated results of Prompt 01.

This work must:
- resolve Project Hub into a canonical PWA route family
- preserve portfolio-root behavior
- make project context durable across launches and refreshes
- maintain explicit lane separation between PWA and SPFx
- prepare the foundation for the Project Hub to operate as a true project-scoped control center rather than a flat summary page

## Critical Working Rule

Do not re-read files that are already within your current active context or memory unless you need to verify changed content, recover lost context, or inspect a newly relevant dependency.

## Preconditions

Before making changes:
- use the validated findings from Prompt 01 as your baseline
- if Prompt 01 disproved any assumptions below, adapt to repo truth and state the adjustment clearly in your working notes and final summary
- preserve working architecture where it already supports the target design

## Target Routing Contract

Implement a canonical route model equivalent to the following:

- `/project-hub` → permission-aware portfolio root
- `/project-hub/:projectId` → canonical project-scoped control center
- `/project-hub/:projectId/:section` → project-scoped section route(s)

Use the repo's router conventions and naming patterns, but preserve this behavioral contract even if the exact file structure differs.

## Required Behavioral Rules

### Portfolio Root Behavior
- If a user intentionally navigates to `/project-hub` and has access to multiple projects, keep them at the portfolio root.
- If a user intentionally navigates to `/project-hub` and has access to exactly one project, canonicalize to that project's control center.
- If a user has no accessible projects, render an in-shell no-access / unavailable state.
- Preserve portfolio-level search, filter, sort, and scroll continuity when drilling into a project and returning back.
- Provide an explicit `Back to Portfolio` control from project-scoped surfaces where that behavior is relevant.

### Project-Scoped Control Center Behavior
- The URL must be the canonical source of truth for project identity.
- Route resolution must validate the project against actual user access / known project registry.
- Invalid or unauthorized project IDs must render a stable in-shell unavailable/no-access state.
- The project-scoped layout must resolve project identity once and expose it consistently to descendants.
- The control-center route must become the correct parent for future Project Hub tile/canvas/module composition.

### Section Routing Behavior
- Support project-scoped section routes under the canonical project route.
- Same-section project switching should preserve the current section when valid.
- If the destination project does not support the current section, fall back to the destination project's control center root.
- Maintain deterministic launch behavior from notifications, deep links, shell navigation, and SPFx handoff.

### Context Durability Rules
- Route params own canonical project identity.
- Shell/store/session may cache convenience state, but must not silently override URL identity.
- Persist project-scoped continuity state in the appropriate existing continuity layer.
- Recovery state, draft state, queued ops, and return memory must be keyed by project.
- Refreshing a project-scoped URL must restore the same project and same section rather than requiring a hidden project re-selection step.

### Lane Ownership Rules
- Keep the PWA as the canonical deep-link and cross-project routing lane.
- Do not turn SPFx into the canonical owner of Project Hub routing.
- Preserve or improve launch compatibility from SPFx into canonical PWA URLs.

## Implementation Tasks

Carry out the work in the most appropriate repo-truth order.
At minimum, complete the following.

### 1. Refactor Route Registration
- Remove Project Hub from any overly generic flat-workspace route pattern if that pattern prevents canonical nested project routing.
- Introduce a dedicated Project Hub route family.
- Ensure active workspace identity still resolves correctly in shell/navigation state.

### 2. Split Portfolio And Project-Scoped Surfaces
- Refactor the current PWA Project Hub page into distinct surfaces where needed.
- Preserve the useful portfolio-level project listing behavior.
- Introduce a dedicated project-scoped control-center surface.
- Do not leave the current summary/table page as the only Project Hub runtime.

### 3. Add Project-Scoped Layout / Resolver
- Add a route-level resolver/layout/provider that:
  - validates project identity
  - resolves project metadata
  - resolves access posture
  - exposes canonical project context to descendants
  - supports deterministic same-section switching

### 4. Implement Portfolio Continuity
- Preserve portfolio root state across drill-in and return.
- Use existing continuity/session patterns where present.
- Keep continuity keyed appropriately so portfolio state and per-project state do not overwrite each other.

### 5. Implement Project Context Durability
- Ensure refresh, direct deep-link, and relaunch behavior work from canonical URLs.
- Prevent store/session from hijacking URL identity.
- Scope persistence by project.

### 6. Preserve SPFx Launch Compatibility
- Ensure the new routing model can accept entry from SPFx or SharePoint-aware launch points using canonical PWA URLs.
- Where existing SPFx launch contracts exist, update them only as needed to preserve compatibility.

### 7. Add Supporting Non-E2E Tests
- Add or update the appropriate unit/integration/router-level tests that belong with the implementation.
- Reserve full end-to-end coverage for Prompt 03.

## Implementation Constraints

- Do not introduce a new architecture if existing shell/router patterns can be extended cleanly.
- Do not hide invalid project routes behind silent redirects unless that is already a repo-standard and remains user-honest.
- Do not let session or store state silently override route identity.
- Do not weaken lane separation by pushing canonical routing ownership into SPFx.
- Do not implement decorative control-center scaffolding that is not route-correct.
- Do not break current workspace navigation or shell activation behavior.

## Required Output In Your Final Summary

Provide a concise but concrete summary with:

### 1. Implemented Files
List all created, modified, moved, or retired files.

### 2. Behavioral Changes
Describe the exact routing and continuity behavior now supported.

### 3. Repo-Truth Adjustments
State any places where Prompt 01 or prior assumptions needed correction during implementation.

### 4. Known Follow-On Work
Identify anything intentionally left for later that is not required to satisfy canonical routing.

### 5. Validation Run
Report what tests, lint checks, type checks, or local validation commands were executed and whether they passed.

## Acceptance Standard

This prompt is complete only when:
- Project Hub has a canonical PWA route family rather than only a flat workspace page
- portfolio root behavior is preserved and explicit
- project identity is route-canonical and durable
- project-scoped layout resolution is real
- same-section project switching is deterministic
- invalid/unauthorized routes are handled honestly
- the implementation is ready for comprehensive end-to-end testing in Prompt 03
