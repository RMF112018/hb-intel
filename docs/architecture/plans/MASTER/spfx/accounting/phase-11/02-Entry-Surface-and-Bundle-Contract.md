# 02 — Entry Surface and Bundle Contract (Operational Summary)

**Status:** Complete
**Full review:** [accounting-entry-surface-and-bundle-contract-reconciliation.md](../../../../reviews/accounting-entry-surface-and-bundle-contract-reconciliation.md)

## Entry Paths

| Context | Entry File | Role |
|---------|-----------|------|
| Production | `apps/accounting/src/mount.tsx` | Vite IIFE build → `accounting-app-{hash}.js` |
| Development | `apps/accounting/src/webparts/accounting/AccountingWebPart.tsx` | Vite dev server (HMR, port 4001) |

**`AccountingWebPart.tsx` is not the production entry.** It is retained for dev ergonomics. In the deployed `.sppkg`, `ShellWebPart.ts` replaces it entirely.

## Bundle Contract

| Property | Value |
|----------|-------|
| Format | IIFE (single file, `inlineDynamicImports: true`) |
| Global name | `__hbIntel_accounting` |
| Output filename | `accounting-app.js` → `accounting-app-{8-char SHA-256}.js` |
| mount signature | `mount(el: HTMLElement, spfxContext?: WebPartContext, config?: IMountConfig): Promise<void>` |
| unmount signature | `unmount(): void` |

## Global Assignment Defense-in-Depth

`mount.tsx` assigns the API to **both** `globalThis.__hbIntel_accounting` and `window.__hbIntel_accounting` explicitly, because `globalThis !== window` in some SPFx execution contexts. The orchestrator smoke test enforces this by running the IIFE in a VM with separate `globalThis` and `window` objects.

## Shell Loader Contract

`ShellWebPart.ts` resolves the app module via:
1. `SPComponentLoader.loadScript()` with `globalExportsName: __APP_GLOBAL_NAME__`
2. Fallback: `globalThis[__APP_GLOBAL_NAME__]`
3. Fallback: `window[__APP_GLOBAL_NAME__]`

Then calls `mount(domElement, context, runtimeConfig)` in `render()`.

## Test Protection

`apps/accounting/src/test/bundleContract.test.ts` validates:
- mount/unmount export contract
- globalThis + window dual assignment
- Vite config IIFE format and entry path
- Manifest supportedHosts
- Dev vs production entry separation

## What Later Prompts Can Assume

1. `mount.tsx` is the true production entry — no ambiguity.
2. The IIFE/global/mount-unmount contract is consistent end-to-end.
3. `AccountingWebPart.tsx` is dev-only — its absence from the `.sppkg` is intentional.
4. Bundle-contract tests protect against accidental regression.
