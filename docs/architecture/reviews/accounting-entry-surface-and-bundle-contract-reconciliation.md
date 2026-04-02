# Accounting Entry Surface and Bundle Contract Reconciliation

**Date:** 2026-04-02
**Scope:** Reconcile the Accounting build entry, IIFE/module contract, and shell-load expectations.
**Phase:** [Phase 11, Prompt 02](../plans/MASTER/spfx/accounting/phase-11/Prompt-02_Phase-11-Accounting-Entry-Surface-and-Bundle-Contract-Reconciliation.md)
**Predecessor:** [Canonical Packaging Truth Freeze](accounting-spfx-packaging-truth-freeze.md) (P11-01)

## 1. Current Entry Path

The Accounting app has **two distinct entry paths** depending on context:

| Context | Entry File | Consumer | Format |
|---------|-----------|----------|--------|
| **Production** (SPFx deployment) | `apps/accounting/src/mount.tsx` | `tools/build-spfx-package.ts` → Vite lib mode → IIFE | Single IIFE file |
| **Development** (Vite dev server) | `apps/accounting/src/webparts/accounting/AccountingWebPart.tsx` | `vite dev` → HMR → browser | ES modules with chunk splitting |

The production entry (`mount.tsx`) is configured in `vite.config.ts` under the `build.lib` block (lines 47–53). The development entry (`AccountingWebPart.tsx`) is configured in the `rollupOptions.input` block (lines 76–77) and is only active when `command === 'serve'`.

**`AccountingWebPart.tsx` is NOT the production entry.** It is a conventional SPFx webpart class used during local development with the Vite dev server. In the deployed `.sppkg`, the SPFx shell webpart replaces this class entirely — `ShellWebPart.ts` loads the Vite IIFE bundle and calls `mount()` directly. The `AccountingWebPart.tsx` file is retained for dev ergonomics but plays no role in the production artifact.

## 2. Build Output Contract

| Property | Value | Source |
|----------|-------|--------|
| Output format | IIFE (self-executing) | `vite.config.ts` → `formats: ['iife']` |
| Output filename (pre-hash) | `accounting-app.js` | `vite.config.ts` → `fileName: () => 'accounting-app.js'` |
| Output filename (post-hash) | `accounting-app-{8-char SHA-256}.js` | `tools/build-spfx-package.ts` content-hash step |
| Output directory | `apps/accounting/dist/` | `vite.config.ts` → `outDir: 'dist'` |
| Global name (Vite lib) | `__hbIntel_accounting` | `vite.config.ts` → `name: '__hbIntel_accounting'` |
| Global name (explicit assignment) | `__hbIntel_accounting` | `mount.tsx` lines 80–85 (assigns to both `globalThis` and `window`) |
| Dynamic imports | Inlined | `rollupOptions.output.inlineDynamicImports: true` |
| External dependencies | `@microsoft/sp-webpart-base`, `@microsoft/sp-property-pane`, `@microsoft/sp-core-library`, `@microsoft/sp-loader`, `@msinternal/*` | `vite.config.ts` → `rollupOptions.external` |

The IIFE bundle wraps the entire app (React, Fluent UI, TanStack, Zustand, all shared packages) into a single file. SPFx packages are externalized because they are provided by the SharePoint runtime.

## 3. Shell Loader Expectations

`ShellWebPart.ts` expects the loaded module to expose:

```typescript
interface IAppModule {
  mount(el: HTMLElement, spfxContext?: WebPartContext, config?: IMountConfig): Promise<void>;
  unmount(): void;
}
```

**Resolution sequence in `ShellWebPart.onInit()`:**
1. Construct bundle URL: `{CDN base from manifest}/{__APP_BUNDLE_NAME__}`
2. Load via `SPComponentLoader.loadScript<IAppModule>(url, { globalExportsName: __APP_GLOBAL_NAME__ })`
3. Fallback: `globalThis[__APP_GLOBAL_NAME__]`
4. Fallback: `window[__APP_GLOBAL_NAME__]`
5. Hard-fail with diagnostics if neither `mount` nor `unmount` is found

**Injected constants (webpack DefinePlugin):**
- `__APP_BUNDLE_NAME__` → `accounting-app-{hash}.js`
- `__APP_GLOBAL_NAME__` → `__hbIntel_accounting`

