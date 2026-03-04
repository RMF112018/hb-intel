/**
 * HbcConfirmDialog — Destructive action confirmation types
 * PH4.12 §Step 2 | Blueprint §1d
 */

export interface HbcConfirmDialogProps {
  /** Whether the dialog is visible */
  open: boolean;
  /** Close handler (Cancel / backdrop) */
  onClose: () => void;
  /** Confirm handler (destructive action) */
  onConfirm: () => void;
  /** Dialog title */
  title: string;
  /** Descriptive body text */
  description: string;
  /** Confirm button label (default: "Delete") */
  confirmLabel?: string;
  /** Cancel button label (default: "Cancel") */
  cancelLabel?: string;
  /** Visual variant: danger (red) or warning (amber) */
  variant?: 'danger' | 'warning';
  /** Show loading spinner on confirm button */
  loading?: boolean;
  /** Additional CSS class */
  className?: string;
}
