/**
 * My Work Hub tile definitions — G0, P2-F1 §2.2.
 *
 * Defines canvas tiles for the secondary (analytics) zone.
 * Tile keys use the `hub:*` namespace per P2-D2 §6.1 so MyWorkCanvas
 * can filter by zone prefix and tiles are discoverable by HbcProjectCanvas.
 *
 * Namespace mandate: P2-D2 §6.1 requires all My Work Hub tiles to use the
 * `hub:` prefix. See P2-D2-Adaptive-Layout-and-Zone-Governance-Spec.md §6.1.
 *
 * Each tile provides 3 complexity variants (essential / standard / expert)
 * per the ICanvasTileDefinition contract from @hbc/project-canvas.
 */
import React from 'react';
import type { ICanvasTileDefinition } from '@hbc/project-canvas';

// Role strings must match @hbc/auth canonical names (P2-D1 §11.1).
// Do not extract to local constants — use inline literals or @hbc/auth exports.
// Tiles intended for all authenticated users use defaultForRoles: [].
// MyWorkCanvas treats an empty array as "show to everyone" (no role filter).

export const myWorkTileDefinitions: ICanvasTileDefinition[] = [
  // ── Secondary zone: analytics tiles ──────────────────────────────────
  {
    tileKey: 'hub:personal-analytics',
    title: 'Personal Analytics',
    description: 'Personal work KPIs with click-to-filter (UIF-008).',
    defaultForRoles: [],
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
    // ARC-08: 12-column grid per CANVAS_GRID_COLUMNS — 6 = half width
    defaultColSpan: 6,
    defaultRowSpan: 1,
    lockable: false,
  },
  {
    tileKey: 'hub:aging-blocked',
    title: 'Aging & Blocked',
    description: 'Escalation candidate and blocked item counts (Executive-only).',
    defaultForRoles: ['Executive'],
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
    // ARC-08: 12-column grid per CANVAS_GRID_COLUMNS — 6 = half width
    defaultColSpan: 6,
    defaultRowSpan: 1,
    lockable: false,
  },
  {
    tileKey: 'hub:team-portfolio',
    title: 'Team Portfolio',
    description: 'Team feed counts for delegated and team modes (Executive-only).',
    defaultForRoles: ['Executive'],
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
    // ARC-08: 12-column grid per CANVAS_GRID_COLUMNS — 6 = half width
    defaultColSpan: 6,
    defaultRowSpan: 1,
    lockable: false,
  },
  {
    tileKey: 'hub:admin-oversight',
    title: 'Admin Oversight',
    description: 'System-wide oversight metrics (Administrator-only).',
    defaultForRoles: ['Administrator'],
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
    // ARC-08: 12-column grid per CANVAS_GRID_COLUMNS — 12 = full width
    defaultColSpan: 12,
    defaultRowSpan: 1,
    lockable: false,
  },

  // ── Pilot-required cards (P2-D3 §8, remediation 2-A) ──────────────────
  {
    tileKey: 'hub:lane-summary',
    title: 'Lane Summary',
    description: 'Work distribution across four responsibility lanes (P2-D3).',
    defaultForRoles: [],
    minComplexity: 'essential',
    mandatory: true,
    component: {
      essential: React.lazy(() =>
        import('./LaneSummaryTile.js').then((m) => ({
          default: m.LaneSummaryTileEssential,
        })),
      ),
      standard: React.lazy(() =>
        import('./LaneSummaryTile.js').then((m) => ({
          default: m.LaneSummaryTileStandard,
        })),
      ),
      expert: React.lazy(() =>
        import('./LaneSummaryTile.js').then((m) => ({
          default: m.LaneSummaryTileExpert,
        })),
      ),
    },
    // ARC-08: 12-column grid per CANVAS_GRID_COLUMNS — 12 = full width
    defaultColSpan: 12,
    defaultRowSpan: 1,
    lockable: true,
  },
  {
    tileKey: 'hub:source-breakdown',
    title: 'Source Module Breakdown',
    description: 'Work distribution across source modules (P2-D3).',
    defaultForRoles: [],
    minComplexity: 'essential',
    mandatory: false,
    component: {
      essential: React.lazy(() =>
        import('./SourceBreakdownTile.js').then((m) => ({
          default: m.SourceBreakdownTileEssential,
        })),
      ),
      standard: React.lazy(() =>
        import('./SourceBreakdownTile.js').then((m) => ({
          default: m.SourceBreakdownTileStandard,
        })),
      ),
      expert: React.lazy(() =>
        import('./SourceBreakdownTile.js').then((m) => ({
          default: m.SourceBreakdownTileExpert,
        })),
      ),
    },
    // ARC-08: 12-column grid per CANVAS_GRID_COLUMNS — 6 = half width
    defaultColSpan: 6,
    defaultRowSpan: 1,
    lockable: false,
  },

  // ── Tertiary zone tile (P2-D2 §6.1, remediation 2-C) ───────────────────
  {
    tileKey: 'hub:recent-context',
    title: 'Recent Activity',
    description: 'Recently visited projects and work items (P2-D2 §6.1).',
    defaultForRoles: [],
    minComplexity: 'standard',
    mandatory: false,
    component: {
      essential: React.lazy(() =>
        import('./RecentActivityTile.js').then((m) => ({
          default: m.RecentActivityTileEssential,
        })),
      ),
      standard: React.lazy(() =>
        import('./RecentActivityTile.js').then((m) => ({
          default: m.RecentActivityTileStandard,
        })),
      ),
      expert: React.lazy(() =>
        import('./RecentActivityTile.js').then((m) => ({
          default: m.RecentActivityTileExpert,
        })),
      ),
    },
    // ARC-08: 12-column grid — full width in tertiary zone
    defaultColSpan: 12,
    defaultRowSpan: 1,
    lockable: false,
  },
];
