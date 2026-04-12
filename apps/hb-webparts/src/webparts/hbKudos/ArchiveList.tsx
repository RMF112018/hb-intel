/**
 * ArchiveList — local composition of shared primitives for the
 * HB Kudos public webpart's archive browse zone.
 *
 * Extracted from `HbKudos.tsx` in phase-17 as part of the public-surface
 * file-boundary split (Matrix row 14). This module owns only the archive
 * section; data orchestration and the overall surface root remain in
 * `HbKudos.tsx`. No behavior changes — styling and markup are preserved
 * verbatim from the prior inline implementation.
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
  onOpenDetail: (entry: KudosEntry) => void;
}

export function ArchiveList({
  entries,
  searchText,
  onSearchChange,
  onOpenDetail,
}: ArchiveListProps): React.JSX.Element {
  const filtered = React.useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter((entry) =>
      [entry.headline, entry.excerpt, ...entry.recipients.map((r) => r.name)]
        .join(' ')
        .toLowerCase()
        .includes(q),
    );
  }, [entries, searchText]);

  const archiveCssVars = {
    '--hbk-orange-02': KUDOS_GOV_TOKENS.orangeSubtle02,
    '--hbk-orange-06': KUDOS_GOV_TOKENS.orangeSubtle06,
    '--hbk-orange-18': KUDOS_GOV_TOKENS.orangeSubtle18,
    '--hbk-brand-blue': KUDOS_GOV_TOKENS.brandBlue,
    '--hbk-brand-orange': KUDOS_GOV_TOKENS.brandOrange,
  } as React.CSSProperties;

  return (
    <section
      id="hb-kudos-archive"
      aria-label="HB Kudos archive"
      data-hbc-webpart-section="hb-kudos-archive"
      data-hbc-testid="hb-kudos-archive-section"
      style={archiveCssVars}
    >
      {/* eslint-disable-next-line react/no-unknown-property */}
      <style>{`
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
        [data-hbc-webpart-section="hb-kudos-archive"] .hbk-archive-search:focus-visible {
          outline: 2px solid var(--hbk-brand-blue);
          outline-offset: 1px;
          border-color: var(--hbk-brand-orange);
        }
        @media (prefers-reduced-motion: reduce) {
          [data-hbc-webpart-section="hb-kudos-archive"] .hbk-archive-row {
            transition: none !important;
          }
        }
      `}</style>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 14,
          padding: '12px 0 10px',
        }}
      >
        <span
          style={{
            fontSize: '0.6875rem',
            fontWeight: 800,
            letterSpacing: '0.14em',
            textTransform: 'uppercase' as const,
            color: KUDOS_GOV_TOKENS.warningOrange,
            flexShrink: 0,
          }}
        >
          Archive
        </span>
        <input
          type="search"
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search recognition..."
          aria-label="Search recognition archive"
          data-hbc-testid="hb-kudos-archive-search"
          className="hbk-archive-search"
          style={{
            padding: '6px 12px',
            fontSize: '0.8125rem',
            borderRadius: 8,
            border: `1px solid ${KUDOS_GOV_TOKENS.orangeSubtle22}`,
            background: KUDOS_GOV_TOKENS.orangeSubtle03,
            flex: '1 1 auto',
            maxWidth: 320,
            outline: 'none',
            fontFamily: 'inherit',
            color: KUDOS_GOV_TOKENS.textPrimary,
          }}
        />
      </div>

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
                onClick={() => onOpenDetail(entry)}
                aria-label={`Open recognition: ${entry.headline}`}
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
                    {entry.headline}
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
                    {summary.label}
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
    </section>
  );
}
