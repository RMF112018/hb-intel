/**
 * HbcPriorityRail — shared type contracts.
 *
 * Decoupled from the SharePoint schema contracts in hb-webparts.
 * These types define the visual surface API — consumers map their
 * data-layer contracts into these shapes before rendering.
 */
import type { LucideIcon } from 'lucide-react';

/* ── Enumerations ────────────────────────────────────────────────── */

export type PriorityRailUrgency = 'default' | 'high' | 'critical';
export type PriorityRailBadgeVariant = 'neutral' | 'info' | 'warning' | 'success' | 'critical';
export type PriorityRailLayoutMode = 'rail' | 'grid' | 'compact';
export type PriorityRailState = 'idle' | 'loading' | 'empty' | 'error' | 'ready';
export type PriorityRailOverflowStrategy = 'inline-disclosure' | 'menu' | 'sheet';

/**
 * Named presentation context opted into by a specific consumer surface.
 *
 * - `default`  — the generic shared priority-rail surface usable by any
 *   consumer (admin preview, non-homepage embeds, tests). Flagship-only
 *   behavior (featured masthead slot, persistent launch chip, uppercase
 *   masthead rhythm, container-driven flagship degradation) is suppressed
 *   here. This is the safe default for any non-homepage mount.
 *
 * - `homepage-flagship` — an explicit flagship variant of the
 *   `HbcPriorityRailSurface` for selective embeds/tests that need the
 *   vertical tile presentation posture. The hosted homepage wrapper path
 *   is governed by `HbcHomepageLauncher`; this context does not redefine
 *   runtime authority.
 *
 * Isolation contract:
 * - Default consumers (including admin preview) MUST NOT render
 *   featured-slot content even if a caller sets
 *   `PriorityRailSectionModel.featured`.
 * - Consumers MUST go through the explicit
 *   `surfaceContext="homepage-flagship"` prop path; directly setting the
 *   flagship CSS class on a mount is not supported.
 */
export type PriorityRailContext = 'default' | 'homepage-flagship';

/* ── Action item model ───────────────────────────────────────────── */

export interface PriorityRailActionModel {
  id: string;
  title: string;
  href: string;
  description?: string;
  icon?: LucideIcon;
  badge?: {
    label: string;
    variant: PriorityRailBadgeVariant;
  };
  external?: boolean;
  groupKey?: string;
  groupTitle?: string;
  /**
   * Flagship tier marker. When `true` and the consumer opts into the
   * `homepage-flagship` context, the action may be promoted to a featured
   * masthead slot ahead of the section row list. The default context
   * ignores this flag and renders the action as an ordinary row.
   */
  featured?: boolean;
}

/* ── Group model ─────────────────────────────────────────────────── */

export interface PriorityRailGroupModel {
  key: string;
  title: string;
  urgency?: PriorityRailUrgency;
  actions: PriorityRailActionModel[];
}

export interface PriorityRailSectionModel {
  key: string;
  title?: string;
  actions: PriorityRailActionModel[];
  /**
   * Optional flagship-only featured action for this section. When present
   * and the surface is rendering under `context === 'homepage-flagship'`,
   * the featured action is promoted to a masthead slot ahead of the
   * section row list. When absent, or under the `default` context, the
   * section renders as a flat row list. Populated by
   * `buildPriorityRailSections` based on wrapper-declared featured keys
   * or an urgency-based fallback.
   */
  featured?: PriorityRailActionModel;
}

/* ── Surface props ───────────────────────────────────────────────── */

export interface HbcPriorityRailSurfaceProps {
  title?: string;
  urgency?: PriorityRailUrgency;
  layout?: PriorityRailLayoutMode;
  /**
   * Named presentation context. Opt-in flagship presentation for the
   * wrapper-owned homepage embed; defaults to `default` for all other
   * consumers. See {@link PriorityRailContext}.
   */
  context?: PriorityRailContext;
  items: PriorityRailActionModel[];
  sections?: PriorityRailSectionModel[];
  overflowItems?: PriorityRailActionModel[];
  overflowLabel?: string;
  overflowStrategy?: PriorityRailOverflowStrategy;
  showBadges?: boolean;
  className?: string;
  'aria-label'?: string;
}

/* ── Action props ────────────────────────────────────────────────── */

export interface HbcPriorityRailActionProps {
  action: PriorityRailActionModel;
  showBadge?: boolean;
  compact?: boolean;
  className?: string;
}

/* ── Overflow props ──────────────────────────────────────────────── */

export interface HbcPriorityRailOverflowProps {
  items: PriorityRailActionModel[];
  label?: string;
  strategy?: PriorityRailOverflowStrategy;
  showBadges?: boolean;
  className?: string;
}

/* ── Skeleton props ──────────────────────────────────────────────── */

export interface HbcPriorityRailSkeletonProps {
  count?: number;
  layout?: PriorityRailLayoutMode;
  className?: string;
}

/* ── Empty state props ───────────────────────────────────────────── */

export interface HbcPriorityRailEmptyStateProps {
  title?: string;
  description?: string;
  className?: string;
}

/* ── Error state props ───────────────────────────────────────────── */

export interface HbcPriorityRailErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

/* ── Preview surface props ───────────────────────────────────────── */

export interface HbcPriorityRailPreviewSurfaceProps {
  title?: string;
  urgency?: PriorityRailUrgency;
  layout?: PriorityRailLayoutMode;
  context?: PriorityRailContext;
  items: PriorityRailActionModel[];
  sections?: PriorityRailSectionModel[];
  overflowItems?: PriorityRailActionModel[];
  overflowLabel?: string;
  overflowStrategy?: PriorityRailOverflowStrategy;
  showBadges?: boolean;
  previewLabel?: string;
  className?: string;
}
