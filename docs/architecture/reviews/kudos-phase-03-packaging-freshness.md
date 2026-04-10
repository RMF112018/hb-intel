# HB Kudos Phase-03 Packaging Freshness Proof

## Purpose

Prove that the rebuilt `hb-webparts.sppkg` (v1.0.0.128) contains the
current HB Kudos source from the Phase-03 remediation pass, with both
Kudos webpart manifests and their shell-entry shims verified against
source.

## Build command

```
npx tsx tools/build-spfx-package.ts --domain hb-webparts
```

## Solution version

- `apps/hb-webparts/config/package-solution.json`: `1.0.0.128`
- `tools/spfx-shell/config/package-solution.json`: `1.0.0.128`
- Both synchronized.

## App bundle

| Attribute | Value |
|-----------|-------|
| File | `hb-webparts-app-7f006c0a.js` |
| SHA-256 | `7f006c0a8867a2644e1ff1e6512e4d032e3907698fcd387bd7f74d2e310c217a` |
| Size | 808,436 bytes |
| Archive path | `ClientSideAssets/hb-webparts-app-7f006c0a.js` |

Freshness check: **PASS** — packaged bundle hash matches source build output.

## HB Kudos employee webpart

| Attribute | Value |
|-----------|-------|
| Manifest ID | `f14e59a3-4d6b-43b2-952e-ba02dea11dad` |
| Alias | `HbKudosWebPart` |
| Shell entry | `shell-entry-f14e59a3-4d6b-43b2-952e-ba02dea11dad-409b6e41.js` |
| Entry module ID | `f14e59a3-4d6b-43b2-952e-ba02dea11dad_1.0.0` |
| Preconfigured title | HB Kudos |
| Source manifest version | `0.2.12.0` |

All packaged manifest fields match source: **PASS**

Properties packaged: `heading`, `showArchive`, `homepageAgeOffDays`

## HB Kudos Approval Companion webpart

| Attribute | Value |
|-----------|-------|
| Manifest ID | `a8c5d9e2-7f14-4b3a-9c82-1e6f5d8a4b97` |
| Alias | `HbKudosCompanionWebPart` |
| Shell entry | `shell-entry-a8c5d9e2-7f14-4b3a-9c82-1e6f5d8a4b97-b2add1d9.js` |
| Entry module ID | `a8c5d9e2-7f14-4b3a-9c82-1e6f5d8a4b97_1.0.0` |
| Preconfigured title | HB Kudos Approval Companion |
| Source manifest version | `0.2.12.0` |

All packaged manifest fields match source: **PASS**

Properties packaged: `heading`, `simulatedRole`, `kudosAdminsGroup`, `kudosReviewersGroup`, `pendingOverdueDays`, `adminReviewOverdueDays`

## Build pipeline verification checks

| Check | Result |
|-------|--------|
| Structural validity | PASS |
| Bundle freshness (hash match) | PASS |
| All 16 shim hashes match | PASS |
| Source/package semantic alignment (16/16 manifests) | PASS |
| Live runtime proof (PnP marker in bundle) | PASS |

## Proof artifacts

- `dist/sppkg/hb-webparts.sppkg` — rebuilt package (3,076 KB)
- `dist/sppkg/hb-webparts-package-truth-proof.json` — machine-readable proof
- `dist/sppkg/hb-webparts-shim-proof.json` — shim mapping proof

## Conclusion

The rebuilt `hb-webparts.sppkg` at version `1.0.0.128` contains the
current Phase-03 remediation source for both HB Kudos webparts. All
manifest fields, property defaults, descriptions, and shell-entry
asset paths are verified aligned between source and packaged output.
