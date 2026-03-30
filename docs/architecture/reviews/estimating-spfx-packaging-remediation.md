# Estimating SPFx Packaging Remediation Review

**Date:** 2026-03-28
**Scope:** Replace custom OPC .sppkg assembly with official SPFx packaging tooling.
**Predecessor:** [Root cause review](estimating-spfx-webpart-only-root-cause-review.md) (Prompt 01)
**Successor:** Prompt 03 — manifest/runtime/registration fix and validation strengthening

## 1. Old Packaging Path

```
vite build (ES modules)
    → tools/package-sppkg.ts (custom OPC assembly via archiver)
        → dist/sppkg/*.sppkg
            → Deploy via PnP PowerShell
```

**Why it was invalid:**

1. **Module format mismatch (PRIMARY):** Vite produced ES module bundles (`export default class ...`). The SPFx runtime uses an AMD-like module loader that cannot execute ES module syntax. Packages uploaded successfully but webparts failed silently at runtime.

2. **No format verification:** The custom tool (`tools/package-sppkg.ts`) assembled structurally correct OPC archives — `[Content_Types].xml`, `_rels/.rels`, `AppManifest.xml`, runtime manifests with `loaderConfig` — but never verified that the bundled JavaScript was in a format the SPFx loader could consume.

3. **No public precedent:** No documented evidence of a fully Vite-only SPFx webpart deploying to production SharePoint without official toolchain involvement.

## 2. New Packaging Path

```
vite build (IIFE format, mount.tsx entry)
    → apps/{domain}/dist/{domain}-app.js (self-executing bundle)
        → tools/build-spfx-package.ts (orchestrator)
            → tools/spfx-shell/ (official SPFx 1.18 project)
                → gulp bundle --ship (compiles thin shell webpart)
                → copy Vite IIFE bundle into temp/deploy/
                → gulp package-solution --ship (official .sppkg generation)
            → dist/sppkg/*.sppkg
                → Deploy via PnP PowerShell (unchanged)
```

**Key design decisions:**

- **IIFE output format:** Vite's Rollup output configured as `format: 'iife'` with a domain-specific global name (`__hbIntel_{domain}`). Self-executing — no module loader required.
- **mount/unmount contract:** Each domain app exports `mount(el, spfxContext)` and `unmount()` via a new `src/mount.tsx` entry point. Auth bootstrap (`@hbc/auth/spfx`) moves into the mount function.
- **Isolated SPFx shell project:** `tools/spfx-shell/` has its own `package.json` with SPFx 1.18 + TS 4.7, excluded from the pnpm workspace to avoid TS version conflicts with the monorepo's TS 5.x.
- **Generic shell webpart:** A single `ShellWebPart.ts` (~50 lines) uses `SPComponentLoader.loadScript()` to load the Vite bundle, then calls the global mount function. Domain-specific values (bundle name, global name, component ID) are injected at build time via webpack DefinePlugin and manifest templating.
- **Official `gulp package-solution --ship`:** The .sppkg is now produced by Microsoft's own packaging task, not custom OPC assembly.

## 3. What Was Preserved

| Component | Status |
|-----------|--------|
| React 18 application composition (`App.tsx`, routing, pages) | Unchanged |
| Vite dev server (`vite dev`, port 4002, HMR, mock auth) | Unchanged |
| Shared package integration (`@hbc/auth`, `@hbc/shell`, `@hbc/ui-kit`) | Unchanged |
| SPFx manifest metadata (component ID, solution ID, feature ID) | Reused from existing config |
| `EstimatingWebPart.tsx` source class | Retained for reference; no longer the production entry |
| CI/CD deploy workflow (`spfx-deploy.yml`) | Unchanged |
| Bundle size budget (`spfx-bundle-check.ts`) | Unchanged |
| GUID/port uniqueness validation (`validate-manifests.ts`) | Extended with format check |

## 4. What Was Retired

| Artifact | Disposition |
|----------|-------------|
| `tools/package-sppkg.ts` | Renamed to `tools/package-sppkg.legacy.ts`. No longer invoked by CI. |
| ES module Vite production output | Replaced by IIFE format for SPFx compatibility |
| `manualChunks` in production build | Removed — IIFE requires single-file output (`inlineDynamicImports: true`) |

## 5. How Deployment Artifacts Are Now Generated

