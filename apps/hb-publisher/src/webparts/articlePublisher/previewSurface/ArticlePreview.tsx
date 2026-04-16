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
import { sectionAnchorForFindingField } from '../controllers/findingAnchor.js';
import { handleSectionIndexClick } from '../sectionFocus.js';
import { selectVisibleTeamMembers } from '../../../data/publisherAdapter/teamViewerAdapter.js';
import styles from './articlePreview.module.css';

const INLINE_FINDING_LIMIT = 3;

export interface ArticlePreviewProps {
  readonly outcome: PreviewOutcome | undefined;
  readonly loading: boolean;
  /**
   * Truth model: preview is always composed from the last saved draft
   * through the shared publish/preview contract. When the author has
   * unsaved edits, `isDirty` flips on and the surface renders a
   * staleness banner with a one-click save-and-refresh action so
   * the author is never left to infer that preview is behind.
   */
  readonly isDirty?: boolean;
  readonly onSaveAndRefresh?: () => void;
  readonly saveAndRefreshDisabled?: boolean;
}

export function ArticlePreview({
  outcome,
  loading,
  isDirty = false,
  onSaveAndRefresh,
  saveAndRefreshDisabled = false,
}: ArticlePreviewProps): React.JSX.Element {
  if (loading && !outcome) return <HbcSpinner />;
  if (!outcome) {
    return (
      <>
        {isDirty && (
          <PreviewStalenessBanner
            onSaveAndRefresh={onSaveAndRefresh}
            disabled={saveAndRefreshDisabled}
          />
        )}
        <HbcEmptyState
          title="Preview not yet built"
          description="Preview composes from the last saved draft. Save the draft to build the first preview."
        />
      </>
    );
  }
  if (!outcome.ok) {
    return (
      <>
        {isDirty && (
          <PreviewStalenessBanner
            onSaveAndRefresh={onSaveAndRefresh}
            disabled={saveAndRefreshDisabled}
          />
        )}
        <HbcEmptyState
          title="Preview unavailable"
          description="We couldn't compose a preview from the last saved draft. Publish Readiness has the details."
        />
      </>
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
  // Delegate ordering to the shared publisher-adapter selector so the
  // preview renders team members in the exact same order the page
  // compositor (`pageCompositor.ts`) ships to the published page.
  // Intrinsic fidelity — no room for a local-sort drift to appear
  // only once the article is live.
  const orderedTeam = selectVisibleTeamMembers(teamMembers);

  return (
    <article className={styles.root} aria-label="Article preview">
      {isDirty && (
        <PreviewStalenessBanner
          onSaveAndRefresh={onSaveAndRefresh}
          disabled={saveAndRefreshDisabled}
        />
      )}
      <TrustBridge
        errors={outcome.validation.errors}
        warnings={outcome.validation.warnings}
      />
      {!errorCount && !warningCount && (
        <p className={styles.trustBridgeClean} role="status" aria-live="polite">
          Preview reflects the last saved draft — no blocking issues and no
          warnings.
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

/* ── Preview staleness banner ────────────────────────────────────
 * The preview surface composes exclusively from the last saved
 * draft through the shared publish/preview contract — that is the
 * product's coherent preview truth model. When the author has
 * unsaved edits in the in-memory working copy, the preview is
 * therefore behind by definition. The banner makes that explicit
 * and offers a direct save-and-refresh path so the author never
 * has to infer a hidden save/recompose sequence.
 */
function PreviewStalenessBanner({
  onSaveAndRefresh,
  disabled = false,
}: {
  onSaveAndRefresh?: () => void;
  disabled?: boolean;
}): React.JSX.Element {
  return (
    <aside
      className={styles.stalenessBanner}
      role="status"
      aria-live="polite"
      aria-label="Preview is behind unsaved edits"
    >
      <p className={styles.stalenessHeadline}>
        Preview is behind your unsaved edits.
      </p>
      <p className={styles.stalenessDetail}>
        Preview always composes from the last saved draft so it matches what
        publish will ship. Save to bring preview current.
      </p>
      {onSaveAndRefresh && (
        <button
          type="button"
          className={styles.stalenessAction}
          onClick={onSaveAndRefresh}
          disabled={disabled}
        >
          Save and refresh preview
        </button>
      )}
    </aside>
  );
}

/* ── Trust bridge ────────────────────────────────────────────────
 * Structured remediation panel rendered at the top of the preview.
 * Replaces the prior one-line "see the Readiness rail" pointer with
 * an actionable surface: every inline finding carries its own jump
 * link to the authoring section that owns the field, so the author
 * can act from where they're reading the preview. Overflow beyond
 * INLINE_FINDING_LIMIT is summarised back to the readiness rail so
 * the rail stays the authoritative index and we don't duplicate
 * every finding in three places.
 */

interface TrustBridgeFinding {
  readonly message: string;
  readonly actionHint?: string;
  readonly field?: string;
}

function TrustBridge({
  errors,
  warnings,
}: {
  errors: readonly TrustBridgeFinding[];
  warnings: readonly TrustBridgeFinding[];
}): React.JSX.Element | null {
  const errorCount = errors.length;
  const warningCount = warnings.length;
  if (errorCount === 0 && warningCount === 0) return null;
  const blocking = errorCount > 0;
  const shown = blocking
    ? errors.slice(0, INLINE_FINDING_LIMIT)
    : warnings.slice(0, INLINE_FINDING_LIMIT);
  const remaining = Math.max(
    (blocking ? errorCount : warningCount) - shown.length,
    0,
  );

  return (
    <aside
      className={blocking ? styles.trustBridgeBlocking : styles.trustBridgeWarn}
      role="status"
      aria-live="polite"
      aria-label={blocking ? 'Preview blocking issues' : 'Preview warnings'}
    >
      <p className={styles.trustBridgeHeadline}>
        {blocking
          ? `Preview reflects the last saved draft — ${errorCount} blocking issue${
              errorCount === 1 ? '' : 's'
            } to fix before publish.`
          : `Preview reflects the last saved draft — ${warningCount} warning${
              warningCount === 1 ? '' : 's'
            } to review before publish.`}
      </p>
      <ul
        className={styles.trustBridgeList}
        onClick={handleSectionIndexClick}
      >
        {shown.map((finding, idx) => {
          const anchor = sectionAnchorForFindingField(finding.field);
          return (
            <li key={idx} className={styles.trustBridgeItem}>
              <span>{finding.message}</span>
              {finding.actionHint && (
                <>
                  {' '}
                  <span className={styles.trustBridgeHint}>
                    {finding.actionHint}
                  </span>
                </>
              )}
              {anchor && (
                <>
                  {' '}
                  <a
                    href={`#${anchor.sectionId}`}
                    className={styles.trustBridgeAnchor}
                  >
                    Go to {anchor.label} →
                  </a>
                </>
              )}
            </li>
          );
        })}
      </ul>
      {remaining > 0 && (
        <p className={styles.trustBridgeOverflow}>
          + {remaining} more in the Readiness rail.
        </p>
      )}
    </aside>
  );
}

function bySortOrderThenAsset(a: PublisherMediaRow, b: PublisherMediaRow): number {
  const ao = a.SortOrder ?? Number.MAX_SAFE_INTEGER;
  const bo = b.SortOrder ?? Number.MAX_SAFE_INTEGER;
  if (ao !== bo) return ao - bo;
  return a.ImageAsset.localeCompare(b.ImageAsset);
}
