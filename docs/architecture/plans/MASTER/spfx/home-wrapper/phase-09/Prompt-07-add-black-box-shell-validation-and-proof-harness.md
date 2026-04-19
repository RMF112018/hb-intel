# Prompt 07 — Add Black-Box Shell Validation and Proof Harness

## Objective

Create a **black-box validation and evidence harness** for the homepage shell so closure is proven by objective host-fit behavior rather than by visual optimism.

## Why this matters

This homepage sits in a constrained SharePoint-hosted surface and relies on responsive orchestration across wrapper, launcher, shell, and hosted occupants.

That is exactly the kind of system that must not be closed with “it looks better now” reasoning.

The repo already contains diagnostics. This prompt requires those diagnostics to be elevated into a closure-ready validation system.

## Exact repo seams to inspect

- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellConformance.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellValidation.ts`
- any existing `__tests__` in the hbHomepage shell area
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/zones/HbHomepageLauncherBand.tsx`
- any test harness or storybook-like seams already available in the repo

## Current implementation problem

The codebase has diagnostics, but closure still lacks a formal evidence matrix that proves:
- no ordinary-content horizontal overflow,
- safe reflow,
- shared launcher/shell entry-state alignment,
- valid slot recipes,
- and stable fallback behavior across representative host widths.

## Required implementation outcome

Add a validation layer that can prove, at minimum:
1. launcher and shell agree on entry state,
2. invalid pairings are prevented or reported,
3. the homepage remains reflow-safe across required widths and zoom conditions,
4. no ordinary-content horizontal overflow appears,
5. and rendered outputs for key host widths can be captured or verified systematically.

This may include:
- assertion helpers,
- unit/integration tests,
- runtime conformance checks,
- and a documented screenshot evidence matrix.

## Specific constraints / guardrails

- Do not rely only on snapshot tests with no semantic assertions.
- Do not create brittle tests that encode incidental markup structure.
- Prefer black-box behavior checks tied to shell diagnostics and visible state.
- Keep the validation system maintainable enough for future shell recipe growth.

## Proof of closure

Closure requires all of the following:
1. a documented validation matrix exists;
2. automated or semi-automated checks cover core width classes and degraded states;
3. no-overflow and no-bad-reflow behavior is explicitly tested or asserted;
4. launcher-shell alignment is verifiable;
5. the code agent returns concrete evidence, not just a statement of confidence.


## Explicit prohibition on unrelated changes

Do not:
- rewrite unrelated hosted application internals,
- alter backend or list-seeding code,
- redesign child modules for cosmetic reasons outside shell-fit requirements,
- or drift into adjacent applications that are not required for this shell closure unit.

## Local code-agent operating instruction

Do **not** re-read files that are already in your active context unless you need to verify drift, dependencies, uncertainty, or the impact of your changes after implementation.

## Required output from the local code agent

Return:
1. files changed,
2. exact structural changes made,
3. why those changes satisfy this prompt,
4. any risks or follow-up observations,
5. and concrete proof of closure against the criteria below.
