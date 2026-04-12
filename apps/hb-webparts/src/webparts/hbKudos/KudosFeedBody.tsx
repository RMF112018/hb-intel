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
import { kudosCSSVars } from '../../homepage/shared/KudosGovernancePrimitives.js';
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

  return (
    <div
      data-hbc-webpart-section="hb-kudos-feed"
      className={feedStyles.feedRoot}
      style={kudosCSSVars()}
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
