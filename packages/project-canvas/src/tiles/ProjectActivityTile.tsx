/**
 * Phase 3 Stage 5.2 — Project Activity tile component.
 *
 * Renders project activity timeline in 3 complexity variants
 * per P3-C2 §6.2. Consumes the Activity spine via useProjectActivity().
 *
 * Governing: P3-C2 §6, P3-D1 (Activity Contract)
 *
 * Note: This tile lives in @hbc/project-canvas but imports the hook from
 * @hbc/features-project-hub. The cross-package import is acceptable because
 * canvas tiles are leaf consumers — they don't create circular dependencies.
 */
import React from 'react';
import type { ICanvasTileProps } from '../types/index.js';
import {
  useProjectActivity,
  registerActivityAdapters,
} from '@hbc/features-project-hub';

// Ensure adapters are registered.
registerActivityAdapters();

/** Inline styles — D-07 SPFx compatibility */
const containerStyle: React.CSSProperties = {
  border: '1px solid #e0e0e0',
  borderRadius: 4,
  padding: 12,
  fontFamily: 'inherit',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 8,
};

const eventStyle: React.CSSProperties = {
  padding: '6px 0',
  borderBottom: '1px solid #f0f0f0',
  fontSize: 13,
};

const significanceBadge = (sig: string): React.CSSProperties => ({
  fontSize: 10,
  padding: '1px 5px',
  borderRadius: 3,
  backgroundColor: sig === 'critical' ? '#f8d7da' : sig === 'notable' ? '#fff3cd' : '#e8e8e8',
  color: sig === 'critical' ? '#721c24' : sig === 'notable' ? '#856404' : '#666',
  marginRight: 6,
});

const emptyStyle: React.CSSProperties = { fontSize: 13, color: '#888', fontStyle: 'italic' };
const loadingStyle: React.CSSProperties = { fontSize: 13, color: '#666' };
const errorStyle: React.CSSProperties = { fontSize: 13, color: '#a4262c' };
const timeStyle: React.CSSProperties = { fontSize: 11, color: '#999', marginLeft: 'auto' };
const moduleStyle: React.CSSProperties = { fontSize: 10, color: '#888', display: 'block', marginTop: 2 };

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffH = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffH < 1) return 'just now';
    if (diffH < 24) return `${diffH}h ago`;
    const diffD = Math.floor(diffH / 24);
    return `${diffD}d ago`;
  } catch {
    return '';
  }
}

/** Essential: latest notable event summary */
export function ProjectActivityTileEssential(props: ICanvasTileProps): React.ReactElement {
  const { feed, isLoading, error } = useProjectActivity({
    projectId: props.projectId,
    significance: ['critical', 'notable'],
    limit: 1,
  });

  const latest = feed?.events[0];

  return (
    <div data-testid={`tile-${props.tileKey}`} data-tier="essential" style={containerStyle}>
      <div style={headerStyle}>
        <strong>Activity</strong>
        {feed && <span style={{ fontSize: 10, color: '#888' }}>{feed.totalCount} events</span>}
      </div>
      {isLoading ? (
        <div style={loadingStyle}>Loading activity...</div>
      ) : error ? (
        <div style={errorStyle}>Activity unavailable</div>
      ) : latest ? (
        <div style={eventStyle}>
          <span style={significanceBadge(latest.significance)}>{latest.significance}</span>
          {latest.summary}
          <span style={moduleStyle}>{latest.sourceModule}</span>
        </div>
      ) : (
        <div style={emptyStyle}>No notable activity</div>
      )}
    </div>
  );
}
ProjectActivityTileEssential.displayName = 'ProjectActivityTile[essential]';

/** Standard: 3-event preview with significance badges */
export function ProjectActivityTileStandard(props: ICanvasTileProps): React.ReactElement {
  const { feed, isLoading, error } = useProjectActivity({
    projectId: props.projectId,
    limit: 3,
  });

  return (
    <div data-testid={`tile-${props.tileKey}`} data-tier="standard" style={containerStyle}>
      <div style={headerStyle}>
        <strong>Activity</strong>
        {props.dataSource && <span style={{ fontSize: 10, color: '#888' }}>{props.dataSource}</span>}
      </div>
      {isLoading ? (
        <div style={loadingStyle}>Loading events...</div>
      ) : error ? (
        <div style={errorStyle}>Activity unavailable</div>
      ) : feed && feed.events.length > 0 ? (
        <>
          {feed.events.map((event) => (
            <div key={event.eventId} style={eventStyle}>
              <span style={significanceBadge(event.significance)}>{event.significance}</span>
              {event.summary}
              <span style={timeStyle}>{formatTime(event.occurredAt)}</span>
            </div>
          ))}
          {feed.hasMore && (
            <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>
              +{feed.totalCount - feed.events.length} more
            </div>
          )}
        </>
      ) : (
        <div style={emptyStyle}>No activity recorded</div>
      )}
    </div>
  );
}
ProjectActivityTileStandard.displayName = 'ProjectActivityTile[standard]';

/** Expert: mini-timeline with category grouping */
export function ProjectActivityTileExpert(props: ICanvasTileProps): React.ReactElement {
  const { feed, isLoading, error, refresh } = useProjectActivity({
    projectId: props.projectId,
    limit: 8,
  });

  return (
    <div data-testid={`tile-${props.tileKey}`} data-tier="expert" style={containerStyle}>
      <div style={headerStyle}>
        <strong>Activity</strong>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {feed && (
            <span style={{ fontSize: 10, color: '#888' }}>
              {feed.criticalCount > 0 && `${feed.criticalCount} critical · `}
              {feed.notableCount > 0 && `${feed.notableCount} notable · `}
              {feed.totalCount} total
            </span>
          )}
          <button
            type="button"
            onClick={refresh}
            style={{ fontSize: 10, cursor: 'pointer', border: 'none', background: 'none', color: '#0078d4', padding: 0 }}
          >
            Refresh
          </button>
        </div>
      </div>
      {isLoading ? (
        <div style={loadingStyle}>Loading activity timeline...</div>
      ) : error ? (
        <div style={errorStyle}>Activity unavailable — {error}</div>
      ) : feed && feed.events.length > 0 ? (
        <div style={{ flex: 1, overflow: 'auto' }}>
          {feed.events.map((event) => (
            <div key={event.eventId} style={eventStyle}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={significanceBadge(event.significance)}>{event.significance}</span>
                <span style={{ flex: 1 }}>{event.summary}</span>
                <span style={timeStyle}>{formatTime(event.occurredAt)}</span>
              </div>
              <span style={moduleStyle}>
                {event.sourceModule} · {event.changedByName}
              </span>
            </div>
          ))}
          {feed.hasMore && (
            <div style={{ fontSize: 11, color: '#666', marginTop: 4, textAlign: 'center' }}>
              Showing {feed.events.length} of {feed.totalCount}
            </div>
          )}
        </div>
      ) : (
        <div style={emptyStyle}>No activity recorded for this project</div>
      )}
    </div>
  );
}
ProjectActivityTileExpert.displayName = 'ProjectActivityTile[expert]';
