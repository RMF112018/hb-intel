/**
 * LeadershipMessage — Premium executive communication channel
 * Phase 17-05 — Structural rebuild with P17 surface family
 *
 * Rebuilt on HbcEditorialSurface with formal executive voice,
 * quote-like featured treatment, lucide icons for editorial accents,
 * and HbcPremiumCta for CTA hierarchy. Visually distinct from the
 * news-digest style of CompanyPulse.
 */
import * as React from 'react';
import {
  HbcEditorialSurface,
  HbcPremiumCta,
  Briefcase,
  Users,
  type EditorialSecondaryItem,
} from '@hbc/ui-kit/homepage';
import { resolveAuthoringMessage } from '../../homepage/helpers/authoringGovernance.js';
import { normalizeLeadershipMessageConfig } from '../../homepage/helpers/communicationsConfig.js';
import { HomepageEmptyState } from '../../homepage/shared/HomepageEmptyState.js';
import { HomepageLoadingState } from '../../homepage/shared/HomepageLoadingState.js';
import type { LeadershipMessageConfig } from '../../homepage/webparts/communicationsContracts.js';

export interface LeadershipMessageProps {
  config?: Partial<LeadershipMessageConfig>;
  isLoading?: boolean;
}

export function LeadershipMessage({ config, isLoading = false }: LeadershipMessageProps): React.JSX.Element {
  if (isLoading) {
    return <HomepageLoadingState label="Loading leadership message" />;
  }

  const normalized = normalizeLeadershipMessageConfig(config);

  if (!normalized.featured && normalized.secondary.length === 0) {
    const message = resolveAuthoringMessage('leadershipMessage', config?.entries?.length ? 'invalid' : 'noData');
    return <HomepageEmptyState title={message.title} description={message.description} />;
  }

  const secondaryItems: EditorialSecondaryItem[] = normalized.secondary.map((entry) => ({
    id: entry.id,
    title: entry.title,
    meta: entry.leaderName,
    icon: Users,
  }));

  return (
    <HbcEditorialSurface
      title={normalized.heading}
      icon={Briefcase}
      featured={normalized.featured ? {
        eyebrow: 'From Leadership',
        title: normalized.featured.title,
        excerpt: normalized.featured.message,
        meta: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#323130' }}>
              {normalized.featured.leaderName}
            </span>
            {normalized.featured.leaderRole ? (
              <span style={{ fontSize: '0.8125rem', fontWeight: 400, color: 'rgba(0, 0, 0, 0.55)' }}>
                {normalized.featured.leaderRole}
              </span>
            ) : null}
          </div>
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
            style={{ width: '100%', maxHeight: 200, objectFit: 'cover', display: 'block' }}
          />
        </div>
      ) : null}
    </HbcEditorialSurface>
  );
}
