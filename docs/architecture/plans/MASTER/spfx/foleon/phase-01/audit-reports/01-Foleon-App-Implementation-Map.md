# 01 — Foleon App Implementation Map

## Expected Implementation Footprint From the Audit Prompt

The uploaded scope expected at least the following implementation footprint:

- `apps/hb-intel-foleon`
- `FoleonWebPart`
- URL-search-param routing for Highlights, Reader, and Content Hub
- `FoleonOriginPolicy`
- `FoleonReaderGate`
- `FoleonContentService`
- `FoleonPlacementService`
- `FoleonTelemetryService`
- `IFoleonMountConfig`
- `window.__hbIntel_foleon`
- `window.__hbIntel_foleonRuntimeBindingProof`
- `dist/foleon-app.js`
- SPFx manifest id `2160edb3-675e-4451-92bb-8345f9d1c71e`
- package version `1.0.0.0`
- `tools/build-spfx-package.ts` domain registration
- `HB_FoleonContentRegistry`
- `HB_FoleonHomepagePlacements`

## Actual Implementation Map From Repo Truth

# Core Finding

`hb-intel-foleon 1.0.0.0` cannot be certified as production-ready because the claimed implementation is absent from, or not discoverable in, the inspected `main` branch.

This changes the audit posture materially:

- The claimed Foleon app cannot be inspected at code level.
- The claimed Foleon service layer cannot be verified.
- The claimed Reader route gates cannot be verified.
- The claimed Vite IIFE bundle and global registration cannot be verified.
- The claimed SPFx manifest ID and version cannot be verified.
- The claimed runtime binding proof cannot be verified.
- The claimed SharePoint list-by-GUID access cannot be verified.
- The claimed test count cannot be verified.
- The claimed deferred-work posture cannot be evaluated as an implementation tradeoff because the base implementation is missing from repo truth.

This is a release-blocking source-of-truth failure.

## Effective Current Architecture

There is no inspectable Foleon architecture on `main`. Therefore, the current implementation map is a negative map:

| Area | Expected | Repo-Truth Status | Impact |
|---|---|---:|---|
| App package | `apps/hb-intel-foleon` | Not found | Blocks all build and audit claims |
| Webpart | `FoleonWebPart` | Not found | No SPFx surface to deploy |
| Manifest | GUID `2160edb3...` | Not found | No manifest identity proof |
| Routing | Highlights / Reader / Hub | Not found | No route robustness proof |
| Services | Five Foleon services | Not found | No security or data logic proof |
| Lists | Registry + placements | Not found | No schema/index proof |
| Telemetry | SharePoint write + backend-ready interface | Not found | No supportability proof |
| Packaging | build-spfx domain registration | Foleon absent from inspected registry | No deployable .sppkg proof |
| Runtime proof | `window.__hbIntel_foleonRuntimeBindingProof` | Not found | No runtime-binding proof |

## Files/Symbols That Must Exist Before Re-Audit

- `apps/hb-intel-foleon/package.json`
- `apps/hb-intel-foleon/vite.config.ts`
- `apps/hb-intel-foleon/src/mount.tsx`
- `apps/hb-intel-foleon/src/FoleonWebPart.tsx` or equivalent shell entry
- `apps/hb-intel-foleon/src/webparts/foleon/FoleonWebPart.manifest.json`
- Foleon route components under `src/routes` or equivalent
- Foleon services under `src/services` or equivalent
- test suites covering gates, URL parsing, postMessage handling, telemetry, and list queries
- list schema/provisioning files under the established SharePoint schema conventions
- `tools/build-spfx-package.ts` domain registry entry
- package-truth proof files under `dist/sppkg` or equivalent generated evidence
