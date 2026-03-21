/**
 * HbcMyWorkListItem — SF29-T05
 *
 * Individual work item row renderer.
 * Pure presentational — receives item and onAction as props.
 * Complexity-tier-aware rendering.
 *
 * Visual design (mold-breaker principles MB-04, MB-06):
 *  - Hover state uses React useState + onMouseEnter/Leave for theme-responsive
 *    background lift — inline styles cannot use :hover pseudo-class.
 *  - Left border accent encodes urgency: error-red for blocked, brand-orange
 *    for unread. Items with neither have no accent (neutral left padding).
 *  - Module key rendered as compact uppercase pill tag.
 *  - Primary action uses ghost variant; title/link is the primary click target.
 *  - `watch` lane items are visually de-emphasised (muted title color) to
 *    reinforce their lower urgency relative to `do-now` and blocked items.
 *  - All colors use CSS custom properties for full theme-responsiveness.
 */

import React, { useState, useCallback } from 'react';
import { useComplexity } from '@hbc/complexity';
import { HbcButton, HbcStatusBadge, HbcPopover } from '@hbc/ui-kit';
import type { IMyWorkItem } from '../../types/index.js';
import type { IMyWorkActionRequest } from '../../hooks/useMyWorkActions.js';

export interface IHbcMyWorkListItemProps {
  item: IMyWorkItem;
  onAction?: (request: IMyWorkActionRequest) => void;
  className?: string;
}

// ─── Module display name mapping (UIF-006) ──────────────────────────────────
// Maps raw moduleKey slugs to human-readable labels. Falls back to title-casing.
const MODULE_DISPLAY_NAMES: Record<string, string> = {
  'bd-scorecard': 'BD Scorecard',
  'project-hub-pmp': 'Project Hub',
  'project-hub-health-pulse': 'Health Pulse',
  'estimating': 'Estimating',
  'accounting': 'Accounting',
  'admin': 'Admin',
};

