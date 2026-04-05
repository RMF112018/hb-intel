# Phase 09 Lane B Deployment Readiness Decision

## Decision: **NOT YET DEPLOYMENT-PACKAGING-READY**

Lane B (`apps/hb-shell-extension`) is build-clean, test-clean, and within budget, but it **cannot produce a deployable `.sppkg`** because real SPFx Application Customizer wiring does not exist in the repo.

## What exists today

| Component | Status | Evidence |
|-----------|--------|---------|
| React placeholder components (TopPlaceholder, BottomPlaceholder) | Complete | `src/placeholders/` — renders top ribbon, alert band, footer rail, support band |
| Mount seam (`src/mount.tsx`) | Complete | Publishes `globalThis.__hbIntel_hbShellExtension` with `mountTop`/`mountBottom`/`unmountTop`/`unmountBottom` |
| CSS module (`shell-extension.module.css`) | Complete | 11 classes for ribbon, alerts, footer, interactive states, reduced-motion |
| Type declarations | Complete | `PlaceholderConfig`, `AlertBandItem`, `BottomPlaceholderConfig`, etc. |
| Import discipline | Complete | ESLint `no-restricted-imports` + structural test |
| Tests | Complete | 4 files / 29 tests (mount seam, placeholders, import discipline, budgets) |
| Vite IIFE build | Complete | `dist/hb-shell-extension-app.js` (146.78 KB) + CSS (2.25 KB) |
| `config/package-solution.json` | Complete | Solution ID, feature ID, version metadata |

## What is missing for deployment

The repo does NOT contain:

1. **SPFx Application Customizer TypeScript class** — the `BaseApplicationCustomizer` subclass that SharePoint invokes. This is the equivalent of Lane A's `ShellWebPart.ts` in `tools/spfx-shell/`. It must:
   - Extend `@microsoft/sp-application-base/BaseApplicationCustomizer`
   - Use `this.context.placeholderProvider.tryCreateContent(PlaceholderName.Top)` and `.Bottom`
   - Call `mountTop(domElement)` and `mountBottom(domElement)` with the placeholder DOM elements
   - Handle placeholder disposal via `unmountTop()`/`unmountBottom()`

2. **SPFx extension manifest** — a `*.manifest.json` with `"componentType": "Extension"` and `"extensionType": "ApplicationCustomizer"`. This tells SharePoint how to load the extension.

3. **SPFx shell project wiring for extensions** — the `tools/spfx-shell/` project currently only compiles webpart shells (Lane A). It would need either:
   - A parallel shell project for extensions, or
   - Extension support added to the existing shell project

4. **Build orchestration for extension `.sppkg`** — `tools/build-spfx-package.ts` currently handles webpart domains only. Extension packaging requires a different manifest model (extension manifest, not webpart manifest).

## What the product lane IS despite this gap

Lane B is a **complete, tested, build-clean React product** with:
- Governed placeholder architecture
- Top ribbon + alert band + footer rail + support band
- Accessibility-audited interactive states
- Null-safe mount/unmount behavior
- Full structural test coverage

The gap is exclusively in the **SPFx deployment wiring layer** — the bridge between the React components and SharePoint's Application Customizer lifecycle.

## Recommended next implementation target

Create the SPFx Application Customizer shell (analogous to Lane A's `ShellWebPart.ts`):

1. Create `ShellExtensionCustomizer.ts` extending `BaseApplicationCustomizer`
2. Create the extension `*.manifest.json` with `extensionType: "ApplicationCustomizer"`
3. Wire `onInit()` → `mountTop(topElement)` + `mountBottom(bottomElement)`
4. Wire `onDispose()` → `unmountTop()` + `unmountBottom()`
5. Add extension support to `tools/build-spfx-package.ts` or create a parallel build path
6. Build and verify the extension `.sppkg`

This is a focused implementation task — the React product is ready; only the SPFx lifecycle bridge needs to be created.
