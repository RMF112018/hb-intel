/**
 * ArticlePreview — editorial visual preview of the article.
 * Workstream-f step-02.
 *
 * Reads a shared PreviewOutcome and renders the article the way
 * the hosted page will (near enough for authors to trust it),
 * WITHOUT narrating validation, drift, or publish-decision prose.
 * That content lives on the Publish Readiness surface (step-03).
 */

import * as React from 'react';
import { HbcEmptyState, HbcSpinner } from '@hbc/ui-kit/homepage';
import type { PreviewOutcome } from '../../../data/publisherAdapter/preview/previewBuilder.js';
import type {
  PublisherArticleRow,
  PublisherMediaRow,
  PublisherTeamMemberRow,
} from '../../../data/publisherAdapter/index.js';
import { bodyTextSnippet } from '../storyBodyEditor/index.js';
import { teamMemberInitials } from '../teamComposer/index.js';
import styles from './articlePreview.module.css';

export interface ArticlePreviewProps {
  readonly outcome: PreviewOutcome | undefined;
  readonly loading: boolean;
}

export function ArticlePreview({ outcome, loading }: ArticlePreviewProps): React.JSX.Element {
  if (loading && !outcome) return <HbcSpinner />;
  if (!outcome) {
    return (
      <HbcEmptyState
        title="Preview not yet built"
        description="Add content above — your article appears here the way it will on the published page."
      />
    );
  }
  if (!outcome.ok) {
    return (
      <HbcEmptyState
        title="Preview unavailable"
        description="We couldn't compose a preview from the current draft. Publish Readiness has the details."
      />
    );
  }

  const { resolution } = outcome;
  const { article, teamMembers, media } = resolution;
  const errorCount = outcome.validation.errors.length;
  const warningCount = outcome.validation.warnings.length;

  const heroImage = article.HeroPrimaryImage;
  const heroAlt = article.HeroPrimaryImageAltText;
  const eyebrow = article.HeroEyebrow?.trim();
  const categoryLabel = article.HeroCategoryLabel?.trim();
  const heroHeadline = article.HeroTitle?.trim() || article.Title;
  const bodyHtml = article.BodyRichText;
  const bodyIntro = article.BodyIntro?.trim();
  const bodyClosing = article.BodyClosing?.trim();
  const callout = article.CalloutText?.trim();
  const pullQuote = article.PullQuote?.trim();

  const galleryImages = media
    .filter((m) => m.MediaRole === 'gallery')
    .slice()
    .sort(bySortOrderThenAsset);

  const featuredTeammate = teamMembers.find((t) => t.IsFeaturedMember === true);
  const orderedTeam = teamMembers
    .slice()
    .sort((a, b) => {
      const ao = a.SortOrder ?? Number.MAX_SAFE_INTEGER;
      const bo = b.SortOrder ?? Number.MAX_SAFE_INTEGER;
      if (ao !== bo) return ao - bo;
      return a.DisplayName.localeCompare(b.DisplayName);
    });

  return (
    <article className={styles.root} aria-label="Article preview">
      {(errorCount > 0 || warningCount > 0) && (
        <p
          className={
            errorCount > 0
              ? styles.trustBridgeBlocking
              : styles.trustBridgeWarn
          }
          role="status"
          aria-live="polite"
        >
          {errorCount > 0
            ? `Preview shows the current draft — ${errorCount} blocking issue${
                errorCount === 1 ? '' : 's'
              } still to fix. See the Readiness rail.`
            : `Preview shows the current draft — ${warningCount} warning${
                warningCount === 1 ? '' : 's'
              } to review in the Readiness rail.`}
        </p>
      )}

      <HomepageCardPreview article={article} heroImage={heroImage} heroAlt={heroAlt} />

      <header className={styles.hero}>
        {heroImage && (
          <div className={styles.heroMedia}>
            <img src={heroImage} alt={heroAlt || ''} className={styles.heroImage} />
          </div>
        )}
        <div className={styles.heroText}>
          {eyebrow && <span className={styles.heroEyebrow}>{eyebrow}</span>}
          {categoryLabel && <span className={styles.heroCategory}>{categoryLabel}</span>}
          <h1 className={styles.heroHeadline}>{heroHeadline}</h1>
          {article.Subhead && <p className={styles.heroSubhead}>{article.Subhead}</p>}
        </div>
      </header>

      {article.SummaryExcerpt && (
        <p className={styles.summary}>{article.SummaryExcerpt}</p>
      )}

      {bodyIntro && <p className={styles.bodyIntro}>{bodyIntro}</p>}

      {bodyHtml ? (
        <div
          className={styles.bodyProse}
          // eslint-disable-next-line react/no-danger -- body HTML is schema-locked via TipTap + paste sanitiser
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />
      ) : (
        <p className={styles.bodyEmpty}>No body content yet.</p>
      )}

      {callout && (
        <aside className={styles.callout} aria-label="Editorial callout">
          {callout}
        </aside>
      )}

      {pullQuote && (
        <blockquote className={styles.pullQuote}>{pullQuote}</blockquote>
      )}

      {bodyClosing && <p className={styles.bodyClosing}>{bodyClosing}</p>}

      {orderedTeam.length > 0 && (
        <section className={styles.teamSection} aria-label="Team preview">
          <h2 className={styles.sectionHeading}>
            {article.TeamViewerTitle?.trim() || 'Team'}
          </h2>
          {featuredTeammate && (
            <TeammateChip row={featuredTeammate} featured className={styles.teammateFeatured} />
          )}
          <ul className={styles.teamList}>
            {orderedTeam
              .filter((t) => t.TeamMemberId !== featuredTeammate?.TeamMemberId)
              .map((t) => (
                <li key={t.TeamMemberId}>
                  <TeammateChip row={t} />
                </li>
              ))}
          </ul>
        </section>
      )}

      {galleryImages.length > 0 && (
        <section className={styles.gallerySection} aria-label="Gallery preview">
          <h2 className={styles.sectionHeading}>Gallery</h2>
          <ol className={styles.galleryGrid}>
            {galleryImages.map((img) => (
              <li
                key={img.MediaId}
                className={
                  img.FeaturedInGallery
                    ? `${styles.galleryTile} ${styles.galleryTileFeatured}`
                    : styles.galleryTile
                }
              >
                <figure className={styles.galleryFigure}>
                  <img
                    src={img.ImageAsset}
                    alt={img.AltText || ''}
                    className={styles.galleryImage}
                  />
                  {(img.Caption?.trim() || img.FeaturedInGallery) && (
                    <figcaption className={styles.galleryCaption}>
                      {img.FeaturedInGallery && (
                        <span className={styles.featuredBadge}>Featured</span>
                      )}
                      {img.Caption?.trim()}
                    </figcaption>
                  )}
                </figure>
              </li>
            ))}
          </ol>
        </section>
      )}
    </article>
  );
}

