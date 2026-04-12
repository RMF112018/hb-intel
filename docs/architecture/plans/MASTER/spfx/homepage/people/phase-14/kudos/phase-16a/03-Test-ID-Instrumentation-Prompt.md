# 03 — Test-ID Instrumentation Prompt

You are working in the live repo for `RMF112018/hb-intel`.

Your task is to close the **runtime locator contract gap** for the HB Kudos browser suite.

## Mandatory directive

Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Objective

Implement the `data-hbc-testid` contract expected by the existing Kudos Playwright lane in the actual runtime surfaces and shared primitives.

## Repo areas to inspect and update

At minimum:

- `e2e/webparts/kudos/helpers/kudosLocators.ts`
- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`
- `apps/hb-webparts/src/homepage/shared/**`
- any shared `@hbc/ui-kit/homepage` primitives that actually render the affected controls

## Required outcomes

### 1. Public root/test controls

Add locator coverage for the actual mounted public surface, including at minimum:

- public root
- Give Kudos trigger
- composer form
- composer preview
- submit
- discard dialog
- Send Another
- people-picker input
- people-picker results
- people-picker empty state
- people-picker error state
- celebrate button
- celebrate count
- View All trigger
- View All panel
- archive search input
- public detail panel

### 2. Companion root/test controls

Add locator coverage for the companion surface, including at minimum:

- companion root
- queue tabs
- queue rows
- queue search filter
- ownership filter
- admin-review-only toggle
- scheduled-only toggle
- aging filter
- companion detail panel
- companion audit timeline
- bulk approve button
- governance action buttons rendered in the detail panel or toolbar

### 3. Shared boundary-sensitive controls

Instrument boundary-sensitive areas so the browser suite can prove:

- public detail does not expose audit timeline
- admin detail does expose audit timeline
- View All feed opens
- archive results open detail
- hosted CTA reachability is real, not guessed

## Implementation rules

- follow the registry in `kudosLocators.ts`
- if the registry is wrong relative to runtime semantics, update it deliberately and in the same commit
- do not use brittle text-only selectors for critical workflow assertions
- prefer colocated instrumentation on the actual actionable/runtime nodes
- do not spam meaningless test ids everywhere; add them where they materially stabilize the suite

## Validation required

Prove:

- public and companion roots render the expected ids
- browser specs can resolve the primary controls without fallback selectors
- no locator in the active Kudos Playwright lane points at a nonexistent runtime id
- no duplicate or ambiguous ids are introduced

## Required deliverables

- runtime/test-id instrumentation committed
- any registry adjustments committed
- brief locator coverage note committed
