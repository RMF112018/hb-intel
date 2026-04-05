# Phase 09 Lane B Gap Report

## Gap: SPFx Application Customizer deployment wiring

Lane B (`apps/hb-shell-extension`) cannot produce a deployable `.sppkg` because the repo does not contain the SPFx Application Customizer lifecycle bridge between SharePoint and the React placeholder components.

## Exact missing files

| # | File | Purpose | Analogous Lane A File |
|---|------|---------|----------------------|
| 1 | `ShellExtensionCustomizer.ts` | `BaseApplicationCustomizer` subclass that receives placeholder DOM elements from SharePoint and calls `mountTop(el)`/`mountBottom(el)` | `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts` |
| 2 | `ShellExtensionCustomizer.manifest.json` | Extension manifest with `"componentType": "Extension"`, `"extensionType": "ApplicationCustomizer"` | `tools/spfx-shell/src/webparts/shell/ShellWebPart.manifest.json` |
| 3 | Extension-aware build orchestration | Either extend `tools/build-spfx-package.ts` or create a parallel build path for extension packaging | N/A (currently webpart-only) |

## What IS ready

| Component | Lines of Code | Tests | Status |
|-----------|:------------:|:-----:|--------|
| TopPlaceholder (ribbon + alert band) | ~120 | 9 | Complete |
| BottomPlaceholder (footer + support) | ~80 | 8 | Complete |
| Mount seam (mountTop/mountBottom/unmount) | ~50 | 3 | Complete |
| Placeholder types + activation governance | ~100 | 1 | Complete |
| CSS module (11 interactive classes) | ~160 | 3 | Complete |
| Import discipline (ESLint + structural) | — | 2 | Complete |
| Bundle budget test | — | 3 | Complete |

**Total: ~510 lines of product code, 29 tests, all passing.**

## Implementation effort estimate

The missing wiring is a focused task:
- `ShellExtensionCustomizer.ts` — ~80 lines (lifecycle methods + placeholder provider calls)
- `ShellExtensionCustomizer.manifest.json` — ~20 lines (standard extension manifest)
- Build orchestration update — ~50-100 lines in `tools/build-spfx-package.ts`
- Integration test — ~20 lines

**Estimated scope: ~200 lines of focused SPFx integration code.** The React product (510 lines) is already complete.

## Risk assessment

| Risk | Severity | Notes |
|------|----------|-------|
| Product readiness | None | React components are tested and accessibility-audited |
| Build integrity | None | Vite build passes, bundle is within budget |
| Deployment readiness | **Blocked** | Cannot produce `.sppkg` without extension manifest |
| Timeline impact | Low | The wiring task is focused and well-defined |
