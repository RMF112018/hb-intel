/**
 * ArchiveList — archive + terminal feed entry zone for the public
 * HB Kudos webpart.
 *
 * Phase-27 Prompt-03 hierarchy redesign:
 *
 *   Section header (shared stream grammar):
 *     - Eyebrow "Archive" + h3 "Past recognition"
 *     - Right-aligned entry count + expand/collapse pill toggle
 *
 *   Archive body (renders when expanded):
 *     - Full-width search input (no longer inline with the toggle)
 *     - Rows with right-aligned date spine for scanability
 *
 *   Terminal feed CTA:
 *     - Always visible (independent of archive expanded/collapsed)
 *     - Proper product-surface card (eyebrow + title + meta + arrow)
 *       instead of a subtle text link hidden inside the expanded
 *       archive
 *
 *   Preserved behaviors:
 *     - Collapsed by default
 *     - Row click opens the article reader via `onOpenEntry`
 *     - Search text is still lifted to the parent via `onSearchChange`
 *
 * Styling: all classes resolve through `kudosSurface.module.css` +
 * `kudosVariants.ts`; every color flows through `kudosCSSVars()` on
 * the webpart root (Phase-27 Prompt-02 closure).
 */
import * as React from 'react';
import { HbcAvatarStack, HbcEmptyState } from '@hbc/ui-kit/homepage';
import { type KudosEntry } from '../../homepage/webparts/kudosContracts.js';
import { formatRecipientDisplay } from './PublicKudosSurface.js';
import { ChevronDown, ArrowRight } from './kudosIcons.js';
import styles from './kudosSurface.module.css';
import {
  kudosRow,
  kudosArchiveToggle,
  kudosArchiveChevron,
} from './kudosVariants.js';

function formatArchiveDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

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

  const toggleLabel = expanded ? 'Collapse archive' : 'Open archive';

  return (
    <section
      id="hb-kudos-archive"
      aria-labelledby="hb-kudos-archive-title"
      data-hbc-webpart-section="hb-kudos-archive"
      data-hbc-testid="hb-kudos-archive-section"
      data-hbc-archive-expanded={expanded ? 'true' : 'false'}
    >
      <div className={styles.sectionHeader}>
        <div className={styles.sectionHeaderTop}>
          <span className={styles.sectionEyebrow}>Archive</span>
          <span className={styles.sectionMeta} data-hbc-testid="hb-kudos-archive-count">
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>
        <div className={styles.archiveTitleRow}>
          <h3 id="hb-kudos-archive-title" className={styles.sectionTitle}>
            Past recognition
          </h3>
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
              <ChevronDown size={13} strokeWidth={2.5} />
            </span>
          </button>
        </div>
      </div>

      {expanded ? (
        <div id="hb-kudos-archive-body" className={styles.archiveBody}>
          <input
            type="search"
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search past recognition…"
            aria-label="Search recognition archive"
            data-hbc-testid="hb-kudos-archive-search"
            className={styles.archiveSearch}
          />

          {filtered.length === 0 ? (
            <HbcEmptyState
              title="No archived recognition yet"
              description="Approved kudos that cycle off the homepage will appear here."
            />
          ) : (
            <div className={styles.archiveRows}>
              {filtered.map((entry) => {
                const recipientDisplay = formatRecipientDisplay(entry.recipients);
                const shortDate = formatArchiveDate(entry.submittedDate);
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
                      </div>
                    </div>
                    {shortDate ? (
                      <time
                        className={styles.rowDate}
                        dateTime={entry.submittedDate}
                        aria-label={`Submitted ${shortDate}`}
                      >
                        {shortDate}
                      </time>
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : null}

      {onViewAll ? (
        <button
          type="button"
          className={styles.feedCta}
          onClick={onViewAll}
          data-hbc-testid="hb-kudos-view-all"
          aria-label="Browse the full Kudos feed"
        >
          <span className={styles.feedCtaBody}>
            <span className={styles.feedCtaEyebrow}>Browse all</span>
            <span className={styles.feedCtaTitle}>The full Kudos feed</span>
            <span className={styles.feedCtaMeta}>
              Search and explore every approved recognition across HB.
            </span>
          </span>
          <span className={styles.feedCtaArrow} aria-hidden="true">
            <ArrowRight size={14} strokeWidth={2.5} />
          </span>
        </button>
      ) : null}
    </section>
  );
}
