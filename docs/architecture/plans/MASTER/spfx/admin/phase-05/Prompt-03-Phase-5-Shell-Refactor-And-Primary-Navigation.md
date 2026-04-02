# Prompt-03 — Phase 5 Shell Refactor and Primary Navigation

## Objective

Refactor the Admin app shell from the current narrow simplified tool-picker into the **Phase 5 operator-console shell** using existing `@hbc/shell` ownership patterns wherever possible.

This prompt is about:
- shell composition,
- primary navigation,
- lane grouping,
- and landing experience.

It is not about implementing the later-phase domain logic behind every lane.

## Important execution rules

- Do not re-read files still in active context unless needed.
- Prefer existing `@hbc/shell` seams and ownership rules over page-local shell logic.
- Only touch `packages/shell` if the current package truly lacks the minimum primitive needed.
- Do not pull privileged logic into SPFx.

## Inputs

Use:
- the Phase 5 baseline
- the route taxonomy / page ownership map
- `apps/admin/src/router/root-route.tsx`
- `packages/shell/README.md`
- relevant shell exports already present in repo

## Required work

### A. Refactor the admin root shell
Update the admin root route so the app behaves like an operator console, not a small utilities menu.

At minimum the shell should support:
- clear workspace identity
- lane-oriented navigation
- a coherent landing experience
- preserved alert visibility
- preserved nav to current working pages during the transition

### B. Implement primary navigation using the new registry
The shell should consume the new route metadata rather than hard-coded button lists.

### C. Establish the landing rule for the Admin app
The landing surface should reflect the operator-console posture.
If the best current landing surface is a lightweight operator home / control-center overview page, add it.
If a new landing page is needed, create it in this prompt.

## Required shell behavior

- Preserve access to existing working surfaces.
- Do not strand access-control administration.
- Preserve alert visibility.
- Make the route model readable and operator-oriented.
- Avoid a giant flat nav list if a grouped nav model is available and supported.
- Keep the shell structure future-ready for Phase 6+ lanes.

## Required docs

Update the Phase 5 baseline docs if the actual implemented shell structure requires a small correction.

## Validation

Before finishing:
- verify the shell still renders,
- verify all current routes remain reachable,
- verify the new nav reflects the canonical registry,
- verify the shell still respects the current permission posture,
- verify shell changes remain inside the correct ownership boundaries.

## Completion condition

Stop when the Admin shell is clearly operating as a Phase 5 operator-console shell.
Do not yet scaffold all future lane pages here unless a minimal landing page is required.
