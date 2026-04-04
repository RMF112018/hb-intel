/**
 * HbcImpactSummaryList — Phase 11 preview impact items display
 */
import type { RiskLevel } from '../HbcRiskBadge/types.js';

export interface ImpactItem {
  readonly resource: string;
  readonly changeType: 'create' | 'update' | 'delete' | 'no-change';
  readonly description: string;
  readonly reversible: boolean;
  readonly itemRiskLevel: RiskLevel;
}

export interface HbcImpactSummaryListProps {
  /** Impact items from a safety preview */
  items: readonly ImpactItem[];
  /** Additional CSS class */
  className?: string;
}
