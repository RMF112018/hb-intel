# UI Kit Brand Asset Integration Prompt Package

## Objective

This package revises the prior plan from a **webparts-local asset lane** to a **shared `@hbc/ui-kit` brand asset integration model with `apps/hb-webparts` consuming those assets**.

The package is intended for a local code agent working against the live `hb-intel` repo.

## Strategic shift

### Previous approach
- place HB/GRIT logos directly under `apps/hb-webparts/src/assets/branding/`
- consume them locally inside homepage webparts

### Revised approach
- place stable HB brand assets under `packages/ui-kit`
- export them through a dedicated branding entry point
- consume them from `apps/hb-webparts`
- keep homepage-specific and campaign/editorial imagery out of the shared kit unless reuse is proven

## Included files

- `README.md`
- `UI-Kit-Brand-Asset-Integration-Summary.md`
- `Prompt-01-UI-Kit-Brand-Asset-Foundation.md`
- `Prompt-02-Webparts-Consumption-and-Homepage-Integration.md`
- `Prompt-03-Branding-Entry-Point-Docs-and-Verification.md`

## Source file paths to use

The local code agent must use these exact local paths:

- `/Users/bobbyfetting/Library/CloudStorage/SynologyDrive-BFmacSync/Work/Logos/GRIT-LOGO.jpg`
- `/Users/bobbyfetting/Library/CloudStorage/SynologyDrive-BFmacSync/Work/Logos/hb_icon_blueBG.jpg`
- `/Users/bobbyfetting/Library/CloudStorage/SynologyDrive-BFmacSync/Work/Logos/hb_logo_icon.jpg`
- `/Users/bobbyfetting/Library/CloudStorage/SynologyDrive-BFmacSync/Work/Logos/hedrick-logo.png`

## Recommended execution order

1. `Prompt-01-UI-Kit-Brand-Asset-Foundation.md`
2. `Prompt-02-Webparts-Consumption-and-Homepage-Integration.md`
3. `Prompt-03-Branding-Entry-Point-Docs-and-Verification.md`

## Execution notes

- The code agent should not re-read files that are already in its current context or memory.
- The code agent should treat repo truth as authoritative.
- If any source asset path is missing locally, the code agent must stop and report the exact missing path.
- Stable corporate brand assets belong in `@hbc/ui-kit`; homepage/editorial imagery remains local to the consuming app unless and until broader reuse is justified.
