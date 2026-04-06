# P02-02 Implementation Note — Fix Manifest Emission and Toolbox Hiding

**Prompt:** `Prompt-02-Fix-Manifest-Emission-And-Toolbox-Hiding.md`
**Date:** 2026-04-06
**Version:** 1.0.0.71

## Findings

The P02-01 forensic audit confirmed that manifest emission and toolbox hiding are **already correct** in the emitted `.sppkg`. The build orchestrator (`tools/build-spfx-package.ts`) reads source manifests fresh each build and regenerates release manifests — no stale manifest carryover exists.

| Check | Status |
|-------|--------|
| Signature Hero manifest: empty `properties: {}` | Correct |
| Signature Hero manifest: `supportsFullBleed: true` | Correct |
| Signature Hero manifest: no `hiddenFromToolbox` | Correct |
| 10 non-hero manifests: `hiddenFromToolbox: true` | Correct |
| `hiddenFromToolbox` survives into packaged WebPart XML | Correct (verified in P02-01) |
| Stale manifest carryover | None — orchestrator regenerates |

## What Changed

### Build-proof validation step added

**File:** `tools/validate-manifests.ts`

Added an hb-webparts multi-manifest validation section that checks:

1. **Signature Hero stale-default detection** — Fails if the flagship hero manifest `properties` contains any of: `headline`, `message`, `metadata`, `cta`, `secondaryCta`, `eyebrow`
2. **Signature Hero `supportsFullBleed` enforcement** — Fails if `supportsFullBleed: true` is missing
3. **Signature Hero visibility check** — Fails if the flagship hero has `hiddenFromToolbox: true`
4. **Non-hero toolbox-hiding enforcement** — Fails if any non-hero webpart is missing `hiddenFromToolbox: true`
5. **GUID uniqueness** — All hb-webparts manifest IDs checked for collisions with domain app IDs

The HbWebparts scaffold (`535f5a17`) is excluded from non-hero checks via `HB_WEBPARTS_EXCLUDED_IDS`.

### Version bump

`package-solution.json`: `1.0.0.70` → `1.0.0.71`

## Validation

```
npx tsx tools/validate-manifests.ts
```

All hb-webparts checks pass (no errors from the new section). The only failure is a pre-existing estimating bundle format issue unrelated to this work.
