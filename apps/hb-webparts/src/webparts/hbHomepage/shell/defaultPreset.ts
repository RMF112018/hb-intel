import type { ShellPreset } from './shellTypes.js';

export const DEFAULT_PRESET: ShellPreset = {
  id: 'default-v2',
  title: 'Flagship Homepage Layout',
  description:
    'Operational-anchor first lane pairing Project Portfolio Spotlight with Company Pulse, followed by editorial and contextual bands.',
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
          id: 'slot-company-pulse',
          occupantId: 'company-pulse',
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
          id: 'slot-company-pulse-full',
          occupantId: null,
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
} as const;
