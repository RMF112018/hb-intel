import type {
  BandSemanticRole,
  ShellBandRecipeId,
  ShellEntryStateId,
  SlotRole,
} from './shellTypes.js';

export interface ShellBandRecipeRule {
  readonly id: ShellBandRecipeId;
  readonly label: string;
  readonly allowedSlotRoles: readonly SlotRole[];
  readonly minActiveSlots: number;
  readonly maxActiveSlots: number;
  readonly allowedSemanticRoles: readonly BandSemanticRole[];
  readonly eligibleEntryStates: readonly ShellEntryStateId[];
  readonly fallbackRecipe: ShellBandRecipeId;
}

const WIDE_ENTRY_STATES: readonly ShellEntryStateId[] = [
  'ultrawide-desktop',
  'standard-laptop',
];

const MULTI_COLUMN_ENTRY_STATES: readonly ShellEntryStateId[] = [
  'ultrawide-desktop',
  'standard-laptop',
  'tablet-landscape',
];

const ALL_ENTRY_STATES: readonly ShellEntryStateId[] = [
  'ultrawide-desktop',
  'standard-laptop',
  'tablet-landscape',
  'tablet-portrait-large',
  'tablet-portrait',
  'phone-portrait',
  'phone-landscape',
];

export const SHELL_BAND_RECIPE_RULES: Readonly<
  Record<ShellBandRecipeId, ShellBandRecipeRule>
> = Object.freeze({
  'feature-pair': {
    id: 'feature-pair',
    label: 'Feature pair',
    allowedSlotRoles: ['primary', 'secondary'],
    minActiveSlots: 2,
    maxActiveSlots: 2,
    allowedSemanticRoles: ['operational-spotlight', 'communications-newsroom'],
    eligibleEntryStates: WIDE_ENTRY_STATES,
    fallbackRecipe: 'single-column-fallback',
  },
  'balanced-two-up': {
    id: 'balanced-two-up',
    label: 'Balanced two-up editorial',
    allowedSlotRoles: ['primary', 'secondary'],
    minActiveSlots: 2,
    maxActiveSlots: 2,
    allowedSemanticRoles: ['communications-newsroom', 'communications-editorial'],
    eligibleEntryStates: MULTI_COLUMN_ENTRY_STATES,
    fallbackRecipe: 'single-column-fallback',
  },
  'asymmetric-two-up': {
    id: 'asymmetric-two-up',
    label: 'Asymmetric two-up editorial',
    allowedSlotRoles: ['primary', 'secondary'],
    minActiveSlots: 2,
    maxActiveSlots: 2,
    allowedSemanticRoles: ['communications-editorial', 'operational-spotlight'],
    eligibleEntryStates: WIDE_ENTRY_STATES,
    fallbackRecipe: 'single-column-fallback',
  },
  'feature-utility-strip': {
    id: 'feature-utility-strip',
    label: 'Feature and utility strip',
    allowedSlotRoles: ['primary', 'secondary', 'compact'],
    minActiveSlots: 2,
    maxActiveSlots: 2,
    allowedSemanticRoles: ['operational-spotlight', 'people-culture'],
    eligibleEntryStates: WIDE_ENTRY_STATES,
    fallbackRecipe: 'stacked-secondary-strip',
  },
  'stacked-full': {
    id: 'stacked-full',
    label: 'Stacked full-width',
    allowedSlotRoles: ['primary'],
    minActiveSlots: 1,
    maxActiveSlots: 1,
    allowedSemanticRoles: [
      'communications-newsroom',
      'communications-editorial',
      'operational-spotlight',
      'people-culture',
      'recognition',
    ],
    eligibleEntryStates: ALL_ENTRY_STATES,
    fallbackRecipe: 'single-column-fallback',
  },
  'stacked-secondary-strip': {
    id: 'stacked-secondary-strip',
    label: 'Stacked secondary strip',
    allowedSlotRoles: ['secondary', 'compact'],
    minActiveSlots: 1,
    maxActiveSlots: 2,
    allowedSemanticRoles: ['recognition', 'people-culture', 'communications-editorial'],
    eligibleEntryStates: ALL_ENTRY_STATES,
    fallbackRecipe: 'single-column-fallback',
  },
  'single-column-fallback': {
    id: 'single-column-fallback',
    label: 'Single-column constrained fallback',
    allowedSlotRoles: ['primary', 'secondary', 'compact'],
    minActiveSlots: 1,
    maxActiveSlots: 3,
    allowedSemanticRoles: [
      'communications-newsroom',
      'communications-editorial',
      'operational-spotlight',
      'people-culture',
      'recognition',
    ],
    eligibleEntryStates: ALL_ENTRY_STATES,
    fallbackRecipe: 'single-column-fallback',
  },
});

export function getBandRecipeRule(recipe: ShellBandRecipeId): ShellBandRecipeRule {
  return SHELL_BAND_RECIPE_RULES[recipe];
}
