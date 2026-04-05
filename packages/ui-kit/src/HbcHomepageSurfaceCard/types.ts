/**
 * HbcHomepageSurfaceCard — Surface-class-aware homepage card types
 * Phase 11A — Shared homepage surface card primitive
 */
import type { HomepageSurfaceClass } from '../homepage.js';

export interface HbcHomepageSurfaceCardProps {
  /** Card content */
  children: React.ReactNode;
  /** Homepage surface class — controls density and visual treatment */
  surface?: HomepageSurfaceClass;
  /** Optional header content */
  header?: React.ReactNode;
  /** Optional footer content */
  footer?: React.ReactNode;
  /** Additional CSS class */
  className?: string;
}
