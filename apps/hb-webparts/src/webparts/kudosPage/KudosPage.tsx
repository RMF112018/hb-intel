/**
 * KudosPage — Employee-facing dedicated Kudos destination
 * Phase 6: Archive browsing, browse-by filters, Celebrate reactions,
 *          long-form submission entry, full Kudos detail cards.
 *
 * This component renders a full-page Kudos archive that the homepage
 * "View All Kudos" CTA links into. It shows all approved Kudos
 * (no 14-day age-off) with browse-by filters and Celebrate affordance.
 */
import * as React from 'react';
import {
  HbcHomepageSectionShell,
  HbcPremiumCta,
  CheckCircle2,
  Separator,
} from '@hbc/ui-kit/homepage';
import {
  HP_SPACE,
  HP_RADIUS,
  HP_BORDER,
  HP_TEXT_OPACITY,
} from '../../homepage/tokens.js';
import type { KudosEntry, KudosRecipientType } from '../../homepage/webparts/communicationsContracts.js';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface KudosPageProps {
  kudos?: KudosEntry[];
  isLoading?: boolean;
}

// ---------------------------------------------------------------------------
// Filter types
// ---------------------------------------------------------------------------

type KudosFilter = 'all' | KudosRecipientType;

const FILTER_LABELS: Record<KudosFilter, string> = {
  all: 'All',
  individual: 'Individual',
  team: 'Team',
  department: 'Department',
  projectGroup: 'Project Group',
};

const FILTER_OPTIONS: KudosFilter[] = ['all', 'individual', 'team', 'department', 'projectGroup'];

// ---------------------------------------------------------------------------
// Shared utilities
// ---------------------------------------------------------------------------

function formatRecipients(recipients: KudosEntry['recipients']): string {
  if (recipients.length === 0) return '';
  if (recipients.length === 1) return recipients[0].name;
  if (recipients.length === 2) return `${recipients[0].name} and ${recipients[1].name}`;
  return `${recipients[0].name}, ${recipients[1].name}, and ${recipients.length - 2} more`;
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const pageHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: HP_SPACE.md,
  flexWrap: 'wrap',
};

const filterRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: HP_SPACE.sm,
  flexWrap: 'wrap',
  marginTop: HP_SPACE.xl,
};

const filterButtonBaseStyle: React.CSSProperties = {
  padding: `${HP_SPACE.sm}px ${HP_SPACE.xl}px`,
  borderRadius: HP_RADIUS.command,
  fontSize: '0.8125rem',
  fontWeight: 500,
  cursor: 'pointer',
  lineHeight: 1,
  transition: 'background 150ms ease, border-color 150ms ease',
};

const archiveGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
  gap: HP_SPACE.xl,
  marginTop: HP_SPACE['2xl'],
};

const kudosCardStyle: React.CSSProperties = {
  padding: HP_SPACE['2xl'],
  border: HP_BORDER.standard,
  borderRadius: HP_RADIUS.editorial,
  display: 'flex',
  flexDirection: 'column',
  gap: HP_SPACE.sm,
};

const kudosCardImageStyle: React.CSSProperties = {
  width: '100%',
  maxHeight: 180,
  objectFit: 'cover' as const,
  borderRadius: HP_RADIUS.image,
  display: 'block',
};

const kudosCardHeadlineStyle: React.CSSProperties = {
  fontSize: '0.9375rem',
  fontWeight: 600,
  lineHeight: 1.4,
};

const kudosCardRecipientsStyle: React.CSSProperties = {
  fontSize: '0.8125rem',
  fontWeight: 500,
  opacity: HP_TEXT_OPACITY.muted,
  lineHeight: 1.4,
};

const kudosCardExcerptStyle: React.CSSProperties = {
  fontSize: '0.8125rem',
  opacity: HP_TEXT_OPACITY.secondary,
  lineHeight: 1.5,
  margin: 0,
};

const kudosCardFooterStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: HP_SPACE.md,
  marginTop: 'auto',
  paddingTop: HP_SPACE.sm,
  fontSize: '0.75rem',
  opacity: HP_TEXT_OPACITY.secondary,
};

const celebrateButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: HP_SPACE.xs,
  padding: `${HP_SPACE.xs}px ${HP_SPACE.md}px`,
  border: HP_BORDER.subtle,
  borderRadius: HP_RADIUS.command,
  background: 'transparent',
  cursor: 'pointer',
  fontSize: '0.75rem',
  fontWeight: 500,
  lineHeight: 1,
  color: 'inherit',
  transition: 'background 150ms ease',
};

const emptyArchiveStyle: React.CSSProperties = {
  padding: `${HP_SPACE['4xl']}px ${HP_SPACE['2xl']}px`,
  textAlign: 'center',
  border: HP_BORDER.subtle,
  borderRadius: HP_RADIUS.editorial,
  background: 'rgba(229,126,70,0.015)',
  marginTop: HP_SPACE['2xl'],
};

