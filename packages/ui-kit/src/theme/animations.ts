/**
 * HB Intel Design System — Animations & transitions
 * Blueprint §1d — Smooth micro-interactions, 60 fps animations
 */
import { makeStyles, shorthands } from '@griffel/react';

/** Griffel keyframe definitions for reuse across components */
export const keyframes = {
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  slideInRight: {
    from: { transform: 'translateX(100%)', opacity: 0 },
    to: { transform: 'translateX(0)', opacity: 1 },
  },
  slideInUp: {
    from: { transform: 'translateY(16px)', opacity: 0 },
    to: { transform: 'translateY(0)', opacity: 1 },
  },
  scaleIn: {
    from: { transform: 'scale(0.95)', opacity: 0 },
    to: { transform: 'scale(1)', opacity: 1 },
  },
  pulse: {
    '0%': { opacity: 1 },
    '50%': { opacity: 0.6 },
    '100%': { opacity: 1 },
  },
  shimmer: {
    '0%': { backgroundPosition: '-200% 0' },
    '100%': { backgroundPosition: '200% 0' },
  },
} as const;

/** Transition duration presets (ms) */
export const TRANSITION_FAST = '150ms' as const;
export const TRANSITION_NORMAL = '250ms' as const;
export const TRANSITION_SLOW = '400ms' as const;

/** Common transition presets for component use */
export const transitions = {
  fast: `all ${TRANSITION_FAST} ease-in-out`,
  normal: `all ${TRANSITION_NORMAL} ease-in-out`,
  slow: `all ${TRANSITION_SLOW} ease-in-out`,
} as const;

/** Shared animation utility styles (Griffel) */
export const useAnimationStyles = makeStyles({
  fadeIn: {
    animationName: keyframes.fadeIn,
    animationDuration: TRANSITION_NORMAL,
    animationFillMode: 'forwards',
  },
  slideInRight: {
    animationName: keyframes.slideInRight,
    animationDuration: TRANSITION_NORMAL,
    animationFillMode: 'forwards',
  },
  slideInUp: {
    animationName: keyframes.slideInUp,
    animationDuration: TRANSITION_NORMAL,
    animationFillMode: 'forwards',
  },
  scaleIn: {
    animationName: keyframes.scaleIn,
    animationDuration: TRANSITION_FAST,
    animationFillMode: 'forwards',
  },
  shimmer: {
    animationName: keyframes.shimmer,
    animationDuration: '1.5s',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'linear',
    backgroundImage: `linear-gradient(90deg, transparent 25%, rgba(255,255,255,0.4) 50%, transparent 75%)`,
    backgroundSize: '200% 100%',
  },
});
