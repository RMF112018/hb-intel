/**
 * HbcBreadcrumbs — Type definitions
 * PH4.10 §Step 2 | Blueprint §2c
 */
import type { BreadcrumbItem } from '../layouts/types.js';

export type { BreadcrumbItem };

export interface HbcBreadcrumbsProps {
  /** Breadcrumb navigation segments */
  items: BreadcrumbItem[];
  /** Navigation handler called when a non-last breadcrumb is clicked */
  onNavigate?: (href: string) => void;
  /** When true, strips sticky positioning, border, and background — minimal chrome */
  isFocusMode?: boolean;
  /** When true, uses HBC_SURFACE_FIELD dark tokens */
  isFieldMode?: boolean;
  /** Additional CSS class */
  className?: string;
}
