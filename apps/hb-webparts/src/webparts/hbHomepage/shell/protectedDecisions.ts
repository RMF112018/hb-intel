import type { ShellProtectedDecisions } from './shellTypes.js';

// =============================================================================
// Shell protected decisions — non-negotiable, code-governed
// -----------------------------------------------------------------------------
// The values in this file define the shell decisions that MUST NOT be
// overridden by persisted payloads, tenant configuration, or any future
// HB Homepage control panel. They encode the shell's architectural
// invariants and the governing breakpoint / entry-stack spec.
//
// Contrast: values in `CONFIGURABLE_DECISIONS` describe the bounded surface
// a future control panel may safely expose. Anything not in that list is
// either code-governed or out of scope for configuration.
//
// See `../hbHomepageContract.ts` for the shell-vs-child ownership boundary
// and the control-panel boundary statement.
// =============================================================================

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
