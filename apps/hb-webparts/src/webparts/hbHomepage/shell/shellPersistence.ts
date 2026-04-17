import { z } from 'zod';
import { getPresetOrDefault, APPROVED_PRESETS } from './presetLibrary.js';
import { parseShellLayout } from './shellValidation.js';
import { SHELL_PROTECTED_DECISIONS, PROTECTED_ENTRY_STATE_RULES } from './protectedDecisions.js';
import type { OccupantId, ShellDiagnostic, ShellLayoutState } from './shellTypes.js';

export const PERSISTED_STATE_VERSION = 1 as const;

export const PersistedShellStateSchema = z.object({
  version: z.literal(PERSISTED_STATE_VERSION),
  presetId: z.string(),
  occupantVisibility: z
    .record(z.enum(['visible', 'hidden']))
    .optional(),
  bandOverrides: z
    .array(
      z.object({
        bandId: z.string(),
        slots: z
          .array(
            z.object({
              slotId: z.string(),
              occupantId: z.string().optional(),
              role: z.string().optional(),
              columnSpan: z.string().optional(),
            }),
          )
          .optional(),
      }),
    )
    .optional(),
  compactPreferences: z
    .record(z.enum(['compact', 'standard']))
    .optional(),
});

export type PersistedShellState = z.infer<typeof PersistedShellStateSchema>;

export interface SanitizationResult {
  readonly sanitized: PersistedShellState;
  readonly violations: readonly string[];
}

export function createDefaultPersistedState(): PersistedShellState {
  return {
    version: PERSISTED_STATE_VERSION,
    presetId: 'default-v2',
  };
}

export function sanitizePersistedState(input: PersistedShellState): SanitizationResult {
  const violations: string[] = [];
  let sanitized = { ...input };

  if (!APPROVED_PRESETS.has(sanitized.presetId)) {
    violations.push(`preset "${sanitized.presetId}" is not in the approved preset library`);
    sanitized = { ...sanitized, presetId: 'default-v2' };
  }

  if (sanitized.bandOverrides) {
    const protectedSemantics = new Set(SHELL_PROTECTED_DECISIONS.protectedBandSemantics);
    const preset = getPresetOrDefault(sanitized.presetId);

    const filteredOverrides = sanitized.bandOverrides.map((override) => {
      const matchedBand = preset.bands.find((b) => b.id === override.bandId);
      if (!matchedBand) return override;

      if (!override.slots?.length) return override;

      const filteredSlots = override.slots.filter((slotOverride) => {
        if (slotOverride.role === 'primary' || slotOverride.role === 'secondary') {
          return true;
        }
        return true;
      });

      return { ...override, slots: filteredSlots };
    });

    sanitized = { ...sanitized, bandOverrides: filteredOverrides };
  }

  const prohibitedPairings = SHELL_PROTECTED_DECISIONS.prohibitedPairings;
  if (sanitized.bandOverrides) {
    for (const override of sanitized.bandOverrides) {
      if (!override.slots) continue;
      const occupantIds = override.slots
        .map((s) => s.occupantId)
        .filter((id): id is string => id !== undefined && id !== '');

      for (const [a, b] of prohibitedPairings) {
        if (occupantIds.includes(a) && occupantIds.includes(b)) {
          violations.push(`override for band "${override.bandId}" contains prohibited pairing: ${a} + ${b}`);
        }
      }
    }
  }

  return { sanitized, violations };
}

export function serializeShellState(
  layoutState: ShellLayoutState,
  extra?: {
    occupantVisibility?: Record<string, 'visible' | 'hidden'>;
    compactPreferences?: Record<string, 'compact' | 'standard'>;
  },
): PersistedShellState {
  return {
    version: PERSISTED_STATE_VERSION,
    presetId: layoutState.preset.id,
    ...(extra?.occupantVisibility && { occupantVisibility: extra.occupantVisibility }),
    ...(extra?.compactPreferences && { compactPreferences: extra.compactPreferences }),
  };
}

export function hydratePersistedState(raw: unknown): ShellLayoutState {
  if (raw === null || raw === undefined) {
    return parseShellLayout(undefined);
  }

  const parseResult = PersistedShellStateSchema.safeParse(raw);
  if (!parseResult.success) {
    console.warn(
      '[hb-homepage:shell] Persisted shell state failed validation. Using default.',
      parseResult.error.message,
    );
    return parseShellLayout(undefined);
  }

  const { sanitized, violations } = sanitizePersistedState(parseResult.data);

  if (violations.length > 0) {
    console.warn(
      '[hb-homepage:shell] Persisted state sanitized. Violations:',
      violations,
    );
  }

  const layoutState = parseShellLayout({
    presetId: sanitized.presetId,
    bandOverrides: sanitized.bandOverrides,
  });

  if (sanitized.occupantVisibility) {
    return applyOccupantVisibility(layoutState, sanitized.occupantVisibility);
  }

  return layoutState;
}

export function applyOccupantVisibility(
  layoutState: ShellLayoutState,
  visibility: Record<string, 'visible' | 'hidden'> | undefined,
): ShellLayoutState {
  if (!visibility) return layoutState;

  const hiddenOccupants = new Set(
    Object.entries(visibility)
      .filter(([, v]) => v === 'hidden')
      .map(([id]) => id),
  );

  if (hiddenOccupants.size === 0) return layoutState;

  const bands = layoutState.preset.bands.map((band) => ({
    ...band,
    slots: band.slots.map((slot) =>
      slot.occupantId && hiddenOccupants.has(slot.occupantId)
        ? { ...slot, occupantId: null as OccupantId | null }
        : slot,
    ),
  }));

  return {
    ...layoutState,
    preset: { ...layoutState.preset, bands },
  };
}

export const GOVERNANCE_BOUNDARY = {
  systemAuthored: {
    entryStateBreakpoints: 'Shell entry-state thresholds and column rules are code-governed by breakpointPolicy.ts',
    protectedEntryStateRules: Object.keys(PROTECTED_ENTRY_STATE_RULES),
    prohibitedPairings: SHELL_PROTECTED_DECISIONS.prohibitedPairings,
    protectedBandSemantics: SHELL_PROTECTED_DECISIONS.protectedBandSemantics,
    maxDominantPerBand: SHELL_PROTECTED_DECISIONS.maxDominantPerBand,
    prominenceCeilings: 'Occupant prominence ceilings are code-governed by the occupant registry',
    heroHeightBudgets: 'Entry-stack hero height budgets are code-governed by entryStackContract.ts',
    spacingBudgets: 'Entry-stack spacing gaps are code-governed by entryStackContract.ts',
  },
  configurableByFutureControlPanel: {
    presetSelection: 'Choose from approved preset library',
    occupantVisibility: 'Show or hide individual occupants',
    compactPreferences: 'Prefer compact or standard rendering per occupant',
    limitedBandOverrides: 'Reorder or reassign occupants within governance constraints',
  },
} as const;
