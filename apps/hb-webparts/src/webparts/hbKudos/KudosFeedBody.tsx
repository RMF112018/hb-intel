/**
 * KudosFeedBody — slide-out browse panel content for the HB Kudos
 * public webpart. Renders when the user opens "View All".
 *
 * Phase-23 Prompt 03 inline/injected style elimination:
 * the prior runtime-injected `<style>` block and every inline style
 * object have moved into `kudosFeed.module.css` + cva variants
 * (`kudosFeedRow`, `kudosFeedCelebratePill`). Only the
 * `--hbk-*` token-var bridge remains as inline `style={{…}}` — the
 * approved seam for binding `KUDOS_GOV_TOKENS` into CSS-module
 * selectors without hardcoding values in the module.
 */
import * as React from 'react';
import { HbcAvatarStack, HbcEmptyState } from '@hbc/ui-kit/homepage';
import { type KudosEntry } from '../../homepage/webparts/kudosContracts.js';
import { KUDOS_GOV_TOKENS } from '../../homepage/shared/KudosGovernancePrimitives.js';
import { formatRecipientDisplay } from './PublicKudosSurface.js';
import { ThumbsUp } from './kudosIcons.js';
import feedStyles from './kudosFeed.module.css';
import { kudosFeedCelebratePill, kudosFeedRow } from './kudosVariants.js';

export interface KudosFeedBodyProps {
  entries: KudosEntry[];
  onOpenDetail: (entry: KudosEntry) => void;
}

export function KudosFeedBody({ entries, onOpenDetail }: KudosFeedBodyProps): React.JSX.Element {
  const [search, setSearch] = React.useState('');

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter((entry) =>
      [entry.headline, entry.excerpt, ...entry.recipients.map((r) => r.name)]
        .join(' ')
        .toLowerCase()
        .includes(q),
    );
  }, [entries, search]);

  // Token-var bridge — governed KUDOS_GOV_TOKENS values flow into the
  // CSS module via `--hbk-*` custom properties. This inline style
  // record is the approved doctrine seam for token governance.
  const feedCssVars = {
    '--hbk-orange-03': KUDOS_GOV_TOKENS.orangeSubtle03,
    '--hbk-orange-06': KUDOS_GOV_TOKENS.orangeSubtle06,
    '--hbk-orange-08': KUDOS_GOV_TOKENS.orangeSubtle10,
    '--hbk-orange-18': KUDOS_GOV_TOKENS.orangeSubtle18,
    '--hbk-orange-22': KUDOS_GOV_TOKENS.orangeSubtle22,
    '--hbk-orange-55': 'rgba(229, 126, 70, 0.55)',
    '--hbk-orange-shadow': 'rgba(229, 126, 70, 0.08)',
    '--hbk-surface-0': '#ffffff',
    '--hbk-surface-warm': 'rgba(255, 250, 246, 0.8)',
    '--hbk-brand-blue': KUDOS_GOV_TOKENS.brandBlue,
    '--hbk-brand-orange': KUDOS_GOV_TOKENS.brandOrange,
    '--hbk-text-primary': KUDOS_GOV_TOKENS.textPrimary,
    '--hbk-text-secondary': 'rgba(26, 19, 16, 0.68)',
    '--hbk-text-faint': KUDOS_GOV_TOKENS.textFaint,
  } as React.CSSProperties;

  return (
    <div
      data-hbc-webpart-section="hb-kudos-feed"
      className={feedStyles.feedRoot}
      style={feedCssVars}
    >
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search recognition..."
        aria-label="Search recognition feed"
        className={feedStyles.feedSearch}
      />

      {filtered.length === 0 ? (
        <HbcEmptyState
          title="No recognition found"
          description={search ? 'Try a different search term.' : 'Recognition will appear here once approved.'}
        />
      ) : (
        <div className={feedStyles.feedList}>
          {filtered.map((entry) => {
            const recipientLabel = formatRecipientDisplay(entry.recipients);

            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => onOpenDetail(entry)}
                aria-label={`Open recognition: ${entry.headline}`}
                data-hbc-testid="hb-kudos-public-feed-item"
                className={kudosFeedRow()}
              >
                {entry.recipients.length > 0 ? (
                  <div className={feedStyles.feedRowAvatars}>
                    <HbcAvatarStack
                      people={entry.recipients.slice(0, 4).map((r) => ({
                        id: r.id,
                        name: r.name,
                        src: r.media?.src,
                      }))}
                      size="md"
                      max={4}
                    />
                  </div>
                ) : null}

                <div className={feedStyles.feedRowHeadline}>{entry.headline}</div>

                {recipientLabel ? (
                  <div className={feedStyles.feedRowRecipient}>{recipientLabel}</div>
                ) : null}

                {entry.excerpt ? (
                  <div className={feedStyles.feedRowExcerpt}>{entry.excerpt}</div>
                ) : null}

                <div className={feedStyles.feedRowMeta}>
                  {entry.submittedBy?.displayName ? (
                    <span>By {entry.submittedBy.displayName}</span>
                  ) : null}
                  <span>
                    {new Date(entry.submittedDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  {entry.recipients.length > 1 ? <span>{recipientLabel}</span> : null}
                  {typeof entry.celebrateCount === 'number' && entry.celebrateCount > 0 ? (
                    <span className={kudosFeedCelebratePill()}>
                      <ThumbsUp size={12} strokeWidth={2.5} aria-hidden="true" />
                      {entry.celebrateCount}
                    </span>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
