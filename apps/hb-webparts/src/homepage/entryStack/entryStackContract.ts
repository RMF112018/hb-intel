export type EntryStackDeviceClass =
  | 'ultrawide-desktop'
  | 'standard-laptop'
  | 'tablet-landscape'
  | 'tablet-portrait'
  | 'phone-portrait-large'
  | 'phone-portrait-standard'
  | 'phone-landscape';

export interface EntryStackHeightRange {
  readonly min: number;
  readonly max: number;
}

export interface EntryStackBudget {
  readonly deviceClass: EntryStackDeviceClass;
  readonly heroHeight: EntryStackHeightRange;
  readonly heroToActionsGap: number;
  readonly actionsToFirstLaneGap: number;
  readonly maxVisibleActions: number;
  readonly firstLaneColumns: 1 | 2;
  readonly firstLaneMustBeginOnFirstView: true;
}

export const ENTRY_STACK_BUDGETS: readonly EntryStackBudget[] = [
  {
    deviceClass: 'ultrawide-desktop',
    heroHeight: { min: 420, max: 460 },
    heroToActionsGap: 24,
    actionsToFirstLaneGap: 28,
    maxVisibleActions: 6,
    firstLaneColumns: 2,
    firstLaneMustBeginOnFirstView: true,
  },
  {
    deviceClass: 'standard-laptop',
    heroHeight: { min: 340, max: 380 },
    heroToActionsGap: 20,
    actionsToFirstLaneGap: 24,
    maxVisibleActions: 5,
    firstLaneColumns: 2,
    firstLaneMustBeginOnFirstView: true,
  },
  {
    deviceClass: 'tablet-landscape',
    heroHeight: { min: 280, max: 320 },
    heroToActionsGap: 16,
    actionsToFirstLaneGap: 20,
    maxVisibleActions: 5,
    firstLaneColumns: 1,
    firstLaneMustBeginOnFirstView: true,
  },
  {
    deviceClass: 'tablet-portrait',
    heroHeight: { min: 240, max: 280 },
    heroToActionsGap: 14,
    actionsToFirstLaneGap: 16,
    maxVisibleActions: 4,
    firstLaneColumns: 1,
    firstLaneMustBeginOnFirstView: true,
  },
  {
    deviceClass: 'phone-portrait-large',
    heroHeight: { min: 200, max: 220 },
    heroToActionsGap: 12,
    actionsToFirstLaneGap: 14,
    maxVisibleActions: 4,
    firstLaneColumns: 1,
    firstLaneMustBeginOnFirstView: true,
  },
  {
    deviceClass: 'phone-portrait-standard',
    heroHeight: { min: 190, max: 210 },
    heroToActionsGap: 10,
    actionsToFirstLaneGap: 12,
    maxVisibleActions: 4,
    firstLaneColumns: 1,
    firstLaneMustBeginOnFirstView: true,
  },
  {
    deviceClass: 'phone-landscape',
    heroHeight: { min: 120, max: 160 },
    heroToActionsGap: 8,
    actionsToFirstLaneGap: 10,
    maxVisibleActions: 4,
    firstLaneColumns: 1,
    firstLaneMustBeginOnFirstView: true,
  },
] as const;

export const ENTRY_STACK_SEQUENCE = ['hero', 'actions', 'first-lane'] as const;
export type EntryStackPosition = (typeof ENTRY_STACK_SEQUENCE)[number];

const HEIGHT_CONSTRAINED_THRESHOLD = 500;

const WIDTH_ORDERED_BUDGETS = ENTRY_STACK_BUDGETS.filter(
  (b) => b.deviceClass !== 'phone-landscape',
);

const PHONE_LANDSCAPE_BUDGET = ENTRY_STACK_BUDGETS.find(
  (b) => b.deviceClass === 'phone-landscape',
)!;

const FALLBACK_BUDGET = ENTRY_STACK_BUDGETS.find(
  (b) => b.deviceClass === 'phone-portrait-standard',
)!;

interface EntryStackDimensions {
  readonly width: number;
  readonly height?: number;
}

export function resolveEntryStackBudget(dimensions: EntryStackDimensions): EntryStackBudget {
  const { width, height } = dimensions;

  if (
    height !== undefined &&
    height < HEIGHT_CONSTRAINED_THRESHOLD &&
    width >= 480
  ) {
    return PHONE_LANDSCAPE_BUDGET;
  }

  if (width >= 1600) return ENTRY_STACK_BUDGETS[0]!; // ultrawide-desktop
  if (width >= 1180) return ENTRY_STACK_BUDGETS[1]!; // standard-laptop
  if (width >= 980) return ENTRY_STACK_BUDGETS[2]!;  // tablet-landscape
  if (width >= 720) return ENTRY_STACK_BUDGETS[3]!;  // tablet-portrait
  if (width >= 430) return ENTRY_STACK_BUDGETS[4]!;  // phone-portrait-large
  if (width >= 375) return ENTRY_STACK_BUDGETS[5]!;  // phone-portrait-standard

  return FALLBACK_BUDGET;
}

export function getEntryStackBudget(
  deviceClass: EntryStackDeviceClass,
): EntryStackBudget | undefined {
  return ENTRY_STACK_BUDGETS.find((b) => b.deviceClass === deviceClass);
}
