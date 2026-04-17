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
}

/* ── Surface props ───────────────────────────────────────────────── */

export interface HbcPriorityRailSurfaceProps {
  title?: string;
  urgency?: PriorityRailUrgency;
  layout?: PriorityRailLayoutMode;
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
  items: PriorityRailActionModel[];
  sections?: PriorityRailSectionModel[];
  overflowItems?: PriorityRailActionModel[];
  overflowLabel?: string;
  overflowStrategy?: PriorityRailOverflowStrategy;
  showBadges?: boolean;
  previewLabel?: string;
  className?: string;
}
