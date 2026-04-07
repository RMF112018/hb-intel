# Phase 11G — Authoring, SPFx Host, and Packaging Hardening: Validation

## Validation scope

This validation covers the authoring, SPFx host, and packaging hardening introduced in Phase 11G of the Tool Launcher rebuild.

## Build integrity

| Check | Result |
|-------|--------|
| TypeScript (`tsc --noEmit`) | **Pass** — zero errors |
| ESLint (`eslint src/ --ext .ts,.tsx`) | **Pass** — zero errors |
| Production build (`vite build`) | **Pass** — 521.84 KB (from 520.63 KB prior; +1.2 KB from error handling and state markers) |

## Edit-mode and partial-data validation

### State transition matrix

| Data condition | Expected state | Expected output | Status |
|---------------|---------------|-----------------|--------|
| `isLoading` or `listLoading` true | `loading` | `HomepageLoadingState` spinner | Verified |
| List fetch succeeds, 0 platforms | `list-empty` | Authoring empty state from governance registry | Verified |
| List fetch succeeds, platforms available | `live` | Full composition shell with 4 regions | Verified |
| All platforms filtered by audience | `audience-filtered` | Authoring empty state | Verified |
| List fetch fails, config bridge available | `config-fallback` | `HbcLauncherSurface` from config | Verified |
| List fetch fails, no config available | `error` | Professional error message with administrator guidance | Verified |
| No list context, config bridge available | `config-fallback` | `HbcLauncherSurface` from config | Verified |
| No list context, no config available | `no-config` | Authoring "no data" empty state | Verified |
| No list context, invalid config | `no-config` | Authoring "invalid" empty state | Verified |

### Partial-data conditions

| Condition | Behavior | Status |
|-----------|----------|--------|
| 0 featured platforms | Flagship stage not passed to shell (undefined) | Verified |
| 1 featured platform | Renders as hero card only, no secondary grid | Verified |
| 0 workflow shelves | Shell omits shelves region | Verified |
| 0 support/notice data | Utility rail suppresses entirely | Verified |
| Platforms with missing logos | LauncherLogo falls through resolution chain to monogram | Verified |
| Platforms with missing descriptors | Descriptor lines omitted, cards remain properly spaced | Verified |
| Platforms with missing categories | Category tags omitted in index rows | Verified |

## Manifest posture validation

| Field | Value | Purpose | Status |
|-------|-------|---------|--------|
| `componentType` | `"WebPart"` | Standard webpart registration | Correct |
| `supportedHosts` | `["SharePointWebPart"]` | SharePoint-only deployment target | Correct |
| `supportsFullBleed` | `true` | Full-width section support | **Added in 11G** |
| `requiresCustomScript` | `false` | Works in No Script sites | Correct |
| `supportsThemeVariants` | `false` | Custom theming via token system, not Fluent theme variants | Correct |
| `hiddenFromToolbox` | `true` | Pre-configured, not available in authoring toolbox | Correct |
| `manifestVersion` | `2` | Current SPFx manifest version | Correct |

## Build and packaging validation

### Commands executed

```
cd apps/hb-webparts
npx tsc --noEmit                   # TypeScript compilation — zero errors
npx eslint src/ --ext .ts,.tsx     # ESLint — zero errors
npx tsc --noEmit && npx vite build # Production build — 521.84 KB
```

### Packaged output verification

1. **CSS module survival:** `launcher-interactive.module.css` is bundled into `dist/spfx-hb-webparts.css` (24.84 KB). Class names are hashed/scoped as expected.
2. **Inline styles:** All `React.CSSProperties` objects compile directly — no CSS extraction issues.
3. **Motion library:** `motion` from `motion/react` tree-shakes correctly. Only `motion.a`, `motion.div`, and `AnimatePresence` are retained.
4. **Lucide icons:** Tree-shaking retains only the imported icons. No full icon library bundled.
5. **Radix Separator:** The re-exported `Separator` from `@radix-ui/react-separator` compiles and bundles correctly.
6. **CVA + clsx:** `class-variance-authority` and `clsx` from the homepage entrypoint bundle correctly.
7. **State markers:** `data-hbc-homepage` and `data-launcher-state` HTML attributes pass through the build pipeline unchanged.

## Host-safe behavior validation

| Concern | Status |
|---------|--------|
| No shell duplication — launcher does not create fake app bars or navigation | Verified |
| Stable in page canvas — no position: fixed overlapping content (overlay uses z-index 99-100 appropriately) | Verified |
| Full-width support — `supportsFullBleed: true` in manifest | Verified |
| No-script compatible — `requiresCustomScript: false` | Verified |
| No external script injection | Verified |
| No global CSS leakage — CSS module scoped, inline styles element-local | Verified |

## Regressions checked

- **Composition shell** — `LauncherCompositionShell.tsx` untouched
- **Search/discovery** — `launcherSearch.ts`, `LauncherCommandBand.tsx`, `LauncherAllPlatformsOverlay.tsx` untouched
- **Card components** — `LauncherFlagshipCard`, `LauncherShelfCard`, `LauncherIndexRow` untouched
- **Utility rail** — `LauncherUtilityRail.tsx` untouched
- **Data contracts** — `toolLauncherContracts.ts`, `toolLauncherNormalization.ts` untouched
- **Data hook** — `useToolLauncherData.ts` untouched
- **CSS module** — `launcher-interactive.module.css` untouched
- **Shared tokens** — `launcherTokens.ts` untouched

## Residual risks

1. **SPFx package generation (`.sppkg`)** is not executed in this build pipeline. The vite production build output is verified, but the final SPFx packaging step is handled separately. This is a deployment-pipeline concern, not a source-code concern.
2. **Theme variant coexistence** — `supportsThemeVariants: false` means the launcher uses its own token system. If SharePoint section backgrounds change, the launcher's hardcoded `rgba()` backgrounds may need adjustment. This is intentional per the UI doctrine (token discipline with host overlays).
