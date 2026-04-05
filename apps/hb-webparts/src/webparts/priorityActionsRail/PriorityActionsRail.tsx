/**
 * PriorityActionsRail — Premium command surface for urgent actions
 * Phase 15-05 — Command and utility surface overhaul
 *
 * Actions are no longer equal-weight list rows. Critical and warning
 * items get featured treatment with larger icon frames, stronger visual
 * weight, and urgency-aware backgrounds. Standard items remain compact
 * but purposeful.
 */
import * as React from 'react';
import { HbcHomepageSurfaceCard, HbcHomepageActionRow, HbcHomepageIconFrame, HbcStatusBadge } from '@hbc/ui-kit/homepage';
import { resolveAuthoringMessage } from '../../homepage/helpers/authoringGovernance.js';
import { normalizePriorityActionsRailConfig } from '../../homepage/helpers/utilityConfig.js';
import { HomepageEmptyState } from '../../homepage/shared/HomepageEmptyState.js';
import { HomepageLoadingState } from '../../homepage/shared/HomepageLoadingState.js';
import { HomepageRailShell } from '../../homepage/shared/HomepageRailShell.js';
import { HomepageUtilityDenseGroup } from '../../homepage/shared/HomepageUtilityDenseGroup.js';
import type { PriorityActionsRailConfig } from '../../homepage/webparts/utilityContracts.js';
import type { NormalizedPriorityActionItem } from '../../homepage/helpers/utilityConfig.js';
import type { UtilityBadgeVariant } from '../../homepage/webparts/utilityContracts.js';
import { hpHeadingReset, hpZoneFlexLayout, HP_SPACE } from '../../homepage/tokens.js';
import interactiveStyles from '../../homepage/homepage-interactive.module.css';

export interface PriorityActionsRailProps {
  config?: Partial<PriorityActionsRailConfig>;
  activeAudience?: string;
  isLoading?: boolean;
}

// ── Urgency resolution ───────────────────────────────────────────────

type IconTint = 'brand' | 'neutral' | 'subtle' | 'accent';

interface UrgencyResolution {
  tint: IconTint;
  indicator: string;
  featured: boolean;
}

const URGENCY_MAP: Record<string, UrgencyResolution> = {
  critical: { tint: 'accent', indicator: '!', featured: true },
  warning: { tint: 'accent', indicator: '!', featured: true },
  error: { tint: 'accent', indicator: '!', featured: true },
  atRisk: { tint: 'accent', indicator: '!', featured: true },
  success: { tint: 'brand', indicator: '\u2713', featured: false },
  completed: { tint: 'brand', indicator: '\u2713', featured: false },
  onTrack: { tint: 'brand', indicator: '\u2713', featured: false },
};

const DEFAULT_URGENCY: UrgencyResolution = { tint: 'neutral', indicator: '\u203A', featured: false };

function resolveUrgency(variant: UtilityBadgeVariant | undefined): UrgencyResolution {
  if (!variant) return DEFAULT_URGENCY;
  return URGENCY_MAP[variant] ?? DEFAULT_URGENCY;
}

function isUrgentVariant(variant: UtilityBadgeVariant | undefined): boolean {
  return variant === 'critical' || variant === 'warning';
}

function groupHasUrgency(actions: NormalizedPriorityActionItem[]): boolean {
  return actions.some((a) => isUrgentVariant(a.badge?.variant));
}

// ── Featured action item (urgent/critical) ───────────────────────────

const featuredRowStyle: React.CSSProperties = {
  padding: `${HP_SPACE.md}px ${HP_SPACE.xl}px`,
  background: 'rgba(220, 38, 38, 0.04)',
  borderLeft: '3px solid rgba(220, 38, 38, 0.5)',
  display: 'flex',
  alignItems: 'center',
  gap: HP_SPACE.md,
};

// ── Standard action item ─────────────────────────────────────────────

const standardRowStyle: React.CSSProperties = {
  padding: `${HP_SPACE.sm}px ${HP_SPACE.xl}px`,
  display: 'flex',
  alignItems: 'center',
  gap: HP_SPACE.md,
};

function PriorityActionRowItem({
  action,
}: {
  action: NormalizedPriorityActionItem;
}): React.JSX.Element {
  const urgency = resolveUrgency(action.badge?.variant);
  const isFeatured = urgency.featured;
  const iconSize = isFeatured ? 'lg' : 'sm';
  const rowStyle = isFeatured ? featuredRowStyle : standardRowStyle;
  const containerClass = interactiveStyles.actionRowContainer;

  return (
    <div style={rowStyle} className={containerClass}>
      <div style={{ flexGrow: 1, minWidth: 0 }}>
        <HbcHomepageActionRow
          title={action.title}
          href={action.href}
          description={action.description}
          icon={
            <HbcHomepageIconFrame size={iconSize} tint={urgency.tint}>
              {urgency.indicator}
            </HbcHomepageIconFrame>
          }
          badge={
            action.badge
              ? <HbcStatusBadge label={action.badge.label} variant={action.badge.variant ?? 'info'} />
              : undefined
          }
        />
      </div>
      <span className={interactiveStyles.actionRowArrow} aria-hidden="true">{'\u203A'}</span>
    </div>
  );
}

export function PriorityActionsRail({ config, activeAudience, isLoading = false }: PriorityActionsRailProps): React.JSX.Element {
  if (isLoading) {
    return <HomepageLoadingState label="Loading priority actions" />;
  }

  const normalized = normalizePriorityActionsRailConfig(config, activeAudience);

  if (normalized.groups.length === 0) {
    const hasConfiguredInput = Boolean(config?.actions?.length || config?.groups?.length);
    const message = resolveAuthoringMessage('priorityActionsRail', hasConfiguredInput ? 'invalid' : 'noData');
    return (
      <HomepageEmptyState
        title={message.title}
        description={message.description}
      />
    );
  }

  return (
    <HbcHomepageSurfaceCard surface="utility" header={<h2 style={hpHeadingReset}>{normalized.heading}</h2>}>
      <HomepageRailShell label="priority-actions-rail">
        <div style={hpZoneFlexLayout}>
          {normalized.groups.map((group) => {
            const hasUrgent = groupHasUrgency(group.actions);
            return (
              <HomepageUtilityDenseGroup
                key={group.id}
                title={group.title}
                accent={hasUrgent ? 'urgent' : 'brand'}
              >
                {group.actions.map((action) => (
                  <PriorityActionRowItem
                    key={action.id}
                    action={action}
                  />
                ))}
              </HomepageUtilityDenseGroup>
            );
          })}
        </div>
      </HomepageRailShell>
    </HbcHomepageSurfaceCard>
  );
}
