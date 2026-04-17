# Prompt 02 — Activate Safety Field Excellence as a governed shell occupant

## Objective
Move `SafetyFieldExcellence` from inactive candidate to a real governed shell occupant with clean placement rules and preset participation.

## Governing authority
- `docs/reference/shell/HB-Shell-Entry-Breakpoint-Spec.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/architecture/plans/MASTER/spfx/benchmark/README.md`

## Inspect these files first
- `apps/hb-webparts/src/webparts/safetyFieldExcellence/SafetyFieldExcellence.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/occupantRegistry.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellTypes.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/defaultPreset.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/presetLibrary.ts`
- any missing zone wrappers or config slices under `apps/hb-webparts/src/webparts/hbHomepage/**`

Do not re-read files that are still in active context unless you need to confirm drift, dependencies, or uncertainty after changes.

## Current gap
Safety is architecturally mature enough to belong in the shell, but the shell contract still treats it as an inactive candidate and does not provide the full zone/config/preset path needed for real participation.

## Required implementation outcome
- add the full shell participation path for Safety
- define the correct prominence ceiling and eligible placements
- add safe preset participation
- keep first-lane and recognition protections intact
- document whether Safety is optional visibility or always-on once enabled

## Closure proof required
Provide:
- changed registry/preset/zone summary
- explicit statement of Safety’s allowed shell role
- validation notes for incompatible or unsafe placements

## Prohibited
- no forced first-lane dominance unless proven justified
- no unrelated module redesign
