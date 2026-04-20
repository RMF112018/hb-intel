import type { ShellPreset } from './shellTypes.js';

/**
 * DEFAULT_PRESET — Phase-11 Wave-01 locked three-row flagship layout.
 *
 * Each of the six approved homepage surfaces appears exactly once.
 * Row 2 declares `orientation: 'right-dominant'`; Prompt-02 wires the
 * CSS column templates and validation to honor that handedness.
 * Until Prompt-02 lands, downstream CSS still renders left-dominant —
 * the preset identity itself is the authoritative target shape.
 */
export const DEFAULT_PRESET: ShellPreset = {
  id: 'default-v2',
  title: 'Flagship Homepage Layout',
  description:
    'Locked three-row flagship composition: Project Portfolio Spotlight + HB Kudos, then Safety + Company Pulse (right-dominant), then Leadership Message + People & Culture Public.',
  bands: [
    {
      id: 'band-row-1-operational-spotlight',
      semanticRole: 'operational-spotlight',
      recipe: 'feature-pair',
      orientation: 'left-dominant',
      slots: [
        {
          id: 'slot-row-1-project-portfolio-spotlight',
          occupantId: 'project-portfolio-spotlight',
          role: 'primary',
          columnSpan: 'major',
        },
        {
          id: 'slot-row-1-hb-kudos',
          occupantId: 'hb-kudos',
          role: 'secondary',
          columnSpan: 'minor',
        },
      ],
      maxDominantOccupants: 1,
    },
    {
      id: 'band-row-2-communications-newsroom',
      semanticRole: 'communications-newsroom',
      recipe: 'feature-pair',
      orientation: 'right-dominant',
      slots: [
        {
          id: 'slot-row-2-safety-field-excellence',
          occupantId: 'safety-field-excellence',
          role: 'secondary',
          columnSpan: 'minor',
        },
        {
          id: 'slot-row-2-company-pulse',
          occupantId: 'company-pulse',
          role: 'primary',
          columnSpan: 'major',
        },
      ],
      maxDominantOccupants: 1,
    },
    {
      id: 'band-row-3-communications-editorial',
      semanticRole: 'communications-editorial',
      recipe: 'asymmetric-two-up',
      orientation: 'left-dominant',
      slots: [
        {
          id: 'slot-row-3-leadership-message',
          occupantId: 'leadership-message',
          role: 'primary',
          columnSpan: 'major',
        },
        {
          id: 'slot-row-3-people-culture-public',
          occupantId: 'people-culture-public',
          role: 'secondary',
          columnSpan: 'minor',
        },
      ],
      maxDominantOccupants: 1,
    },
  ],
} as const;
