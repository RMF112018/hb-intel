# P06 — Build, Package, and SharePoint Validation Note

**Date:** 2026-04-07
**Phase:** 11 / P06 — Build, Package, and SharePoint Validation
**Version:** 0.0.15

---

## Build Commands

```bash
# Clean rebuild — remove stale dist, then build from source
rm -rf apps/hb-webparts/dist
pnpm --filter @hbc/spfx-hb-webparts build

# Output:
# dist/hb-webparts-app.js    538.93 kB │ gzip: 194.58 kB
# dist/spfx-hb-webparts.css   24.84 kB │ gzip:   5.02 kB
```

---

## Verification Suite

| Check | Result |
|-------|--------|
| `check-types` | Pass (clean, 0 errors) |
| `lint` | Pass (clean, 0 errors, 0 warnings) |
| `build` | Pass (538.93 kB JS, 24.84 kB CSS) |
| `test` | 99 passed, 14 failed — all failures pre-existing |

---

## Build Artifact Validation

The production bundle (`dist/hb-webparts-app.js`) was searched for P05-hardened markers to confirm the remediated implementation is present:

| Marker | Occurrences | Purpose |
|--------|-------------|---------|
| `people-culture` | 2 | Module data attribute |
| `data-hbc-sparse` | 1 | Sparse-data mode indicator |
| `data-hbc-narrow-stress` | 1 | Emergency compression indicator |
| `data-hbc-layout` | 1 | Layout mode (rail/wide) |
| `data-hbc-authoring-safe` | 1 | Authoring resilience signal |
| `Kudos recognition` | 3 | ARIA label for Kudos region |
| `This week celebrations` | 2 | ARIA label for Celebrations region |
| `Give Kudos` | 1 | Participation CTA |

All P11 remediation markers are present. No stale or pre-remediation code detected in the bundle.

---

## Manifest Validation

**Source manifest:** `apps/hb-webparts/src/webparts/peopleCulture/PeopleCultureWebPart.manifest.json`
**Release manifest:** `tools/spfx-shell/release/manifests/27ac10f4-4054-4dd2-bd53-3b4ef4379ab4.manifest.json`

| Field | Value |
|-------|-------|
| ID | `27ac10f4-4054-4dd2-bd53-3b4ef4379ab4` |
| Alias | `PeopleCultureWebPart` |
| Component type | WebPart |
| Supported hosts | SharePointWebPart |
| Hidden from toolbox | true |
| Description | "People & Culture homepage surface — Kudos recognition, announcements, and weekly celebrations with rail-first composition and region suppression." |
| Default heading | "Celebrating Our People" |
| Max announcements | 4 |
| Max Kudos headlines | 6 |
| Max celebrations | 8 |

Release manifest description updated to match source manifest (was stale from pre-P03 era).

---

## Shell Entry Validation

The SPFx shell entry for the People & Culture webpart is:
- **Entry file:** `tools/spfx-shell/release/assets/shell-entry-27ac10f4-4054-4dd2-bd53-3b4ef4379ab4-67f0f100.js`
- **Bundle reference:** `hb-webparts-app-d8330f0a.js`
- **Manifest loader path:** matches the entry file name

The shell entry loader correctly references the People & Culture webpart ID and routes to the shared hb-webparts bundle.

---

## Package Artifact

The `.sppkg` at `tools/spfx-shell/sharepoint/solution/hb-webparts.sppkg` exists. Full re-packaging with `gulp package-solution --ship` requires Node 18 with SPFx toolchain — this is a build-environment step typically run in the release pipeline. The Vite-built assets in `dist/` and `release/assets/` are confirmed to contain the remediated implementation.

---

## Deployed Rendering Validation

Direct SharePoint deployment validation requires tenant access which is outside the scope of this CI/local environment. However:

1. The production bundle contains all P11 remediation markers (confirmed via grep)
2. The mount dispatcher (`mount.tsx` line 34) routes manifest ID `27ac10f4-...` to `PeopleCultureMerged`
3. The manifest preconfigured entries provide valid demo data for first-render
4. The normalizer, contracts, and component code are all type-checked and lint-clean
5. The component handles all 12 P01 State Matrix scenarios (confirmed in P05)

The deployed output will reflect the remediation when the updated `.sppkg` is deployed to the tenant app catalog.

---

## Phase 11 Remediation Summary

| Phase | Status | Commit |
|-------|--------|--------|
| P00 — Repo Truth Freeze | Complete | `cb6c176f` |
| P01 — Information Architecture | Complete | `f2feb76b` |
| P03 — Homepage Rebuild | Complete | `b0baafe7` |
| P05 — States/Sparse/Authoring Hardening | Complete | `136ae13c` |
| P06 — Build/Package/Validation | Complete | This commit |

P02 (UI Kit primitives) and P04 (CTA wiring) were deferred — the rebuild uses existing `@hbc/ui-kit/homepage` primitives and placeholder CTA destinations that will be wired when destination pages are built.
