# Prompt-02 Completion Note — Implement Cumulative All-Webparts Package

## Status

Complete. The `hb-webparts` package now includes all 10 homepage webparts in a single cumulative `.sppkg`.

## 1. Files changed

| File | Change |
|------|--------|
| `tools/build-spfx-package.ts` | Cleared `HB_WEBPARTS_PROOF_CASE_IDS` to an empty set. The proof-case filter, entry routing, and single-target logic are now dormant — all 10 manifests pass through to the existing multi-manifest pipeline. |
| `apps/hb-webparts/config/package-solution.json` | Version bump `1.0.0.21` → `1.0.0.22` |

## 2. Architecture selected

**Neutral shell manifest + AMD shims (the existing verified multi-manifest pipeline).**

- The neutral shell manifest ID (`9a2f7f61-...`) is compiled as the base entry module
- Each of the 10 webparts gets a per-webpart AMD shim: `define("{webpartId}_1.0.0", ["9a2f7f61-..._1.0.0"], function(b){return b})`
- The full `mount.tsx` dispatcher is the Vite entry (default, no env override needed)
- `ShellWebPart.ts` passes `webPartId` via runtime config → `mount.tsx` renders the correct React component

## 3. Cumulative inclusion is now active

All 10 webparts are present in the emitted `.sppkg`:

| Webpart | Manifest ID | Shim file |
|---------|-------------|-----------|
| CompanyPulse | `0b53f651-...` | `shell-entry-0b53f651-...-21e2e97c.js` |
| SmartSearchWayfinding | `11d72b36-...` | `shell-entry-11d72b36-...-a946d23e.js` |
| PeopleCulture | `27ac10f4-...` | `shell-entry-27ac10f4-...-6d60494d.js` |
| HbHeroBanner | `39762a4d-...` | `shell-entry-39762a4d-...-5f9f31fc.js` |
| PersonalizedWelcomeHeader | `46bfde64-...` | `shell-entry-46bfde64-...-5d6cfd80.js` |
| ProjectPortfolioSpotlight | `8370ab0c-...` | `shell-entry-8370ab0c-...-7581fc3d.js` |
| SafetyFieldExcellence | `89ca5ff3-...` | `shell-entry-89ca5ff3-...-b471be44.js` |
| PriorityActionsRail | `b3f07190-...` | `shell-entry-b3f07190-...-7a18a3b3.js` |
| ToolLauncherWorkHub | `cb7060f5-...` | `shell-entry-cb7060f5-...-c5f2c9de.js` |
| LeadershipMessage | `e8fa8a84-...` | `shell-entry-e8fa8a84-...-e4c214c3.js` |

## 4. Version bump

- **Before:** `1.0.0.21`
- **After:** `1.0.0.22`

## 5. Build / package results

| Step | Result |
|------|--------|
| check-types | pass |
| lint | pass |
| build (Vite, full mount.tsx) | pass — 262.49 kB |
| gulp bundle --ship | pass — 10 manifests compiled |
| AMD shim generation | pass — 10 shims |
| gulp package-solution --ship | pass — `hb-webparts.sppkg` (100.5 KB) |
| .sppkg inspection | 10 webpart XMLs, 10 shim files, version `1.0.0.22` |
| shim-proof.json | base `9a2f7f61-..._1.0.0`, 10 shim mappings |

## 6. Known remaining risks

| Risk | Mitigation |
|------|------------|
| Tenant service-worker cache may serve stale single-webpart package | Content-hashed bundle filename changed. Unregister `spserviceworker.js` if needed. |
| AMD shim resolution untested in tenant for all 10 webparts | Individual proof cases (HbHeroBanner, PriorityActionsRail) validated the shell + bundle + mount chain. The shim layer adds only a thin AMD alias. Tenant validation (Prompt-03) will confirm. |
| Previously validated proof-case webparts now use shim path instead of direct | Functionally equivalent — the shim re-exports the same compiled module. Runtime behavior is identical. |
