# Tool Launcher Narrow Packaging Remediation: Summary

## Suspected failure mode

Current evidence indicated a partial package/deploy mismatch — newer composition work appeared in SharePoint but later Tool Launcher phases (11D–11H) did not appear to have taken effect. This pointed to one of:
- Stale build artifacts surviving into the package
- Wrong `.sppkg` selected for upload
- App-catalog upgrade applying an older package
- Asset/version mismatch in the generated package

## Build and packaging path

### Authoritative commands

| Step | Command | Working directory |
|------|---------|-------------------|
| TypeScript check | `npx tsc --noEmit` | `apps/hb-webparts/` |
| Vite production build | `npx vite build` | `apps/hb-webparts/` |
| SPFx package generation | `npx tsx tools/build-spfx-package.ts --domain hb-webparts` | repo root |

### Artifact paths

| Artifact | Path |
|----------|------|
| Vite IIFE bundle | `apps/hb-webparts/dist/hb-webparts-app.js` |
| Vite CSS bundle | `apps/hb-webparts/dist/spfx-hb-webparts.css` |
| Content-hashed bundle | `apps/hb-webparts/dist/hb-webparts-app-{hash}.js` (copied by build script) |
| Intermediate sppkg | `tools/spfx-shell/sharepoint/solution/hb-webparts.sppkg` |
| Final sppkg output | `dist/sppkg/hb-webparts.sppkg` |
| Shim proof | `dist/sppkg/hb-webparts-shim-proof.json` |

### Where stale artifacts can survive

| Location | Risk | Cleaned? |
|----------|------|----------|
| `apps/hb-webparts/dist/` | Old Vite bundle persists if not cleaned | Yes — deleted entirely |
| `tools/spfx-shell/temp/` | Old webpack output persists | Yes — deleted |
| `tools/spfx-shell/dist/` | Old gulp output persists | Yes — deleted |
| `tools/spfx-shell/lib/` | Old TypeScript output persists | Yes — deleted |
| `tools/spfx-shell/release/` | Old release artifacts persist | Yes — deleted |
| `tools/spfx-shell/sharepoint/solution/` | Old sppkg and debug dir persist | Yes — deleted |
| `tools/spfx-shell/assets/` | Old copied JS/CSS persist | Yes — deleted |
| `dist/sppkg/` | Old final output persists | Yes — deleted |

## Files and scripts inspected

- `apps/hb-webparts/package.json` — build scripts (`check-types`, `lint`, `build`)
- `tools/build-spfx-package.ts` — orchestration script (Vite build validation, SPFx shell prep, gulp bundle, gulp package-solution, OPC verification)
- `tools/spfx-shell/gulpfile.js` — SPFx gulp pipeline with DefinePlugin and CopyPlugin
- `tools/spfx-shell/package.json` — shell build scripts
- `tools/spfx-shell/config/config.json` — SPFx bundle configuration (written per-build)
- `tools/spfx-shell/config/package-solution.json` — SPFx solution metadata (written per-build)
- `apps/hb-webparts/src/webparts/toolLauncherWorkHub/` — all 14 launcher files (source truth)

## What was cleaned

All directories listed in the "Where stale artifacts can survive" table were deleted before rebuild. This ensures the new package can only come from current source — no incremental build pollution.

## What was rebuilt

1. **Vite build** — Fresh `apps/hb-webparts/dist/hb-webparts-app.js` (521,993 bytes) and `spfx-hb-webparts.css` (24,840 bytes)
2. **SPFx package** — Fresh `dist/sppkg/hb-webparts.sppkg` (2,966.7 KB) containing 11 webpart manifests, 11 per-webpart shell entry shims, the main Vite bundle (content hash `42b733c6`), and the CSS bundle

## What was fixed

**No packaging defects were found.** The build pipeline correctly produces a package containing the latest source. The suspected mismatch was likely caused by one of:
- Uploading an older sppkg file to the app catalog
- App catalog not completing the upgrade (requires "Deploy" confirmation after upload)
- Browser cache serving older client-side assets

The remediation action is to upload the freshly-built `dist/sppkg/hb-webparts.sppkg` and confirm the app catalog upgrade completes.

## Final conclusion on package readiness

The generated `dist/sppkg/hb-webparts.sppkg` is **confirmed ready for upload**. All 8 proof markers from phases 11D–11H are verified present in the packaged bundle. The SHA256 hash of the packaged bundle matches the source Vite build output exactly.
