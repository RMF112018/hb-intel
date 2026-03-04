/**
 * HbcConfirmDialog — Thin wrapper over HbcModal for destructive confirmations
 * PH4.12 §Step 2 | Blueprint §1d
 *
 * Wraps HbcModal size="sm" with preventBackdropClose.
 * Footer: Cancel (secondary) + Confirm (danger/warning).
 */
import * as React from 'react';
import { makeStyles } from '@griffel/react';
import { HBC_SURFACE_LIGHT } from '../theme/tokens.js';
import { HbcModal } from '../HbcModal/index.js';
import { HbcButton } from '../HbcButton/index.js';
import type { HbcConfirmDialogProps } from './types.js';

const useStyles = makeStyles({
  description: {
    fontSize: '0.875rem',
    lineHeight: '1.5',
    color: HBC_SURFACE_LIGHT['text-muted'],
    margin: '0',
  },
});

export const HbcConfirmDialog: React.FC<HbcConfirmDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
  className,
}) => {
  const styles = useStyles();

  return (
    <HbcModal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      preventBackdropClose
      className={className}
      footer={
        <>
          <HbcButton
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel}
          </HbcButton>
          <HbcButton
            variant={variant === 'warning' ? 'primary' : 'danger'}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </HbcButton>
        </>
      }
    >
      <p className={styles.description} data-hbc-ui="confirm-dialog">
        {description}
      </p>
    </HbcModal>
  );
};

export type { HbcConfirmDialogProps } from './types.js';
