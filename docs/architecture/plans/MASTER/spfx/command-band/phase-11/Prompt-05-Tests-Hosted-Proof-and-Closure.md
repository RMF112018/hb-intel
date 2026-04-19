# Prompt 05 — Tests, Hosted Proof, and Closure

## Objective

Replace the current weak proof model with closure evidence that actually verifies the rebuilt launcher outcome.

## Why this prompt exists

The current tests are validating the wrong answer.
They prove alignment to the chip-band and overflow-only phone model.

That means prior “proof” could pass while the visible launcher still failed the real objective.

This prompt closes that loophole.

## Inspect these seams first

- `apps/hb-webparts/src/homepage/__tests__/priorityActionsLauncherAdapter.test.ts`
- `apps/hb-webparts/src/homepage/__tests__/priorityActionsPresentation.test.ts`
- any ui-kit launcher tests that already exist or that you add
- launcher runtime marker code in `HbHomepageLauncherBand` and `HbcHomepageLauncher`
- packaging/version marker seam in `packages/ui-kit/src/HbcHomepageLauncher/constants.ts`

Do **not** re-read files already in active context unless you need to confirm drift, dependencies, or uncertainty after changes.

## Required future state

The proof model must verify:

- desktop/tablet launcher is a tile family, not a chip band
- inline orange `More Tools` tile exists and belongs to the family
- small-handheld uses a single entry tile and all-tools drawer mode
- runtime markers expose the correct active mode
- hosted build/package version still lines up with the intended deployment

## Required implementation changes

### 1. Rewrite tests that encode the wrong target state
Replace tests that assume:
- phone = 3 primary items + overflow
- overflow sheet = overflow-only items
- chip-band semantics are acceptable closure

### 2. Add positive tests for the new target state
At minimum add tests for:
- inline overflow-entry tile variant
- small-handheld single-entry mode
- all-tools drawer content set
- launcher mode runtime markers
- authoritative device/breakpoint mapping

### 3. Preserve package parity proof
Keep or strengthen the launcher version marker posture so hosted DOM inspection can still prove package parity.

### 4. Produce hosted closure evidence
Capture and store proof for:
- desktop/tablet rendered state
- small-handheld rendered state
- opened overflow/menu state where relevant
- opened mobile drawer/sheet state
- console/runtime sanity

## Required closure bundle

Before claiming completion, produce:

- brief change summary
- list of touched files
- test results
- screenshots for desktop/tablet and small-handheld
- runtime marker proof
- statement that the launcher no longer reads as a chip/button strip
- statement that `More Tools` is inline and orange-secondary
- statement that small-handheld uses one entry tile and a full tools drawer

## Guardrails

- Do not close on unit tests alone.
- Do not close on code diff alone.
- Do not close without hosted screenshots.
- Do not close if the final launcher still visibly reads as a button strip.

## Proof of closure

You are done only when the evidence bundle would allow a fresh reviewer to verify the rebuilt launcher outcome without guessing.
