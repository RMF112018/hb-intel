# Prompt 02 — Implement the Canonical Project Activity Spine

## Objective
Implement the missing canonical Project Activity spine for the Phase 3 Project Hub in strict alignment with repo truth, the validated four-spine execution plan, the Phase 3 deliverables, `@hbc/ui-kit`, and the doctrine defined in `docs/reference/ui-kit/UI-Kit-*.md`.

This prompt is for implementation, not theory.
The intent is to deliver the shared Activity spine so it can power the Project Hub home/activity tile, related governance events, downstream reporting inputs, and project-context continuity.

## Critical Directives
- Do not re-read files that are already in your active context window or memory unless needed to resolve a specific contradiction.
- Before making changes, validate the relevant audit findings again at the code level and state whether they still hold.
- Treat existing architecture as authoritative unless repo truth proves it inadequate.
- Do not introduce a second, competing activity architecture if an extensible canonical path already exists.
- Keep PWA and SPFx lane responsibilities explicit.
- All UI must be implemented using `@hbc/ui-kit` primitives/patterns and must conform to `docs/reference/ui-kit/UI-Kit-*.md`.
- Avoid passive timeline UI; the resulting activity experiences must align with the action-oriented Project Hub doctrine.

## Required Goals
You must implement a canonical Activity spine that can support:
- normalized project activity events
- module/source adapter registration
- project-scoped activity feed queries
- home/canvas activity tile consumption
- activity detail/panel or deeper surface consumption
- reporting/read-model consumption
- governance/event publication from related-item actions and other module actions where appropriate

## Required Validation Before Coding
Confirm or refute the following before implementation:
1. No canonical Activity spine currently exists.
2. Existing related pieces are placeholders, adjacent systems, or UI primitives rather than a complete canonical spine.
3. Related Items has an event seam that should ultimately publish into Activity.
4. The Project Hub home needs Activity as a first-class mandatory operating spine.

## Implementation Requirements
Implement the Activity spine with the strongest repo-aligned architecture you can justify, including where appropriate:
- canonical activity types/contracts
- activity event normalization model
- registry/adapter pattern for event sources
- project-scoped feed query API
- provider/hooks/selectors
- tile component for home/canvas usage
- detail panel/page or equivalent deeper surface
- telemetry and runtime-state handling if that is already a repo pattern
- tests, fixtures, and mock data aligned with the repo’s existing testing strategy

## Required Integration Targets
At minimum, wire the Activity spine so it is consumable by:
- the Project Hub home canvas
- any Project Hub activity detail/panel surface you introduce or align to
- Related Items governance/event publication where repo truth says the seam exists
- reporting/read-model pathways if Phase 3 contracts require it

## UI / UX Governance
All UI must:
- use `@hbc/ui-kit`
- comply with `docs/reference/ui-kit/UI-Kit-*.md`
- match the operational workspace doctrine rather than passive dashboard behavior
- show runtime honesty where applicable: loading, empty, degraded, read-only, stale, or unavailable states
- support role-aware posture where relevant
- be consistent with the canvas-first Project Hub intent

## Deliverables
Complete all of the following:

### 1. Repo-Truth Revalidation
Briefly state the findings you validated before implementation.

### 2. Canonical Activity Spine Implementation
Add the missing contracts, adapters, hooks, components, and integration points.

### 3. Home / Canvas Wiring
Make the Activity spine consumable by the Project Hub home canvas runtime.

### 4. Related-Items Event Hookup
Replace placeholder/no-op behavior if repo truth confirms the seam and wire it into the new Activity spine where appropriate.

### 5. Tests
Add comprehensive tests covering:
- type/contract behavior
- adapter registration and normalization
- project-scoped feed querying
- tile rendering and interaction
- activity detail interaction
- cross-spine event publication where applicable

### 6. Validation Report
At the end, provide:
- changed files
- what was implemented
- what remains intentionally deferred, if anything
- whether the Activity spine is now production-ready for the Project Hub home/runtime

## Output Rules
- Make the changes.
- Do not stop at scaffolding.
- Do not leave the home-canvas consumer path hypothetical.
- Do not invent UI outside `@hbc/ui-kit` or the UI-Kit doctrine.
