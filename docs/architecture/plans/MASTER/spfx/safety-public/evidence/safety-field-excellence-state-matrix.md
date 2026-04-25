# Safety Field Excellence — State Matrix (Wave 06)

Evaluated against the 11 states required by `cut-over-plan/03_Homepage_Surface_and_UIUX_Requirements.md` plus mode reductions.

| # | Source mode | Backend state / fallback | Surface render | `data-hbc-safety-preview` | `data-hbc-safety-stale` | `data-hbc-safety-fallback-reason` | Status | Test |
|---|---|---|---|---|---|---|---|---|
| 1 | `curated-only` | n/a (no fetch) | curated content | absent | absent | absent | ✅ | `SafetyFieldExcellence.uiUxStates.test.tsx:46-58` |
| 2 | `dynamic-preview` | published | curated by default (Wave 05 contract) | absent | absent | absent | ✅ | `SafetyFieldExcellenceDynamicProvider.test.tsx:64-86` |
| 3 | `dynamic-with-curated-fallback` | published valid | dynamic config | absent | absent | absent | ✅ | `SafetyFieldExcellenceDynamicProvider.test.tsx:159-181` (provider-side coverage of valid dynamic in dynamic-only; same code path) |
| 4 | `dynamic-with-curated-fallback` | no-published, curated config exists | curated render with `curated-fallback` chip | absent | absent | `curated-fallback` | ✅ | `SafetyFieldExcellence.uiUxStates.test.tsx:117-135` |
| 5 | `dynamic-with-curated-fallback` | no-published, no curated | preview fallback | `true` | absent | `preview` | ✅ | `SafetyFieldExcellenceDynamicProvider.test.tsx:130-151` |
| 6 | `dynamic-only` | published valid | dynamic config | absent | absent | absent | ✅ | `SafetyFieldExcellenceDynamicProvider.test.tsx:159-181` |
| 7 | `dynamic-only` | no-published | preview fallback | `true` | absent | `preview` | ✅ | `SafetyFieldExcellence.uiUxStates.test.tsx:60-77` |
| 8 | `dynamic-only` | published, stale | dynamic with stale chip | absent | `true` | absent | ✅ | `SafetyFieldExcellence.uiUxStates.test.tsx:79-97` |
| 9 | `dynamic-only` | auth-error | preview fallback with `live-data-unavailable` chip | `true` | absent | `live-data-unavailable` | ✅ | `SafetyFieldExcellenceDynamicProvider.test.tsx:184-208` (dataSource), `SafetyFieldExcellence.uiUxStates.test.tsx:99-115` (UI). Raw error never appears in DOM. |
| 10 | `dynamic-only` | network-error | same as 9 | `true` | absent | `live-data-unavailable` | ✅ | `SafetyFieldExcellence.uiUxStates.test.tsx:99-115` |
| 11 | `dynamic-only` | invalid-payload | same as 9 | `true` | absent | `live-data-unavailable` | ✅ | covered by `SafetyFieldExcellenceDataAdapter.test.ts` invalid-payload paths plus the same `error-fallback` decision branch tested in (9). |

## Mode reductions

| State | Standard | Compact | Minimal |
|---|---|---|---|
| Stale chip visible | ✅ | ✅ | ✅ |
| Preview chip visible | ✅ | ✅ | ✅ |
| Fallback-reason chip visible | ✅ | ✅ | ✅ |
| dataConfidence chip visible | ✅ | ✅ | hidden (`mode !== 'minimal'` guard in surface) |
| Updated label visible | ✅ | ✅ | hidden |
| Posture summary visible | ✅ | hidden in compact via mode style; ✅ in compact body | hidden |
| Secondary signals | up to 4 | up to 3 | up to 2 |
| Last-updated caption on primary | ✅ | ✅ | ✅ |
| Hover-only meaning | none (baseline `›` chevron present) | none | none |

Tests covering mode reductions: `SafetyFieldExcellence.uiUxStates.test.tsx:138-167, 169-186`.

## Curated-only baseline

The Wave 05 `SafetyFieldExcellence.stateMatrix.test.tsx` (carryover) continues to pass after Wave 06 changes — confirms `curated-only` default behavior is unchanged.

## Runtime proof correlation

`window.__hbIntel_safetyFieldExcellenceRuntimeProof` reflects the rendered state:

- `dataSource: 'curated' | 'dynamic' | 'preview-fallback' | 'curated-fallback' | 'error-fallback'`
- `previewFallbackRendered: boolean` (Wave 06 addition)
- `staleTreatment: boolean` (Wave 06 addition)
- `fallbackReason` mirrors the surface chip
- never includes tokens, raw payload, or finding text (Wave 05 contract preserved; tested in `SafetyFieldExcellenceDynamicProvider.test.tsx:210-237`)
