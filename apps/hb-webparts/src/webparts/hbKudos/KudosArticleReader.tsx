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
 * Phase-20 Wave 3 harmonization: wrapped in the shared `KudosFlyoutBody`
 * so article reader, composer, and feed flyouts share one rhythm. The
 * reader's recipient display is now an `<h2>` linked to the `<article>`
 * via `aria-labelledby`, giving assistive tech a clear landmark for
 * the recognition content.
 */
import * as React from 'react';
import { HbcKudosComposerFlyout, HbcAvatarStack } from '@hbc/ui-kit/homepage';
import { type KudosEntry } from '../../homepage/webparts/kudosContracts.js';
import { formatRecipientDisplay } from './PublicKudosSurface.js';
import { ThumbsUp } from './kudosIcons.js';
import readerStyles from './kudosReader.module.css';
import { KudosFlyoutBody } from './KudosFlyoutBody.js';

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

  const headingId = 'hb-kudos-article-recipient';

  return (
    <HbcKudosComposerFlyout
      open={open}
      onClose={onClose}
      title={recipientDisplay || 'Recognition'}
      subtitle={entry?.headline || undefined}
      primaryAction={{ label: 'Close', onClick: onClose }}
    >
      {entry ? (
        <KudosFlyoutBody
          as="article"
          testId="hb-kudos-article-reader"
          ariaLabelledBy={headingId}
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
              <h2 id={headingId} className={readerStyles.recipient}>
                {recipientDisplay}
              </h2>
              {entry.headline ? (
                <p className={readerStyles.headline}>{entry.headline}</p>
              ) : null}
            </div>
          </header>

          {body ? (
            <div className={readerStyles.body} data-hbc-testid="hb-kudos-article-body">
              {body}
            </div>
          ) : null}

          <footer className={readerStyles.footer}>
            <span>
              {submittedLine}
              {entry.submittedDate ? ` · ${formatLongDate(entry.submittedDate)}` : ''}
            </span>
            {typeof entry.celebrateCount === 'number' && entry.celebrateCount > 0 ? (
              <span
                className={readerStyles.celebratePill}
                aria-label={`Celebrated ${entry.celebrateCount} ${entry.celebrateCount === 1 ? 'time' : 'times'}`}
              >
                <ThumbsUp size={12} strokeWidth={2.5} aria-hidden="true" />
                {entry.celebrateCount}
              </span>
            ) : null}
          </footer>
        </KudosFlyoutBody>
      ) : null}
    </HbcKudosComposerFlyout>
  );
}
