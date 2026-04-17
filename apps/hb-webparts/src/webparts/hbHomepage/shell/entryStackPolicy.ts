// =============================================================================
// Entry-stack policy contract (shell-facing)
// -----------------------------------------------------------------------------
// Cross-reference:
//   - Production-adjacent mirror lives at
//     `apps/hb-webparts/src/homepage/entryStack/entryStackContract.ts` and
//     `apps/hb-webparts/src/homepage/entryStack/entryStackOrchestration.ts`.
//     Those files are the seam shared by `mount.tsx` and
//     `ReferenceHomepageComposition.tsx`.
//   - When adjusting budgets here, update the production-adjacent
//     `ENTRY_STACK_BUDGETS` in tandem so the two sides of the orchestration
//     seam stay aligned. The alignment map `SHELL_ENTRY_STATE_TO_DEVICE_CLASS`
//     in `entryStackOrchestration.ts` documents the state-id mapping.
// -----------------------------------------------------------------------------
// This file is the shell-facing governance artifact for the homepage
// entry stack: flagship hero, priority actions, and the first shell lane.
// It encodes the budgets and postures from
// `docs/reference/shell/HB-Shell-Entry-Breakpoint-Spec.md` into a typed,
// code-governed model so the shell, the hero webpart, the priority-actions
// webpart, preview harnesses, and a future governed control panel can all
// reference the same source of truth without being merged into one
// runtime component.
//
// Shell-ownership boundary: this policy does not redesign the hero or
// the priority-actions surface. It exposes read-only metadata and
// helpers so each independently mounted surface can honor the same
// budgets. Reaching into a child webpart to change its internals is
// still forbidden — see `../hbHomepageContract.ts`.
//
// Protected vs configurable split:
//   - `PROTECTED_ENTRY_STACK_RULES` encodes non-negotiable postures
//     (first-lane-first-view, short-height posture, single-column
//     forcing on tablet portrait and phones, hero-dominance ceiling).
//     These are code-governed and MUST NOT be overridden by persisted
//     payloads or control-panel configuration.
//   - `CONFIGURABLE_ENTRY_STACK_REFERENCES` names the bounded surface a
//     future control panel may safely reference (action labels,
//     overflow affordance wording, chosen numeric within a budget
//     range). No freeform editor behavior is enabled.
// =============================================================================

import type { ShellEntryState, ShellEntryStateId } from './shellTypes.js';

/**
 * A numeric budget expressed as a recommended range in CSS pixels. A
 * child surface that chooses a specific value within the range honors
 * the policy; a value outside the range is a policy violation and
 * should be surfaced as a diagnostic.
 */
export interface PixelBudgetRange {
  readonly min: number;
  readonly max: number;
}

/**
 * A count budget expressed as a recommended range of visible items.
 * Used for visible primary actions in the priority-actions band.
 */
export interface CountBudgetRange {
  readonly min: number;
  readonly max: number;
}

/**
 * How overflow is handled when the action inventory exceeds the
 * visible-actions budget. Independent of which visuals a child surface
 * uses to realize the affordance.
 */
export type OverflowPosture =
  /** Overflow destination is a single `More tools` affordance. */
  | 'more-tools'
  /** Overflow destination is a bottom-sheet / action-sheet style container. */
  | 'sheet'
  /** Overflow is expressed through a horizontally scrollable strip. */
  | 'scroll-strip'
  /** Overflow may be `sheet` or `more-tools` depending on platform. */
  | 'sheet-or-more-tools'
  /** Overflow may be `scroll-strip` or `sheet` depending on container height. */
  | 'strip-or-sheet';

/**
 * Expectation for the first shell lane on first view at this entry
 * class. `begin-on-first-view` is the default and is protected by
 * `PROTECTED_ENTRY_STACK_RULES.firstLaneBeginsOnFirstView`.
 */
export type FirstLaneFirstViewExpectation =
  /** The first shell lane must start on initial load. */
  | 'begin-on-first-view'
  /** Large fraction of the first lane should be visible without scroll. */
  | 'top-portion-visible';

/**
 * Posture the shell adopts under short-height constraints (phone
 * landscape and other short-viewport situations). Always the most
 * compact stance; the shell never expands the hero to consume the
 * remaining vertical budget.
 */
export type ShortHeightPosture =
  /** Not a short-height entry class; no special posture applies. */
  | 'not-applicable'
  /** Compact hero banner + fast actions + immediate first lane. */
  | 'compact-banner';

/**
 * Optional spacing guidance between entry-stack segments, where the
 * governing spec encodes specific budgets. Not every entry class
 * receives explicit spacing guidance; absent values mean "follow the
 * ambient density for this class."
 */
export interface EntryStackSpacingBudget {
  /** Gap between hero base and the priority-actions band. */
  readonly heroToActionsGap?: PixelBudgetRange;
  /** Gap between the priority-actions band and the first shell lane. */
  readonly actionsToFirstLaneGap?: PixelBudgetRange;
}

