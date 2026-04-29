# HB Brand Asset Inventory

## Purpose

This file records the contents of the HB brand source package and defines how those assets should be governed for repo use.

This inventory is intentionally split between:

- **source package assets** — original files preserved for reference;
- **curated UI-kit assets** — implementation-ready assets exported through `@hbc/ui-kit/branding` in later authorized prompts.

Application code must not import directly from source package territory.

## Current vs Target Archive Posture

- **Current archive truth:** `docs/reference/brand/HB-Brand-Guide.zip`
- **Target source territory:** `docs/reference/brand/source/`
- **Future action:** archive relocation/reconciliation is deferred to a later explicitly authorized prompt.

Prompt 04 and this corrective patch do not move, copy, extract, optimize, rename, or export assets.

## Source Package Basis

Observed source package name/content basis:

```text
HB Brand Guide package
Brand guide PDF: HB Brands Elements 3.6.26.pdf
Font package: Fonts/Futura-«.zip
Logo families: HB Construction, HB Development, HB Environmental, Reef Arches
```

## Source Package Inventory (Known Assets)

| Source Path                                               | Type                 |                         Size / Notes | Recommended Treatment                                                                                                   |
| --------------------------------------------------------- | -------------------- | -----------------------------------: | ----------------------------------------------------------------------------------------------------------------------- |
| `HB Brands Elements 3.6.26.pdf`                           | PDF brand guide      |               Brand source reference | Preserve in source archive territory; optional text summary in docs when needed                                         |
| `Fonts/Futura-«.zip`                                      | Font package archive |                  Font source package | Preserve in source archive territory; do not redistribute; governed UI-kit usage only after license/internal-use review |
| `Logos/HB Construction/HB Icon only.png`                  | PNG logo mark        |       HB Construction icon-only mark | Curate into UI-kit branding assets if needed in later authorized prompts                                                |
| `Logos/HB Construction/HB Icon only_HB Logo Centered.jpg` | JPG logo             | HB Construction centered composition | Prefer PNG/SVG when available; JPG only if best source                                                                  |
| `Logos/HB Construction/HB Icon white.png`                 | PNG logo mark        |                      White icon mark | Curate for dark-header/dark-surface use                                                                                 |
| `Logos/HB Construction/HB_Logo_Centered_Icon.png`         | PNG logo             |              Centered logo with icon | Curate for larger brand moments                                                                                         |
| `Logos/HB Construction/HB_Logo_Centered_Icon_Reverse.png` | PNG logo             |                Reverse centered logo | Curate for dark backgrounds                                                                                             |
| `Logos/HB Construction/HB_Logo_Left_Icon.jpg`             | JPG logo             |             Left-aligned composition | Prefer PNG equivalent where practical                                                                                   |
| `Logos/HB Construction/HB_Logo_Left_Icon.png`             | PNG logo             |          Left-aligned logo with icon | Curate for headers, rails, app shells                                                                                   |
| `Logos/HB Construction/HB_Logo_Left_reverse.png`          | PNG logo             |            Reverse left-aligned logo | Curate for dark command headers/rails                                                                                   |
| `Logos/HB Development/HBD LOGO.jpg`                       | JPG logo             |           HB Development source logo | Preserve; prefer PNG in curated use                                                                                     |
| `Logos/HB Development/HBD LOGO.png`                       | PNG logo             |                  HB Development logo | Curate if used in product surfaces                                                                                      |
| `Logos/HB Development/HBD LOGO-reverse.png`               | PNG logo             |          Reverse HB Development logo | Curate for dark backgrounds                                                                                             |
| `Logos/HB Environmental/HBE LOGO ICON.png`                | PNG icon             |                HB Environmental icon | Curate if environmental identity is needed                                                                              |
| `Logos/HB Environmental/HBE LOGO reverse.png`             | PNG logo             |        Reverse HB Environmental logo | Curate for dark backgrounds                                                                                             |
| `Logos/HB Environmental/HBE LOGO.jpg`                     | JPG logo             |         HB Environmental source logo | Preserve; prefer PNG when practical                                                                                     |
| `Logos/HB Environmental/HBE LOGO.png`                     | PNG logo             |                HB Environmental logo | Curate if needed                                                                                                        |
| `Logos/Reef Arches/Reef Arch Logo patent.jpg`             | JPG logo/artwork     |              Reef Arches source logo | Preserve; prefer SVG/PNG where practical                                                                                |
| `Logos/Reef Arches/Reef Arch Logo patent.png`             | PNG logo/artwork     |                     Reef Arches logo | Curate if needed                                                                                                        |
| `Logos/Reef Arches/Reef Arch Logo patent.svg`             | SVG logo/artwork     |                   Reef Arches vector | Preferred scalable source if safe/clean                                                                                 |
| `Logos/Reef Arches/white w green.png`                     | PNG logo/artwork     |                  White/green variant | Curate only for approved use cases                                                                                      |

