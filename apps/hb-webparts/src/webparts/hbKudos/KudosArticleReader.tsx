/**
 * KudosArticleReader — stripped article-style reader panel.
 *
 * Opens from:
 *   - the featured-card inline "Read more" button
 *   - any recent-recognition row click
 *   - (indirectly) the archive row detail path
 *
 * Renders recognition content only (recipient, submitter, date, full
 * headline, full body, celebrate count). Viewer-role safe: never
 * renders audit timeline, governance metadata, or admin-only fields.
 *
 * Reuses HbcKudosComposerFlyout as the slide-in panel shell so the
 * chrome is consistent with the composer and View All panels.
 *
 * Phase-19 Wave 2: layout grammar moved to `kudosReader.module.css`;
 * token values flow through `--hbk-reader-*` CSS custom properties
 * seeded from KUDOS_GOV_TOKENS.
 */
import * as React from 'react';
import { HbcKudosComposerFlyout, HbcAvatarStack } from '@hbc/ui-kit/homepage';
import { type KudosEntry } from '../../homepage/webparts/kudosContracts.js';
import { KUDOS_GOV_TOKENS } from '../../homepage/shared/KudosGovernancePrimitives.js';
import { formatRecipientDisplay } from './PublicKudosSurface.js';
import { ThumbsUp } from './kudosIcons.js';
import readerStyles from './kudosReader.module.css';

export interface KudosArticleReaderProps {
  entry: KudosEntry | undefined;
  onClose: () => void;
}

function formatLongDate(iso?: string): string {
  if (!iso) return '';
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return '';
  return new Date(ms).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function KudosArticleReader({
  entry,
  onClose,
}: KudosArticleReaderProps): React.JSX.Element {
  const open = Boolean(entry);
  const recipientDisplay = entry ? formatRecipientDisplay(entry.recipients) : '';
  const submittedLine =
    entry?.submittedBy?.displayName
      ? `Submitted by ${entry.submittedBy.displayName}`
      : 'Submitted';
  const body = entry?.details?.trim() || entry?.excerpt?.trim() || '';

  const readerVars = {
    '--hbk-reader-border': KUDOS_GOV_TOKENS.orangeSubtle18,
    '--hbk-reader-ink-primary': KUDOS_GOV_TOKENS.textPrimary,
    '--hbk-reader-ink-secondary': KUDOS_GOV_TOKENS.textSecondary,
    '--hbk-reader-ink-faint': KUDOS_GOV_TOKENS.textFaint,
    '--hbk-reader-brand-orange': KUDOS_GOV_TOKENS.brandOrange,
    '--hbk-reader-celebrate-surface': 'rgba(229, 126, 70, 0.08)',
  } as React.CSSProperties;

  return (
    <HbcKudosComposerFlyout
      open={open}
      onClose={onClose}
      title={recipientDisplay || 'Recognition'}
      subtitle={entry?.headline || undefined}
      primaryAction={{ label: 'Close', onClick: onClose }}
    >
      {entry ? (
        <article
          data-hbc-testid="hb-kudos-article-reader"
          className={readerStyles.article}
          style={readerVars}
        >
          <header className={readerStyles.header}>
            {entry.recipients.length > 0 ? (
              <HbcAvatarStack
                people={entry.recipients.slice(0, 4).map((r) => ({
                  id: r.id,
                  name: r.name,
                  src: r.media?.src,
                }))}
                size="lg"
                max={4}
              />
            ) : null}
            <div className={readerStyles.headerBody}>
              <div className={readerStyles.recipient}>{recipientDisplay}</div>
              {entry.headline ? (
                <div className={readerStyles.headline}>{entry.headline}</div>
              ) : null}
            </div>
          </header>

          {body ? <div className={readerStyles.body}>{body}</div> : null}

          <footer className={readerStyles.footer}>
            <span>
              {submittedLine}
              {entry.submittedDate ? ` · ${formatLongDate(entry.submittedDate)}` : ''}
            </span>
            {typeof entry.celebrateCount === 'number' && entry.celebrateCount > 0 ? (
              <span className={readerStyles.celebratePill}>
                <ThumbsUp size={12} strokeWidth={2.5} aria-hidden="true" />
                {entry.celebrateCount}
              </span>
            ) : null}
          </footer>
        </article>
      ) : null}
    </HbcKudosComposerFlyout>
  );
}