/**
 * The shell-facing entry-stack policy for a single entry class.
 */
export interface EntryStackPolicy {
  /** The shell entry-state id this policy applies to. */
  readonly entryStateId: ShellEntryStateId;
  /** Human-readable class label for diagnostics and harness output. */
  readonly label: string;
  /** Recommended hero height budget in CSS pixels. */
  readonly heroHeightBudgetPx: PixelBudgetRange;
  /** Recommended visible primary-actions budget. */
  readonly visiblePrimaryActionsBudget: CountBudgetRange;
  /** How overflow beyond the visible budget is surfaced. */
  readonly overflowPosture: OverflowPosture;
  /** First shell-lane first-view expectation. */
  readonly firstLaneFirstView: FirstLaneFirstViewExpectation;
  /** Short-height fallback posture; `'not-applicable'` for wide classes. */
  readonly shortHeightPosture: ShortHeightPosture;
  /** Optional spacing guidance between entry-stack segments. */
  readonly spacing?: EntryStackSpacingBudget;
  /** Whether this entry class forces a single-column first lane. */
  readonly firstLaneSingleColumnOnly: boolean;
}

// -----------------------------------------------------------------------------
// Policy values encoded from HB-Shell-Entry-Breakpoint-Spec.md
// -----------------------------------------------------------------------------

const ULTRAWIDE_DESKTOP_POLICY: EntryStackPolicy = {
  entryStateId: 'ultrawide-desktop',
  label: 'Premium wide composition',
  heroHeightBudgetPx: { min: 420, max: 460 },
  visiblePrimaryActionsBudget: { min: 6, max: 6 },
  overflowPosture: 'more-tools',
  firstLaneFirstView: 'begin-on-first-view',
  shortHeightPosture: 'not-applicable',
  spacing: {
    heroToActionsGap: { min: 24, max: 24 },
    actionsToFirstLaneGap: { min: 28, max: 32 },
  },
  firstLaneSingleColumnOnly: false,
};

const STANDARD_LAPTOP_POLICY: EntryStackPolicy = {
  entryStateId: 'standard-laptop',
  label: 'Compressed flagship desktop (primary baseline)',
  heroHeightBudgetPx: { min: 340, max: 380 },
  visiblePrimaryActionsBudget: { min: 5, max: 5 },
  overflowPosture: 'more-tools',
  firstLaneFirstView: 'top-portion-visible',
  shortHeightPosture: 'not-applicable',
  firstLaneSingleColumnOnly: false,
};

const TABLET_LANDSCAPE_POLICY: EntryStackPolicy = {
  entryStateId: 'tablet-landscape',
  label: 'Tablet landscape guided',
  heroHeightBudgetPx: { min: 280, max: 320 },
  visiblePrimaryActionsBudget: { min: 4, max: 6 },
  overflowPosture: 'more-tools',
  firstLaneFirstView: 'begin-on-first-view',
  shortHeightPosture: 'not-applicable',
  // Tablet landscape is conditionally allowed to pair in the first lane
  // but the governing spec and breakpointPolicy both treat tablet
  // landscape as single-column for first-lane pairing; keep this flag
  // aligned with `firstLanePairingAllowed === false`.
  firstLaneSingleColumnOnly: true,
};

const TABLET_PORTRAIT_LARGE_POLICY: EntryStackPolicy = {
  entryStateId: 'tablet-portrait-large',
  label: 'Guided single-column',
  heroHeightBudgetPx: { min: 240, max: 280 },
  visiblePrimaryActionsBudget: { min: 4, max: 4 },
  overflowPosture: 'more-tools',
  firstLaneFirstView: 'begin-on-first-view',
  shortHeightPosture: 'not-applicable',
  firstLaneSingleColumnOnly: true,
};

const TABLET_PORTRAIT_POLICY: EntryStackPolicy = {
  entryStateId: 'tablet-portrait',
  label: 'Large-mobile style',
  heroHeightBudgetPx: { min: 240, max: 280 },
  visiblePrimaryActionsBudget: { min: 4, max: 4 },
  overflowPosture: 'more-tools',
  firstLaneFirstView: 'begin-on-first-view',
  shortHeightPosture: 'not-applicable',
  firstLaneSingleColumnOnly: true,
};

const PHONE_PORTRAIT_POLICY: EntryStackPolicy = {
  entryStateId: 'phone-portrait',
  label: 'Immediate mobile entry',
  heroHeightBudgetPx: { min: 190, max: 220 },
  visiblePrimaryActionsBudget: { min: 3, max: 4 },
  overflowPosture: 'sheet-or-more-tools',
  firstLaneFirstView: 'begin-on-first-view',
  shortHeightPosture: 'not-applicable',
  firstLaneSingleColumnOnly: true,
};

