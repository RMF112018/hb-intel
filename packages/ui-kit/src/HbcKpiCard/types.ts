/**
 * HbcKpiCard — Type definitions
 * PH4.7 §7.3 | Blueprint §1d
 */

export interface KpiTrend {
  direction: 'up' | 'down' | 'flat';
  label: string;
}

export interface HbcKpiCardProps {
  /** KPI label text */
  label: string;
  /** KPI value (string or number) */
  value: string | number;
  /** Optional trend indicator */
  trend?: KpiTrend;
  /** Semantic color for 3px top border */
  color?: string;
  /** Active/selected state (click-to-filter) */
  isActive?: boolean;
  /** Click handler for click-to-filter */
  onClick?: () => void;
  /** INS-006: Optional subtitle below the value (e.g. "active work items") */
  subtitle?: string;
  /** INS-007: Optional icon in top-right corner for scanability */
  icon?: React.ReactNode;
  /** Additional CSS class */
  className?: string;
}
