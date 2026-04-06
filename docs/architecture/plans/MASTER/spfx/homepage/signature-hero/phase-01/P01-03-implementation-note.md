# P01-03 Implementation Note — Manifest, Toolbox, and Top-Band Cleanup

**Prompt:** `Prompt-03-Manifest-Toolbox-And-Top-Band-Cleanup.md`
**Date:** 2026-04-06
**Version:** 1.0.0.68

## Objective

Lock the rollout posture so only HB Signature Hero is visible in the SharePoint toolbox for this build cycle. All other homepage webparts are hidden via `hiddenFromToolbox: true`.

## Toolbox Visibility Map

| Webpart | Manifest ID | Visible | Notes |
|---------|-------------|---------|-------|
| **HB Signature Hero** | `28acd6a7` | **Yes** | Canonical flagship hero, `supportsFullBleed: true` |
| HB Hero Banner | `39762a4d` | No | Hidden in P01-01, standalone only |
| Personalized Welcome Header | `46bfde64` | No | Hidden in P01-01, standalone only |
| HB Webparts (scaffold) | `535f5a17` | No | Hidden in P01-03 |
| Company Pulse | `0b53f651` | No | Hidden in P01-03 |
| Leadership Message | `e8fa8a84` | No | Hidden in P01-03 |
| People and Culture | `27ac10f4` | No | Hidden in P01-03 |
| Priority Actions Rail | `b3f07190` | No | Hidden in P01-03 |
| Project / Portfolio Spotlight | `8370ab0c` | No | Hidden in P01-03 |
| Safety and Field Excellence | `89ca5ff3` | No | Hidden in P01-03 |
| Smart Search / Wayfinding | `11d72b36` | No | Hidden in P01-03 |
| Tool Launcher / Work Hub | `cb7060f5` | No | Hidden in P01-03 |

## What Changed

### Manifests updated (9 files)
Added `"hiddenFromToolbox": true` to the preconfigured entry of each non-hero homepage webpart:

- `hbWebparts/HbWebpartsWebPart.manifest.json`
- `companyPulse/CompanyPulseWebPart.manifest.json`
- `leadershipMessage/LeadershipMessageWebPart.manifest.json`
- `peopleCulture/PeopleCultureWebPart.manifest.json`
- `priorityActionsRail/PriorityActionsRailWebPart.manifest.json`
- `projectPortfolioSpotlight/ProjectPortfolioSpotlightWebPart.manifest.json`
- `safetyFieldExcellence/SafetyFieldExcellenceWebPart.manifest.json`
- `smartSearchWayfinding/SmartSearchWayfindingWebPart.manifest.json`
- `toolLauncherWorkHub/ToolLauncherWorkHubWebPart.manifest.json`

### Version bump
- `package-solution.json`: `1.0.0.67` → `1.0.0.68`

## What Was NOT Changed

- **HbSignatureHero manifest** — already cleaned in P01-01 (stale props removed, description updated, `supportsFullBleed: true` preserved)
- **HbHeroBanner / PersonalizedWelcomeHeader manifests** — already hidden in P01-01
- **No component code changed** — this is a manifest-only pass
- **mount.tsx** — hidden webparts remain programmatically mountable; `hiddenFromToolbox` only suppresses the SharePoint author toolbox picker

## Verification Proof

### Signature Hero manifest is clean
- `properties: {}` — no stale editorial defaults
- `supportsFullBleed: true` — full-width support preserved
- Description: "Canonical flagship homepage hero with brand lockup, tagline, and personalized greeting for full-width top-band composition."

### Only Signature Hero is visible
All 11 non-hero manifests now include `"hiddenFromToolbox": true`. Only `HbSignatureHeroWebPart.manifest.json` omits this flag.

### No top-band ambiguity
- HbHeroBanner description: "Standalone editorial hero banner. Not for flagship homepage use…"
- PersonalizedWelcomeHeader description: "Standalone greeting header. Not for flagship homepage use…"

## Validation

| Check | Result |
|-------|--------|
| `tsc --noEmit` | Pass |
| `eslint src/` | Pass |
| `vite build` | Pass (452.24 KB JS / 20.17 KB CSS) |
