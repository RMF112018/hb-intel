# 01 — Canonical Packaging Truth Freeze (Operational Summary)

**Status:** Complete
**Full review:** [accounting-spfx-packaging-truth-freeze.md](../../../../reviews/accounting-spfx-packaging-truth-freeze.md)

## Canonical Packaging Path

```
apps/accounting/src/mount.tsx → Vite IIFE → tools/build-spfx-package.ts → tools/spfx-shell/ (gulp) → hb-intel-accounting.sppkg
```

**Build command:** `npx tsx tools/build-spfx-package.ts --domain accounting`

## Ownership Table

| Concern | Authoritative File |
|---------|-------------------|
| Package version | `apps/accounting/config/package-solution.json` → `solution.version` (`001.000.028`) |
| Webpart component ID | `apps/accounting/src/webparts/accounting/AccountingWebPart.manifest.json` → `cf3c98bf-ff78-4f00-bd6d-c304433d959e` |
| Solution ID | `apps/accounting/config/package-solution.json` → `7dca8e93-b2fb-4e06-9e4b-d14118f87990` |
| Feature ID | `apps/accounting/config/package-solution.json` → `fbb5ac04-cf50-458b-91dd-3784de51a7af` |
| Bundle entry | `apps/accounting/src/mount.tsx` (IIFE, `__hbIntel_accounting` global) |
| Bundle naming | `apps/accounting/vite.config.ts` → `accounting-app.js` (orchestrator adds content hash) |
| Runtime config injection | `tools/spfx-shell/gulpfile.js` DefinePlugin + `ShellWebPart.ts` render |
| Runtime config consumption | `apps/accounting/src/config/runtimeConfig.ts` (3-tier fallback) |
| API permissions | `apps/accounting/config/package-solution.json` → `hb-intel-api-production / access_as_user` |
| `.sppkg` generation | `gulp package-solution --ship` in `tools/spfx-shell/`, orchestrated by `tools/build-spfx-package.ts` |

## Key IDs

| ID | Value |
|----|-------|
| Webpart component ID | `cf3c98bf-ff78-4f00-bd6d-c304433d959e` |
| Solution ID | `7dca8e93-b2fb-4e06-9e4b-d14118f87990` |
| Feature ID | `fbb5ac04-cf50-458b-91dd-3784de51a7af` |
| Global name | `__hbIntel_accounting` |
| Dev port | 4001 |

## ShellWebPart Resolution

The prior audit concern that `ShellWebPart` in the packaged artifact indicated packaging drift is **disproven**. `ShellWebPart` is the intentional, generic SPFx wrapper for all 12 HB Intel domains. The orchestrator injects the Accounting webpart ID, solution config, and API permissions into the shell at build time. The shell manifest `alias` ("ShellWebPart") is an internal SPFx compilation detail, not the domain identity.

## What Later Prompts Can Assume

1. The packaging path is settled — no re-audit needed.
2. `apps/accounting/config/package-solution.json` is the version and permission authority.
3. `apps/accounting/src/webparts/accounting/AccountingWebPart.manifest.json` is the manifest identity authority.
4. `tools/spfx-shell/` files are derived build output, not authoritative sources.
5. Runtime config flows: DefinePlugin → `ShellWebPart.render()` → `mount(el, ctx, config)` → `runtimeConfig.ts`.
6. The API permission declaration (`hb-intel-api-production / access_as_user`) is present in the package-solution config.