const loadingStyle: React.CSSProperties = {
  padding: `${HP_SPACE['4xl']}px ${HP_SPACE['2xl']}px`,
  textAlign: 'center',
  fontSize: '0.875rem',
  opacity: HP_TEXT_OPACITY.secondary,
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function CelebrateButton({ count }: { count?: number }): React.JSX.Element {
  const label = typeof count === 'number' && count > 0 ? `Celebrate (${count})` : 'Celebrate';
  return (
    <button type="button" style={celebrateButtonStyle} aria-label={label}>
      <CheckCircle2 size={12} />
      <span>{label}</span>
    </button>
  );
}

function FilterBar({ active, onSelect }: { active: KudosFilter; onSelect: (f: KudosFilter) => void }): React.JSX.Element {
  return (
    <div style={filterRowStyle} role="tablist" aria-label="Browse Kudos by recipient type">
      {FILTER_OPTIONS.map((filter) => {
        const isActive = filter === active;
        return (
          <button
            key={filter}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(filter)}
            style={{
              ...filterButtonBaseStyle,
              border: isActive ? HP_BORDER.warmAccent : HP_BORDER.subtle,
              background: isActive ? 'rgba(229,126,70,0.06)' : 'transparent',
            }}
          >
            {FILTER_LABELS[filter]}
          </button>
        );
      })}
    </div>
  );
}

function KudosArchiveCard({ item }: { item: KudosEntry }): React.JSX.Element {
  const recipientLabel = formatRecipients(item.recipients);

  return (
    <article style={kudosCardStyle}>
      {item.media && (
        <img src={item.media.src} alt={item.media.alt} style={kudosCardImageStyle} />
      )}
      <div style={kudosCardHeadlineStyle}>{item.headline}</div>
      {recipientLabel && (
        <div style={kudosCardRecipientsStyle}>{recipientLabel}</div>
      )}
      <p style={kudosCardExcerptStyle}>{item.excerpt}</p>
      <div style={kudosCardFooterStyle}>
        <span>by {item.submittedBy.displayName}</span>
        <CelebrateButton count={item.celebrateCount} />
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function KudosPage({ kudos = [], isLoading = false }: KudosPageProps): React.JSX.Element {
  const [activeFilter, setActiveFilter] = React.useState<KudosFilter>('all');

  const approvedKudos = kudos.filter((item) => item.status === 'approved');

  const filteredKudos = activeFilter === 'all'
    ? approvedKudos
    : approvedKudos.filter((item) =>
        item.recipients.some((r) => r.recipientType === activeFilter),
      );

  if (isLoading) {
    return (
      <HbcHomepageSectionShell title="Kudos" subtitle="Recognize great work, celebrate teammates, and spotlight wins across the company">
        <div role="status" aria-live="polite" style={loadingStyle}>
          Loading Kudos...
        </div>
      </HbcHomepageSectionShell>
    );
  }

  return (
    <HbcHomepageSectionShell title="Kudos" subtitle="Recognize great work, celebrate teammates, and spotlight wins across the company">
      <div data-hbc-homepage="kudos-page">
        <div style={pageHeaderStyle}>
          <div style={{ fontSize: '0.875rem', opacity: HP_TEXT_OPACITY.secondary }}>
            {approvedKudos.length} recognition{approvedKudos.length !== 1 ? 's' : ''} shared
          </div>
          <HbcPremiumCta label="Give Kudos" href="#give-kudos" variant="ghost" arrow />
        </div>

        <FilterBar active={activeFilter} onSelect={setActiveFilter} />

        <Separator decorative style={{ margin: `${HP_SPACE.xl}px 0` }} />

        {filteredKudos.length === 0 ? (
          <div role="status" aria-live="polite" style={emptyArchiveStyle}>
            <div style={{ fontSize: '0.9375rem', fontWeight: 600, lineHeight: 1.4 }}>
              {approvedKudos.length === 0
                ? 'No Kudos yet'
                : `No ${FILTER_LABELS[activeFilter].toLowerCase()} Kudos found`}
            </div>
            <p style={{ margin: `${HP_SPACE.sm}px 0 0`, fontSize: '0.8125rem', opacity: HP_TEXT_OPACITY.secondary, lineHeight: 1.5 }}>
              {approvedKudos.length === 0
                ? 'Be the first to recognize a teammate. Share appreciation for great work, team wins, or everyday excellence.'
                : 'Try a different filter or browse all Kudos.'}
            </p>
            {approvedKudos.length === 0 && (
              <div style={{ marginTop: HP_SPACE.xl }}>
                <HbcPremiumCta label="Give Kudos" href="#give-kudos" variant="ghost" arrow />
              </div>
            )}
          </div>
        ) : (
          <div style={archiveGridStyle}>
            {filteredKudos.map((item) => (
              <KudosArchiveCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </HbcHomepageSectionShell>
  );
}
