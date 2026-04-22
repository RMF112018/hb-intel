# Prompt 03 — Final Hosted Proof Matrix and Closure Report

## Scope
- Authority target: local hosted webpart harness (`playwright.webparts.config.ts`).
- Proof seam: `e2e/webparts/hb-homepage-host-fit.spec.ts`.
- Required matrix: ultrawide desktop, standard laptop, tablet landscape, tablet portrait, large phone portrait, standard phone portrait, short-height.

## Root Cause Chain (Remediation Authority)
- Hosted “no visible delta” was caused by a **compound failure chain**:
  - proof seams drifted (`e2e/live-sharepoint/homepage.launcher.handheld.live.spec.ts` pinned `1.1.50.0`)
  - artifact directories overlapped across proof runs, weakening evidence trust
  - previous launcher changes were heavily internal (markers/governance/refactor) with limited first-glance UI hierarchy shift
- Remediation corrected all three: unified version/package/proof constants, separated proof artifact roots, and delivered visible launcher hierarchy + overflow display-class upgrades.

## Source ↔ Package ↔ Runtime Version Truth
- Runtime constant source: `packages/ui-kit/src/HbcHomepageLauncher/constants.ts`
  - `HBC_HOMEPAGE_LAUNCHER_VERSION = 1.1.67.0`
- Package authority source: `apps/hb-homepage/config/package-solution.json`
  - `solution.version = 1.1.67.0`
  - `features[0].version = 1.1.67.0`
- Webpart manifests:
  - `apps/hb-homepage/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json = 1.1.67.0`
  - `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json = 1.1.67.0`
- Package-truth proof: `dist/sppkg/hb-intel-homepage-effectiveness-proof.json`
  - `versionAuthority.aligned = true`
- Bundled runtime marker proof:
  - `ClientSideAssets/hb-homepage-app-8303b7bd.js` contains `data-hbc-homepage-launcher-version` and `1.1.67.0`

## Hosted Proof Matrix

| Viewport | Expected device class | Expected handheld mode | Expected cap governance | Observed launcher marker status |
| --- | --- | --- | --- | --- |
| ultrawide-desktop-1920x1080 | ultrawide | standard | binding-visible-cap | pass (`version=1.1.67.0`, `overflow=more-tools`, `visible=6`) |
| standard-laptop-1512x982 | desktop | standard | binding-visible-cap | pass (`version=1.1.67.0`, `overflow=more-tools`, `visible=6`) |
| standard-laptop-1366x1024 | desktop | standard | binding-visible-cap | pass (`version=1.1.67.0`, `overflow=more-tools`, `visible=6`) |
| tablet-landscape-1024x900 | tablet-landscape | standard | binding-visible-cap | pass (`version=1.1.67.0`, `overflow=more-tools`, `visible=5`) |
| tablet-portrait-900x1024 | tablet-portrait | standard | binding-visible-cap | pass (`version=1.1.67.0`, `overflow=more-tools`, `visible=4`) |
| phone-portrait-430x992 | phone | single-entry-all-tools | all-tools-drawer | pass (`version=1.1.67.0`, `overflow=sheet`, `visible=1`) |
| phone-portrait-390x844 | phone | single-entry-all-tools | all-tools-drawer | pass (`version=1.1.67.0`, `overflow=sheet`, `visible=1`) |
| short-height-constrained-1300x420 | phone | single-entry-all-tools | all-tools-drawer | pass (`version=1.1.67.0`, `overflow=sheet`, `visible=1`) |

## Artifacts
- Root: `docs/architecture/plans/MASTER/spfx/launcher/phase-01/wave-03/artifacts/prompt-03-final-hosted-proof-matrix/final/`
- For each viewport row:
  - `{label}.png`
  - `{label}.launcher-markers.json`
- Build/package truth artifacts:
  - `dist/sppkg/hb-intel-homepage.sppkg` (`sha256: 54087b954b2d719fc732bb9c74179ddb4ab96753f4b4a0e7566a27370f505408`)
  - `dist/sppkg/hb-intel-homepage-effectiveness-proof.json`
  - `dist/sppkg/hb-homepage-package-truth-proof.json`
  - `dist/sppkg/hb-homepage-shim-proof.json`

## Visible Hosted Delta (Human Review)
- Launcher now renders with a **distinct heading band** (“Homepage tools” eyebrow + title + live tool-count chip), creating immediate hierarchy above the tile row.
- Desktop/tablet “More tools” tile now reads as a distinct display class (stronger orange/brand blend + elevated treatment), while handheld retains the linear “HB Toolbox” entry.
- Company Tools drawer has stronger desktop identity (`data-hbc-launcher-drawer-display-class="desktop-company-tools"`) and clearer separation from handheld sheet posture.
- Overflow sections now apply deterministic grouping order with “Other tools” intentionally last, improving scanability and reducing IA drift.
- Drawer now enforces compact tray containment (`compact-rail` layout + controlled max height + tile/icon clamps), removing the previous oversized/full-plane failure mode.

## Drift Verdict
- **Drift resolved**:
  - version/package/manifest/runtime markers now all align to `1.1.67.0`
  - hosted matrix assertions are strict and pass in harness proof
  - live SharePoint proof seam is now version-correct and artifact-isolated

## Checklist + Scorecard Closure (/56)
| Category | Score (0-4) | Notes |
| --- | ---: | --- |
| Doctrine and host compliance | 4 | Host-safe entry ownership and launcher shell-fit markers pass in hosted matrix |
| UI-kit / premium-stack compliance | 4 | Premium stack actively used (`motion`, `floating-ui`, governed tile-family, grouped drawer) |
| Token and styling discipline | 4 | Drawer tray tokens now enforce explicit containment, tile sizing, icon sizing, and density across breakpoints |
| Purpose-fit sophistication and persona expression | 4 | Surface reads as homepage utility rail, not generic action strip |
| Surface composition and hierarchy | 4 | New heading band + count chip + stronger overflow class creates obvious first-view sequence |
| Homepage integration quality | 4 | Hero → launcher → shell rhythm and wrapper shell alignment hold across matrix |
| Breakpoint and shell-fit quality | 4 | Device/resolution matrix + short-height handheld posture pass |
| Interaction completeness | 4 | More tools tray + compact rails + keyboard/escape/focus return behaviors validated |
| State-model completeness | 3 | Loading/empty/error remain covered; no unresolved launcher state regressions |
| Contract, data, and backend seam rigor | 4 | Authority tests enforce solution/manifest/marker lockstep including duplicate manifest guard |
| Identity, media, and attribution quality | 3 | Launcher icon/caption grammar improved; identity obligations mostly satisfied via governed icon mapping |
| Accessibility and keyboard behavior | 4 | Focus-visible, dialog semantics, handheld touch posture, reduced-motion guards maintained |
| Host-runtime resilience | 4 | Local hosted matrix strict pass; package-truth proofs confirm runtime asset linkage |
| Validation and closure proof | 3 | Harness proof complete with new containment/density assertions; live SharePoint run still requires authenticated tenant session for non-skipped assertions |

**Total: 53 / 56**

Threshold interpretation:
- Minimum professional acceptance: **MET**
- Homepage-grade acceptance (40+): **MET**
- Flagship / benchmark-grade acceptance (48+): **MET**

## Closure Notes
- Hosted proof seam hard-fails on missing launcher markers and mismatched version.
- Handheld closure proof and matrix proof are pinned to launcher version `1.1.67.0`.
- Live SharePoint proof seam is updated to the same version and uses isolated artifact capture root (`prompt-04-live-sharepoint-handheld-proof`).
