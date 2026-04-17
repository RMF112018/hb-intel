import { describe, it, expect } from 'vitest';
import {
  parseShellLayout,
  extractModuleConfigSlices,
  validatePresetStructure,
  previewShellLayout,
  previewBandOverride,
} from '../shellValidation.js';
import { DEFAULT_PRESET } from '../defaultPreset.js';
import {
  EDITORIAL_FOCUS_PRESET,
  OPERATIONS_SAFETY_PRESET,
  COMPACT_LINEAR_PRESET,
  APPROVED_PRESETS,
  describePreset,
  listApprovedPresets,
} from '../presetLibrary.js';

describe('parseShellLayout', () => {
  it('returns default preset when input is undefined', () => {
    const result = parseShellLayout(undefined);
    expect(result.preset.id).toBe(DEFAULT_PRESET.id);
    expect(result.normalizedFromDefault).toBe(true);
    expect(result.diagnostics.some((d) => d.code === 'NO_INPUT')).toBe(true);
  });

  it('returns default preset when input is null', () => {
    const result = parseShellLayout(null);
    expect(result.preset.id).toBe(DEFAULT_PRESET.id);
    expect(result.normalizedFromDefault).toBe(true);
  });

  it('resolves a known preset id', () => {
    const result = parseShellLayout({ presetId: 'editorial-focus-v1' });
    expect(result.preset.id).toBe('editorial-focus-v1');
    expect(result.diagnostics.filter((d) => d.severity === 'error')).toHaveLength(0);
  });

  it('resolves operations-safety preset', () => {
    const result = parseShellLayout({ presetId: 'operations-safety-v1' });
    expect(result.preset.id).toBe('operations-safety-v1');
    expect(result.diagnostics.filter((d) => d.severity === 'error')).toHaveLength(0);
  });

  it('resolves compact-linear preset', () => {
    const result = parseShellLayout({ presetId: 'compact-linear-v1' });
    expect(result.preset.id).toBe('compact-linear-v1');
    expect(result.diagnostics.filter((d) => d.severity === 'error')).toHaveLength(0);
  });

  it('falls back to default for unknown preset id', () => {
    const result = parseShellLayout({ presetId: 'nonexistent-preset' });
    expect(result.preset.id).toBe(DEFAULT_PRESET.id);
    expect(result.diagnostics.some((d) => d.code === 'UNKNOWN_PRESET')).toBe(true);
  });

  it('falls back to default for malformed input', () => {
    const result = parseShellLayout({ presetId: 123 });
    expect(result.preset.id).toBe(DEFAULT_PRESET.id);
    expect(result.diagnostics.some((d) => d.code === 'INVALID_LAYOUT_INPUT')).toBe(true);
  });

  it('normalizes band override with unknown occupant', () => {
    const result = parseShellLayout({
      presetId: 'default-v2',
      bandOverrides: [
        {
          bandId: 'band-operational-spotlight',
          slots: [{ slotId: 'slot-company-pulse', occupantId: 'fake-occupant' }],
        },
      ],
    });
    expect(result.diagnostics.some((d) => d.code === 'INVALID_OVERRIDE_OCCUPANT')).toBe(true);
  });
});

describe('validatePresetStructure', () => {
  it('validates the default preset as structurally sound', () => {
    const result = validatePresetStructure(DEFAULT_PRESET);
    expect(result.diagnostics.filter((d) => d.severity === 'error')).toHaveLength(0);
    expect(result.preset.id).toBe(DEFAULT_PRESET.id);
  });

  it('validates every approved preset as structurally sound', () => {
    for (const [id, preset] of APPROVED_PRESETS) {
      const result = validatePresetStructure(preset);
      expect(
        result.diagnostics.filter((d) => d.severity === 'error'),
        `preset "${id}" has structural errors`,
      ).toHaveLength(0);
    }
  });

  it('rejects a preset with missing required fields', () => {
    const result = validatePresetStructure({ id: '', bands: [] });
    expect(result.diagnostics.some((d) => d.severity === 'error')).toBe(true);
    expect(result.preset.id).toBe(DEFAULT_PRESET.id);
  });

  it('detects prohibited pairing in a preset', () => {
    const preset = {
      id: 'test-prohibited',
      title: 'Test',
      bands: [
        {
          id: 'band-test',
          semanticRole: 'people-culture',
          slots: [
            { id: 's1', occupantId: 'people-culture-public', role: 'primary', columnSpan: 'major' },
            { id: 's2', occupantId: 'hb-kudos', role: 'secondary', columnSpan: 'minor' },
          ],
          maxDominantOccupants: 1,
        },
      ],
    };
    const result = validatePresetStructure(preset);
    expect(result.diagnostics.some((d) => d.code === 'PROHIBITED_PAIRING')).toBe(true);
  });
});

