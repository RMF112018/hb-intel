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
import { type KudosEntry } from '../../homepage/webparts/kudosContracts.js';
import { KUDOS_GOV_TOKENS } from '../../homepage/shared/KudosGovernancePrimitives.js';

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
        [data-hbc-webpart-section="hb-kudos-public-surface"] {
          /* Premium atmospheric background — recovered brand panel feel */
          position: relative;
          padding: 14px 16px 18px;
          border-radius: 18px;
          background:
            radial-gradient(circle at 8% -10%, rgba(229, 126, 70, 0.12) 0%, rgba(229, 126, 70, 0) 55%),
            radial-gradient(circle at 100% 0%, rgba(34, 83, 145, 0.10) 0%, rgba(34, 83, 145, 0) 60%),
            linear-gradient(180deg, #fffaf5 0%, #fdf4ec 100%);
          box-shadow:
            0 1px 3px rgba(229, 126, 70, 0.08),
            0 8px 22px rgba(34, 83, 145, 0.06);
        }
        [data-hbc-webpart-section="hb-kudos-public-surface"] .pks-masthead {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 14px;
          background:
            radial-gradient(circle at 100% 50%, rgba(229, 126, 70, 0.22) 0%, rgba(229, 126, 70, 0) 62%),
            linear-gradient(135deg, #274876 0%, #1b3258 60%, #162944 100%);
          color: #ffffff;
          overflow: hidden;
          box-shadow:
            0 1px 0 rgba(255, 255, 255, 0.06) inset,
            0 10px 28px rgba(10, 27, 51, 0.22),
            0 2px 6px rgba(10, 27, 51, 0.16);
        }
        [data-hbc-webpart-section="hb-kudos-public-surface"] .pks-masthead::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 12% 130%, rgba(255, 196, 140, 0.18) 0%, rgba(255, 196, 140, 0) 55%),
            radial-gradient(circle at 90% -40%, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0) 55%);
          pointer-events: none;
        }
        [data-hbc-webpart-section="hb-kudos-public-surface"] .pks-title {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 1.1875rem;
          font-weight: 800;
          letter-spacing: -0.01em;
          color: #ffffff;
          margin: 0;
          position: relative;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.24);
        }
        [data-hbc-webpart-section="hb-kudos-public-surface"] .pks-title-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          border-radius: 10px;
          background: linear-gradient(135deg, rgba(229, 126, 70, 0.9) 0%, rgba(209, 106, 52, 0.9) 100%);
          color: #ffffff;
          font-size: 16px;
          line-height: 1;
          box-shadow:
            0 1px 0 rgba(255, 255, 255, 0.3) inset,
            0 6px 14px rgba(229, 126, 70, 0.35);
          border: 1px solid rgba(255, 255, 255, 0.18);
        }
        [data-hbc-webpart-section="hb-kudos-public-surface"] .pks-give-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.22);
          background: linear-gradient(135deg, #e57e46 0%, #d16a34 100%);
          color: #ffffff;
          font: inherit;
          font-size: 0.8125rem;
          font-weight: 700;
          letter-spacing: 0.01em;
          cursor: pointer;
          box-shadow:
            0 1px 0 rgba(255, 255, 255, 0.3) inset,
            0 4px 10px rgba(229, 126, 70, 0.38),
            0 1px 2px rgba(0, 0, 0, 0.18);
          transition: transform 120ms ease, box-shadow 160ms ease, background 160ms ease;
          outline: none;
        }
        [data-hbc-webpart-section="hb-kudos-public-surface"] .pks-give-btn:hover {
          transform: translateY(-1px);
          background: linear-gradient(135deg, #ea8c56 0%, #d77139 100%);
          box-shadow:
            0 1px 0 rgba(255, 255, 255, 0.32) inset,
            0 6px 16px rgba(229, 126, 70, 0.48),
            0 2px 4px rgba(0, 0, 0, 0.22);
        }
        [data-hbc-webpart-section="hb-kudos-public-surface"] .pks-give-btn:focus-visible {
          outline: 2px solid #ffffff;
          outline-offset: 2px;
        }
        [data-hbc-webpart-section="hb-kudos-public-surface"] .pks-featured {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 18px 20px 16px;
          border-radius: 16px;
          background:
            radial-gradient(circle at 120% -20%, rgba(229, 126, 70, 0.26) 0%, rgba(229, 126, 70, 0) 55%),
            radial-gradient(circle at -10% 120%, rgba(34, 83, 145, 0.36) 0%, rgba(34, 83, 145, 0) 50%),
            linear-gradient(135deg, rgba(39, 72, 118, 0.82) 0%, rgba(27, 50, 88, 0.86) 55%, rgba(22, 41, 68, 0.86) 100%);
          color: #ffffff;
          backdrop-filter: blur(14px) saturate(120%);
          -webkit-backdrop-filter: blur(14px) saturate(120%);
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-left: 3px solid rgba(229, 126, 70, 0.9);
          box-shadow:
            0 1px 0 rgba(255, 255, 255, 0.08) inset,
            0 12px 32px rgba(10, 27, 51, 0.24),
            0 2px 6px rgba(10, 27, 51, 0.16);
          overflow: hidden;
        }
        [data-hbc-webpart-section="hb-kudos-public-surface"] .pks-featured::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 10% 0%, rgba(255, 255, 255, 0.10) 0%, rgba(255, 255, 255, 0) 45%);
          pointer-events: none;
        }
        @supports not (backdrop-filter: blur(14px)) {
          [data-hbc-webpart-section="hb-kudos-public-surface"] .pks-featured {
            background: linear-gradient(135deg, #274876 0%, #1b3258 55%, #162944 100%);
          }
        }
        [data-hbc-webpart-section="hb-kudos-public-surface"] .pks-featured-badge {
          position: absolute;
          top: 12px;
          right: 14px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.625rem;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #ffffff;
          background: linear-gradient(135deg, rgba(229, 126, 70, 0.55) 0%, rgba(209, 106, 52, 0.55) 100%);
          padding: 4px 10px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.28);
          box-shadow:
            0 1px 0 rgba(255, 255, 255, 0.24) inset,
            0 2px 6px rgba(0, 0, 0, 0.18);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
        }
        [data-hbc-webpart-section="hb-kudos-public-surface"] .pks-featured-top {
          position: relative;
          display: flex;
          align-items: center;
          gap: 14px;
          padding-right: 130px;
        }
        [data-hbc-webpart-section="hb-kudos-public-surface"] .pks-featured-recipient {
          font-size: 1.3125rem;
          font-weight: 800;
          line-height: 1.2;
          letter-spacing: -0.015em;
          color: #ffffff;
          margin: 0;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }
        [data-hbc-webpart-section="hb-kudos-public-surface"] .pks-featured-headline {
          font-size: 0.9375rem;
          font-weight: 600;
          line-height: 1.4;
          color: rgba(255, 255, 255, 0.82);
          margin: 0;
        }
        [data-hbc-webpart-section="hb-kudos-public-surface"] .pks-featured-body {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        [data-hbc-webpart-section="hb-kudos-public-surface"] .pks-featured-excerpt {
          font-size: 0.9375rem;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.9);
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 3;
          overflow: hidden;
          margin: 0;
          white-space: pre-wrap;
          word-break: break-word;
        }
        [data-hbc-webpart-section="hb-kudos-public-surface"] .pks-readmore-btn {
          align-self: flex-start;
          display: inline-flex;
          align-items: center;
          padding: 0;
          border: none;
          background: none;
          font: inherit;
          font-size: 0.8125rem;
          font-weight: 700;
          color: #ffd7bf;
          text-decoration: underline;
          text-decoration-color: rgba(255, 215, 191, 0.55);
          text-underline-offset: 2px;
          cursor: pointer;
          margin: 2px 0 0;
          outline: none;
          transition: color 140ms ease, text-decoration-color 140ms ease;
        }
        [data-hbc-webpart-section="hb-kudos-public-surface"] .pks-readmore-btn:hover {
          color: #ffffff;
          text-decoration-color: #ffffff;
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
          padding-top: 10px;
          margin-top: 2px;
          border-top: 1px solid rgba(255, 255, 255, 0.16);
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.78);
          letter-spacing: 0.01em;
        }
        [data-hbc-webpart-section="hb-kudos-public-surface"] .pks-celebrate-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.28);
          background: rgba(255, 255, 255, 0.14);
          color: #ffffff;
          font: inherit;
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          box-shadow: 0 1px 0 rgba(255, 255, 255, 0.18) inset;
          transition: transform 140ms cubic-bezier(0.22, 1, 0.36, 1), background 140ms ease, border-color 140ms ease;
          outline: none;
        }
        [data-hbc-webpart-section="hb-kudos-public-surface"] .pks-celebrate-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.24);
          border-color: rgba(255, 255, 255, 0.42);
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
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 0.625rem;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--pks-brand-orange);
          margin: 10px 2px 2px;
        }
        [data-hbc-webpart-section="hb-kudos-public-surface"] .pks-recent-label::after {
          content: '';
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, rgba(229, 126, 70, 0.32) 0%, rgba(229, 126, 70, 0) 100%);
        }
        [data-hbc-webpart-section="hb-kudos-public-surface"] .pks-recent-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        [data-hbc-webpart-section="hb-kudos-public-surface"] .pks-recent-row {
          position: relative;
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.6);
          background:
            linear-gradient(135deg, rgba(255, 255, 255, 0.72) 0%, rgba(255, 250, 244, 0.72) 100%);
          color: inherit;
          font: inherit;
          text-align: left;
          cursor: pointer;
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          box-shadow:
            0 1px 2px rgba(10, 27, 51, 0.04),
            0 1px 0 rgba(255, 255, 255, 0.5) inset;
          transition: background 160ms ease, border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease;
          outline: none;
        }
        [data-hbc-webpart-section="hb-kudos-public-surface"] .pks-recent-row:hover {
          background: linear-gradient(135deg, rgba(255, 250, 244, 0.95) 0%, rgba(255, 241, 228, 0.95) 100%);
          border-color: var(--pks-orange-22);
          transform: translateY(-1px);
          box-shadow:
            0 4px 12px rgba(229, 126, 70, 0.1),
            0 1px 0 rgba(255, 255, 255, 0.6) inset;
        }
        [data-hbc-webpart-section="hb-kudos-public-surface"] .pks-recent-row:focus-visible {
          outline: 2px solid var(--pks-brand-blue);
          outline-offset: 2px;
          border-color: var(--pks-orange-22);
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
              const recipientDisplay = formatRecipientDisplay(item.recipients);
              return (
                <button
                  key={item.id}
                  type="button"
                  className="pks-recent-row"
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
                  <div className="pks-recent-body">
                    <div className="pks-recent-recipient">{recipientDisplay}</div>
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
          <h3 className="pks-featured-recipient">{recipientDisplay}</h3>
          {entry.headline ? (
            <p className="pks-featured-headline">{entry.headline}</p>
          ) : null}
        </div>
      </div>

      {hasPreview ? (
        <div className="pks-featured-body">
          {/* Clamped container is markup-only text so the webkit-box
              clamp never hides the action affordance below. */}
          <div
            ref={excerptRef}
            className="pks-featured-excerpt"
            data-hbc-testid="hb-kudos-featured-excerpt"
          >
            {previewBody}
          </div>
          {showReadMore ? (
            <button
              type="button"
              className="pks-readmore-btn"
              onClick={() => onOpenArticle(entry)}
              aria-label="Read full recognition"
              data-hbc-testid="hb-kudos-featured-readmore"
            >
              … Read more
            </button>
          ) : null}
        </div>
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
