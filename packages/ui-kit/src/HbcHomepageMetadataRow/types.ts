/**
 * HbcHomepageMetadataRow — Homepage metadata row types
 * Phase 11A-02 — Production-grade metadata primitive
 */

export interface HbcHomepageMetadataRowProps {
  /** Metadata items (badges, text spans, dates) */
  children: React.ReactNode;
  /** Use separator dots between items */
  separated?: boolean;
  /** Additional CSS class */
  className?: string;
}
