import { describe, it, expect } from 'vitest';
import {
  createDefaultPersistedState,
  hydratePersistedState,
  serializeShellState,
  sanitizePersistedState,
  applyOccupantVisibility,
  PERSISTED_STATE_VERSION,
  GOVERNANCE_BOUNDARY,
} from '../shellPersistence.js';
import { parseShellLayout } from '../shellValidation.js';
import { DEFAULT_PRESET } from '../defaultPreset.js';

describe('createDefaultPersistedState', () => {
  it('produces a versioned state with default preset', () => {
    const state = createDefaultPersistedState();
    expect(state.version).toBe(PERSISTED_STATE_VERSION);
    expect(state.presetId).toBe('default-v2');
  });
});

describe('serializeShellState', () => {
  it('round-trips through serialize and hydrate', () => {
    const layout = parseShellLayout({ presetId: 'editorial-focus-v1' });
    const persisted = serializeShellState(layout);
    const hydrated = hydratePersistedState(persisted);
    expect(hydrated.preset.id).toBe('editorial-focus-v1');
  });

  it('serializes occupant visibility and compact preferences', () => {
    const layout = parseShellLayout(undefined);
    const persisted = serializeShellState(layout, {
      occupantVisibility: { 'hb-kudos': 'hidden' },
      compactPreferences: { 'company-pulse': 'compact' },
    });
    expect(persisted.occupantVisibility).toEqual({ 'hb-kudos': 'hidden' });
    expect(persisted.compactPreferences).toEqual({ 'company-pulse': 'compact' });
  });
});

describe('hydratePersistedState', () => {
  it('returns default for null input', () => {
    const result = hydratePersistedState(null);
    expect(result.preset.id).toBe(DEFAULT_PRESET.id);
  });

  it('returns default for malformed input', () => {
    const result = hydratePersistedState({ version: 2, presetId: 123 });
    expect(result.preset.id).toBe(DEFAULT_PRESET.id);
  });

  it('returns default for completely invalid input', () => {
    const result = hydratePersistedState('garbage');
    expect(result.preset.id).toBe(DEFAULT_PRESET.id);
  });

  it('hydrates valid persisted state', () => {
    const result = hydratePersistedState({
      version: 1,
      presetId: 'default-v2',
    });
    expect(result.preset.id).toBe('default-v2');
    expect(result.diagnostics.filter((d) => d.severity === 'error')).toHaveLength(0);
  });

  it('applies occupant visibility during hydration', () => {
    const result = hydratePersistedState({
      version: 1,
      presetId: 'default-v2',
      occupantVisibility: { 'hb-kudos': 'hidden' },
    });
    const kudosSlot = result.preset.bands
      .flatMap((b) => b.slots)
      .find((s) => s.id === 'slot-hb-kudos');
    expect(kudosSlot?.occupantId).toBeNull();
  });

  it('sanitizes unknown preset to default', () => {
    const result = hydratePersistedState({
      version: 1,
      presetId: 'unknown-preset-xyz',
    });
    expect(result.preset.id).toBe(DEFAULT_PRESET.id);
  });
});

describe('sanitizePersistedState', () => {
  it('passes through valid state with no violations', () => {
    const input = createDefaultPersistedState();
    const { sanitized, violations } = sanitizePersistedState(input);
    expect(violations).toHaveLength(0);
    expect(sanitized.presetId).toBe('default-v2');
  });

  it('rejects unapproved preset', () => {
    const { sanitized, violations } = sanitizePersistedState({
      version: 1,
      presetId: 'rogue-preset',
    });
    expect(violations.length).toBeGreaterThan(0);
    expect(violations[0]).toContain('rogue-preset');
    expect(sanitized.presetId).toBe('default-v2');
  });

  it('detects prohibited pairing in band overrides', () => {
    const { violations } = sanitizePersistedState({
      version: 1,
      presetId: 'default-v2',
      bandOverrides: [
        {
          bandId: 'band-people-culture',
          slots: [
            { slotId: 's1', occupantId: 'people-culture-public' },
            { slotId: 's2', occupantId: 'hb-kudos' },
          ],
        },
      ],
    });
    expect(violations.some((v) => v.includes('prohibited pairing'))).toBe(true);
  });

  it('does not flag valid overrides', () => {
    const { violations } = sanitizePersistedState({
      version: 1,
      presetId: 'default-v2',
      bandOverrides: [
        {
          bandId: 'band-operational-spotlight',
          slots: [
            { slotId: 'slot-company-pulse', role: 'secondary' },
          ],
        },
      ],
    });
    expect(violations).toHaveLength(0);
  });
});

describe('applyOccupantVisibility', () => {
  it('hides occupants marked hidden', () => {
    const layout = parseShellLayout(undefined);
    const result = applyOccupantVisibility(layout, { 'hb-kudos': 'hidden' });
    const kudosSlot = result.preset.bands
      .flatMap((b) => b.slots)
      .find((s) => s.id === 'slot-hb-kudos');
    expect(kudosSlot?.occupantId).toBeNull();
  });

  it('preserves visible occupants', () => {
    const layout = parseShellLayout(undefined);
    const result = applyOccupantVisibility(layout, { 'company-pulse': 'visible' });
    const cpSlot = result.preset.bands
      .flatMap((b) => b.slots)
      .find((s) => s.id === 'slot-company-pulse');
    expect(cpSlot?.occupantId).toBe('company-pulse');
  });

  it('returns unchanged state when visibility is undefined', () => {
    const layout = parseShellLayout(undefined);
    const result = applyOccupantVisibility(layout, undefined);
    expect(result).toBe(layout);
  });
});

describe('GOVERNANCE_BOUNDARY', () => {
  it('documents system-authored decisions', () => {
    const sa = GOVERNANCE_BOUNDARY.systemAuthored;
    expect(sa.protectedEntryStateRules).toContain('phoneForceSingleColumn');
    expect(sa.protectedEntryStateRules).toContain('firstLaneMustBeginOnFirstView');
    expect(sa.prohibitedPairings).toEqual([['people-culture-public', 'hb-kudos']]);
    expect(sa.protectedBandSemantics).toHaveLength(5);
    expect(sa.maxDominantPerBand).toBe(1);
  });

  it('documents configurable decisions', () => {
    const cfg = GOVERNANCE_BOUNDARY.configurableByFutureControlPanel;
    expect(cfg.presetSelection).toBeDefined();
    expect(cfg.occupantVisibility).toBeDefined();
    expect(cfg.compactPreferences).toBeDefined();
    expect(cfg.limitedBandOverrides).toBeDefined();
  });
});
