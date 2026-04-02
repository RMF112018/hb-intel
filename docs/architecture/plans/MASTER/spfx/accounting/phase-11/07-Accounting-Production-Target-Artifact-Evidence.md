# 07 — Accounting Production-Target Artifact Evidence

**Status:** Complete
**Full report:** [accounting-production-target-sppkg-build-evidence.md](../../../../reviews/accounting-production-target-sppkg-build-evidence.md)

## Build Summary

| Property | Value |
|----------|-------|
| Command | `npx tsx tools/build-spfx-package.ts --domain accounting` |
| Artifact | `dist/sppkg/hb-intel-accounting.sppkg` (293.1 KB) |
| SHA-256 | `b0c0ee558e358835b4618f3f45a53c30d7e46be7d00be5ca96176472001ae53d` |
| Vite bundle | `accounting-app-8acaff18.js` (content hash: `8acaff18`) |
| Shell webpart | `shell-web-part_e0c51b569817b47b5742.js` |

## Artifact Identity

| Property | Value | Verified |
|----------|-------|----------|
| Solution ID | `7dca8e93-b2fb-4e06-9e4b-d14118f87990` | PASS |
| Version | `001.000.033` (solution + feature) | PASS |
| Component ID | `cf3c98bf-ff78-4f00-bd6d-c304433d959e` | PASS |
| Feature ID | `fbb5ac04-cf50-458b-91dd-3784de51a7af` | PASS |
| API Permission | `hb-intel-api-production / access_as_user` | PASS |

## Shell Asset Verification

| Reference | Present |
|-----------|---------|
| Bundle filename (`accounting-app-8acaff18.js`) | Yes |
| Global name (`__hbIntel_accounting`) | Yes |
| globalThis + window fallback | Yes |
| mount() invocation | Yes |
| Runtime config injection paths | Yes |

## Artifact Classification

**Conditional Go — staging-targeted.** Built from canonical path with all identity and permission references correct. Runtime config values are empty (local build without CI/CD env vars). A production-target artifact requires CI/CD build with `FUNCTION_APP_URL` and `API_AUDIENCE`.

## P11 Alignment

All 6 prior prompt determinations confirmed in the artifact:
- P11-01: Packaging path canonical
- P11-02: Bundle contract (IIFE/mount/unmount) correct
- P11-03: API permissions present in AppManifest
- P11-04: Runtime injection paths present in shell
- P11-05: Hidden deps present in bundle, unreachable at runtime
- P11-06: Shell continuity is source-level (N/A for artifact)

## What Later Prompts Can Assume

1. The `.sppkg` build path works end-to-end.
2. The artifact matches current repo truth at version `001.000.033`.
3. CI/CD production build requires only env var injection — no code changes.
4. The artifact location is `dist/sppkg/hb-intel-accounting.sppkg`.
