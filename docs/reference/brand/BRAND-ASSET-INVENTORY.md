# HB Brand Asset Inventory

## Purpose

This file records the contents of the HB brand source package and defines how those assets should be curated for repo use.

This inventory is intentionally split between:

- **source package assets** — original files preserved for reference;
- **curated UI-kit assets** — optimized, implementation-ready assets exported through `@hbc/ui-kit/branding`.

Application code must not import directly from the source package.

## Current Source Package

Expected archive location:

```text
docs/reference/brand/source/HB-Brand-Guide.zip
```

Observed source package name/content basis:

```text
HB Brand Guide package
Brand guide PDF: HB Brands Elements 3.6.26.pdf
Font package: Fonts/Futura-«.zip
Logo families: HB Construction, HB Development, HB Environmental, Reef Arches
```

## Source Package Inventory

| Source Path | Type | Size / Notes | Recommended Treatment |
|---|---|---:|---|
| `HB Brands Elements 3.6.26.pdf` | PDF brand guide | Brand source reference | Preserve in source archive; optionally export a text summary into docs only if needed |
| `Fonts/Futura-«.zip` | Font package archive | Font source package | Preserve in source archive; do not redistribute in generated prompt packages; use only through governed UI-kit font layer if license permits |
| `Logos/HB Construction/HB Icon only.png` | PNG logo mark | HB Construction icon-only mark | Curate into UI-kit branding assets if needed |
| `Logos/HB Construction/HB Icon only_HB Logo Centered.jpg` | JPG logo | HB Construction centered composition | Prefer PNG/SVG where available; use JPG only if it is the best available source |
| `Logos/HB Construction/HB Icon white.png` | PNG logo mark | White icon mark | Curate for dark-header/dark-surface use |
| `Logos/HB Construction/HB_Logo_Centered_Icon.png` | PNG logo | Centered logo with icon | Curate for brand moments and large identity placements |
| `Logos/HB Construction/HB_Logo_Centered_Icon_Reverse.png` | PNG logo | Reverse centered logo | Curate for dark backgrounds |
| `Logos/HB Construction/HB_Logo_Left_Icon.jpg` | JPG logo | Left-aligned composition | Prefer PNG equivalent where practical |
| `Logos/HB Construction/HB_Logo_Left_Icon.png` | PNG logo | Left-aligned logo with icon | Curate for headers, rails, app shells |
| `Logos/HB Construction/HB_Logo_Left_reverse.png` | PNG logo | Reverse left-aligned logo | Curate for dark command headers and hero surfaces |
| `Logos/HB Development/HBD LOGO.jpg` | JPG logo | HB Development source logo | Preserve; curate optimized PNG if needed |
| `Logos/HB Development/HBD LOGO.png` | PNG logo | HB Development logo | Curate if HB Development appears in product surfaces |
| `Logos/HB Development/HBD LOGO-reverse.png` | PNG logo | Reverse HB Development logo | Curate for dark backgrounds if needed |
| `Logos/HB Environmental/HBE LOGO ICON.png` | PNG icon | HB Environmental icon | Curate if HB Environmental app/surface identity is needed |
| `Logos/HB Environmental/HBE LOGO reverse.png` | PNG logo | Reverse HB Environmental logo | Curate for dark backgrounds if needed |
| `Logos/HB Environmental/HBE LOGO.jpg` | JPG logo | HB Environmental source logo | Preserve; prefer PNG where practical |
| `Logos/HB Environmental/HBE LOGO.png` | PNG logo | HB Environmental logo | Curate if needed |
| `Logos/Reef Arches/Reef Arch Logo patent.jpg` | JPG logo/artwork | Reef Arches logo source | Preserve; prefer SVG/PNG where practical |
| `Logos/Reef Arches/Reef Arch Logo patent.png` | PNG logo/artwork | Reef Arches logo | Curate if needed |
| `Logos/Reef Arches/Reef Arch Logo patent.svg` | SVG logo/artwork | Reef Arches vector | Preferred source for scalable use if SVG is safe/clean |
| `Logos/Reef Arches/white w green.png` | PNG logo/artwork | White/green variant | Curate only if approved use case exists |

## Recommended Curated Asset Names

Curated files should use kebab-case file names and camelCase exports.

### HB Construction

