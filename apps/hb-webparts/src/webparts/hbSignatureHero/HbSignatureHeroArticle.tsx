/**
 * HbSignatureHeroArticle — Article-mode hero adapter.
 *
 * Renders a single editorial article hero for non-HBCentral contexts.
 * Composes the shared `HbcSignatureHeroSurface` primitive so article
 * and homepage renders share the same slot/motion/background seam
 * without sharing content models.
 *
 * Slot mapping:
 *   - eyebrow   ← optional `labels` joined by a middot
 *   - editorial ← title (optionally wrapped with `destinationUrl`) and
 *                 the optional subheading deck
 *   - metadata  ← author + published date/time byline
 *   - backgroundImage ← `primaryImage`
 *
 * Missing optional fields degrade gracefully — no placeholder copy is
 * inserted and no empty wrappers are emitted.
 *
 * This adapter is intentionally decoupled from the homepage adapter:
 * the homepage branch is locked to HBCentral and must not absorb
 * article furniture.
 */
import * as React from 'react';
import { HbcSignatureHeroSurface } from '@hbc/ui-kit/homepage';
import type { HbSignatureHeroArticleContent } from './HbSignatureHeroArticleContract.js';

export interface HbSignatureHeroArticleProps {
  article: HbSignatureHeroArticleContent;
}

function formatByline(article: HbSignatureHeroArticleContent): string {
  const datePart = article.publishedTime
    ? `${article.publishedDate} · ${article.publishedTime}`
    : article.publishedDate;
  return `${article.author} · ${datePart}`;
}

export function HbSignatureHeroArticle({
  article,
}: HbSignatureHeroArticleProps): React.JSX.Element {
  const {
    title,
    subheading,
    labels,
    primaryImage,
    destinationUrl,
  } = article;

  const eyebrow = labels && labels.length > 0 ? labels.join(' · ') : undefined;

  const titleNode = destinationUrl ? (
    <a href={destinationUrl} data-hbc-article-title-link="true">
      {title}
    </a>
  ) : (
    title
  );

  const editorial = (
    <div data-hbc-article-editorial="true">
      <h1 data-hbc-article-title="true">{titleNode}</h1>
      {subheading ? (
        <p data-hbc-article-subheading="true">{subheading}</p>
      ) : null}
    </div>
  );

  const metadata = (
    <span data-hbc-article-byline="true">{formatByline(article)}</span>
  );

  return (
    <HbcSignatureHeroSurface
      aria-label={`Article: ${title}`}
      background="brand"
      layout="full"
      backgroundImage={primaryImage}
      eyebrow={eyebrow}
      editorial={editorial}
      metadata={metadata}
    />
  );
}
