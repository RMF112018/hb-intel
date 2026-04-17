import type { ShellEntryState, ShellEntryStateId } from './shellTypes.js';

export const SHELL_ENTRY_STATES: readonly ShellEntryState[] = [
  {
    id: 'ultrawide-desktop',
    label: 'Premium wide composition',
    minWidth: 1600,
    maxWidth: 2200,
    firstLaneColumns: 2,
    firstLanePairingAllowed: true,
    dominanceRule: 'left-dominant',
  },
  {
    id: 'standard-laptop',
    label: 'Compressed flagship desktop (primary baseline)',
    minWidth: 1180,
    maxWidth: 1599,
    firstLaneColumns: 2,
    firstLanePairingAllowed: true,
    dominanceRule: 'left-dominant',
  },
  {
    id: 'tablet-landscape',
    label: 'Tablet landscape guided',
    minWidth: 980,
    maxWidth: 1179,
    firstLaneColumns: 1,
    firstLanePairingAllowed: false,
    dominanceRule: 'single',
  },
  {
    id: 'tablet-portrait-large',
    label: 'Guided single-column',
    minWidth: 820,
    maxWidth: 979,
    firstLaneColumns: 1,
    firstLanePairingAllowed: false,
    dominanceRule: 'single',
  },
  {
    id: 'tablet-portrait',
    label: 'Large-mobile style',
    minWidth: 720,
    maxWidth: 819,
    firstLaneColumns: 1,
    firstLanePairingAllowed: false,
    dominanceRule: 'single',
  },
  {
    id: 'phone-portrait',
    label: 'Immediate mobile',
    minWidth: 320,
    maxWidth: 719,
    firstLaneColumns: 1,
    firstLanePairingAllowed: false,
    dominanceRule: 'single',
  },
  {
    id: 'phone-landscape',
    label: 'Compact banner + fast actions',
    minWidth: 480,
    maxWidth: 960,
    firstLaneColumns: 1,
    firstLanePairingAllowed: false,
    dominanceRule: 'single',
  },
] as const;

const WIDTH_ORDERED_STATES = SHELL_ENTRY_STATES.filter(
  (s) => s.id !== 'phone-landscape',
).sort((a, b) => b.minWidth - a.minWidth);

const PHONE_LANDSCAPE_STATE = SHELL_ENTRY_STATES.find(
  (s) => s.id === 'phone-landscape',
)!;

const FALLBACK_STATE = SHELL_ENTRY_STATES.find(
  (s) => s.id === 'phone-portrait',
)!;

export interface ContainerDimensions {
  readonly width: number;
  readonly height?: number;
}

const HEIGHT_CONSTRAINED_THRESHOLD = 500;

export function resolveEntryState(dimensions: ContainerDimensions): ShellEntryState {
  const { width, height } = dimensions;

  if (
    height !== undefined &&
    height < HEIGHT_CONSTRAINED_THRESHOLD &&
    width >= PHONE_LANDSCAPE_STATE.minWidth
  ) {
    return PHONE_LANDSCAPE_STATE;
  }

  for (const state of WIDTH_ORDERED_STATES) {
    if (width >= state.minWidth) {
      return state;
    }
  }

  return FALLBACK_STATE;
}

export function isFirstLanePairingAllowed(stateId: ShellEntryStateId): boolean {
  const state = SHELL_ENTRY_STATES.find((s) => s.id === stateId);
  return state?.firstLanePairingAllowed ?? false;
}

export function getEntryState(id: ShellEntryStateId): ShellEntryState | undefined {
  return SHELL_ENTRY_STATES.find((s) => s.id === id);
}
