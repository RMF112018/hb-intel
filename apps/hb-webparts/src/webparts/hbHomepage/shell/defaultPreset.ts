import type { ShellPreset } from './shellTypes.js';

export const DEFAULT_PRESET: ShellPreset = {
  id: 'default-v2',
  title: 'Flagship Homepage Layout',
  description:
    'Recipe-driven flagship layout with operational feature pairing, editorial two-up composition, and governed fallback-ready contextual bands.',
  bands: [
    {
      id: 'band-operational-spotlight',
      semanticRole: 'operational-spotlight',
      recipe: 'feature-pair',
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
      recipe: 'balanced-two-up',
      slots: [
        {
          id: 'slot-company-pulse-newsroom',
          occupantId: 'company-pulse',
          role: 'primary',
          columnSpan: 'major',
        },
        {
          id: 'slot-leadership-message-newsroom',
          occupantId: 'leadership-message',
          role: 'secondary',
          columnSpan: 'minor',
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
      id: 'band-safety-field',
      semanticRole: 'operational-spotlight',
      recipe: 'asymmetric-two-up',
      slots: [
        {
          id: 'slot-safety-field-excellence',
          occupantId: 'safety-field-excellence',
          role: 'primary',
          columnSpan: 'major',
        },
        {
          id: 'slot-company-pulse-safety',
          occupantId: 'company-pulse',
          role: 'secondary',
          columnSpan: 'minor',
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
} as const;
