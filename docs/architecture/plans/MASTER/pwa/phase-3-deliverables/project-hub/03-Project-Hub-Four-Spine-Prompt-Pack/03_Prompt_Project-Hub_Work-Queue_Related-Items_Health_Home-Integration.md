# Prompt 03 — Complete Home Integration for Work Queue, Related Items, and Health

## Objective
Complete the Project Hub home/runtime integration work needed to finish three of the four shared spines:
- register Work Queue as a mandatory Project Hub home tile
- upgrade Related Items from optional to mandatory home enforcement
- validate and correct Health placement within the live Project Hub home

All work must be executed in strict alignment with repo truth, the validated four-spine execution plan, `@hbc/project-canvas`, `@hbc/ui-kit`, and the doctrine defined in `docs/reference/ui-kit/UI-Kit-*.md`.

## Critical Directives
- Do not re-read files that are already in your active context window or memory unless needed to resolve a specific contradiction.
- Validate the relevant audit findings again before making changes.
- Do not treat package maturity as equivalent to home/runtime completion.
- The goal is not to add more cards. The goal is to make the live Project Hub home a governed operational canvas.
- All UI must be governed by `@hbc/ui-kit` and `docs/reference/ui-kit/UI-Kit-*.md`.
- Use `@hbc/project-canvas` as the governing home composition layer rather than page-authored summary-card scaffolding.
- Preserve explicit lane ownership between PWA home behavior and deeper PWA/SPFx workflows.

## Required Validation Before Coding
Validate or refute the following:
1. Work Queue package implementation is already mature enough that the remaining gap is primarily mandatory home registration/integration.
2. Related Items package implementation is already mature enough that the remaining gap is primarily mandatory enforcement and any remaining Activity seam hookup.
3. Health is already implemented and registered as a mandatory tile at the package level.
4. The live PWA Project Hub home still does not prove the intended mandatory operational tile family at runtime.
5. The current home still relies too heavily on scaffold summary-card behavior.

## Required Outcomes
You must make the live Project Hub home/runtime prove the mandatory operational spine model.
That includes:
- Project Work Queue visible as a mandatory home tile
- Related Items visible as a mandatory home tile
- Health visibly and correctly placed in the live home runtime
- alignment of layout and tile behavior to `@hbc/project-canvas`
- removal or demotion of legacy scaffold summary-card behavior where repo truth shows it is still governing the home

## Implementation Requirements
### A. Work Queue mandatory tile registration
Complete the missing home-level wiring, including where appropriate:
- registry entry / mandatory policy
- default home placement
- project-scoped data feed wiring
- actionable interaction behavior
- runtime honesty states
- role-aware behavior if required by repo truth

### B. Related Items mandatory enforcement
Complete the missing home-level governance, including where appropriate:
- move the tile from optional to mandatory
- ensure placement/default visibility on the Project Hub home
- ensure interactions route to valid related-record experiences
- ensure any Activity seam from Prompt 02 is used if applicable
- ensure role-aware visibility rules hold

### C. Health placement validation and correction
Validate the live placement and behavior of Health and correct it where needed, including:
- first-load prominence
- mandatory persistence
- correct project-scoped context
- detail/explainability interaction
- runtime honesty and freshness indicators
- alignment with home-canvas composition and `@hbc/ui-kit`

### D. Home runtime governance
Where repo truth supports it, move the Project Hub home away from page-authored scaffold summary-card behavior and onto a governed `@hbc/project-canvas` composition path.

## UI / UX Governance
All UI and composition behavior must:
- use `@hbc/ui-kit`
- comply with `docs/reference/ui-kit/UI-Kit-*.md`
- follow the action-first, operational Project Hub doctrine
- preserve persistent next-move visibility
- shorten navigation distance through cross-module continuity
- distinguish clearly between actionable, read-only, unavailable, degraded, or escalated states

## Required Tests
Add or update comprehensive tests for:
- mandatory tile registration/policy
- home layout persistence without allowing mandatory-tile removal
- project-scoped Work Queue rendering and interaction
- Related Items mandatory visibility and routing
- Health mandatory presence and intended placement
- runtime honesty states for all three tiles
- cross-spine behavior where applicable

## Deliverables
Provide all of the following:

### 1. Repo-Truth Revalidation
Summarize validated findings before implementation.

### 2. Home Integration Changes
Implement the required code changes.

### 3. UI-Kit / Canvas Compliance Notes
State how the resulting home runtime now aligns with `@hbc/ui-kit`, `@hbc/project-canvas`, and `docs/reference/ui-kit/UI-Kit-*.md`.

### 4. Test Coverage Summary
List all tests added/updated.

### 5. Implementation Report
At the end, report:
- changed files
- Work Queue completion status
- Related Items completion status
- Health placement validation result
- remaining gaps, if any

## Output Rules
- Make the changes.
- Do not leave the home-runtime layer partially rewired.
- Do not preserve scaffold summary cards as the governing home architecture if repo truth shows they still dominate the page.
