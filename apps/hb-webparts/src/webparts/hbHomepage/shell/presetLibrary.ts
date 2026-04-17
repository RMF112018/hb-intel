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
