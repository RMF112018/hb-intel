# PCC Live Breakpoint Evidence

- Run ID: breakpoints-1778273063597
- Generated: 2026-05-08T20:44:56.961Z
- Tenant site: https://hedrickbrotherscom.sharepoint.[redacted-blob]
- Tenant page: https://hedrickbrotherscom.sharepoint.[redacted-blob].aspx
- Expected package version: 1.0.0.19
- EV refs: EV-59, EV-60, EV-61, EV-62, EV-63, EV-64, EV-65, EV-66, EV-67, EV-68, EV-69, EV-70, EV-71
- selfSkipped: false
- runState: completed

## Summary
- Surface/viewport pairs: 64
- Screenshot count: 64
- Card measurement count: 512
- Touch target measurement count: 656
- Warning count: 256
- Mode mismatch count: 0
- Horizontal overflow count: 0
- Clipped card count: 32
- Direct-child issue count: 0
- Touch target issue count: 493
- Touch target diagnostics (candidate/measured/hidden/disabled/disabled-filtered/fallback-used): 656/656/0/408/0/0
- Breakpoint issue register count: 1549

## Touch Target Reconciliation Diagnostics
- Breakpoint lane purpose: responsive/viewport field-fit touch-target measurement.
- Breakpoint threshold policy: 44px on touch viewports and 32px on non-touch viewports.
- Breakpoint and accessibility touch-target counts may differ by lane scope and threshold; count differences alone are not failure outcomes.
- Zero-measure reason counts:
  - root-not-found: 0
  - no-candidates-in-root: 16
  - all-candidates-hidden: 0
  - all-candidates-disabled-or-excluded: 0
  - measurement-error: 0

## Breakpoint Issue Register
- JSON: pcc-live-breakpoint-issue-register.json
- Markdown: pcc-live-breakpoint-issue-register.md
- Total issues: 1549
- Issue counts by type:
  - mode-mismatch: 0
  - horizontal-overflow: 0
  - card-clipping: 32
  - card-overflow-x: 512
  - card-overflow-y: 512
  - direct-child-invariant: 0
  - touch-target-size: 493
  - missing-grid: 0
- Issue rows are evidence-support signals and are not automated failure outcomes.

