import { describe, it, expect } from 'vitest';
import { DEFAULT_PRESET } from '../defaultPreset.js';
import { SHELL_PROTECTED_DECISIONS, getGovernanceCategory } from '../protectedDecisions.js';
import {
  validatePresetStructure,
  validateProtectedRowPairings,
} from '../shellValidation.js';
import { OCCUPANT_REGISTRY } from '../occupantRegistry.js';
import type { ShellPreset } from '../shellTypes.js';

describe('SHELL_PROTECTED_DECISIONS.protectedRowPairings', () => {
  it('locks the three flagship rows in order with exact occupants and orientation', () => {
    expect(SHELL_PROTECTED_DECISIONS.protectedRowPairings).toEqual([
      {
        rowKey: 'row-1',
        bandSemanticRole: 'operational-spotlight',
        primaryOccupantId: 'project-portfolio-spotlight',
        secondaryOccupantId: 'hb-kudos',
        orientation: 'left-dominant',
      },
      {
        rowKey: 'row-2',
        bandSemanticRole: 'communications-newsroom',
        primaryOccupantId: 'company-pulse',
        secondaryOccupantId: 'safety-field-excellence',
        orientation: 'right-dominant',
      },
      {
        rowKey: 'row-3',
        bandSemanticRole: 'communications-editorial',
        primaryOccupantId: 'leadership-message',
        secondaryOccupantId: 'people-culture-public',
        orientation: 'left-dominant',
      },
    ]);
  });

  it('classifies protectedRowPairings as a protected governance key', () => {
    expect(getGovernanceCategory('protectedRowPairings')).toBe('protected');
  });
});

describe('DEFAULT_PRESET against protected-row governance', () => {
  it('emits zero row-pairing drift diagnostics', () => {
    const result = validatePresetStructure(DEFAULT_PRESET);
    const drift = result.diagnostics.filter(
      (d) =>
        d.code === 'PROTECTED_ROW_PAIRING_MISSING' ||
        d.code === 'PROTECTED_ROW_PAIRING_DRIFT' ||
        d.code === 'PROTECTED_ROW_ORIENTATION_DRIFT',
    );
    expect(drift, `unexpected drift diagnostics: ${JSON.stringify(drift)}`).toHaveLength(0);
  });

  it('validateProtectedRowPairings returns an empty diagnostic list for the locked default', () => {
    const diagnostics = validateProtectedRowPairings(
      DEFAULT_PRESET,
      SHELL_PROTECTED_DECISIONS.protectedRowPairings,
    );
    expect(diagnostics).toHaveLength(0);
  });
});

describe('drift diagnostics fire on divergent presets', () => {
  it('emits PROTECTED_ROW_PAIRING_MISSING when a target row semantic is absent', () => {
    const withoutRow3: ShellPreset = {
      ...DEFAULT_PRESET,
      bands: DEFAULT_PRESET.bands.slice(0, 2),
    };
    const diagnostics = validateProtectedRowPairings(
      withoutRow3,
      SHELL_PROTECTED_DECISIONS.protectedRowPairings,
    );
    expect(
      diagnostics.some(
        (d) =>
          d.code === 'PROTECTED_ROW_PAIRING_MISSING' &&
          d.severity === 'warning' &&
          d.message.includes('row-3'),
      ),
    ).toBe(true);
  });

  it('emits PROTECTED_ROW_PAIRING_DRIFT when Row 1 swaps HB Kudos for Leadership Message', () => {
    const row1 = DEFAULT_PRESET.bands[0];
    const driftRow1 = {
      ...row1,
      slots: [
        row1.slots[0],
        { ...row1.slots[1], occupantId: 'leadership-message' as const },
      ],
    };
    const driftPreset: ShellPreset = {
      ...DEFAULT_PRESET,
      bands: [driftRow1, ...DEFAULT_PRESET.bands.slice(1)],
    };
    const diagnostics = validateProtectedRowPairings(
      driftPreset,
      SHELL_PROTECTED_DECISIONS.protectedRowPairings,
    );
    expect(
      diagnostics.some(
        (d) =>
          d.code === 'PROTECTED_ROW_PAIRING_DRIFT' &&
          d.severity === 'warning' &&
          d.message.includes('row-1'),
      ),
    ).toBe(true);
  });

  it('emits PROTECTED_ROW_ORIENTATION_DRIFT when Row 2 flips to left-dominant', () => {
    const row2 = DEFAULT_PRESET.bands[1];
    const leftDominantRow2 = { ...row2, orientation: 'left-dominant' as const };
    const driftPreset: ShellPreset = {
      ...DEFAULT_PRESET,
      bands: [DEFAULT_PRESET.bands[0], leftDominantRow2, DEFAULT_PRESET.bands[2]],
    };
    const diagnostics = validateProtectedRowPairings(
      driftPreset,
      SHELL_PROTECTED_DECISIONS.protectedRowPairings,
    );
    expect(
      diagnostics.some(
        (d) =>
          d.code === 'PROTECTED_ROW_ORIENTATION_DRIFT' &&
          d.severity === 'info' &&
          d.message.includes('row-2'),
      ),
    ).toBe(true);
  });
});

describe('OccupantDescriptor.lockedToRow matches the protected row lock', () => {
  it('publishes a lockedToRow entry consistent with protectedRowPairings for every occupant', () => {
    for (const pairing of SHELL_PROTECTED_DECISIONS.protectedRowPairings) {
      const primary = OCCUPANT_REGISTRY.get(pairing.primaryOccupantId)!;
      const secondary = OCCUPANT_REGISTRY.get(pairing.secondaryOccupantId)!;
      expect(primary.lockedToRow).toEqual({
        bandSemanticRole: pairing.bandSemanticRole,
        role: 'primary',
      });
      expect(secondary.lockedToRow).toEqual({
        bandSemanticRole: pairing.bandSemanticRole,
        role: 'secondary',
      });
    }
  });

  it('publishes a lockedToRow entry on every active occupant', () => {
    for (const occupant of OCCUPANT_REGISTRY.values()) {
      if (occupant.status !== 'active') continue;
      expect(occupant.lockedToRow, `occupant "${occupant.id}" missing lockedToRow`).toBeDefined();
    }
  });
});
