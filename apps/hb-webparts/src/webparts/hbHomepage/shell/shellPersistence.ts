import { z } from 'zod';
import { APPROVED_PRESETS } from './presetLibrary.js';
import { parseShellLayout } from './shellValidation.js';
import { OCCUPANT_REGISTRY } from './occupantRegistry.js';
import {
  SHELL_PROTECTED_DECISIONS,
  PROTECTED_ENTRY_STATE_RULES,
  type ProtectedEntryStateRule,
} from './protectedDecisions.js';
import type { OccupantId, ShellDiagnostic, ShellLayoutState } from './shellTypes.js';

// =============================================================================
// Versioned shell layout policy — persisted boundary contract
// -----------------------------------------------------------------------------
// This module is the authoritative persisted-input boundary for the HB
// Homepage shell. Any future maintainer control panel must write through
// this contract, and the shell will only ever read through this contract.
//
// Versioning:
//   - PERSISTED_STATE_VERSION is the current canonical schema version.
//   - Any payload not matching the current version must go through
//     `migratePersistedState` first. Today there is only v1; the migration
//     seam exists so a v2 schema may be introduced without re-plumbing
//     every call site.
//
// What MAY be persisted (bounded-configurable surface):
//   - presetId (must be in APPROVED_PRESETS)
//   - occupantVisibility (keyed by known OccupantId; gated by the
//     occupant's visibilityEligibility metadata from occupantRegistry.ts)
//   - bandOverrides (reorder/reassign within each occupant's reorderDomain)
//   - compactPreferences (per-occupant compact/standard hint)
//
// What MUST NOT be persisted (code-governed):
//   - any key in SHELL_PROTECTED_DECISIONS
//   - any key in PROTECTED_ENTRY_STATE_RULES
//   - breakpoint thresholds, column-rule state, entry-stack budgets
//   - occupant prominence ceilings, comfort ranges, allowed slot roles
//   - preset library membership (presets are code-authored)
//
// Rejection taxonomy:
//   See PERSISTED_REJECTION_CODES below. Every rejection returned by
//   sanitization / preview carries a stable code consumable by tooling.
// =============================================================================

export const PERSISTED_STATE_VERSION = 1 as const;
export type PersistedStateVersion = typeof PERSISTED_STATE_VERSION;

export const PERSISTED_REJECTION_CODES = {
  SCHEMA_REJECTED: 'PERSISTED_STATE_SCHEMA_REJECTED',
  UNSUPPORTED_VERSION: 'PERSISTED_UNSUPPORTED_VERSION',
  UNKNOWN_PRESET: 'PERSISTED_UNKNOWN_PRESET',
  UNKNOWN_OCCUPANT: 'PERSISTED_UNKNOWN_OCCUPANT',
  PROHIBITED_PAIRING: 'PERSISTED_PROHIBITED_PAIRING',
  VISIBILITY_NOT_ELIGIBLE: 'PERSISTED_VISIBILITY_NOT_ELIGIBLE',
  REORDER_DOMAIN_VIOLATION: 'PERSISTED_REORDER_DOMAIN_VIOLATION',
  INVALID_OVERRIDE_TARGET: 'PERSISTED_INVALID_OVERRIDE_TARGET',
  INVALID_OVERRIDE_VALUE: 'PERSISTED_INVALID_OVERRIDE_VALUE',
  PROTECTED_KEY_PRESENT: 'PERSISTED_PROTECTED_KEY_PRESENT',
} as const;

export type PersistedRejectionCode =
  (typeof PERSISTED_REJECTION_CODES)[keyof typeof PERSISTED_REJECTION_CODES];

export interface PersistedRejection {
  readonly code: PersistedRejectionCode;
  readonly message: string;
}

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
  readonly rejections: readonly PersistedRejection[];
}

function reject(code: PersistedRejectionCode, message: string): PersistedRejection {
  return { code, message };
}

/**
 * Migration seam. Accepts a raw value and normalizes it toward the current
 * `PERSISTED_STATE_VERSION`. Today, the only valid input version is 1 so
 * the function is a pass-through guard. When a v2 schema is introduced,
 * add a branch here that rewrites v1 payloads into the v2 shape.
 */
