import type { ShellProtectedDecisions } from './shellTypes.js';

export const SHELL_PROTECTED_DECISIONS: ShellProtectedDecisions = {
  postHeroBoundary: true,

  maxDominantPerBand: 1,

  prohibitedPairings: [['people-culture-public', 'hb-kudos']],

  protectedBandSemantics: [
    'communications-newsroom',
    'communications-editorial',
    'operational-spotlight',
    'people-culture',
    'recognition',
  ],
} as const;
