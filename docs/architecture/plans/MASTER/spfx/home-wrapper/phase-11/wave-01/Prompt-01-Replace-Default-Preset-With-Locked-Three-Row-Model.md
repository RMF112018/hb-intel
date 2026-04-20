# Prompt 01 — Replace Default Preset With Locked Three-Row Model

## Objective
Replace the live default HB Homepage shell preset so the default post-launcher layout is the requested three-row composition rather than the current first-paired-band plus stacked singles model.

## Governing authority
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/spfx-surfaces/benchmark/README.md`
- `docs/reference/spfx-surfaces/benchmark/01-Homepage-Webpart-Conformance-Standard.md`

## Inspect these seams first
- `apps/hb-webparts/src/webparts/hbHomepage/shell/defaultPreset.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellTypes.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellValidation.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/protectedDecisions.ts`

## Current gap to close
The current default preset still encodes:
- Row 1: Project Portfolio Spotlight + Company Pulse
- then stacked Leadership Message
- then stacked Safety
- then stacked People Culture
- then stacked HB Kudos

That is not the requested homepage body.

## Required implementation outcome
The default live preset must become exactly:
- Row 1: Project Portfolio Spotlight + hbKudos
- Row 2: Safety + Company Pulse / Newsroom
- Row 3: Leadership Message + People Culture

No other live post-launcher bands should exist in the default arrangement.

## Rules
- Keep the launcher outside the shell.
- Do not preserve dormant bands just because they already exist.
- Do not add placeholder bands or null-occupant bands to "save the structure."
- Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Proof of closure
Provide:
1. the updated preset definition,
2. the exact resulting band/slot order,
3. confirmation that only the approved six surfaces render below the launcher by default,
4. targeted test/harness evidence proving the new default composition.
