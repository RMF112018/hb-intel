import { getOccupant, areOccupantsPairableInBand, canOccupantPairAtWidth } from './occupantRegistry.js';
import { getBandRecipeRule } from './bandRecipes.js';
import type {
  ColumnSpan,
  OccupantId,
  ProminenceCeiling,
  ShellBand,
  ShellBandRecipeId,
  ShellEntryState,
  ShellSlot,
  SlotRole,
} from './shellTypes.js';

export type OccupantRenderMode = 'standard' | 'compact' | 'summary-collapsed';

export interface SlotComfortResult {
  readonly effectiveColumnSpan: ColumnSpan;
  readonly shouldStack: boolean;
  readonly renderMode: OccupantRenderMode;
  readonly reason: string;
}

/**
 * Inspectable reason for a band's pairing outcome. Emitted into shell
 * diagnostics so harnesses and tests can prove *why* a band paired or
 * stacked at a given entry state without re-running the resolver.
 */
export type PairingDecisionReason =
  /** Band has fewer than two active occupants; nothing to pair. */
  | 'single-occupant'
  /** Entry state denies first-lane pairing (tablet/phone/short-height). */
  | 'state-denies-pairing'
  /** Active occupants are on each other's prohibited-pairings list. */
  | 'prohibited-pairing'
  /** Slot widths fall below an occupant's comfort minimum at 2-col layout. */
  | 'comfort-forced-stack'
  /** Slot widths fall below the narrowest stable paired width for an occupant. */
  | 'below-narrowest-stable-paired-width'
  /** Recipe is not eligible for the current entry state. */
  | 'recipe-ineligible-state'
  /** Recipe does not permit pairing under current active-slot shape. */
  | 'recipe-rule-denies-pairing'
  /** All checks passed and the band is paired. */
  | 'paired';

export interface PairingDecision {
  readonly allowed: boolean;
  readonly reason: PairingDecisionReason;
}

export interface BandLayoutResult {
  readonly columns: 1 | 2;
  readonly recipe: ShellBandRecipeId;
  readonly fallbackRecipe: ShellBandRecipeId;
  readonly slots: readonly ResolvedSlot[];
  /** Why this band paired or stacked at the current entry state. */
  readonly pairingDecision: PairingDecision;
}

export interface ResolvedSlot {
  readonly slot: ShellSlot;
  readonly comfort: SlotComfortResult;
}

function resolveSlotWidth(containerWidth: number, columnSpan: ColumnSpan, bandColumns: number): number {
  if (bandColumns === 1 || columnSpan === 'full') return containerWidth;
  if (columnSpan === 'major') return containerWidth * 0.6;
  return containerWidth * 0.4;
}

function resolveRenderMode(
  occupantId: OccupantId,
  availableWidth: number,
  entryState: ShellEntryState,
): OccupantRenderMode {
  const descriptor = getOccupant(occupantId);
  if (!descriptor) return 'standard';

  const isSingleColumn = entryState.firstLaneColumns === 1;
  const isNarrow = availableWidth < descriptor.comfort.preferredWidth;

  if (
    isSingleColumn &&
    descriptor.comfort.supportsSummaryCollapse &&
    availableWidth < descriptor.comfort.minWidth * 1.2
  ) {
    return 'summary-collapsed';
  }

  if (isNarrow && descriptor.comfort.supportsCompact) {
    return 'compact';
  }

  return 'standard';
}

function checkOccupantComfort(
  occupantId: OccupantId,
  availableWidth: number,
  entryState: ShellEntryState,
): SlotComfortResult {
  const descriptor = getOccupant(occupantId);
  if (!descriptor) {
    return { effectiveColumnSpan: 'full', shouldStack: false, renderMode: 'standard', reason: 'unknown-occupant' };
  }

  if (availableWidth < descriptor.comfort.minWidth) {
    return {
      effectiveColumnSpan: 'full',
      shouldStack: true,
      renderMode: 'standard',
      reason: `width ${availableWidth}px below minimum ${descriptor.comfort.minWidth}px`,
    };
  }

  const renderMode = resolveRenderMode(occupantId, availableWidth, entryState);

  if (availableWidth < descriptor.comfort.preferredWidth) {
    return {
      effectiveColumnSpan: 'full',
      shouldStack: false,
      renderMode,
      reason: `constrained: ${availableWidth}px below preferred ${descriptor.comfort.preferredWidth}px`,
    };
  }

  return { effectiveColumnSpan: 'full', shouldStack: false, renderMode, reason: 'comfortable' };
}

const PROMINENCE_RANK: Record<ProminenceCeiling, number> = {
  anchor: 3,
  supporting: 2,
  contextual: 1,
};

