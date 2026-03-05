/** Griffel keyframe definitions for reuse across components */
export declare const keyframes: {
    readonly fadeIn: {
        readonly from: {
            readonly opacity: 0;
        };
        readonly to: {
            readonly opacity: 1;
        };
    };
    readonly slideInRight: {
        readonly from: {
            readonly transform: "translateX(100%)";
            readonly opacity: 0;
        };
        readonly to: {
            readonly transform: "translateX(0)";
            readonly opacity: 1;
        };
    };
    readonly slideInUp: {
        readonly from: {
            readonly transform: "translateY(16px)";
            readonly opacity: 0;
        };
        readonly to: {
            readonly transform: "translateY(0)";
            readonly opacity: 1;
        };
    };
    readonly scaleIn: {
        readonly from: {
            readonly transform: "scale(0.95)";
            readonly opacity: 0;
        };
        readonly to: {
            readonly transform: "scale(1)";
            readonly opacity: 1;
        };
    };
    readonly pulse: {
        readonly '0%': {
            readonly opacity: 1;
        };
        readonly '50%': {
            readonly opacity: 0.6;
        };
        readonly '100%': {
            readonly opacity: 1;
        };
    };
    readonly shimmer: {
        readonly '0%': {
            readonly backgroundPosition: "-200% 0";
        };
        readonly '100%': {
            readonly backgroundPosition: "200% 0";
        };
    };
    readonly badgePulse: {
        readonly '0%': {
            readonly transform: "scale(1)";
        };
        readonly '50%': {
            readonly transform: "scale(1.1)";
        };
        readonly '100%': {
            readonly transform: "scale(1)";
        };
    };
    readonly crossfade: {
        readonly from: {
            readonly opacity: 0;
        };
        readonly to: {
            readonly opacity: 1;
        };
    };
    readonly slideInFromBottom: {
        readonly from: {
            readonly transform: "translateY(100%)";
        };
        readonly to: {
            readonly transform: "translateY(0)";
        };
    };
};
/** Transition duration presets (ms) */
export declare const TRANSITION_FAST: "150ms";
export declare const TRANSITION_NORMAL: "250ms";
export declare const TRANSITION_SLOW: "400ms";
/** Named timing constants for interaction patterns (PH4.12) */
export declare const TIMING: {
    readonly sidebarCollapse: "250ms";
    readonly headerFade: "150ms";
    readonly backgroundDim: "200ms";
    readonly badgePulse: "300ms";
    readonly crossfade: "200ms";
    readonly skeletonSweep: "1500ms";
    readonly focusActivation: "200ms";
    readonly connectivityExpand: "100ms";
    readonly buttonLoading: "150ms";
};
/** Common transition presets for component use */
export declare const transitions: {
    readonly fast: "all 150ms ease-in-out";
    readonly normal: "all 250ms ease-in-out";
    readonly slow: "all 400ms ease-in-out";
};
/** Shared animation utility styles (Griffel) */
export declare const useAnimationStyles: () => Record<"fadeIn" | "slideInRight" | "slideInUp" | "scaleIn" | "shimmer" | "badgePulse" | "crossfade" | "slideInFromBottom", string>;
/** Reduced-motion override styles — zeroes animation/transition durations */
export declare const useReducedMotionStyles: () => Record<"reduced", string>;
//# sourceMappingURL=animations.d.ts.map