# 01 — Current Homepage Implementation Map

## Entry stack

`HbHomepage.tsx` is a thin wrapper over `HbHomepageEntryStack.tsx`.

`HbHomepageEntryStack.tsx` composes three vertical regions in order:

1. wrapper-owned hero region
2. wrapper-owned launcher band
3. shell region containing `HbHomepageShell`

The entry stack also exposes runtime data attributes for entry-state, entry-state reason, short-height, and outer-envelope contract.

## Measurement seam

`useShellContainer.ts` is the shell-width authority.

It measures:

- `authoritativeWidth` from the wrapper-owned entry-stack outer envelope
- shell inline padding from the shell element's computed style
- usable shell width as `authoritativeWidth - shellInlineInsetTotal`

That usable width is the runtime authority passed into entry-state resolution and band-layout resolution.

## Breakpoint seam

`breakpointPolicy.ts` converts measured usable width into the entry-state model:

- ultrawide-desktop: `1600–2400`
- standard-laptop: `1180–1599`
- tablet-landscape: `980–1179`
- narrower states below that

This seam also owns whether first-lane pairing is allowed.

## Preset seam

`defaultPreset.ts` defines the locked three-row homepage composition:

- Row 1: Project Portfolio Spotlight + HB Kudos
- Row 2: Safety + Company Pulse
- Row 3: Leadership Message + People & Culture Public

So the preset shape itself already reflects the intended occupant list and row order.

## Recipe seam

`bandRecipes.ts` determines which recipes are eligible at which entry states.

This is where the preset's intended pairing shape can still be denied at runtime.

## Fit-contract seam

`slotComfortResolver.ts` converts the band recipe plus measured width plus occupant shell-fit contracts into the actual band layout.

This seam decides:

- pair vs stack
- reason for fallback
- render mode (`standard`, `compact`, `summary-collapsed`)

## Occupant capability seam

`occupantRegistry.ts` stores the per-occupant shell-fit contracts, including:

- `minWidth`
- `preferredWidth`
- `narrowestStablePairedWidth`
- `narrowestStableShellWidth`
- `pairedLayoutEligible`

These numbers are the main practical determinants of whether a given row can stay paired.

## Styling seam

`HbHomepageShell.module.css` controls the visual activation of paired grids.

Important detail: the shell renders paired grids only from `1180px` container width upward. Below that, `.bandPaired` and orientation classes still render as one column.

## Build / hosted-runtime seam

`apps/hb-homepage/config/package-solution.json` and `HbHomepageWebPart.manifest.json` show the current homepage package version.

`docs/how-to/verify-hb-intel-homepage-sppkg.md` defines the required proof path for verifying that the hosted SharePoint page is actually serving the intended wrapper/shell build and that the page is authored in full-width mode.
