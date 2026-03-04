/**
 * HbcBottomNav — Type definitions
 * PH4.14.5 | Blueprint §1d, §1f
 */
import type { ReactNode } from 'react';

/** A single item in the bottom navigation bar */
export interface BottomNavItem {
  id: string;
  label: string;
  icon: ReactNode;
  href: string;
}

/** Props for the bottom navigation bar */
export interface HbcBottomNavProps {
  items: BottomNavItem[];
  activeId?: string;
  onNavigate?: (href: string) => void;
  className?: string;
}
