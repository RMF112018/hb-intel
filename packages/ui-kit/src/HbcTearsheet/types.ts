/**
 * HbcTearsheet — Multi-step tearsheet overlay types
 * PH4.8 §Step 5 | Blueprint §1d
 */

export interface TearsheetStep {
  /** Unique step identifier */
  id: string;
  /** Step label shown in the header indicator */
  label: string;
  /** Step content to render */
  content: React.ReactNode;
  /** Optional validation function called before advancing to next step. Return true to allow. */
  onValidate?: () => boolean | Promise<boolean>;
}

export interface HbcTearsheetProps {
  /** Tearsheet visibility */
  open: boolean;
  /** Close handler */
  onClose: () => void;
  /** Tearsheet title shown in header */
  title: string;
  /** Steps to render */
  steps: TearsheetStep[];
  /** Called when the user completes the final step */
  onComplete?: () => void;
  /** Additional CSS class */
  className?: string;
}
