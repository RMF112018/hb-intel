# HB Brand Reference

## Purpose

This folder is the repo reference location for HB brand source material, brand-asset governance, and brand implementation guidance for HB Intel and related SharePoint/SPFx/PWA surfaces.

The intent is to keep brand guidance centralized, auditable, and usable by developers without allowing logos, fonts, colors, or visual treatments to drift into app-local one-offs.

## Governing Status

This folder is a **brand reference and governance layer**. It does not replace the UI doctrine stack under:

```text
docs/reference/ui-kit/doctrine/
```

For UI implementation, read this folder together with:

```text
docs/reference/ui-kit/README.md
docs/reference/ui-kit/entry-points.md
docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md
docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md
docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md
docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md
```

When there is a conflict:

1. Runtime-specific UI doctrine governs product behavior, host fit, accessibility, and interaction standards.
2. This brand governance folder governs logo/font/brand-asset usage and source-of-truth handling.
3. Component reference files govern API usage only and do not override brand or UI doctrine.

## Source Package

The current brand source package is expected to be preserved at:

```text
docs/reference/brand/source/HB-Brand-Guide.zip
```

Recommended source archive contents:

```text
HB Brands Elements 3.6.26.pdf
Fonts/Futura-«.zip
Logos/HB Construction/*
Logos/HB Development/*
Logos/HB Environmental/*
Logos/Reef Arches/*
```

Do not import directly from the source archive in application code. The source archive is for reference, auditability, and controlled curation only.

## Implementation Asset Location

Stable, reusable, web-ready brand assets belong in the UI-kit branding package:

```text
packages/ui-kit/src/branding/assets/
packages/ui-kit/src/branding/index.ts
```

Applications should consume stable brand assets through:

```ts
import { brandAssets } from '@hbc/ui-kit/branding';
```

or named exports from the same entry point.

## Brand Asset Tiers

| Tier | Location | Purpose | App Import Allowed? |
|---|---|---|---|
| Source archive | `docs/reference/brand/source/` | Original brand package, PDFs, source logos, font packages | No |
| Brand governance | `docs/reference/brand/` | Usage rules, inventory, implementation guidance | No |
| Curated web assets | `packages/ui-kit/src/branding/assets/` | Optimized logos and approved brand files | Yes, through `@hbc/ui-kit/branding` only |
| Theme/font layer | `packages/ui-kit/src/theme/` or governed UI-kit font layer | Approved font-family tokens and font-face declarations | Yes, through UI-kit theme exports/CSS only |
| App-local editorial assets | App-local `assets/` folders | Campaign-specific or surface-specific imagery | Yes, only when not a reusable corporate brand asset |

## What Belongs Here

This folder should contain:

- the original brand package archive in `source/`;
- asset inventory and curation notes;
- logo usage rules;
- font governance rules;
- brand expression guidance by surface type;
- developer instructions for promoting brand assets into `@hbc/ui-kit/branding`.

## What Does Not Belong Here

Do not use this folder for:

- app-specific marketing images;
- generated screenshots or mockups;
- runtime-imported assets;
- ad hoc logo variants;
- duplicated font files copied from other locations;
- UI component API documentation;
- product-specific layout doctrine.

## Font File Handling

Font files are governed assets. They may be stored in the repo only if licensing permits internal application use.

Rules:

- Do not duplicate font files across apps.
- Do not attach or redistribute font binaries in generated prompt packages, exported documentation zips, or public artifacts.
- Do not import raw font files directly from app code.
- Fonts must be exposed through a governed UI-kit theme/font layer before product use.
- Fallback font stacks must be defined for all production surfaces.

## Brand Expression Principle

HB Intel should feel like a premium custom-built HB product, especially in flagship shells and project-control surfaces, but it should not reinvent common controls.

Brand expression should come through:

- authentic logos and marks;
- disciplined typography and font usage;
- HB color and material treatment;
- confident composition;
- hierarchy and density;
- command-center posture where appropriate;
- evidence-backed quality.

Common controls such as buttons, inputs, tables, dialogs, pickers, badges, tabs, and menus should use governed UI-kit primitives unless a documented exception is approved.

## Developer Workflow

When adding or using a brand asset:

1. Confirm the asset exists in the source package or approved brand guide.
2. Determine whether it is reusable corporate brand material or app-specific editorial content.
3. If reusable, optimize and place the curated file under `packages/ui-kit/src/branding/assets/`.
4. Export it from `packages/ui-kit/src/branding/index.ts` using a clear, stable, camelCase name.
5. Add or update inventory in `BRAND-ASSET-INVENTORY.md`.
6. Confirm the consuming app imports from `@hbc/ui-kit/branding`, not from raw asset paths.
7. Validate contrast, sizing, and placement against UI doctrine and the relevant SPFx/PWA acceptance standard.

## Related Files

- `BRAND-ASSET-INVENTORY.md` — source package inventory and recommended curated asset names.
- `BRAND-USAGE-GOVERNANCE.md` — binding brand-asset and font usage rules.
