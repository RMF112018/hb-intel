# Accounting SPFx Packaging Truth Freeze

**Date:** 2026-04-02
**Scope:** Establish canonical packaging/build truth for the Accounting SPFx deployment artifact.
**Phase:** [Phase 11, Prompt 01](../plans/MASTER/spfx/accounting/phase-11/Prompt-01_Phase-11-Canonical-Packaging-and-Build-Truth-Freeze.md)
**Predecessor:** [Estimating SPFx Packaging Remediation](estimating-spfx-packaging-remediation.md) (established the shared packaging pattern)

## 1. Executive Summary

The Accounting SPFx deployment artifact follows the same canonical packaging path established for Estimating and all other HB Intel domains. The `ShellWebPart` wrapper is the **intended, designed packaging mechanism** — not evidence of drift. The build orchestrator (`tools/build-spfx-package.ts`) rewrites the shell project's manifest and package-solution configuration per-domain at build time, preserving each app's unique webpart ID, solution ID, and API permission declarations.

No material code changes are required. The packaging path is consistent, verified, and documented.

## 2. Canonical Packaging Flow

```
apps/accounting/src/mount.tsx
    ↓ (Vite build: pnpm --filter @hbc/spfx-accounting build)
apps/accounting/dist/accounting-app.js (IIFE, __hbIntel_accounting global)
    ↓ (tools/build-spfx-package.ts: content-hash rename)
tools/spfx-shell/assets/accounting-app-{HASH}.js
    ↓ (manifest + package-solution injection from apps/accounting/)
    ↓ (gulp bundle --ship with DefinePlugin injection)
tools/spfx-shell/release/ (compiled shell webpart + Vite IIFE via CopyWebpackPlugin)
    ↓ (gulp package-solution --ship)
tools/spfx-shell/sharepoint/solution/hb-intel-accounting.sppkg
    ↓ (collect output)
dist/sppkg/hb-intel-accounting.sppkg (FINAL DEPLOYMENT ARTIFACT)
```

**Build command:** `npx tsx tools/build-spfx-package.ts --domain accounting`

## 3. Entry Surface / Bundle Contract

| Concern | Value |
|---------|-------|
| Production entry point | `apps/accounting/src/mount.tsx` |
| Bundle format | IIFE (Vite Rollup, `inlineDynamicImports: true`) |
| Global name | `__hbIntel_accounting` |
| Output filename | `accounting-app.js` (pre-hash) |
| Hashed filename | `accounting-app-{8-char SHA-256}.js` |
| mount/unmount contract | `mount(el, spfxContext, config)` / `unmount()` |
| Dev entry point | `apps/accounting/src/webparts/accounting/AccountingWebPart.tsx` (Vite dev server, port 4001) |

The IIFE bundle exposes the `mount`/`unmount` API on both `globalThis.__hbIntel_accounting` and `window.__hbIntel_accounting`. The orchestrator's smoke test verifies both resolution paths in a Node.js VM before proceeding to shell compilation.

## 4. Manifest and Version Ownership

| Concern | Authoritative Source | Value |
|---------|---------------------|-------|
| Webpart component ID | `apps/accounting/src/webparts/accounting/AccountingWebPart.manifest.json` | `cf3c98bf-ff78-4f00-bd6d-c304433d959e` |
| Solution ID | `apps/accounting/config/package-solution.json` | `7dca8e93-b2fb-4e06-9e4b-d14118f87990` |
| Solution version | `apps/accounting/config/package-solution.json` | `001.000.028` |
| Feature ID | `apps/accounting/config/package-solution.json` | `fbb5ac04-cf50-458b-91dd-3784de51a7af` |
| Solution name | `apps/accounting/config/package-solution.json` | `hb-intel-accounting` |
| API permissions | `apps/accounting/config/package-solution.json` | `hb-intel-api-production / access_as_user` |
| Supported hosts | `AccountingWebPart.manifest.json` | `SharePointWebPart`, `TeamsPersonalApp` |
| npm package version | `apps/accounting/package.json` | `00.000.041` |

The `tools/spfx-shell/config/package-solution.json` and `tools/spfx-shell/src/webparts/shell/ShellWebPart.manifest.json` files are **derived build output** — rewritten from the app-local sources on every build. They are not authoritative.

## 5. Shell Wrapper Role

`ShellWebPart.ts` is a **generic, domain-agnostic SPFx webpart** (~80 lines) that serves all 12 HB Intel domains. It has zero monorepo imports and is compiled by the SPFx 1.18 + TypeScript 4.7 toolchain in isolation from the monorepo's TypeScript 5.x.

**Runtime behavior:**
1. `onInit()` — Resolves CDN base URL from manifest `loaderConfig`, loads the domain's IIFE bundle via `SPComponentLoader.loadScript()`, falls back to `globalThis`/`window` resolution.
2. `render()` — Injects runtime config (`functionAppUrl`, `backendMode`, `allowBackendModeSwitch`, `apiAudience`) and calls `mount()`.
3. `onDispose()` — Calls `unmount()` for cleanup.

