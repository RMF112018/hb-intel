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
  validatePresetCanonicalSemantics,
  PRESET_CANONICAL_POLICY,
  PRESET_MUTATION_PERMISSIONS,
} from '../presetLibrary.js';
import type { ShellPreset } from '../shellTypes.js';
import {
  getGovernanceCategory,
  isBoundedConfigurable,
  SHELL_GOVERNANCE_MODEL,
} from '../protectedDecisions.js';
import { getOccupantGovernance } from '../occupantRegistry.js';

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
          bandId: 'band-row-2-communications-newsroom',
          slots: [{ slotId: 'slot-row-2-company-pulse', occupantId: 'fake-occupant' }],
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

  it('detects band-semantic incompatibility for an occupant placed in a disallowed band', () => {
    // After Wave-01 Prompt-01 retired the PCP↔HB-Kudos prohibited pairing,
    // governance still enforces `allowedBandSemantics`. HB Kudos is not
    // allowed in `communications-editorial`, so a synthesized preset must
    // still surface OCCUPANT_BAND_INCOMPATIBLE.
    const preset = {
      id: 'test-band-incompatible',
      title: 'Test',
      bands: [
        {
          id: 'band-test',
          semanticRole: 'communications-editorial',
          recipe: 'asymmetric-two-up',
          slots: [
            { id: 's1', occupantId: 'leadership-message', role: 'primary', columnSpan: 'major' },
            { id: 's2', occupantId: 'hb-kudos', role: 'secondary', columnSpan: 'minor' },
          ],
          maxDominantOccupants: 1,
        },
      ],
    };
    const result = validatePresetStructure(preset);
    expect(result.diagnostics.some((d) => d.code === 'OCCUPANT_BAND_INCOMPATIBLE')).toBe(true);
  });
});

describe('preset library', () => {
  it('has exactly four approved presets', () => {
    expect(APPROVED_PRESETS.size).toBe(4);
  });

  it('describePreset returns structured metadata', () => {
    const desc = describePreset(DEFAULT_PRESET);
    expect(desc.id).toBe('default-v2');
    expect(desc.bandCount).toBe(3);
    expect(desc.pairedBandCount).toBe(3);
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
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === 'UNKNOWN_PRESET')).toBe(true);
    expect(result.summary).toContain('Invalid');
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
      'band-row-2-communications-newsroom',
      [{ slotId: 'slot-row-2-company-pulse', role: 'secondary' }],
    );
    expect(result.valid).toBe(true);
  });

  it('detects invalid occupant in slot change', () => {
    const result = previewBandOverride(
      'default-v2',
      'band-row-2-communications-newsroom',
      [{ slotId: 'slot-row-2-company-pulse', occupantId: 'nonexistent' }],
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === 'INVALID_OVERRIDE_OCCUPANT')).toBe(true);
  });

  it('fails deterministically for unknown band override targets', () => {
    const result = previewBandOverride('default-v2', 'band-does-not-exist', [
      { slotId: 'slot-row-2-company-pulse', role: 'secondary' },
    ]);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === 'UNKNOWN_BAND_OVERRIDE')).toBe(true);
  });

  it('fails deterministically for unknown slot override targets', () => {
    const result = previewBandOverride('default-v2', 'band-row-2-communications-newsroom', [
      { slotId: 'slot-does-not-exist', role: 'secondary' },
    ]);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === 'UNKNOWN_SLOT_OVERRIDE')).toBe(true);
  });
});

describe('governance model', () => {
  it('exposes SHELL_GOVERNANCE_MODEL with four discriminated buckets', () => {
    expect(SHELL_GOVERNANCE_MODEL.protected).toBeDefined();
    expect(SHELL_GOVERNANCE_MODEL.entryStateRules).toBeDefined();
    expect(SHELL_GOVERNANCE_MODEL.configurable).toBeDefined();
    expect(SHELL_GOVERNANCE_MODEL.descriptors.shellFit.length).toBeGreaterThan(0);
    expect(SHELL_GOVERNANCE_MODEL.descriptors.descriptive.length).toBeGreaterThan(0);
  });

  it('classifies protected decision keys as protected', () => {
    expect(getGovernanceCategory('postHeroBoundary')).toBe('protected');
    expect(getGovernanceCategory('maxDominantPerBand')).toBe('protected');
    expect(getGovernanceCategory('tabletPortraitForceSingleColumn')).toBe('protected');
  });

  it('classifies configurable keys as bounded-configurable', () => {
    expect(getGovernanceCategory('presetSelection')).toBe('bounded-configurable');
    expect(getGovernanceCategory('optionalOccupantVisibility')).toBe('bounded-configurable');
    expect(isBoundedConfigurable('limitedReorderWithinCompatibleBands')).toBe(true);
    expect(isBoundedConfigurable('postHeroBoundary')).toBe(false);
  });

  it('classifies shell-fit and descriptive descriptor keys', () => {
    expect(getGovernanceCategory('allowedBandSemantics')).toBe('shell-fit');
    expect(getGovernanceCategory('reorderDomain')).toBe('shell-fit');
    expect(getGovernanceCategory('visibilityEligibility')).toBe('shell-fit');
    expect(getGovernanceCategory('displayName')).toBe('descriptive');
  });

  it('returns undefined for unknown keys', () => {
    expect(getGovernanceCategory('not-a-shell-key')).toBeUndefined();
  });

  it('exposes occupant governance view with reorder + visibility metadata', () => {
    const view = getOccupantGovernance('project-portfolio-spotlight');
    expect(view?.reorderDomain).toBe('locked');
    expect(view?.visibilityEligibility.removable).toBe(false);
    expect(view?.allowedBandSemantics).toContain('operational-spotlight');
  });
});