## Surface/Viewport Table
| Viewport | Surface | Mode (observed/derived) | Cards | Touch Targets | Warnings |
|---|---|---|---:|---:|---:|
| phone-390 | project-home | phone / phone | 16 | 19 | 2 |
| phone-390 | team-and-access | phone / phone | 4 | 7 | 2 |
| phone-390 | documents | phone / phone | 6 | 8 | 2 |
| phone-390 | project-readiness | phone / phone | 9 | 10 | 2 |
| phone-390 | approvals | phone / phone | 11 | 12 | 2 |
| phone-390 | external-systems | phone / phone | 10 | 26 | 2 |
| phone-390 | control-center-settings | phone / phone | 3 | 0 | 2 |
| phone-390 | site-health | phone / phone | 5 | 0 | 2 |
| tablet-portrait-768 | project-home | tabletPortrait / tabletPortrait | 16 | 19 | 2 |
| tablet-portrait-768 | team-and-access | tabletPortrait / tabletPortrait | 4 | 7 | 2 |
| tablet-portrait-768 | documents | tabletPortrait / tabletPortrait | 6 | 8 | 2 |
| tablet-portrait-768 | project-readiness | tabletPortrait / tabletPortrait | 9 | 10 | 2 |
| tablet-portrait-768 | approvals | tabletPortrait / tabletPortrait | 11 | 12 | 2 |
| tablet-portrait-768 | external-systems | tabletPortrait / tabletPortrait | 10 | 26 | 2 |
| tablet-portrait-768 | control-center-settings | tabletPortrait / tabletPortrait | 3 | 0 | 2 |
| tablet-portrait-768 | site-health | tabletPortrait / tabletPortrait | 5 | 0 | 2 |
| tablet-landscape-1024 | project-home | tabletLandscape / tabletLandscape | 16 | 19 | 2 |
| tablet-landscape-1024 | team-and-access | tabletLandscape / tabletLandscape | 4 | 7 | 2 |
| tablet-landscape-1024 | documents | tabletLandscape / tabletLandscape | 6 | 8 | 2 |
| tablet-landscape-1024 | project-readiness | tabletLandscape / tabletLandscape | 9 | 10 | 2 |
| tablet-landscape-1024 | approvals | tabletLandscape / tabletLandscape | 11 | 12 | 2 |
| tablet-landscape-1024 | external-systems | tabletLandscape / tabletLandscape | 10 | 26 | 2 |
| tablet-landscape-1024 | control-center-settings | tabletLandscape / tabletLandscape | 3 | 0 | 2 |
| tablet-landscape-1024 | site-health | tabletLandscape / tabletLandscape | 5 | 0 | 2 |
| small-laptop-1180 | project-home | smallLaptop / smallLaptop | 16 | 19 | 2 |
| small-laptop-1180 | team-and-access | smallLaptop / smallLaptop | 4 | 7 | 2 |
| small-laptop-1180 | documents | smallLaptop / smallLaptop | 6 | 8 | 2 |
| small-laptop-1180 | project-readiness | smallLaptop / smallLaptop | 9 | 10 | 2 |
| small-laptop-1180 | approvals | smallLaptop / smallLaptop | 11 | 12 | 2 |
| small-laptop-1180 | external-systems | smallLaptop / smallLaptop | 10 | 26 | 2 |
| small-laptop-1180 | control-center-settings | smallLaptop / smallLaptop | 3 | 0 | 2 |
| small-laptop-1180 | site-health | smallLaptop / smallLaptop | 5 | 0 | 2 |
| standard-laptop-1366 | project-home | standardLaptop / standardLaptop | 16 | 19 | 2 |
| standard-laptop-1366 | team-and-access | standardLaptop / standardLaptop | 4 | 7 | 2 |
| standard-laptop-1366 | documents | standardLaptop / standardLaptop | 6 | 8 | 2 |
| standard-laptop-1366 | project-readiness | standardLaptop / standardLaptop | 9 | 10 | 2 |
| standard-laptop-1366 | approvals | standardLaptop / standardLaptop | 11 | 12 | 2 |
| standard-laptop-1366 | external-systems | standardLaptop / standardLaptop | 10 | 26 | 2 |
| standard-laptop-1366 | control-center-settings | standardLaptop / standardLaptop | 3 | 0 | 2 |
| standard-laptop-1366 | site-health | standardLaptop / standardLaptop | 5 | 0 | 2 |
| large-laptop-1536 | project-home | standardLaptop / standardLaptop | 16 | 19 | 2 |
| large-laptop-1536 | team-and-access | standardLaptop / standardLaptop | 4 | 7 | 2 |
| large-laptop-1536 | documents | standardLaptop / standardLaptop | 6 | 8 | 2 |
| large-laptop-1536 | project-readiness | standardLaptop / standardLaptop | 9 | 10 | 2 |
| large-laptop-1536 | approvals | standardLaptop / standardLaptop | 11 | 12 | 2 |
| large-laptop-1536 | external-systems | standardLaptop / standardLaptop | 10 | 26 | 2 |
| large-laptop-1536 | control-center-settings | standardLaptop / standardLaptop | 3 | 0 | 2 |
| large-laptop-1536 | site-health | standardLaptop / standardLaptop | 5 | 0 | 2 |
| desktop-1728 | project-home | desktop / desktop | 16 | 19 | 2 |
| desktop-1728 | team-and-access | desktop / desktop | 4 | 7 | 2 |
| desktop-1728 | documents | desktop / desktop | 6 | 8 | 2 |
| desktop-1728 | project-readiness | desktop / desktop | 9 | 10 | 2 |
| desktop-1728 | approvals | desktop / desktop | 11 | 12 | 2 |
| desktop-1728 | external-systems | desktop / desktop | 10 | 26 | 2 |
| desktop-1728 | control-center-settings | desktop / desktop | 3 | 0 | 2 |
| desktop-1728 | site-health | desktop / desktop | 5 | 0 | 2 |
| ultrawide-2048 | project-home | ultrawide / ultrawide | 16 | 19 | 2 |
| ultrawide-2048 | team-and-access | ultrawide / ultrawide | 4 | 7 | 2 |
| ultrawide-2048 | documents | ultrawide / ultrawide | 6 | 8 | 2 |
| ultrawide-2048 | project-readiness | ultrawide / ultrawide | 9 | 10 | 2 |
| ultrawide-2048 | approvals | ultrawide / ultrawide | 11 | 12 | 2 |
| ultrawide-2048 | external-systems | ultrawide / ultrawide | 10 | 26 | 2 |
| ultrawide-2048 | control-center-settings | ultrawide / ultrawide | 3 | 0 | 2 |
| ultrawide-2048 | site-health | ultrawide / ultrawide | 5 | 0 | 2 |

