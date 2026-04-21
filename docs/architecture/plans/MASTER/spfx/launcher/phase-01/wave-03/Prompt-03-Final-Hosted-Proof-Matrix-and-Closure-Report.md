# Prompt 03 — Final Hosted Proof Matrix and Closure Report

## Scope
- Authority target: local hosted webpart harness (`playwright.webparts.config.ts`).
- Proof seam: `e2e/webparts/hb-homepage-host-fit.spec.ts`.
- Required matrix: ultrawide desktop, standard laptop, tablet landscape, tablet portrait, large phone portrait, standard phone portrait, short-height.

## Deployed Launcher Version Marker
- Source of truth (runtime constant): `packages/ui-kit/src/HbcHomepageLauncher/constants.ts`
  - `HBC_HOMEPAGE_LAUNCHER_VERSION = 1.1.64.0`
- Hosted proof result:
  - `data-hbc-homepage-launcher-version` is non-null in all matrix captures and matches `1.1.64.0`.

## Hosted Proof Matrix

| Viewport | Expected device class | Expected handheld mode | Expected cap governance | Observed launcher marker status |
| --- | --- | --- | --- | --- |
| ultrawide-desktop-1920x1080 | ultrawide | standard | binding-visible-cap | pass (`version=1.1.64.0`, `overflow=more-tools`, `visible=6`) |
| standard-laptop-1512x982 | desktop | standard | binding-visible-cap | pass (`version=1.1.64.0`, `overflow=more-tools`, `visible=5`) |
| standard-laptop-1366x1024 | desktop | standard | binding-visible-cap | pass (`version=1.1.64.0`, `overflow=more-tools`, `visible=5`) |
| tablet-landscape-1024x900 | tablet-landscape | standard | binding-visible-cap | pass (`version=1.1.64.0`, `overflow=more-tools`, `visible=4`) |
| tablet-portrait-900x1024 | tablet-portrait | standard | binding-visible-cap | pass (`version=1.1.64.0`, `overflow=more-tools`, `visible=4`) |
| phone-portrait-430x992 | phone | single-entry-all-tools | all-tools-drawer | pass (`version=1.1.64.0`, `overflow=sheet`, `visible=1`) |
| phone-portrait-390x844 | phone | single-entry-all-tools | all-tools-drawer | pass (`version=1.1.64.0`, `overflow=sheet`, `visible=1`) |
| short-height-constrained-1300x420 | phone | single-entry-all-tools | all-tools-drawer | pass (`version=1.1.64.0`, `overflow=sheet`, `visible=1`) |

## Artifacts
- Root: `docs/architecture/plans/MASTER/spfx/launcher/phase-01/wave-03/artifacts/prompt-03-final-hosted-proof-matrix/final/`
- For each viewport row:
  - `{label}.png`
  - `{label}.launcher-markers.json`
- Example marker payload observed:
  - `launcherVersion: "1.1.64.0"`
  - `launcherDeviceClass: "ultrawide" | "desktop" | "tablet-landscape" | "tablet-portrait" | "phone"`
  - `launcherOverflowMode: "more-tools" | "sheet"`
  - `launcherHandheldMode: "standard" | "single-entry-all-tools"`
  - `launcherVisibleCount: "6" | "5" | "4" | "1"`
  - `launcherCapGovernance: "binding-visible-cap" | "all-tools-drawer"`

## Drift Verdict
- **Drift resolved in hosted proof seam**: launcher runtime DOM is present in all matrix rows and now enforced by strict locator assertions.
- Required hosted markers (version/device/overflow/handheld/visible/cap) are non-null and policy-aligned across all rows.

## Final Acceptance Call
- **Homepage-grade acceptance: MET**
- **Flagship-grade acceptance: MET**

## Closure Notes
- Hosted proof seam now hard-fails if launcher band/surface markers are missing.
- Handheld closure proof (`e2e/webparts/hb-homepage-handheld-closure-proof.spec.ts`) enforces non-null launcher markers and pinned launcher version `1.1.64.0`.