describe('governance enforcement in overrides', () => {
  it('rejects placing hb-kudos into a band where its semantics are still not allowed', () => {
    // HB Kudos `allowedBandSemantics` is now ['recognition', 'operational-spotlight'].
    // Row 3 uses `communications-editorial`, which remains off-limits.
    const result = previewBandOverride(
      'default-v2',
      'band-row-3-communications-editorial',
      [{ slotId: 'slot-row-3-leadership-message', occupantId: 'hb-kudos' }],
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === 'OCCUPANT_BAND_INCOMPATIBLE')).toBe(true);
  });

  it('rejects replacing a locked occupant via override', () => {
    const result = previewBandOverride(
      'default-v2',
      'band-row-1-operational-spotlight',
      [{ slotId: 'slot-row-1-project-portfolio-spotlight', occupantId: 'company-pulse' }],
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === 'REORDER_DOMAIN_VIOLATION')).toBe(true);
  });

  it('rejects replacing safety-field-excellence in row 2 via override', () => {
    const result = previewBandOverride(
      'default-v2',
      'band-row-2-communications-newsroom',
      [{ slotId: 'slot-row-2-safety-field-excellence', occupantId: 'hb-kudos' }],
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === 'REORDER_DOMAIN_VIOLATION')).toBe(true);
  });

  it('rejects clearing a non-removable occupant via override', () => {
    const result = previewBandOverride(
      'default-v2',
      'band-row-1-operational-spotlight',
      [{ slotId: 'slot-row-1-hb-kudos', occupantId: '' }],
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === 'VISIBILITY_NOT_ELIGIBLE')).toBe(true);
  });

  it('accepts role-only override on a non-locked slot', () => {
    const result = previewBandOverride(
      'default-v2',
      'band-row-2-communications-newsroom',
      [{ slotId: 'slot-row-2-company-pulse', role: 'secondary' }],
    );
    expect(result.valid).toBe(true);
  });

  it('produces no governance errors on any approved preset', () => {
    for (const [id, preset] of APPROVED_PRESETS) {
      const result = validatePresetStructure(preset);
      const governanceErrors = result.diagnostics.filter(
        (d) =>
          d.severity === 'error' &&
          (d.code === 'OCCUPANT_BAND_INCOMPATIBLE' ||
            d.code === 'REORDER_DOMAIN_VIOLATION' ||
            d.code === 'VISIBILITY_NOT_ELIGIBLE'),
      );
      expect(governanceErrors, `preset "${id}" produced governance errors`).toHaveLength(0);
    }
  });
});

