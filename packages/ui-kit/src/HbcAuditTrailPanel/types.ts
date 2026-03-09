/**
 * HbcAuditTrailPanel types — D-SF03-T07 / D-08
 * Full change history panel, gated at Expert by default.
 */
import type { IComplexityAwareProps } from '@hbc/complexity';

export interface HbcAuditTrailPanelProps extends IComplexityAwareProps {
  /** Identifier of the item whose audit trail is displayed */
  itemId: string;
  /** Maximum number of audit entries to display (default 20) */
  maxItems?: number;
}
