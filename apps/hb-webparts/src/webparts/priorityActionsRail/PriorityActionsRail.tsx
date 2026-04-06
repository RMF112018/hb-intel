/**
 * PriorityActionsRail — Premium command surface for urgent actions
 * Phase 17-04 — Structural rebuild with P17 surface family
 *
 * Rebuilt on HbcCommandSurface with urgency-aware variants, lucide
 * icons for action classification, and HbcPremiumBadge for status.
 * Replaces the old composition shells (HomepageRailShell,
 * HomepageUtilityDenseGroup) with the dedicated command surface.
 */
import * as React from 'react';
import {
  HbcCommandSurface,
  HbcPremiumBadge,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Briefcase,
  type LucideIcon,
  type CommandItem,
  type CommandUrgency,
} from '@hbc/ui-kit/homepage';
import { resolveAuthoringMessage } from '../../homepage/helpers/authoringGovernance.js';
import { normalizePriorityActionsRailConfig } from '../../homepage/helpers/utilityConfig.js';
import { HomepageEmptyState } from '../../homepage/shared/HomepageEmptyState.js';
import { HomepageLoadingState } from '../../homepage/shared/HomepageLoadingState.js';
import type { PriorityActionsRailConfig } from '../../homepage/webparts/utilityContracts.js';
import type { NormalizedPriorityActionItem } from '../../homepage/helpers/utilityConfig.js';
import type { UtilityBadgeVariant } from '../../homepage/webparts/utilityContracts.js';

export interface PriorityActionsRailProps {
  config?: Partial<PriorityActionsRailConfig>;
  activeAudience?: string;
  isLoading?: boolean;
}

// ── Urgency resolution ───────────────────────────────────────────────

const URGENCY_ICON_MAP: Record<string, LucideIcon> = {
  critical: AlertCircle,
  warning: AlertTriangle,
  error: AlertCircle,
  atRisk: AlertTriangle,
  success: CheckCircle2,
  completed: CheckCircle2,
  onTrack: CheckCircle2,
};

function resolveActionIcon(variant: UtilityBadgeVariant | undefined): LucideIcon {
  if (!variant) return ArrowRight;
  return URGENCY_ICON_MAP[variant] ?? ArrowRight;
}

function resolveGroupUrgency(actions: NormalizedPriorityActionItem[]): CommandUrgency {
  if (actions.some((a) => a.badge?.variant === 'critical')) return 'critical';
  if (actions.some((a) => a.badge?.variant === 'warning')) return 'high';
  return 'default';
}

export function PriorityActionsRail({ config, activeAudience, isLoading = false }: PriorityActionsRailProps): React.JSX.Element {
  if (isLoading) {
    return <HomepageLoadingState label="Loading priority actions" />;
  }

  const normalized = normalizePriorityActionsRailConfig(config, activeAudience);

  if (normalized.groups.length === 0) {
    const hasConfiguredInput = Boolean(config?.actions?.length || config?.groups?.length);
    const message = resolveAuthoringMessage('priorityActionsRail', hasConfiguredInput ? 'invalid' : 'noData');
    return <HomepageEmptyState title={message.title} description={message.description} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {normalized.groups.map((group) => {
        const urgency = resolveGroupUrgency(group.actions);
        const items: CommandItem[] = group.actions.map((action) => ({
          id: action.id,
          title: action.title,
          description: action.description,
          icon: resolveActionIcon(action.badge?.variant),
          href: action.href,
          badge: action.badge
            ? <HbcPremiumBadge label={action.badge.label} status={action.badge.variant ?? 'info'} size="sm" />
            : undefined,
        }));

        return (
          <HbcCommandSurface
            key={group.id}
            title={group.title}
            icon={Briefcase}
            urgency={urgency}
            items={items}
          />
        );
      })}
    </div>
  );
}
