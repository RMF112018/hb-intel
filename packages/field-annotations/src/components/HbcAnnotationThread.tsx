import type { RefObject } from 'react';
import type { IFieldAnnotationConfig } from '../types/IFieldAnnotation';

/**
 * Props for HbcAnnotationThread — the anchored popover that displays and manages
 * annotations for a specific field. Rendered by HbcAnnotationMarker when opened.
 *
 * This is a typed placeholder — T06 will replace with the full implementation.
 */
export interface HbcAnnotationThreadProps {
  recordType: string;
  recordId: string;
  fieldKey: string;
  fieldLabel: string;
  config: Required<IFieldAnnotationConfig>;
  canAnnotate: boolean;
  canResolve: boolean;
  anchorRef: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
}

/**
 * Placeholder component — renders null until T06 provides the full implementation.
 */
export function HbcAnnotationThread(_props: HbcAnnotationThreadProps): React.JSX.Element | null {
  return null;
}