describe('preset library', () => {
  it('has exactly four approved presets', () => {
    expect(APPROVED_PRESETS.size).toBe(4);
  });

  it('describePreset returns structured metadata', () => {
    const desc = describePreset(DEFAULT_PRESET);
    expect(desc.id).toBe('default-v2');
    expect(desc.bandCount).toBeGreaterThanOrEqual(5);
    expect(desc.occupantIds).toContain('project-portfolio-spotlight');
    expect(desc.occupantIds).toContain('safety-field-excellence');
  });

  it('listApprovedPresets returns all preset descriptions', () => {
    const list = listApprovedPresets();
    expect(list).toHaveLength(4);
    const ids = list.map((p) => p.id);
    expect(ids).toContain('default-v2');
    expect(ids).toContain('editorial-focus-v1');
    expect(ids).toContain('operations-safety-v1');
    expect(ids).toContain('compact-linear-v1');
  });

  it('compact-linear preset has zero paired bands', () => {
    const desc = describePreset(COMPACT_LINEAR_PRESET);
    expect(desc.pairedBandCount).toBe(0);
  });

  it('operations-safety preset pairs spotlight with safety in first band', () => {
    const firstBand = OPERATIONS_SAFETY_PRESET.bands[0];
    const occupants = firstBand.slots.map((s) => s.occupantId);
    expect(occupants).toContain('project-portfolio-spotlight');
    expect(occupants).toContain('safety-field-excellence');
  });
});

describe('previewShellLayout', () => {
  it('returns valid for a known preset', () => {
    const result = previewShellLayout({ presetId: 'default-v2' });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.summary).toContain('Valid');
  });

  it('returns invalid for malformed input', () => {
    const result = previewShellLayout({ presetId: 123 });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.summary).toContain('Invalid');
  });

  it('reports warnings for unknown preset', () => {
    const result = previewShellLayout({ presetId: 'custom-xyz' });
    expect(result.valid).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.summary).toContain('warning');
  });

  it('returns info for undefined input', () => {
    const result = previewShellLayout(undefined);
    expect(result.valid).toBe(true);
    expect(result.info.some((d) => d.code === 'NO_INPUT')).toBe(true);
  });
});

describe('previewBandOverride', () => {
  it('validates a valid slot change', () => {
    const result = previewBandOverride(
      'default-v2',
      'band-operational-spotlight',
      [{ slotId: 'slot-company-pulse', role: 'secondary' }],
    );
    expect(result.valid).toBe(true);
  });

  it('detects invalid occupant in slot change', () => {
    const result = previewBandOverride(
      'default-v2',
      'band-operational-spotlight',
      [{ slotId: 'slot-company-pulse', occupantId: 'nonexistent' }],
    );
    expect(result.warnings.some((w) => w.code === 'INVALID_OVERRIDE_OCCUPANT')).toBe(true);
  });
});

describe('extractModuleConfigSlices', () => {
  it('returns empty object for undefined config', () => {
    const result = extractModuleConfigSlices(undefined);
    expect(result).toEqual({});
  });

  it('extracts typed slices from raw config', () => {
    const config = {
      companyPulse: { listName: 'News' },
      leadershipMessage: { templateId: 'lm-1' },
      safetyFieldExcellence: { heading: 'Safety' },
      activeAudience: 'field',
      unrecognizedKey: 'ignored',
    };
    const result = extractModuleConfigSlices(config);
    expect(result.companyPulse).toEqual({ listName: 'News' });
    expect(result.leadershipMessage).toEqual({ templateId: 'lm-1' });
    expect(result.safetyFieldExcellence).toEqual({ heading: 'Safety' });
    expect(result.activeAudience).toBe('field');
  });

  it('handles non-string activeAudience gracefully', () => {
    const result = extractModuleConfigSlices({ activeAudience: 42 });
    expect(result.activeAudience).toBeUndefined();
  });
});
