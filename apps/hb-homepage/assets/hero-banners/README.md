## Homepage Hero Banner Ownership

This directory is the authoritative source for the flagship homepage
hero banner package assets.

Canonical banner set:

- `banner_home_7_morning.png`
- `banner_home_7_mid-day.png`
- `banner_home_7_evening.png`
- `banner_home_7_night.png`

These files are staged into the `hb-homepage` build output by
`tools/build-spfx-package.ts` and must ship in
`hb-intel-homepage.sppkg` under `ClientSideAssets/`.

Do not move this set to another package domain without updating both
the packaging seam and the homepage sppkg verification runbook.
