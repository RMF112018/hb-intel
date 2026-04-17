import type { GovernanceCategory, ShellProtectedDecisions } from './shellTypes.js';

// =============================================================================
// Shell governance model — four-category taxonomy
// -----------------------------------------------------------------------------
// The shell recognizes four governance categories:
//
//   1. 'protected'             — Non-negotiable, code-governed. MUST NOT be
//                                overridden by persisted payloads, tenant
//                                configuration, or any future HB Homepage
//                                control panel. Encodes architectural
//                                invariants and breakpoint / entry-stack spec.
//   2. 'bounded-configurable'  — Maintainer-tunable within shell-enforced
//                                bounds. A future control panel may safely
//                                expose these. Every configurable key still
//                                passes through shell validation.
//   3. 'descriptive'           — Metadata for display, review, and authoring
//                                tools. Not directly enforced by layout logic.
//   4. 'shell-fit'             — Occupant capability metadata consumed by
//                                layout resolution (comfort, prominence,
//                                allowed bands, reorder domain, visibility
//                                eligibility).
//
// `SHELL_GOVERNANCE_MODEL` below is the single policy surface that aggregates
// these categories. `getGovernanceCategory(key)` returns the category for any
// known governance key.
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
export type ProtectedDecisionKey = keyof ShellProtectedDecisions;

export function isProtectedEntryStateRule(key: string): key is ProtectedEntryStateRule {
  return key in PROTECTED_ENTRY_STATE_RULES;
}

export function isConfigurableDecision(key: string): key is ConfigurableDecision {
  return key in CONFIGURABLE_DECISIONS;
}

/**
 * Occupant descriptor fields that layout resolution consumes as capability
 * metadata. These are 'shell-fit' category fields, not configurable.
 */
export const SHELL_FIT_DESCRIPTOR_KEYS = [
  'allowedSlotRoles',
  'prominenceCeiling',
  'firstLaneEligible',
  'comfort',
  'pairingRestrictions',
  'allowedBandSemantics',
  'reorderDomain',
  'visibilityEligibility',
] as const;

/**
 * Occupant descriptor fields that are purely descriptive for display / review.
 */
export const DESCRIPTIVE_DESCRIPTOR_KEYS = ['id', 'status', 'displayName', 'renderKey', 'persistedPolicyKeys'] as const;

export type ShellFitDescriptorKey = (typeof SHELL_FIT_DESCRIPTOR_KEYS)[number];
export type DescriptiveDescriptorKey = (typeof DESCRIPTIVE_DESCRIPTOR_KEYS)[number];

/**
 * SHELL_GOVERNANCE_MODEL — the shell's single policy surface.
 *
 * Every governance-relevant key in the shell lives in exactly one of these
 * category buckets. Consumers (validation, persistence, future control-panel
 * tooling) look here to determine what is enforceable versus decorative.
 */
export const SHELL_GOVERNANCE_MODEL = {
  protected: SHELL_PROTECTED_DECISIONS,
  entryStateRules: PROTECTED_ENTRY_STATE_RULES,
  configurable: CONFIGURABLE_DECISIONS,
  descriptors: {
    shellFit: SHELL_FIT_DESCRIPTOR_KEYS,
    descriptive: DESCRIPTIVE_DESCRIPTOR_KEYS,
  },
} as const;

/**
 * Returns the governance category for any known governance key.
 * Returns `undefined` for unknown keys so callers can distinguish between
 * "not governed by the shell" and "intentionally protected".
 */
export function getGovernanceCategory(key: string): GovernanceCategory | undefined {
  if (key in SHELL_PROTECTED_DECISIONS) return 'protected';
  if (key in PROTECTED_ENTRY_STATE_RULES) return 'protected';
  if (key in CONFIGURABLE_DECISIONS) return 'bounded-configurable';
  if ((SHELL_FIT_DESCRIPTOR_KEYS as readonly string[]).includes(key)) return 'shell-fit';
  if ((DESCRIPTIVE_DESCRIPTOR_KEYS as readonly string[]).includes(key)) return 'descriptive';
  return undefined;
}

export function isBoundedConfigurable(key: string): key is ConfigurableDecision {
  return isConfigurableDecision(key);
}
