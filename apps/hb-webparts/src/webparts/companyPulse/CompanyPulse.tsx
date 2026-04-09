/**
 * CompanyPulse — Premium internal newsroom webpart.
 *
 * Wave 01 follow-on: migrated from a local newsroom CSS-module composition
 * to the shared `HbcNewsroomSurface` surface family in `@hbc/ui-kit/homepage`.
 *
 * The webpart is now a thin integration consumer:
 *   • normalizes the SharePoint / manifest config,
 *   • adapts the local `NewsroomOutput` domain shape to the shared
 *     `HbcNewsroomSurfaceModel` view-model,
 *   • handles loading, no-data, and invalid authoring states with the
 *     local homepage fallback components and authoring governance,
 *   • and delegates all durable newsroom presentation grammar
 *     (section shell, featured story, headline rail, tertiary quick-read
 *     zone, sparse-state footer) to the shared surface.
 */
import * as React from 'react';
import {
  HbcNewsroomSurface,
  type HbcNewsroomFeaturedItem,
  type HbcNewsroomHeadlineItem,
  type HbcNewsroomSurfaceModel,
  type HbcNewsroomTertiaryItem,
} from '@hbc/ui-kit/homepage';
import { resolveAuthoringMessage } from '../../homepage/helpers/authoringGovernance.js';
import { normalizeCompanyPulseConfig } from '../../homepage/helpers/communicationsConfig.js';
import { HomepageEmptyState } from '../../homepage/shared/HomepageEmptyState.js';
import { HomepageLoadingState } from '../../homepage/shared/HomepageLoadingState.js';
import type {
  CompanyPulseConfig,
  CompanyPulseItem,
  NewsroomOutput,
} from '../../homepage/webparts/communicationsContracts.js';

export interface CompanyPulseProps {
  config?: Partial<CompanyPulseConfig>;
  activeAudience?: string;
  isLoading?: boolean;
}

/* ── Adapter: NewsroomOutput → HbcNewsroomSurfaceModel ─────────── */

function toFeaturedItem(item: CompanyPulseItem): HbcNewsroomFeaturedItem {
  return {
    id: item.id,
    title: item.title,
    summary: item.summary,
    category: item.category,
    byline: item.byline,
    publishDate: item.publishDate,
    media: item.media ? { src: item.media.src, alt: item.media.alt } : undefined,
    cta: item.cta
      ? { label: item.cta.label, href: item.cta.href, openInNewTab: item.cta.openInNewTab }
      : undefined,
  };
}

function toHeadlineItem(item: CompanyPulseItem): HbcNewsroomHeadlineItem {
  return {
    id: item.id,
    title: item.title,
    category: item.category,
    byline: item.byline,
    publishDate: item.publishDate,
    cta: item.cta
      ? { label: item.cta.label, href: item.cta.href, openInNewTab: item.cta.openInNewTab }
      : undefined,
  };
}

function toTertiaryItem(item: CompanyPulseItem): HbcNewsroomTertiaryItem {
  return {
    id: item.id,
    title: item.title,
    category: item.category,
  };
}

function toSurfaceModel(normalized: NewsroomOutput): HbcNewsroomSurfaceModel {
  return {
    heading: normalized.heading,
    lead: normalized.lead ? toFeaturedItem(normalized.lead) : undefined,
    secondary: normalized.secondary.map(toHeadlineItem),
    tertiary: normalized.tertiary.map(toTertiaryItem),
    archiveHref: normalized.archiveHref,
  };
}

/* ── Component ─────────────────────────────────────────────────── */

export function CompanyPulse({
  config,
  activeAudience,
  isLoading = false,
}: CompanyPulseProps): React.JSX.Element {
  if (isLoading) {
    return <HomepageLoadingState label="Loading company pulse" />;
  }

  const normalized = normalizeCompanyPulseConfig(config, activeAudience);
  const hasLead = Boolean(normalized.lead);
  const hasSecondary = normalized.secondary.length > 0;

  if (!hasLead && !hasSecondary) {
    const message = resolveAuthoringMessage(
      'companyPulse',
      config?.items?.length ? 'invalid' : 'noData',
    );
    return <HomepageEmptyState title={message.title} description={message.description} />;
  }

  return <HbcNewsroomSurface model={toSurfaceModel(normalized)} />;
}
