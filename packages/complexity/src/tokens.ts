/**
 * Design tokens used by complexity components.
 *
 * These are inlined from @hbc/ui-kit/theme to avoid a cyclic dependency
 * (@hbc/complexity is Layer 2; @hbc/ui-kit is Layer 4 and depends on complexity).
 * Values must stay in sync with the canonical definitions in @hbc/ui-kit/theme.
 */

export const HBC_PRIMARY_BLUE = '#004B87' as const;

export const HBC_SURFACE_LIGHT = {
  'surface-0': '#FFFFFF',
  'surface-1': '#FAFBFC',
  'surface-2': '#F0F2F5',
  'surface-3': '#E4E7EB',
  'border-default': '#D1D5DB',
  'border-focus': '#004B87',
  'text-primary': '#1A1D23',
  'text-muted': '#6B7280',
  'responsibility-bg': '#F0F7FF',
  'surface-active': '#E8F1F8',
  'destructive-bg': '#FEE2E2',
  'destructive-text': '#991B1B',
  'destructive-bg-hover': '#FECACA',
} as const;

export const HBC_SPACE_XS = 4;
export const HBC_SPACE_SM = 8;
export const HBC_SPACE_MD = 16;

export const HBC_RADIUS_XL = '8px' as const;
export const HBC_RADIUS_FULL = '50%' as const;

export const TRANSITION_FAST = '150ms' as const;
