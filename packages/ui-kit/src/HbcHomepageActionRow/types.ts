/**
 * HbcHomepageActionRow — Homepage action/destination row types
 * Phase 11A-02 — Shared homepage action row primitive
 */

export interface HbcHomepageActionRowProps {
  /** Row title / link text */
  title: string;
  /** Destination URL */
  href: string;
  /** Optional icon content rendered in an icon frame */
  icon?: React.ReactNode;
  /** Optional trailing badge content (e.g., HbcStatusBadge) */
  badge?: React.ReactNode;
  /** Optional description text below the title */
  description?: string;
  /** Whether to open in new tab */
  external?: boolean;
  /** Additional CSS class */
  className?: string;
}
