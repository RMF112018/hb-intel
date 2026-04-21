import type { ShellPreset } from './shellTypes.js';
import { DEFAULT_PRESET } from './defaultPreset.js';

/**
 * Editorial Focus — communications-led layout.
 *
 * Use when: the homepage should lead with news and editorial content
 * rather than operational dashboards. Pairs Company Pulse (newsroom)
 * with Leadership Message (editorial) in the first band for maximum
 * communications impact above the fold.
 */
export const EDITORIAL_FOCUS_PRESET: ShellPreset = {
  id: 'editorial-focus-v1',
  title: 'Editorial Focus Layout',
  description:
    'Communications-led: pairs Company Pulse and Leadership Message in the first band. Operations and safety follow.',
  bands: [
    {
      id: 'band-communications',
      semanticRole: 'communications-newsroom',
      recipe: 'feature-pair',
      slots: [
        {
          id: 'slot-company-pulse',
          occupantId: 'company-pulse',
          role: 'primary',
          columnSpan: 'major',
        },
        {
          id: 'slot-leadership-message',
          occupantId: 'leadership-message',
          role: 'secondary',
          columnSpan: 'minor',
        },
      ],
      maxDominantOccupants: 1,
    },
    {
      id: 'band-operational-spotlight',
      semanticRole: 'operational-spotlight',
      recipe: 'stacked-full',
      slots: [
        {
          id: 'slot-project-portfolio-spotlight',
          occupantId: 'project-portfolio-spotlight',
          role: 'primary',
          columnSpan: 'full',
        },
      ],
      maxDominantOccupants: 1,
    },
    {
      id: 'band-safety-field',
      semanticRole: 'operational-spotlight',
      recipe: 'stacked-full',
      // Safety is intentionally promoted to a full-width primary band in this
      // preset (editorial-first above, safety follows as a standalone lane).
      slots: [
        {
          id: 'slot-safety-field-excellence',
          occupantId: 'safety-field-excellence',
          role: 'primary',
          columnSpan: 'full',
        },
      ],
      maxDominantOccupants: 1,
    },
    {
      id: 'band-people-culture',
      semanticRole: 'people-culture',
      recipe: 'stacked-full',
      slots: [
        {
          id: 'slot-people-culture-public',
          occupantId: 'people-culture-public',
          role: 'primary',
          columnSpan: 'full',
        },
      ],
      maxDominantOccupants: 1,
    },
    {
      id: 'band-recognition',
      semanticRole: 'recognition',
      recipe: 'stacked-full',
      slots: [
        {
          id: 'slot-hb-kudos',
          occupantId: 'hb-kudos',
          role: 'primary',
          columnSpan: 'full',
        },
      ],
      maxDominantOccupants: 1,
    },
  ],
};

/**
 * Operations & Safety — field-operations-led layout.
 *
 * Use when: the organization prioritizes operational awareness and
 * field safety over editorial communications. Pairs Project Portfolio
 * Spotlight with Safety Field Excellence in the first band.
 */
export const OPERATIONS_SAFETY_PRESET: ShellPreset = {
  id: 'operations-safety-v1',
  title: 'Operations & Safety Layout',
  description:
    'Field-operations-led: pairs Project Portfolio Spotlight with Safety Field Excellence in the first band. Communications follow.',
  bands: [
    {
      id: 'band-operational-spotlight',
      semanticRole: 'operational-spotlight',
      recipe: 'feature-pair',
      orientation: 'left-dominant',
      slots: [
        {
          id: 'slot-project-portfolio-spotlight',
          occupantId: 'project-portfolio-spotlight',
          role: 'primary',
          columnSpan: 'major',
        },
        {
          id: 'slot-safety-field-excellence',
          occupantId: 'safety-field-excellence',
          role: 'secondary',
          columnSpan: 'minor',
        },
      ],
      maxDominantOccupants: 1,
    },
    {
      id: 'band-communications-newsroom',
      semanticRole: 'communications-newsroom',
      recipe: 'stacked-full',
      slots: [
        {
          id: 'slot-company-pulse',
          occupantId: 'company-pulse',
          role: 'primary',
          columnSpan: 'full',
        },
      ],
      maxDominantOccupants: 1,
    },
    {
      id: 'band-communications-editorial',
      semanticRole: 'communications-editorial',
      recipe: 'stacked-full',
      slots: [
        {
          id: 'slot-leadership-message',
          occupantId: 'leadership-message',
          role: 'primary',
          columnSpan: 'full',
        },
      ],
      maxDominantOccupants: 1,
    },
    {
      id: 'band-people-culture',
      semanticRole: 'people-culture',
      recipe: 'stacked-full',
      slots: [
        {
          id: 'slot-people-culture-public',
          occupantId: 'people-culture-public',
          role: 'primary',
          columnSpan: 'full',
        },
      ],
      maxDominantOccupants: 1,
    },
    {
      id: 'band-recognition',
      semanticRole: 'recognition',
      recipe: 'stacked-full',
      slots: [
        {
          id: 'slot-hb-kudos',
          occupantId: 'hb-kudos',
          role: 'primary',
          columnSpan: 'full',
        },
      ],
      maxDominantOccupants: 1,
    },
  ],
};

