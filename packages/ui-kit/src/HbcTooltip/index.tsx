/**
 * HbcTooltip — Phase 4.9 Messaging & Feedback System
 * Reference: PH4.9-UI-Design-Plan.md §9
 *
 * Lightweight tooltip with string-only content, position auto-flip, delay.
 * For interactive content use HbcPopover.
 */
import * as React from 'react';
import { createPortal } from 'react-dom';
import { makeStyles, mergeClasses, shorthands } from '@griffel/react';
import type { HbcTooltipProps, TooltipPosition } from './types.js';
import {
  HBC_SURFACE_LIGHT,
  Z_INDEX,
  keyframes,
  TRANSITION_FAST,
  bodySmall,
} from '../theme/index.js';

const TOOLTIP_BG = HBC_SURFACE_LIGHT['text-primary']; // #1A1D23
const TOOLTIP_TEXT = '#FFFFFF';
const ARROW_SIZE = 6;
const OFFSET = 8;
const MAX_WIDTH = 280;

/* ── styles ──────────────────────────────────────────────────── */
const useStyles = makeStyles({
  tooltip: {
    position: 'fixed',
    ...bodySmall,
    color: TOOLTIP_TEXT,
    backgroundColor: TOOLTIP_BG,
    ...shorthands.padding('6px', '10px'),
    ...shorthands.borderRadius('4px'),
    maxWidth: `${MAX_WIDTH}px`,
    pointerEvents: 'none',
    animationName: keyframes.fadeIn as unknown as string,
    animationDuration: TRANSITION_FAST,
    animationTimingFunction: 'ease-out',
    animationFillMode: 'both',
  },
  arrow: {
    position: 'absolute',
    width: 0,
    height: 0,
  },
  arrowTop: {
    bottom: `-${ARROW_SIZE}px`,
    left: '50%',
    marginLeft: `-${ARROW_SIZE}px`,
    ...shorthands.borderLeft(`${ARROW_SIZE}px`, 'solid', 'transparent'),
    ...shorthands.borderRight(`${ARROW_SIZE}px`, 'solid', 'transparent'),
    ...shorthands.borderTop(`${ARROW_SIZE}px`, 'solid', TOOLTIP_BG),
    ...shorthands.borderBottom('0px', 'solid', 'transparent'),
  },
  arrowBottom: {
    top: `-${ARROW_SIZE}px`,
    left: '50%',
    marginLeft: `-${ARROW_SIZE}px`,
    ...shorthands.borderLeft(`${ARROW_SIZE}px`, 'solid', 'transparent'),
    ...shorthands.borderRight(`${ARROW_SIZE}px`, 'solid', 'transparent'),
    ...shorthands.borderBottom(`${ARROW_SIZE}px`, 'solid', TOOLTIP_BG),
    ...shorthands.borderTop('0px', 'solid', 'transparent'),
  },
  arrowLeft: {
    right: `-${ARROW_SIZE}px`,
    top: '50%',
    marginTop: `-${ARROW_SIZE}px`,
    ...shorthands.borderTop(`${ARROW_SIZE}px`, 'solid', 'transparent'),
    ...shorthands.borderBottom(`${ARROW_SIZE}px`, 'solid', 'transparent'),
    ...shorthands.borderLeft(`${ARROW_SIZE}px`, 'solid', TOOLTIP_BG),
    ...shorthands.borderRight('0px', 'solid', 'transparent'),
  },
  arrowRight: {
    left: `-${ARROW_SIZE}px`,
    top: '50%',
    marginTop: `-${ARROW_SIZE}px`,
    ...shorthands.borderTop(`${ARROW_SIZE}px`, 'solid', 'transparent'),
    ...shorthands.borderBottom(`${ARROW_SIZE}px`, 'solid', 'transparent'),
    ...shorthands.borderRight(`${ARROW_SIZE}px`, 'solid', TOOLTIP_BG),
    ...shorthands.borderLeft('0px', 'solid', 'transparent'),
  },
});

const ARROW_CLASS: Record<TooltipPosition, string> = {
  top: 'arrowTop',
  bottom: 'arrowBottom',
  left: 'arrowLeft',
  right: 'arrowRight',
};

