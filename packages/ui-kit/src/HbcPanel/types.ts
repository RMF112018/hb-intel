/** HbcPanel — Blueprint §1d side panel */

export type PanelSize = 'sm' | 'md' | 'lg';

export interface HbcPanelProps {
  /** Panel visibility */
  open: boolean;
  /** Close handler */
  onClose: () => void;
  /** Panel title shown in header */
  title: string;
  /** Panel width size */
  size?: PanelSize;
  /** Panel body content */
  children: React.ReactNode;
  /** Optional footer content (action buttons) */
  footer?: React.ReactNode;
  /** Additional CSS class */
  className?: string;
}
