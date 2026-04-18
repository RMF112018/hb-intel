# Prompt 01 — Expand the Approved Shell Preset Library

## Objective

Turn the current shell preset model into a real approved preset library suitable for future bounded configuration.

## Governing authorities

- `apps/hb-webparts/src/webparts/hbHomepage/hbHomepageContract.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/protectedDecisions.ts`
- `docs/reference/shell/HB-Shell-Entry-Breakpoint-Spec.md`

## Exact files / seams to inspect

- `apps/hb-webparts/src/webparts/hbHomepage/shell/defaultPreset.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/presetLibrary.*`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellValidation.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellSchema.*`
- any tests covering preset validation

Do not re-read files still in active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Required implementation outcome

- define multiple approved presets with distinct semantic intent
- document which occupants are optional vs core
- keep protected band semantics intact
- reject illegal presets through validation
- keep the flagship preset as the default

## Proof of closure

Provide:
- final preset roster
- validation behavior for invalid presets
- files changed
- tests added or updated
