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
import {
  HbcButton,
  HbcStatusBadge,
  HbcPopover,
  useDensity,
  HBC_DENSITY_TOKENS,
  bodySmall,
  HBC_SPACE_SM,
  HBC_SPACE_MD,
  HBC_STATUS_RAMP_GRAY,
  HBC_STATUS_RAMP_RED,
  HBC_STATUS_RAMP_INFO,
  HBC_ACCENT_ORANGE,
  hbcBrandRamp,
} from '@hbc/ui-kit';
import type { IMyWorkItem } from '../../types/index.js';
import type { IMyWorkActionRequest } from '../../hooks/useMyWorkActions.js';
import { resolveCtaAction } from '../../utils/resolveCtaLabel.js';
import { formatModuleLabel } from '../../utils/formatModuleLabel.js';

export interface IHbcMyWorkListItemProps {
  item: IMyWorkItem;
  onAction?: (request: IMyWorkActionRequest) => void;
  className?: string;
}

// ─── UIF-016: Project color coding ──────────────────────────────────────────
// Deterministic color from hbcBrandRamp categorical stops, assigned by project ID hash.
// Consistent across all surfaces referencing the same project entity.
const PROJECT_COLOR_STOPS = [40, 60, 80, 100, 120, 140] as const;

function resolveProjectColor(projectId: string | undefined): string {
  if (!projectId) return hbcBrandRamp[80];
  let hash = 0;
  for (let i = 0; i < projectId.length; i++) {
    hash = ((hash << 5) - hash + projectId.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(hash) % PROJECT_COLOR_STOPS.length;
  return hbcBrandRamp[PROJECT_COLOR_STOPS[idx]];
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

// ─── Status accent colours (UIF-007) ────────────────────────────────────────
// Canonical tokens from @hbc/ui-kit ensure semantic color separation:
//   blocked → HBC_STATUS_RAMP_RED[50] (error red, distinct from amber warning)
//   unread  → HBC_ACCENT_ORANGE (CTA orange, distinct from both)
const ACCENT_BLOCKED = HBC_STATUS_RAMP_RED[50];

// ─── Lane-based urgency helpers ─────────────────────────────────────────────

/**
 * Returns the left-border accent for an item based on status priority:
 *   blocked  → error red (highest urgency)
 *   unread   → brand orange
 *   other    → no accent
 */
function resolveAccentBorder(item: IMyWorkItem): string | undefined {
  if (item.isBlocked) return `3px solid ${ACCENT_BLOCKED}`;
  if (item.isUnread) return `3px solid ${HBC_ACCENT_ORANGE}`;
  return undefined;
}

/**
 * Left padding accounts for the 3px accent stripe so content never shifts
 * regardless of whether an accent is present. UIF-006: uses HBC_SPACE_MD.
 */
const LEFT_PADDING_WITH_ACCENT = `${HBC_SPACE_MD - 3}px`; // 3px stripe + (16-3)px content gap
const LEFT_PADDING_NO_ACCENT = `${HBC_SPACE_MD}px`;        // same total width, no stripe

/**
 * UIF-003: Title link color uses brand blue ramp from HBC_STATUS_RAMP_INFO.
 * `watch`-lane items use a darker shade (30) for lower visual urgency.
 * Non-link titles (no href) use neutral foreground.
 */
function resolveTitleLinkColor(item: IMyWorkItem): string {
  if (item.lane === 'watch' && !item.isUnread && !item.isBlocked) {
    return HBC_STATUS_RAMP_INFO[30]; // Muted brand blue for watch lane
  }
  return HBC_STATUS_RAMP_INFO[50]; // Brand blue, readable on dark surfaces
}

function resolveTitleSpanColor(item: IMyWorkItem): string {
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
  const { tier: densityTier } = useDensity();
  const densityTokens = HBC_DENSITY_TOKENS[densityTier];
  // UIF-009: WCAG 2.5.5 hard minimum 44px; density tier may require more.
  // HbcButton handles touch auto-scaling via useTouchSize (sm→lg on coarse pointer).
  // Raw <button> elements use touchMin directly.
  const touchMin = Math.max(densityTokens.touchTargetMin, 44);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  const primaryAction = item.availableActions[0];
  // UIF-007: Resolve CTA label + variant once; used in the primary action button.
  const primaryCta = resolveCtaAction(item);
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
        // UIF-006: Density-aware row sizing via HBC_DENSITY_TOKENS
        minHeight: `${densityTokens.rowHeightMin}px`,
        padding: `${HBC_SPACE_SM}px ${HBC_SPACE_MD}px ${HBC_SPACE_SM}px ${hasAccent ? LEFT_PADDING_WITH_ACCENT : LEFT_PADDING_NO_ACCENT}`,
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
        {/* Title — UIF-003: brand blue for links, neutral for non-links */}
        {item.context.href ? (
          <a
            href={item.context.href}
            style={{
              display: 'block',
              color: resolveTitleLinkColor(item),
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
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
              color: resolveTitleSpanColor(item),
              fontSize: '0.875rem',
              fontWeight: 500,
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
          {item.isBlocked && <HbcStatusBadge variant="error" label="Blocked" />}
        </div>

        {/* Metadata row — module label, days in state, due date (UIF-006)
            Typography: bodySmall token. Color: HBC_STATUS_RAMP_GRAY[50] (#8B95A5). */}
        {tier !== 'essential' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: `${HBC_SPACE_SM}px`,
              flexWrap: 'wrap',
            }}
          >
            {/* UIF-016: Project color dot + name */}
            {item.context.projectName && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: resolveProjectColor(item.context.projectId),
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: bodySmall.fontSize, fontWeight: bodySmall.fontWeight, lineHeight: bodySmall.lineHeight, color: HBC_STATUS_RAMP_GRAY[50] }}>
                  {item.context.projectName}
                </span>
              </span>
            )}
            {/* UIF-006: Module label as neutral chip — no raw kebab keys exposed */}
            {item.context.moduleKey && (
              <span
                style={{
                  display: 'inline-block',
                  fontSize: '0.6875rem',
                  fontWeight: 500,
                  lineHeight: '1.5',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  backgroundColor: 'var(--colorNeutralBackground4)',
                  color: 'var(--colorNeutralForeground3)',
                  whiteSpace: 'nowrap',
                }}
              >
                {formatModuleLabel(item.context.moduleKey)}
              </span>
            )}
            <span
              style={{
                fontSize: bodySmall.fontSize,
                fontWeight: bodySmall.fontWeight,
                lineHeight: bodySmall.lineHeight,
                color: HBC_STATUS_RAMP_GRAY[50],
              }}
            >
              {formatDaysInState(item.timestamps.updatedAtIso)}
            </span>
            {item.dueDateIso && (
              <span
                style={{
                  fontSize: bodySmall.fontSize,
                  lineHeight: bodySmall.lineHeight,
                  color: item.isOverdue
                    ? 'var(--colorPaletteRedForeground1)'
                    : HBC_STATUS_RAMP_GRAY[50],
                  fontWeight: item.isOverdue ? 600 : bodySmall.fontWeight,
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
              fontSize: bodySmall.fontSize,
              fontWeight: bodySmall.fontWeight,
              lineHeight: bodySmall.lineHeight,
              color: HBC_STATUS_RAMP_GRAY[50],
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
                  fontSize: bodySmall.fontSize,
                  fontWeight: bodySmall.fontWeight,
                  lineHeight: bodySmall.lineHeight,
                  color: 'var(--colorNeutralForeground2)',
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
                    // UIF-009: Touch target minimum per density tier (WCAG 2.5.5)
                    width: `${touchMin}px`,
                    height: `${touchMin}px`,
                    borderRadius: '50%',
                    border: '1px solid var(--colorNeutralStroke1)',
                    backgroundColor: 'transparent',
                    color: 'var(--colorNeutralForeground3)',
                    fontSize: `${densityTokens.labelTextMinPx}px`,
                    fontWeight: 700,
                    cursor: 'pointer',
                    lineHeight: 1,
                  }}
                >
                  ?
                </button>
              }
            >
              <div style={{ padding: `${HBC_SPACE_SM}px`, maxWidth: '280px' }}>
                <span
                  style={{
                    fontSize: bodySmall.fontSize,
                    lineHeight: bodySmall.lineHeight,
                    color: 'var(--colorNeutralForeground1)',
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
          // UIF-009: Density-aware tap spacing between interactive elements
          gap: `${densityTokens.tapSpacingMin}px`,
          flexShrink: 0,
          alignSelf: 'flex-start',
        }}
      >
        {primaryAction && (
          // UIF-007: variant + label from resolveCtaAction — differentiated by lane/status.
          // UIF-009-addl: size="md" (36px) meets Compact minimum; touch auto-scales to 44px.
          <HbcButton
            variant={primaryCta.variant}
            size="md"
            onClick={() => onAction?.({ actionKey: primaryAction.key, item })}
          >
            {primaryCta.label}
          </HbcButton>
        )}
        {tier !== 'essential' && (
          <>
            {item.availableActions.find((a) => a.key === 'mark-read') && (
              <HbcButton
                variant="ghost"
                size="md"
                onClick={() => onAction?.({ actionKey: 'mark-read', item })}
              >
                Mark read
              </HbcButton>
            )}
            {item.availableActions.find((a) => a.key === 'defer') && (
              <HbcButton
                variant="ghost"
                size="md"
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
