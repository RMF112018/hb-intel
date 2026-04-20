import { describe, it, expect } from 'vitest';
import { DEFAULT_PRESET } from '../defaultPreset.js';
import { parseShellLayout, validatePresetStructure } from '../shellValidation.js';
import type { OccupantId } from '../shellTypes.js';

/**
 * Phase-11 Wave-01 Prompt-01 closure proof.
 *
 * Pins the locked three-row flagship composition below the launcher.
 * Handedness rendering, column-template CSS, and ratio behavior are
 * Prompt-02's domain; this suite only asserts preset identity.
 */
describe('DEFAULT_PRESET — locked three-row flagship composition', () => {
  it('emits exactly three bands in the locked order', () => {
    expect(DEFAULT_PRESET.bands).toHaveLength(3);
    expect(DEFAULT_PRESET.bands.map((b) => b.id)).toEqual([
      'band-row-1-operational-spotlight',
      'band-row-2-communications-newsroom',
      'band-row-3-communications-editorial',
    ]);
  });

  it('Row 1 pairs Project Portfolio Spotlight (major) with HB Kudos (minor), left-dominant', () => {
    const row = DEFAULT_PRESET.bands[0];
    expect(row.semanticRole).toBe('operational-spotlight');
    expect(row.recipe).toBe('feature-pair');
    expect(row.orientation).toBe('left-dominant');
    expect(row.slots).toHaveLength(2);
    expect(row.slots[0]).toMatchObject({
      occupantId: 'project-portfolio-spotlight',
      role: 'primary',
      columnSpan: 'major',
    });
    expect(row.slots[1]).toMatchObject({
      occupantId: 'hb-kudos',
      role: 'secondary',
      columnSpan: 'minor',
    });
  });

  it('Row 2 pairs Safety (minor) with Company Pulse (major), right-dominant', () => {
    const row = DEFAULT_PRESET.bands[1];
    expect(row.semanticRole).toBe('communications-newsroom');
    expect(row.recipe).toBe('feature-pair');
    expect(row.orientation).toBe('right-dominant');
    expect(row.slots).toHaveLength(2);
    expect(row.slots[0]).toMatchObject({
      occupantId: 'safety-field-excellence',
      role: 'secondary',
      columnSpan: 'minor',
    });
    expect(row.slots[1]).toMatchObject({
      occupantId: 'company-pulse',
      role: 'primary',
      columnSpan: 'major',
    });
  });

  it('Row 3 pairs Leadership Message (major) with People & Culture Public (minor), left-dominant', () => {
    const row = DEFAULT_PRESET.bands[2];
    expect(row.semanticRole).toBe('communications-editorial');
    expect(row.recipe).toBe('asymmetric-two-up');
    expect(row.orientation).toBe('left-dominant');
    expect(row.slots).toHaveLength(2);
    expect(row.slots[0]).toMatchObject({
      occupantId: 'leadership-message',
      role: 'primary',
      columnSpan: 'major',
    });
    expect(row.slots[1]).toMatchObject({
      occupantId: 'people-culture-public',
      role: 'secondary',
      columnSpan: 'minor',
    });
  });

  it('renders each of the six approved occupants exactly once', () => {
    const occupants = DEFAULT_PRESET.bands
      .flatMap((b) => b.slots)
      .map((s) => s.occupantId)
      .filter((id): id is OccupantId => id !== null);
    expect(occupants).toHaveLength(6);
    expect(new Set(occupants).size).toBe(6);
    expect(new Set(occupants)).toEqual(
      new Set<OccupantId>([
        'project-portfolio-spotlight',
        'hb-kudos',
        'safety-field-excellence',
        'company-pulse',
        'leadership-message',
        'people-culture-public',
      ]),
    );
  });

  it('introduces no additional occupants beyond the approved six', () => {
    const occupants = DEFAULT_PRESET.bands
      .flatMap((b) => b.slots)
      .map((s) => s.occupantId);
    for (const id of occupants) {
      expect(id).not.toBeNull();
    }
  });

  it('passes preset-structure validation with zero errors', () => {
    const result = validatePresetStructure(DEFAULT_PRESET);
    const errors = result.diagnostics.filter((d) => d.severity === 'error');
    expect(errors, `unexpected errors: ${JSON.stringify(errors)}`).toHaveLength(0);
  });

  it('parses as the default shell layout with zero errors', () => {
    const result = parseShellLayout({ presetId: 'default-v2' });
    const errors = result.diagnostics.filter((d) => d.severity === 'error');
    expect(errors, `unexpected errors: ${JSON.stringify(errors)}`).toHaveLength(0);
    expect(result.preset.id).toBe('default-v2');
  });
});
