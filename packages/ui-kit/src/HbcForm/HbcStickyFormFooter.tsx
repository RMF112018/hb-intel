/**
 * HbcStickyFormFooter — Standalone form footer with Cancel + Save buttons
 * PH4.11 §Step 5 | Blueprint §1d
 *
 * Positioning-agnostic: does NOT apply position: sticky. The parent
 * (HbcForm's stickyFooter wrapper div) provides positioning. This allows
 * the component to be used in other contexts too.
 */
import * as React from 'react';
import { makeStyles, mergeClasses } from '@griffel/react';
import { HBC_SURFACE_LIGHT } from '../theme/tokens.js';
import { elevationRaised } from '../theme/elevation.js';
import { HbcButton } from '../HbcButton/index.js';
import type { HbcStickyFormFooterProps } from './types.js';

const useStyles = makeStyles({
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: HBC_SURFACE_LIGHT['surface-0'],
    boxShadow: elevationRaised,
    borderTop: `1px solid ${HBC_SURFACE_LIGHT['border-default']}`,
  },
});

export const HbcStickyFormFooter: React.FC<HbcStickyFormFooterProps> = ({
  onCancel,
  primaryLabel = 'Save',
  cancelLabel = 'Cancel',
  primaryDisabled = false,
  primaryLoading = false,
  extraActions,
  className,
}) => {
  const styles = useStyles();

  return (
    <div
      data-hbc-ui="sticky-form-footer"
      className={mergeClasses(styles.footer, className)}
    >
      <HbcButton variant="secondary" onClick={onCancel} type="button">
        {cancelLabel}
      </HbcButton>
      {extraActions}
      <HbcButton
        variant="primary"
        type="submit"
        disabled={primaryDisabled}
        loading={primaryLoading}
      >
        {primaryLabel}
      </HbcButton>
    </div>
  );
};