**Build-time domain injection via webpack DefinePlugin:**
- `__APP_BUNDLE_NAME__` — hashed bundle filename
- `__APP_GLOBAL_NAME__` — global export name (`__hbIntel_accounting`)
- `__FUNCTION_APP_URL__` — Azure Function App URL
- `__BACKEND_MODE__` — backend environment
- `__ALLOW_BACKEND_MODE_SWITCH__` — feature flag
- `__API_AUDIENCE__` — Azure AD app registration audience URI

The shell manifest `alias` is always `"ShellWebPart"` regardless of domain. The webpart `id` is copied from the source app's manifest, preserving the Accounting-specific component ID in the deployed package.

## 6. Known Ambiguities Resolved

| Question | Answer |
|----------|--------|
| What is the canonical Accounting SPFx packaging path? | Vite IIFE → `tools/build-spfx-package.ts` → `tools/spfx-shell/` (gulp) → `.sppkg`. Same path as all other domains. |
| Is `ShellWebPart` drift or intentional? | **Intentional.** It is the designed generic wrapper for all HB Intel SPFx domains. The orchestrator injects domain-specific manifest and config at build time. |
| What is the actual bundle entry contract? | `apps/accounting/src/mount.tsx` → IIFE with `mount()`/`unmount()` on `__hbIntel_accounting`. |
| Who owns package versioning? | `apps/accounting/config/package-solution.json` `solution.version` and `features[].version`. Shell copies are derived. |
| Who owns manifest shape? | `apps/accounting/src/webparts/accounting/AccountingWebPart.manifest.json`. Shell manifest is rewritten per-build. |
| Who owns app bundle naming? | `apps/accounting/vite.config.ts` (`accounting-app.js`). Orchestrator adds content hash. |
| Who owns runtime config injection? | `tools/spfx-shell/gulpfile.js` DefinePlugin + `ShellWebPart.ts` render method. App consumes via `apps/accounting/src/config/runtimeConfig.ts`. |
| Who owns final `.sppkg` generation? | `gulp package-solution --ship` in `tools/spfx-shell/`, orchestrated by `tools/build-spfx-package.ts`. |

## 7. Drift Findings

**No drift found.** The prior audit concern that `ShellWebPart` in the packaged artifact might indicate packaging drift is **disproven by repo evidence**:

1. The orchestrator (`tools/build-spfx-package.ts`) is explicitly designed to inject each domain's manifest into the shell project before compilation.
2. The shell manifest `id` field is overwritten with the source app's webpart ID (`cf3c98bf-ff78-4f00-bd6d-c304433d959e` for Accounting).
3. The `package-solution.json` written into the shell contains Accounting's solution ID, version, and API permissions.
4. Post-build verification confirms the `.sppkg` contains the correct webpart ID and Vite bundle.
5. This is the same pattern already validated and acceptance-audited for Estimating (see [estimating-spfx-packaging-remediation.md](estimating-spfx-packaging-remediation.md)).

The `ShellWebPart` alias appearing in the compiled JavaScript is expected — it is the SPFx-compiled wrapper, not the domain identity. The domain identity is carried by the manifest component ID.

## 8. Exact Files Inspected

### Accounting app surfaces
- `apps/accounting/config/package-solution.json`
- `apps/accounting/vite.config.ts`
- `apps/accounting/src/webparts/accounting/AccountingWebPart.tsx`
- `apps/accounting/src/webparts/accounting/AccountingWebPart.manifest.json`
- `apps/accounting/src/mount.tsx`
- `apps/accounting/src/config/runtimeConfig.ts`
- `apps/accounting/package.json`
- `apps/accounting/config/serve.json`
- `apps/accounting/config/deploy-azure-storage.json`

### Shared SPFx packaging path
- `tools/build-spfx-package.ts`
- `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`
- `tools/spfx-shell/src/webparts/shell/ShellWebPart.manifest.json`
- `tools/spfx-shell/gulpfile.js`
- `tools/spfx-shell/config/package-solution.json`
- `tools/spfx-shell/config/config.json`
- `tools/spfx-shell/config/copy-assets.json`
- `tools/spfx-shell/config/write-manifests.json`
- `tools/spfx-shell/config/serve.json`
- `tools/spfx-shell/package.json`
- `tools/spfx-shell/release/` (assets, manifests)

### Documentation
- `docs/architecture/reviews/estimating-spfx-packaging-remediation.md`
- `docs/architecture/blueprint/current-state-map.md`

## 9. Explicit Conclusion

The canonical Accounting SPFx packaging path is:

**`apps/accounting/src/mount.tsx` → Vite IIFE → `tools/build-spfx-package.ts` → `tools/spfx-shell/` (gulp bundle + package-solution) → `hb-intel-accounting.sppkg`**

This is the same path used by all 12 HB Intel domains. It is intentional, well-documented, and acceptance-tested for the Estimating domain. The `ShellWebPart` wrapper is not drift — it is the designed mechanism.

Later Phase 11 prompts can proceed with this packaging path as settled truth without re-auditing the build mechanism.
