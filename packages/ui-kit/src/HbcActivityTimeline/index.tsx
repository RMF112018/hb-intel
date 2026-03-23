/**
 * SF28-T05 — HbcActivityTimeline.
 *
 * Renders reverse-chronological activity grouped by relative date.
 * Supports compact/full density, loading/empty/degraded states.
 *
 * Governing: SF28-T05, L-08 (UI ownership)
 */
import React from 'react';
import { ActivityEventRow, type ActivityEventRowEvent } from '../ActivityEventRow/index.js';

export interface HbcActivityTimelineProps {
  /** Events sorted by timestamp descending */
  events: ActivityEventRowEvent[];
  /** Timeline projection mode (informational) */
  mode?: 'record' | 'related' | 'workspace';
  /** Rendering density */
  density?: 'compact' | 'full';
  /** Show loading state */
  loading?: boolean;
  /** Show empty state */
  empty?: boolean;
  /** Show degradation warning */
  degraded?: boolean;
  /** Degradation message */
  degradationMessage?: string;
  /** Handler for diff detail clicks */
  onDiffClick?: (eventId: string) => void;
}

function groupByRelativeDate(events: ActivityEventRowEvent[]): Map<string, ActivityEventRowEvent[]> {
  const groups = new Map<string, ActivityEventRowEvent[]>();
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 86_400_000;
  const weekStart = todayStart - 7 * 86_400_000;

  for (const event of events) {
    const ts = new Date(event.timestampIso).getTime();
    let label: string;
    if (ts >= todayStart) label = 'Today';
    else if (ts >= yesterdayStart) label = 'Yesterday';
    else if (ts >= weekStart) label = 'This Week';
    else label = 'Earlier';

    const group = groups.get(label) ?? [];
    group.push(event);
    groups.set(label, group);
  }

  return groups;
}

export function HbcActivityTimeline({
  events,
  mode = 'workspace',
  density = 'full',
  loading = false,
  empty = false,
  degraded = false,
  degradationMessage,
  onDiffClick,
}: HbcActivityTimelineProps): React.ReactElement {
  if (loading) {
    return (
      <div data-testid="activity-timeline" data-state="loading" style={{ padding: 16, color: '#888', fontFamily: 'inherit' }}>
        Loading activity...
      </div>
    );
  }

  if (empty || events.length === 0) {
    return (
      <div data-testid="activity-timeline" data-state="empty" style={{ padding: 16, color: '#888', fontFamily: 'inherit' }}>
        No activity recorded yet.
      </div>
    );
  }

  const groups = groupByRelativeDate(events);

  return (
    <div data-testid="activity-timeline" data-mode={mode} style={{ fontFamily: 'inherit' }}>
      {degraded && (
        <div
          data-testid="degradation-warning"
          style={{
            padding: '6px 12px',
            backgroundColor: '#fff3cd',
            color: '#856404',
            fontSize: 12,
            borderRadius: 4,
            marginBottom: 8,
          }}
        >
          {degradationMessage ?? 'Some activity sources are temporarily unavailable.'}
        </div>
      )}

      {Array.from(groups.entries()).map(([label, groupEvents]) => (
        <div key={label} data-testid="activity-group">
          <div style={{
            fontSize: 11,
            fontWeight: 600,
            color: '#888',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            padding: '12px 0 4px',
            borderBottom: '1px solid #e0e0e0',
          }}>
            {label}
          </div>
          {groupEvents.map((event) => (
            <ActivityEventRow
              key={event.eventId}
              event={event}
              density={density}
              onDiffClick={onDiffClick ? () => onDiffClick(event.eventId) : undefined}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
