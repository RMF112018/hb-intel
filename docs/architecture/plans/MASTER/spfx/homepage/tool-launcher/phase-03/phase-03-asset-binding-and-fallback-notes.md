# Phase 03 — Asset Binding and Fallback Notes

## 1. Asset Resolution Strategy

### How launcher record data and the manifest work together

`launcherAssetResolution.ts` provides `resolveLogoAsset(platform, preferDark?)` which returns a `LogoResolution` discriminated union:

| Resolution type | Rendered as | When selected |
|----------------|-------------|---------------|
| `'image'` | `<img>` with `objectFit: contain` in 56px container | A valid logo URL is available from record or manifest |
| `'icon'` | Lucide icon at 26px with brand-blue tinting | No image available but a governed or category icon exists |
| `'monogram'` | Single letter at 1.25rem with brand-blue tinting | Manifest exists but no usable logo or icon |

### Resolution chain (in order)

1. **Launcher record `logoAssetRef`** — from the SharePoint list. If the record has a direct logo URL, use it. When `preferDark` is true and `darkLogoAssetRef` exists, prefer the dark variant.

2. **Asset manifest governed logo** — if `platformKey` matches a manifest entry, use `lightLogo` (or `darkLogo` when `preferDark`). The manifest currently covers 9 platforms: BambooHR, hh2, SAP Concur, Employee Navigator, ADP, Procore, COMPASS, Document Crunch, HedrickLearn.

3. **Manifest governed fallback icon** — if the manifest entry has a `fallbackLucideIcon`, resolve it to the corresponding Lucide component. Some manifest icon names are mapped to available alternatives (Receipt → BarChart3, Compass → Settings, GraduationCap → FileText) because not all Lucide icons are exported from `@hbc/ui-kit/homepage`.

4. **Monogram from manifest** — if the manifest entry exists but has no usable logo or icon, render the first letter of `fallbackLabel`.

5. **Platform/category Lucide icon** — if no manifest entry exists at all, fall back to `resolvePlatformIcon()` from `launcherIconResolution.ts` (platform-specific → category-based → Settings default).

### Dark variant support

`resolveLogoAsset(platform, preferDark)` accepts an optional boolean. When true:
- Record path: prefer `darkLogoAssetRef` over `logoAssetRef`
- Manifest path: prefer `darkLogo` over `lightLogo`
- Fallback paths: unchanged (icons and monograms work on any surface)

Currently the launcher renders on a light surface, so `preferDark` is not passed. The parameter is ready for future dark-mode or dark-section contexts.

## 2. Degraded States

### Record has no logo asset and no manifest match

| What renders | Visual treatment |
|-------------|------------------|
| Category-based or default Lucide icon (Settings) | 26px icon at `rgba(34,83,145,0.6)` in 56px container with subtle blue background |

The card still renders with name, descriptor, CTA, and optional notice badge. Only the logo container content changes.

### Manifest entry exists but only partial variants available

| Scenario | Behavior |
|----------|----------|
| `lightLogo` exists, `darkLogo` null | Use `lightLogo` for both light and dark contexts |
| `lightLogo` null, `darkLogo` exists | Use `darkLogo` (resolved when `preferDark` or as only option) |
| Both null | Fall through to `fallbackLucideIcon` or monogram |

### Platform not yet in the manifest

Falls through to step 5 — `resolvePlatformIcon()`. The 9 known platforms have both manifest entries and icon fallbacks. Unknown platforms get category-based or default icons.

### Image fails to load at runtime (onError)

The flagship card maintains `imageErrored` state via `useState`. When an `<img>` fires `onError`:
1. `imageErrored` is set to `true`
2. The card re-renders with `fallbackResolution` (platform/category Lucide icon)
3. No layout shift — the 56px container dimensions are preserved
4. No retry — the error state is permanent for the card's lifecycle

### Launch URL exists but descriptor or category is missing

| Missing field | Card behavior |
|--------------|---------------|
| `descriptor` | Card renders without subtitle — name + CTA only. `margin-top: auto` pushes CTA to bottom regardless. |
| `category` | Logo resolution falls through to platform-specific or default icon. Card structure unchanged. |
| Both | Card is a minimal name + icon + CTA. Still reads as a launch card, not a broken tile. |

### Notice/status metadata is absent

Badge area in the CTA row is simply empty. No placeholder, no "no notices" text. The CTA label shifts to occupy the full row width.

## 3. Guardrails

| Avoided | Reason |
|---------|--------|
| **Generic brand substitutes** | The manifest provides governed fallbacks — we don't invent ad-hoc brand icons |
| **Broken image rendering** | `onError` handler ensures images that fail to load are replaced with icon fallback, never showing a broken-image placeholder |
| **Noisy pseudo-brand clutter** | Monogram fallback (single letter) is used only as a last resort from the manifest chain, not as a primary treatment |
| **Dark mode assumptions** | `preferDark` parameter exists but is not forced; the launcher currently renders light-surface only |
| **Direct manifest imports from docs/plans** | Manifest data is inlined in `launcherAssetResolution.ts` to avoid importing from the docs/architecture/plans directory |
| **Overly complex asset pipeline** | Resolution is a simple function with no async loading, no caching, no image preloading — appropriate for SVG logos that load quickly |
| **Moving asset logic to @hbc/ui-kit** | Resolution is launcher-specific business logic; it stays in `apps/hb-webparts` |

## 4. Deferred Items

| Item | Phase | Description |
|------|-------|-------------|
| **Real SVG logo files deployed** | Ops/assets | The manifest paths (`/assets/tool-launcher/vendors/...`) reference files that need to be deployed to the HBCentral site's asset library. Until deployed, all cards fall through to icon fallback. |
| **Logo image preloading** | Future | No `<link rel="preload">` or image preloading strategy. Acceptable for SVG logos but may matter for larger raster assets. |
| **@hbc/ui-kit brand asset system** | Future | The asset-import plan (`UI-Kit-Brand-Asset-Integration-Summary.md`) envisions a shared branding lane in `@hbc/ui-kit`. The current inline manifest is a transitional step. |
| **Dark surface rendering** | Future | `preferDark` parameter is ready but unused. Dark surface contexts (future shell themes, dark-mode SPFx) will need to pass `true`. |
| **Logo aspect-ratio enforcement** | Future | `objectFit: contain` with 8px padding works for most wordmarks but may need per-vendor tuning for symbol-heavy logos. |
| **Monogram styling refinement** | Future | Monogram uses a single static style. Vendor-specific brand colors for monogram backgrounds are not implemented. |
