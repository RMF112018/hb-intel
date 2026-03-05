/**
 * HB Intel Design System — Animations & transitions
 * Blueprint §1d — Smooth micro-interactions, 60 fps animations
 */
import { makeStyles } from '@griffel/react';
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
    badgePulse: {
        '0%': { transform: 'scale(1)' },
        '50%': { transform: 'scale(1.1)' },
        '100%': { transform: 'scale(1)' },
    },
    crossfade: {
        from: { opacity: 0 },
        to: { opacity: 1 },
    },
    slideInFromBottom: {
        from: { transform: 'translateY(100%)' },
        to: { transform: 'translateY(0)' },
    },
};
/** Transition duration presets (ms) */
export const TRANSITION_FAST = '150ms';
export const TRANSITION_NORMAL = '250ms';
export const TRANSITION_SLOW = '400ms';
/** Named timing constants for interaction patterns (PH4.12) */
export const TIMING = {
    sidebarCollapse: '250ms',
    headerFade: '150ms',
    backgroundDim: '200ms',
    badgePulse: '300ms',
    crossfade: '200ms',
    skeletonSweep: '1500ms',
    focusActivation: '200ms',
    connectivityExpand: '100ms',
    buttonLoading: '150ms',
};
/** Common transition presets for component use */
export const transitions = {
    fast: `all ${TRANSITION_FAST} ease-in-out`,
    normal: `all ${TRANSITION_NORMAL} ease-in-out`,
    slow: `all ${TRANSITION_SLOW} ease-in-out`,
};
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
    badgePulse: {
        animationName: keyframes.badgePulse,
        animationDuration: TIMING.badgePulse,
        animationTimingFunction: 'ease-in-out',
        animationFillMode: 'forwards',
    },
    crossfade: {
        animationName: keyframes.crossfade,
        animationDuration: TIMING.crossfade,
        animationFillMode: 'forwards',
    },
    slideInFromBottom: {
        animationName: keyframes.slideInFromBottom,
        animationDuration: TRANSITION_NORMAL,
        animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
        animationFillMode: 'forwards',
    },
});
/** Reduced-motion override styles — zeroes animation/transition durations */
export const useReducedMotionStyles = makeStyles({
    reduced: {
        '@media (prefers-reduced-motion: reduce)': {
            animationDuration: '0.01ms !important',
            animationIterationCount: '1 !important',
            transitionDuration: '0.01ms !important',
        },
    },
});
//# sourceMappingURL=animations.js.map