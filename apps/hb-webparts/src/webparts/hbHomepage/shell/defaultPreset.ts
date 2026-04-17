import type { ShellPreset } from './shellTypes.js';

export const DEFAULT_PRESET: ShellPreset = {
  id: 'default-v1',
  title: 'Standard Homepage Layout',
  description: 'Single-column post-hero operating layer with five bands in canonical order.',
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
} as const;
