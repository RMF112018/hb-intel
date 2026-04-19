# Prompt 05 — Strengthen Inspectable Shell Diagnostics for Width Truth and Host-Fit Debugging

## Objective
Extend the shell’s inspectable diagnostics so host-fit behavior can be understood and proven without guesswork.

## Why this work exists
The shell already emits useful diagnostic attributes. That is good architecture.

What is missing is enough inspectable width truth to make the host-fit correction durable. Without richer diagnostics, future regressions will be harder to diagnose, and closure reports will stay weaker than they should be.

## Governing authority
Use:
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/useShellContainer.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellConformance.ts`

## Required diagnostic outcomes
Expose stable, inspectable state for at least:
- authoritative outer width or equivalent contract width
- usable shell width after intentional accounting
- entry-state id
- entry-state reason
- short-height constraint state
- any additional fit-state attribute needed to explain the layout path cleanly

## Current weakness in nuanced terms
The current shell can say a lot about its band decisions.
It cannot yet say enough about why its width truth should be trusted.

That is the diagnostic gap to close.

## Intended future state
After this prompt is complete:
- a developer can inspect the shell and understand its fit posture directly
- tests can assert real width-truth state, not just visual guesses
- closure reports can rely on stable runtime facts

## What must change
1. Add the minimum set of durable diagnostics needed for width truth.
2. Keep the attribute surface stable and meaningful.
3. Avoid noisy or redundant diagnostics that do not improve closure confidence.

## Done means
Done means:
- width truth is inspectable
- entry-state reason is inspectable
- diagnostics support tests and hosted validation evidence
- the new attributes are clearly documented in the implementation report

## Prohibitions
- Do not add noisy diagnostics with no closure value.
- Do not encode transient styling trivia.
- Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Proof of closure
Provide:
1. exact new diagnostics added
2. why each exists
3. how tests and hosted validation consume them
