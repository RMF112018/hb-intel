/**
 * HbcCoachingCallout types — D-SF03-T07 / D-08
 * Coaching prompt, gated from Essential to Standard by default (hidden at Expert).
 * Also checks showCoaching from IComplexityContext (D-07).
 */
import type { IComplexityAwareProps } from '@hbc/complexity';

export interface HbcCoachingCalloutProps extends IComplexityAwareProps {
  /** Guidance message to display */
  message: string;
  /** Optional action button label */
  actionLabel?: string;
  /** Optional action button callback */
  onAction?: () => void;
}