/* ── positioning ─────────────────────────────────────────────── */
function calcPosition(
  triggerRect: DOMRect,
  tooltipEl: HTMLElement,
  preferred: TooltipPosition,
): { top: number; left: number; actual: TooltipPosition } {
  const tw = tooltipEl.offsetWidth;
  const th = tooltipEl.offsetHeight;
  const margin = 8; // viewport margin

  const positions: Record<TooltipPosition, { top: number; left: number }> = {
    top: {
      top: triggerRect.top - th - OFFSET,
      left: triggerRect.left + triggerRect.width / 2 - tw / 2,
    },
    bottom: {
      top: triggerRect.bottom + OFFSET,
      left: triggerRect.left + triggerRect.width / 2 - tw / 2,
    },
    left: {
      top: triggerRect.top + triggerRect.height / 2 - th / 2,
      left: triggerRect.left - tw - OFFSET,
    },
    right: {
      top: triggerRect.top + triggerRect.height / 2 - th / 2,
      left: triggerRect.right + OFFSET,
    },
  };

  const fits = (pos: TooltipPosition) => {
    const p = positions[pos];
    return (
      p.top >= margin &&
      p.left >= margin &&
      p.top + th <= window.innerHeight - margin &&
      p.left + tw <= window.innerWidth - margin
    );
  };

  const flipOrder: Record<TooltipPosition, TooltipPosition[]> = {
    top: ['top', 'bottom', 'left', 'right'],
    bottom: ['bottom', 'top', 'left', 'right'],
    left: ['left', 'right', 'top', 'bottom'],
    right: ['right', 'left', 'top', 'bottom'],
  };

  const actual = flipOrder[preferred].find(fits) ?? preferred;
  let { top, left } = positions[actual];

  // Clamp to viewport
  if (left < margin) left = margin;
  if (left + tw > window.innerWidth - margin) left = window.innerWidth - tw - margin;
  if (top < margin) top = margin;

  return { top, left, actual };
}

/* ── component ───────────────────────────────────────────────── */
export const HbcTooltip: React.FC<HbcTooltipProps> = ({
  content,
  position: preferredPosition = 'top',
  showDelay = 300,
  children,
  className,
}) => {
  const classes = useStyles();
  const [visible, setVisible] = React.useState(false);
  const [pos, setPos] = React.useState<{ top: number; left: number; actual: TooltipPosition } | null>(null);
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const tooltipRef = React.useRef<HTMLDivElement | null>(null);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltipId = React.useId();

  const show = React.useCallback(() => {
    setVisible(true);
  }, []);

  const hide = React.useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setVisible(false);
    setPos(null);
  }, []);

  const handleMouseEnter = React.useCallback(() => {
    timerRef.current = setTimeout(show, showDelay);
  }, [show, showDelay]);

  const handleFocus = React.useCallback(() => {
    show();
  }, [show]);

  // Position after visible
  React.useEffect(() => {
    if (visible && triggerRef.current && tooltipRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPos(calcPosition(rect, tooltipRef.current, preferredPosition));
    }
  }, [visible, preferredPosition]);

  // Cleanup timer
  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Clone child to attach handlers + aria
  const trigger = React.cloneElement(children, {
    ref: (el: HTMLElement | null) => {
      triggerRef.current = el;
      // Forward ref if child has one
      const childRef = (children as unknown as { ref?: React.Ref<HTMLElement> }).ref;
      if (typeof childRef === 'function') childRef(el);
      else if (childRef && typeof childRef === 'object') {
        (childRef as React.MutableRefObject<HTMLElement | null>).current = el;
      }
    },
    onMouseEnter: (e: React.MouseEvent) => {
      handleMouseEnter();
      children.props.onMouseEnter?.(e);
    },
    onMouseLeave: (e: React.MouseEvent) => {
      hide();
      children.props.onMouseLeave?.(e);
    },
    onFocus: (e: React.FocusEvent) => {
      handleFocus();
      children.props.onFocus?.(e);
    },
    onBlur: (e: React.FocusEvent) => {
      hide();
      children.props.onBlur?.(e);
    },
    'aria-describedby': visible ? tooltipId : undefined,
  } as Record<string, unknown>);

  const actualPos = pos?.actual ?? preferredPosition;
  const arrowKey = ARROW_CLASS[actualPos] as keyof typeof classes;

  return (
    <>
      {trigger}
      {visible &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={tooltipRef}
            id={tooltipId}
            role="tooltip"
            data-hbc-ui="tooltip"
            className={mergeClasses(classes.tooltip, className)}
            style={{
              zIndex: Z_INDEX.popover,
              top: pos?.top ?? -9999,
              left: pos?.left ?? -9999,
              visibility: pos ? 'visible' : 'hidden',
            }}
          >
            {content}
            <span className={mergeClasses(classes.arrow, classes[arrowKey])} />
          </div>,
          document.body,
        )}
    </>
  );
};

export type { HbcTooltipProps, TooltipPosition } from './types.js';
