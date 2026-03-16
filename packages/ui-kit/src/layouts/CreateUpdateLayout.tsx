/**
 * CreateUpdateLayout — Create/edit form page layout with Focus Mode
 * PH4.5 §Step 4 | PH4B.8 §4b.8.5 | Blueprint §1f, §2c
 *
 * Structure: Form Header (sticky) → Form Content (centered) → Sticky Footer
 * Focus Mode: auto-activates on touch, toggle on desktop, collapses sidebar + dims bg.
 * Density: reads useDensity() for touch/compact/comfortable footer & content sizing.
 */
import * as React from 'react';
import { makeStyles, mergeClasses, shorthands } from '@griffel/react';
import { heading2 } from '../theme/typography.js';
import { HBC_SPACE_SM, HBC_SPACE_MD, HBC_SPACE_LG, HBC_SPACE_XL } from '../theme/grid.js';
import { elevationRaised } from '../theme/elevation.js';
import {
  HBC_SURFACE_LIGHT,
  HBC_ACCENT_ORANGE,
  HBC_HEADER_TEXT,
  HBC_ACCENT_ORANGE_HOVER,
} from '../theme/tokens.js';
import { TRANSITION_NORMAL, TIMING } from '../theme/animations.js';
import { FocusModeEnter, FocusModeExit } from '../icons/index.js';
import { useFocusMode } from './hooks/useFocusMode.js';
import { useDensity } from '../theme/useDensity.js';
import { DENSITY_BREAKPOINTS } from '../theme/density.js';
import type { CreateUpdateLayoutProps } from './types.js';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100%',
    position: 'relative',
  },
  formHeader: {
    position: 'sticky',
    top: '0px',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: `${HBC_SPACE_LG}px`,
    paddingRight: `${HBC_SPACE_LG}px`,
    backgroundColor: HBC_SURFACE_LIGHT['surface-0'],
    ...shorthands.borderBottom('1px', 'solid', HBC_SURFACE_LIGHT['border-default']),
    zIndex: 10,
    flexShrink: 0,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_MD}px`,
    minWidth: '0px',
  },
  formTitle: {
    ...heading2,
    color: HBC_SURFACE_LIGHT['text-primary'],
    marginTop: '0px',
    marginBottom: '0px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
    flexShrink: 0,
  },
  focusToggle: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    backgroundColor: 'transparent',
    ...shorthands.borderStyle('none'),
    ...shorthands.borderRadius('6px'),
    cursor: 'pointer',
    color: HBC_SURFACE_LIGHT['text-muted'],
    transitionProperty: 'background-color, color',
    transitionDuration: TRANSITION_NORMAL,
    ':hover': {
      backgroundColor: HBC_SURFACE_LIGHT['surface-2'],
      color: HBC_SURFACE_LIGHT['text-primary'],
    },
  },
  focusToggleActive: {
    color: HBC_ACCENT_ORANGE,
    ':hover': {
      color: HBC_ACCENT_ORANGE,
    },
  },
  cancelButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
    paddingLeft: `${HBC_SPACE_MD}px`,
    paddingRight: `${HBC_SPACE_MD}px`,
    paddingTop: `${HBC_SPACE_SM}px`,
    paddingBottom: `${HBC_SPACE_SM}px`,
    ...shorthands.borderRadius('6px'),
    ...shorthands.borderStyle('none'),
    fontWeight: '600',
    fontSize: '0.875rem',
    cursor: 'pointer',
    transitionProperty: 'background-color',
    transitionDuration: TRANSITION_NORMAL,
    backgroundColor: HBC_SURFACE_LIGHT['surface-2'],
    color: HBC_SURFACE_LIGHT['text-primary'],
    ':hover': {
      backgroundColor: HBC_SURFACE_LIGHT['surface-3'],
    },
  },
  saveButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
    paddingLeft: `${HBC_SPACE_MD}px`,
    paddingRight: `${HBC_SPACE_MD}px`,
    paddingTop: `${HBC_SPACE_SM}px`,
    paddingBottom: `${HBC_SPACE_SM}px`,
    ...shorthands.borderRadius('6px'),
    ...shorthands.borderStyle('none'),
    fontWeight: '600',
    fontSize: '0.875rem',
    cursor: 'pointer',
    transitionProperty: 'background-color, opacity',
    transitionDuration: TRANSITION_NORMAL,
    backgroundColor: HBC_ACCENT_ORANGE,
    color: HBC_HEADER_TEXT,
    ':hover': {
      backgroundColor: HBC_ACCENT_ORANGE_HOVER,
    },
    ':disabled': {
      opacity: '0.6',
      cursor: 'not-allowed',
    },
  },
  formContent: {
    flexGrow: 1,
    maxWidth: '66.67%',
    marginLeft: 'auto',
    marginRight: 'auto',
    width: '100%',
    paddingLeft: `${HBC_SPACE_LG}px`,
    paddingRight: `${HBC_SPACE_LG}px`,
    paddingTop: `${HBC_SPACE_LG}px`,
    paddingBottom: '80px',
    boxSizing: 'border-box',
    '@media (max-width: 1023px)': {
      maxWidth: '100%',
    },
  },
  formContentFocused: {
    boxShadow: elevationRaised,
    backgroundColor: HBC_SURFACE_LIGHT['surface-0'],
    ...shorthands.borderRadius('8px'),
    marginTop: `${HBC_SPACE_LG}px`,
    marginBottom: `${HBC_SPACE_LG}px`,
  },
  stickyFooter: {
    position: 'sticky',
    bottom: '0px',
    height: '56px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: `${HBC_SPACE_SM}px`,
    paddingLeft: `${HBC_SPACE_LG}px`,
    paddingRight: `${HBC_SPACE_LG}px`,
    backgroundColor: HBC_SURFACE_LIGHT['surface-1'],
    boxShadow: elevationRaised,
    zIndex: 10,
    flexShrink: 0,
  },
  spinner: {
    display: 'inline-block',
    width: '16px',
    height: '16px',
    ...shorthands.borderWidth('2px'),
    ...shorthands.borderStyle('solid'),
    ...shorthands.borderColor('rgba(255,255,255,0.3)'),
    borderTopColor: HBC_HEADER_TEXT,
    ...shorthands.borderRadius('50%'),
    animationName: {
      from: { transform: 'rotate(0deg)' },
      to: { transform: 'rotate(360deg)' },
    },
    animationDuration: '0.6s',
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
  },
  // PH4.12: dim overlay behind form when Focus Mode is active
  dimOverlay: {
    '::after': {
      content: '""',
      position: 'fixed',
      top: '0',
      right: '0',
      bottom: '0',
      left: '0',
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      pointerEvents: 'none',
      zIndex: 1,
      transitionProperty: 'opacity',
      transitionDuration: TIMING.backgroundDim,
      transitionTimingFunction: 'ease-out',
    },
  },
  formContentAboveDim: {
    position: 'relative',
    zIndex: 2,
  },
  formHeaderAboveDim: {
    zIndex: 11,
    position: 'sticky',
  },
  footerAboveDim: {
    zIndex: 11,
  },
});

export const CreateUpdateLayout: React.FC<CreateUpdateLayoutProps> = ({
  mode,
  itemType,
  itemTitle,
  onCancel,
  onSubmit,
  isSubmitting = false,
  children,
}) => {
  const styles = useStyles();
  const { isFocusMode, toggleFocusMode, isAutoFocus, deactivate } = useFocusMode();
  const { tier: densityTier } = useDensity();

  // PH4B.8 §4b.8.5: density-aware footer height
  const footerHeight = densityTier === 'touch' ? 64 : densityTier === 'compact' ? 48 : 56;
  const contentPadding = densityTier === 'touch' ? HBC_SPACE_XL : HBC_SPACE_LG;

  // PH4.12: deactivate focus mode on cancel/save
  const handleCancel = React.useCallback(() => {
    deactivate();
    onCancel();
  }, [deactivate, onCancel]);

  const handleSubmit = React.useCallback(() => {
    deactivate();
    onSubmit();
  }, [deactivate, onSubmit]);

  const title = mode === 'create'
    ? `Create New ${itemType}`
    : `Edit ${itemTitle ?? itemType}`;

  return (
    <div className={mergeClasses(styles.root, isFocusMode && styles.dimOverlay)} data-hbc-layout="create-update">
      {/* Form Header */}
      <div className={mergeClasses(styles.formHeader, isFocusMode && styles.formHeaderAboveDim)}>
        <div className={styles.headerLeft}>
          <h2 className={styles.formTitle}>{title}</h2>
        </div>
        <div className={styles.headerRight}>
          {/* Focus toggle — desktop only, hidden when auto-focus (touch) */}
          {!isAutoFocus && (
            <button
              className={mergeClasses(
                styles.focusToggle,
                isFocusMode && styles.focusToggleActive,
              )}
              onClick={toggleFocusMode}
              aria-pressed={isFocusMode}
              aria-label={isFocusMode ? 'Exit focus mode' : 'Enter focus mode'}
              title={isFocusMode ? 'Exit focus mode' : 'Enter focus mode'}
              type="button"
            >
              {isFocusMode ? <FocusModeExit size="md" /> : <FocusModeEnter size="md" />}
            </button>
          )}
          <button
            className={styles.cancelButton}
            onClick={handleCancel}
            disabled={isSubmitting}
            type="button"
          >
            Cancel
          </button>
          <button
            className={styles.saveButton}
            onClick={handleSubmit}
            disabled={isSubmitting}
            type="button"
          >
            {isSubmitting && <span className={styles.spinner} />}
            Save
          </button>
        </div>
      </div>

      {/* Form Content — density-aware padding (§4b.8.5) */}
      <div
        className={mergeClasses(
          styles.formContent,
          isFocusMode && styles.formContentFocused,
          isFocusMode && styles.formContentAboveDim,
        )}
        style={{
          paddingLeft: `${contentPadding}px`,
          paddingRight: `${contentPadding}px`,
          paddingTop: `${contentPadding}px`,
        }}
      >
        {children}
      </div>

      {/* Sticky Footer — density-aware height (§4b.8.5) */}
      <div
        className={mergeClasses(styles.stickyFooter, isFocusMode && styles.footerAboveDim)}
        style={{ height: `${footerHeight}px` }}
      >
        <button
          className={styles.cancelButton}
          onClick={handleCancel}
          disabled={isSubmitting}
          type="button"
        >
          Cancel
        </button>
        <button
          className={styles.saveButton}
          onClick={handleSubmit}
          disabled={isSubmitting}
          type="button"
        >
          {isSubmitting && <span className={styles.spinner} />}
          Save
        </button>
      </div>
    </div>
  );
};
