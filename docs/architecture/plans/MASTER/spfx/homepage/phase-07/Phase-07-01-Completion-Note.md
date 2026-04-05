# Phase 07-01 Completion Note — Entrypoint and Bundle Validation

## Status

**Complete.** Packaging truth, entrypoint inventory, and production-vs-nonproduction boundaries are audited and documented for both Lane A and Lane B.

## Verification results

### Lane A (`apps/hb-webparts`)

| Step | Result |
|------|--------|
| `check-types` | PASS |
| `lint` | PASS |
| `build` | PASS — `hb-webparts-app.js` (264.07 KB) + `spfx-hb-webparts.css` (0.63 KB) |
| `test` | PASS — 17 files / 69 tests |

### Lane B (`apps/hb-shell-extension`)

| Step | Result |
|------|--------|
| `check-types` | PASS |
| `lint` | PASS |
| `build` | PASS — `hb-shell-extension-app.js` (146.76 KB) + `spfx-hb-shell-extension.css` (2.22 KB) |
| `test` | PASS — 3 files / 26 tests |

### CSS emission

Both lanes emit CSS alongside their JS bundles:
- Lane A: `spfx-hb-webparts.css` (0.63 KB) — from `homepage-interactive.module.css`
- Lane B: `spfx-hb-shell-extension.css` (2.22 KB) — from `shell-extension.module.css`

The build tool (`tools/build-spfx-package.ts`) copies all `dist/` files into the shell's asset directory, so CSS assets are automatically included in `.sppkg` packaging.

## Files created

| File | Purpose |
|------|---------|
| `Phase-07-Packaging-Truth-Audit.md` | Full packaging-truth reference for both lanes: build config, emitted assets, global APIs, entrypoints, loader seams, verification commands, cumulative `.sppkg` model |
| `Phase-07-Entrypoint-and-Emitted-Asset-Inventory.md` | Concise production/non-production/deprecated classification for all entrypoints and emitted assets, stability assessment |
| `Phase-07-01-Completion-Note.md` | This completion note |

## Audit findings

### No defects found

- All production entrypoints compile, lint, build, and test cleanly
- Global API names are stable and tested
- Null-safe behavior in Lane B is implemented and tested
- Import discipline is enforced in both lanes
- Solution IDs, manifest IDs, and feature IDs are stable
- CSS emission is accounted for in both lanes

### Proof-case files: intentionally retained

The two proof-case entry files (`mount-hero-proof-case.tsx`, `mount-priority-actions-rail-proof-case.tsx`) are NOT imported by the production mount and NOT included in the cumulative build. They are selected at build time only when `HB_WEBPARTS_PROOF_CASE_IDS` is populated in `tools/build-spfx-package.ts`. They are safe to retain for future tenant-validation scenarios.

### Scaffold-era files: annotated and excluded

- `helpers/normalization.ts` — `@deprecated`, zero imports
- `helpers/config.ts` — scaffold-era, used only by ReferenceComposition
- `webparts/hbWebparts/manifest` — excluded from builds by `HB_WEBPARTS_EXCLUDED_MANIFEST_IDS`

All are documented and do not affect production behavior.

### No README or doc staleness detected

Both package READMEs (`hb-webparts/README.md`, `hb-shell-extension/README.md`) accurately reflect current repo truth including build output, mount seams, import policy, and packaging model.

## Deferred to Prompt 02

- Bundle-size budget enforcement (currently documented sizes but no CI gate)
- Tree-shaking audit for unused exports in the IIFE bundles
- CSS extraction strategy review (currently automatic via Vite)
- SPFx Application Customizer wiring for Lane B (deployment-phase work)
