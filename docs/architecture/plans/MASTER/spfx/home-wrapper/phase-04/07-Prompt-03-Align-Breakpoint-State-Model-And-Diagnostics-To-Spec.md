# Prompt 03 — Align Breakpoint State Model and Diagnostics to Spec

## Objective

Close the remaining gap between the governing shell-entry breakpoint spec and the runtime shell state model by hardening:
- state definitions
- short-height behavior
- runtime diagnostics
- inspectable pairing/stacking reasoning

The repo already has a breakpoint model. This prompt is about making it fully closure-ready.

## Why this issue exists in the current code

The existing shell already includes:
- seven entry states
- width-based and short-height state resolution
- container-aware measurement
- unit tests for state selection

That means the problem is no longer “introduce breakpoints.”  
The problem is that Wave 01 still needs stronger proof and inspectability around:
- practical shell target alignment
- short-height handling
- shell-selected state visibility
- why a band paired or stacked in a given state

## Current repo-truth evidence

Use at minimum:
- `docs/reference/shell/HB-Shell-Entry-Breakpoint-Spec.md`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/breakpointPolicy.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/useShellContainer.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/slotComfortResolver.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.module.css`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/__tests__/breakpointPolicy.test.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/__tests__/slotComfortResolver.test.ts`

## Required future state

You are done only when all of the following are true:

1. The runtime entry-state model maps cleanly to the governing shell-entry matrix.
2. Short-height constrained behavior is explicit and inspectable.
3. Runtime diagnostics can explain:
   - selected entry state
   - pairing allowed vs denied
   - comfort-forced stacking
   - normalization-driven changes where relevant
4. CSS and runtime behavior are aligned and can be proven aligned.
5. The shell can be inspected at each required entry class without ambiguity.

## Files / seams / symbols to inspect

Inspect at minimum:
- `SHELL_ENTRY_STATES`
- `resolveEntryState`
- `useShellContainer`
- `resolveBandLayout`
- shell data attributes emitted by `HbHomepageShell`
- breakpoint / slot-comfort unit tests

## Implementation requirements

1. Review the current entry-state ranges against the governing practical shell targets.
2. Tighten any ambiguous state naming, metadata, or comments that make closure proof harder.
3. Ensure short-height behavior is explicit, not implicit.
4. Expose or improve stable runtime diagnostics for breakpoint and layout reasoning.
5. Confirm CSS breakpoints and runtime decision thresholds do not drift.

## Validation / proof of closure

Return all of the following:
1. exact files changed
2. the final entry-state map
3. the final short-height rule
4. a breakpoint-by-breakpoint reasoning summary
5. examples of diagnostics proving:
   - selected state
   - paired vs stacked outcome
   - reason strings for constrained states
6. explanation of how CSS and runtime thresholds were validated against each other

## Out-of-scope guardrails

Do not:
- redesign child modules to make breakpoint proof easier
- broaden this into a generic performance refactor
- call the shell complete merely because unit tests are green

## Instruction not to re-read files that are still in active context unless needed to confirm drift, dependencies, or uncertainty after changes

Do not re-read files that are still in active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## No-deferral requirement

Do not defer any in-scope shell work to a later wave. If a detail is required now to make the shell correct, governed, and provably closed, address it now.

