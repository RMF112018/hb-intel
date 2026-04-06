/**
 * CompanyPulse — Premium editorial news digest
 * Phase 17-05 — Structural rebuild with P17 surface family
 *
 * Rebuilt on HbcEditorialSurface with magazine-like featured/secondary
 * rhythm, lucide icons for editorial metadata accents, HbcPremiumBadge
 * for category classification, and HbcPremiumCta for CTA hierarchy.
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

  if (!normalized.featured && normalized.secondary.length === 0) {
    const message = resolveAuthoringMessage('companyPulse', config?.items?.length ? 'invalid' : 'noData');
    return <HomepageEmptyState title={message.title} description={message.description} />;
  }

  const secondaryItems: EditorialSecondaryItem[] = normalized.secondary.map((item) => ({
    id: item.id,
    title: item.title,
    meta: item.metadata,
    icon: FileText,
    href: item.cta?.href,
  }));

  return (
    <HbcEditorialSurface
      title={normalized.heading}
      icon={FileText}
      featured={normalized.featured ? {
        eyebrow: normalized.featured.category
          ? normalized.featured.category.charAt(0).toUpperCase() + normalized.featured.category.slice(1)
          : undefined,
        title: normalized.featured.title,
        excerpt: normalized.featured.summary,
        meta: (
          <>
            {normalized.featured.category ? (
              <HbcPremiumBadge
                label={normalized.featured.category}
                status={CATEGORY_VARIANT_MAP[normalized.featured.category]}
                size="sm"
              />
            ) : null}
            {normalized.featured.metadata ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={11} aria-hidden="true" style={{ opacity: 0.5 }} />
                {normalized.featured.metadata}
              </span>
            ) : null}
          </>
        ),
        cta: normalized.featured.cta ? (
          <HbcPremiumCta label={normalized.featured.cta.label} href={normalized.featured.cta.href} variant="ghost" arrow />
        ) : undefined,
      } : undefined}
      items={secondaryItems}
      headerAction={
        <HbcPremiumCta label="See all" href="#" variant="ghost" size="sm" arrow />
      }
    />
  );
}