function HomepageCardPreview({
  article,
  heroImage,
  heroAlt,
}: {
  article: PublisherArticleRow;
  heroImage: string;
  heroAlt: string;
}): React.JSX.Element {
  const summary =
    article.SummaryExcerpt ||
    bodyTextSnippet(article.BodyRichText, 160) ||
    article.Subhead;
  return (
    <section className={styles.cardPreview} aria-label="Homepage card preview">
      <span className={styles.cardPreviewLabel}>How this appears on the homepage</span>
      <div className={styles.card}>
        {heroImage && (
          <div className={styles.cardThumb}>
            <img src={heroImage} alt={heroAlt || ''} />
          </div>
        )}
        <div className={styles.cardBody}>
          <h3 className={styles.cardTitle}>{article.Title || 'Untitled article'}</h3>
          {summary && <p className={styles.cardSummary}>{summary}</p>}
        </div>
      </div>
    </section>
  );
}

function TeammateChip({
  row,
  featured,
  className,
}: {
  row: PublisherTeamMemberRow;
  featured?: boolean;
  className?: string;
}): React.JSX.Element {
  const displayName = row.DisplayName || row.PersonPrincipal;
  const jobTitle = firstNonEmpty(row.Role, row.Title);
  return (
    <div className={`${styles.teammateChip} ${className ?? ''}`}>
      <span className={styles.teammateAvatar} aria-hidden="true">
        {teamMemberInitials(row)}
      </span>
      <span className={styles.teammateText}>
        <span className={styles.teammateName}>
          {displayName}
          {featured && <span className={styles.featuredBadge}>Featured</span>}
        </span>
        {jobTitle && <span className={styles.teammateTitle}>{jobTitle}</span>}
        {row.Department && <span className={styles.teammateDept}>{row.Department}</span>}
        {row.BioSnippet && <span className={styles.teammateBio}>{row.BioSnippet}</span>}
      </span>
    </div>
  );
}

function firstNonEmpty(...values: readonly (string | undefined)[]): string | undefined {
  for (const v of values) {
    if (typeof v !== 'string') continue;
    const t = v.trim();
    if (t.length > 0) return t;
  }
  return undefined;
}

function bySortOrderThenAsset(a: PublisherMediaRow, b: PublisherMediaRow): number {
  const ao = a.SortOrder ?? Number.MAX_SAFE_INTEGER;
  const bo = b.SortOrder ?? Number.MAX_SAFE_INTEGER;
  if (ao !== bo) return ao - bo;
  return a.ImageAsset.localeCompare(b.ImageAsset);
}
