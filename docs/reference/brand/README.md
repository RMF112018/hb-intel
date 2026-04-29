# HB Brand Reference

## Purpose

This folder is the repo reference location for HB brand source material, brand-asset governance, and brand implementation guidance for HB Intel surfaces.

It is a supporting brand/source-of-truth governance layer. It does not replace Layer 1 runtime doctrine.

## Governing Status

This folder is a **brand governance layer**, not Layer 1 runtime doctrine.

Runtime doctrine continues to govern product behavior, host fit, accessibility, interaction quality, and acceptance:

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Full-Page-App-Widget-Overlay.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-PWA-Governing-Standard.md`

When conflicts exist:

1. Runtime doctrine governs runtime behavior and acceptance.
2. Brand docs govern logo/font/source-of-truth handling and expression policy.
3. Component reference docs remain API/usage references only.

## Archive Truth and Target Source Territory

- **Current archive truth:** `docs/reference/brand/HB-Brand-Guide.zip`
- **Target source territory:** `docs/reference/brand/source/`
- **Future action:** archive relocation/reconciliation is deferred to a later explicitly authorized prompt.

No archive move/copy/extraction occurs in this prompt.

## Reference vs Product Import Boundary

`docs/reference/brand/` is reference/source-of-truth territory. It is not product import territory.

Product code must not import raw brand assets or fonts from `docs/reference/brand/`.

## Implementation Asset Location

Stable, implementation-ready reusable brand assets belong in:

```text
packages/ui-kit/src/branding/assets/
```

They are exported from:

```text
packages/ui-kit/src/branding/index.ts
```

Applications consume them through:

```ts
import { brandAssets } from '@hbc/ui-kit/branding';
```

or named exports from `@hbc/ui-kit/branding`.

## Brand Expression Governance

Brand expression should be strongest on:

- flagship shells
- command centers
- executive dashboards
- decision-critical surfaces

Brand expression should be restrained on:

- routine forms
- tables
- logs
- settings
- standard controls

Common controls should use governed UI-kit primitives. Do not create bespoke brand-styled replacements for standard controls unless a documented exception is approved.

## Font Governance Boundary

Fonts are governed assets.

They may only be placed/copied after documented license/internal-use review confirms the allowed usage posture.

Until that review is documented, do not move/copy font binaries into implementation locations.

## Related Files

- `BRAND-ASSET-INVENTORY.md`
- `BRAND-USAGE-GOVERNANCE.md`
- `docs/reference/ui-kit/GOVERNANCE-MAP.md`
- `docs/reference/ui-kit/doctrine/README.md`
