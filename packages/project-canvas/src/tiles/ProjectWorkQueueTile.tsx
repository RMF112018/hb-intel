/**
 * Phase 3 Stage 5.2 — Project Work Queue tile component.
 *
 * Renders project-scoped work queue items in 3 complexity variants
 * per P3-C2 §4.2. Consumes data from the layout-family work-queue hook.
 *
 * Governing: P3-C2 §4, P3-D3 (Work Queue Contract)
 */
import React from 'react';
import type { ICanvasTileProps } from '../types/index.js';
import { useWorkQueueSummary } from '@hbc/features-project-hub';

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

const countBadge = (urgent: boolean): React.CSSProperties => ({
  fontSize: 18,
  fontWeight: 700,
  color: urgent ? '#a4262c' : '#0078d4',
});

const itemStyle: React.CSSProperties = {
  padding: '6px 0',
  borderBottom: '1px solid #f0f0f0',
  fontSize: 13,
};

const urgencyBadge = (urgency: string): React.CSSProperties => ({
  fontSize: 10,
  padding: '1px 5px',
  borderRadius: 3,
  backgroundColor: urgency === 'urgent' ? '#f8d7da' : urgency === 'standard' ? '#fff3cd' : '#e8e8e8',
  color: urgency === 'urgent' ? '#721c24' : urgency === 'standard' ? '#856404' : '#666',
  marginRight: 6,
});

const emptyStyle: React.CSSProperties = { fontSize: 13, color: '#888', fontStyle: 'italic' };
const moduleStyle: React.CSSProperties = { fontSize: 10, color: '#888', display: 'block', marginTop: 2 };
const overdueBadge: React.CSSProperties = { fontSize: 10, color: '#a4262c', marginLeft: 'auto' };

/** Essential: count badge + top urgent item */
export function ProjectWorkQueueTileEssential(props: ICanvasTileProps): React.ReactElement {
  const summary = useWorkQueueSummary(props.projectId);

  return (
    <div data-testid={`tile-${props.tileKey}`} data-tier="essential" style={containerStyle}>
      <div style={headerStyle}>
        <strong>Work Queue</strong>
        <span style={countBadge(summary.urgentItems > 0)}>{summary.totalItems}</span>
      </div>
      {summary.totalItems === 0 ? (
        <div style={emptyStyle}>No work items</div>
      ) : (
        <div style={itemStyle}>
          <span style={urgencyBadge(summary.items[0]?.urgency ?? 'standard')}>
            {summary.items[0]?.urgency}
          </span>
          {summary.items[0]?.title}
        </div>
      )}
      {props.isLocked && <div data-testid="locked-indicator" style={{ fontSize: 10, color: '#888' }}>Mandatory</div>}
    </div>
  );
}
ProjectWorkQueueTileEssential.displayName = 'ProjectWorkQueueTile[essential]';

/** Standard: 3-item preview with urgency/status */
export function ProjectWorkQueueTileStandard(props: ICanvasTileProps): React.ReactElement {
  const summary = useWorkQueueSummary(props.projectId);
  const preview = summary.items.slice(0, 3);

  return (
    <div data-testid={`tile-${props.tileKey}`} data-tier="standard" style={containerStyle}>
      <div style={headerStyle}>
        <strong>Work Queue</strong>
        <span style={{ fontSize: 10, color: '#888' }}>
          {summary.urgentItems > 0 && <span style={{ color: '#a4262c' }}>{summary.urgentItems} urgent</span>}
          {summary.urgentItems > 0 && summary.overdueItems > 0 && ' · '}
          {summary.overdueItems > 0 && <span style={{ color: '#a4262c' }}>{summary.overdueItems} overdue</span>}
        </span>
      </div>
      {preview.length === 0 ? (
        <div style={emptyStyle}>No work items</div>
      ) : (
        <>
          {preview.map((item) => (
            <div key={item.id} style={itemStyle}>
              <span style={urgencyBadge(item.urgency)}>{item.urgency}</span>
              {item.title}
              <span style={moduleStyle}>{item.sourceModule} · {item.owner}</span>
            </div>
          ))}
          {summary.totalItems > 3 && (
            <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>
              +{summary.totalItems - 3} more
            </div>
          )}
        </>
      )}
      {props.isLocked && <div data-testid="locked-indicator" style={{ fontSize: 10, color: '#888' }}>Mandatory</div>}
    </div>
  );
}
ProjectWorkQueueTileStandard.displayName = 'ProjectWorkQueueTile[standard]';

/** Expert: full work feed with action CTAs */
export function ProjectWorkQueueTileExpert(props: ICanvasTileProps): React.ReactElement {
  const summary = useWorkQueueSummary(props.projectId);

  return (
    <div data-testid={`tile-${props.tileKey}`} data-tier="expert" style={containerStyle}>
      <div style={headerStyle}>
        <strong>Work Queue</strong>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: '#888' }}>
            {summary.totalItems} items
            {summary.urgentItems > 0 && ` · ${summary.urgentItems} urgent`}
            {summary.overdueItems > 0 && ` · ${summary.overdueItems} overdue`}
          </span>
        </div>
      </div>
      {summary.items.length === 0 ? (
        <div style={emptyStyle}>No work items for this project</div>
      ) : (
        <div style={{ flex: 1, overflow: 'auto' }}>
          {summary.items.map((item) => (
            <div key={item.id} style={itemStyle}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={urgencyBadge(item.urgency)}>{item.urgency}</span>
                <span style={{ flex: 1 }}>{item.title}</span>
                {item.aging != null && item.aging > 3 && (
                  <span style={overdueBadge}>{item.aging}d aging</span>
                )}
              </div>
              <span style={moduleStyle}>
                {item.sourceModule} · {item.owner}
                {item.dueDate ? ` · Due ${item.dueDate}` : ''}
              </span>
            </div>
          ))}
        </div>
      )}
      {props.isLocked && <div data-testid="locked-indicator" style={{ fontSize: 10, color: '#888' }}>Mandatory</div>}
    </div>
  );
}
ProjectWorkQueueTileExpert.displayName = 'ProjectWorkQueueTile[expert]';
