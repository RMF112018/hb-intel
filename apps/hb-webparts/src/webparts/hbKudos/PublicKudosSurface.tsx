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
import { Trophy, Sparkles, ThumbsUp } from './kudosIcons.js';
import styles from './kudosSurface.module.css';
import {
  kudosGiveCta,
  kudosCelebrateBtn,
  kudosCelebrateIcon,
  kudosReadmoreBtn,
  kudosFeaturedBadge,
  kudosRow,
} from './kudosVariants.js';

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
  archiveCount?: number;
  onGiveKudos: () => void;
  onCelebrate?: (kudosId: string) => void;
  celebrateLoading?: boolean;
  onOpenArticle: (entry: KudosEntry) => void;
}

type FeaturedLayoutMode = 'default' | 'compact' | 'handheld';

function useFeaturedLayoutMode(): FeaturedLayoutMode {
  const [mode, setMode] = React.useState<FeaturedLayoutMode>(() => {
    if (typeof window === 'undefined') return 'default';
    const width = window.innerWidth;
    if (width <= 559) return 'handheld';
    if (width <= 959) return 'compact';
    return 'default';
  });

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const mqHandheld = window.matchMedia('(max-width: 559px)');
    const mqCompact = window.matchMedia('(max-width: 959px)');
    const updateMode = (): void => {
      if (mqHandheld.matches) {
        setMode('handheld');
        return;
      }
      if (mqCompact.matches) {
        setMode('compact');
        return;
      }
      setMode('default');
    };
    updateMode();
    if (
      typeof mqHandheld.addEventListener === 'function' &&
      typeof mqCompact.addEventListener === 'function'
    ) {
      mqHandheld.addEventListener('change', updateMode);
      mqCompact.addEventListener('change', updateMode);
      return () => {
        mqHandheld.removeEventListener('change', updateMode);
        mqCompact.removeEventListener('change', updateMode);
      };
    }
    // Fallback for older Safari
    mqHandheld.addListener(updateMode);
    mqCompact.addListener(updateMode);
    return () => {
      mqHandheld.removeListener(updateMode);
      mqCompact.removeListener(updateMode);
    };
  }, []);
  return mode;
}

function formatSubmittedBy(entry: KudosEntry): string {
  return entry.submittedBy?.displayName
    ? `Submitted by ${entry.submittedBy.displayName}`
    : 'Submitted';
}

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function dedupeEntries(featured: KudosEntry | undefined, recent: KudosEntry[]): KudosEntry[] {
  const byId = new Map<string, KudosEntry>();
  if (featured) byId.set(featured.id, featured);
  recent.forEach((entry) => {
    if (!byId.has(entry.id)) byId.set(entry.id, entry);
  });
  return Array.from(byId.values());
}

interface LightDataStory {
  title: string;
  body: string;
  prompt: string;
}

function buildLightDataStory(input: {
  hasFeatured: boolean;
  recentCount: number;
  archiveCount: number;
  activityCount: number;
  latestActivityDate: string;
}): LightDataStory {
  const { hasFeatured, recentCount, archiveCount, activityCount, latestActivityDate } = input;
  if (hasFeatured && recentCount === 0) {
    return {
      title: 'No new recognition this week',
      body: latestActivityDate
        ? `The current spotlight still reflects active appreciation from ${latestActivityDate}.`
        : 'The current spotlight still reflects active appreciation across HB.',
      prompt: 'Add one new kudos today to keep this week’s recognition story moving.',
    };
  }
  if (!hasFeatured && activityCount === 0 && archiveCount > 0) {
    return {
      title: 'This week is ready for its first spotlight',
      body: `${archiveCount} past ${archiveCount === 1 ? 'recognition is' : 'recognitions are'} available in the archive while new kudos builds.`,
      prompt: 'Use Give Kudos to start the next recognition moment on the homepage.',
    };
  }
  if (!hasFeatured && activityCount === 0 && archiveCount === 0) {
    return {
      title: 'Start this week at HB',
      body: 'The recognition board is open and ready for the first story.',
      prompt: 'Share one meaningful kudos to set the tone for the team.',
    };
  }
  return {
    title: recentCount <= 2 ? 'Recognition is active and building' : 'Recognition pulse this week',
    body: latestActivityDate
      ? `Recent activity was updated ${latestActivityDate} and continues to grow.`
      : 'Recent activity is starting to build across teams.',
    prompt: 'Keep momentum going by recognizing a teammate’s impact.',
  };
}

