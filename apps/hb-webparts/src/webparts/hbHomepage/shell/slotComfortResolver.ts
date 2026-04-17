import { getOccupant, areOccupantsPairableInBand } from './occupantRegistry.js';
import type {
  ColumnSpan,
  OccupantId,
  ShellBand,
  ShellEntryState,
  ShellSlot,
} from './shellTypes.js';

export interface SlotComfortResult {
  readonly effectiveColumnSpan: ColumnSpan;
  readonly shouldStack: boolean;
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

function checkOccupantComfort(
  occupantId: OccupantId,
  availableWidth: number,
): SlotComfortResult {
  const descriptor = getOccupant(occupantId);
  if (!descriptor) {
    return { effectiveColumnSpan: 'full', shouldStack: false, reason: 'unknown-occupant' };
  }

  if (availableWidth < descriptor.comfort.minWidth) {
    return {
      effectiveColumnSpan: 'full',
      shouldStack: true,
      reason: `width ${availableWidth}px below minimum ${descriptor.comfort.minWidth}px`,
    };
  }

  return { effectiveColumnSpan: 'full', shouldStack: false, reason: 'comfortable' };
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
    const comfort = checkOccupantComfort(slot.occupantId!, slotWidth);
    if (comfort.shouldStack) return false;
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
    return {
      columns: 1,
      slots: activeSlots.map((slot) => ({
        slot,
        comfort: { effectiveColumnSpan: 'full' as const, shouldStack: false, reason: 'single-occupant' },
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
        reason: entryState.firstLanePairingAllowed ? 'comfort-forced-stack' : 'entry-state-single-column',
      },
    })),
  };
}
