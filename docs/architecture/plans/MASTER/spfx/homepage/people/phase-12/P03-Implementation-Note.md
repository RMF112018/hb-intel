# P03 — Implementation Note: Webpart Wiring and UI Preservation

**Date:** 2026-04-07
**Phase:** 12 / P03 — Webpart Wiring and UI Preservation
**Version:** 0.0.24

---

## What Changed

| File | Change |
|------|--------|
| `apps/hb-webparts/src/webparts/peopleCulture/PeopleCultureMerged.tsx` | Wired `usePeopleCultureData()` hook; list config is now primary, manifest config is fallback |
| `apps/hb-webparts/package.json` | Version bump 0.0.23 → 0.0.24 |

---

## Runtime Precedence Model

Mirrors the Project Spotlight pattern exactly:

```
1. usePeopleCultureData() → listConfig (live SharePoint lists)
2. config prop (manifest / parent-provided)
3. normalizer empty-state handling
```

The component calls:
```ts
const { listConfig, isLoading: listLoading } = usePeopleCultureData();
const effectiveConfig = listConfig ?? config;
```

When running inside SPFx with a valid site URL, the hook fetches all three lists and returns the merged config. When running locally or when the fetch fails, `listConfig` is `undefined` and the component falls through to manifest config props.

---

## UI Preservation

All premium surface elements are preserved unchanged:
- Warm gradient hero banner
- Bold featured kudos spotlight with orange accent border
- Avatar-rich composition with ring treatment
- Supporting highlights rail (announcements + celebrations)
- Celebrations chip ribbon
- Sparse-state invitation surface ("Recognize a teammate")
- Reduced-motion behavior
- Empty-state governance messages

---

## What Was Not Changed

- `PeopleCultureWebPart.manifest.json` — fallback seed data retained as-is
- `communicationsContracts.ts` — no contract changes
- `communicationsConfig.ts` — normalizer unchanged
- `peopleCultureListSource.ts` — no changes (P02 output)
- `usePeopleCultureData.ts` �� no changes (P02 output)
- `mount.tsx` — no changes needed
- `spContext.ts` — no changes needed

---

## Verification

- `check-types`: Pass (clean)
- `lint`: Pass (clean, 0 errors, 0 warnings)
- `build`: Pass (556.88 kB JS, 31.32 kB CSS)
- `test`: 13 failures, all pre-existing (bundle budget, composition preview, discovery, operational awareness, utility — none related to People & Culture wiring)