**Command:** `npx tsx tools/build-spfx-package.ts` (all domains) or `npx tsx tools/build-spfx-package.ts --domain estimating`

**Output:** `dist/sppkg/hb-intel-{domain}.sppkg`

**CI integration:** `.github/workflows/spfx-build.yml` runs the orchestrator after building all apps. The `spfx-deploy.yml` workflow deploys the resulting `.sppkg` files unchanged.

### SharePoint App Version Source Of Truth

- The SharePoint App Catalog version displayed for the uploaded Estimating package comes from the `.sppkg`'s `AppManifest.xml` `Version` attribute.
- For Estimating, that value is driven by `apps/estimating/config/package-solution.json` `solution.version`.
- `tools/build-spfx-package.ts` copies the app-local `package-solution.json` into `tools/spfx-shell/config/package-solution.json` before `gulp package-solution --ship`, so the shell copy is derived build output, not the authoritative source of truth.
- `solution.features[].version` drives the generated feature XML version inside the package and should stay aligned with `solution.version` to avoid package-internal version drift during upload and deployment.
- `ClientSideAssets.xml` remains an SPFx-generated internal feature manifest and is not the SharePoint App Catalog app-version field; it does not require manual synchronization for the uploaded package version.
- The client-side web part manifest `version: "*"` remains unrelated to the SharePoint-uploaded app-package version in this packaging path.

## 6. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  Development (Vite)                                         │
│  ┌──────────────────┐    ┌──────────────────────────────┐  │
│  │ index.html        │    │ EstimatingWebPart.tsx         │  │
│  │ main.tsx           │───▶│ (ES modules, HMR, mock auth) │  │
│  │ vite dev :4002     │    └──────────────────────────────┘  │
│  └──────────────────┘                                       │
├─────────────────────────────────────────────────────────────┤
│  Production Build (Vite → IIFE)                             │
│  ┌──────────────────┐    ┌──────────────────────────────┐  │
│  │ mount.tsx          │───▶│ estimating-app.js (IIFE)     │  │
│  │ vite build         │    │ window.__hbIntel_estimating   │  │
│  └──────────────────┘    └──────────────┬───────────────┘  │
├──────────────────────────────────────────┼──────────────────┤
│  SPFx Packaging (official gulp tooling)  │                  │
│  ┌──────────────────┐    ┌──────────────▼───────────────┐  │
│  │ ShellWebPart.ts   │    │ gulp bundle --ship            │  │
│  │ (SPFx 1.18, TS 4) │───▶│ copy IIFE → temp/deploy/     │  │
│  └──────────────────┘    │ gulp package-solution --ship  │  │
│                           └──────────────┬───────────────┘  │
│                           ┌──────────────▼───────────────┐  │
│                           │ hb-intel-estimating.sppkg     │  │
│                           └──────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  SharePoint Runtime                                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ SPFx loader → ShellWebPart.onInit()                   │  │
│  │   → SPComponentLoader.loadScript(estimating-app.js)   │  │
│  │   → __hbIntel_estimating.mount(domElement, context)   │  │
│  │   → React app renders in webpart DOM element          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 7. Residual Risks

| Risk | Severity | Mitigation |
|------|----------|-----------|
| SPFx 1.18 + Node 20 incompatibility | Medium | Test in CI; fall back to Node 18 for shell build step |
| IIFE single-file bundle exceeds 1 MB budget | Low | Current multi-chunk total is well under; externalize React/Fluent via SPFx globals if needed |
| `SPComponentLoader.loadScript()` blocked by tenant CSP | Low | Standard SPFx API; no known CSP issues for CDN-hosted assets |
| Auth bootstrap timing race | Low | `mount()` is async; shell's `onInit()` awaits script load before `render()` |
| Runtime manifest loaderConfig may need adjustment | Medium | Prompt 03 scope — validate webpart registration and runtime loading |

## 8. Acceptance Status

The packaging path is now compliant and has been acceptance-audited for the Estimating limited-release package.

- The packaged Estimating SharePoint app version was validated from the generated `.sppkg` as `0.0.0.1`.
- The final limited-release acceptance audit is recorded in [estimating-spfx-limited-release-acceptance-audit.md](estimating-spfx-limited-release-acceptance-audit.md).
- Remaining follow-up is operational rather than architectural: SharePoint UI vetting in `ui-review` mode and later production-mode promotion when the live backend path is intentionally enabled for broader release.
