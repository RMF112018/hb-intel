/**
 * @file shimmer.ts
 * @description Shared shimmer animation styles for @hbc/ui-kit.
 *
 * Convention: Any component requiring shimmer loading animation imports
 * the `useShimmerStyles` hook from this module. Do not duplicate shimmer
 * keyframes or animation styles in individual component files.
 *
 * Traceability:
 * - PH4C.7 §5.C.7 (Shimmer Infrastructure)
 * - D-PH4C-03 (documentation/traceability convention for gated implementation)
 *
 * Usage Example:
 *   const shimmerStyles = useShimmerStyles();
 *   <div className={shimmerStyles.shimmerContainer}>
 *     <div className={shimmerStyles.shimmerRow} style={{ width: '90%' }} />
 *     <div className={shimmerStyles.shimmerRow} style={{ width: '75%' }} />
 *   </div>
 *
 * Accessibility:
 * - The `prefers-reduced-motion` media query disables animation for users
 *   with motion sensitivity or vestibular disorders.
 * - Shimmer containers should have `aria-busy="true"` and `aria-label="Loading..."`
 *   for screen reader users.
 *
 * @see docs/architecture/adr/ADR-0074-shimmer-utility-convention.md
 */

import { makeStyles } from '@fluentui/react-components';

/**
 * useShimmerStyles
 *
 * Provides CSS class names for shimmer loading skeleton animations.
 * All styles use semantic CSS variables and include accessibility fallbacks.
 *
 * Traceability:
 * - PH4C.7 §5.C.7
 * - D-PH4C-03
 */