export function migratePersistedState(
  raw: unknown,
): { readonly migrated: unknown; readonly rejection?: PersistedRejection } {
  if (raw === null || raw === undefined || typeof raw !== 'object') {
    return { migrated: raw };
  }

  const version = (raw as { version?: unknown }).version;
  if (version === undefined || version === PERSISTED_STATE_VERSION) {
    return { migrated: raw };
  }

  if (typeof version === 'number' && version < PERSISTED_STATE_VERSION) {
    // No prior versions exist yet. When one does, migrate here.
    return { migrated: raw };
  }

  return {
    migrated: raw,
    rejection: reject(
      PERSISTED_REJECTION_CODES.UNSUPPORTED_VERSION,
      `Persisted state version ${String(version)} is newer than the supported version ${PERSISTED_STATE_VERSION}. Payload will be rejected.`,
    ),
  };
}

export function createDefaultPersistedState(): PersistedShellState {
  return {
    version: PERSISTED_STATE_VERSION,
    presetId: 'default-v2',
  };
}

export function sanitizePersistedState(input: PersistedShellState): SanitizationResult {
  const rejections: PersistedRejection[] = [];
  let sanitized = { ...input };

  if (!APPROVED_PRESETS.has(sanitized.presetId)) {
    rejections.push(
      reject(
        PERSISTED_REJECTION_CODES.UNKNOWN_PRESET,
        `preset "${sanitized.presetId}" is not in the approved preset library`,
      ),
    );
    sanitized = { ...sanitized, presetId: 'default-v2' };
  }

  if (sanitized.occupantVisibility) {
    const sanitizedVisibility: Record<string, 'visible' | 'hidden'> = {};
    for (const [id, state] of Object.entries(sanitized.occupantVisibility)) {
      const descriptor = OCCUPANT_REGISTRY.get(id as OccupantId);
      if (!descriptor) {
        rejections.push(
          reject(
            PERSISTED_REJECTION_CODES.UNKNOWN_OCCUPANT,
            `occupantVisibility references unknown occupant "${id}"; dropping entry.`,
          ),
        );
        continue;
      }
      if (state === 'hidden' && !descriptor.visibilityEligibility.hideableByMaintainer) {
        rejections.push(
          reject(
            PERSISTED_REJECTION_CODES.VISIBILITY_NOT_ELIGIBLE,
            `occupant "${id}" is not hideable by maintainers; visibility entry ignored.`,
          ),
        );
        continue;
      }
      sanitizedVisibility[id] = state;
    }
    sanitized = { ...sanitized, occupantVisibility: sanitizedVisibility };
  }

  if (sanitized.compactPreferences) {
    const sanitizedCompact: Record<string, 'compact' | 'standard'> = {};
    for (const [id, pref] of Object.entries(sanitized.compactPreferences)) {
      if (!OCCUPANT_REGISTRY.has(id as OccupantId)) {
        rejections.push(
          reject(
            PERSISTED_REJECTION_CODES.UNKNOWN_OCCUPANT,
            `compactPreferences references unknown occupant "${id}"; dropping entry.`,
          ),
        );
        continue;
      }
      sanitizedCompact[id] = pref;
    }
    sanitized = { ...sanitized, compactPreferences: sanitizedCompact };
  }

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
            rejections.push(
              reject(
                PERSISTED_REJECTION_CODES.PROHIBITED_PAIRING,
                `override for band "${override.bandId}" contains prohibited pairing ${a} + ${b}; stripping "${b}".`,
              ),
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

  return {
    sanitized,
    rejections,
    violations: rejections.map((r) => `[${r.code}] ${r.message}`),
  };
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

  const { migrated, rejection: migrationRejection } = migratePersistedState(raw);
  if (migrationRejection) {
    const fallback = parseShellLayout(undefined);
    return {
      ...fallback,
      diagnostics: [
        ...fallback.diagnostics,
        {
          severity: 'error',
          code: migrationRejection.code,
          message: migrationRejection.message,
        },
      ],
    };
  }

  const parseResult = PersistedShellStateSchema.safeParse(migrated);
  if (!parseResult.success) {
    const fallback = parseShellLayout(undefined);
    const injected: ShellDiagnostic = {
      severity: 'error',
      code: PERSISTED_REJECTION_CODES.SCHEMA_REJECTED,
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

export interface PersistedPreviewResult {
  readonly accepted: boolean;
  readonly rejections: readonly PersistedRejection[];
  readonly normalized?: PersistedShellState;
  readonly layoutState?: ShellLayoutState;
}

/**
 * Dry-run the persisted policy pipeline against a raw payload. Returns a
 * structured preview a future control panel can display before writing.
 * No side effects; safe to call with any input.
 */
export function previewPersistedState(raw: unknown): PersistedPreviewResult {
  if (raw === null || raw === undefined) {
    return { accepted: true, rejections: [], normalized: createDefaultPersistedState() };
  }

  const { rejection: migrationRejection, migrated } = migratePersistedState(raw);
  if (migrationRejection) {
    return { accepted: false, rejections: [migrationRejection] };
  }

  const parseResult = PersistedShellStateSchema.safeParse(migrated);
  if (!parseResult.success) {
    return {
      accepted: false,
      rejections: [
        reject(
          PERSISTED_REJECTION_CODES.SCHEMA_REJECTED,
          `Persisted shell state failed schema validation: ${parseResult.error.message}.`,
        ),
      ],
    };
  }

  const { sanitized, rejections: sanitizeRejections } = sanitizePersistedState(parseResult.data);
  const layoutState = parseShellLayout({
    presetId: sanitized.presetId,
    bandOverrides: sanitized.bandOverrides,
  });

  const layoutErrorRejections: PersistedRejection[] = layoutState.diagnostics
    .filter((d) => d.severity === 'error')
    .map((d) => {
      if (d.code === 'REORDER_DOMAIN_VIOLATION') {
        return reject(PERSISTED_REJECTION_CODES.REORDER_DOMAIN_VIOLATION, d.message);
      }
      if (d.code === 'UNKNOWN_BAND_OVERRIDE' || d.code === 'UNKNOWN_SLOT_OVERRIDE') {
        return reject(PERSISTED_REJECTION_CODES.INVALID_OVERRIDE_TARGET, d.message);
      }
      if (
        d.code === 'INVALID_OVERRIDE_ROLE' ||
        d.code === 'INVALID_OVERRIDE_COLUMN_SPAN' ||
        d.code === 'INVALID_OVERRIDE_OCCUPANT'
      ) {
        return reject(PERSISTED_REJECTION_CODES.INVALID_OVERRIDE_VALUE, d.message);
      }
      if (d.code === 'OCCUPANT_BAND_INCOMPATIBLE') {
        return reject(PERSISTED_REJECTION_CODES.PROTECTED_KEY_PRESENT, d.message);
      }
      return reject(PERSISTED_REJECTION_CODES.SCHEMA_REJECTED, `[${d.code}] ${d.message}`);
    });

  const rejections = [...sanitizeRejections, ...layoutErrorRejections];

  return {
    accepted: rejections.length === 0,
    rejections,
    normalized: sanitized,
    layoutState,
  };
}

/**
 * Canonical persisted-state examples. These are the authoritative
 * allowed / normalized / rejected shapes a future control panel and any
 * documentation must refer to.
 */
export const PERSISTED_POLICY_EXAMPLES = {
  allowed: {
    version: PERSISTED_STATE_VERSION,
    presetId: 'default-v2',
    bandOverrides: [
      {
        bandId: 'band-row-2-communications-newsroom',
        slots: [{ slotId: 'slot-row-2-company-pulse', role: 'secondary' }],
      },
    ],
    compactPreferences: { 'company-pulse': 'standard' },
  } satisfies PersistedShellState,

  normalized: {
    version: PERSISTED_STATE_VERSION,
    presetId: 'default-v2',
  } satisfies PersistedShellState,

  rejectedExamples: {
    unknownPreset: {
      version: PERSISTED_STATE_VERSION,
      presetId: 'not-a-real-preset',
    } satisfies PersistedShellState,

    hidingNonHideable: {
      version: PERSISTED_STATE_VERSION,
      presetId: 'default-v2',
      occupantVisibility: { 'project-portfolio-spotlight': 'hidden' },
    } satisfies PersistedShellState,

    unsupportedVersion: { version: 99, presetId: 'default-v2' },
  },
} as const;

export const GOVERNANCE_BOUNDARY = {
  systemAuthored: {
    entryStateBreakpoints: 'Shell entry-state thresholds and column rules are code-governed by breakpointPolicy.ts',
    protectedEntryStateRules: Object.keys(PROTECTED_ENTRY_STATE_RULES),
    prohibitedPairings: SHELL_PROTECTED_DECISIONS.prohibitedPairings,
    protectedBandSemantics: SHELL_PROTECTED_DECISIONS.protectedBandSemantics,
    protectedRowPairings: SHELL_PROTECTED_DECISIONS.protectedRowPairings,
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