## Artifact Paths
- /Users/bobbyfetting/hb-intel/docs/architecture/evidence/pcc-live/breakpoints-1778273063597/pcc-live-breakpoint-evidence.json
- /Users/bobbyfetting/hb-intel/docs/architecture/evidence/pcc-live/breakpoints-1778273063597/pcc-live-breakpoint-evidence.md
- /Users/bobbyfetting/hb-intel/docs/architecture/evidence/pcc-live/breakpoints-1778273063597/pcc-live-breakpoint-matrix.json
- /Users/bobbyfetting/hb-intel/docs/architecture/evidence/pcc-live/breakpoints-1778273063597/pcc-live-breakpoint-card-measurements.json
- /Users/bobbyfetting/hb-intel/docs/architecture/evidence/pcc-live/breakpoints-1778273063597/pcc-live-breakpoint-touch-targets.json
- /Users/bobbyfetting/hb-intel/docs/architecture/evidence/pcc-live/breakpoints-1778273063597/pcc-live-breakpoint-issue-register.json
- /Users/bobbyfetting/hb-intel/docs/architecture/evidence/pcc-live/breakpoints-1778273063597/pcc-live-breakpoint-issue-register.md

## Artifact Policy
- Responsive screenshot PNG files are operator-review required and not auto-commit eligible.
- JSON/markdown inventories are commit-eligible only after review/scrubbing.
- Raw Playwright outputs are never-commit.

