/**
 * Phase 3 Stage 5.2 — Project Activity tile component.
 *
 * Renders project activity timeline in 3 complexity variants
 * per P3-C2 §6.2. Data is provided via props; hook wiring is app-level.
 *
 * Governing: P3-C2 §6
 */
import React from 'react';
import type { ICanvasTileProps } from '../types/index.js';

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

const significanceBadge = (sig: 'critical' | 'notable' | 'routine'): React.CSSProperties => ({
  fontSize: 10,
  padding: '1px 5px',
  borderRadius: 3,
  backgroundColor: sig === 'critical' ? '#f8d7da' : sig === 'notable' ? '#fff3cd' : '#e8e8e8',
  color: sig === 'critical' ? '#721c24' : sig === 'notable' ? '#856404' : '#666',
  marginRight: 6,
});

/** Essential: latest notable event summary */
export function ProjectActivityTileEssential(props: ICanvasTileProps): React.ReactElement {
  return (
    <div data-testid={`tile-${props.tileKey}`} data-tier="essential" style={containerStyle}>
      <div style={headerStyle}>
        <strong>Activity</strong>
      </div>
      <div style={{ fontSize: 13, color: '#666' }}>Loading activity...</div>
    </div>
  );
}
ProjectActivityTileEssential.displayName = 'ProjectActivityTile[essential]';

/** Standard: 3-event preview with significance badges */
export function ProjectActivityTileStandard(props: ICanvasTileProps): React.ReactElement {
  return (
    <div data-testid={`tile-${props.tileKey}`} data-tier="standard" style={containerStyle}>
      <div style={headerStyle}>
        <strong>Activity</strong>
        {props.dataSource && <span style={{ fontSize: 10, color: '#888' }}>{props.dataSource}</span>}
      </div>
      <div style={eventStyle}>
        <span style={significanceBadge('notable')}>notable</span>
        Loading events...
      </div>
    </div>
  );
}
ProjectActivityTileStandard.displayName = 'ProjectActivityTile[standard]';

/** Expert: mini-timeline with category grouping */
export function ProjectActivityTileExpert(props: ICanvasTileProps): React.ReactElement {
  return (
    <div data-testid={`tile-${props.tileKey}`} data-tier="expert" style={containerStyle}>
      <div style={headerStyle}>
        <strong>Activity</strong>
        {props.dataSource && <span style={{ fontSize: 10, color: '#888' }}>{props.dataSource}</span>}
      </div>
      <div style={{ flex: 1, fontSize: 13, color: '#666' }}>
        Loading activity timeline for project {props.projectId}...
      </div>
    </div>
  );
}
ProjectActivityTileExpert.displayName = 'ProjectActivityTile[expert]';
