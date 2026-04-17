import { describe, it, expect } from 'vitest';
import {
  createDefaultPersistedState,
  hydratePersistedState,
  serializeShellState,
  sanitizePersistedState,
  applyOccupantVisibility,
  migratePersistedState,
  previewPersistedState,
  PERSISTED_STATE_VERSION,
  PERSISTED_REJECTION_CODES,
  PERSISTED_POLICY_EXAMPLES,
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

  it('rejects hiding non-hideable occupants during hydration (surfaced as sanitization diagnostic)', () => {
    const result = hydratePersistedState({
      version: 1,
      presetId: 'default-v2',
      occupantVisibility: { 'hb-kudos': 'hidden' },
    });
    const kudosSlot = result.preset.bands
      .flatMap((b) => b.slots)
      .find((s) => s.id === 'slot-hb-kudos');
    expect(kudosSlot?.occupantId).toBe('hb-kudos');
    expect(
      result.diagnostics.some(
        (d) => d.code === 'PERSISTED_STATE_SANITIZED' && d.message.includes('hb-kudos'),
      ),
    ).toBe(true);
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

  it('detects AND strips prohibited-pairing overrides rather than passing them through', () => {
    const { sanitized, violations } = sanitizePersistedState({
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
    const people = sanitized.bandOverrides?.[0]?.slots?.find((s) => s.slotId === 's1');
    const kudos = sanitized.bandOverrides?.[0]?.slots?.find((s) => s.slotId === 's2');
    // First offender kept; second stripped to '' so parseShellLayout nulls it out.
    expect(people?.occupantId).toBe('people-culture-public');
    expect(kudos?.occupantId).toBe('');
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

describe('hydratePersistedState — diagnostic surfacing', () => {
  it('surfaces sanitization violations as ShellLayoutState diagnostics', () => {
    const result = hydratePersistedState({
      version: 1,
      presetId: 'rogue-preset',
    });
    const sanitizationDiagnostics = result.diagnostics.filter(
      (d) => d.code === 'PERSISTED_STATE_SANITIZED',
    );
    expect(sanitizationDiagnostics.length).toBeGreaterThan(0);
    expect(sanitizationDiagnostics[0].message).toContain('rogue-preset');
  });

  it('surfaces schema-rejection as a PERSISTED_STATE_SCHEMA_REJECTED error diagnostic', () => {
    const result = hydratePersistedState({ version: 1, presetId: 123 });
    const rejection = result.diagnostics.find(
      (d) => d.code === 'PERSISTED_STATE_SCHEMA_REJECTED',
    );
    expect(rejection).toBeDefined();
    expect(rejection?.severity).toBe('error');
  });

  it('surfaces unsupported-version as a PERSISTED_UNSUPPORTED_VERSION error diagnostic', () => {
    const result = hydratePersistedState({ version: 2, presetId: 'default-v2' });
    const rejection = result.diagnostics.find(
      (d) => d.code === 'PERSISTED_UNSUPPORTED_VERSION',
    );
    expect(rejection).toBeDefined();
    expect(rejection?.severity).toBe('error');
  });

  it('hydration strips prohibited pairings so runtime layout cannot hold the forbidden combo', () => {
    const result = hydratePersistedState({
      version: 1,
      presetId: 'default-v2',
      bandOverrides: [
        {
          bandId: 'band-people-culture',
          slots: [
            { slotId: 'slot-people-culture-public', occupantId: 'people-culture-public' },
            { slotId: 'slot-hb-kudos', occupantId: 'hb-kudos' },
          ],
        },
      ],
    });
    // Band `band-people-culture` does not exist in default preset, but
    // the proof is that sanitization violations surfaced and the
    // parsed layout does not contain a band with both occupants.
    expect(
      result.diagnostics.some((d) => d.code === 'PERSISTED_STATE_SANITIZED'),
    ).toBe(true);
    for (const band of result.preset.bands) {
      const occupants = band.slots.map((s) => s.occupantId).filter(Boolean);
      expect(
        occupants.includes('people-culture-public') && occupants.includes('hb-kudos'),
      ).toBe(false);
    }
  });
});

describe('shellValidation — override rejection diagnostics', () => {
  it('emits INVALID_OVERRIDE_ROLE for an unknown role override', async () => {
    const { parseShellLayout } = await import('../shellValidation.js');
    const result = parseShellLayout({
      presetId: 'default-v2',
      bandOverrides: [
        {
          bandId: 'band-operational-spotlight',
          slots: [{ slotId: 'slot-company-pulse', role: 'garbage-role' }],
        },
      ],
    });
    expect(result.diagnostics.some((d) => d.code === 'INVALID_OVERRIDE_ROLE')).toBe(true);
  });

  it('emits INVALID_OVERRIDE_COLUMN_SPAN for an unknown columnSpan override', async () => {
    const { parseShellLayout } = await import('../shellValidation.js');
    const result = parseShellLayout({
      presetId: 'default-v2',
      bandOverrides: [
        {
          bandId: 'band-operational-spotlight',
          slots: [{ slotId: 'slot-company-pulse', columnSpan: 'giant' }],
        },
      ],
    });
    expect(
      result.diagnostics.some((d) => d.code === 'INVALID_OVERRIDE_COLUMN_SPAN'),
    ).toBe(true);
  });
});

describe('migratePersistedState', () => {
  it('passes through v1 payloads unchanged', () => {
    const { migrated, rejection } = migratePersistedState({
      version: 1,
      presetId: 'default-v2',
    });
    expect(rejection).toBeUndefined();
    expect((migrated as { version: number }).version).toBe(1);
  });

  it('rejects newer-than-supported version with a typed rejection', () => {
    const { rejection } = migratePersistedState({ version: 99, presetId: 'default-v2' });
    expect(rejection?.code).toBe(PERSISTED_REJECTION_CODES.UNSUPPORTED_VERSION);
  });

  it('passes through non-object input (schema layer catches it later)', () => {
    const { migrated, rejection } = migratePersistedState('garbage');
    expect(migrated).toBe('garbage');
    expect(rejection).toBeUndefined();
  });
});

describe('previewPersistedState (dry-run)', () => {
  it('accepts the canonical allowed example', () => {
    const result = previewPersistedState(PERSISTED_POLICY_EXAMPLES.allowed);
    expect(result.accepted).toBe(true);
    expect(result.rejections).toHaveLength(0);
    expect(result.layoutState).toBeDefined();
  });

  it('rejects unknown-preset example with UNKNOWN_PRESET code', () => {
    const result = previewPersistedState(PERSISTED_POLICY_EXAMPLES.rejectedExamples.unknownPreset);
    expect(result.accepted).toBe(false);
    expect(result.rejections.some((r) => r.code === PERSISTED_REJECTION_CODES.UNKNOWN_PRESET)).toBe(true);
  });

  it('rejects prohibited-pairing example with PROHIBITED_PAIRING code', () => {
    const result = previewPersistedState(PERSISTED_POLICY_EXAMPLES.rejectedExamples.prohibitedPairing);
    expect(result.accepted).toBe(false);
    expect(result.rejections.some((r) => r.code === PERSISTED_REJECTION_CODES.PROHIBITED_PAIRING)).toBe(true);
  });

  it('rejects hiding a non-hideable occupant with VISIBILITY_NOT_ELIGIBLE', () => {
    const result = previewPersistedState(PERSISTED_POLICY_EXAMPLES.rejectedExamples.hidingNonHideable);
    expect(result.accepted).toBe(false);
    expect(result.rejections.some((r) => r.code === PERSISTED_REJECTION_CODES.VISIBILITY_NOT_ELIGIBLE)).toBe(true);
  });

  it('rejects unsupported-version example with UNSUPPORTED_VERSION', () => {
    const result = previewPersistedState(PERSISTED_POLICY_EXAMPLES.rejectedExamples.unsupportedVersion);
    expect(result.accepted).toBe(false);
    expect(result.rejections.some((r) => r.code === PERSISTED_REJECTION_CODES.UNSUPPORTED_VERSION)).toBe(true);
  });

  it('accepts undefined/null as no-op (default state)', () => {
    expect(previewPersistedState(undefined).accepted).toBe(true);
    expect(previewPersistedState(null).accepted).toBe(true);
  });

  it('is side-effect-free: calling it twice with the same input yields identical result', () => {
    const a = previewPersistedState(PERSISTED_POLICY_EXAMPLES.allowed);
    const b = previewPersistedState(PERSISTED_POLICY_EXAMPLES.allowed);
    expect(a.accepted).toBe(b.accepted);
    expect(a.rejections.length).toBe(b.rejections.length);
  });
});

describe('persisted rejection taxonomy coverage', () => {
  it('drops unknown occupant IDs in occupantVisibility with UNKNOWN_OCCUPANT code', () => {
    const { sanitized, rejections } = sanitizePersistedState({
      version: 1,
      presetId: 'default-v2',
      occupantVisibility: { 'not-a-real-occupant': 'hidden' },
    });
    expect(rejections.some((r) => r.code === PERSISTED_REJECTION_CODES.UNKNOWN_OCCUPANT)).toBe(true);
    expect(sanitized.occupantVisibility).toEqual({});
  });

  it('drops unknown occupant IDs in compactPreferences with UNKNOWN_OCCUPANT code', () => {
    const { rejections } = sanitizePersistedState({
      version: 1,
      presetId: 'default-v2',
      compactPreferences: { 'mystery-id': 'compact' },
    });
    expect(rejections.some((r) => r.code === PERSISTED_REJECTION_CODES.UNKNOWN_OCCUPANT)).toBe(true);
  });

  it('rejects visibility changes for non-hideable occupants', () => {
    const { sanitized, rejections } = sanitizePersistedState({
      version: 1,
      presetId: 'default-v2',
      occupantVisibility: { 'company-pulse': 'hidden' },
    });
    expect(rejections.some((r) => r.code === PERSISTED_REJECTION_CODES.VISIBILITY_NOT_ELIGIBLE)).toBe(true);
    expect(sanitized.occupantVisibility).toEqual({});
  });

  it('surfaces REORDER_DOMAIN_VIOLATION through previewPersistedState when applying the override', () => {
    const result = previewPersistedState({
      version: 1,
      presetId: 'default-v2',
      bandOverrides: [
        {
          bandId: 'band-operational-spotlight',
          slots: [
            {
              slotId: 'slot-project-portfolio-spotlight',
              occupantId: 'safety-field-excellence',
            },
          ],
        },
      ],
    });
    expect(result.accepted).toBe(false);
    expect(
      result.rejections.some((r) => r.code === PERSISTED_REJECTION_CODES.REORDER_DOMAIN_VIOLATION),
    ).toBe(true);
  });

  it('ensures all rejection codes are distinct and string-valued', () => {
    const values = Object.values(PERSISTED_REJECTION_CODES);
    expect(new Set(values).size).toBe(values.length);
    for (const v of values) expect(typeof v).toBe('string');
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