## Warnings
- Card clipping/overflow issues detected on viewport=phone-390.
- Touch target size issues detected on viewport=phone-390.
- Card clipping/overflow issues detected on viewport=phone-390.
- Touch target size issues detected on viewport=phone-390.
- Card clipping/overflow issues detected on viewport=phone-390.
- Touch target size issues detected on viewport=phone-390.
- Card clipping/overflow issues detected on viewport=phone-390.
- Touch target size issues detected on viewport=phone-390.
- Card clipping/overflow issues detected on viewport=phone-390.
- Touch target size issues detected on viewport=phone-390.
- Card clipping/overflow issues detected on viewport=phone-390.
- Touch target size issues detected on viewport=phone-390.
- Card clipping/overflow issues detected on viewport=phone-390.
- Touch-target diagnostics (phone-390): no-candidates-in-root.
- Card clipping/overflow issues detected on viewport=phone-390.
- Touch-target diagnostics (phone-390): no-candidates-in-root.
- Card clipping/overflow issues detected on viewport=tablet-portrait-768.
- Touch target size issues detected on viewport=tablet-portrait-768.
- Card clipping/overflow issues detected on viewport=tablet-portrait-768.
- Touch target size issues detected on viewport=tablet-portrait-768.
- Card clipping/overflow issues detected on viewport=tablet-portrait-768.
- Touch target size issues detected on viewport=tablet-portrait-768.
- Card clipping/overflow issues detected on viewport=tablet-portrait-768.
- Touch target size issues detected on viewport=tablet-portrait-768.
- Card clipping/overflow issues detected on viewport=tablet-portrait-768.
- Touch target size issues detected on viewport=tablet-portrait-768.
- Card clipping/overflow issues detected on viewport=tablet-portrait-768.
- Touch target size issues detected on viewport=tablet-portrait-768.
- Card clipping/overflow issues detected on viewport=tablet-portrait-768.
- Touch-target diagnostics (tablet-portrait-768): no-candidates-in-root.
- Card clipping/overflow issues detected on viewport=tablet-portrait-768.
- Touch-target diagnostics (tablet-portrait-768): no-candidates-in-root.
- Card clipping/overflow issues detected on viewport=tablet-landscape-1024.
- Touch target size issues detected on viewport=tablet-landscape-1024.
- Card clipping/overflow issues detected on viewport=tablet-landscape-1024.
- Touch target size issues detected on viewport=tablet-landscape-1024.
- Card clipping/overflow issues detected on viewport=tablet-landscape-1024.
- Touch target size issues detected on viewport=tablet-landscape-1024.
- Card clipping/overflow issues detected on viewport=tablet-landscape-1024.
- Touch target size issues detected on viewport=tablet-landscape-1024.
- Card clipping/overflow issues detected on viewport=tablet-landscape-1024.
- Touch target size issues detected on viewport=tablet-landscape-1024.
- Card clipping/overflow issues detected on viewport=tablet-landscape-1024.
- Touch target size issues detected on viewport=tablet-landscape-1024.
- Card clipping/overflow issues detected on viewport=tablet-landscape-1024.
- Touch-target diagnostics (tablet-landscape-1024): no-candidates-in-root.
- Card clipping/overflow issues detected on viewport=tablet-landscape-1024.
- Touch-target diagnostics (tablet-landscape-1024): no-candidates-in-root.
- Card clipping/overflow issues detected on viewport=small-laptop-1180.
- Touch target size issues detected on viewport=small-laptop-1180.
- Card clipping/overflow issues detected on viewport=small-laptop-1180.
- Touch target size issues detected on viewport=small-laptop-1180.
- Card clipping/overflow issues detected on viewport=small-laptop-1180.
- Touch target size issues detected on viewport=small-laptop-1180.
- Card clipping/overflow issues detected on viewport=small-laptop-1180.
- Touch target size issues detected on viewport=small-laptop-1180.
- Card clipping/overflow issues detected on viewport=small-laptop-1180.
- Touch target size issues detected on viewport=small-laptop-1180.
- Card clipping/overflow issues detected on viewport=small-laptop-1180.
- Touch target size issues detected on viewport=small-laptop-1180.
- Card clipping/overflow issues detected on viewport=small-laptop-1180.
- Touch-target diagnostics (small-laptop-1180): no-candidates-in-root.
- Card clipping/overflow issues detected on viewport=small-laptop-1180.
- Touch-target diagnostics (small-laptop-1180): no-candidates-in-root.
- Card clipping/overflow issues detected on viewport=standard-laptop-1366.
- Touch target size issues detected on viewport=standard-laptop-1366.
- Card clipping/overflow issues detected on viewport=standard-laptop-1366.
- Touch target size issues detected on viewport=standard-laptop-1366.
- Card clipping/overflow issues detected on viewport=standard-laptop-1366.
- Touch target size issues detected on viewport=standard-laptop-1366.
- Card clipping/overflow issues detected on viewport=standard-laptop-1366.
- Touch target size issues detected on viewport=standard-laptop-1366.
- Card clipping/overflow issues detected on viewport=standard-laptop-1366.
- Touch target size issues detected on viewport=standard-laptop-1366.
- Card clipping/overflow issues detected on viewport=standard-laptop-1366.
- Touch target size issues detected on viewport=standard-laptop-1366.
- Card clipping/overflow issues detected on viewport=standard-laptop-1366.
- Touch-target diagnostics (standard-laptop-1366): no-candidates-in-root.
- Card clipping/overflow issues detected on viewport=standard-laptop-1366.
- Touch-target diagnostics (standard-laptop-1366): no-candidates-in-root.
- Card clipping/overflow issues detected on viewport=large-laptop-1536.
- Touch target size issues detected on viewport=large-laptop-1536.
- Card clipping/overflow issues detected on viewport=large-laptop-1536.
- Touch target size issues detected on viewport=large-laptop-1536.
- Card clipping/overflow issues detected on viewport=large-laptop-1536.
- Touch target size issues detected on viewport=large-laptop-1536.
- Card clipping/overflow issues detected on viewport=large-laptop-1536.
- Touch target size issues detected on viewport=large-laptop-1536.
- Card clipping/overflow issues detected on viewport=large-laptop-1536.
- Touch target size issues detected on viewport=large-laptop-1536.
- Card clipping/overflow issues detected on viewport=large-laptop-1536.
- Touch target size issues detected on viewport=large-laptop-1536.
- Card clipping/overflow issues detected on viewport=large-laptop-1536.
- Touch-target diagnostics (large-laptop-1536): no-candidates-in-root.
- Card clipping/overflow issues detected on viewport=large-laptop-1536.
- Touch-target diagnostics (large-laptop-1536): no-candidates-in-root.
- Card clipping/overflow issues detected on viewport=desktop-1728.
- Touch target size issues detected on viewport=desktop-1728.
- Card clipping/overflow issues detected on viewport=desktop-1728.
- Touch target size issues detected on viewport=desktop-1728.
- Card clipping/overflow issues detected on viewport=desktop-1728.
- Touch target size issues detected on viewport=desktop-1728.
- Card clipping/overflow issues detected on viewport=desktop-1728.
- Touch target size issues detected on viewport=desktop-1728.
- Card clipping/overflow issues detected on viewport=desktop-1728.
- Touch target size issues detected on viewport=desktop-1728.
- Card clipping/overflow issues detected on viewport=desktop-1728.
- Touch target size issues detected on viewport=desktop-1728.
- Card clipping/overflow issues detected on viewport=desktop-1728.
- Touch-target diagnostics (desktop-1728): no-candidates-in-root.
- Card clipping/overflow issues detected on viewport=desktop-1728.
- Touch-target diagnostics (desktop-1728): no-candidates-in-root.
- Card clipping/overflow issues detected on viewport=ultrawide-2048.
- Touch target size issues detected on viewport=ultrawide-2048.
- Card clipping/overflow issues detected on viewport=ultrawide-2048.
- Touch target size issues detected on viewport=ultrawide-2048.
- Card clipping/overflow issues detected on viewport=ultrawide-2048.
- Touch target size issues detected on viewport=ultrawide-2048.
- Card clipping/overflow issues detected on viewport=ultrawide-2048.
- Touch target size issues detected on viewport=ultrawide-2048.
- Card clipping/overflow issues detected on viewport=ultrawide-2048.
- Touch target size issues detected on viewport=ultrawide-2048.
- Card clipping/overflow issues detected on viewport=ultrawide-2048.
- Touch target size issues detected on viewport=ultrawide-2048.
- Card clipping/overflow issues detected on viewport=ultrawide-2048.
- Touch-target diagnostics (ultrawide-2048): no-candidates-in-root.
- Card clipping/overflow issues detected on viewport=ultrawide-2048.
- Touch-target diagnostics (ultrawide-2048): no-candidates-in-root.

> This output is breakpoint, container, overflow, rowspan, and touch evidence support for EV-59..EV-71 only. It is not a final scorecard result and does not mark any EV captured without operator review.
