# HB Brand Asset Inventory

## Purpose

This file records the HB brand source package and defines how assets are governed before any implementation curation.

This prompt is documentation-only. No asset extraction, optimization, rename, move, or copy is performed here.

## Archive Truth and Target Source Territory

- **Current archive truth:** `docs/reference/brand/HB-Brand-Guide.zip`
- **Target source territory:** `docs/reference/brand/source/`
- **Future action:** archive relocation/reconciliation is deferred to a later explicitly authorized prompt.

## Reference Boundary

`docs/reference/brand/` is reference/source-of-truth territory. It is not product import territory.

Product code must not import raw brand assets or fonts from this path.

## Source Package Basis

Observed package basis:

- `HB Brands Elements 3.6.26.pdf`
- `Fonts/Futura-«.zip`
- Logo families: HB Construction, HB Development, HB Environmental, Reef Arches

## Existing UI-Kit Branding Registry

Current registry location:

```text
packages/ui-kit/src/branding/index.ts
```

Current known exports:

```ts
gritLogo;
hbIconBlueBg;
hbLogoIcon;
hedrickLogo;
brandAssets;
```

## Implementation Destination Rule

Stable implementation-ready reusable assets belong in:

```text
packages/ui-kit/src/branding/assets/
```

They must be exported through `@hbc/ui-kit/branding`.

## Curation and Handling Rules

- No brand binaries are moved, copied, extracted, renamed, or optimized in Prompt 04.
- Curated implementation work is deferred to later authorized prompts.
- Use PNG/SVG where possible for implementation curation phases.
- Avoid app-local placement for reusable corporate marks.

## Font Inventory Posture

The source package includes a Futura archive (`Fonts/Futura-«.zip`).

Fonts are governed assets and require documented license/internal-use approval before any placement/copying into implementation paths.

Prompt 04 does not inventory font binary contents by filename.

## Brand Expression Context Guidance

Strongest expression:

- flagship shells
- command centers
- executive dashboards
- decision-critical surfaces

Restrained expression:

- routine forms
- tables
- logs
- settings
- standard controls

Common controls should remain governed UI-kit primitives unless a documented exception is approved.
