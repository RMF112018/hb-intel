/**
 * LeadershipMessage — Premium executive communication channel.
 *
 * Wave 01r Prompt 17 — executive editorial rebuild:
 * The webpart is now a thin integration consumer of the enhanced shared
 * `HbcEditorialSurface` surface family in `@hbc/ui-kit/homepage`.
 * Normalization, authoring governance, loading, and empty-state handling
 * stay local to the consumer; all durable editorial presentation grammar
 * (nameplate masthead, quote-framed featured block, signature, archive
 * rail, and footer strip) lives in the shared surface.
 *
 * This consumer no longer carries any inline style — the surface owns
 * typography, spacing, warm-accent color language, and layout. The webpart
 * only shapes the authoring model into the editorial view-model.
 */
import * as React from 'react';
import {
  HbcEditorialSurface,
  Briefcase,
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

export function LeadershipMessage({
  config,
  isLoading = false,
}: LeadershipMessageProps): React.JSX.Element {
  if (isLoading) {
    return <HomepageLoadingState label="Loading leadership message" />;
  }

  const normalized = normalizeLeadershipMessageConfig(config);

  if (!normalized.featured && normalized.secondary.length === 0) {
    const message = resolveAuthoringMessage(
      'leadershipMessage',
      config?.entries?.length ? 'invalid' : 'noData',
    );
    return <HomepageEmptyState title={message.title} description={message.description} />;
  }

  const archiveItems: EditorialSecondaryItem[] = normalized.secondary.map((entry) => {
    const metaParts: string[] = [];
    if (entry.leaderName) metaParts.push(entry.leaderName);
    if (entry.leaderRole) metaParts.push(entry.leaderRole);
    if (entry.metadata) metaParts.push(entry.metadata);
    return {
      id: entry.id,
      title: entry.title,
      meta: metaParts.length > 0 ? metaParts.join('  ·  ') : undefined,
      href: entry.cta?.href,
      openInNewTab: entry.cta?.openInNewTab,
    };
  });

  return (
    <HbcEditorialSurface
      title={normalized.heading}
      icon={Briefcase}
      mastheadEyebrow="From Leadership"
      archiveTitle="From the archive"
      archiveHref={normalized.archiveHref}
      featured={
        normalized.featured
          ? {
              eyebrow: 'Message of the week',
              title: normalized.featured.title,
              excerpt: normalized.featured.message,
              leaderName: normalized.featured.leaderName,
              leaderRole: normalized.featured.leaderRole,
              publishDate: normalized.featured.metadata,
              mediaImage: normalized.featured.media
                ? {
                    src: normalized.featured.media.src,
                    alt: normalized.featured.media.alt,
                  }
                : undefined,
              cta: normalized.featured.cta
                ? {
                    label: normalized.featured.cta.label,
                    href: normalized.featured.cta.href,
                    openInNewTab: normalized.featured.cta.openInNewTab,
                  }
                : undefined,
            }
          : undefined
      }
      items={archiveItems}
    />
  );
}
