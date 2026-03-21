/**
 * My Work Hub tile definitions — G0, P2-F1 §2.2.
 *
 * Defines 6 canvas tiles for the secondary (analytics) and tertiary (utility) zones.
 * Tile keys use the `my-work.analytics.*` and `my-work.utility.*` namespaces
 * so MyWorkCanvas can filter by zone prefix.
 *
 * Each tile provides 3 complexity variants (essential / standard / expert)
 * per the ICanvasTileDefinition contract from @hbc/project-canvas.
 */
import React from 'react';
import type { ICanvasTileDefinition } from '@hbc/project-canvas';

/** All recognized hub roles for defaultForRoles. */
const ALL_HUB_ROLES = [
  'Superintendent',
  'Project Manager',
  'Project Engineer',
  'Chief Estimator',
  'VP of Operations',
  'Director of Preconstruction',
];

const EXECUTIVE_ROLES = ['VP of Operations', 'Director of Preconstruction'];

export const myWorkTileDefinitions: ICanvasTileDefinition[] = [
  // ── Secondary zone: analytics tiles ──────────────────────────────────
  {
    tileKey: 'my-work.analytics.personal',
    title: 'Personal Analytics',
    description: 'Personal work KPIs with click-to-filter (UIF-008).',
    defaultForRoles: ALL_HUB_ROLES,
    minComplexity: 'standard',
    mandatory: false,
    component: {
      essential: React.lazy(() =>
        import('./PersonalAnalyticsTile.js').then((m) => ({
          default: m.PersonalAnalyticsTileEssential,
        })),
      ),
      standard: React.lazy(() =>
        import('./PersonalAnalyticsTile.js').then((m) => ({
          default: m.PersonalAnalyticsTileStandard,
        })),
      ),
      expert: React.lazy(() =>
        import('./PersonalAnalyticsTile.js').then((m) => ({
          default: m.PersonalAnalyticsTileExpert,
        })),
      ),
    },
    defaultColSpan: 6,
    defaultRowSpan: 1,
    lockable: false,
  },
  {
    tileKey: 'my-work.analytics.aging-blocked',
    title: 'Aging & Blocked',
    description: 'Escalation candidate and blocked item counts (Executive-only).',
    defaultForRoles: EXECUTIVE_ROLES,
    minComplexity: 'standard',
    mandatory: false,
    component: {
      essential: React.lazy(() =>
        import('./AgingBlockedTile.js').then((m) => ({
          default: m.AgingBlockedTileEssential,
        })),
      ),
      standard: React.lazy(() =>
        import('./AgingBlockedTile.js').then((m) => ({
          default: m.AgingBlockedTileStandard,
        })),
      ),
      expert: React.lazy(() =>
        import('./AgingBlockedTile.js').then((m) => ({
          default: m.AgingBlockedTileExpert,
        })),
      ),
    },
    defaultColSpan: 6,
    defaultRowSpan: 1,
    lockable: false,
  },
  {
    tileKey: 'my-work.analytics.team-portfolio',
    title: 'Team Portfolio',
    description: 'Team feed counts for delegated and team modes (Executive-only).',
    defaultForRoles: ['VP of Operations'],
    minComplexity: 'standard',
    mandatory: false,
    component: {
      essential: React.lazy(() =>
        import('./TeamPortfolioTile.js').then((m) => ({
          default: m.TeamPortfolioTileEssential,
        })),
      ),
      standard: React.lazy(() =>
        import('./TeamPortfolioTile.js').then((m) => ({
          default: m.TeamPortfolioTileStandard,
        })),
      ),
      expert: React.lazy(() =>
        import('./TeamPortfolioTile.js').then((m) => ({
          default: m.TeamPortfolioTileExpert,
        })),
      ),
    },
    defaultColSpan: 6,
    defaultRowSpan: 1,
    lockable: false,
  },
  {
    tileKey: 'my-work.analytics.admin-oversight',
    title: 'Admin Oversight',
    description: 'System-wide oversight metrics (Administrator-only).',
    defaultForRoles: ALL_HUB_ROLES,
    minComplexity: 'standard',
    mandatory: false,
    component: {
      essential: React.lazy(() =>
        import('./AdminOversightTile.js').then((m) => ({
          default: m.AdminOversightTileEssential,
        })),
      ),
      standard: React.lazy(() =>
        import('./AdminOversightTile.js').then((m) => ({
          default: m.AdminOversightTileStandard,
        })),
      ),
      expert: React.lazy(() =>
        import('./AdminOversightTile.js').then((m) => ({
          default: m.AdminOversightTileExpert,
        })),
      ),
    },
    defaultColSpan: 12,
    defaultRowSpan: 1,
    lockable: false,
  },

  // ── Tertiary zone: utility tiles ─────────────────────────────────────
  {
    tileKey: 'my-work.utility.quick-access',
    title: 'Quick Access',
    description: 'Common action shortcuts to other features.',
    defaultForRoles: ALL_HUB_ROLES,
    minComplexity: 'essential',
    mandatory: false,
    component: {
      essential: React.lazy(() =>
        import('./QuickActionsTile.js').then((m) => ({
          default: m.QuickActionsTileEssential,
        })),
      ),
      standard: React.lazy(() =>
        import('./QuickActionsTile.js').then((m) => ({
          default: m.QuickActionsTileStandard,
        })),
      ),
      expert: React.lazy(() =>
        import('./QuickActionsTile.js').then((m) => ({
          default: m.QuickActionsTileExpert,
        })),
      ),
    },
    defaultColSpan: 4,
    defaultRowSpan: 1,
    lockable: false,
  },
  {
    tileKey: 'my-work.utility.recent-context',
    title: 'Recent Context',
    description: 'Recently visited projects and work items.',
    defaultForRoles: ALL_HUB_ROLES,
    minComplexity: 'standard',
    mandatory: false,
    component: {
      essential: React.lazy(() =>
        import('./RecentContextTile.js').then((m) => ({
          default: m.RecentContextTileEssential,
        })),
      ),
      standard: React.lazy(() =>
        import('./RecentContextTile.js').then((m) => ({
          default: m.RecentContextTileStandard,
        })),
      ),
      expert: React.lazy(() =>
        import('./RecentContextTile.js').then((m) => ({
          default: m.RecentContextTileExpert,
        })),
      ),
    },
    defaultColSpan: 6,
    defaultRowSpan: 1,
    lockable: false,
  },
];
