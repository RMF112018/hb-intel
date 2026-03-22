/**
 * HbcBanner — Phase 4.9 Messaging & Feedback System
 * Full-width status banner with 4 variants.
 */
import type * as React from 'react';

export type BannerVariant = 'info' | 'success' | 'warning' | 'error';

export interface HbcBannerProps {
  /** Status variant controlling color and default icon */
  variant: BannerVariant;
  /** Banner message content */
  children: React.ReactNode;
  /** Override default variant icon */
  icon?: React.ReactNode;
  /** Callback when dismiss button is clicked. Omit for non-dismissible banners. */
  onDismiss?: () => void;
  /** Override aria-live to "polite" for persistent/non-urgent banners (UIF-003). Default: inferred from variant. */
  polite?: boolean;
  /** Additional CSS class */
  className?: string;
}
