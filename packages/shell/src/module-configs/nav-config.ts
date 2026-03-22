/**
 * Centralized Navigation Item Registry — PH4B.5 §4b.5.3
 * Blueprint §2c — Single source of truth for sidebar navigation metadata.
 *
 * D-04: Active state derived from router, not stored on items.
 * Adding a nav item = adding one object to NAV_ITEMS.
 */
import type { WorkspaceId } from '../types.js';

/** Configuration for a single navigation item */
export interface NavItemConfig {
  /** Unique identifier */
  key: string;
  /** Display label */
  label: string;
  /** Icon name (resolved by sidebar renderer) */
  icon?: string;
  /** Route path (used for href generation and active matching) */
  path: string;
  /** Parent workspace this item belongs to */
  workspace: WorkspaceId;
  /** Permission required to see this item. Hidden (not disabled) if not met. PH4B.5 §4b.5.4 */
  requiredPermission?: string;
  /** Sort order within workspace group */
  order?: number;
}

export const NAV_ITEMS: NavItemConfig[] = [
  // My Work (Phase 2 — Personal Work Hub)
  { key: 'feed', label: 'My Work', icon: 'home', path: '/my-work', workspace: 'my-work', order: 0 },
  // Business Development (UIF-013: top-level workspace entry)
  // Sidebar-icons: changed from 'toolbox' to 'go-no-go' to avoid semantic collision with header toolbox.
  { key: 'bd-dashboard', label: 'Business Development', icon: 'go-no-go', path: '/bd', workspace: 'business-development', order: 0 },
  // Project Hub
  { key: 'portfolio', label: 'Portfolio', icon: 'home', path: '/project-hub/portfolio', workspace: 'project-hub', order: 0 },
  { key: 'recent', label: 'Recent', icon: 'drawing-sheet', path: '/project-hub/recent', workspace: 'project-hub', order: 1 },
  { key: 'favorites', label: 'Favorites', icon: 'drawing-sheet', path: '/project-hub/favorites', workspace: 'project-hub', order: 2 },
  // Accounting
  { key: 'overview', label: 'Overview', icon: 'budget-line', path: '/accounting/overview', workspace: 'accounting', order: 0 },
  { key: 'budgets', label: 'Budgets', icon: 'budget-line', path: '/accounting/budgets', workspace: 'accounting', order: 1 },
  { key: 'invoices', label: 'Invoices', icon: 'drawing-sheet', path: '/accounting/invoices', workspace: 'accounting', order: 2 },
  // Estimating
  { key: 'bids', label: 'Bids', icon: 'go-no-go', path: '/estimating/bids', workspace: 'estimating', order: 0 },
  { key: 'templates', label: 'Templates', icon: 'drawing-sheet', path: '/estimating/templates', workspace: 'estimating', order: 1 },
];

/** Get nav items for a specific workspace, sorted by order */
export function getNavItemsForWorkspace(workspace: WorkspaceId): NavItemConfig[] {
  return NAV_ITEMS
    .filter((item) => item.workspace === workspace)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}
