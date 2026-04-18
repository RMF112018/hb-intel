# 01 — Current Homepage Shell Implementation Map

## Production entry surfaces

The production homepage entry stack is still mounted as **three separate SPFx webparts**:

1. `HbSignatureHero`
2. `PriorityActionsRail`
3. `HbHomepage` shell

This is explicitly stated in:

- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/src/homepage/entryStack/entryStackOrchestration.ts`

That architecture is acceptable **if** the authored page keeps those surfaces in a tightly governed sequence. The current rendered page does not yet do that.

## What the shell currently owns

`HbHomepageShell` is a true orchestration layer. It owns:

- shell layout parsing and fallback
- band / slot placement
- occupant eligibility
- container-aware entry-state resolution
- band pairing or stacking
- protected-vs-configurable governance boundaries
- diagnostics

It does **not** own hero visuals or the separate action band.

## Shell inputs and policies

Key files:

- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.module.css`
- `apps/hb-webparts/src/webparts/hbHomepage/hbHomepageContract.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/breakpointPolicy.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/slotComfortResolver.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/defaultPreset.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/protectedDecisions.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/occupantRegistry.ts`

## Shell default preset

The default shell preset is `default-v2` and is intended to lead with:

- `project-portfolio-spotlight` as primary
- `company-pulse` as secondary
- then leadership
- then safety
- then people/culture
- then kudos

That is directionally strong, because it tries to anchor the first band in operational value.

## Current shell-zone roster

The shell currently renders these six governed occupants:

- Company Pulse
- Leadership Message
- Project Portfolio Spotlight
- People & Culture Public
- HB Kudos
- Safety & Field Excellence

## Homepage surfaces that exist but are not currently part of the HB Homepage shell

The broader homepage/reference layer still includes:

- `PriorityActionsRail`
- `ToolLauncherWorkHub`
- `SmartSearchWayfinding`
- `HbSignatureHero`

The reference composition shows a richer five-zone page story than the production HB Homepage shell currently renders.

## Important production-vs-reference difference

`ReferenceHomepageComposition.tsx` is only a reference composition. Production does **not** render the full page through that file.

This means there is already a conceptual gap between:

- the ideal composed flagship page story
- and the independently authored surfaces on the live SharePoint page

That gap is a key reason the current rendered state feels fragmented.

## Current shell limitations revealed by the screenshots

From the screenshots, the live rendered experience currently behaves as though:

- the hero is visually separate from the action layer
- the action layer is still an equal-weight directory row
- the shell starts too late
- top-shell empty states are allowed to occupy premium positions
- the best available modules are not guaranteed to appear first
