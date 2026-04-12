/**
 * KudosFeedBody — slide-out browse panel content for the HB Kudos
 * public webpart. Renders when the user opens "View All".
 *
 * Extracted from `HbKudos.tsx` in phase-17 as part of the public-surface
 * file-boundary split (Matrix row 14). No behavior changes — styling and
 * markup preserved verbatim from the prior inline implementation.
 */
import * as React from 'react';
import { HbcAvatarStack, HbcEmptyState } from '@hbc/ui-kit/homepage';
import {
  buildKudosRecipientSummary,
  type KudosEntry,
} from '../../homepage/webparts/kudosContracts.js';
import { KUDOS_GOV_TOKENS } from '../../homepage/shared/KudosGovernancePrimitives.js';

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search recognition..."
        aria-label="Search recognition feed"
        style={{
          padding: '6px 12px',
          fontSize: '0.8125rem',
          borderRadius: 10,
          border: `1.5px solid ${KUDOS_GOV_TOKENS.orangeSubtle22}`,
          background: KUDOS_GOV_TOKENS.orangeSubtle03,
          outline: 'none',
          fontFamily: 'inherit',
          color: KUDOS_GOV_TOKENS.textPrimary,
          width: '100%',
          boxSizing: 'border-box' as const,
        }}
      />

      {filtered.length === 0 ? (
        <HbcEmptyState
          title="No recognition found"
          description={search ? 'Try a different search term.' : 'Recognition will appear here once approved.'}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((entry) => {
            const summary = buildKudosRecipientSummary(entry.recipients);
            const recipientLabel =
              entry.recipients.length === 1
                ? entry.recipients[0]!.name
                : entry.recipients.length === 2
                  ? `${entry.recipients[0]!.name} and ${entry.recipients[1]!.name}`
                  : entry.recipients.length > 2
                    ? `${entry.recipients[0]!.name}, ${entry.recipients[1]!.name}, and ${entry.recipients.length - 2} more`
                    : '';

            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => onOpenDetail(entry)}
                aria-label={`Open recognition: ${entry.headline}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0,
                  width: '100%',
                  textAlign: 'left',
                  background: '#ffffff',
                  border: `1px solid ${KUDOS_GOV_TOKENS.orangeSubtle06}`,
                  borderLeft: `3px solid rgba(229, 126, 70, 0.55)`,
                  borderRadius: 14,
                  padding: '12px 16px 10px',
                  cursor: 'pointer',
                  color: 'inherit',
                  font: 'inherit',
                  outline: 'none',
                  transition: 'background 160ms ease, border-color 160ms ease, box-shadow 160ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 250, 246, 0.8)';
                  e.currentTarget.style.borderColor = KUDOS_GOV_TOKENS.orangeSubtle18;
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(229, 126, 70, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.borderColor = KUDOS_GOV_TOKENS.orangeSubtle06;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {entry.recipients.length > 0 ? (
                  <div style={{ marginBottom: 6 }}>
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

                <div
                  style={{
                    fontSize: '1rem',
                    fontWeight: 800,
                    lineHeight: 1.25,
                    letterSpacing: '-0.01em',
                    color: KUDOS_GOV_TOKENS.textPrimary,
                    marginBottom: 2,
                  }}
                >
                  {entry.headline}
                </div>

                {recipientLabel ? (
                  <div
                    style={{
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      color: KUDOS_GOV_TOKENS.brandOrange,
                      marginBottom: 4,
                    }}
                  >
                    {recipientLabel}
                  </div>
                ) : null}

                {entry.excerpt ? (
                  <div
                    style={{
                      fontSize: '0.875rem',
                      lineHeight: 1.6,
                      color: 'rgba(26, 19, 16, 0.68)',
                      marginBottom: 6,
                    }}
                  >
                    {entry.excerpt}
                  </div>
                ) : null}

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    flexWrap: 'wrap',
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    color: KUDOS_GOV_TOKENS.textFaint,
                    paddingTop: 6,
                    borderTop: `1px solid ${KUDOS_GOV_TOKENS.orangeSubtle06}`,
                  }}
                >
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
                  {summary.total > 0 && entry.recipients.length > 1 ? (
                    <span>{summary.label}</span>
                  ) : null}
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
                        fontWeight: 800,
                      }}
                    >
                      ✦ {entry.celebrateCount}
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
