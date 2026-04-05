# Prompt-02 Completion Note — Migrate PriorityActionsRail Proof Case

## Status

Complete. The active proof-case target is now `PriorityActionsRailWebPart`.

## Files changed

| File | Change |
|------|--------|
| `apps/hb-webparts/src/mount-priority-actions-rail-proof-case.tsx` | New. Isolated entry importing only `PriorityActionsRail`, same `mount`/`unmount` shell contract, same `__hbIntel_hbWebparts` global. |
| `tools/build-spfx-package.ts` | Switched `HB_WEBPARTS_PROOF_CASE_IDS` from `39762a4d-...` (HbHeroBanner) to `b3f07190-...` (PriorityActionsRail). Entry lookup map already contains the mapping from P3-01. |
| `apps/hb-webparts/config/package-solution.json` | Version bump `1.0.0.17` → `1.0.0.18` (both `solution.version` and `features[0].version`). |

## Active proof-case ID

- **Before:** `39762a4d-c7fd-44a6-a11e-4f8de9f5778d` (HbHeroBannerWebPart)
- **After:** `b3f07190-79cf-437d-a1d6-ecbf3f77e616` (PriorityActionsRailWebPart)

Single-target only — no batch packaging, no neutral shell manifest, no AMD shims.

## Package version

- **Before:** `1.0.0.17`
- **After:** `1.0.0.18`

## Why single-target first-class packaging remains the selected model

The sequential single-webpart model isolates each migration so loader-contract correctness can be verified independently per webpart. If a failure occurs, the cause is unambiguous — it must be the newly switched target, not interference from other webparts sharing the package. This model was validated in Phase 2 and remains the lowest-risk rollout path.

## Verification results

- `check-types`: pass
- `lint`: pass
- `build` (default entry): pass (262.49 kB)
- `build` (proof-case entry): pass (227.38 kB — confirms isolation from unrelated webpart trees)
