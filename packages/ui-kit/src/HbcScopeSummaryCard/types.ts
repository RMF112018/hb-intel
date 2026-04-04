/**
 * HbcScopeSummaryCard — Phase 11 execution scope display
 */
import type { RiskLevel } from '../HbcRiskBadge/types.js';

export interface ExecutionScope {
  readonly domain: string;
  readonly targetEntityId: string | null;
  readonly targetEntityLabel: string | null;
  readonly affectedResourceCount: number;
  readonly scopeDescription: string;
}

export interface HbcScopeSummaryCardProps {
  /** Execution scope details */
  scope: ExecutionScope;
  /** Risk level of the action */
  riskLevel: RiskLevel;
  /** Additional CSS class */
  className?: string;
}
