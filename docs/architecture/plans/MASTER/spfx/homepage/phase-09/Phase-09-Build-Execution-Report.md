# Phase 09 Build Execution Report

## Final Disposition

**Lane A ready for deployment; Lane B not yet deployment-packaging-ready.**

## Lane A — `@hbc/spfx-hb-webparts`

| Step | Command | Result |
|------|---------|--------|
| Type-check | `pnpm --filter @hbc/spfx-hb-webparts check-types` | PASS |
| Lint | `pnpm --filter @hbc/spfx-hb-webparts lint` | PASS |
| Build | `pnpm --filter @hbc/spfx-hb-webparts build` | PASS — 264.12 KB JS + 0.63 KB CSS |
| Test | `pnpm --filter @hbc/spfx-hb-webparts test` | PASS — 18 files / 72 tests |
| Bundle budget | `npx tsx tools/spfx-bundle-check.ts` | PASS — JS 257.9 KB (< 400 KB), CSS 0.6 KB (< 10 KB) |
| `.sppkg` build | `npx tsx tools/build-spfx-package.ts --domain hb-webparts` | PASS — `hb-webparts.sppkg` (113.2 KB) |

### Solution metadata used

| Field | Value |
|-------|-------|
| Solution ID | `39b8f2ea-59bd-45b7-b4ec-b590b316833b` |
| Feature ID | `1f447e99-a2c7-43e5-83d8-d2ed78ed1a96` |
| Version | `1.0.0.40` |
| Content hash | `112d78d9` |

### `.sppkg` artifact

| Field | Value |
|-------|-------|
| Path | `dist/sppkg/hb-webparts.sppkg` |
| Size | 113.2 KB |
| Webpart manifests | 10 |
| Shell entry files | 10 (per-webpart, patched `define()` names) |
| CSS included | Yes — `spfx-hb-webparts.css` (628 bytes) |
| Total ClientSideAssets | 13 (1 IIFE bundle + 10 shell entries + 1 shell webpart + 1 CSS) |
| Proof-case entries in package | 0 (excluded) |
| Scaffold manifest in package | 0 (excluded) |

**Lane A is ready for App Catalog upload.**

## Lane B — `@hbc/spfx-hb-shell-extension`

| Step | Command | Result |
|------|---------|--------|
| Type-check | `pnpm --filter @hbc/spfx-hb-shell-extension check-types` | PASS |
| Lint | `pnpm --filter @hbc/spfx-hb-shell-extension lint` | PASS |
| Build | `pnpm --filter @hbc/spfx-hb-shell-extension build` | PASS — 146.78 KB JS + 2.25 KB CSS |
| Test | `pnpm --filter @hbc/spfx-hb-shell-extension test` | PASS — 4 files / 29 tests |
| Bundle budget | `npx tsx tools/spfx-bundle-check.ts` | PASS — JS 143.3 KB (< 300 KB), CSS 2.2 KB (< 10 KB) |
| `.sppkg` build | N/A — no Application Customizer wiring exists | NOT ATTEMPTED |

**Lane B is build-clean but not deployment-packaging-ready.** See Gap Report.