describe('canonical preset policy', () => {
  it('exposes the canonical policy constant with expected rules', () => {
    expect(PRESET_CANONICAL_POLICY.allowEmptyBands).toBe(false);
    expect(PRESET_CANONICAL_POLICY.semanticRolesAllowedToRepeat).toContain('operational-spotlight');
    expect(PRESET_CANONICAL_POLICY.recognitionMustBeLast).toBe(true);
    expect(PRESET_CANONICAL_POLICY.entryBandMustBeNonEmpty).toBe(true);
  });

  it('produces no warnings or errors for EDITORIAL, OPS-SAFETY, and COMPACT-LINEAR presets', () => {
    for (const preset of [EDITORIAL_FOCUS_PRESET, OPERATIONS_SAFETY_PRESET, COMPACT_LINEAR_PRESET]) {
      const diags = validatePresetCanonicalSemantics(preset);
      const serious = diags.filter((d) => d.severity !== 'info');
      expect(serious, `preset "${preset.id}" canonical issues: ${JSON.stringify(serious)}`).toHaveLength(0);
    }
  });

  it('keeps DEFAULT_PRESET canonical (no empty-band canonical diagnostics)', () => {
    const diags = validatePresetCanonicalSemantics(DEFAULT_PRESET);
    expect(diags.some((d) => d.code === 'NON_CANONICAL_EMPTY_BAND')).toBe(false);
  });

  it('emits NON_CANONICAL_EMPTY_ENTRY_BAND as error when entry band has no active occupant', () => {
    const bad: ShellPreset = {
      id: 'bad-entry',
      title: 'bad',
      bands: [
        {
          id: 'b1',
          semanticRole: 'communications-editorial',
          recipe: 'stacked-full',
          slots: [{ id: 's1', occupantId: null, role: 'primary', columnSpan: 'full' }],
          maxDominantOccupants: 1,
        },
        ...COMPACT_LINEAR_PRESET.bands.slice(1),
      ],
    };
    const diags = validatePresetCanonicalSemantics(bad);
    expect(diags.some((d) => d.code === 'NON_CANONICAL_EMPTY_ENTRY_BAND' && d.severity === 'error')).toBe(true);
  });

  it('emits NON_CANONICAL_SEMANTIC_REUSE when a non-repeatable role repeats', () => {
    const bad: ShellPreset = {
      ...COMPACT_LINEAR_PRESET,
      id: 'bad-semantic-reuse',
      bands: [
        ...COMPACT_LINEAR_PRESET.bands,
        {
          id: 'dup-people-culture',
          semanticRole: 'people-culture',
          recipe: 'stacked-full',
          slots: [{ id: 's-dup', occupantId: 'people-culture-public', role: 'primary', columnSpan: 'full' }],
          maxDominantOccupants: 1,
        },
      ],
    };
    const diags = validatePresetCanonicalSemantics(bad);
    expect(diags.some((d) => d.code === 'NON_CANONICAL_SEMANTIC_REUSE')).toBe(true);
  });

  it('permits operational-spotlight to repeat without diagnostic', () => {
    const diags = validatePresetCanonicalSemantics(COMPACT_LINEAR_PRESET);
    expect(diags.some((d) => d.code === 'NON_CANONICAL_SEMANTIC_REUSE')).toBe(false);
  });

  it('emits NON_CANONICAL_BAND_ORDER when recognition is not last', () => {
    const bad: ShellPreset = {
      ...COMPACT_LINEAR_PRESET,
      id: 'bad-recognition-position',
      bands: [COMPACT_LINEAR_PRESET.bands[COMPACT_LINEAR_PRESET.bands.length - 1], ...COMPACT_LINEAR_PRESET.bands.slice(0, -1)],
    };
    const diags = validatePresetCanonicalSemantics(bad);
    expect(diags.some((d) => d.code === 'NON_CANONICAL_BAND_ORDER')).toBe(true);
  });

  it('parseShellLayout surfaces canonical diagnostics for DEFAULT_PRESET', () => {
    const result = parseShellLayout({ presetId: 'default-v2' });
    expect(result.diagnostics.some((d) => d.code === 'NON_CANONICAL_EMPTY_BAND')).toBe(false);
  });

  it('flags recipe semantic-role incompatibility as an error', () => {
    const result = validatePresetStructure({
      ...DEFAULT_PRESET,
      id: 'bad-recipe-semantic',
      bands: [
        {
          id: 'bad-band',
          semanticRole: 'recognition',
          recipe: 'feature-pair',
          slots: [
            { id: 's1', occupantId: 'hb-kudos', role: 'primary', columnSpan: 'major' },
            { id: 's2', occupantId: 'company-pulse', role: 'secondary', columnSpan: 'minor' },
          ],
          maxDominantOccupants: 1,
        },
      ],
    });
    expect(result.diagnostics.some((d) => d.code === 'RECIPE_SEMANTIC_ROLE_INCOMPATIBLE')).toBe(
      true,
    );
  });

  it('flags recipe active-slot bounds violations as errors', () => {
    const result = validatePresetStructure({
      ...DEFAULT_PRESET,
      id: 'bad-recipe-active-slot-count',
      bands: [
        {
          id: 'bad-band',
          semanticRole: 'operational-spotlight',
          recipe: 'feature-pair',
          slots: [{ id: 's1', occupantId: 'company-pulse', role: 'primary', columnSpan: 'major' }],
          maxDominantOccupants: 1,
        },
      ],
    });
    expect(result.diagnostics.some((d) => d.code === 'RECIPE_ACTIVE_SLOT_COUNT_INVALID')).toBe(
      true,
    );
  });
});

describe('preset mutation permissions', () => {
  it('exposes mutable and immutable keys', () => {
    expect(Object.keys(PRESET_MUTATION_PERMISSIONS.mutable).length).toBeGreaterThan(0);
    expect(Object.keys(PRESET_MUTATION_PERMISSIONS.immutable).length).toBeGreaterThan(0);
  });

  it('immutable set explicitly lists protected shell rules', () => {
    const keys = Object.keys(PRESET_MUTATION_PERMISSIONS.immutable);
    expect(keys).toContain('prohibitedPairings');
    expect(keys).toContain('entryStateRules');
    expect(keys).toContain('reorderDomainLocked');
    expect(keys).toContain('visibilityEligibilityLocked');
  });

  it('mutable set aligns with persisted-policy configurable decisions', () => {
    const mutableKeys = Object.keys(PRESET_MUTATION_PERMISSIONS.mutable);
    expect(mutableKeys).toContain('presetSelection');
    expect(mutableKeys).toContain('optionalOccupantVisibility');
    expect(mutableKeys).toContain('limitedReorderWithinCompatibleBands');
    expect(mutableKeys).toContain('compactVsStandardTreatment');
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
