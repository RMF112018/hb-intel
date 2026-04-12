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
 * Extracted out of HbKudos.tsx in phase-17 and kept local because
 * the archive zone is webpart-specific composition, not reusable
 * visual UI.
 */
import * as React from 'react';
import { HbcAvatarStack, HbcEmptyState } from '@hbc/ui-kit/homepage';
import {
  buildKudosRecipientSummary,
  type KudosEntry,
} from '../../homepage/webparts/kudosContracts.js';
import { KUDOS_GOV_TOKENS } from '../../homepage/shared/KudosGovernancePrimitives.js';

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

  const archiveCssVars = {
    '--hbk-orange-02': KUDOS_GOV_TOKENS.orangeSubtle02,
    '--hbk-orange-06': KUDOS_GOV_TOKENS.orangeSubtle06,
    '--hbk-orange-18': KUDOS_GOV_TOKENS.orangeSubtle18,
    '--hbk-brand-blue': KUDOS_GOV_TOKENS.brandBlue,
    '--hbk-brand-orange': KUDOS_GOV_TOKENS.brandOrange,
  } as React.CSSProperties;

  const toggleLabel = expanded ? 'Archive' : 'View archive';

  return (
    <section
      id="hb-kudos-archive"
      aria-label="HB Kudos archive"
      data-hbc-webpart-section="hb-kudos-archive"
      data-hbc-testid="hb-kudos-archive-section"
      data-hbc-archive-expanded={expanded ? 'true' : 'false'}
      style={archiveCssVars}
    >
      {/* eslint-disable-next-line react/no-unknown-property */}
      <style>{`
        [data-hbc-webpart-section="hb-kudos-archive"] .hbk-archive-toggle {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 0;
          border: none;
          background: none;
          font: inherit;
          font-size: 0.6875rem;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--hbk-brand-orange);
          cursor: pointer;
          outline: none;
        }
        [data-hbc-webpart-section="hb-kudos-archive"] .hbk-archive-toggle:focus-visible {
          outline: 2px solid var(--hbk-brand-blue);
          outline-offset: 2px;
          border-radius: 4px;
        }
        [data-hbc-webpart-section="hb-kudos-archive"] .hbk-archive-chevron {
          display: inline-block;
          transition: transform 160ms ease;
        }
        [data-hbc-webpart-section="hb-kudos-archive"][data-hbc-archive-expanded="true"] .hbk-archive-chevron {
          transform: rotate(180deg);
        }
        [data-hbc-webpart-section="hb-kudos-archive"] .hbk-archive-search {
          padding: 6px 12px;
          font-size: 0.8125rem;
          border-radius: 8px;
          border: 1px solid var(--hbk-orange-18);
          background: var(--hbk-orange-02);
          flex: 1 1 auto;
          max-width: 320px;
          outline: none;
          font-family: inherit;
          color: ${KUDOS_GOV_TOKENS.textPrimary};
        }
        [data-hbc-webpart-section="hb-kudos-archive"] .hbk-archive-search:focus-visible {
          outline: 2px solid var(--hbk-brand-blue);
          outline-offset: 1px;
          border-color: var(--hbk-brand-orange);
        }
        [data-hbc-webpart-section="hb-kudos-archive"] .hbk-archive-row {
          display: flex; align-items: center; gap: 10px; width: 100%;
          text-align: left; background: var(--hbk-orange-02);
          border: 1px solid var(--hbk-orange-06); border-radius: 10px;
          padding: 8px 12px; cursor: pointer; color: inherit; font: inherit;
          transition: background 160ms ease, border-color 160ms ease;
          outline: none;
        }
        [data-hbc-webpart-section="hb-kudos-archive"] .hbk-archive-row:hover {
          background: var(--hbk-orange-06);
          border-color: var(--hbk-orange-18);
        }
        [data-hbc-webpart-section="hb-kudos-archive"] .hbk-archive-row:focus-visible {
          outline: 2px solid var(--hbk-brand-blue);
          outline-offset: 2px;
          background: var(--hbk-orange-06);
          border-color: var(--hbk-orange-18);
        }
        [data-hbc-webpart-section="hb-kudos-archive"] .hbk-archive-viewall {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 6px 0;
          border: none;
          background: none;
          font: inherit;
          font-size: 0.75rem;
          font-weight: 600;
          color: ${KUDOS_GOV_TOKENS.textSecondary};
          cursor: pointer;
          text-decoration: underline;
          outline: none;
          align-self: flex-end;
          margin-top: 4px;
        }
        [data-hbc-webpart-section="hb-kudos-archive"] .hbk-archive-viewall:hover {
          color: var(--hbk-brand-orange);
        }
        [data-hbc-webpart-section="hb-kudos-archive"] .hbk-archive-viewall:focus-visible {
          outline: 2px solid var(--hbk-brand-blue);
          outline-offset: 2px;
          border-radius: 3px;
        }
        @media (prefers-reduced-motion: reduce) {
          [data-hbc-webpart-section="hb-kudos-archive"] .hbk-archive-row,
          [data-hbc-webpart-section="hb-kudos-archive"] .hbk-archive-chevron {
            transition: none !important;
          }
        }
      `}</style>

      {/* Header row: toggle title + (when expanded) search */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 14,
          padding: '8px 0 6px',
        }}
      >
        <button
          type="button"
          className="hbk-archive-toggle"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-controls="hb-kudos-archive-body"
          data-hbc-testid="hb-kudos-archive-toggle"
        >
          {toggleLabel}
          <span className="hbk-archive-chevron" aria-hidden="true">▾</span>
        </button>
        {expanded ? (
          <input
            type="search"
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search recognition..."
            aria-label="Search recognition archive"
            data-hbc-testid="hb-kudos-archive-search"
            className="hbk-archive-search"
          />
        ) : null}
      </div>

      {/* Body — only rendered when expanded */}
      {expanded ? (
        <div id="hb-kudos-archive-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.length === 0 ? (
            <HbcEmptyState
              title="No archived recognition yet"
              description="Approved kudos that cycle off the homepage will appear here."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {filtered.map((entry) => {
                const summary = buildKudosRecipientSummary(entry.recipients);
                return (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => onOpenEntry(entry)}
                    aria-label={`Open recognition: ${entry.headline || summary.label}`}
                    className="hbk-archive-row"
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
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: 700,
                          lineHeight: 1.3,
                          color: KUDOS_GOV_TOKENS.textPrimary,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {summary.label}
                      </div>
                      <div
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 500,
                          color: KUDOS_GOV_TOKENS.textFaint,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
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
              className="hbk-archive-viewall"
              onClick={onViewAll}
              data-hbc-testid="hb-kudos-view-all"
            >
              View all recognition →
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
