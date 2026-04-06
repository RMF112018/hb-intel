/**
 * PeopleCulture — Warm celebratory recognition surface
 * Phase 17-05 — Structural rebuild with P17 surface family
 *
 * Rebuilt on HbcEditorialSurface with warm celebratory treatment,
 * lucide icons for person/event accents, HbcPremiumBadge for event
 * type classification, and HbcPremiumCta. Visually distinct from
 * formal editorial with warm tones and celebratory energy.
 */
import * as React from 'react';
import {
  HbcEditorialSurface,
  HbcPremiumCta,
  HbcPremiumBadge,
  Users,
  type EditorialSecondaryItem,
} from '@hbc/ui-kit/homepage';
import { resolveAuthoringMessage } from '../../homepage/helpers/authoringGovernance.js';
import { normalizePeopleCultureConfig } from '../../homepage/helpers/communicationsConfig.js';
import { HomepageEmptyState } from '../../homepage/shared/HomepageEmptyState.js';
import { HomepageLoadingState } from '../../homepage/shared/HomepageLoadingState.js';
import type { PeopleCultureConfig } from '../../homepage/webparts/communicationsContracts.js';

export interface PeopleCultureProps {
  config?: Partial<PeopleCultureConfig>;
  activeAudience?: string;
  isLoading?: boolean;
}

const EVENT_VARIANT_MAP = {
  newHire: 'info',
  anniversary: 'success',
  promotion: 'critical',
  recognition: 'warning',
} as const;

const EVENT_LABEL_MAP: Record<string, string> = {
  newHire: 'Welcome',
  anniversary: 'Milestone',
  promotion: 'Congratulations',
  recognition: 'Recognition',
};

export function PeopleCulture({ config, activeAudience, isLoading = false }: PeopleCultureProps): React.JSX.Element {
  if (isLoading) {
    return <HomepageLoadingState label="Loading people and culture" />;
  }

  const normalized = normalizePeopleCultureConfig(config, activeAudience);

  if (!normalized.featured && normalized.secondary.length === 0) {
    const message = resolveAuthoringMessage('peopleCulture', config?.entries?.length ? 'invalid' : 'noData');
    return <HomepageEmptyState title={message.title} description={message.description} />;
  }

  const secondaryItems: EditorialSecondaryItem[] = normalized.secondary.map((entry) => ({
    id: entry.id,
    title: entry.personName,
    meta: EVENT_LABEL_MAP[entry.eventType] ?? 'People',
    icon: Users,
  }));

  return (
    <HbcEditorialSurface
      title={normalized.heading}
      icon={Users}
      featured={normalized.featured ? {
        eyebrow: EVENT_LABEL_MAP[normalized.featured.eventType] ?? 'People',
        title: normalized.featured.personName,
        excerpt: normalized.featured.highlight,
        meta: (
          <HbcPremiumBadge
            label={EVENT_LABEL_MAP[normalized.featured.eventType] ?? normalized.featured.eventType}
            status={EVENT_VARIANT_MAP[normalized.featured.eventType]}
            size="sm"
          />
        ),
        cta: normalized.featured.cta ? (
          <HbcPremiumCta label={normalized.featured.cta.label} href={normalized.featured.cta.href} variant="ghost" arrow />
        ) : undefined,
      } : undefined}
      items={secondaryItems}
    >
      {/* Media slot for featured entry */}
      {normalized.featured?.media ? (
        <div style={{ marginTop: 12, borderRadius: 8, overflow: 'hidden' }}>
          <img
            alt={normalized.featured.media.alt}
            src={normalized.featured.media.src}
            style={{ width: '100%', maxHeight: 160, objectFit: 'cover', display: 'block' }}
          />
        </div>
      ) : null}
    </HbcEditorialSurface>
  );
}
