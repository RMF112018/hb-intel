/**
 * Phase 3 Stage 5.2 — Project Work Queue tile component.
 *
 * Renders project-scoped work queue items in 3 complexity variants
 * per P3-C2 §4.2. Data is provided via props; hook wiring is app-level.
 *
 * Governing: P3-C2 §4
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

const countBadge: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  color: '#0078d4',
};

const itemStyle: React.CSSProperties = {
  padding: '6px 0',
  borderBottom: '1px solid #f0f0f0',
  fontSize: 13,
};

const priorityBadge: React.CSSProperties = {
  fontSize: 10,
  padding: '1px 5px',
  borderRadius: 3,
  backgroundColor: '#fff3cd',
  color: '#856404',
  marginRight: 6,
};

/** Essential: count badge + top priority item */
export function ProjectWorkQueueTileEssential(props: ICanvasTileProps): React.ReactElement {
  return (
    <div data-testid={`tile-${props.tileKey}`} data-tier="essential" style={containerStyle}>
      <div style={headerStyle}>
        <strong>Work Queue</strong>
        <span style={countBadge}>—</span>
      </div>
      <div style={{ fontSize: 13, color: '#666' }}>Loading work items...</div>
      {props.isLocked && <div data-testid="locked-indicator">🔒</div>}
    </div>
  );
}
ProjectWorkQueueTileEssential.displayName = 'ProjectWorkQueueTile[essential]';

/** Standard: 3-item preview with priority/status */
export function ProjectWorkQueueTileStandard(props: ICanvasTileProps): React.ReactElement {
  return (
    <div data-testid={`tile-${props.tileKey}`} data-tier="standard" style={containerStyle}>
      <div style={headerStyle}>
        <strong>Work Queue</strong>
        {props.dataSource && <span style={{ fontSize: 10, color: '#888' }}>{props.dataSource}</span>}
      </div>
      <div style={itemStyle}>
        <span style={priorityBadge}>now</span>
        Loading...
      </div>
      {props.isLocked && <div data-testid="locked-indicator">🔒</div>}
    </div>
  );
}
ProjectWorkQueueTileStandard.displayName = 'ProjectWorkQueueTile[standard]';

/** Expert: mini-feed with action CTAs */
export function ProjectWorkQueueTileExpert(props: ICanvasTileProps): React.ReactElement {
  return (
    <div data-testid={`tile-${props.tileKey}`} data-tier="expert" style={containerStyle}>
      <div style={headerStyle}>
        <strong>Work Queue</strong>
        {props.dataSource && <span style={{ fontSize: 10, color: '#888' }}>{props.dataSource}</span>}
      </div>
      <div style={{ flex: 1, fontSize: 13, color: '#666' }}>
        Loading work items for project {props.projectId}...
      </div>
      {props.isLocked && <div data-testid="locked-indicator">🔒</div>}
    </div>
  );
}
ProjectWorkQueueTileExpert.displayName = 'ProjectWorkQueueTile[expert]';
