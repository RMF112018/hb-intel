/**
 * SmartSearchWayfinding — Premium discovery product surface
 * Phase 17-04 — Structural rebuild with P17 surface family
 *
 * Rebuilt on HbcDiscoverySurface with real search input, quick path
 * chips, category shelves, and promoted destination cards. Uses lucide
 * icons for all discovery affordances and motion for interaction polish.
 * Replaces the old HomepageDiscoveryCluster wrapper.
 */
import * as React from 'react';
import {
  HbcDiscoverySurface,
  Search,
  Link2,
  FileText,
  Settings,
  Users,
  Briefcase,
  Building2,
  type LucideIcon,
  type DiscoveryQuickPath as SurfaceQuickPath,
  type DiscoveryCategory as SurfaceCategory,
  type DiscoveryCategoryItem as SurfaceCategoryItem,
  type DiscoveryPromotedItem as SurfacePromotedItem,
} from '@hbc/ui-kit/homepage';
import { resolveAuthoringMessage } from '../../homepage/helpers/authoringGovernance.js';
import { normalizeSmartSearchWayfindingConfig } from '../../homepage/helpers/discoveryConfig.js';
import { HomepageEmptyState } from '../../homepage/shared/HomepageEmptyState.js';
import { HomepageLoadingState } from '../../homepage/shared/HomepageLoadingState.js';
import type { SmartSearchWayfindingConfig } from '../../homepage/webparts/discoveryContracts.js';

export interface SmartSearchWayfindingProps {
  config?: Partial<SmartSearchWayfindingConfig>;
  activeAudience?: string;
  isLoading?: boolean;
}

// ── Icon resolution for discovery resources ──────────────────────────

const DISCOVERY_ICON_MAP: Record<string, LucideIcon> = {
  tool: Settings,
  form: FileText,
  policy: FileText,
  system: Building2,
  teamSpace: Users,
  destination: Link2,
  project: Briefcase,
};

function resolveDiscoveryIcon(iconKey: string | undefined, type?: string): LucideIcon {
  if (iconKey) {
    const mapped = DISCOVERY_ICON_MAP[iconKey.trim().toLowerCase()];
    if (mapped) return mapped;
  }
  if (type) {
    const mapped = DISCOVERY_ICON_MAP[type];
    if (mapped) return mapped;
  }
  return Link2;
}

export function SmartSearchWayfinding({
  config,
  activeAudience,
  isLoading = false,
}: SmartSearchWayfindingProps): React.JSX.Element {
  const [query, setQuery] = React.useState('');

  if (isLoading) {
    return <HomepageLoadingState label="Loading smart search and wayfinding" />;
  }

  const baseNormalized = normalizeSmartSearchWayfindingConfig(config, activeAudience, '');
  const normalized = normalizeSmartSearchWayfindingConfig(config, activeAudience, query);
  const hasDiscoverySurface =
    baseNormalized.hasResources || baseNormalized.quickPaths.length > 0;

  if (!hasDiscoverySurface) {
    const hasConfiguredInput = Boolean(config?.resources?.length || config?.quickPaths?.length || config?.categories?.length);
    const message = resolveAuthoringMessage('smartSearchWayfinding', hasConfiguredInput ? 'invalid' : 'noData');
    return <HomepageEmptyState title={message.title} description={message.description} />;
  }

  // Map quick paths to surface component format
  const quickPaths: SurfaceQuickPath[] = normalized.quickPaths.map((qp) => ({
    id: qp.id,
    label: qp.title,
    icon: resolveDiscoveryIcon(qp.iconKey),
    href: qp.href,
  }));

  // Map categories to surface component format
  const categories: SurfaceCategory[] = normalized.categoryGroups.map((cat) => ({
    id: cat.id,
    label: cat.title,
    icon: resolveDiscoveryIcon(undefined, cat.id),
    items: cat.resources.map((resource): SurfaceCategoryItem => ({
      id: resource.id,
      label: resource.title,
      icon: resolveDiscoveryIcon(resource.iconKey, resource.type),
      href: resource.href,
    })),
  }));

  // Map promoted resources to surface component format
  const promoted: SurfacePromotedItem[] = normalized.promotedResources.map((resource) => ({
    id: resource.id,
    label: resource.title,
    icon: resolveDiscoveryIcon(resource.iconKey, resource.type),
    href: resource.href,
  }));

  const hasQueryNoResults =
    query.trim().length > 0 &&
    normalized.categoryGroups.length === 0 &&
    normalized.promotedResources.length === 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <HbcDiscoverySurface
        searchSlot={
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              width: '100%',
              padding: '12px 16px',
              borderRadius: 10,
              background: '#ffffff',
              border: '1px solid rgba(229, 126, 70, 0.15)',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            }}
          >
            <Search size={18} style={{ color: 'rgba(229, 126, 70, 0.55)', flexShrink: 0 }} aria-hidden="true" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={normalized.searchPlaceholder}
              aria-label={normalized.heading}
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                flex: 1,
                fontSize: '0.875rem',
                color: '#1a1a1a',
              }}
            />
          </div>
        }
        quickPaths={quickPaths}
        categories={hasQueryNoResults ? [] : categories}
        promoted={hasQueryNoResults ? [] : promoted}
        aria-label={normalized.heading}
      />
      {hasQueryNoResults ? (
        <HomepageEmptyState
          title={resolveAuthoringMessage('smartSearchWayfinding', 'noResults').title}
          description={resolveAuthoringMessage('smartSearchWayfinding', 'noResults').description}
        />
      ) : null}
    </div>
  );
}
