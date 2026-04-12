/**
 * ArchiveList — collapsed-by-default archive zone for the public
 * HB Kudos webpart.
 *
 * Locked UX behavior (phase-17 decision set):
 *   - Collapsed by default.
 *   - The title text is the toggle button.
 *     * Collapsed label: "View archive"
 *     * Expanded label: "Archive"  + chevron indicator
 *   - Search field is only visible while expanded.
 *   - "View all recognition" control is rendered inside the expanded
 *     archive as a visually subordinate entry point (moved off the
 *     masthead).
 *   - Row click opens the article reader via `onOpenEntry`.
 *
 * Phase-18 Wave 1 styling rebuild: the archive-zone visual grammar now
 * lives in `kudosSurface.module.css`; token-backed CSS custom properties
 * are injected at the section root from KUDOS_GOV_TOKENS.
 */
import * as React from 'react';
import { HbcAvatarStack, HbcEmptyState } from '@hbc/ui-kit/homepage';
import { type KudosEntry } from '../../homepage/webparts/kudosContracts.js';
import { kudosCSSVars } from '../../homepage/shared/KudosGovernancePrimitives.js';
import { formatRecipientDisplay } from './PublicKudosSurface.js';
import { ChevronDown, ArrowRight } from './kudosIcons.js';
import styles from './kudosSurface.module.css';
import {
  kudosRow,
  kudosArchiveToggle,
  kudosArchiveChevron,
  kudosArchiveViewAll,
} from './kudosVariants.js';

export interface ArchiveListProps {
  entries: KudosEntry[];
  searchText: string;
  onSearchChange: (value: string) => void;
  onOpenEntry: (entry: KudosEntry) => void;
  /** Optional "View all recognition" handler rendered inside the expanded
   *  archive as a subordinate entry point for the feed flyout. */
  onViewAll?: () => void;
}

export function ArchiveList({
  entries,
  searchText,
  onSearchChange,
  onOpenEntry,
  onViewAll,
}: ArchiveListProps): React.JSX.Element {
  const [expanded, setExpanded] = React.useState<boolean>(false);

  const filtered = React.useMemo(() => {
    if (!expanded) return entries;
    const q = searchText.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter((entry) =>
      [entry.headline, entry.excerpt, ...entry.recipients.map((r) => r.name)]
        .join(' ')
        .toLowerCase()
        .includes(q),
    );
  }, [entries, searchText, expanded]);

  const toggleLabel = expanded ? 'Archive' : 'View archive';

  return (
    <section
      id="hb-kudos-archive"
      aria-label="HB Kudos archive"
      data-hbc-webpart-section="hb-kudos-archive"
      data-hbc-testid="hb-kudos-archive-section"
      data-hbc-archive-expanded={expanded ? 'true' : 'false'}
      style={kudosCSSVars()}
    >
      <div className={styles.archiveHeader}>
        <button
          type="button"
          className={kudosArchiveToggle()}
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-controls="hb-kudos-archive-body"
          data-hbc-testid="hb-kudos-archive-toggle"
        >
          {toggleLabel}
          <span className={kudosArchiveChevron()} aria-hidden="true">
            <ChevronDown size={14} strokeWidth={2.5} />
          </span>
        </button>
        {expanded ? (
          <input
            type="search"
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search recognition..."
            aria-label="Search recognition archive"
            data-hbc-testid="hb-kudos-archive-search"
            className={styles.archiveSearch}
          />
        ) : null}
      </div>

      {expanded ? (
        <div id="hb-kudos-archive-body" className={styles.archiveBody}>
          {filtered.length === 0 ? (
            <HbcEmptyState
              title="No archived recognition yet"
              description="Approved kudos that cycle off the homepage will appear here."
            />
          ) : (
            <div className={styles.archiveRows}>
              {filtered.map((entry) => {
                const recipientDisplay = formatRecipientDisplay(entry.recipients);
                return (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => onOpenEntry(entry)}
                    aria-label={`Open recognition: ${entry.headline || recipientDisplay}`}
                    className={kudosRow({ variant: 'archive' })}
                    data-hbc-testid="hb-kudos-archive-row"
                  >
                    {entry.recipients.length > 0 ? (
                      <HbcAvatarStack
                        people={entry.recipients.slice(0, 1).map((r) => ({
                          id: r.id,
                          name: r.name,
                          src: r.media?.src,
                        }))}
                        size="sm"
                      />
                    ) : null}
                    <div className={styles.archiveRowBody}>
                      <div className={styles.archiveRowRecipient}>{recipientDisplay}</div>
                      <div className={styles.archiveRowMeta}>
                        {entry.headline || 'Recognition'}
                        {' · '}
                        {new Date(entry.submittedDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {onViewAll ? (
            <button
              type="button"
              className={kudosArchiveViewAll()}
              onClick={onViewAll}
              data-hbc-testid="hb-kudos-view-all"
            >
              View all recognition
              <ArrowRight size={12} strokeWidth={2.5} aria-hidden="true" />
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
