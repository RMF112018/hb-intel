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
 * This module composes @hbc/ui-kit primitives (HbcAvatarStack,
 * HbcEmptyState) but owns the layout itself so the HB Kudos public
 * webpart is no longer coupled to the opinionated
 * HbcPeopleCultureSurface homepage variant (which remains in use by
 * the PeopleCultureMerged webpart, unaffected by this change).
 */
import * as React from 'react';
import { HbcAvatarStack, HbcEmptyState } from '@hbc/ui-kit/homepage';
import {
  buildKudosRecipientSummary,
  type KudosEntry,
} from '../../homepage/webparts/kudosContracts.js';
import { KUDOS_GOV_TOKENS } from '../../homepage/shared/KudosGovernancePrimitives.js';

export interface PublicKudosSurfaceProps {
  heading: string;
  featured?: KudosEntry;
  recent: KudosEntry[];
  onGiveKudos: () => void;
  onCelebrate?: (kudosId: string) => void;
  celebrateLoading?: boolean;
  onOpenArticle: (entry: KudosEntry) => void;
}

const TROPHY_GLYPH = '🏆';

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
      data-hbc-webpart-section="hb-kudos-public-surface"
      aria-label={heading}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        ...surfaceVars,
      }}
    >
      {/* eslint-disable-next-line react/no-unknown-property */}
      <style>{`
        [data-hbc-webpart-section="hb-kudos-public-surface"] .pks-masthead {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 10px 4px 8px;
          border-bottom: 1px solid var(--pks-orange-18);
        }
        [data-hbc-webpart-section="hb-kudos-public-surface"] .pks-title {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 1.1875rem;
          font-weight: 800;
          letter-spacing: -0.01em;
          color: var(--pks-text-primary);
          margin: 0;
        }
        [data-hbc-webpart-section="hb-kudos-public-surface"] .pks-title-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: rgba(229, 126, 70, 0.12);
          color: var(--pks-brand-orange);
          font-size: 16px;
          line-height: 1;
        }
        [data-hbc-webpart-section="hb-kudos-public-surface"] .pks-give-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          border-radius: 9px;
          border: none;
          background: linear-gradient(135deg, #e57e46 0%, #d16a34 100%);
          color: #ffffff;
          font: inherit;
          font-size: 0.8125rem;
          font-weight: 700;
          letter-spacing: 0.01em;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(229, 126, 70, 0.25);
          transition: transform 120ms ease, box-shadow 160ms ease;
          outline: none;
        }
        [data-hbc-webpart-section="hb-kudos-public-surface"] .pks-give-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(229, 126, 70, 0.32);
        }
        [data-hbc-webpart-section="hb-kudos-public-surface"] .pks-give-btn:focus-visible {
          outline: 2px solid var(--pks-brand-blue);
          outline-offset: 2px;
        }
        [data-hbc-webpart-section="hb-kudos-public-surface"] .pks-featured {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 16px 18px 14px;
          border-radius: 14px;
          background: linear-gradient(135deg, #223d66 0%, #1a2f4f 100%);
          color: #ffffff;
          box-shadow: 0 8px 24px rgba(10, 27, 51, 0.18);
          border-left: 3px solid rgba(229, 126, 70, 0.85);
        }
        [data-hbc-webpart-section="hb-kudos-public-surface"] .pks-featured-badge {
          position: absolute;
          top: 10px;
          right: 12px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.625rem;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #ffffff;
          background: rgba(229, 126, 70, 0.34);
          padding: 3px 9px;
          border-radius: 999px;
          border: 1px solid rgba(229, 126, 70, 0.5);
        }
        [data-hbc-webpart-section="hb-kudos-public-surface"] .pks-featured-top {
          display: flex;
          align-items: center;
          gap: 12px;
          padding-right: 120px;
        }
        [data-hbc-webpart-section="hb-kudos-public-surface"] .pks-featured-recipient {
          font-size: 1.25rem;
          font-weight: 800;
          line-height: 1.2;
          letter-spacing: -0.01em;
          color: #ffffff;
          margin: 0;
        }
        [data-hbc-webpart-section="hb-kudos-public-surface"] .pks-featured-headline {
          font-size: 0.9375rem;
          font-weight: 600;
          line-height: 1.35;
          color: rgba(255, 255, 255, 0.86);
          margin: 0;
        }
        [data-hbc-webpart-section="hb-kudos-public-surface"] .pks-featured-excerpt {
          font-size: 0.875rem;
          line-height: 1.55;
          color: rgba(255, 255, 255, 0.86);
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 3;
          overflow: hidden;
          margin: 0;
        }
        [data-hbc-webpart-section="hb-kudos-public-surface"] .pks-readmore-btn {
          display: inline;
          padding: 0;
          border: none;
          background: none;
          font: inherit;
          font-weight: 700;
          color: #ffd7bf;
          text-decoration: underline;
          cursor: pointer;
          margin-left: 4px;
          outline: none;
        }
        [data-hbc-webpart-section="hb-kudos-public-surface"] .pks-readmore-btn:hover {
          color: #ffffff;
        }
        [data-hbc-webpart-section="hb-kudos-public-surface"] .pks-readmore-btn:focus-visible {
          outline: 2px solid #ffffff;
          outline-offset: 2px;
          border-radius: 3px;
        }
        [data-hbc-webpart-section="hb-kudos-public-surface"] .pks-featured-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding-top: 6px;
          border-top: 1px solid rgba(255, 255, 255, 0.14);
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.78);
        }
        [data-hbc-webpart-section="hb-kudos-public-surface"] .pks-celebrate-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 10px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.26);
          background: rgba(255, 255, 255, 0.12);
          color: #ffffff;
          font: inherit;
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          transition: transform 140ms cubic-bezier(0.22, 1, 0.36, 1), background 140ms ease;
          outline: none;
        }
        [data-hbc-webpart-section="hb-kudos-public-surface"] .pks-celebrate-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.22);
        }
        [data-hbc-webpart-section="hb-kudos-public-surface"] .pks-celebrate-btn:active:not(:disabled) {
          transform: scale(1.08);
        }
        [data-hbc-webpart-section="hb-kudos-public-surface"] .pks-celebrate-btn:focus-visible {
          outline: 2px solid #ffffff;
          outline-offset: 2px;
        }
        [data-hbc-webpart-section="hb-kudos-public-surface"] .pks-celebrate-btn:disabled {
          opacity: 0.6;
          cursor: progress;
        }
        [data-hbc-webpart-section="hb-kudos-public-surface"] .pks-celebrate-icon {
          display: inline-block;
          font-size: 13px;
          line-height: 1;
          transform-origin: center bottom;
          transition: transform 240ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        [data-hbc-webpart-section="hb-kudos-public-surface"] .pks-celebrate-btn:active .pks-celebrate-icon {
          transform: rotate(-16deg) scale(1.12);
        }
        [data-hbc-webpart-section="hb-kudos-public-surface"] .pks-recent-label {
          font-size: 0.625rem;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--pks-brand-orange);
          margin: 8px 0 0;
        }
        [data-hbc-webpart-section="hb-kudos-public-surface"] .pks-recent-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        [data-hbc-webpart-section="hb-kudos-public-surface"] .pks-recent-row {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 8px 12px;
          border-radius: 10px;
          border: 1px solid var(--pks-orange-06);
          background: rgba(229, 126, 70, 0.03);
          color: inherit;
          font: inherit;
          text-align: left;
          cursor: pointer;
          transition: background 160ms ease, border-color 160ms ease;
          outline: none;
        }
        [data-hbc-webpart-section="hb-kudos-public-surface"] .pks-recent-row:hover {
          background: rgba(229, 126, 70, 0.08);
          border-color: var(--pks-orange-18);
        }
        [data-hbc-webpart-section="hb-kudos-public-surface"] .pks-recent-row:focus-visible {
          outline: 2px solid var(--pks-brand-blue);
          outline-offset: 2px;
          background: rgba(229, 126, 70, 0.08);
          border-color: var(--pks-orange-18);
        }
        [data-hbc-webpart-section="hb-kudos-public-surface"] .pks-recent-body {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        [data-hbc-webpart-section="hb-kudos-public-surface"] .pks-recent-recipient {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--pks-text-primary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        [data-hbc-webpart-section="hb-kudos-public-surface"] .pks-recent-headline {
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--pks-text-secondary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        @media (prefers-reduced-motion: reduce) {
          [data-hbc-webpart-section="hb-kudos-public-surface"] .pks-give-btn,
          [data-hbc-webpart-section="hb-kudos-public-surface"] .pks-celebrate-btn,
          [data-hbc-webpart-section="hb-kudos-public-surface"] .pks-celebrate-icon,
          [data-hbc-webpart-section="hb-kudos-public-surface"] .pks-recent-row {
            transition: none !important;
          }
        }
      `}</style>

      {/* Masthead */}
      <div className="pks-masthead">
        <h2 className="pks-title" data-hbc-testid="hb-kudos-hero-band">
          <span className="pks-title-icon" aria-hidden="true">{TROPHY_GLYPH}</span>
          {heading}
        </h2>
        <button
          type="button"
          className="pks-give-btn"
          onClick={onGiveKudos}
          data-hbc-testid="hb-kudos-give-trigger"
        >
          <span aria-hidden="true">✦</span>
          Give Kudos
        </button>
      </div>

      {/* Featured */}
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

      {/* Recent */}
      {recent.length > 0 ? (
        <>
          <div className="pks-recent-label" data-hbc-testid="hb-kudos-recent-section">
            Recent recognition
          </div>
          <div className="pks-recent-list">
            {recent.map((item) => {
              const summary = buildKudosRecipientSummary(item.recipients);
              return (
                <button
                  key={item.id}
                  type="button"
                  className="pks-recent-row"
                  onClick={() => onOpenArticle(item)}
                  aria-label={`Open recognition for ${summary.label}`}
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
                  <div className="pks-recent-body">
                    <div className="pks-recent-recipient">{summary.label}</div>
                    <div className="pks-recent-headline">{item.headline || 'Recognition'}</div>
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
  const summary = buildKudosRecipientSummary(entry.recipients);
  const celebrateCount = entry.celebrateCount ?? 0;
  const hasExcerpt = Boolean(entry.excerpt && entry.excerpt.trim().length > 0);

  return (
    <article className="pks-featured" data-hbc-testid="hb-kudos-featured-card">
      <span className="pks-featured-badge" aria-label={badgeLabel}>
        <span aria-hidden="true">✦</span>
        {badgeLabel}
      </span>

      <div className="pks-featured-top">
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
          <h3 className="pks-featured-recipient">{summary.label}</h3>
          {entry.headline ? (
            <p className="pks-featured-headline">{entry.headline}</p>
          ) : null}
        </div>
      </div>

      {hasExcerpt ? (
        <p className="pks-featured-excerpt">
          {entry.excerpt}
          <button
            type="button"
            className="pks-readmore-btn"
            onClick={() => onOpenArticle(entry)}
            aria-label="Read full recognition"
          >
            … Read more
          </button>
        </p>
      ) : null}

      <div className="pks-featured-footer">
        <span>{formatSubmittedBy(entry)}</span>
        {onCelebrate ? (
          <button
            type="button"
            className="pks-celebrate-btn"
            onClick={() => onCelebrate(entry.id)}
            disabled={celebrateLoading}
            aria-label="Celebrate this recognition"
            data-hbc-testid="hb-kudos-celebrate"
          >
            <span className="pks-celebrate-icon" aria-hidden="true">👍</span>
            <span data-hbc-testid="hb-kudos-celebrate-count">{celebrateCount}</span>
          </button>
        ) : null}
      </div>
    </article>
  );
}
