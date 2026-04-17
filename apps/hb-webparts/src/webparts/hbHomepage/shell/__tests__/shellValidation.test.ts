import { describe, it, expect } from 'vitest';
import { parseShellLayout, extractModuleConfigSlices, validatePresetStructure } from '../shellValidation.js';
import { DEFAULT_PRESET } from '../defaultPreset.js';
import { EDITORIAL_FOCUS_PRESET } from '../presetLibrary.js';

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
      presetId: 'default-v1',
      bandOverrides: [
        {
          bandId: 'band-communications-newsroom',
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

  it('validates the editorial-focus preset as structurally sound', () => {
    const result = validatePresetStructure(EDITORIAL_FOCUS_PRESET);
    expect(result.diagnostics.filter((d) => d.severity === 'error')).toHaveLength(0);
    expect(result.preset.id).toBe('editorial-focus-v1');
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

describe('extractModuleConfigSlices', () => {
  it('returns empty object for undefined config', () => {
    const result = extractModuleConfigSlices(undefined);
    expect(result).toEqual({});
  });

  it('extracts typed slices from raw config', () => {
    const config = {
      companyPulse: { listName: 'News' },
      leadershipMessage: { templateId: 'lm-1' },
      activeAudience: 'field',
      unrecognizedKey: 'ignored',
    };
    const result = extractModuleConfigSlices(config);
    expect(result.companyPulse).toEqual({ listName: 'News' });
    expect(result.leadershipMessage).toEqual({ templateId: 'lm-1' });
    expect(result.activeAudience).toBe('field');
  });

  it('handles non-string activeAudience gracefully', () => {
    const result = extractModuleConfigSlices({ activeAudience: 42 });
    expect(result.activeAudience).toBeUndefined();
  });
});
