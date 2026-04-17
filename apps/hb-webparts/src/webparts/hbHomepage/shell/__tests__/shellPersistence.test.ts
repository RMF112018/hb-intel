import { describe, it, expect } from 'vitest';
import {
  createDefaultPersistedState,
  hydratePersistedState,
  serializeShellState,
  applyOccupantVisibility,
} from '../shellPersistence.js';
import { parseShellLayout } from '../shellValidation.js';
import { DEFAULT_PRESET } from '../defaultPreset.js';

describe('createDefaultPersistedState', () => {
  it('produces a version-1 state with default preset', () => {
    const state = createDefaultPersistedState();
    expect(state.version).toBe(1);
    expect(state.presetId).toBe('default-v1');
  });
});

describe('serializeShellState', () => {
  it('round-trips through serialize and hydrate', () => {
    const layout = parseShellLayout({ presetId: 'editorial-focus-v1' });
    const persisted = serializeShellState(layout);
    const hydrated = hydratePersistedState(persisted);
    expect(hydrated.preset.id).toBe('editorial-focus-v1');
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
      presetId: 'default-v1',
    });
    expect(result.preset.id).toBe('default-v1');
    expect(result.diagnostics.filter((d) => d.severity === 'error')).toHaveLength(0);
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
