# Prompt 03 — Prepare Safety Field Excellence for Shell Insertion

## Objective
Prepare `SafetyFieldExcellence` for safe insertion into the governed homepage shell, even if final insertion is deferred by one follow-on change.

## Governing authority
- homepage doctrine
- benchmark package
- shell schema / capability contracts

## Exact repo seams to inspect
- `apps/hb-webparts/src/webparts/safetyFieldExcellence/**`
- shell capability registry
- approved composition presets
- `apps/hb-webparts/src/mount.tsx`

## Current gap
`SafetyFieldExcellence` exists and appears shell-capable, but it has not yet been evaluated as a governed shell occupant with explicit band/footprint rules.

## Required implementation outcome
Add the shell metadata needed for future insertion:
- slot compatibility
- prominence eligibility
- width rules
- compact mode support (if any)
- pairing restrictions
- recommended preset placement

If insertion is straightforward and low-risk after Wave 01, insert it into the appropriate preset(s). If not, leave the shell metadata complete and document the exact remaining blocker.

## Proof of closure required
Provide:
- safety module capability record
- target band recommendation
- insertion decision and rationale
- proof that the shell can now reason about this module correctly

## Prohibited
- do not append Safety as a same-weight extra section without shell logic
- do not ignore current composition consequences
- do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes
