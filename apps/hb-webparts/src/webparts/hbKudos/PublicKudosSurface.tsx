/**
 * PublicKudosSurface — local composition of the public HB Kudos surface.
 *
 * Implements the phase-17 locked UX decisions:
 *
 *   Masthead:
 *     - single row: {trophy icon} HB Kudos — Give Kudos (right-aligned)
 *     - no subcaption, no View All (moved into the archive zone)
 *
 *   Featured card:
 *     - badge in top-right corner; label is "Featured Recognition" on
 *       desktop/tablet (>=768px) and "Featured" on mobile (<768px)
 *     - recipient name = primary header
 *     - headline / reason = secondary header
 *     - excerpt clamped with inline "… Read more" that opens the
 *       stripped article reader panel
 *     - footer: "Submitted by {submitter}" on the left; thumbs-up-like
 *       celebrate control on the right with a tactile tap pulse
 *
 *   Recent list:
 *     - each row is a button that opens the article reader
 *
 * Phase-18 Wave 1 styling rebuild: the dominant <style>{...}</style>
 * block formerly rendered inline here has moved into
 * `kudosSurface.module.css` + variant slots. Token-backed CSS custom
 * properties are set at the section root from KUDOS_GOV_TOKENS so the
 * module's `var(--pks-*)` references always resolve to governed values.
 */
import * as React from 'react';
import { HbcAvatarStack, HbcEmptyState } from '@hbc/ui-kit/homepage';
import { type KudosEntry } from '../../homepage/webparts/kudosContracts.js';
import { KUDOS_GOV_TOKENS } from '../../homepage/shared/KudosGovernancePrimitives.js';
import { Trophy, Sparkles, ThumbsUp } from './kudosIcons.js';
import styles from './kudosSurface.module.css';

/**
 * formatRecipientDisplay — produce a real honoree-name label for the
 * featured card, recent rows, archive rows, and reader title. Never
 * returns aggregate bucket strings like "1 individual".
 *
 *   0 recipients   → "Recognition"
 *   1 recipient    → "Jane Doe"
 *   2 recipients   → "Jane Doe and John Smith"
 *   3+ recipients  → "Jane Doe, John Smith, and N more"
 */
export function formatRecipientDisplay(
  recipients: Array<{ name?: string | null }>,
): string {
  const named = recipients
    .map((r) => (typeof r?.name === 'string' ? r.name.trim() : ''))
    .filter((n) => n.length > 0);
  if (named.length === 0) return 'Recognition';
  if (named.length === 1) return named[0]!;
  if (named.length === 2) return `${named[0]} and ${named[1]}`;
  return `${named[0]}, ${named[1]}, and ${named.length - 2} more`;
}

export interface PublicKudosSurfaceProps {
  heading: string;
  featured?: KudosEntry;
  recent: KudosEntry[];
  onGiveKudos: () => void;
  onCelebrate?: (kudosId: string) => void;
  celebrateLoading?: boolean;
  onOpenArticle: (entry: KudosEntry) => void;
}

function useIsCompact(breakpointPx = 768): boolean {
  const [isCompact, setIsCompact] = React.useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(`(max-width: ${breakpointPx - 1}px)`).matches;
  });
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia(`(max-width: ${breakpointPx - 1}px)`);
    const onChange = (): void => setIsCompact(mq.matches);
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    }
    // Fallback for older Safari
    mq.addListener(onChange);
    return () => mq.removeListener(onChange);
  }, [breakpointPx]);
  return isCompact;
}

function formatSubmittedBy(entry: KudosEntry): string {
  return entry.submittedBy?.displayName
    ? `Submitted by ${entry.submittedBy.displayName}`
    : 'Submitted';
}

