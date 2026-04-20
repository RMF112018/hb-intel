import { describe, it, expect } from 'vitest';
import { DEFAULT_PRESET } from '../defaultPreset.js';
import { effectiveBandOrientation } from '../shellTypes.js';
import { validatePresetStructure } from '../shellValidation.js';
import { resolveBandLayout } from '../slotComfortResolver.js';
import { resolveShellConformance, toShellConformanceDataAttributes } from '../shellConformance.js';
import { getEntryState } from '../breakpointPolicy.js';
import type { ShellBand } from '../shellTypes.js';

describe('effectiveBandOrientation', () => {
  it('returns the declared orientation when present', () => {
    const row2 = DEFAULT_PRESET.bands[1];
    expect(row2.orientation).toBe('right-dominant');
    expect(effectiveBandOrientation(row2)).toBe('right-dominant');
  });

  it('defaults to left-dominant for undeclared bands', () => {
    const legacyBand: ShellBand = {
      id: 'band-legacy',
      semanticRole: 'communications-newsroom',
      recipe: 'feature-pair',
      slots: [
        { id: 's1', occupantId: 'company-pulse', role: 'primary', columnSpan: 'major' },
        { id: 's2', occupantId: 'leadership-message', role: 'secondary', columnSpan: 'minor' },
      ],
      maxDominantOccupants: 1,
    };
    expect(legacyBand.orientation).toBeUndefined();
    expect(effectiveBandOrientation(legacyBand)).toBe('left-dominant');
  });
});

describe('ORIENTATION_IGNORED_FOR_STACKED_BAND diagnostic', () => {
  it('fires as an info-level diagnostic when a stacked-full band declares orientation', () => {
    const preset = {
      id: 'test-orientation-on-stacked',
      title: 'Test',
      bands: [
        {
          id: 'band-stacked-with-orientation',
          semanticRole: 'recognition',
          recipe: 'stacked-full',
          orientation: 'right-dominant',
          slots: [
            { id: 's1', occupantId: 'hb-kudos', role: 'primary', columnSpan: 'full' },
          ],
          maxDominantOccupants: 1,
        },
      ],
    };
    const result = validatePresetStructure(preset);
    expect(
      result.diagnostics.some(
        (d) => d.code === 'ORIENTATION_IGNORED_FOR_STACKED_BAND' && d.severity === 'info',
      ),
    ).toBe(true);
  });

  it('does not fire for stacked bands without orientation', () => {
    const preset = {
      id: 'test-clean-stacked',
      title: 'Test',
      bands: [
        {
          id: 'band-clean-stacked',
          semanticRole: 'recognition',
          recipe: 'stacked-full',
          slots: [
            { id: 's1', occupantId: 'hb-kudos', role: 'primary', columnSpan: 'full' },
          ],
          maxDominantOccupants: 1,
        },
      ],
    };
    const result = validatePresetStructure(preset);
    expect(
      result.diagnostics.some((d) => d.code === 'ORIENTATION_IGNORED_FOR_STACKED_BAND'),
    ).toBe(false);
  });
});

describe('slot-width math honors the Prompt-02 2:1 ratio', () => {
  it('drives pairing comfort using 2/3 major and 1/3 minor at wide desktop widths', () => {
    // At 1800px container the major slot resolves to 1200px (≈ 2/3) and the
    // minor slot resolves to 600px (≈ 1/3). Row 1 comfort thresholds
    // (PPS 560 paired / HB Kudos 520 paired) are easily satisfied.
    const entry = getEntryState('ultrawide-desktop')!;
    const layout = resolveBandLayout(DEFAULT_PRESET.bands[0], entry, true, 1800);
    expect(layout.columns).toBe(2);
    expect(layout.pairingDecision.reason).toBe('paired');
  });

  it('still force-stacks when the minor 1/3 slot falls below the occupant narrowest-stable-paired threshold', () => {
    // At 1500px container the minor slot is ~500px — below PCP's
    // narrowest-stable-paired width (720). Row 3 must fall back to stack.
    const entry = getEntryState('standard-laptop')!;
    const layout = resolveBandLayout(DEFAULT_PRESET.bands[2], entry, false, 1500);
    expect(layout.columns).toBe(1);
  });
});

describe('shellConformance surfaces orientation', () => {
  it('reports right-dominant for Row 2 and left-dominant for Row 1 when paired', () => {
    const entry = getEntryState('ultrawide-desktop')!;
    const layouts = DEFAULT_PRESET.bands.map((b, i) =>
      resolveBandLayout(b, entry, i === 0, 1800),
    );
    const report = resolveShellConformance({
      bands: DEFAULT_PRESET.bands,
      bandLayouts: layouts,
      entryState: entry,
      shortHeightConstrained: false,
    });
    expect(report.bands[0].orientation).toBe('left-dominant');
    expect(report.bands[1].orientation).toBe('right-dominant');

    const attrs = toShellConformanceDataAttributes(report);
    expect(attrs['data-shell-band-orientations']).toContain('right-dominant');
    expect(attrs['data-shell-band-orientations'].startsWith('left-dominant')).toBe(true);
  });

  it('reports "stacked" on bands that collapse to a single column', () => {
    const entry = getEntryState('phone-portrait')!;
    const layouts = DEFAULT_PRESET.bands.map((b, i) =>
      resolveBandLayout(b, entry, i === 0, 400),
    );
    const report = resolveShellConformance({
      bands: DEFAULT_PRESET.bands,
      bandLayouts: layouts,
      entryState: entry,
      shortHeightConstrained: false,
    });
    for (const band of report.bands) {
      expect(band.columns).toBe(1);
      expect(band.orientation).toBe('stacked');
    }
    const attrs = toShellConformanceDataAttributes(report);
    expect(attrs['data-shell-band-orientations']).toBe('stacked,stacked,stacked');
  });
});
