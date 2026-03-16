/**
 * HbcModal — Modal dialog types
 * PH4.8 §Step 4 | Blueprint §1d
 */

export type ModalSize = 'sm' | 'md' | 'lg';

export interface HbcModalProps {
  /** Modal visibility */
  open: boolean;
  /** Close handler */
  onClose: () => void;
  /** Modal title shown in header */
  title: string;
  /** Modal width: sm=480px, md=600px, lg=720px */
  size?: ModalSize;
  /** Modal body content */
  children: React.ReactNode;
  /** Optional footer content (action buttons) */
  footer?: React.ReactNode;
  /** Prevent closing on backdrop click */
  preventBackdropClose?: boolean;
  /** Additional CSS class for the dialog */
  className?: string;
  /** ARIA dialog role override — use 'alertdialog' for confirmation dialogs (WS1-T09) */
  role?: 'dialog' | 'alertdialog';
}
