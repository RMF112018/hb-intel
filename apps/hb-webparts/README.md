# @hbc/spfx-hb-webparts — HB Central Homepage Product

The homepage product lane for HB Intel's SharePoint presence. Packages all 10 HB Central homepage webparts into a single `.sppkg` for deployment to the SharePoint App Catalog.

## Architecture

This package is **Lane A** (Homepage / Page-Canvas Product) in the [three-lane SharePoint architecture](../../docs/reference/sharepoint-homepage-shell-boundaries.md). It owns all content that appears on the HB Central homepage page canvas.

**It does not own:**
- Shell-extension surfaces (Lane B — future `apps/hb-shell-extension`)
- Navigation / governance surfaces (Lane C — SharePoint config)
- Generic SPFx domain-app composition patterns
- Shared UI primitives (owned by `@hbc/ui-kit`)

## Homepage Webparts (10)

| Zone | Webpart | Manifest ID | Folder |
|------|---------|-------------|--------|
| Top Band | Personalized Welcome Header | `46bfde64-...` | `src/webparts/personalizedWelcomeHeader/` |
| Top Band | HB Hero Banner | `39762a4d-...` | `src/webparts/hbHeroBanner/` |
| Utility | Priority Actions Rail | `b3f07190-...` | `src/webparts/priorityActionsRail/` |
| Utility | Tool Launcher / Work Hub | `cb7060f5-...` | `src/webparts/toolLauncherWorkHub/` |
| Communications | Company Pulse | `0b53f651-...` | `src/webparts/companyPulse/` |
| Communications | Leadership Message | `e8fa8a84-...` | `src/webparts/leadershipMessage/` |
| Communications | People & Culture | `27ac10f4-...` | `src/webparts/peopleCulture/` |
| Operational | Project / Portfolio Spotlight | `8370ab0c-...` | `src/webparts/projectPortfolioSpotlight/` |
| Operational | Safety & Field Excellence | `89ca5ff3-...` | `src/webparts/safetyFieldExcellence/` |
| Discovery | Smart Search / Wayfinding | `11d72b36-...` | `src/webparts/smartSearchWayfinding/` |

Each webpart folder contains a manifest file, an `index.ts` barrel, and a React component.

## Package Structure

```
src/
├── mount.tsx                          # Mount/dispatch seam (SPFx entry contract)
├── mount-hero-proof-case.tsx          # Isolated proof-case entry (HbHeroBanner)
├── mount-priority-actions-rail-proof-case.tsx  # Isolated proof-case entry (PriorityActionsRail)
├── test-setup.ts                      # Vitest setup
├── homepage/
│   ├── ReferenceHomepageComposition.tsx  # Demo/reference composition (all 10 webparts)
│   ├── shared/                        # Homepage composition primitives (local)
│   ├── helpers/                       # Config normalization, identity, greeting, visibility
│   ├── webparts/                      # Per-zone configuration type contracts
│   ├── models/                        # Shared content model types
│   └── __tests__/                     # Shared-layer tests (13 files)
└── webparts/                          # 10 production webpart folders + 1 legacy scaffold
```

## Mount / Dispatch Seam

`src/mount.tsx` is the primary package seam. It exports `mount(el, context, config)` and `unmount()` on `globalThis.__hbIntel_hbWebparts`.

**Dispatch behavior:**
1. Receives `webPartId` from the SPFx shell via `config.webPartId`
2. Looks up the matching React component in `WEBPART_RENDERERS` (keyed by manifest ID)
3. Renders the matched component inside a React root
4. Falls back to `ReferenceHomepageComposition` when no webPartId matches (dev/preview context)

This seam is the SPFx loader contract boundary. The shell webpart (`tools/spfx-shell/`) calls `mount()` after loading the IIFE bundle via `SPComponentLoader`.

## Governed Composition Reference

`src/homepage/ReferenceHomepageComposition.tsx` is the governed composition reference for the homepage package. It demonstrates the 5-zone homepage architecture with all 10 webparts composed in their intended zone arrangement:

1. **Top Band** — Welcome Header + Hero Banner (warm blue tint)
2. **Utility** — Priority Actions + Tool Launcher (transparent, density-driven)
3. **Communications** — Company Pulse + Leadership Message + People & Culture (warm orange tint)
4. **Operational Awareness** — Project Spotlight + Safety Excellence (cool blue tint)
5. **Discovery** — Smart Search / Wayfinding (neutral tint)

Each zone is wrapped with `hpZoneSection()` for visual differentiation. The composition uses a grid layout with `HP_SPACE['2xl']` gap for consistent zone-to-zone rhythm.

**Roles:**
- **Development preview** — renders when the app is loaded outside SharePoint (no SPFx webPartId)
- **Visual integration surface** — confirms all webparts compose correctly in the zone structure
- **Zone architecture reference** — demonstrates governed zone order, tinting, and section rhythm

It is **not** the production rendering path. In production, each webpart renders independently through the mount/dispatch seam.

See [Homepage Zone Architecture](../../docs/architecture/plans/MASTER/spfx/homepage/phase-03/Homepage-Zone-Architecture.md) for the canonical zone model.

## Import Policy

Homepage webparts use `@hbc/ui-kit/homepage` as their primary UI entry point. Broad `@hbc/ui-kit` and `@hbc/ui-kit/app-shell` are **prohibited** and enforced by ESLint `no-restricted-imports`.

| Entry Point | Status |
|-------------|--------|
| `@hbc/ui-kit/homepage` | **Allowed — Primary** |
| `@hbc/ui-kit/branding` | Allowed — shared brand assets |
| `@hbc/ui-kit/theme` | Allowed — supplementary tokens |
| `@hbc/ui-kit/icons` | Allowed — supplementary icons |
| `@hbc/ui-kit` | Prohibited |
| `@hbc/ui-kit/app-shell` | Prohibited |

## Brand Assets

Stable corporate brand assets are sourced from `@hbc/ui-kit/branding`, not stored locally. The `PersonalizedWelcomeHeader` uses the shared `hedrickLogo` as a restrained brand lockup in the welcome surface.

**Do not** create local copies of HB brand logos in this package. Homepage-specific editorial imagery (hero backgrounds, campaign visuals, rotating content) may remain app-local since it is not shared across packages.

### Manifest Icon Posture

All webpart manifests use `officeFabricIconFontName` with semantic Office Fabric icons (Contact, News, Shield, etc.). Branded HB icons were evaluated and intentionally deferred — the semantic icons provide better discoverability in the SharePoint toolbox, and custom icons would require CDN hosting with no clear UX benefit.

## Packaging Model

This package uses the **multi-webpart cumulative model**:
- One Vite IIFE bundle (`hb-webparts-app-{hash}.js`) containing all 10 webpart components
- 10 per-webpart shell entry files (`shell-entry-{uuid}-{hash}.js`) with patched AMD `define()` names
- 10 per-webpart manifests in the `.sppkg`, each pointing to its dedicated shell entry
- One shared SPFx shell webpart that loads the IIFE bundle and calls `mount()`

Built by `tools/build-spfx-package.ts --domain hb-webparts`.

## Scripts

```bash
pnpm --filter @hbc/spfx-hb-webparts check-types   # TypeScript type-check
pnpm --filter @hbc/spfx-hb-webparts lint           # ESLint (includes import guardrails)
pnpm --filter @hbc/spfx-hb-webparts build          # Vite IIFE build
pnpm --filter @hbc/spfx-hb-webparts test           # Vitest (18 test files)
```

## Related Documents

- [SharePoint Homepage & Shell Boundaries](../../docs/reference/sharepoint-homepage-shell-boundaries.md)
- [UI Kit Entry Points](../../docs/reference/ui-kit/entry-points.md)
- [SPFx Homepage Doctrine Overlay](../../docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md)
- [Homepage Design Brief](../../docs/architecture/blueprint/sharepoint-shell/Hedrick_Brothers_SharePoint_Homepage_Design_Brief.md)
- [Tenant Shell Implementation Blueprint](../../docs/architecture/blueprint/sharepoint-shell/HB_Webparts_Tenant_Shell_Implementation_Blueprint.md)
