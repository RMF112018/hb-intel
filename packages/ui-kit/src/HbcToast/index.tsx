/**
 * HbcToast — Phase 4.9 Messaging & Feedback System
 * Reference: PH4.9-UI-Design-Plan.md §9
 *
 * Toast container (portaled to document.body) + individual toast items.
 * V2.1: success | error | sync-status only.
 */
import * as React from 'react';
import { createPortal } from 'react-dom';
import { makeStyles, shorthands } from '@griffel/react';
import type { ToastCategory, ToastEntry } from './types.js';
import { useToastInternal } from './useToast.js';
import {
  HBC_STATUS_COLORS,
  HBC_STATUS_RAMP_GREEN,
  HBC_STATUS_RAMP_RED,
  HBC_STATUS_RAMP_INFO,
  Z_INDEX,
  elevationLevel2,
  keyframes,
  TRANSITION_FAST,
  body,
} from '../theme/index.js';
import {
  StatusCompleteIcon,
  StatusOverdueIcon,
  StatusInfoIcon,
  Cancel,
} from '../icons/index.js';

/* ── colour mapping ─────────────────────────────────────────── */
const CATEGORY_RAMP: Record<ToastCategory, { bg: string; text: string; accent: string }> = {
  success:       { bg: HBC_STATUS_RAMP_GREEN['90'], text: HBC_STATUS_RAMP_GREEN['10'], accent: HBC_STATUS_COLORS.success },
  error:         { bg: HBC_STATUS_RAMP_RED['90'],   text: HBC_STATUS_RAMP_RED['10'],   accent: HBC_STATUS_COLORS.error },
  'sync-status': { bg: HBC_STATUS_RAMP_INFO['90'],  text: HBC_STATUS_RAMP_INFO['10'],  accent: HBC_STATUS_COLORS.info },
};

const CATEGORY_ICON: Record<ToastCategory, React.FC<{ size?: 'sm' | 'md' | 'lg'; color?: string }>> = {
  success:       StatusCompleteIcon,
  error:         StatusOverdueIcon,
  'sync-status': StatusInfoIcon,
};

/* ── styles ──────────────────────────────────────────────────── */
const useStyles = makeStyles({
  container: {
    position: 'fixed',
    bottom: '16px',
    right: '16px',
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('8px'),
    pointerEvents: 'none',
  },
  toast: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('10px'),
    ...shorthands.padding('12px', '16px'),
    ...shorthands.borderLeft('4px', 'solid', 'transparent'),
    ...shorthands.borderRadius('6px'),
    boxShadow: elevationLevel2,
    minWidth: '300px',
    maxWidth: '420px',
    pointerEvents: 'auto',
    animationName: keyframes.slideInUp as unknown as string,
    animationDuration: '250ms',
    animationTimingFunction: 'ease-out',
    animationFillMode: 'both',
  },
  content: {
    ...body,
    flexGrow: 1,
    minWidth: 0,
  },
  dismiss: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...shorthands.padding('4px'),
    ...shorthands.border('0px', 'solid', 'transparent'),
    ...shorthands.borderRadius('4px'),
    backgroundColor: 'transparent',
    cursor: 'pointer',
    transitionProperty: 'background-color',
    transitionDuration: TRANSITION_FAST,
    transitionTimingFunction: 'ease-in-out',
    flexShrink: 0,
    ':hover': {
      backgroundColor: 'rgba(0,0,0,0.08)',
    },
  },
  iconWrap: {
    display: 'inline-flex',
    flexShrink: 0,
  },
});

/* ── toast item ──────────────────────────────────────────────── */
const ToastItem: React.FC<{
  entry: ToastEntry;
  onDismiss: (id: string) => void;
}> = ({ entry, onDismiss }) => {
  const classes = useStyles();
  const ramp = CATEGORY_RAMP[entry.category];
  const DefaultIcon = CATEGORY_ICON[entry.category];
  const role = entry.category === 'error' ? 'alert' : 'status';

  return (
    <div
      role={role}
      data-hbc-ui="toast"
      data-hbc-category={entry.category}
      className={classes.toast}
      style={{
        backgroundColor: ramp.bg,
        borderLeftColor: ramp.accent,
        color: ramp.text,
      }}
    >
      <span className={classes.iconWrap}>
        {entry.icon ?? <DefaultIcon size="md" color={ramp.accent} />}
      </span>
      <div className={classes.content}>{entry.message}</div>
      {entry.category === 'error' && (
        <button
          type="button"
          className={classes.dismiss}
          onClick={() => onDismiss(entry.id)}
          aria-label="Dismiss toast"
          style={{ color: ramp.text }}
        >
          <Cancel size="sm" />
        </button>
      )}
    </div>
  );
};

/* ── toast container (portal) ────────────────────────────────── */
export const HbcToastContainer: React.FC = () => {
  const internal = useToastInternal();
  const classes = useStyles();

  if (!internal || typeof document === 'undefined') return null;

  const { toasts, dismissToast, maxVisible } = internal;
  const visible = toasts.slice(-maxVisible);

  if (visible.length === 0) return null;

  return createPortal(
    <div
      className={classes.container}
      style={{ zIndex: Z_INDEX.toast }}
      aria-live="polite"
    >
      {visible.map((t) => (
        <ToastItem key={t.id} entry={t} onDismiss={dismissToast} />
      ))}
    </div>,
    document.body,
  );
};

/* ── re-exports ──────────────────────────────────────────────── */
export { HbcToastProvider, useToast } from './useToast.js';
export type {
  ToastConfig,
  ToastCategory,
  ToastContextValue,
  ToastEntry,
  HbcToastProviderProps,
} from './types.js';
