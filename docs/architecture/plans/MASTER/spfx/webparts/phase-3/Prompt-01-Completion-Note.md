# Prompt-01 Completion Note — Generalize Proof-Case Entry Selection

## Status

Complete. The proof-case entry routing is now driven by a manifest-ID-to-entry-file lookup map instead of a hardcoded hero entry path.

## Files changed

| File | Change |
|------|--------|
| `tools/build-spfx-package.ts` | Added `HB_WEBPARTS_PROOF_CASE_ENTRY_MAP` lookup map (2 entries). Replaced hardcoded `src/mount-hero-proof-case.tsx` with map-driven resolution from the active proof-case manifest ID. Added loud failure if an allowlisted ID has no mapped entry. |
| `apps/hb-webparts/config/package-solution.json` | Version bump `1.0.0.16` → `1.0.0.17` |

## Lookup map added

```typescript
const HB_WEBPARTS_PROOF_CASE_ENTRY_MAP: Record<string, string> = {
  '39762a4d-c7fd-44a6-a11e-4f8de9f5778d': 'src/mount-hero-proof-case.tsx',
  'b3f07190-79cf-437d-a1d6-ecbf3f77e616': 'src/mount-priority-actions-rail-proof-case.tsx',
};
```

## Current active proof-case behavior

Preserved. `HB_WEBPARTS_PROOF_CASE_IDS` still contains only `39762a4d-c7fd-44a6-a11e-4f8de9f5778d` (HbHeroBannerWebPart). The lookup map resolves this to the same `src/mount-hero-proof-case.tsx` entry that was previously hardcoded. No target switch occurred.

## Failure mode for unmapped proof-case IDs

If a manifest ID is added to `HB_WEBPARTS_PROOF_CASE_IDS` without a corresponding entry in `HB_WEBPARTS_PROOF_CASE_ENTRY_MAP`, the build fails with:

```
❌ hb-webparts: no proof-case entry mapped for manifest ID {id}
   Add an entry to HB_WEBPARTS_PROOF_CASE_ENTRY_MAP in build-spfx-package.ts
```

The build sets `allPassed = false` and skips the domain — no silent fallback.

## Verification results

- `check-types`: pass
- `lint`: pass
- `build`: pass (262.49 kB full bundle via default entry)