/**
 * Compact Linear — conservative single-column layout.
 *
 * Use when: the homepage should present a clean, predictable vertical
 * sequence with no side-by-side pairing. Safe for narrow or constrained
 * hosts and appropriate as a starting point for new tenants.
 */
export const COMPACT_LINEAR_PRESET: ShellPreset = {
  id: 'compact-linear-v1',
  title: 'Compact Linear Layout',
  description:
    'Single-column sequential layout with all occupants in canonical order. No side-by-side pairing.',
  bands: [
    {
      id: 'band-communications-newsroom',
      semanticRole: 'communications-newsroom',
      recipe: 'stacked-full',
      slots: [
        {
          id: 'slot-company-pulse',
          occupantId: 'company-pulse',
          role: 'primary',
          columnSpan: 'full',
        },
      ],
      maxDominantOccupants: 1,
    },
    {
      id: 'band-communications-editorial',
      semanticRole: 'communications-editorial',
      recipe: 'stacked-full',
      slots: [
        {
          id: 'slot-leadership-message',
          occupantId: 'leadership-message',
          role: 'primary',
          columnSpan: 'full',
        },
      ],
      maxDominantOccupants: 1,
    },
    {
      id: 'band-operational-spotlight',
      semanticRole: 'operational-spotlight',
      recipe: 'stacked-full',
      slots: [
        {
          id: 'slot-project-portfolio-spotlight',
          occupantId: 'project-portfolio-spotlight',
          role: 'primary',
          columnSpan: 'full',
        },
      ],
      maxDominantOccupants: 1,
    },
    {
      id: 'band-safety-field',
      semanticRole: 'operational-spotlight',
      recipe: 'stacked-full',
      // Linear preset keeps safety explicit as a dedicated full-width band
      // rather than a residual minor companion.
      slots: [
        {
          id: 'slot-safety-field-excellence',
          occupantId: 'safety-field-excellence',
          role: 'primary',
          columnSpan: 'full',
        },
      ],
      maxDominantOccupants: 1,
    },
    {
      id: 'band-people-culture',
      semanticRole: 'people-culture',
      recipe: 'stacked-full',
      slots: [
        {
          id: 'slot-people-culture-public',
          occupantId: 'people-culture-public',
          role: 'primary',
          columnSpan: 'full',
        },
      ],
      maxDominantOccupants: 1,
    },
    {
      id: 'band-recognition',
      semanticRole: 'recognition',
      recipe: 'stacked-full',
      slots: [
        {
          id: 'slot-hb-kudos',
          occupantId: 'hb-kudos',
          role: 'primary',
          columnSpan: 'full',
        },
      ],
      maxDominantOccupants: 1,
    },
  ],
};

export const APPROVED_PRESETS: ReadonlyMap<string, ShellPreset> = new Map([
  [DEFAULT_PRESET.id, DEFAULT_PRESET],
  [EDITORIAL_FOCUS_PRESET.id, EDITORIAL_FOCUS_PRESET],
  [OPERATIONS_SAFETY_PRESET.id, OPERATIONS_SAFETY_PRESET],
  [COMPACT_LINEAR_PRESET.id, COMPACT_LINEAR_PRESET],
]);

export function getPreset(id: string): ShellPreset | undefined {
  return APPROVED_PRESETS.get(id);
}

export function getPresetOrDefault(id: string | undefined): ShellPreset {
  if (!id) return DEFAULT_PRESET;
  return APPROVED_PRESETS.get(id) ?? DEFAULT_PRESET;
}

export interface PresetDescription {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly bandCount: number;
  readonly pairedBandCount: number;
  readonly occupantIds: readonly string[];
}

export function describePreset(preset: ShellPreset): PresetDescription {
  const occupantIds = preset.bands
    .flatMap((b) => b.slots)
    .filter((s) => s.occupantId !== null)
    .map((s) => s.occupantId!);

  const pairedBandCount = preset.bands.filter(
    (b) => b.slots.filter((s) => s.occupantId !== null).length > 1,
  ).length;

  return {
    id: preset.id,
    title: preset.title,
    description: preset.description ?? '',
    bandCount: preset.bands.length,
    pairedBandCount,
    occupantIds,
  };
}

export function listApprovedPresets(): readonly PresetDescription[] {
  return [...APPROVED_PRESETS.values()].map(describePreset);
}

// =============================================================================
// Canonical preset policy — shell-governed semantics and override permissions
// -----------------------------------------------------------------------------
// A shell preset is canonical when it obeys every rule below. Non-canonical
// presets still parse and render, but validation emits stable diagnostics so
// reviewers and a future maintainer control panel can see drift.
// =============================================================================