export function PublicKudosSurface({
  heading,
  featured,
  recent,
  archiveCount = 0,
  onGiveKudos,
  onCelebrate,
  celebrateLoading,
  onOpenArticle,
}: PublicKudosSurfaceProps): React.JSX.Element {
  const featuredLayoutMode = useFeaturedLayoutMode();
  const activityEntries = React.useMemo(() => dedupeEntries(featured, recent), [featured, recent]);
  const recognitionCount = activityEntries.length;
  const celebrationCount = activityEntries.reduce((sum, entry) => sum + (entry.celebrateCount ?? 0), 0);
  const recognizedPeopleCount = React.useMemo(() => {
    const people = new Set<string>();
    activityEntries.forEach((entry) => {
      entry.recipients.forEach((recipient) => {
        const key = (recipient.id || recipient.name || '').trim();
        if (key) people.add(key.toLowerCase());
      });
    });
    return people.size;
  }, [activityEntries]);
  const latestActivityDate = React.useMemo(() => {
    let latest = 0;
    activityEntries.forEach((entry) => {
      const parsed = new Date(entry.submittedDate).getTime();
      if (!Number.isNaN(parsed) && parsed > latest) latest = parsed;
    });
    if (!latest) return '';
    return formatShortDate(new Date(latest).toISOString());
  }, [activityEntries]);
  const showLightDataStory = !featured || recent.length <= 2;
  const lightDataStory = React.useMemo(
    () =>
      buildLightDataStory({
        hasFeatured: Boolean(featured),
        recentCount: recent.length,
        archiveCount,
        activityCount: recognitionCount,
        latestActivityDate,
      }),
    [featured, recent.length, archiveCount, recognitionCount, latestActivityDate],
  );
  const featuredBadgeLabel =
    featuredLayoutMode === 'handheld'
      ? null
      : featuredLayoutMode === 'compact'
        ? 'Featured'
        : 'Featured Recognition';

  return (
    <section
      className={styles.section}
      data-hbc-webpart-section="hb-kudos-public-surface"
      aria-label={heading}
    >
      {/* Unified hero zone — masthead (upper band) + featured
          (nested content surface) share one gradient atmosphere. */}
      <div className={styles.hero} data-hbc-testid="hb-kudos-hero-zone">
        <div className={styles.masthead} data-layout-mode={featuredLayoutMode}>
          <h2 className={styles.title} data-hbc-testid="hb-kudos-hero-band">
            <span className={styles.titleIcon} aria-hidden="true">
              <Trophy size={16} strokeWidth={2.25} />
            </span>
            {heading}
          </h2>
          <button
            type="button"
            className={kudosGiveCta()}
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
            layoutMode={featuredLayoutMode}
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

      {showLightDataStory ? (
        <section
          aria-labelledby="hb-kudos-pulse-title"
          data-hbc-webpart-section="hb-kudos-pulse"
          data-hbc-testid="hb-kudos-pulse-section"
        >
          <div className={styles.sectionHeader}>
            <div className={styles.sectionHeaderTop}>
              <span className={styles.sectionEyebrow}>Recognition pulse</span>
              <span className={styles.sectionMeta}>
                {latestActivityDate ? `Updated ${latestActivityDate}` : 'This week'}
              </span>
            </div>
            <h3 id="hb-kudos-pulse-title" className={styles.sectionTitle}>
              {lightDataStory.title}
            </h3>
          </div>
          {recognitionCount > 0 ? (
            <div className={styles.pulseStats}>
              <div className={styles.pulseStat}>
                <span className={styles.pulseStatValue}>{recognitionCount}</span>
                <span className={styles.pulseStatLabel}>
                  {recognitionCount === 1 ? 'recognition' : 'recognitions'}
                </span>
              </div>
              <div className={styles.pulseStat}>
                <span className={styles.pulseStatValue}>{recognizedPeopleCount}</span>
                <span className={styles.pulseStatLabel}>
                  {recognizedPeopleCount === 1 ? 'person recognized' : 'people recognized'}
                </span>
              </div>
              <div className={styles.pulseStat}>
                <span className={styles.pulseStatValue}>{celebrationCount}</span>
                <span className={styles.pulseStatLabel}>
                  {celebrationCount === 1 ? 'celebration' : 'celebrations'}
                </span>
              </div>
            </div>
          ) : (
            <p className={styles.pulseEmpty}>No new recognition has landed yet this week.</p>
          )}
          <p className={styles.pulseStory}>{lightDataStory.body}</p>
          <p className={styles.pulsePrompt}>{lightDataStory.prompt}</p>
        </section>
      ) : null}

      {/* Recent — productized stream zone with section header + date spines */}
      {recent.length > 0 ? (
        <section
          aria-labelledby="hb-kudos-recent-title"
          data-hbc-webpart-section="hb-kudos-recent"
          data-hbc-testid="hb-kudos-recent-section"
        >
          <div className={styles.sectionHeader}>
            <div className={styles.sectionHeaderTop}>
              <span className={styles.sectionEyebrow}>Recent recognition</span>
              <span className={styles.sectionMeta} data-hbc-testid="hb-kudos-recent-count">
                {recent.length} {recent.length === 1 ? 'entry' : 'entries'}
              </span>
            </div>
            <h3 id="hb-kudos-recent-title" className={styles.sectionTitle}>
              This week at HB
            </h3>
          </div>
          <div className={styles.recentList}>
            {recent.map((item) => {
              const recipientDisplay = formatRecipientDisplay(item.recipients);
              const shortDate = formatShortDate(item.submittedDate);
              return (
                <button
                  key={item.id}
                  type="button"
                  className={kudosRow({ variant: 'recent' })}
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
                  {shortDate ? (
                    <time
                      className={styles.rowDate}
                      dateTime={item.submittedDate}
                      aria-label={`Submitted ${shortDate}`}
                    >
                      {shortDate}
                    </time>
                  ) : null}
                </button>
              );
            })}
          </div>
        </section>
      ) : null}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Featured card — recipient-primary hierarchy with reader entry
// ---------------------------------------------------------------------------

interface FeaturedCardProps {
  entry: KudosEntry;
  badgeLabel: string | null;
  layoutMode: FeaturedLayoutMode;
  onCelebrate?: (kudosId: string) => void;
  celebrateLoading?: boolean;
  onOpenArticle: (entry: KudosEntry) => void;
}

function FeaturedCard({
  entry,
  badgeLabel,
  layoutMode,
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
  const showExcerpt = hasPreview && layoutMode !== 'handheld';
  const isHandheld = layoutMode === 'handheld';
  const showSubmittedBy = !isHandheld;
  const featuredModeClass =
    layoutMode === 'compact'
      ? styles.featuredCompact
      : layoutMode === 'handheld'
        ? styles.featuredHandheld
        : '';

  return (
    <article
      className={[styles.featured, featuredModeClass].filter(Boolean).join(' ')}
      data-hbc-testid="hb-kudos-featured-card"
      data-layout-mode={layoutMode}
      aria-labelledby={`hb-kudos-featured-recipient-${entry.id}`}
    >
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
        <div className={styles.featuredHeaderCluster}>
          <div className={styles.featuredHeader}>
            <h3
              id={`hb-kudos-featured-recipient-${entry.id}`}
              className={styles.featuredRecipient}
            >
              {recipientDisplay}
            </h3>
            {entry.headline ? (
              <p className={styles.featuredHeadline}>{entry.headline}</p>
            ) : null}
          </div>
          {badgeLabel ? (
            <span className={[kudosFeaturedBadge(), styles.featuredBadgeSlot].join(' ')} aria-label={badgeLabel}>
              <Sparkles size={11} strokeWidth={2.5} aria-hidden="true" />
              {badgeLabel}
            </span>
          ) : null}
        </div>
      </div>

      {showExcerpt ? (
        <div className={styles.featuredBody}>
          {/* Clamped container is markup-only text so the webkit-box
              clamp never hides the action affordance below. */}
          <div
            ref={excerptRef}
            id={`hb-kudos-featured-excerpt-${entry.id}`}
            className={styles.featuredExcerpt}
            data-hbc-testid="hb-kudos-featured-excerpt"
          >
            {previewBody}
          </div>
          {showReadMore ? (
            <button
              type="button"
              className={kudosReadmoreBtn()}
              onClick={() => onOpenArticle(entry)}
              aria-label={`Read full recognition for ${recipientDisplay}`}
              aria-describedby={`hb-kudos-featured-excerpt-${entry.id}`}
              data-hbc-testid="hb-kudos-featured-readmore"
            >
              … Read more
            </button>
          ) : null}
        </div>
      ) : null}

      <div className={styles.featuredFooter}>
        {isHandheld ? (
          <>
            <span className={styles.featuredHandheldMeta}>{formatSubmittedBy(entry)}</span>
            <div className={styles.featuredHandheldActions}>
              <button
                type="button"
                className={[kudosReadmoreBtn(), styles.featuredOpenBtn, styles.featuredOpenBtnPrimary].join(' ')}
                onClick={() => onOpenArticle(entry)}
                aria-label={`Open recognition for ${recipientDisplay}`}
                data-hbc-testid="hb-kudos-featured-open"
              >
                Open recognition
              </button>
              {onCelebrate ? (
                <button
                  type="button"
                  className={[kudosCelebrateBtn(), styles.featuredCelebrateHandheld].join(' ')}
                  onClick={() => onCelebrate(entry.id)}
                  disabled={celebrateLoading}
                  aria-busy={celebrateLoading ? 'true' : undefined}
                  aria-label="Celebrate this recognition"
                  data-hbc-testid="hb-kudos-celebrate"
                >
                  <span className={kudosCelebrateIcon()} aria-hidden="true">
                    <ThumbsUp size={13} strokeWidth={2.25} />
                  </span>
                  <span data-hbc-testid="hb-kudos-celebrate-count">{celebrateCount}</span>
                </button>
              ) : null}
            </div>
          </>
        ) : (
          <>
            {showSubmittedBy ? <span>{formatSubmittedBy(entry)}</span> : <span />}
            {onCelebrate ? (
              <button
                type="button"
                className={kudosCelebrateBtn()}
                onClick={() => onCelebrate(entry.id)}
                disabled={celebrateLoading}
                aria-busy={celebrateLoading ? 'true' : undefined}
                aria-label="Celebrate this recognition"
                data-hbc-testid="hb-kudos-celebrate"
              >
                <span className={kudosCelebrateIcon()} aria-hidden="true">
                  <ThumbsUp size={13} strokeWidth={2.25} />
                </span>
                <span data-hbc-testid="hb-kudos-celebrate-count">{celebrateCount}</span>
              </button>
            ) : null}
          </>
        )}
      </div>
    </article>
  );
}
