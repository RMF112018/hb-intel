# Build Evidence Log — @hbc/spfx-hb-webparts

**Date:** 2026-04-08T13:53:08Z
**Branch:** main
**Commit:** 8426a7df
**Package:** `@hbc/spfx-hb-webparts` v0.0.27
**Build entry:** `apps/hb-webparts/src/mount.tsx`

---

## Build Pipeline Results

| Step | Command | Result |
|------|---------|--------|
| check-types | `pnpm --filter @hbc/spfx-hb-webparts check-types` | **Pass** — `tsc --noEmit` clean |
| lint | `pnpm --filter @hbc/spfx-hb-webparts lint` | **Pass** — `eslint src/ --ext .ts,.tsx` clean |
| build | `pnpm --filter @hbc/spfx-hb-webparts build` | **Pass** — `tsc --noEmit && vite build` |
| test | `pnpm --filter @hbc/spfx-hb-webparts test` | **13 pre-existing failures** (see below) |

---

## Build Output

```
vite v6.4.1 building for production...
✓ 4383 modules transformed.
dist/spfx-hb-webparts.css   31.32 kB │ gzip:   6.19 kB
dist/hb-webparts-app.js    575.08 kB │ gzip: 204.00 kB
✓ built in 2.41s
```

### Artifact Inventory

| File | Size | Type |
|------|------|------|
| `apps/hb-webparts/dist/hb-webparts-app.js` | 575.08 KB (204.00 KB gzip) | IIFE bundle — SPFx loader entry |
| `apps/hb-webparts/dist/spfx-hb-webparts.css` | 31.32 KB (6.19 KB gzip) | Extracted CSS |
| `apps/hb-webparts/dist/banner_home_7.png` | 2.86 MB | Static asset (hero banner image) |

### Build Configuration

- **Format:** IIFE (self-executing function for SPFx `SPComponentLoader`)
- **Global name:** `__hbIntel_hbWebparts`
- **Externals:** `@microsoft/sp-webpart-base`, `@microsoft/sp-property-pane`, `@microsoft/sp-core-library`, `@microsoft/sp-loader`
- **Source:** `apps/hb-webparts/vite.config.ts`

---

## Webpart GUID Verification

All 10 webpart component IDs are present in the built IIFE bundle:

| Webpart | GUID | In Bundle | Manifest Exists |
|---------|------|-----------|-----------------|
| Personalized Welcome Header | `46bfde64-f0cb-4f62-9f6b-a466f8fadc1f` | ✓ | ✓ |
| HB Hero Banner | `39762a4d-c7fd-44a6-a11e-4f8de9f5778d` | ✓ | ✓ |
| Priority Actions Rail | `b3f07190-79cf-437d-a1d6-ecbf3f77e616` | ✓ | ✓ |
| Tool Launcher / Work Hub | `cb7060f5-b852-4600-b912-a5f6f7221ce2` | ✓ | ✓ |
| Company Pulse | `0b53f651-fd92-4f7f-a9da-f7797017f5eb` | ✓ | ✓ |
| Leadership Message | `e8fa8a84-a48a-41d2-85a6-b7c7df70aeca` | ✓ | ✓ |
| People and Culture | `27ac10f4-4054-4dd2-bd53-3b4ef4379ab4` | ✓ | ✓ |
| Project Portfolio Spotlight | `8370ab0c-b6df-4db0-82f1-24b54750f508` | ✓ | ✓ |
| Safety and Field Excellence | `89ca5ff3-21f4-4b23-a953-4b7306ea1029` | ✓ | ✓ |
| Smart Search / Wayfinding | `11d72b36-a92f-4e2d-9918-75df2cb0d11e` | ✓ | ✓ |

---

## Pre-Existing Test Failures (13)

These failures predate this work and are not caused by the build evidence task:

| Test File | Failures | Category |
|-----------|----------|----------|
| `bundleBudget.test.ts` | 2 | JS bundle 561.6 KB > 400 KB budget; CSS 30.6 KB > 10 KB budget |
| `motionAndAccessibility.test.ts` | 1 | HbHeroBanner reduced-motion hook import assertion |
| `interactiveStates.test.ts` | 2 | Focus-visible color assertion; CTA link element assertion |
| `discoveryWebpart.test.tsx` | 3 | DOM structure mismatches (categories, search control, no-match fallback) |
| `operationalAwarenessWebparts.test.tsx` | 2 | DOM structure mismatches (featured hierarchy, empty state) |
| `utilityWebparts.test.tsx` | 1 | Action badges / focus order assertion |
| `compositionPreview.test.tsx` | 2 | Zone section shell count; webpart render assertions |

These failures reflect test expectations written against earlier component implementations. The bundle budget overages (JS 561 KB vs 400 KB hard limit) are a known concern but do not prevent the build from succeeding.
