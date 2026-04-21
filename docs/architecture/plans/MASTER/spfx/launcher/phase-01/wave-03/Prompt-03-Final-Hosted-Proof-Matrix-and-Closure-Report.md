# Prompt 03 — Final Hosted Proof Matrix and Closure Report

## Scope
- Authority target: local hosted webpart harness (`playwright.webparts.config.ts`).
- Proof seam: `e2e/webparts/hb-homepage-host-fit.spec.ts`.
- Required matrix: ultrawide desktop, standard laptop, tablet landscape, tablet portrait, large phone portrait, standard phone portrait, short-height.

## Deployed Launcher Version Marker
- Source of truth (runtime constant): `packages/ui-kit/src/HbcHomepageLauncher/constants.ts`
  - `HBC_HOMEPAGE_LAUNCHER_VERSION = 1.1.50.0`
- Hosted proof result:
  - `data-hbc-homepage-launcher-version` was `null` in all matrix captures because the launcher surface did not render in the local hosted harness run.

## Hosted Proof Matrix

| Viewport | Expected device class | Expected handheld mode | Expected cap governance | Observed launcher marker status |
| --- | --- | --- | --- | --- |
| ultrawide-desktop-1920x1080 | ultrawide | standard | binding-visible-cap | launcher markers null |
| standard-laptop-1512x982 | desktop | standard | binding-visible-cap | launcher markers null |
| tablet-landscape-1024x900 | tablet-landscape | standard | binding-visible-cap | launcher markers null |
| tablet-portrait-900x1024 | tablet-portrait | standard | binding-visible-cap | launcher markers null |
| phone-portrait-430x992 | phone | single-entry-all-tools | all-tools-drawer | launcher markers null |
| phone-portrait-390x844 | phone | single-entry-all-tools | all-tools-drawer | launcher markers null |
| short-height-constrained-1300x420 | phone | single-entry-all-tools | all-tools-drawer | launcher markers null |

## Artifacts
- Root: `docs/architecture/plans/MASTER/spfx/launcher/phase-01/wave-03/artifacts/prompt-03-final-hosted-proof-matrix/final/`
- For each viewport row:
  - `{label}.png`
  - `{label}.launcher-markers.json`
- Example marker payload observed:
  - `launcherVersion: null`
  - `launcherDeviceClass: null`
  - `launcherOverflowMode: null`
  - `launcherHandheldMode: null`
  - `launcherVisibleCount: null`
  - `launcherCapGovernance: null`

## Drift Verdict
- **Drift confirmed in hosted proof seam**: launcher runtime DOM did not materialize in the local hosted harness matrix run; therefore required marker evidence is absent.
- Because required launcher markers are missing in all matrix rows, closure is not credible.

## Final Acceptance Call
- **Homepage-grade acceptance: NOT MET**
- **Flagship-grade acceptance: NOT MET**

## Required Next Action Before Closure
- Restore reliable launcher rendering in the hosted harness proof seam, then rerun the exact matrix and confirm non-null marker evidence for:
  - version
  - device class
  - overflow mode
  - handheld mode
  - visible count
  - cap governance
