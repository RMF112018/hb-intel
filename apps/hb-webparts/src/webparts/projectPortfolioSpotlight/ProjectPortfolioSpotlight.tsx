/**
 * ProjectPortfolioSpotlight — thin SPFx integration consumer.
 *
 * Wave 01 follow-on: the authored presentation grammar (featured hero,
 * image-led composition, team strip + detail panel, supporting rail) now
 * lives in `@hbc/ui-kit/homepage`'s `HbcProjectSpotlightSurface`. This
 * webpart owns only:
 *
 *  - SharePoint list fetch (via `useProjectSpotlightData`)
 *  - manifest-config fallback
 *  - normalization and audience filtering
 *    (via `normalizeProjectPortfolioSpotlightConfig`)
 *  - authoring/empty/loading state handling
 *  - mapping the normalized collection into the shared view-model
 *    (`ProjectSpotlightSurfaceModel`)
 */
import * as React from 'react';
import {
  HbcProjectSpotlightSurface,
  type ProjectSpotlightFeaturedItem,
  type ProjectSpotlightRailItem,
  type ProjectSpotlightStatusVariant,
  type ProjectSpotlightSurfaceModel,
} from '@hbc/ui-kit/homepage';
import { resolveAuthoringMessage } from '../../homepage/helpers/authoringGovernance.js';
import {
  normalizeProjectPortfolioSpotlightConfig,
  type NormalizedProjectPortfolioSpotlightItem,
} from '../../homepage/helpers/operationalAwarenessConfig.js';
import { HomepageEmptyState } from '../../homepage/shared/HomepageEmptyState.js';
import { HomepageErrorState } from '../../homepage/shared/HomepageErrorState.js';
import { HomepageLoadingState } from '../../homepage/shared/HomepageLoadingState.js';
import type { ProjectPortfolioSpotlightConfig } from '../../homepage/webparts/operationalAwarenessContracts.js';
import { useProjectSpotlightData } from '../../homepage/data/useProjectSpotlightData.js';

export interface ProjectPortfolioSpotlightProps {
  config?: Partial<ProjectPortfolioSpotlightConfig>;
  activeAudience?: string;
  isLoading?: boolean;
}

// OperationalStatusVariant is structurally identical to
// ProjectSpotlightStatusVariant, so a direct pass-through cast is safe.
function toStatusVariant(
  variant: string | undefined,
): ProjectSpotlightStatusVariant | undefined {
  return variant as ProjectSpotlightStatusVariant | undefined;
}

function toFeatured(
  item: NormalizedProjectPortfolioSpotlightItem,
): ProjectSpotlightFeaturedItem {
  return {
    id: item.id,
    title: item.title,
    headline: item.highlightHeadline,
    summary: item.summary,
    location: item.location,
    sector: item.sector,
    image: item.image
      ? { src: item.image.src, alt: item.image.alt }
      : undefined,
    status: item.status
      ? { label: item.status.label, variant: toStatusVariant(item.status.variant) }
      : undefined,
    strategicEmphasis: item.strategicEmphasis,
    isStale: item.isStale,
    freshnessLabel: item.freshnessLabel,
    milestones: item.milestones.map((m) => ({
      id: m.id,
      title: m.title,
      completed: m.completed,
    })),
    teamMembers: item.teamMembers.map((tm) => ({
      id: tm.id,
      displayName: tm.displayName,
      role: tm.role,
      photoUrl: tm.photoUrl,
    })),
    cta: item.cta
      ? {
          label: item.cta.label,
          href: item.cta.href,
          openInNewTab: item.cta.openInNewTab,
        }
      : undefined,
    completeness: item.contentCompleteness,
  };
}

function toRailItem(
  item: NormalizedProjectPortfolioSpotlightItem,
): ProjectSpotlightRailItem {
  return {
    id: item.id,
    title: item.title,
    location: item.location,
    sector: item.sector,
    image: item.image
      ? { src: item.image.src, alt: item.image.alt }
      : undefined,
    status: item.status
      ? { label: item.status.label, variant: toStatusVariant(item.status.variant) }
      : undefined,
    isStale: item.isStale,
    freshnessLabel: item.freshnessLabel,
    cta: item.cta
      ? {
          label: item.cta.label,
          href: item.cta.href,
          openInNewTab: item.cta.openInNewTab,
        }
      : undefined,
    completeness: item.contentCompleteness,
  };
}

export function ProjectPortfolioSpotlight({
  config,
  activeAudience,
  isLoading = false,
}: ProjectPortfolioSpotlightProps): React.JSX.Element {
  const {
    listConfig,
    isLoading: listLoading,
    error: listError,
  } = useProjectSpotlightData();

  if (isLoading || listLoading) {
    return <HomepageLoadingState label="Loading project spotlight" />;
  }

  // List-sourced data is the primary operating model.
  // Manifest config (props) is the narrow fallback for local dev / demo / packaging.
  // When the live fetch failed, we still consult the manifest config —
  // that preserves graceful degradation when a page author has
  // authored a meaningful fallback locally (e.g., packaging, demo,
  // or bootstrapped SharePoint pages). The error state only renders
  // when neither path yields a valid featured item.
  const effectiveConfig = listConfig ?? config;
  const normalized = normalizeProjectPortfolioSpotlightConfig(
    effectiveConfig,
    activeAudience,
  );

  if (!normalized.featured) {
    if (listError) {
      // Runtime failure with no usable fallback — render an explicit
      // error state distinct from authoring-gap messaging so users
      // and page authors can tell the two apart.
      const message = resolveAuthoringMessage(
        'projectPortfolioSpotlight',
        'fetchError',
      );
      return (
        <HomepageErrorState
          title={message.title}
          description={message.description}
          detail={listError}
        />
      );
    }
    const message = resolveAuthoringMessage(
      'projectPortfolioSpotlight',
      effectiveConfig?.items?.length ? 'invalid' : 'noData',
    );
    return (
      <HomepageEmptyState
        title={message.title}
        description={message.description}
      />
    );
  }

  const model: ProjectSpotlightSurfaceModel = {
    heading: normalized.heading,
    allProjectsLabel: normalized.allProjectsLabel,
    allProjectsUrl: normalized.allProjectsUrl,
    featured: toFeatured(normalized.featured),
    secondary: normalized.secondary.map(toRailItem),
  };

  return <HbcProjectSpotlightSurface model={model} />;
}
