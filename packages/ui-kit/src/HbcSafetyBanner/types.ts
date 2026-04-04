/**
 * HbcSafetyBanner — Phase 11 risk-aware action warning banner
 */
import type * as React from 'react';
import type { RiskLevel } from '../HbcRiskBadge/types.js';

export interface SafetyWarningItem {
  readonly severity: 'info' | 'warning' | 'critical';
  readonly code: string;
  readonly message: string;
  readonly resource: string | null;
}

export interface HbcSafetyBannerProps {
  /** Risk tier determining banner severity styling */
  riskLevel: RiskLevel;
  /** Banner title */
  title: string;
  /** Optional additional content */
  children?: React.ReactNode;
  /** Structured safety warnings to display */
  warnings?: readonly SafetyWarningItem[];
  /** Callback when dismiss button is clicked. Omit for non-dismissible banners. High/critical are always non-dismissible. */
  onDismiss?: () => void;
  /** Additional CSS class */
  className?: string;
}
