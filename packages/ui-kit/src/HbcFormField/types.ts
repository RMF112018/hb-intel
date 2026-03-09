/**
 * HbcFormField types — D-SF03-T07 / D-08
 * Complexity-sensitive form field, gated at Standard when complexitySensitive is true.
 */
import type { IComplexityAwareProps } from '@hbc/complexity';

export interface HbcFormFieldProps extends IComplexityAwareProps {
  /** Field name for form binding */
  name: string;
  /** Human-readable label */
  label: string;
  /**
   * When true, field is treated as complexity-sensitive and gated at complexityMinTier.
   * Use for internal notes, secondary metadata, and operational detail fields.
   */
  complexitySensitive?: boolean;
}
