import { readFileSync } from 'fs';
import { resolve } from 'path';
import { describe, expect, it } from 'vitest';
import { DEFAULT_PRESET } from '../defaultPreset.js';
import {
  COMPACT_LINEAR_PRESET,
  EDITORIAL_FOCUS_PRESET,
  OPERATIONS_SAFETY_PRESET,
} from '../presetLibrary.js';
import { parseShellLayout } from '../shellValidation.js';

const SHELL_CSS_PATH = resolve(__dirname, '../../HbHomepageShell.module.css');
const PAIRED_ROW_RULE_PATTERN =
  /\.bandPaired\s+\.span_major\s*,\s*\.bandPaired\s+\.span_minor\s*\{[^}]*\bgrid-row\s*:\s*1\s*;/s;

function getPairedBreakpointCssBlocks(): string[] {
  const css = readFileSync(SHELL_CSS_PATH, 'utf8');
  const breakpointNeedle = '@container homepage-shell (min-width: 940px)';
  const blocks: string[] = [];
  let searchFrom = 0;

  for (
    let breakpointStart = css.indexOf(breakpointNeedle, searchFrom);
    breakpointStart !== -1;
    breakpointStart = css.indexOf(breakpointNeedle, searchFrom)
  ) {
    const nextBreakpointStart = css.indexOf('@container', breakpointStart + breakpointNeedle.length);
    blocks.push(
      nextBreakpointStart === -1
        ? css.slice(breakpointStart)
        : css.slice(breakpointStart, nextBreakpointStart),
    );
    searchFrom = breakpointStart + breakpointNeedle.length;
  }

  return blocks;
}

describe('Safety homepage integration placement', () => {
  it('keeps safety as row-2 secondary in the default flagship flow', () => {
    const row2 = DEFAULT_PRESET.bands.find((band) => band.id === 'band-row-2-communications-newsroom');
    expect(row2).toBeDefined();
    expect(row2?.orientation).toBe('right-dominant');
    expect(row2?.slots).toHaveLength(2);

    const safetySlot = row2?.slots.find((slot) => slot.occupantId === 'safety-field-excellence');
    const pulseSlot = row2?.slots.find((slot) => slot.occupantId === 'company-pulse');
    expect(safetySlot?.role).toBe('secondary');
    expect(safetySlot?.columnSpan).toBe('minor');
    expect(pulseSlot?.role).toBe('primary');
    expect(pulseSlot?.columnSpan).toBe('major');
  });

  it('pins paired major and minor slots to the same grid row at the paired breakpoint', () => {
    const pairedBreakpointCssBlocks = getPairedBreakpointCssBlocks();

    expect(pairedBreakpointCssBlocks.length).toBeGreaterThan(0);
    expect(pairedBreakpointCssBlocks.some((block) => PAIRED_ROW_RULE_PATTERN.test(block))).toBe(true);
  });

  it('keeps named safety-bearing presets intentionally explicit', () => {
    const editorialSafetyBand = EDITORIAL_FOCUS_PRESET.bands.find((band) =>
      band.slots.some((slot) => slot.occupantId === 'safety-field-excellence'),
    );
    expect(editorialSafetyBand?.recipe).toBe('stacked-full');
    expect(editorialSafetyBand?.slots[0]?.role).toBe('primary');

    const operationsSafetyBand = OPERATIONS_SAFETY_PRESET.bands[0];
    expect(operationsSafetyBand.orientation).toBe('left-dominant');
    expect(
      operationsSafetyBand.slots.some(
        (slot) => slot.occupantId === 'safety-field-excellence' && slot.role === 'secondary',
      ),
    ).toBe(true);

    const compactSafetyBand = COMPACT_LINEAR_PRESET.bands.find((band) =>
      band.slots.some((slot) => slot.occupantId === 'safety-field-excellence'),
    );
    expect(compactSafetyBand?.recipe).toBe('stacked-full');
    expect(compactSafetyBand?.slots[0]?.role).toBe('primary');
  });

  it('keeps shell diagnostics clean for safety-bearing approved presets', () => {
    for (const presetId of ['default-v2', 'editorial-focus-v1', 'operations-safety-v1', 'compact-linear-v1']) {
      const result = parseShellLayout({ presetId });
      const errors = result.diagnostics.filter((diag) => diag.severity === 'error');
      expect(errors, `preset ${presetId} should not produce shell errors`).toHaveLength(0);
      expect(result.diagnostics.some((diag) => diag.code === 'NON_CANONICAL_EMPTY_BAND')).toBe(false);
    }
  });
});