## Recommended Curated Asset Names and Export Names

Curated files should use kebab-case file names and camelCase exports.

### HB Construction

| Curated File                                | Export Name                         | Intended Use                      |
| ------------------------------------------- | ----------------------------------- | --------------------------------- |
| `hb-construction-icon.png`                  | `hbConstructionIcon`                | Compact marks and icon placements |
| `hb-construction-icon-white.png`            | `hbConstructionIconWhite`           | Dark headers/rails/surfaces       |
| `hb-construction-logo-centered.png`         | `hbConstructionLogoCentered`        | Large brand moments               |
| `hb-construction-logo-centered-reverse.png` | `hbConstructionLogoCenteredReverse` | Dark flagship/hero surfaces       |
| `hb-construction-logo-left.png`             | `hbConstructionLogoLeft`            | App headers and shells            |
| `hb-construction-logo-left-reverse.png`     | `hbConstructionLogoLeftReverse`     | Dark command-center shells        |

### HB Development

| Curated File                      | Export Name                | Intended Use                  |
| --------------------------------- | -------------------------- | ----------------------------- |
| `hb-development-logo.png`         | `hbDevelopmentLogo`        | Development-specific surfaces |
| `hb-development-logo-reverse.png` | `hbDevelopmentLogoReverse` | Dark surfaces                 |

### HB Environmental

| Curated File                        | Export Name                  | Intended Use                    |
| ----------------------------------- | ---------------------------- | ------------------------------- |
| `hb-environmental-icon.png`         | `hbEnvironmentalIcon`        | Environmental iconography       |
| `hb-environmental-logo.png`         | `hbEnvironmentalLogo`        | Environmental-specific surfaces |
| `hb-environmental-logo-reverse.png` | `hbEnvironmentalLogoReverse` | Dark surfaces                   |

### Reef Arches

| Curated File                       | Export Name                | Intended Use                        |
| ---------------------------------- | -------------------------- | ----------------------------------- |
| `reef-arches-logo.svg`             | `reefArchesLogo`           | Preferred scalable Reef Arches mark |
| `reef-arches-logo.png`             | `reefArchesLogoPng`        | PNG fallback                        |
| `reef-arches-logo-white-green.png` | `reefArchesLogoWhiteGreen` | Special-use dark variant            |

## Existing UI-Kit Branding Registry

Current registry location:

```text
packages/ui-kit/src/branding/index.ts
```

Current known exports include:

```ts
gritLogo;
hbIconBlueBg;
hbLogoIcon;
hedrickLogo;
brandAssets;
```

When curation is explicitly authorized in later prompts, update this registry rather than creating app-local brand imports.

## Curation Rules (Future Authorized Prompts)

- Prefer PNG or SVG for UI use.
- Prefer transparent-background assets for composable placement.
- Prefer reverse/white variants on dark command-center headers/rails.
- Avoid JPG for UI chrome unless no cleaner source exists.
- Do not alter logo proportions, clear space, color variants, or lockups.
- Do not place reusable corporate assets in app-local folders.

## Font Inventory Posture

The source package includes a Futura font archive (`Fonts/Futura-«.zip`).

Font binaries are governed assets and require documented license/internal-use review before any placement/copying into implementation locations.

Prompt 04 and this corrective patch do not inventory font binary contents by filename.

## Maintenance Rules