const ROLE_PROMINENCE_FLOOR: Record<SlotRole, ProminenceCeiling> = {
  primary: 'supporting',
  secondary: 'contextual',
  compact: 'contextual',
};

export function isProminenceAllowed(
  prominenceCeiling: ProminenceCeiling,
  slotRole: SlotRole,
  isEntryBand: boolean,
): boolean {
  const floor = isEntryBand && slotRole === 'primary' ? 'anchor' : ROLE_PROMINENCE_FLOOR[slotRole];
  return PROMINENCE_RANK[prominenceCeiling] >= PROMINENCE_RANK[floor];
}

function decideBandPairing(
  band: ShellBand,
  entryState: ShellEntryState,
  isEntryBand: boolean,
  containerWidth: number,
): PairingDecision {
  const recipeRule = getBandRecipeRule(band.recipe);
  const activeSlots = band.slots.filter((s) => s.occupantId !== null);
  if (activeSlots.length < 2) {
    return { allowed: false, reason: 'single-occupant' };
  }

  // Entry band is additionally gated by the entry-state rule. Non-entry
  // bands are not gated by `firstLanePairingAllowed`, so they may still
  // pair at narrower states if comfort permits.
  if (isEntryBand && !entryState.firstLanePairingAllowed) {
    return { allowed: false, reason: 'state-denies-pairing' };
  }

  if (!recipeRule.eligibleEntryStates.includes(entryState.id)) {
    return { allowed: false, reason: 'recipe-ineligible-state' };
  }

  if (
    activeSlots.length < recipeRule.minActiveSlots ||
    activeSlots.length > recipeRule.maxActiveSlots
  ) {
    return { allowed: false, reason: 'recipe-rule-denies-pairing' };
  }

  for (let i = 0; i < activeSlots.length; i++) {
    for (let j = i + 1; j < activeSlots.length; j++) {
      const a = activeSlots[i].occupantId!;
      const b = activeSlots[j].occupantId!;
      if (!areOccupantsPairableInBand(a, b)) {
        return { allowed: false, reason: 'prohibited-pairing' };
      }
    }
  }

  for (const slot of activeSlots) {
    const slotWidth = resolveSlotWidth(containerWidth, slot.columnSpan, 2);
    const comfort = checkOccupantComfort(slot.occupantId!, slotWidth, entryState);
    if (comfort.shouldStack) {
      return { allowed: false, reason: 'comfort-forced-stack' };
    }
    if (!canOccupantPairAtWidth(slot.occupantId!, slotWidth)) {
      return { allowed: false, reason: 'below-narrowest-stable-paired-width' };
    }
  }

  return { allowed: true, reason: 'paired' };
}

export function resolveBandLayout(
  band: ShellBand,
  entryState: ShellEntryState,
  isEntryBand: boolean,
  containerWidth: number,
): BandLayoutResult {
  const activeSlots = band.slots.filter((s) => s.occupantId !== null);

  if (activeSlots.length <= 1) {
    const slot = activeSlots[0];
    const renderMode = slot?.occupantId
      ? resolveRenderMode(slot.occupantId, containerWidth, entryState)
      : 'standard' as OccupantRenderMode;
    return {
      columns: 1,
      recipe: band.recipe,
      fallbackRecipe: getBandRecipeRule(band.recipe).fallbackRecipe,
      slots: activeSlots.map((s) => ({
        slot: s,
        comfort: {
          effectiveColumnSpan: 'full' as const,
          shouldStack: false,
          renderMode,
          reason: 'single-occupant',
        },
      })),
      pairingDecision: { allowed: false, reason: 'single-occupant' },
    };
  }

  const pairingDecision = decideBandPairing(band, entryState, isEntryBand, containerWidth);

  if (pairingDecision.allowed) {
    return {
      columns: 2,
      recipe: band.recipe,
      fallbackRecipe: getBandRecipeRule(band.recipe).fallbackRecipe,
      slots: activeSlots.map((slot) => ({
        slot,
        comfort: checkOccupantComfort(
          slot.occupantId!,
          resolveSlotWidth(containerWidth, slot.columnSpan, 2),
          entryState,
        ),
      })),
      pairingDecision,
    };
  }

  return {
    columns: 1,
    recipe: band.recipe,
    fallbackRecipe: getBandRecipeRule(band.recipe).fallbackRecipe,
    slots: activeSlots.map((slot) => ({
      slot,
      comfort: {
        effectiveColumnSpan: 'full' as const,
        shouldStack: false,
        renderMode: resolveRenderMode(slot.occupantId!, containerWidth, entryState),
        reason: pairingDecision.reason,
      },
    })),
    pairingDecision,
  };
}
