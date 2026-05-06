# 05 — Footprint Rail / Detail Span Specification

## Objective

Extend the PCC footprint system to include `rail` and `detail` without changing the existing responsive mode model.

## Updated Footprint Union

```ts
export const PCC_CARD_FOOTPRINTS = [
  'hero',
  'wide',
  'standard',
  'compact',
  'tall',
  'full',
  'rail',
  'detail',
] as const;
```

## Meaning

| Footprint | Role |
| --- | --- |
| `hero` | dominant route/project summary where a non-full but prominent card is desired |
| `wide` | multi-signal summary or work queue |
| `standard` | default card |
| `compact` | small KPI/status tile |
| `tall` | vertical timeline/activity/status stack |
| `full` | full-row panel |
| `rail` | narrow persistent context/filter/lens/people rail |
| `detail` | deep inspection, registry, traceability, review, or workbench detail |

## Column Spans

Update `FOOTPRINT_COLUMN_SPANS`:

```ts
export const FOOTPRINT_COLUMN_SPANS: Record<PccResponsiveMode, Record<PccCardFootprint, number>> = {
  ultrawide:       { hero: 8, wide: 6, standard: 4, compact: 3, tall: 4, full: 12, rail: 3, detail: 8 },
  desktop:         { hero: 8, wide: 6, standard: 4, compact: 3, tall: 4, full: 12, rail: 3, detail: 8 },
  largeLaptop:     { hero: 8, wide: 6, standard: 4, compact: 3, tall: 4, full: 12, rail: 3, detail: 8 },
  standardLaptop:  { hero: 6, wide: 5, standard: 3, compact: 2, tall: 3, full: 10, rail: 3, detail: 7 },
  smallLaptop:     { hero: 6, wide: 5, standard: 3, compact: 2, tall: 3, full: 8,  rail: 2, detail: 6 },
  tabletLandscape: { hero: 4, wide: 3, standard: 2, compact: 2, tall: 2, full: 6,  rail: 2, detail: 4 },
  tabletPortrait:  { hero: 2, wide: 2, standard: 1, compact: 1, tall: 1, full: 2,  rail: 1, detail: 2 },
  phone:           { hero: 1, wide: 1, standard: 1, compact: 1, tall: 1, full: 1,  rail: 1, detail: 1 },
};
```

Update `FOOTPRINT_MIN_COLUMN_SPANS` to match the same values above. Do not allow the min map to exceed mode column count.

## Minimum Inline Sizes

Update `FOOTPRINT_MIN_INLINE_SIZE_PX`:

```ts
export const FOOTPRINT_MIN_INLINE_SIZE_PX: Record<PccResponsiveMode, Record<PccCardFootprint, number>> = {
  ultrawide:       { hero: 320, wide: 280, standard: 240, compact: 200, tall: 220, full: 320, rail: 220, detail: 320 },
  desktop:         { hero: 320, wide: 280, standard: 240, compact: 200, tall: 220, full: 320, rail: 220, detail: 320 },
  largeLaptop:     { hero: 320, wide: 280, standard: 240, compact: 200, tall: 220, full: 320, rail: 220, detail: 320 },
  standardLaptop:  { hero: 300, wide: 260, standard: 220, compact: 190, tall: 210, full: 300, rail: 200, detail: 300 },
  smallLaptop:     { hero: 300, wide: 260, standard: 220, compact: 190, tall: 210, full: 300, rail: 190, detail: 280 },
  tabletLandscape: { hero: 260, wide: 230, standard: 210, compact: 180, tall: 190, full: 260, rail: 180, detail: 240 },
  tabletPortrait:  { hero: 220, wide: 200, standard: 200, compact: 168, tall: 168, full: 220, rail: 168, detail: 220 },
  phone:           { hero: 0,   wide: 0,   standard: 0,   compact: 0,   tall: 0,   full: 0,   rail: 0,   detail: 0 },
};
```

## Tests

Add tests that assert:

- `PCC_CARD_FOOTPRINTS` contains exactly eight values.
- Every footprint has a span in every mode.
- Every footprint has a min span in every mode.
- Every footprint has a min inline size in every mode.
- `resolveFootprintColumnSpan(mode, footprint) <= PCC_RESPONSIVE_COLUMNS[mode]`.
- `rail` is narrower than `wide` and `detail` at desktop/large laptop.
- `detail` is wider than `standard` at desktop/large laptop.
- phone resolves every footprint to span 1.
