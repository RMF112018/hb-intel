/**
 * SF28-T05 — ActivityEventIcon.
 *
 * Maps canonical event types to accessible semantic labels.
 * Distinguishes user/system/workflow visually.
 * Provides readable fallback for unknown event types.
 *
 * Governing: SF28-T05, L-08 (UI ownership)
 */
import React from 'react';

/** Event type identifier matching @hbc/activity-timeline ActivityEventType */
export type ActivityEventIconType =
  | 'created' | 'edited' | 'field-changed' | 'comment-added' | 'acknowledged'
  | 'assigned' | 'reassigned' | 'handoff-started' | 'handoff-completed'
  | 'published' | 'superseded' | 'revoked' | 'exported' | 'status-changed'
  | 'due-date-changed' | 'attachment-added' | 'workflow-triggered' | 'system-alert';

export interface ActivityEventIconProps {
  /** Event type to map to an icon */
  type: ActivityEventIconType | string;
  /** Icon size */
  size?: 'sm' | 'md' | 'lg';
  /** Accessible fallback label */
  fallbackLabel?: string;
  /** Actor type for visual distinction (user vs system/workflow) */
  actorType?: 'user' | 'system' | 'workflow' | 'service';
}

const ICON_LABELS: Record<string, string> = {
  'created': 'Created',
  'edited': 'Edited',
  'field-changed': 'Field Changed',
  'comment-added': 'Comment',
  'acknowledged': 'Acknowledged',
  'assigned': 'Assigned',
  'reassigned': 'Reassigned',
  'handoff-started': 'Handoff Started',
  'handoff-completed': 'Handoff Completed',
  'published': 'Published',
  'superseded': 'Superseded',
  'revoked': 'Revoked',
  'exported': 'Exported',
  'status-changed': 'Status Changed',
  'due-date-changed': 'Due Date Changed',
  'attachment-added': 'Attachment',
  'workflow-triggered': 'Workflow',
  'system-alert': 'System Alert',
};

const ICON_SYMBOLS: Record<string, string> = {
  'created': '+',
  'edited': '✎',
  'field-changed': '△',
  'comment-added': '💬',
  'acknowledged': '✓',
  'assigned': '→',
  'reassigned': '⇄',
  'handoff-started': '📤',
  'handoff-completed': '📥',
  'published': '📢',
  'superseded': '⊘',
  'revoked': '✕',
  'exported': '↗',
  'status-changed': '◉',
  'due-date-changed': '📅',
  'attachment-added': '📎',
  'workflow-triggered': '⚙',
  'system-alert': '⚠',
};

const SIZE_MAP = { sm: 16, md: 20, lg: 24 };

export function ActivityEventIcon({
  type,
  size = 'md',
  fallbackLabel,
  actorType = 'user',
}: ActivityEventIconProps): React.ReactElement {
  const label = ICON_LABELS[type] ?? fallbackLabel ?? type;
  const symbol = ICON_SYMBOLS[type] ?? '●';
  const px = SIZE_MAP[size];

  const isSystemOrigin = actorType === 'system' || actorType === 'workflow' || actorType === 'service';

  return (
    <span
      role="img"
      aria-label={label}
      data-testid="activity-event-icon"
      data-event-type={type}
      data-actor-type={actorType}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: px,
        height: px,
        fontSize: px * 0.7,
        borderRadius: '50%',
        backgroundColor: isSystemOrigin ? '#e8e8e8' : '#e6f0ff',
        color: isSystemOrigin ? '#888' : '#0078d4',
        fontFamily: 'inherit',
        lineHeight: 1,
      }}
    >
      {symbol}
    </span>
  );
}