export function PublicKudosSurface({
  heading,
  featured,
  recent,
  onGiveKudos,
  onCelebrate,
  celebrateLoading,
  onOpenArticle,
}: PublicKudosSurfaceProps): React.JSX.Element {
  const isCompact = useIsCompact(768);
  const featuredBadgeLabel = isCompact ? 'Featured' : 'Featured Recognition';

  const surfaceVars = {
    '--pks-orange-06': KUDOS_GOV_TOKENS.orangeSubtle06,
    '--pks-orange-18': KUDOS_GOV_TOKENS.orangeSubtle18,
    '--pks-orange-22': KUDOS_GOV_TOKENS.orangeSubtle22,
    '--pks-brand-blue': KUDOS_GOV_TOKENS.brandBlue,
    '--pks-brand-orange': KUDOS_GOV_TOKENS.brandOrange,
    '--pks-text-primary': KUDOS_GOV_TOKENS.textPrimary,
    '--pks-text-secondary': KUDOS_GOV_TOKENS.textSecondary,
    '--pks-text-faint': KUDOS_GOV_TOKENS.textFaint,
  } as React.CSSProperties;

  return (
    <section
      className={styles.section}
      data-hbc-webpart-section="hb-kudos-public-surface"
      aria-label={heading}
      style={surfaceVars}
    >
      {/* Unified hero zone — masthead (upper band) + featured
          (nested content surface) share one gradient atmosphere. */}
      <div className={styles.hero} data-hbc-testid="hb-kudos-hero-zone">
        <div className={styles.masthead}>
          <h2 className={styles.title} data-hbc-testid="hb-kudos-hero-band">
            <span className={styles.titleIcon} aria-hidden="true">
              <Trophy size={16} strokeWidth={2.25} />
            </span>
            {heading}
          </h2>
          <button
            type="button"
            className={styles.giveBtn}
            onClick={onGiveKudos}
            data-hbc-testid="hb-kudos-give-trigger"
          >
            <Sparkles size={14} strokeWidth={2.25} aria-hidden="true" />
            Give Kudos
          </button>
        </div>

        {featured ? (
          <FeaturedCard
            entry={featured}
            badgeLabel={featuredBadgeLabel}
            onCelebrate={onCelebrate}
            celebrateLoading={celebrateLoading}
            onOpenArticle={onOpenArticle}
          />
        ) : (
          <HbcEmptyState
            title="No recognition yet"
            description="Be the first to send kudos this week."
          />
        )}
      </div>

      {/* Recent */}
      {recent.length > 0 ? (
        <>
          <div className={styles.recentLabel} data-hbc-testid="hb-kudos-recent-section">
            Recent recognition
          </div>
          <div className={styles.recentList}>
            {recent.map((item) => {
              const recipientDisplay = formatRecipientDisplay(item.recipients);
              return (
                <button
                  key={item.id}
                  type="button"
                  className={styles.recentRow}
                  onClick={() => onOpenArticle(item)}
                  aria-label={`Open recognition for ${recipientDisplay}`}
                  data-hbc-testid="hb-kudos-recent-row"
                >
                  {item.recipients.length > 0 ? (
                    <HbcAvatarStack
                      people={item.recipients.slice(0, 1).map((r) => ({
                        id: r.id,
                        name: r.name,
                        src: r.media?.src,
                      }))}
                      size="sm"
                    />
                  ) : null}
                  <div className={styles.recentBody}>
                    <div className={styles.recentRecipient}>{recipientDisplay}</div>
                    <div className={styles.recentHeadline}>{item.headline || 'Recognition'}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      ) : null}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Featured card — recipient-primary hierarchy with reader entry
// ---------------------------------------------------------------------------

interface FeaturedCardProps {
  entry: KudosEntry;
  badgeLabel: string;
  onCelebrate?: (kudosId: string) => void;
  celebrateLoading?: boolean;
  onOpenArticle: (entry: KudosEntry) => void;
}

function FeaturedCard({
  entry,
  badgeLabel,
  onCelebrate,
  celebrateLoading,
  onOpenArticle,
}: FeaturedCardProps): React.JSX.Element {
  const recipientDisplay = formatRecipientDisplay(entry.recipients);
  const celebrateCount = entry.celebrateCount ?? 0;

  // Preview body — prefer excerpt, fall back to details so records with
  // long-form content only in `details` still feed the clamped preview
  // and still expose a Read more path to the reader.
  const rawExcerpt = entry.excerpt?.trim() ?? '';
  const rawDetails = entry.details?.trim() ?? '';
  const previewBody = rawExcerpt || rawDetails;
  const hasPreview = previewBody.length > 0;

  // Measured truncation: compare scrollHeight to clientHeight on the
  // clamped container. Only show Read more when the clamp actually
  // hides content, OR when `details` carries meaningfully more text
  // than the preview exposes.
  const excerptRef = React.useRef<HTMLDivElement | null>(null);
  const [isClampTruncated, setIsClampTruncated] = React.useState(false);
  React.useLayoutEffect(() => {
    const el = excerptRef.current;
    if (!el) {
      setIsClampTruncated(false);
      return;
    }
    const check = (): void => {
      setIsClampTruncated(el.scrollHeight - el.clientHeight > 1);
    };
    check();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(check) : null;
    if (ro) ro.observe(el);
    window.addEventListener('resize', check);
    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener('resize', check);
    };
  }, [previewBody]);

  const detailsExceedsPreview = rawDetails.length > rawExcerpt.length + 40;
  const showReadMore = hasPreview && (isClampTruncated || detailsExceedsPreview);

  return (
    <article className={styles.featured} data-hbc-testid="hb-kudos-featured-card">
      <span className={styles.featuredBadge} aria-label={badgeLabel}>
        <Sparkles size={11} strokeWidth={2.5} aria-hidden="true" />
        {badgeLabel}
      </span>

      <div className={styles.featuredTop}>
        {entry.recipients.length > 0 ? (
          <HbcAvatarStack
            people={entry.recipients.slice(0, 3).map((r) => ({
              id: r.id,
              name: r.name,
              src: r.media?.src,
            }))}
            size="md"
            max={3}
          />
        ) : null}
        <div className={styles.featuredHeader}>
          <h3 className={styles.featuredRecipient}>{recipientDisplay}</h3>
          {entry.headline ? (
            <p className={styles.featuredHeadline}>{entry.headline}</p>
          ) : null}
        </div>
      </div>

      {hasPreview ? (
        <div className={styles.featuredBody}>
          {/* Clamped container is markup-only text so the webkit-box
              clamp never hides the action affordance below. */}
          <div
            ref={excerptRef}
            className={styles.featuredExcerpt}
            data-hbc-testid="hb-kudos-featured-excerpt"
          >
            {previewBody}
          </div>
          {showReadMore ? (
            <button
              type="button"
              className={styles.readmoreBtn}
              onClick={() => onOpenArticle(entry)}
              aria-label="Read full recognition"
              data-hbc-testid="hb-kudos-featured-readmore"
            >
              … Read more
            </button>
          ) : null}
        </div>
      ) : null}

      <div className={styles.featuredFooter}>
        <span>{formatSubmittedBy(entry)}</span>
        {onCelebrate ? (
          <button
            type="button"
            className={styles.celebrateBtn}
            onClick={() => onCelebrate(entry.id)}
            disabled={celebrateLoading}
            aria-label="Celebrate this recognition"
            data-hbc-testid="hb-kudos-celebrate"
          >
            <span className={styles.celebrateIcon} aria-hidden="true">
              <ThumbsUp size={13} strokeWidth={2.25} />
            </span>
            <span data-hbc-testid="hb-kudos-celebrate-count">{celebrateCount}</span>
          </button>
        ) : null}
      </div>
    </article>
  );
}
