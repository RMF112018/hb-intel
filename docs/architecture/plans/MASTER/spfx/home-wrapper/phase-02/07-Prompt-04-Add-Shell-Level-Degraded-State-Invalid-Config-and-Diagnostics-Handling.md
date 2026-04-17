# Prompt 04 — Add Shell-Level Degraded State, Invalid-Config, and Diagnostics Handling

## Objective

Replace silent shell degradation with visible, stable, diagnosable fallback behavior for:
- zone failures
- invalid occupant assignments
- invalid presets
- missing or incompatible slot states

This prompt makes the shell trustworthy under partial failure.

## Why this shell issue exists / current-state problem

`ZoneErrorBoundary.tsx` currently catches render failures and returns `null`.

That means a slot can disappear without any shell-visible indication.

As soon as the shell becomes data-driven, silent failure gets even riskier because the failure modes expand to include:
- invalid preset ids
- slot/occupant mismatch
- unknown occupant ids
- malformed persisted layout state
- capability-rule violations

The shell needs one coherent degraded-state posture.

## Repo-truth evidence and exact shell files / seams to inspect

Inspect at minimum:

- `apps/hb-webparts/src/webparts/hbHomepage/ZoneErrorBoundary.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx`
- shell schema / validation files from Prompt 01
- shell renderer files from Prompt 02
- any shell-owned layout/fallback components you add

Also review current benchmark expectations for validation and closure.

## Why the current shell implementation is insufficient

Returning `null` is insufficient because it causes:

- invisible content loss
- weak author safety
- unclear runtime diagnosis
- broken shell rhythm under partial failure
- no distinction between:
  - empty but valid
  - failed
  - invalidly configured
  - intentionally inactive

Those states should not all look the same.

## Required shell implementation outcome

### 1. Replace silent null collapse with visible shell-safe fallbacks
Introduce shell-level fallback surfaces or wrappers that:
- preserve shell rhythm
- explain that a section is unavailable without panic or debug noise
- remain visually compatible with the shell
- do not leak raw stack traces into viewer-facing UI

### 2. Distinguish failure classes
The shell should be able to distinguish at minimum:
- valid-but-empty
- render failure
- invalid preset
- invalid occupant/slot assignment
- intentionally inactive candidate occupant

### 3. Normalize invalid layout states
If incoming shell state is invalid, the shell should:
- normalize where safe
- fall back to default preset where necessary
- emit diagnostics that are useful to engineers and test artifacts
- keep the public shell stable

### 4. Add shell diagnostics metadata
Add stable diagnostics hooks such as:
- data attributes
- explicit console warnings/errors where appropriate
- testable error-state identifiers
- slot / occupant / preset ids exposed in a disciplined way

### 5. Preserve accessibility and visual calm
The shell fallback posture must be:
- non-panicked
- keyboard safe
- reflow-safe
- understandable in SharePoint host reality

## What done really looks like

You are done only when all of the following are true:

1. A failed zone no longer vanishes silently.
2. Invalid shell state does not cause unpredictable public rendering.
3. Empty, inactive, invalid, and failed states are distinguishable.
4. Fallback surfaces preserve page rhythm and do not wreck hierarchy.
5. Diagnostics exist that make regressions testable and explainable.
6. Viewer-facing error treatment stays calm and professional.

## Constraints / prohibitions

- Do not surface raw stack traces in public UI.
- Do not add noisy developer chrome to normal viewer runtime.
- Do not confuse empty state with error state.
- Do not hide invalid-state handling only inside logs.
- Do not leave shell rhythm vulnerable to section disappearance.

## Proof of closure required

Provide all of the following:

1. exact files changed
2. before vs after failure behavior
3. fallback state matrix showing:
   - empty
   - failed
   - invalid
   - inactive
4. diagnostics hooks added
5. explanation of how shell rhythm remains stable under partial failure
6. validation notes showing how these states can be tested


## Instruction not to re-read files that are still in active context unless needed to confirm drift, dependencies, or uncertainty after changes

Do not re-read files that are still in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