Update this file whenever:

- the source package changes;
- curated assets are promoted into `packages/ui-kit/src/branding/assets/` (in authorized prompts);
- export names are added/renamed/deprecated;
- font usage policy is approved through governed UI-kit theme paths.

## Prompt 05 Curated Status (Implemented)

This prompt curated stable reusable corporate logo assets into `packages/ui-kit/src/branding/assets/` and exposed them through `@hbc/ui-kit/branding`.

Archive posture remains:

- current archive truth: `docs/reference/brand/HB-Brand-Guide.zip`
- target source territory: `docs/reference/brand/source/`
- relocation/reconciliation deferred to later explicitly authorized prompt

No fonts, PDFs, or archive relocation were performed.

| Source File in Archive                                    | Target File                                                                     | Registry Key                        | Format | Intended Use                             |
| --------------------------------------------------------- | ------------------------------------------------------------------------------- | ----------------------------------- | ------ | ---------------------------------------- |
| `Logos/HB Construction/HB Icon only.png`                  | `packages/ui-kit/src/branding/assets/hb-construction-icon.png`                  | `hbConstructionIcon`                | PNG    | Compact app marks and icon frames        |
| `Logos/HB Construction/HB Icon white.png`                 | `packages/ui-kit/src/branding/assets/hb-construction-icon-white.png`            | `hbConstructionIconWhite`           | PNG    | Dark headers/rails/surfaces              |
| `Logos/HB Construction/HB_Logo_Left_Icon.png`             | `packages/ui-kit/src/branding/assets/hb-construction-logo-left.png`             | `hbConstructionLogoLeft`            | PNG    | App headers and shell branding           |
| `Logos/HB Construction/HB_Logo_Left_reverse.png`          | `packages/ui-kit/src/branding/assets/hb-construction-logo-left-reverse.png`     | `hbConstructionLogoLeftReverse`     | PNG    | Dark command headers/rails               |
| `Logos/HB Construction/HB_Logo_Centered_Icon.png`         | `packages/ui-kit/src/branding/assets/hb-construction-logo-centered.png`         | `hbConstructionLogoCentered`        | PNG    | Large identity moments                   |
| `Logos/HB Construction/HB_Logo_Centered_Icon_Reverse.png` | `packages/ui-kit/src/branding/assets/hb-construction-logo-centered-reverse.png` | `hbConstructionLogoCenteredReverse` | PNG    | Dark flagship/hero surfaces              |
| `Logos/HB Development/HBD LOGO.png`                       | `packages/ui-kit/src/branding/assets/hb-development-logo.png`                   | `hbDevelopmentLogo`                 | PNG    | Development-specific identity            |
| `Logos/HB Development/HBD LOGO-reverse.png`               | `packages/ui-kit/src/branding/assets/hb-development-logo-reverse.png`           | `hbDevelopmentLogoReverse`          | PNG    | Development logo on dark surfaces        |
| `Logos/HB Environmental/HBE LOGO ICON.png`                | `packages/ui-kit/src/branding/assets/hb-environmental-icon.png`                 | `hbEnvironmentalIcon`               | PNG    | Environmental iconography                |
| `Logos/HB Environmental/HBE LOGO.png`                     | `packages/ui-kit/src/branding/assets/hb-environmental-logo.png`                 | `hbEnvironmentalLogo`               | PNG    | Environmental identity surfaces          |
| `Logos/HB Environmental/HBE LOGO reverse.png`             | `packages/ui-kit/src/branding/assets/hb-environmental-logo-reverse.png`         | `hbEnvironmentalLogoReverse`        | PNG    | Environmental logo on dark surfaces      |
| `Logos/Reef Arches/Reef Arch Logo patent.svg`             | `packages/ui-kit/src/branding/assets/reef-arches-logo.svg`                      | `reefArchesLogo`                    | SVG    | Preferred scalable Reef Arches mark      |
| `Logos/Reef Arches/Reef Arch Logo patent.png`             | `packages/ui-kit/src/branding/assets/reef-arches-logo.png`                      | `reefArchesLogoPng`                 | PNG    | PNG fallback for contexts needing raster |