**Runtime config passed in `render()`:**
- `functionAppUrl` (from `__FUNCTION_APP_URL__`)
- `backendMode` (from `__BACKEND_MODE__`)
- `allowBackendModeSwitch` (from `__ALLOW_BACKEND_MODE_SWITCH__`)
- `apiAudience` (from `__API_AUDIENCE__`)

## 4. Global / IIFE / mount-unmount Contract

The contract is enforced at three layers:

### Layer 1: Vite lib output
Vite wraps the `mount.tsx` exports in an IIFE that assigns to `var __hbIntel_accounting`. This is the Rollup standard IIFE library output.

### Layer 2: Explicit global assignment (mount.tsx lines 80–85)
```typescript
const api = { mount, unmount };
(globalThis as any).__hbIntel_accounting = api;
if (typeof window !== 'undefined' && globalThis !== window) {
  (window as any).__hbIntel_accounting = api;
}
```
This explicit assignment is a **defense-in-depth** mechanism. It ensures the global is available on both `globalThis` and `window` regardless of how the IIFE wrapper assigns the return value. This matters because `globalThis !== window` in some SPFx execution contexts.

### Layer 3: Orchestrator smoke test (build-spfx-package.ts)
The orchestrator evaluates the IIFE in a Node.js VM with **intentionally separate** `globalThis` and `window` objects, then verifies `mount()` and `unmount()` are functions on both. This catches regressions where mount.tsx's explicit assignment is accidentally removed.

## 5. Fragility Points

| Risk | Severity | Current Mitigation |
|------|----------|-------------------|
| Removing explicit global assignment from `mount.tsx` | **High** — would break production | Orchestrator smoke test catches this at build time |
| Changing global name in `vite.config.ts` without updating `mount.tsx` | **Medium** — mismatch between Vite IIFE var name and explicit assignment | Name is only defined in one place for the explicit assignment; Vite name is separate. Both should match. |
| Removing `inlineDynamicImports` | **High** — would produce multi-file output incompatible with single-file shell load | Vite lib mode with IIFE format enforces single output |
| Adding new SPFx external that isn't mapped to a window global | **Low** — build would warn; runtime would fail on missing dependency | `rollupOptions.external` and `output.globals` are co-maintained |
| `AccountingWebPart.tsx` dev entry diverging from production behavior | **Low** — dev entry initializes auth differently (no runtime config injection) | Documented role separation; production path tested via orchestrator |

## 6. Changes Made

### New test: `apps/accounting/src/test/bundleContract.test.ts`
Added a targeted bundle-contract test suite that validates:
- `mount.tsx` exports both `mount` and `unmount` functions
- `mount.tsx` explicitly assigns to `globalThis.__hbIntel_accounting`
- `mount.tsx` explicitly assigns to `window.__hbIntel_accounting` (defensive)
- `mount()` accepts optional `spfxContext` (PWA migration compatibility)
- `vite.config.ts` production entry points to `src/mount.tsx`
- `vite.config.ts` IIFE global name is `__hbIntel_accounting`
- `vite.config.ts` output filename is `accounting-app.js`
- `vite.config.ts` uses IIFE format with `inlineDynamicImports`
- `AccountingWebPart.manifest.json` includes expected `supportedHosts`
- Dev entry (`AccountingWebPart.tsx`) is only used in serve mode

These tests protect the bundle contract from accidental regression by reading source files and config directly, following the pattern established in `apps/estimating/src/test/hostBehavior.test.ts`.

### No code changes required
The current build path is internally consistent. The entry surface, bundle contract, and shell loader expectations are all aligned.

## 7. Exact Files Inspected

- `apps/accounting/vite.config.ts` — build config, entry points, IIFE settings
- `apps/accounting/src/mount.tsx` — production entry, mount/unmount contract, global assignment
- `apps/accounting/src/webparts/accounting/AccountingWebPart.tsx` — dev entry, SPFx webpart class
- `apps/accounting/src/webparts/accounting/AccountingWebPart.manifest.json` — component manifest
- `apps/accounting/src/App.tsx` — optional spfxContext interface
- `apps/accounting/src/config/runtimeConfig.ts` — runtime config consumption
- `tools/build-spfx-package.ts` — orchestrator, smoke test, content hashing
- `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts` — shell loader, runtime config injection
- `tools/spfx-shell/gulpfile.js` — DefinePlugin injection
- `apps/estimating/src/test/hostBehavior.test.ts` — prior art for bundle-contract testing
