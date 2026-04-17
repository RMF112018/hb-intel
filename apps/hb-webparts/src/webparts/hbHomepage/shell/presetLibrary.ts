import type { ShellPreset } from './shellTypes.js';
import { DEFAULT_PRESET } from './defaultPreset.js';

export const EDITORIAL_FOCUS_PRESET: ShellPreset = {
  id: 'editorial-focus-v1',
  title: 'Editorial Focus Layout',
  description:
    'Pairs Company Pulse and Leadership Message in a dominant first band to strengthen the editorial anchor. Remaining bands follow standard single-column order.',
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
]);

export function getPreset(id: string): ShellPreset | undefined {
  return APPROVED_PRESETS.get(id);
}

export function getPresetOrDefault(id: string | undefined): ShellPreset {
  if (!id) return DEFAULT_PRESET;
  return APPROVED_PRESETS.get(id) ?? DEFAULT_PRESET;
}