function formatModuleLabel(moduleKey: string): string {
  return (
    MODULE_DISPLAY_NAMES[moduleKey] ??
    moduleKey.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

function formatDaysInState(updatedAtIso: string): string {
  const ms = Date.now() - new Date(updatedAtIso).getTime();
  const days = Math.floor(ms / 86_400_000);
  if (days === 0) return 'Today';
  if (days === 1) return '1 day';
  return `${days} days`;
}

const MONTH_ABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function formatDueDate(isoDate: string): string {
  const d = new Date(isoDate);
  return `Due ${MONTH_ABBR[d.getMonth()]} ${d.getDate()}`;
}

// ─── Status accent colours ──────────────────────────────────────────────────
// Kept as literals: my-work-feed has no direct dep on @hbc/ui-kit/theme,
// and these are stable brand/semantic values that don't vary by theme.
const ACCENT_ORANGE = '#F37021';
const ACCENT_BLOCKED = 'var(--colorPaletteRedBorderActive)';

// ─── Lane-based urgency helpers ─────────────────────────────────────────────

/**
 * Returns the left-border accent for an item based on status priority:
 *   blocked  → error red (highest urgency)
 *   unread   → brand orange
 *   other    → no accent
 */
function resolveAccentBorder(item: IMyWorkItem): string | undefined {
  if (item.isBlocked) return `3px solid ${ACCENT_BLOCKED}`;
  if (item.isUnread) return `3px solid ${ACCENT_ORANGE}`;
  return undefined;
}

/**
 * Left padding accounts for the 3px accent stripe so content never shifts
 * regardless of whether an accent is present.
 */
const LEFT_PADDING_WITH_ACCENT = '13px'; // 3px stripe + 10px content gap
const LEFT_PADDING_NO_ACCENT = '16px';   // same total width, no stripe

/**
 * `watch`-lane items carry lower urgency — mute their title slightly so
 * `do-now` and blocked items stand out through contrast, not colour alone.
 */
function resolveTitleColor(item: IMyWorkItem): string {
  if (item.lane === 'watch' && !item.isUnread && !item.isBlocked) {
    return 'var(--colorNeutralForeground3)';
  }
  return 'var(--colorNeutralForeground1)';
}

export function HbcMyWorkListItem({
  item,
  onAction,
  className,
}: IHbcMyWorkListItemProps): JSX.Element {
  const { tier } = useComplexity();
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  const primaryAction = item.availableActions[0];
  const accentBorder = resolveAccentBorder(item);
  const hasAccent = Boolean(accentBorder);

  // ─── Row background ──────────────────────────────────────────────────────
  // Priority: hover > unread > default.
  // Blocked items don't get a background tint — the red left border carries
  // the urgency signal; a background tint would make the row feel alarming.
  let rowBackground = 'var(--colorNeutralBackground1)';
  if (isHovered) {
    rowBackground = 'var(--colorNeutralBackground1Hover)';
  } else if (item.isUnread && !item.isBlocked) {
    rowBackground = 'var(--colorNeutralBackground2)';
  }

  const handleRowClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!item.context.href) return;
      // Let <a> and <button> elements handle their own clicks natively.
      if ((e.target as HTMLElement).closest('a, button')) return;
      window.location.href = item.context.href;
    },
    [item.context.href],
  );

  return (
    <div
      className={className}
      aria-label={`Work item: ${item.title}`}
      onClick={handleRowClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '12px',
        padding: `12px 14px 12px ${hasAccent ? LEFT_PADDING_WITH_ACCENT : LEFT_PADDING_NO_ACCENT}`,
        borderBottom: '1px solid var(--colorNeutralStroke2)',
        borderLeft: accentBorder ?? 'none',
        backgroundColor: rowBackground,
        transition: 'background-color 0.12s ease',
        cursor: item.context.href ? 'pointer' : 'default',
      }}
    >
      {/* Main content */}
      <div
        style={{
          flex: '1 1 0',
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        {/* Title */}
        {item.context.href ? (
          <a
            href={item.context.href}
            style={{
              display: 'block',
              color: resolveTitleColor(item),
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 600,
              lineHeight: '1.4',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap' as const,
            }}
          >
            {item.title}
          </a>
        ) : (
          <span
            style={{
              display: 'block',
              color: resolveTitleColor(item),
              fontSize: '0.875rem',
              fontWeight: 600,
              lineHeight: '1.4',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap' as const,
            }}
          >
            {item.title}
          </span>
        )}

        {/* Status badges + module tag row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flexWrap: 'wrap',
          }}
        >
          {item.isOverdue && <HbcStatusBadge variant="error" label="Overdue" />}
          {item.isBlocked && <HbcStatusBadge variant="warning" label="Blocked" />}
        </div>

        {/* Metadata row — module label, days in state, due date (UIF-006) */}
        {tier !== 'essential' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap',
            }}
          >
            {item.context.moduleKey && (
              <span style={{ fontSize: '0.75rem', color: 'var(--colorNeutralForeground3)' }}>
                {formatModuleLabel(item.context.moduleKey)}
              </span>
            )}
            <span
              style={{
                fontSize: '0.75rem',
                color: 'var(--colorNeutralForeground3)',
              }}
            >
              {formatDaysInState(item.timestamps.updatedAtIso)}
            </span>
            {item.dueDateIso && (
              <span
                style={{
                  fontSize: '0.75rem',
                  color: item.isOverdue
                    ? 'var(--colorPaletteRedForeground1)'
                    : 'var(--colorNeutralForeground3)',
                  fontWeight: item.isOverdue ? 600 : 400,
                }}
              >
                {formatDueDate(item.dueDateIso)}
              </span>
            )}
          </div>
        )}

        {/* Why this matters — standard tier */}
        {tier !== 'essential' && item.whyThisMatters && (
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--colorNeutralForeground3)',
              lineHeight: '1.4',
            }}
          >
            {item.whyThisMatters}
          </span>
        )}

        {/* Expected action + reasoning popover — expert tier */}
        {tier === 'expert' && (
          <>
            {item.expectedAction && (
              <span
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--colorNeutralForeground2)',
                  lineHeight: '1.4',
                }}
              >
                {item.expectedAction}
              </span>
            )}
            <HbcPopover
              trigger={
                <button
                  type="button"
                  aria-label="View ranking reason"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    border: '1px solid var(--colorNeutralStroke1)',
                    backgroundColor: 'transparent',
                    color: 'var(--colorNeutralForeground3)',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    lineHeight: 1,
                  }}
                >
                  ?
                </button>
              }
            >
              <div style={{ padding: '8px', maxWidth: '280px' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--colorNeutralForeground1)',
                    lineHeight: '1.4',
                  }}
                >
                  {item.rankingReason.primaryReason}
                </span>
              </div>
            </HbcPopover>
          </>
        )}
      </div>

      {/* Actions — right-aligned, ghost variant keeps title as primary target */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          flexShrink: 0,
          alignSelf: 'flex-start',
        }}
      >
        {primaryAction && (
          <HbcButton
            variant="ghost"
            size="sm"
            onClick={() => onAction?.({ actionKey: primaryAction.key, item })}
          >
            {primaryAction.label}
          </HbcButton>
        )}
        {tier !== 'essential' && (
          <>
            {item.availableActions.find((a) => a.key === 'mark-read') && (
              <HbcButton
                variant="ghost"
                size="sm"
                onClick={() => onAction?.({ actionKey: 'mark-read', item })}
              >
                Mark read
              </HbcButton>
            )}
            {item.availableActions.find((a) => a.key === 'defer') && (
              <HbcButton
                variant="ghost"
                size="sm"
                onClick={() => onAction?.({ actionKey: 'defer', item })}
              >
                Defer
              </HbcButton>
            )}
          </>
        )}
      </div>
    </div>
  );
}
