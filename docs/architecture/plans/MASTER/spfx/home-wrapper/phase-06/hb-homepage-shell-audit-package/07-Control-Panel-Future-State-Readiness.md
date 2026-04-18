# 07 — Control-Panel Future-State Readiness

## What is already ready

The shell already has unusually good groundwork for future layout governance:

- protected decisions
- configurable decisions
- occupant registry
- slot roles
- comfort metadata
- preset validation
- diagnostic logging
- container-aware layout resolution

This is a much stronger starting point than a typical SharePoint page build.

## What is not yet ready enough

### 1. The flagship page is still partly governed outside the shell
As long as the live homepage depends on OOB Quick Links and page-author-authored sequencing outside the governed action system, a future control panel cannot fully guarantee flagship quality.

### 2. The shell does not yet appear to reason about content strength / emptiness at orchestration level
That means a future maintainer could still select a preset that leaves empty-state-heavy zones too high unless the runtime adds stronger promotion/demotion logic.

### 3. Utility and discovery are not yet fully normalized into the same control plane
If actions, launcher, search, and shell lanes remain governed by different systems, the future control panel will feel fragmented.

## What should be configurable later

- preset selection
- bounded occupant visibility
- limited reorder inside compatible band families
- descriptive labels and optional metadata
- some compact-vs-standard treatment choices where shell-fit allows it

## What should remain code-governed

- post-hero boundary
- first-lane first-screen requirement
- single-column portrait and phone rules
- prohibited pairings
- prominence ceilings
- maximum dominant occupant count
- short-height compact-banner posture
- shell-fit minimums

## Prepare-now work

1. Migrate the flagship action layer into the governed rail.
2. Add shell-level render-state awareness for empty / stale / invalid occupants.
3. Expand the preset model into an explicit approved library.
4. Normalize utility, shell, and optional discovery surfaces under one reviewable control vocabulary.
5. Add preview validation tooling that rejects quality-degrading layout choices before publish.

## Control-panel conclusion

The architecture is **good enough to prepare now**, but **not good enough to expose widely yet**.
Wave 02 should strengthen the contracts first.
