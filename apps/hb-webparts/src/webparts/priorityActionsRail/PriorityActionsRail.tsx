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
import { hpHeadingReset, hpZoneFlexLayout } from '../../homepage/tokens.js';
import interactiveStyles from '../../homepage/homepage-interactive.module.css';

export interface PriorityActionsRailProps {
  config?: Partial<PriorityActionsRailConfig>;
  activeAudience?: string;
  isLoading?: boolean;
}

// ── Urgency-aware icon resolution ──────────────────────────────────
// Maps badge variant to icon frame tint and indicator content so the
// action surface communicates priority visually, not just via text.

type UrgencyTint = 'brand' | 'neutral' | 'subtle';

const URGENCY_MAP: Record<string, { tint: UrgencyTint; indicator: string }> = {
  critical: { tint: 'brand', indicator: '!' },
  warning: { tint: 'brand', indicator: '!' },
  error: { tint: 'brand', indicator: '!' },
  atRisk: { tint: 'brand', indicator: '!' },
  success: { tint: 'neutral', indicator: '\u2713' },
  completed: { tint: 'neutral', indicator: '\u2713' },
  onTrack: { tint: 'neutral', indicator: '\u2713' },
};

const DEFAULT_URGENCY = { tint: 'subtle' as UrgencyTint, indicator: '\u203A' };

function resolveUrgency(variant: UtilityBadgeVariant | undefined): { tint: UrgencyTint; indicator: string } {
  if (!variant) return DEFAULT_URGENCY;
  return URGENCY_MAP[variant] ?? DEFAULT_URGENCY;
}

function isUrgentVariant(variant: UtilityBadgeVariant | undefined): boolean {
  return variant === 'critical' || variant === 'warning';
}

// ── Action row composition ─────────────────────────────────────────
// Wraps HbcHomepageActionRow with interactive hover container,
// urgency-aware icon, and directional affordance arrow.

function PriorityActionRowItem({
  action,
  isFirstInUrgentGroup,
}: {
  action: NormalizedPriorityActionItem;
  isFirstInUrgentGroup: boolean;
}): React.JSX.Element {
  const urgency = resolveUrgency(action.badge?.variant);
  const containerClass = isFirstInUrgentGroup
    ? `${interactiveStyles.actionRowContainer} ${interactiveStyles.actionRowUrgent}`
    : interactiveStyles.actionRowContainer;

  return (
    <div className={containerClass}>
      <div style={{ flexGrow: 1, minWidth: 0 }}>
        <HbcHomepageActionRow
          title={action.title}
          href={action.href}
          description={action.description}
          icon={
            <HbcHomepageIconFrame size="sm" tint={urgency.tint}>
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
            const groupHasUrgency = group.actions.some((a) => isUrgentVariant(a.badge?.variant));
            return (
              <HomepageUtilityDenseGroup key={group.id} title={group.title}>
                {group.actions.map((action, idx) => (
                  <PriorityActionRowItem
                    key={action.id}
                    action={action}
                    isFirstInUrgentGroup={groupHasUrgency && idx === 0 && isUrgentVariant(action.badge?.variant)}
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
