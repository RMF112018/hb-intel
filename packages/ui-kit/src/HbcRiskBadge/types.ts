/**
 * HbcRiskBadge — Phase 11 risk-tier indicator
 */

export type RiskLevel = 'read-only' | 'low' | 'moderate' | 'high' | 'critical';

export interface HbcRiskBadgeProps {
  /** Risk tier level */
  riskLevel: RiskLevel;
  /** Optional label override — defaults to capitalized risk level */
  label?: string;
  /** Badge size */
  size?: 'small' | 'medium';
  /** Additional CSS class */
  className?: string;
}
