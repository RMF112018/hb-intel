/**
 * CompanyPulse — Premium editorial newsroom surface
 * Wave 01 — Newsroom source model with lead / secondary / tertiary hierarchy
 *
 * Rebuilt on HbcEditorialSurface with magazine-like featured/secondary
 * rhythm, lucide icons for editorial metadata accents, HbcPremiumBadge
 * for category classification, and HbcPremiumCta for CTA hierarchy.
 * Now supports byline, publishDate, media, and three-tier newsroom output.
 */
import * as React from 'react';
import {
  HbcEditorialSurface,
  HbcPremiumCta,
  HbcPremiumBadge,
  FileText,
  Clock,
  type EditorialSecondaryItem,
} from '@hbc/ui-kit/homepage';
import { resolveAuthoringMessage } from '../../homepage/helpers/authoringGovernance.js';
import { normalizeCompanyPulseConfig } from '../../homepage/helpers/communicationsConfig.js';
import { HomepageEmptyState } from '../../homepage/shared/HomepageEmptyState.js';
import { HomepageLoadingState } from '../../homepage/shared/HomepageLoadingState.js';
import type { CompanyPulseConfig } from '../../homepage/webparts/communicationsContracts.js';

export interface CompanyPulseProps {
  config?: Partial<CompanyPulseConfig>;
  activeAudience?: string;
  isLoading?: boolean;
}

const CATEGORY_VARIANT_MAP = {
  update: 'info',
  safety: 'warning',
  recognition: 'success',
  milestone: 'critical',
} as const;

export function CompanyPulse({ config, activeAudience, isLoading = false }: CompanyPulseProps): React.JSX.Element {
  if (isLoading) {
    return <HomepageLoadingState label="Loading company pulse" />;
  }

  const normalized = normalizeCompanyPulseConfig(config, activeAudience);

  if (!normalized.lead && normalized.secondary.length === 0) {
    const message = resolveAuthoringMessage('companyPulse', config?.items?.length ? 'invalid' : 'noData');
    return <HomepageEmptyState title={message.title} description={message.description} />;
  }

  const secondaryItems: EditorialSecondaryItem[] = normalized.secondary.map((item) => ({
    id: item.id,
    title: item.title,
    meta: item.byline ?? item.metadata,
    icon: FileText,
    href: item.cta?.href,
  }));

  return (
    <HbcEditorialSurface
      title={normalized.heading}
      icon={FileText}
      featured={normalized.lead ? {
        eyebrow: normalized.lead.category
          ? normalized.lead.category.charAt(0).toUpperCase() + normalized.lead.category.slice(1)
          : undefined,
        title: normalized.lead.title,
        excerpt: normalized.lead.summary,
        meta: (
          <>
            {normalized.lead.category ? (
              <HbcPremiumBadge
                label={normalized.lead.category}
                status={CATEGORY_VARIANT_MAP[normalized.lead.category]}
                size="sm"
              />
            ) : null}
            {normalized.lead.byline ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, opacity: 0.7 }}>
                {normalized.lead.byline}
              </span>
            ) : null}
            {(normalized.lead.publishDate ?? normalized.lead.metadata) ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={11} aria-hidden="true" style={{ opacity: 0.5 }} />
                {normalized.lead.publishDate ?? normalized.lead.metadata}
              </span>
            ) : null}
          </>
        ),
        cta: normalized.lead.cta ? (
          <HbcPremiumCta label={normalized.lead.cta.label} href={normalized.lead.cta.href} variant="ghost" arrow />
        ) : undefined,
        media: normalized.lead.media ? (
          <img
            src={normalized.lead.media.src}
            alt={normalized.lead.media.alt}
            style={{ borderRadius: 8, maxHeight: 200, width: '100%', objectFit: 'cover' }}
            loading="lazy"
            decoding="async"
          />
        ) : undefined,
      } : undefined}
      items={secondaryItems}
      headerAction={
        <HbcPremiumCta
          label="See all"
          href={normalized.archiveHref ?? '#'}
          variant="ghost"
          size="sm"
          arrow
        />
      }
    />
  );
}