| Curated File | Export Name | Intended Use |
|---|---|---|
| `hb-construction-icon.png` | `hbConstructionIcon` | Compact app marks, favicon-like placements, icon frames |
| `hb-construction-icon-white.png` | `hbConstructionIconWhite` | Dark headers, dark rails, dark hero surfaces |
| `hb-construction-logo-centered.png` | `hbConstructionLogoCentered` | Larger brand moments, splash/orientation surfaces |
| `hb-construction-logo-centered-reverse.png` | `hbConstructionLogoCenteredReverse` | Dark flagship/hero surfaces |
| `hb-construction-logo-left.png` | `hbConstructionLogoLeft` | App headers, side rails, product shells |
| `hb-construction-logo-left-reverse.png` | `hbConstructionLogoLeftReverse` | Dark command-center shells and rails |

### HB Development

| Curated File | Export Name | Intended Use |
|---|---|---|
| `hb-development-logo.png` | `hbDevelopmentLogo` | Development-specific surfaces or brand references |
| `hb-development-logo-reverse.png` | `hbDevelopmentLogoReverse` | Dark surfaces |

### HB Environmental

| Curated File | Export Name | Intended Use |
|---|---|---|
| `hb-environmental-icon.png` | `hbEnvironmentalIcon` | Environmental app/surface iconography |
| `hb-environmental-logo.png` | `hbEnvironmentalLogo` | Environmental-specific surfaces |
| `hb-environmental-logo-reverse.png` | `hbEnvironmentalLogoReverse` | Dark surfaces |

### Reef Arches

| Curated File | Export Name | Intended Use |
|---|---|---|
| `reef-arches-logo.svg` | `reefArchesLogo` | Preferred scalable Reef Arches mark if approved and sanitized |
| `reef-arches-logo.png` | `reefArchesLogoPng` | PNG fallback |
| `reef-arches-logo-white-green.png` | `reefArchesLogoWhiteGreen` | Dark/special-use variant only if approved |

## Existing UI-Kit Branding Registry

The repo already contains a branding registry at:

```text
packages/ui-kit/src/branding/index.ts
```

Current known exports include:

```ts
gritLogo
hbIconBlueBg
hbLogoIcon
hedrickLogo
brandAssets
```

When the HB brand package is curated, update this registry rather than creating app-local brand imports.

## Required Registry Shape

The final registry should remain predictable and typed:

```ts
export const brandAssets = {
  hbConstructionIcon,
  hbConstructionIconWhite,
  hbConstructionLogoCentered,
  hbConstructionLogoCenteredReverse,
  hbConstructionLogoLeft,
  hbConstructionLogoLeftReverse,
  hbDevelopmentLogo,
  hbDevelopmentLogoReverse,
  hbEnvironmentalIcon,
  hbEnvironmentalLogo,
  hbEnvironmentalLogoReverse,
  reefArchesLogo,
} as const;

export type BrandAssetKey = keyof typeof brandAssets;
```

## Curation Rules

- Prefer PNG or SVG for UI use.
- Prefer transparent-background assets for composable UI placement.
- Prefer reverse/white variants on dark command-center headers and dark rails.
- Avoid JPG for UI chrome unless no cleaner source exists.
- Optimize file size before adding to `packages/ui-kit/src/branding/assets/`.
- Do not alter logo proportions, crop clear space improperly, recolor marks, or create unofficial variants.
- Do not place raw brand assets in app-local folders unless they are genuinely app-specific/editorial and not reusable corporate assets.

## Font Inventory

The source package includes a Futura font archive:

```text
Fonts/Futura-«.zip
```

Font files are not inventoried by file name here to avoid encouraging unnecessary redistribution or duplication. A future implementation pass may inventory font family names, weights, and licensed usage after legal/license review.

Required font governance:

- preserve source font package in `docs/reference/brand/source/` only;
- do not duplicate font binaries across apps;
- expose approved font usage through UI-kit theme/font tokens only;
- provide production-safe fallback stacks;
- do not include font binaries in generated prompt packages or exported artifact zips.

## Inventory Maintenance Rules

Update this file whenever:

- the source brand package changes;
- a curated asset is promoted into `packages/ui-kit/src/branding/assets/`;
- a named export is added, renamed, or deprecated;
- a logo variant is approved or retired;
- font usage is approved through the UI-kit theme layer.
