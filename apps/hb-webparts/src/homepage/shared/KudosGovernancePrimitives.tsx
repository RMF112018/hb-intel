/**
 * Shared governance UI primitives for HB Kudos surfaces.
 *
 * Extracted from repeated local patterns in KudosDetailPanelContent,
 * HbKudosCompanion, and HbKudos archive to avoid duplication and
 * ensure consistent premium governance visual grammar.
 *
 * These live in the webpart shared layer (not @hbc/ui-kit) because
 * they compose @hbc/ui-kit/homepage primitives and are specific to
 * the kudos governance domain. Promotion to ui-kit is appropriate
 * if/when other governance surfaces reuse them.
 */
import * as React from 'react';
import { HbcStatusBadge } from '@hbc/ui-kit/homepage';

// ---------------------------------------------------------------------------
// SectionHeading — governance metadata section label
// ---------------------------------------------------------------------------

export function KudosSectionHeading({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <div
      style={{
        fontSize: '0.6875rem',
        fontWeight: 800,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'rgba(26, 19, 16, 0.55)',
        marginBottom: 8,
      }}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// InfoRow — label:value governance metadata row
// ---------------------------------------------------------------------------

export function KudosInfoRow({ label, value }: { label: string; value?: string }): React.JSX.Element | null {
  if (!value?.trim()) return null;
  return (
    <div style={{ fontSize: '0.8125rem', lineHeight: 1.55, color: 'rgba(26, 19, 16, 0.72)', marginBottom: 6 }}>
      <span style={{ fontWeight: 700, color: 'rgba(26, 19, 16, 0.62)' }}>{label}:</span> {value}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ActionButton — governance action button with tone
// ---------------------------------------------------------------------------

export type GovernanceActionTone = 'info' | 'warning' | 'danger';

const TONE_COLORS: Record<GovernanceActionTone, string> = {
  danger: '#c4314b',
  warning: '#c26434',
  info: '#225391',
};

export function KudosActionButton({
  label,
  onClick,
  disabled,
  tone,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
  tone: GovernanceActionTone;
}): React.JSX.Element {
  const toneColor = TONE_COLORS[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '7px 13px',
        borderRadius: 8,
        border: `1.5px solid ${toneColor}`,
        background: disabled ? 'rgba(128, 128, 128, 0.08)' : '#ffffff',
        color: disabled ? 'rgba(26, 19, 16, 0.4)' : toneColor,
        fontSize: '0.6875rem',
        fontWeight: 800,
        letterSpacing: '0.02em',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit',
      }}
    >
      {label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// AuditTimelineBlock — shared audit timeline rendering
// ---------------------------------------------------------------------------

export interface AuditTimelineEvent {
  id: number;
  eventType: string;
  actorDisplayName?: string;
  eventAt: string;
  publicNote?: string;
  internalNote?: string;
}

export function KudosAuditTimelineBlock({
  events,
  showInternalNotes,
  loading,
  fallbackText,
  mapLabel,
  mapTone,
}: {
  events: readonly AuditTimelineEvent[];
  showInternalNotes: boolean;
  loading?: boolean;
  fallbackText?: string;
  mapLabel: (eventType: string) => string;
  mapTone: (eventType: string) => string;
}): React.JSX.Element {
  function chipVariant(tone: string): 'success' | 'warning' | 'critical' | 'info' {
    if (tone === 'success') return 'success';
    if (tone === 'warning') return 'warning';
    if (tone === 'danger') return 'critical';
    return 'info';
  }

  if (loading) {
    return <div style={{ fontSize: '0.75rem', color: 'rgba(26, 19, 16, 0.5)' }}>Loading timeline…</div>;
  }

  if (events.length === 0) {
    return (
      <div style={{ fontSize: '0.75rem', color: 'rgba(26, 19, 16, 0.5)' }}>
        {fallbackText ?? 'No timeline events.'}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {events.map((evt) => (
        <div
          key={evt.id}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            fontSize: '0.75rem',
            lineHeight: 1.5,
            paddingBottom: 6,
            borderBottom: '1px solid rgba(229, 126, 70, 0.10)',
          }}
        >
          <HbcStatusBadge
            variant={chipVariant(mapTone(evt.eventType))}
            size="small"
            label={mapLabel(evt.eventType)}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: 'rgba(26, 19, 16, 0.62)', fontWeight: 600 }}>
              {evt.actorDisplayName ?? 'System'} · {new Date(evt.eventAt).toLocaleString()}
            </div>
            {evt.publicNote ? (
              <div style={{ color: 'rgba(26, 19, 16, 0.58)', marginTop: 2 }}>{evt.publicNote}</div>
            ) : null}
            {showInternalNotes && evt.internalNote ? (
              <div style={{ color: 'rgba(196, 49, 75, 0.72)', marginTop: 2, fontStyle: 'italic' }}>
                Internal: {evt.internalNote}
              </div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
