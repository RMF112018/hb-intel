import { describe, it, expect } from 'vitest';
import {
  DEFAULT_HOMEPAGE_EDGE_POLICY,
  EDGE_BLEED_ELIGIBLE_OCCUPANTS,
  isEdgeBleedEligibleOccupant,
  resolveShellBandLayoutMode,
  resolveShellSlotEdgeBleed,
  resolveShellSlotVisualSide,
} from '../edgeContract.js';

describe('edgeContract — default policy', () => {
  it('default policy keeps hosted output unchanged (standard / none)', () => {
    expect(DEFAULT_HOMEPAGE_EDGE_POLICY).toEqual({ edgeMode: 'standard', heroEdge: 'none' });
  });

  it('only the three Foleon-served lanes are edge-bleed eligible', () => {
    expect(Array.from(EDGE_BLEED_ELIGIBLE_OCCUPANTS).sort()).toEqual([
      'company-pulse',
      'leadership-message',
      'project-portfolio-spotlight',
    ]);
  });

  it.each([
    ['safety-field-excellence', false],
    ['hb-kudos', false],
    ['people-culture-public', false],
    ['project-portfolio-spotlight', true],
    ['company-pulse', true],
    ['leadership-message', true],
  ] as const)('isEdgeBleedEligibleOccupant(%s) === %s', (occupantId, expected) => {
    expect(isEdgeBleedEligibleOccupant(occupantId)).toBe(expected);
  });

  it('rejects null/undefined occupants', () => {
    expect(isEdgeBleedEligibleOccupant(null)).toBe(false);
    expect(isEdgeBleedEligibleOccupant(undefined)).toBe(false);
  });
});

describe('edgeContract — resolveShellBandLayoutMode', () => {
  it('paired when columns === 2', () => {
    expect(resolveShellBandLayoutMode(2)).toBe('paired');
  });

  it('stacked when columns === 1', () => {
    expect(resolveShellBandLayoutMode(1)).toBe('stacked');
  });
});

describe('edgeContract — resolveShellSlotVisualSide', () => {
  it('stacked / one-column resolves to full regardless of span/orientation', () => {
    expect(
      resolveShellSlotVisualSide({
        columns: 1,
        orientation: 'left-dominant',
        effectiveColumnSpan: 'major',
      }),
    ).toBe('full');
    expect(
      resolveShellSlotVisualSide({
        columns: 1,
        orientation: 'right-dominant',
        effectiveColumnSpan: 'minor',
      }),
    ).toBe('full');
    expect(
      resolveShellSlotVisualSide({
        columns: 1,
        orientation: 'left-dominant',
        effectiveColumnSpan: 'full',
      }),
    ).toBe('full');
  });

  it('left-dominant + major resolves to left', () => {
    expect(
      resolveShellSlotVisualSide({
        columns: 2,
        orientation: 'left-dominant',
        effectiveColumnSpan: 'major',
      }),
    ).toBe('left');
  });

  it('left-dominant + minor resolves to right', () => {
    expect(
      resolveShellSlotVisualSide({
        columns: 2,
        orientation: 'left-dominant',
        effectiveColumnSpan: 'minor',
      }),
    ).toBe('right');
  });

  it('right-dominant + major resolves to right (independent of DOM order)', () => {
    expect(
      resolveShellSlotVisualSide({
        columns: 2,
        orientation: 'right-dominant',
        effectiveColumnSpan: 'major',
      }),
    ).toBe('right');
  });

  it('right-dominant + minor resolves to left', () => {
    expect(
      resolveShellSlotVisualSide({
        columns: 2,
        orientation: 'right-dominant',
        effectiveColumnSpan: 'minor',
      }),
    ).toBe('left');
  });

  it('full span resolves to full even in paired layout', () => {
    expect(
      resolveShellSlotVisualSide({
        columns: 2,
        orientation: 'left-dominant',
        effectiveColumnSpan: 'full',
      }),
    ).toBe('full');
  });
});

describe('edgeContract — resolveShellSlotEdgeBleed', () => {
  it('eligible occupant + visual-side=left resolves to left', () => {
    expect(
      resolveShellSlotEdgeBleed({
        occupantId: 'project-portfolio-spotlight',
        visualSide: 'left',
      }),
    ).toBe('left');
  });

  it('eligible occupant + visual-side=right resolves to right', () => {
    expect(
      resolveShellSlotEdgeBleed({
        occupantId: 'company-pulse',
        visualSide: 'right',
      }),
    ).toBe('right');
  });

  it('eligible occupant + visual-side=full resolves to both', () => {
    expect(
      resolveShellSlotEdgeBleed({
        occupantId: 'leadership-message',
        visualSide: 'full',
      }),
    ).toBe('both');
  });

  it.each(['safety-field-excellence', 'hb-kudos', 'people-culture-public'] as const)(
    'non-eligible occupant %s resolves to none on every visual side',
    (occupantId) => {
      for (const visualSide of ['left', 'right', 'full'] as const) {
        expect(
          resolveShellSlotEdgeBleed({ occupantId, visualSide }),
        ).toBe('none');
      }
    },
  );

  it('null/undefined occupant resolves to none', () => {
    expect(resolveShellSlotEdgeBleed({ occupantId: null, visualSide: 'left' })).toBe('none');
    expect(resolveShellSlotEdgeBleed({ occupantId: undefined, visualSide: 'full' })).toBe('none');
  });
});

