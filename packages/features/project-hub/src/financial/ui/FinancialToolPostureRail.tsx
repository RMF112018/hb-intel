/**
 * FinancialToolPostureRail — R2 region.
 *
 * Thin adapter mapping financial tool postures to HbcNavRail generic.
 */

import type { ReactNode } from 'react';
import { HbcNavRail } from '@hbc/ui-kit';
import type { NavRailItem } from '@hbc/ui-kit';

import type { FinancialToolPosture, FinancialToolPostureState } from '../hooks/useFinancialControlCenter.js';

const POSTURE_TO_NAV_STATUS: Record<FinancialToolPostureState, NavRailItem['status']> = {
  healthy: 'healthy',
  watch: 'watch',
  'at-risk': 'at-risk',
  critical: 'critical',
  'no-data': 'no-data',
  blocked: 'critical',
};

function adaptToolsToNavItems(tools: readonly FinancialToolPosture[]): NavRailItem[] {
  return tools.map((tool) => ({
    id: tool.id,
    label: tool.label,
    status: POSTURE_TO_NAV_STATUS[tool.posture],
    issueCount: tool.issueCount,
    actionCount: tool.warningCount,
    sublabel: tool.blocked ? tool.blockReason : undefined,
  }));
}

export interface FinancialToolPostureRailProps {
  readonly tools: readonly FinancialToolPosture[];
  readonly selectedToolId: string | null;
  readonly onSelectTool: (toolId: string | null) => void;
}

export function FinancialToolPostureRail({
  tools,
  selectedToolId,
  onSelectTool,
}: FinancialToolPostureRailProps): ReactNode {
  return (
    <HbcNavRail
      items={adaptToolsToNavItems(tools)}
      selectedItemId={selectedToolId}
      onSelectItem={onSelectTool}
      collapsed={false}
      onToggleCollapse={() => {}}
      title="Financial Tools"
      testId="financial-tool-posture-rail"
    />
  );
}