export const PRESET_CANONICAL_POLICY = {
  /**
   * Bands with no active occupant are non-canonical.
   * Current approved presets, including DEFAULT_PRESET, are expected to
   * avoid empty bands entirely.
   */
  allowEmptyBands: false,

  /**
   * Semantic roles that MAY repeat across bands in a single preset. Every
   * other BandSemanticRole must appear at most once.
   */
  semanticRolesAllowedToRepeat: ['operational-spotlight'] as const,

  /**
   * Canonical band ordering expectations.
   *   - The 'recognition' semantic role, if present, must be the last band.
   *   - The entry band (first band) is implicitly the preset's anchor and
   *     must contain at least one active occupant.
   */
  recognitionMustBeLast: true,
  entryBandMustBeNonEmpty: true,
} as const;

/**
 * Which preset-derived decisions a future maintainer control panel may
 * mutate through the persisted-policy contract, and which remain code-
 * governed. See Prompt-02's `PERSISTED_POLICY_EXAMPLES` and Prompt-01's
 * `SHELL_GOVERNANCE_MODEL` for the authoritative enforcement seams.
 */
export const PRESET_MUTATION_PERMISSIONS = {
  mutable: {
    presetSelection: 'Choose any preset from APPROVED_PRESETS.',
    slotRoleWithinBand: 'Swap primary/secondary/compact within a band, subject to occupant.allowedSlotRoles.',
    columnSpanWithinBand: 'Swap major/minor/full within a band, subject to pairing comfort.',
    optionalOccupantVisibility: 'Hide occupants whose visibilityEligibility.hideableByMaintainer is true.',
    limitedReorderWithinCompatibleBands: 'Move occupants whose reorderDomain permits it (within-band or within-compatible-bands).',
    compactVsStandardTreatment: 'Prefer compact or standard rendering where the occupant supports both.',
  },
  immutable: {
    presetLibraryMembership: 'New presets are code-authored only.',
    bandSemanticRole: 'A band\'s semanticRole is fixed at preset-author time.',
    bandOrder: 'Band order is fixed at preset-author time (subject to recognition-last rule).',
    prohibitedPairings: 'Prohibited pairings from SHELL_PROTECTED_DECISIONS cannot be introduced.',
    protectedBandSemantics: 'Protected semantic roles cannot be removed from a preset.',
    entryStateRules: 'All PROTECTED_ENTRY_STATE_RULES are code-governed.',
    maxDominantPerBand: 'Dominance ceiling is code-governed.',
    reorderDomainLocked: 'Locked occupants cannot be moved by any maintainer action.',
    visibilityEligibilityLocked: 'Non-hideable occupants cannot be hidden by any maintainer action.',
  },
} as const;

export interface CanonicalDiagnostic {
  readonly severity: 'info' | 'warning' | 'error';
  readonly code: string;
  readonly message: string;
}

/**
 * Evaluate a preset against the canonical policy and return diagnostics.
 * Does not mutate. Callers merge results into their own diagnostic streams.
 */
export function validatePresetCanonicalSemantics(preset: ShellPreset): readonly CanonicalDiagnostic[] {
  const diagnostics: CanonicalDiagnostic[] = [];

  preset.bands.forEach((band, index) => {
    const hasActive = band.slots.some((s) => s.occupantId !== null);
    if (!hasActive) {
      const severity: CanonicalDiagnostic['severity'] =
        index === 0 && PRESET_CANONICAL_POLICY.entryBandMustBeNonEmpty ? 'error' : 'info';
      diagnostics.push({
        severity,
        code: index === 0 ? 'NON_CANONICAL_EMPTY_ENTRY_BAND' : 'NON_CANONICAL_EMPTY_BAND',
        message: `Band "${band.id}" (semanticRole: ${band.semanticRole}) has no active occupant.`,
      });
    }
  });

  const seen = new Map<string, number>();
  for (const band of preset.bands) {
    seen.set(band.semanticRole, (seen.get(band.semanticRole) ?? 0) + 1);
  }
  const allowedToRepeat = new Set<string>(PRESET_CANONICAL_POLICY.semanticRolesAllowedToRepeat);
  for (const [role, count] of seen) {
    if (count > 1 && !allowedToRepeat.has(role)) {
      diagnostics.push({
        severity: 'warning',
        code: 'NON_CANONICAL_SEMANTIC_REUSE',
        message: `SemanticRole "${role}" appears ${count} times in preset "${preset.id}"; only ${[...allowedToRepeat].join(', ')} may repeat.`,
      });
    }
  }

  if (PRESET_CANONICAL_POLICY.recognitionMustBeLast) {
    const recognitionIndex = preset.bands.findIndex((b) => b.semanticRole === 'recognition');
    if (recognitionIndex !== -1 && recognitionIndex !== preset.bands.length - 1) {
      diagnostics.push({
        severity: 'warning',
        code: 'NON_CANONICAL_BAND_ORDER',
        message: `Band with semanticRole "recognition" must be the last band in preset "${preset.id}".`,
      });
    }
  }

  return diagnostics;
}
