# Plan Summary — Enhanced Wave 01 (Shell Only)

## Objective

Upgrade the current Wave 01 homepage shell package into an execution-ready shell package that is materially more precise, more exhaustive, and more useful to a local code agent.

This package assumes the live `main` branch is authoritative.

## Enhancement standard

The improved package must do four things better than the existing package:

1. distinguish between shell capabilities that already exist in repo truth and shell gaps that remain open
2. define the missing future state in concrete terms
3. force closure proof rather than aspirational implementation
4. prevent shell work from drifting into module redesign

## Repo-truth starting point

The live shell already has meaningful architecture in place:

- typed shell contracts in `shellTypes.ts`
- explicit entry-state definitions in `breakpointPolicy.ts`
- container-aware resolution via `useShellContainer.ts`
- preset definitions in `defaultPreset.ts` and `presetLibrary.ts`
- protected/configurable decision modeling in `protectedDecisions.ts`
- validation and normalization in `shellValidation.ts` and `shellSchema.ts`
- slot-width and pairing logic in `slotComfortResolver.ts`
- existing unit tests in:
  - `shell/__tests__/breakpointPolicy.test.ts`
  - `shell/__tests__/slotComfortResolver.test.ts`
  - `shell/__tests__/shellValidation.test.ts`

## Main remaining shell gaps

1. the shell does not yet own an explicit **entry-stack policy contract** tying hero budget, action budget, first-lane visibility, and short-height behavior together
2. the current Wave 01 package understates how much of the control-panel groundwork already exists, and therefore does not push hard enough on the remaining persistence and governance edges
3. production still treats hero, priority actions, and the shell as separate mount seams, so future unified governance is not yet backed by a disciplined shared policy seam
4. current tests are useful but are not enough to prove first-screen behavior, breakpoint matrix closure, or inspectable shell diagnostics
5. the current package does not require a strong shell preview / harness path or closure artifact set

## Priority order

1. lock shell-owned boundaries and non-goals
2. encode the entry-stack policy contract and budgets
3. align breakpoint state behavior and diagnostics to the shell-entry spec
4. harden presets, overrides, protected decisions, and persistence boundaries
5. strengthen production orchestration seams across independently mounted top-band surfaces
6. add a shell harness and breakpoint matrix
7. extend automated tests and closure evidence

## Acceptance standard

This work closes only when the shell can prove:
- what it owns
- how it behaves
- why it chooses to stack or pair
- what future maintainers may configure
- what future maintainers may never override
- how the first screen remains brand + action + value across the required device classes
