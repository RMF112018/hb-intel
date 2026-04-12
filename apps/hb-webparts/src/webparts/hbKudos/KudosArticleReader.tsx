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
 */
import * as React from 'react';
import { HbcKudosComposerFlyout, HbcAvatarStack } from '@hbc/ui-kit/homepage';
import {
  buildKudosRecipientSummary,
  type KudosEntry,
} from '../../homepage/webparts/kudosContracts.js';
import { KUDOS_GOV_TOKENS } from '../../homepage/shared/KudosGovernancePrimitives.js';

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
  const summary = entry ? buildKudosRecipientSummary(entry.recipients) : null;
  const submittedLine =
    entry?.submittedBy?.displayName
      ? `Submitted by ${entry.submittedBy.displayName}`
      : 'Submitted';
  const body = entry?.details?.trim() || entry?.excerpt?.trim() || '';

  return (
    <HbcKudosComposerFlyout
      open={open}
      onClose={onClose}
      title={summary?.label || 'Recognition'}
      subtitle={entry?.headline || undefined}
      primaryAction={{ label: 'Close', onClick: onClose }}
    >
      {entry ? (
        <article
          data-hbc-testid="hb-kudos-article-reader"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            padding: '4px 2px 8px',
          }}
        >
          {/* Recipient block */}
          <header
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '4px 4px 16px',
              borderBottom: `1px solid ${KUDOS_GOV_TOKENS.orangeSubtle18}`,
            }}
          >
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
              <div
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  lineHeight: 1.2,
                  letterSpacing: '-0.01em',
                  color: KUDOS_GOV_TOKENS.textPrimary,
                }}
              >
                {summary?.label}
              </div>
              {entry.headline ? (
                <div
                  style={{
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    color: KUDOS_GOV_TOKENS.textSecondary,
                  }}
                >
                  {entry.headline}
                </div>
              ) : null}
            </div>
          </header>

          {/* Body */}
          {body ? (
            <div
              style={{
                fontSize: '0.9375rem',
                lineHeight: 1.7,
                color: KUDOS_GOV_TOKENS.textPrimary,
                whiteSpace: 'pre-wrap',
                padding: '0 4px',
                maxWidth: '64ch',
              }}
            >
              {body}
            </div>
          ) : null}

          {/* Meta footer */}
          <footer
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              paddingTop: 12,
              borderTop: `1px solid ${KUDOS_GOV_TOKENS.orangeSubtle18}`,
              fontSize: '0.75rem',
              color: KUDOS_GOV_TOKENS.textFaint,
            }}
          >
            <span>
              {submittedLine}
              {entry.submittedDate ? ` · ${formatLongDate(entry.submittedDate)}` : ''}
            </span>
            {typeof entry.celebrateCount === 'number' && entry.celebrateCount > 0 ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '2px 8px',
                  borderRadius: 999,
                  background: 'rgba(229, 126, 70, 0.08)',
                  border: `1px solid ${KUDOS_GOV_TOKENS.orangeSubtle18}`,
                  color: KUDOS_GOV_TOKENS.brandOrange,
                  fontWeight: 700,
                }}
              >
                👍 {entry.celebrateCount}
              </span>
            ) : null}
          </footer>
        </article>
      ) : null}
    </HbcKudosComposerFlyout>
  );
}
