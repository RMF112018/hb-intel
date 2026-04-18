# PROMPT 09 — Regression Tests and Behavioral Lock-In

## Implementation objective

Expand regression coverage so the flagship redesign cannot silently regress into a nicer-looking version of the old row/list surface.

## Work classification

**Refinement**

## Exact repo files / seams / symbols to inspect

- `packages/ui-kit/src/HbcPriorityRail/__tests__/HbcPriorityRail.test.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/__tests__/hbHomepageEntryStack.test.tsx`
- any new or adjusted test files required by the redesign
- packaging/build test or verification seams already used in this repo

## Current weakness

The live repo already has useful tests for grouping, overflow accessibility, wrapper order, and shell-boundary integrity. The attached package pair acknowledges this, but still leaves too much freedom for shallow tests that only prove rendering continues.

## Why the current condition is inadequate

The redesign needs behavioral lock-in, not just smoke coverage. Otherwise, a later refactor can strip the flagship path back to the old grammar while tests continue to pass.

## Required future state

Strengthen the test suite so it protects the real intended outcome. The future state must:

- preserve wrapper order and non-migration invariants
- preserve explicit `homepage-flagship` threading
- assert meaningful flagship-vs-default differences
- assert overflow behavior for the retained strategies
- assert compact-state behavior where practical
- assert any newly introduced flagship hierarchy rules that matter materially

## What done actually looks like

Done means:

- tests fail if flagship structure collapses back into the old model
- tests still prove wrapper-owned placement and shell-boundary integrity
- tests remain readable and maintainable
- validation is stronger than “component exists” assertions

## Governing authorities

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- existing repo test seams and current-state architecture boundaries

## Recommended dependencies / development concepts

- Keep tests tightly scoped to behavior and invariants.
- Mock only what is necessary to keep tests stable and meaningful.
- Prefer assertions about product behavior, context threading, and semantic structure over brittle visual snapshots unless a stable snapshot is genuinely useful.

## Required implementation and validation expectations

- Run the relevant test commands.
- Expand wrapper tests where new composition behavior matters.
- Expand shared rail tests where new flagship/default branching matters.
- Record what was added specifically to lock the redesign in place.

## Prohibitions

- Do not write shallow tests that only assert component existence.
- Do not drop existing wrapper-boundary tests because the redesign feels “obvious.”
- Do not rely on manual visual checking alone.

## Mandatory directive

**Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.**
