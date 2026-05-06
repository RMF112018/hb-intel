import { describe, expect, it } from 'vitest';
import {
  FOOTPRINT_COLUMN_SPANS,
  FOOTPRINT_MIN_COLUMN_SPANS,
  FOOTPRINT_MIN_INLINE_SIZE_PX,
  PCC_CARD_FOOTPRINTS,
  PCC_RESPONSIVE_COLUMNS,
  PCC_RESPONSIVE_MODES,
  resolveFootprintColumnSpan,
} from './footprints';

/**
 * Acceptance harness for the wave-15A wave-b3 Prompt 03 footprint
 * expansion. Iterates the canonical ordered tuples (PCC_CARD_FOOTPRINTS
 * and PCC_RESPONSIVE_MODES) so any future addition to the union breaks
 * exhaustiveness here, not silently in a route surface.
 */
describe('footprints — rail and detail expansion', () => {
  it('PCC_CARD_FOOTPRINTS contains exactly eight values including rail and detail', () => {
    expect(PCC_CARD_FOOTPRINTS).toHaveLength(8);
    expect(PCC_CARD_FOOTPRINTS).toContain('rail');
    expect(PCC_CARD_FOOTPRINTS).toContain('detail');
  });

  it('every responsive mode has a span, min span, and min inline size for every footprint', () => {
    for (const mode of PCC_RESPONSIVE_MODES) {
      for (const footprint of PCC_CARD_FOOTPRINTS) {
        expect(
          FOOTPRINT_COLUMN_SPANS[mode][footprint],
          `column span missing for ${mode}/${footprint}`,
        ).toBeTypeOf('number');
        expect(
          FOOTPRINT_MIN_COLUMN_SPANS[mode][footprint],
          `min column span missing for ${mode}/${footprint}`,
        ).toBeTypeOf('number');
        expect(
          FOOTPRINT_MIN_INLINE_SIZE_PX[mode][footprint],
          `min inline size missing for ${mode}/${footprint}`,
        ).toBeTypeOf('number');
      }
    }
  });

  it('no footprint span (base or min) exceeds the mode column count, and resolveFootprintColumnSpan stays within the mode', () => {
    for (const mode of PCC_RESPONSIVE_MODES) {
      const modeColumns = PCC_RESPONSIVE_COLUMNS[mode];
      for (const footprint of PCC_CARD_FOOTPRINTS) {
        expect(
          FOOTPRINT_COLUMN_SPANS[mode][footprint],
          `base span too wide for ${mode}/${footprint}`,
        ).toBeLessThanOrEqual(modeColumns);
        expect(
          FOOTPRINT_MIN_COLUMN_SPANS[mode][footprint],
          `min span too wide for ${mode}/${footprint}`,
        ).toBeLessThanOrEqual(modeColumns);
        expect(
          resolveFootprintColumnSpan(mode, footprint),
          `resolveFootprintColumnSpan exceeds mode columns for ${mode}/${footprint}`,
        ).toBeLessThanOrEqual(modeColumns);
      }
    }
  });

  it('phone resolves every footprint to exactly one column', () => {
    for (const footprint of PCC_CARD_FOOTPRINTS) {
      expect(
        resolveFootprintColumnSpan('phone', footprint),
        `phone resolution wrong for ${footprint}`,
      ).toBe(1);
    }
  });

  it('phone min inline size is zero for every footprint (suppresses fixed-width clamp on phone)', () => {
    for (const footprint of PCC_CARD_FOOTPRINTS) {
      expect(
        FOOTPRINT_MIN_INLINE_SIZE_PX.phone[footprint],
        `phone min inline size should be 0 for ${footprint}`,
      ).toBe(0);
    }
  });

  it('rail is narrower than detail and wide at desktop, largeLaptop, and ultrawide', () => {
    for (const mode of ['desktop', 'largeLaptop', 'ultrawide'] as const) {
      const rail = resolveFootprintColumnSpan(mode, 'rail');
      const detail = resolveFootprintColumnSpan(mode, 'detail');
      const wide = resolveFootprintColumnSpan(mode, 'wide');
      expect(rail, `rail should be narrower than detail at ${mode}`).toBeLessThan(detail);
      expect(rail, `rail should be narrower than wide at ${mode}`).toBeLessThan(wide);
    }
  });

  it('detail is wider than standard at desktop, largeLaptop, and ultrawide', () => {
    for (const mode of ['desktop', 'largeLaptop', 'ultrawide'] as const) {
      const detail = resolveFootprintColumnSpan(mode, 'detail');
      const standard = resolveFootprintColumnSpan(mode, 'standard');
      expect(detail, `detail should be wider than standard at ${mode}`).toBeGreaterThan(standard);
    }
  });

  it('resolveFootprintColumnSpan returns the spec values for rail and detail at desktop', () => {
    // Spec column-span block (05_FOOTPRINT_RAIL_DETAIL_SPAN_SPEC.md):
    //   desktop: { ..., rail: 3, detail: 8 }.
    // Min-span at desktop is the same per the spec, so resolve === base.
    expect(resolveFootprintColumnSpan('desktop', 'rail')).toBe(3);
    expect(resolveFootprintColumnSpan('desktop', 'detail')).toBe(8);
  });
});
