/**
 * HbcHomepageMetadataRow — Homepage metadata row types
 * Phase 11A — Shared homepage metadata primitive
 */

export interface HbcHomepageMetadataRowProps {
  /** Metadata items (badges, text spans, dates) */
  children: React.ReactNode;
  /** Additional CSS class */
  className?: string;
}