export const useShimmerStyles = makeStyles({
  /**
   * shimmerContainer
   * Wrapper for a group of shimmer rows.
   * Flex layout with vertical stacking and consistent gap.
   */
  shimmerContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '12px 0',
    width: '100%',
  },

  /**
   * shimmerRow
   * Individual shimmer placeholder line.
   * Animated gradient from left to right with infinite loop.
   * Height set to typical text line height (16px).
   */
  shimmerRow: {
    height: '16px',
    borderRadius: '4px',
    // Shared gradient convention used by all shimmer consumers.
    backgroundImage:
      'linear-gradient(90deg, var(--hbc-surface-2) 25%, var(--hbc-surface-3) 50%, var(--hbc-surface-2) 75%)',
    backgroundSize: '200% 100%',
    // Keyframe animation convention for shared shimmer.
    animationName: {
      from: { backgroundPosition: '200% 0' },
      to: { backgroundPosition: '-200% 0' },
    },
    animationDuration: '1.5s',
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
    // High contrast mode: disable animation, use solid background.
    '@media (forced-colors: active)': {
      animation: 'none',
      backgroundImage: 'none',
      backgroundColor: 'var(--hbc-surface-2)',
      border: '1px solid CanvasText',
    },
    // Accessibility: disable animation if user prefers reduced motion.
    '@media (prefers-reduced-motion: reduce)': {
      animation: 'none',
      backgroundImage: 'none',
      backgroundColor: 'var(--hbc-surface-2)',
    },
  },

  /**
   * shimmerRowWide
   * Wide placeholder (typically 90% of container width).
   * Used for full-width text lines or headers.
   */
  shimmerRowWide: {
    height: '16px',
    borderRadius: '4px',
    width: '90%',
    backgroundImage:
      'linear-gradient(90deg, var(--hbc-surface-2) 25%, var(--hbc-surface-3) 50%, var(--hbc-surface-2) 75%)',
    backgroundSize: '200% 100%',
    animationName: {
      from: { backgroundPosition: '200% 0' },
      to: { backgroundPosition: '-200% 0' },
    },
    animationDuration: '1.5s',
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
    '@media (forced-colors: active)': {
      animation: 'none',
      backgroundImage: 'none',
      backgroundColor: 'var(--hbc-surface-2)',
      border: '1px solid CanvasText',
    },
    '@media (prefers-reduced-motion: reduce)': {
      animation: 'none',
      backgroundImage: 'none',
      backgroundColor: 'var(--hbc-surface-2)',
    },
  },

  /**
   * shimmerRowMedium
   * Medium placeholder (typically 75% of container width).
   * Used for secondary text or supporting information.
   */
  shimmerRowMedium: {
    height: '16px',
    borderRadius: '4px',
    width: '75%',
    backgroundImage:
      'linear-gradient(90deg, var(--hbc-surface-2) 25%, var(--hbc-surface-3) 50%, var(--hbc-surface-2) 75%)',
    backgroundSize: '200% 100%',
    animationName: {
      from: { backgroundPosition: '200% 0' },
      to: { backgroundPosition: '-200% 0' },
    },
    animationDuration: '1.5s',
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
    '@media (forced-colors: active)': {
      animation: 'none',
      backgroundImage: 'none',
      backgroundColor: 'var(--hbc-surface-2)',
      border: '1px solid CanvasText',
    },
    '@media (prefers-reduced-motion: reduce)': {
      animation: 'none',
      backgroundImage: 'none',
      backgroundColor: 'var(--hbc-surface-2)',
    },
  },

  /**
   * shimmerRowNarrow
   * Narrow placeholder (typically 60% of container width).
   * Used for short text snippets or metadata.
   */
  shimmerRowNarrow: {
    height: '16px',
    borderRadius: '4px',
    width: '60%',
    backgroundImage:
      'linear-gradient(90deg, var(--hbc-surface-2) 25%, var(--hbc-surface-3) 50%, var(--hbc-surface-2) 75%)',
    backgroundSize: '200% 100%',
    animationName: {
      from: { backgroundPosition: '200% 0' },
      to: { backgroundPosition: '-200% 0' },
    },
    animationDuration: '1.5s',
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
    '@media (forced-colors: active)': {
      animation: 'none',
      backgroundImage: 'none',
      backgroundColor: 'var(--hbc-surface-2)',
      border: '1px solid CanvasText',
    },
    '@media (prefers-reduced-motion: reduce)': {
      animation: 'none',
      backgroundImage: 'none',
      backgroundColor: 'var(--hbc-surface-2)',
    },
  },

  /**
   * shimmerRowTall
   * Taller placeholder for elements like thumbnails or avatar skeletons.
   * Height: 40px.
   */
  shimmerRowTall: {
    height: '40px',
    borderRadius: '4px',
    width: '40px',
    backgroundImage:
      'linear-gradient(90deg, var(--hbc-surface-2) 25%, var(--hbc-surface-3) 50%, var(--hbc-surface-2) 75%)',
    backgroundSize: '200% 100%',
    animationName: {
      from: { backgroundPosition: '200% 0' },
      to: { backgroundPosition: '-200% 0' },
    },
    animationDuration: '1.5s',
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
    '@media (forced-colors: active)': {
      animation: 'none',
      backgroundImage: 'none',
      backgroundColor: 'var(--hbc-surface-2)',
      border: '1px solid CanvasText',
    },
    '@media (prefers-reduced-motion: reduce)': {
      animation: 'none',
      backgroundImage: 'none',
      backgroundColor: 'var(--hbc-surface-2)',
    },
  },

  /**
   * shimmerRowCircle
   * Circular placeholder for avatar or icon skeletons.
   * Width and height both 40px; border-radius 50% for circle.
   */
  shimmerRowCircle: {
    height: '40px',
    width: '40px',
    borderRadius: '50%',
    backgroundImage:
      'linear-gradient(90deg, var(--hbc-surface-2) 25%, var(--hbc-surface-3) 50%, var(--hbc-surface-2) 75%)',
    backgroundSize: '200% 100%',
    animationName: {
      from: { backgroundPosition: '200% 0' },
      to: { backgroundPosition: '-200% 0' },
    },
    animationDuration: '1.5s',
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
    '@media (forced-colors: active)': {
      animation: 'none',
      backgroundImage: 'none',
      backgroundColor: 'var(--hbc-surface-2)',
      border: '1px solid CanvasText',
    },
    '@media (prefers-reduced-motion: reduce)': {
      animation: 'none',
      backgroundImage: 'none',
      backgroundColor: 'var(--hbc-surface-2)',
    },
  },
});

// Export type for consumers.
export type ShimmerStyles = ReturnType<typeof useShimmerStyles>;
