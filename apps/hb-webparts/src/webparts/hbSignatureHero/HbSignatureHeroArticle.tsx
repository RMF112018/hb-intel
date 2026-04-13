/**
 * HbSignatureHeroArticle — Article-mode hero adapter.
 *
 * Renders a single editorial article hero for non-HBCentral contexts.
 * Composes the shared `HbcSignatureHeroSurface` primitive so article
 * and homepage renders share the same slot/motion/background seam
 * without sharing content models.
 *
 * Author identity + photo reuse the shared seams from
 * `@hbc/ui-kit/homepage`:
 *   - `HbcAvatarStack` for avatar + initials fallback
 *   - `usePersonPhotoCache` (via `useArticleAuthorPhoto`) for Graph
 *     photo resolution by UPN
 *
 * Slot mapping:
 *   - eyebrow   ← optional `labels` joined by a middot
 *   - editorial ← title (optionally wrapped with `destinationUrl`) and
 *                 the optional subheading deck
 *   - metadata  ← single-person `HbcAvatarStack` + byline (author +
 *                 published date/time)
 *   - backgroundImage ← `primaryImage`
 *
 * Missing optional fields degrade gracefully — no placeholder copy is
 * inserted and no empty wrappers are emitted. When no photo resolves,
 * the avatar falls back to author initials.
 *
 * This adapter is intentionally decoupled from the homepage adapter
 * and from any Kudos runtime: the homepage branch is locked to
 * HBCentral and must not absorb article furniture, and Kudos
 * recognition/feed/composer code must not flow into article rendering.
 */
import * as React from 'react';
import { HbcSignatureHeroSurface, HbcAvatarStack, type PersonPhotoFn } from '@hbc/ui-kit/homepage';
import type { HbSignatureHeroArticleContent } from './HbSignatureHeroArticleContract.js';
import { useArticleAuthorPhoto } from './useArticleAuthorPhoto.js';

export interface HbSignatureHeroArticleProps {
  article: HbSignatureHeroArticleContent;
  /**
   * Photo adapter used to resolve `authorUpn` through the shared
   * seam. Production wiring passes a Graph-backed fn created via
   * `createGraphPersonPhotoFn`; tests and workbench contexts may
   * pass their own adapter or omit this entirely.
   */
  fetchPersonPhoto?: PersonPhotoFn;
}

function formatByline(article: HbSignatureHeroArticleContent): string {
  const datePart = article.publishedTime
    ? `${article.publishedDate} · ${article.publishedTime}`
    : article.publishedDate;
  return `${article.author} · ${datePart}`;
}

export function HbSignatureHeroArticle({
  article,
  fetchPersonPhoto,
}: HbSignatureHeroArticleProps): React.JSX.Element {
  const {
    title,
    subheading,
    labels,
    primaryImage,
    destinationUrl,
    author,
    authorUpn,
    authorPhotoUrl,
  } = article;

  const resolvedPhoto = useArticleAuthorPhoto({
    authorUpn,
    authorPhotoUrl,
    fetchPersonPhoto,
  });

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
    <span data-hbc-article-byline="true" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <HbcAvatarStack
        size="sm"
        people={[
          {
            id: authorUpn ?? author,
            name: author,
            src: resolvedPhoto,
          },
        ]}
      />
      <span>{formatByline(article)}</span>
    </span>
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
