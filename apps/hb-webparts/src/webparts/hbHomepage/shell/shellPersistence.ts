import { z } from 'zod';
import { getPresetOrDefault, APPROVED_PRESETS } from './presetLibrary.js';
import { parseShellLayout } from './shellValidation.js';
import {
  SHELL_PROTECTED_DECISIONS,
  PROTECTED_ENTRY_STATE_RULES,
  type ProtectedEntryStateRule,
} from './protectedDecisions.js';
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

  // Prohibited-pairing enforcement: persisted payloads MUST NOT be able
  // to force a pairing that shell policy forbids. Detect each violation
  // and strip the second offending occupantId (set to empty string so
  // `parseShellLayout`'s override-merge nulls it out) so the shell still
  // renders rather than failing closed.
  const prohibitedPairings = SHELL_PROTECTED_DECISIONS.prohibitedPairings;
  if (sanitized.bandOverrides?.length) {
    sanitized = {
      ...sanitized,
      bandOverrides: sanitized.bandOverrides.map((override) => {
        if (!override.slots?.length) return override;

        const occupantIds = override.slots
          .map((s) => s.occupantId)
          .filter((id): id is string => id !== undefined && id !== '');

        let slotsCopy = override.slots;
        for (const [a, b] of prohibitedPairings) {
          if (occupantIds.includes(a) && occupantIds.includes(b)) {
            violations.push(
              `override for band "${override.bandId}" contains prohibited pairing ${a} + ${b}; stripping "${b}" to honor PROTECTED shell pairing rule.`,
            );
            slotsCopy = slotsCopy.map((s) =>
              s.occupantId === b ? { ...s, occupantId: '' } : s,
            );
          }
        }

        return { ...override, slots: slotsCopy };
      }),
    };
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
    const fallback = parseShellLayout(undefined);
    const injected: ShellDiagnostic = {
      severity: 'error',
      code: 'PERSISTED_STATE_SCHEMA_REJECTED',
      message: `Persisted shell state failed schema validation: ${parseResult.error.message}. Using default preset.`,
    };
    return { ...fallback, diagnostics: [...fallback.diagnostics, injected] };
  }

  const { sanitized, violations } = sanitizePersistedState(parseResult.data);

  const layoutState = parseShellLayout({
    presetId: sanitized.presetId,
    bandOverrides: sanitized.bandOverrides,
  });

  // Surface sanitization violations into runtime diagnostics so
  // harnesses, previewers, and a future control panel can see every
  // attempted bypass of a protected shell rule without relying on
  // console output.
  const withSanitizationDiagnostics: ShellLayoutState =
    violations.length === 0
      ? layoutState
      : {
          ...layoutState,
          diagnostics: [
            ...layoutState.diagnostics,
            ...violations.map(
              (message): ShellDiagnostic => ({
                severity: 'warning',
                code: 'PERSISTED_STATE_SANITIZED',
                message,
              }),
            ),
          ],
        };

  if (sanitized.occupantVisibility) {
    return applyOccupantVisibility(withSanitizationDiagnostics, sanitized.occupantVisibility);
  }

  return withSanitizationDiagnostics;
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

// -----------------------------------------------------------------------------
// Compile-time invariant: persisted shell state MUST NOT carry entry-state
// protected rule keys. If anyone adds (e.g.) `firstLaneColumns` to the
// persistence schema, this alias will fail to resolve and TypeScript will
// reject the build, preventing a silent bypass of protected shell rules.
// -----------------------------------------------------------------------------
type _PersistedStateCannotNameProtectedEntryStateRule = Extract<
  keyof PersistedShellState,
  ProtectedEntryStateRule
> extends never
  ? true
  : {
      readonly BUG: 'PersistedShellState must not carry keys that share names with PROTECTED_ENTRY_STATE_RULES';
      readonly offendingKeys: Extract<keyof PersistedShellState, ProtectedEntryStateRule>;
    };
const _persistedStateInvariantCheck: _PersistedStateCannotNameProtectedEntryStateRule = true;
void _persistedStateInvariantCheck;

export const GOVERNANCE_BOUNDARY = {
  systemAuthored: {
    entryStateBreakpoints: 'Shell entry-state thresholds and column rules are code-governed by breakpointPolicy.ts',
    protectedEntryStateRules: Object.keys(PROTECTED_ENTRY_STATE_RULES),
    prohibitedPairings: SHELL_PROTECTED_DECISIONS.prohibitedPairings,
    protectedBandSemantics: SHELL_PROTECTED_DECISIONS.protectedBandSemantics,
    maxDominantPerBand: SHELL_PROTECTED_DECISIONS.maxDominantPerBand,
    prominenceCeilings: 'Occupant prominence ceilings are code-governed by the occupant registry',
    heroHeightBudgets: 'Entry-stack hero height budgets are code-governed by entryStackPolicy.ts',
    spacingBudgets: 'Entry-stack spacing gaps are code-governed by entryStackPolicy.ts',
    visiblePrimaryActionsBudgets: 'Visible primary-actions budgets are code-governed by entryStackPolicy.ts',
    overflowPosture: 'Overflow posture is code-governed by entryStackPolicy.ts',
    shortHeightPosture: 'Short-height fallback posture is code-governed by entryStackPolicy.ts',
    firstLaneFirstView: 'First-lane-first-view expectation is code-governed by entryStackPolicy.ts',
  },
  configurableByFutureControlPanel: {
    presetSelection: 'Choose from approved preset library',
    occupantVisibility: 'Show or hide individual occupants',
    compactPreferences: 'Prefer compact or standard rendering per occupant',
    limitedBandOverrides: 'Reorder or reassign occupants within governance constraints',
  },
} as const;
