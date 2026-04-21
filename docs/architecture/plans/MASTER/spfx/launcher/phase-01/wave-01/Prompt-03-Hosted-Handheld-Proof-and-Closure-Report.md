# Prompt 03 - Hosted Handheld Proof and Closure Report

## Scope

Objective: prove handheld launcher runtime markers and posture against the current source contract.

Authoritative target requested:
- `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral` (site-home default)

## Source Contract Baseline

From current source:
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageLauncherBand.tsx`
  - emits band markers:
    - `data-hbc-launcher-device-class`
    - `data-hbc-launcher-handheld-mode`
    - `data-hbc-launcher-cap-governance`
- `packages/ui-kit/src/HbcHomepageLauncher/HbcHomepageLauncher.tsx`
  - emits launcher markers:
    - `data-hbc-homepage-launcher-version`
    - `data-hbc-homepage-launcher-device-class`
    - `data-hbc-homepage-launcher-handheld-mode`
    - `data-hbc-homepage-launcher-cap-governance`
- `packages/ui-kit/src/HbcHomepageLauncher/constants.ts`
  - expected launcher version marker: `1.1.50.0`

Expected handheld runtime posture (phone + short-height):
- device class: `phone`
- handheld mode: `single-entry-all-tools`
- cap governance: `all-tools-drawer`

## Execution Log

### A) Real-hosted SharePoint run (attempted first)

Harness:
- `playwright.homepage-live.config.ts`
- `e2e/live-sharepoint/homepage.launcher.handheld.live.spec.ts`

Command:
- `HB_HOMEPAGE_LIVE_SITE_URL="https://hedrickbrotherscom.sharepoint.com/sites/HBCentral" pnpm exec playwright test --config=playwright.homepage-live.config.ts e2e/live-sharepoint/homepage.launcher.handheld.live.spec.ts`

Outcome:
- Run reached Microsoft sign-in page, not authenticated homepage DOM.
- Launcher marker root was not present in all 3 required viewport cases.
- Evidence:
  - `test-results/homepage.launcher.handheld-586ef-oint-phone-portrait-390x844/error-context.md`
  - `test-results/homepage.launcher.handheld-52957-oint-phone-portrait-430x992/error-context.md`
  - `test-results/homepage.launcher.handheld-3b0fb-height-constrained-1300x420/error-context.md`

### B) User-directed fallback capture path (local hosted proxy)

Per explicit direction, fallback proof used local hosted workflow.

Harness:
- `e2e/webparts/hb-homepage-handheld-closure-proof.spec.ts`

Command:
- `pnpm exec playwright test --config=playwright.webparts.config.ts e2e/webparts/hb-homepage-handheld-closure-proof.spec.ts`

Captured artifacts:
- `docs/architecture/plans/MASTER/spfx/launcher/phase-01/wave-01/artifacts/prompt-03-hosted-proof/phone-portrait-390x844.png`
- `docs/architecture/plans/MASTER/spfx/launcher/phase-01/wave-01/artifacts/prompt-03-hosted-proof/phone-portrait-430x992.png`
- `docs/architecture/plans/MASTER/spfx/launcher/phase-01/wave-01/artifacts/prompt-03-hosted-proof/short-height-constrained-1300x420.png`
- `docs/architecture/plans/MASTER/spfx/launcher/phase-01/wave-01/artifacts/prompt-03-hosted-proof/phone-portrait-390x844.markers.json`
- `docs/architecture/plans/MASTER/spfx/launcher/phase-01/wave-01/artifacts/prompt-03-hosted-proof/phone-portrait-430x992.markers.json`
- `docs/architecture/plans/MASTER/spfx/launcher/phase-01/wave-01/artifacts/prompt-03-hosted-proof/short-height-constrained-1300x420.markers.json`

## Marker Record

| Viewport case | launcherBandPresent | launcherSurfacePresent | launcherVersion | deviceClass | handheldMode | capGovernance |
|---|---:|---:|---|---|---|---|
| `390x844` | false | false | null | null | null | null |
| `430x992` | false | false | null | null | null | null |
| `1300x420` short-height | false | false | null | null | null | null |

## Closure Verdict

**Result: NOT MATCHED / NOT CREDIBLY CLOSED for real-hosted objective.**

Reason:
- Real-hosted run did not reach authenticated homepage content (sign-in gate), so required hosted launcher markers could not be captured.
- Fallback local-hosted capture did run, but launcher markers were still absent in the rendered priority-actions region (error-state path with no launcher band root markers present).
- Therefore there is no credible evidence yet that deployed/hosted handheld launcher posture is stable and aligned to source contract markers.

## Next Required Action

To close Prompt 03 credibly:
1. Provide an authenticated Playwright storage state for the real SharePoint tenant/session and re-run the live harness.
2. Ensure homepage data/config path renders launcher band in hosted runtime for the three required viewport cases.
3. Re-capture version/device/handheld/cap-governance markers and replace this report verdict with matched/non-matched based on actual hosted DOM truth.
