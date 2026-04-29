# HB Brand Reference

## Purpose

This folder is the repo reference location for HB brand source material, brand-asset governance, and brand implementation guidance for HB Intel and related SharePoint/SPFx/PWA surfaces.

The intent is to keep brand guidance centralized, auditable, and usable by developers without allowing logos, fonts, colors, or visual treatments to drift into app-local one-offs.

## Governing Status

This folder is a **brand reference and governance layer**. It does not replace Layer 1 runtime doctrine under:

```text
docs/reference/ui-kit/doctrine/
```

Runtime doctrine still governs product behavior, host fit, accessibility, interaction quality, and acceptance.

For UI implementation, read this folder together with:

```text
docs/reference/ui-kit/README.md
docs/reference/ui-kit/entry-points.md
docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md
docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md
docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Full-Page-App-Widget-Overlay.md
docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md
```

When there is a conflict:

1. Runtime-specific UI doctrine governs product behavior, host fit, accessibility, interaction quality, and acceptance.
2. This brand governance folder governs logo/font/brand-asset usage and source-of-truth handling.
3. Component reference files govern API usage only and do not override brand or runtime doctrine.

## Current vs Target Archive Posture

- **Current archive truth:** `docs/reference/brand/HB-Brand-Guide.zip`
- **Target source territory:** `docs/reference/brand/source/`
- **Future action:** archive relocation/reconciliation is deferred to a later explicitly authorized prompt.

No archive move/copy/extraction occurs in Prompt 04 or this corrective restoration patch.

## Reference Boundary

`docs/reference/brand/` is reference/source-of-truth territory. It is not product import territory.

Product code must not import raw brand assets or fonts from `docs/reference/brand/`.

## Implementation Asset Location

Stable, reusable, implementation-ready brand assets belong in the UI-kit branding package:

```text
packages/ui-kit/src/branding/assets/
packages/ui-kit/src/branding/index.ts
```

Applications should consume stable brand assets through:

```ts
import { brandAssets } from '@hbc/ui-kit/branding';
```

or named exports from `@hbc/ui-kit/branding`.

## Brand Asset Tiers

| Tier                       | Location                                                   | Purpose                                               | App Import Allowed?                                 |
| -------------------------- | ---------------------------------------------------------- | ----------------------------------------------------- | --------------------------------------------------- |
| Current archive truth      | `docs/reference/brand/HB-Brand-Guide.zip`                  | Current checked-in source package location            | No                                                  |
| Target source territory    | `docs/reference/brand/source/`                             | Intended long-term source archive territory           | No                                                  |
| Brand governance           | `docs/reference/brand/`                                    | Usage rules, inventory, implementation guidance       | No                                                  |
| Curated web assets         | `packages/ui-kit/src/branding/assets/`                     | Optimized logos and approved brand files              | Yes, through `@hbc/ui-kit/branding` only            |
| Theme/font layer           | `packages/ui-kit/src/theme/` or governed UI-kit font layer | Approved font-family tokens and governed font loading | Yes, through governed UI-kit theme exports/CSS only |
| App-local editorial assets | App-local `assets/` folders                                | Campaign-specific or surface-specific imagery         | Yes, only when not reusable corporate brand assets  |

## What Belongs Here

This folder should contain:

- the source package archive reference location and target-territory policy;
- asset inventory and curation notes;
- logo usage rules;
- font governance rules;
- brand expression guidance by surface type;
- developer instructions for promoting reusable brand assets into `@hbc/ui-kit/branding`.

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

Font files are governed assets. They may be stored in implementation locations only when licensing permits internal application use and license/internal-use review is documented.

Rules:

- Do not duplicate font files across apps.
- Do not attach or redistribute font binaries in generated prompt packages, exported documentation zips, or public artifacts.
- Do not import raw font files directly from app code.
- Fonts must be exposed through a governed UI-kit theme/font layer before product use.
- Fallback font stacks must be defined for all production surfaces.

## Brand Expression Principle

HB Intel should feel like a premium custom-built HB product, especially in flagship shells, command centers, executive dashboards, and decision-critical surfaces, but it should not reinvent common controls.

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
3. If reusable (in a later authorized prompt), optimize and place the curated file under `packages/ui-kit/src/branding/assets/`.
4. Export it from `packages/ui-kit/src/branding/index.ts` using a clear, stable, camelCase name.
5. Add or update inventory in `BRAND-ASSET-INVENTORY.md`.
6. Confirm the consuming app imports from `@hbc/ui-kit/branding`, not from raw asset paths.
7. Validate contrast, sizing, and placement against runtime doctrine and relevant SPFx/PWA acceptance standards.

Note: Prompt 05/06 asset/font implementation work has not occurred in Prompt 04.

## Related Files

- `BRAND-ASSET-INVENTORY.md` — source package inventory and recommended curated asset names.
- `BRAND-USAGE-GOVERNANCE.md` — binding brand-asset and font usage rules.
