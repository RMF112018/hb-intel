# 06 — Closure and Validation Checklist

Use this checklist as the hard gate for completion.

## A. Runtime ownership proof

- [ ] `HbHomepage` is no longer only a direct pass-through to `HbHomepageShell`
- [ ] wrapper-owned actions region exists
- [ ] wrapper-owned actions region renders before the shell
- [ ] wrapper root emits stable data attributes proving ownership and order
- [ ] shell still renders its existing occupants without rail-occupant expansion

## B. Contract / config proof

- [ ] wrapper-facing rail config seam exists
- [ ] wrapper seam does not relocate rail list/admin ownership into shell code
- [ ] active audience signal is intentionally propagated
- [ ] band key handling is intentional and typed
- [ ] fallback config behavior is explicit and narrow

## C. Shell-boundary proof

- [ ] `OccupantId` union does not gain `priority-actions-rail`
- [ ] shell preset library does not absorb the rail
- [ ] shell band semantics are not widened just to host the rail
- [ ] shell validation is not repurposed to validate rail content

## D. Comment / doctrine / reference proof

- [ ] no touched file still falsely states that flagship homepage production mounts hero/actions/shell as three separate entry surfaces
- [ ] entry-stack language now distinguishes:
  - canonical stage sequence
  - standalone rail availability
  - flagship homepage wrapper ownership
- [ ] reference-composition comments no longer contradict runtime truth

## E. Page-canvas proof

- [ ] an authoritative inspection path exists for the flagship homepage page canvas
- [ ] the path can detect OOB Quick Links
- [ ] the path can detect standalone `PriorityActionsRail`
- [ ] the path can detect the target authoritative action-layer state
- [ ] the flagship page is proved free of duplicate action layers after cutover

## F. Automated proof

- [ ] automated test or stable snapshot verifies wrapper order
- [ ] test verifies rail does not require shell-occupant registration
- [ ] test verifies wrapper gating / config behavior
- [ ] all touched tests pass
- [ ] lint / typecheck pass for touched packages

## G. Visual proof

Capture proof at minimum for:
- [ ] standard-laptop
- [ ] tablet landscape
- [ ] tablet portrait
- [ ] phone portrait or narrow-width equivalent
- [ ] short-height constrained state if harness permits

Visual proof must show:
- [ ] rail precedes first shell lane
- [ ] no duplicate action layer
- [ ] first shell lane still begins promptly
- [ ] no obvious width / spacing regression

## H. Closure report contents

The final implementation report must include:
- [ ] concise summary
- [ ] file-by-file change list
- [ ] exact commands used for page-canvas inspection / mutation
- [ ] automated validation performed
- [ ] visual proof summary
- [ ] residual risks, only if truly outside scope and tightly bounded

## Hard stop

Do not mark this work complete if any of the following remain true:
- the homepage can still show two action layers
- shell semantics were widened to absorb the rail
- wrapper ownership is not machine-checkable
- comments/docs still contradict runtime truth
- closure depends on future manual tenant work that is not already executable now