const PHONE_LANDSCAPE_POLICY: EntryStackPolicy = {
  entryStateId: 'phone-landscape',
  label: 'Compact banner + fast actions',
  heroHeightBudgetPx: { min: 120, max: 160 },
  visiblePrimaryActionsBudget: { min: 0, max: 4 },
  overflowPosture: 'strip-or-sheet',
  firstLaneFirstView: 'begin-on-first-view',
  shortHeightPosture: 'compact-banner',
  firstLaneSingleColumnOnly: true,
};

/**
 * Canonical shell-facing entry-stack policy keyed by shell entry-state id.
 * Consumers should prefer {@link resolveEntryStackPolicy} or
 * {@link getEntryStackPolicy} over direct map access.
 */
export const ENTRY_STACK_POLICY_BY_ENTRY_STATE: Readonly<
  Record<ShellEntryStateId, EntryStackPolicy>
> = Object.freeze({
  'ultrawide-desktop': ULTRAWIDE_DESKTOP_POLICY,
  'standard-laptop': STANDARD_LAPTOP_POLICY,
  'tablet-landscape': TABLET_LANDSCAPE_POLICY,
  'tablet-portrait-large': TABLET_PORTRAIT_LARGE_POLICY,
  'tablet-portrait': TABLET_PORTRAIT_POLICY,
  'phone-portrait': PHONE_PORTRAIT_POLICY,
  'phone-landscape': PHONE_LANDSCAPE_POLICY,
});

/**
 * Return the policy for a given entry-state id.
 */
export function getEntryStackPolicy(id: ShellEntryStateId): EntryStackPolicy {
  return ENTRY_STACK_POLICY_BY_ENTRY_STATE[id];
}

/**
 * Return the policy for a resolved {@link ShellEntryState}.
 * Callers that already have an entry-state object should prefer this.
 */
export function resolveEntryStackPolicy(entryState: ShellEntryState): EntryStackPolicy {
  return ENTRY_STACK_POLICY_BY_ENTRY_STATE[entryState.id];
}

// -----------------------------------------------------------------------------
// Protected entry-stack rules
// -----------------------------------------------------------------------------

/**
 * Non-negotiable, code-governed postures for the entry stack. These are
 * the invariants a persisted payload or future control panel MUST NOT
 * override. Changes to these rules require a deliberate architectural
 * decision (ADR-class change), not a configuration knob.
 */
export const PROTECTED_ENTRY_STACK_RULES = Object.freeze({
  /** The first shell lane must begin on first view at every entry class. */
  firstLaneBeginsOnFirstView: true,
  /** The hero must not expand past its budget just because width permits. */
  heroHeightBudgetCeilingEnforced: true,
  /** Tablet portrait states force a single-column first lane. */
  tabletPortraitForceSingleColumn: true,
  /** Phone portrait/landscape force a single-column first lane. */
  phoneForceSingleColumn: true,
  /** Short-height states adopt compact-banner posture; never expand hero. */
  shortHeightCompactBannerMandatory: true,
  /** Overflow never turns into a flat directory; always a governed affordance. */
  overflowMustRemainGoverned: true,
} as const);

export type ProtectedEntryStackRule = keyof typeof PROTECTED_ENTRY_STACK_RULES;

/**
 * Bounded references a future governed control panel may safely use.
 * Any configuration expressed through these references must remain
 * inside the code-governed budgets in this file.
 */
export const CONFIGURABLE_ENTRY_STACK_REFERENCES = Object.freeze({
  /** Chosen numeric hero height within the per-class budget range. */
  heroHeightWithinBudget: true,
  /** Chosen number of visible actions within the per-class count budget. */
  visibleActionsWithinBudget: true,
  /** Wording/label of the overflow affordance (e.g., `More tools`). */
  overflowAffordanceLabel: true,
  /** Which specific authored actions the priority band exposes first. */
  authoredActionSelection: true,
} as const);

export type ConfigurableEntryStackReference = keyof typeof CONFIGURABLE_ENTRY_STACK_REFERENCES;

// -----------------------------------------------------------------------------
// Validation helpers (diagnostic-friendly, no behavior-mutation)
// -----------------------------------------------------------------------------

/**
 * Check whether a proposed hero height (px) is within the class budget.
 */
export function isHeroHeightWithinBudget(
  id: ShellEntryStateId,
  heightPx: number,
): boolean {
  const { heroHeightBudgetPx } = getEntryStackPolicy(id);
  return heightPx >= heroHeightBudgetPx.min && heightPx <= heroHeightBudgetPx.max;
}

/**
 * Check whether a proposed visible-actions count is within the class budget.
 */
export function isVisibleActionCountWithinBudget(
  id: ShellEntryStateId,
  count: number,
): boolean {
  const { visiblePrimaryActionsBudget } = getEntryStackPolicy(id);
  return (
    count >= visiblePrimaryActionsBudget.min && count <= visiblePrimaryActionsBudget.max
  );
}
