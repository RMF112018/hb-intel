# Prompt 04 — package proof (source → artifact trace)

## Deployment intent

This closure aligns **hb-intel-homepage** solution **feature version**, **hb-homepage** web part manifest, **hb-webparts** runtime manifest copy, and **homepage launcher** version marker to **1.1.98.0** so version-authority tests pass and the packaged homepage artifact matches a single SharePoint deployment version line.

Version-authority edits:

- `apps/hb-homepage/config/package-solution.json` — `solution.version` **1.1.98.0**, `features[0].version` **1.1.98.0**
- `apps/hb-homepage/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json` — **1.1.98.0**
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json` — **1.1.98.0**
- `packages/homepage-launcher/src/constants.ts` — `HOMEPAGE_LAUNCHER_VERSION` **1.1.98.0**

## Git revision

**Evidence commit SHA:** resolve with:

```bash
git log -1 --format=%H -- docs/architecture/plans/MASTER/spfx/foleon-reader/leadership-message-reader-rescue/evidence/PACKAGE_PROOF.md
```

That commit contains the version-authority edits and this proof document; built artifacts (`*.sppkg`) below were produced from **local workspace state immediately prior** to that evidence commit (see machine-readable `dist/sppkg/*.json` timestamps).

**Packages built:** UTC ~2026-04-27T20:23Z — primary `hb-intel-homepage.sppkg`, secondary `hb-intel-foleon.sppkg` (SHA-256 values recorded from that run).

## Primary artifact — `hb-intel-homepage.sppkg`

| Field | Value |
| --- | --- |
| Path | `/Users/bobbyfetting/hb-intel/dist/sppkg/hb-intel-homepage.sppkg` |
| SHA-256 | `5ded42a7e23c8b6d4a3535fd01575b2a4db55d65aee284d0f0087322fe237e8b` |
| Package build (UTC) | ~**2026-04-27T20:23:38Z** (gulp `package-solution`; see `hb-homepage-package-truth-proof.json` → `generatedAt`) |
| Bundled app JS (inside `.sppkg`) | `ClientSideAssets/hb-homepage-app-4b010aba.js` |
| Source bundle fingerprint (build script) | sha256 prefix `4b010aba…` (see build log / `hb-homepage-package-truth-proof.json`) |

**Leadership copy/layout proof:** extracted bundle contains minified occurrences (substring counts via `rg -F --count`) for approved presentation strings including:

- `A message from leadership` — present  
- `Leadership message preview` — present  
- `Preview only` — present  
- `Open in Foleon` — present  
- `Read the leadership message` — present  
- Lane key `leadership-message` — present  

**Sibling lanes (homepage row):** same extracted bundle contains markers for Project Spotlight / Company Pulse routing (`projectSpotlight`, `companyPulse`, `company-pulse`, `project-portfolio-spotlight`, `data-foleon-layout`) — supports “no Leadership-only regression removing sibling wiring.”

## Secondary artifact — `hb-intel-foleon.sppkg`

| Field | Value |
| --- | --- |
| Path | `/Users/bobbyfetting/hb-intel/dist/sppkg/hb-intel-foleon.sppkg` |
| SHA-256 | `dc14a9e7bfd4609c97ca915440e6b0fcad95ba91774f82328443b27e8eebb4c4` |
| Solution / web part version | **1.0.38.0** (`apps/hb-intel-foleon/config/package-solution.json`) |
| Bundled app JS | `ClientSideAssets/hb-intel-foleon-app-a6d4ef42.js` |

**Consumer proof:** Leadership presentation strings and lane keys appear in this bundle as expected for a sibling consumer of `@hbc/foleon-reader`.

## Machine-readable proofs

- `dist/sppkg/hb-homepage-package-truth-proof.json` — homepage package-truth  
- `dist/sppkg/hb-intel-homepage-effectiveness-proof.json` — homepage effectiveness checks  
- `dist/sppkg/hb-intel-foleon-package-truth-proof.json` — Foleon domain package-truth  
- `dist/sppkg/hb-intel-foleon-package-proof.json` — output of `pnpm --filter @hbc/spfx-hb-intel-foleon package:proof`

## Acceptance crosswalk (targets)

- Hard-stop “hosted package proof cannot show source truth” — addressed via SHA + fingerprint JSON + Leadership string grep on extracted homepage bundle.  
- Scorecard target **48+/56** — requires hosted UI evidence; see `HOSTED_SCREENSHOT_INDEX.md`.