describe('edgeContract — preset-derived row scenarios', () => {
  // Mirrors DEFAULT_PRESET (apps/hb-webparts/src/webparts/hbHomepage/shell/defaultPreset.ts).
  // Asserting the visual-side + edge-bleed combination per row guards against
  // silent drift when orientation or column-span changes.

  it('Row 1 (left-dominant, project-portfolio-spotlight major) — paired ⇒ left/left, stacked ⇒ full/both', () => {
    const paired = resolveShellSlotVisualSide({
      columns: 2,
      orientation: 'left-dominant',
      effectiveColumnSpan: 'major',
    });
    expect(paired).toBe('left');
    expect(
      resolveShellSlotEdgeBleed({
        occupantId: 'project-portfolio-spotlight',
        visualSide: paired,
      }),
    ).toBe('left');

    const stacked = resolveShellSlotVisualSide({
      columns: 1,
      orientation: 'left-dominant',
      effectiveColumnSpan: 'major',
    });
    expect(stacked).toBe('full');
    expect(
      resolveShellSlotEdgeBleed({
        occupantId: 'project-portfolio-spotlight',
        visualSide: stacked,
      }),
    ).toBe('both');
  });

  it('Row 2 (right-dominant, company-pulse major) — paired ⇒ right/right, stacked ⇒ full/both', () => {
    const paired = resolveShellSlotVisualSide({
      columns: 2,
      orientation: 'right-dominant',
      effectiveColumnSpan: 'major',
    });
    expect(paired).toBe('right');
    expect(
      resolveShellSlotEdgeBleed({
        occupantId: 'company-pulse',
        visualSide: paired,
      }),
    ).toBe('right');

    const stacked = resolveShellSlotVisualSide({
      columns: 1,
      orientation: 'right-dominant',
      effectiveColumnSpan: 'major',
    });
    expect(stacked).toBe('full');
    expect(
      resolveShellSlotEdgeBleed({
        occupantId: 'company-pulse',
        visualSide: stacked,
      }),
    ).toBe('both');
  });

  it('Row 3 (left-dominant, leadership-message major) — paired ⇒ left/left, stacked ⇒ full/both', () => {
    const paired = resolveShellSlotVisualSide({
      columns: 2,
      orientation: 'left-dominant',
      effectiveColumnSpan: 'major',
    });
    expect(paired).toBe('left');
    expect(
      resolveShellSlotEdgeBleed({
        occupantId: 'leadership-message',
        visualSide: paired,
      }),
    ).toBe('left');

    const stacked = resolveShellSlotVisualSide({
      columns: 1,
      orientation: 'left-dominant',
      effectiveColumnSpan: 'major',
    });
    expect(stacked).toBe('full');
    expect(
      resolveShellSlotEdgeBleed({
        occupantId: 'leadership-message',
        visualSide: stacked,
      }),
    ).toBe('both');
  });

  it('Row 2 minor (safety-field-excellence in left visual column) ⇒ none', () => {
    const visualSide = resolveShellSlotVisualSide({
      columns: 2,
      orientation: 'right-dominant',
      effectiveColumnSpan: 'minor',
    });
    expect(visualSide).toBe('left');
    expect(
      resolveShellSlotEdgeBleed({
        occupantId: 'safety-field-excellence',
        visualSide,
      }),
    ).toBe('none');
  });

  it('Row 1 minor (hb-kudos in right visual column) ⇒ none', () => {
    const visualSide = resolveShellSlotVisualSide({
      columns: 2,
      orientation: 'left-dominant',
      effectiveColumnSpan: 'minor',
    });
    expect(visualSide).toBe('right');
    expect(
      resolveShellSlotEdgeBleed({ occupantId: 'hb-kudos', visualSide }),
    ).toBe('none');
  });

  it('Row 3 minor (people-culture-public in right visual column) ⇒ none', () => {
    const visualSide = resolveShellSlotVisualSide({
      columns: 2,
      orientation: 'left-dominant',
      effectiveColumnSpan: 'minor',
    });
    expect(visualSide).toBe('right');
    expect(
      resolveShellSlotEdgeBleed({ occupantId: 'people-culture-public', visualSide }),
    ).toBe('none');
  });
});
