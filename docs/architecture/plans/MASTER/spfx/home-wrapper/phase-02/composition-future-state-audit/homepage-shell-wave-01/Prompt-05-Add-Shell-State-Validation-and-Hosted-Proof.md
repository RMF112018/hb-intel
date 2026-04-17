# Prompt 05 — Add Shell State Validation and Hosted Proof

## Objective
Add proof-oriented validation for the composed homepage shell, covering composition, responsiveness, and degraded states.

## Governing authority
- benchmark closure/proof expectations
- homepage webpart benchmark validation posture
- doctrine rules on authoring safety and host-runtime resilience

## Exact repo seams to inspect
- existing hosted validation patterns under the repo
- `apps/hb-webparts/src/webparts/hbHomepage/**`
- any Playwright / e2e harnesses relevant to homepage work

## Current gap
The shell itself lacks strong proof that:
- hierarchy survives across widths
- invalid placement states are handled
- zone failure does not collapse page quality
- current modules remain reachable and premium in the new shell model

## Required implementation outcome
Add validation covering at minimum:
- wide / medium / narrow shell states
- intended dominant vs supporting band hierarchy
- zone failure fallback
- invalid-placement fallback
- focus reachability after responsive re-layout
- preservation of current module rendering

## Proof of closure required
Provide:
- exact tests added
- screenshots or artifact summary
- pass/fail output
- summary of remaining known risks, if any

## Prohibited
- do not fake proof with local-only screenshots
- do not skip degraded-state coverage
- do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes
