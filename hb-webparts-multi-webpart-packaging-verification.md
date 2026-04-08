# hb-webparts Multi-Webpart Packaging Verification Matrix

## Runtime Mount Cross-Reference

Each entry traces from **manifest → GUID → mount.tsx renderer → component file → build artifact**.

| # | Webpart Title | Component ID | Source Manifest | mount.tsx Renderer Key | Component File | In Bundle |
|---|---|---|---|---|---|---|
| 1 | Personalized Welcome Header | `46bfde64-f0cb-4f62-9f6b-a466f8fadc1f` | `src/webparts/personalizedWelcomeHeader/PersonalizedWelcomeHeaderWebPart.manifest.json` | `WEBPART_RENDERERS['46bfde64-...']` | `PersonalizedWelcomeHeader.tsx` | ✓ |
| 2 | HB Hero Banner | `39762a4d-c7fd-44a6-a11e-4f8de9f5778d` | `src/webparts/hbHeroBanner/HbHeroBannerWebPart.manifest.json` | `WEBPART_RENDERERS['39762a4d-...']` | `HbHeroBanner.tsx` | ✓ |
| 3 | Priority Actions Rail | `b3f07190-79cf-437d-a1d6-ecbf3f77e616` | `src/webparts/priorityActionsRail/PriorityActionsRailWebPart.manifest.json` | `WEBPART_RENDERERS['b3f07190-...']` | `PriorityActionsRail.tsx` | ✓ |
| 4 | Tool Launcher / Work Hub | `cb7060f5-b852-4600-b912-a5f6f7221ce2` | `src/webparts/toolLauncherWorkHub/ToolLauncherWorkHubWebPart.manifest.json` | `WEBPART_RENDERERS['cb7060f5-...']` | `ToolLauncherWorkHub.tsx` | ✓ |
| 5 | Company Pulse | `0b53f651-fd92-4f7f-a9da-f7797017f5eb` | `src/webparts/companyPulse/CompanyPulseWebPart.manifest.json` | `WEBPART_RENDERERS['0b53f651-...']` | `CompanyPulse.tsx` | ✓ |
| 6 | Leadership Message | `e8fa8a84-a48a-41d2-85a6-b7c7df70aeca` | `src/webparts/leadershipMessage/LeadershipMessageWebPart.manifest.json` | `WEBPART_RENDERERS['e8fa8a84-...']` | `LeadershipMessage.tsx` | ✓ |
| 7 | People and Culture | `27ac10f4-4054-4dd2-bd53-3b4ef4379ab4` | `src/webparts/peopleCulture/PeopleCultureWebPart.manifest.json` | `WEBPART_RENDERERS['27ac10f4-...']` | `PeopleCultureMerged.tsx` | ✓ |
| 8 | Project / Portfolio Spotlight | `8370ab0c-b6df-4db0-82f1-24b54750f508` | `src/webparts/projectPortfolioSpotlight/ProjectPortfolioSpotlightWebPart.manifest.json` | `WEBPART_RENDERERS['8370ab0c-...']` | `ProjectPortfolioSpotlight.tsx` | ✓ |
| 9 | Safety and Field Excellence | `89ca5ff3-21f4-4b23-a953-4b7306ea1029` | `src/webparts/safetyFieldExcellence/SafetyFieldExcellenceWebPart.manifest.json` | `WEBPART_RENDERERS['89ca5ff3-...']` | `SafetyFieldExcellence.tsx` | ✓ |
| 10 | Smart Search / Wayfinding | `11d72b36-a92f-4e2d-9918-75df2cb0d11e` | `src/webparts/smartSearchWayfinding/SmartSearchWayfindingWebPart.manifest.json` | `WEBPART_RENDERERS['11d72b36-...']` | `SmartSearchWayfinding.tsx` | ✓ |
| 11 | HB Signature Hero | `28acd6a7-2582-4d8a-86d4-b52bfbeb375c` | `src/webparts/hbSignatureHero/HbSignatureHeroWebPart.manifest.json` | `WEBPART_RENDERERS['28acd6a7-...']` | `HbSignatureHero.tsx` | ✓ |

All paths are relative to `apps/hb-webparts/`.

## Excluded Legacy Manifest

| Webpart Title | Component ID | Source Manifest Path | Exclusion Rationale |
|---|---|---|---|
| HB Webparts (legacy) | `535f5a17-fc49-40ea-ac16-5d68895884f7` | `src/webparts/hbWebparts/HbWebpartsWebPart.manifest.json` | Legacy single-surface scaffold manifest intentionally excluded from production toolbox |

## Build Artifact Verification (2026-04-08)

All 11 webpart component IDs were verified present in the compiled IIFE bundle (`apps/hb-webparts/dist/hb-webparts-app.js`, 575.08 KB) produced by a clean `pnpm --filter @hbc/spfx-hb-webparts build` on commit `8426a7df`. Build pipeline (check-types, lint, vite build) passed cleanly. Full evidence log at `docs/architecture/reviews/evidence/ui-system-build-proof/build-evidence-log.md`.

## Traceability Chain

```
Manifest (.manifest.json)
  → GUID (component ID)
    → mount.tsx WEBPART_RENDERERS[GUID]
      → React component (.tsx)
        → Vite IIFE bundle (hb-webparts-app.js)
          → SPFx shell SPComponentLoader
```

Each webpart is traceable through this full chain. The mount dispatch seam (`mount.tsx`) is the single runtime entry point — the SPFx shell calls `mount(el, context, config)` and the GUID in `config.webPartId` selects the correct renderer.
