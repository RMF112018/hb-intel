# 03B — `hb-webparts` Scaffolding Conventions and Helper Seams

## Purpose

Define canonical Prompt-03 scaffolding rules so later prompts can add feature webparts without re-laying app structure.

## Locked Scaffold Structure

- App root: `apps/hb-webparts/`
- SPFx packaging manifest: `config/package-solution.json` (initialized at `001.000.001`)
- SharePoint webpart manifest baseline: `src/webparts/hbWebparts/HbWebpartsWebPart.manifest.json`
- Shared foundation:
  - `src/homepage/shared/` primitives
  - `src/homepage/helpers/` identity/greeting/visibility/config/normalization seams
  - `src/homepage/models/` common content contracts
  - `src/homepage/__tests__/` shared-layer tests

## Helper and Model Contracts

- Identity seam: first-name resolution via preferred/display/email fallback.
- Greeting seam: deterministic local time-of-day greeting resolver.
- Visibility seam: audience-aware item visibility helper.
- Config seam: normalized default config helper for property/data settings.
- Content seam: curated list normalization with dedupe and bounded item count.

## Ownership and Maintenance Expectations

- Shared config normalization and audience visibility seams are maintained by the `hb-webparts` app maintainers as cross-webpart contracts.
- Feature webpart owners remain responsible for source data integrity and authored list/property-pane content quality.
- Shared model changes in `src/homepage/models/` require Prompt-package doc updates when contract shapes change.

## Webpart Implementation Conventions (Prompt-04+)

- Feature-specific webpart roots should live under `src/webparts/<featureName>/`.
- Shared helpers/models must be consumed from `src/homepage/**` instead of duplicated.
- Tests for feature webparts should colocate under corresponding feature folders while reusing shared helper tests for deterministic behavior.
