/**
 * SF28-T05 — ActivityEventRow.
 *
 * Renders a single activity event: icon, summary, actor, timestamp,
 * object link, optional diff affordance, optional context badges.
 * Answers "what happened?" at a glance per L-10.
 *
 * Governing: SF28-T05, L-08/L-10
 */
import React from 'react';
import { ActivityEventIcon, type ActivityEventIconType } from '../ActivityEventIcon/index.js';

export interface ActivityEventRowEvent {
  eventId: string;
  type: string;
  summary: string;
  timestampIso: string;
  actor: {
    type: 'user' | 'system' | 'workflow' | 'service';
    initiatedByName: string;
  };
  primaryRef: { moduleKey: string; recordId: string };
  diffEntries?: { fieldLabel: string; from: string | null; to: string | null }[];
  syncState?: string;
  confidence?: string;
  recommendedOpenAction?: { label: string; href: string } | null;
  dedupe?: { projectionAction: string } | null;
}

export interface ActivityEventRowProps {
  event: ActivityEventRowEvent;
  density?: 'compact' | 'full';
  onDiffClick?: () => void;
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function ActivityEventRow({
  event,
  density = 'full',
  onDiffClick,
}: ActivityEventRowProps): React.ReactElement {
  const isCompact = density === 'compact';
  const hasDiff = event.diffEntries && event.diffEntries.length > 0;
  const isDeduplicated = event.dedupe?.projectionAction === 'suppressed';
  const isNonAuthoritative = event.syncState && event.syncState !== 'authoritative';

  return (
    <div
      data-testid="activity-event-row"
      data-event-id={event.eventId}
      data-sync-state={event.syncState}
      style={{
        display: 'flex',
        gap: 8,
        padding: isCompact ? '4px 0' : '8px 0',
        borderBottom: '1px solid #f0f0f0',
        opacity: isDeduplicated ? 0.5 : 1,
        fontFamily: 'inherit',
        fontSize: 13,
      }}
    >
      <ActivityEventIcon
        type={event.type as ActivityEventIconType}
        actorType={event.actor.type}
        size={isCompact ? 'sm' : 'md'}
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontWeight: 500 }}>{event.summary}</span>
          <span style={{ fontSize: 11, color: '#888', whiteSpace: 'nowrap', marginLeft: 8 }}>
            {formatRelativeTime(event.timestampIso)}
          </span>
        </div>

        <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
          <span>{event.actor.initiatedByName}</span>
          <span style={{ margin: '0 4px' }}>·</span>
          <span>{event.primaryRef.moduleKey}</span>
        </div>

        {isNonAuthoritative && (
          <span
            data-testid="sync-state-badge"
            style={{
              fontSize: 10,
              padding: '1px 5px',
              borderRadius: 3,
              backgroundColor: '#fff3cd',
              color: '#856404',
              marginTop: 2,
              display: 'inline-block',
            }}
          >
            {event.syncState}
          </span>
        )}

        {!isCompact && hasDiff && onDiffClick && (
          <button
            type="button"
            data-testid="diff-affordance"
            onClick={onDiffClick}
            style={{
              fontSize: 11,
              color: '#0078d4',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              marginTop: 4,
            }}
          >
            Show changes ({event.diffEntries!.length})
          </button>
        )}

        {!isCompact && event.recommendedOpenAction && (
          <a
            href={event.recommendedOpenAction.href}
            style={{ fontSize: 11, color: '#0078d4', display: 'block', marginTop: 2 }}
          >
            {event.recommendedOpenAction.label}
          </a>
        )}
      </div>
    </div>
  );
}
