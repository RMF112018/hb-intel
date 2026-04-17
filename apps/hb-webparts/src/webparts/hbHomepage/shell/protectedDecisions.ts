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

/**
 * Protected entry-state decisions that no persisted payload or future
 * control panel may override. These are code-governed by the breakpoint
 * spec and shell architecture.
 */
export const PROTECTED_ENTRY_STATE_RULES = {
  tabletPortraitForceSingleColumn: true,
  phoneForceSingleColumn: true,
  phoneLandscapeForceSingleColumn: true,
  firstLanePairingConditional: true,
  firstLaneDominantLeftWhenPaired: true,
  shortHeightConstrainedCompactBanner: true,
  firstLaneMustBeginOnFirstView: true,
  recognitionCeilingContextual: true,
} as const;

/**
 * Configurable decisions that a future maintainer may safely change
 * through a control panel or persisted payload, within governance bounds.
 */
export const CONFIGURABLE_DECISIONS = {
  presetSelection: true,
  optionalOccupantVisibility: true,
  limitedReorderWithinCompatibleBands: true,
  compactVsStandardTreatment: true,
  actionBudgetMetadataReferences: true,
} as const;

export type ProtectedEntryStateRule = keyof typeof PROTECTED_ENTRY_STATE_RULES;
export type ConfigurableDecision = keyof typeof CONFIGURABLE_DECISIONS;

export function isProtectedEntryStateRule(key: string): key is ProtectedEntryStateRule {
  return key in PROTECTED_ENTRY_STATE_RULES;
}

export function isConfigurableDecision(key: string): key is ConfigurableDecision {
  return key in CONFIGURABLE_DECISIONS;
}
