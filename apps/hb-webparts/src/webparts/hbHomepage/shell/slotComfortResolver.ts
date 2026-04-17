import { getOccupant, areOccupantsPairableInBand, canOccupantPairAtWidth } from './occupantRegistry.js';
import type {
  ColumnSpan,
  OccupantId,
  ProminenceCeiling,
  ShellBand,
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

export interface BandLayoutResult {
  readonly columns: 1 | 2;
  readonly slots: readonly ResolvedSlot[];
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

function canBandPair(
  band: ShellBand,
  entryState: ShellEntryState,
  isEntryBand: boolean,
  containerWidth: number,
): boolean {
  if (isEntryBand && !entryState.firstLanePairingAllowed) return false;

  const activeSlots = band.slots.filter((s) => s.occupantId !== null);
  if (activeSlots.length < 2) return false;

  for (let i = 0; i < activeSlots.length; i++) {
    for (let j = i + 1; j < activeSlots.length; j++) {
      const a = activeSlots[i].occupantId!;
      const b = activeSlots[j].occupantId!;
      if (!areOccupantsPairableInBand(a, b)) return false;
    }
  }

  for (const slot of activeSlots) {
    const slotWidth = resolveSlotWidth(containerWidth, slot.columnSpan, 2);
    const comfort = checkOccupantComfort(slot.occupantId!, slotWidth, entryState);
    if (comfort.shouldStack) return false;
    if (!canOccupantPairAtWidth(slot.occupantId!, slotWidth)) return false;
  }

  return true;
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
      slots: activeSlots.map((s) => ({
        slot: s,
        comfort: {
          effectiveColumnSpan: 'full' as const,
          shouldStack: false,
          renderMode,
          reason: 'single-occupant',
        },
      })),
    };
  }

  const paired = canBandPair(band, entryState, isEntryBand, containerWidth);

  if (paired) {
    return {
      columns: 2,
      slots: activeSlots.map((slot) => ({
        slot,
        comfort: checkOccupantComfort(
          slot.occupantId!,
          resolveSlotWidth(containerWidth, slot.columnSpan, 2),
          entryState,
        ),
      })),
    };
  }

  return {
    columns: 1,
    slots: activeSlots.map((slot) => ({
      slot,
      comfort: {
        effectiveColumnSpan: 'full' as const,
        shouldStack: false,
        renderMode: resolveRenderMode(slot.occupantId!, containerWidth, entryState),
        reason: entryState.firstLanePairingAllowed ? 'comfort-forced-stack' : 'entry-state-single-column',
      },
    })),
  };
}
