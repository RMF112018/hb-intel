/**
 * ChecklistPage — Forecast Checklist tool workspace.
 *
 * Route: /project-hub/:projectId/financial/checklist
 * Governance: 19-item checklist with confirmation gate (G1–G4).
 * PM completes items; gate blocks confirmation when required items incomplete.
 */

import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import { Text, HbcStatusBadge, HbcCard, HbcButton, HBC_SPACE_SM, HBC_SPACE_MD, HBC_SPACE_XS, HBC_STATUS_COLORS } from '@hbc/ui-kit';
import { useChecklistSurface } from '../hooks/useChecklistSurface.js';
import type { FinancialViewerRole, FinancialComplexityTier } from '../hooks/useFinancialControlCenter.js';

const useStyles = makeStyles({
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: `${HBC_SPACE_MD}px`, borderBottom: '1px solid var(--colorNeutralStroke1)' },
  gateBanner: { display: 'flex', alignItems: 'center', gap: `${HBC_SPACE_SM}px`, padding: `${HBC_SPACE_SM}px ${HBC_SPACE_MD}px` },
  gatePass: { backgroundColor: HBC_STATUS_COLORS.success + '18', borderBottom: `2px solid ${HBC_STATUS_COLORS.success}` },
  gateFail: { backgroundColor: HBC_STATUS_COLORS.warning + '18', borderBottom: `2px solid ${HBC_STATUS_COLORS.warning}` },
  groupSection: { padding: `${HBC_SPACE_MD}px` },
  itemRow: { display: 'flex', alignItems: 'center', gap: `${HBC_SPACE_SM}px`, padding: `${HBC_SPACE_XS}px 0`, borderBottom: '1px solid var(--colorNeutralStroke2)' },
  completedIcon: { color: HBC_STATUS_COLORS.success, minWidth: '20px' },
  pendingIcon: { color: HBC_STATUS_COLORS.warning, minWidth: '20px' },
  requiredBadge: { fontSize: '10px', color: HBC_STATUS_COLORS.warning },
});

export interface ChecklistPageProps {
  readonly projectId: string;
  readonly viewerRole?: FinancialViewerRole;
  readonly complexityTier?: FinancialComplexityTier;
  readonly onBack?: () => void;
}

export function ChecklistPage({ viewerRole, complexityTier, onBack }: ChecklistPageProps): ReactNode {
  const styles = useStyles();
  const data = useChecklistSurface({ viewerRole, complexityTier });

  return (
    <>
      <div className={styles.header} data-testid="checklist-header">
        <div>
          <Text size={400} weight="semibold">Forecast Checklist</Text>
          <Text size={200} style={{ marginLeft: 8 }}>
            {data.gate.requiredCompleted} of {data.gate.requiredTotal} required items complete
          </Text>
        </div>
        <div style={{ display: 'flex', gap: `${HBC_SPACE_SM}px` }}>
          <HbcStatusBadge variant={data.gate.canConfirm ? 'success' : 'warning'} label={data.gate.canConfirm ? 'Ready to Confirm' : 'Not Ready'} size="medium" />
          {onBack && <HbcButton variant="secondary" onClick={onBack}>Back</HbcButton>}
        </div>
      </div>

      <div className={`${styles.gateBanner} ${data.gate.canConfirm ? styles.gatePass : styles.gateFail}`} data-testid="checklist-gate-banner">
        <Text size={200} weight="semibold">
          {data.gate.canConfirm
            ? 'Confirmation gate: PASS — all required items complete, no stale budget lines.'
            : `Confirmation gate: BLOCKED — ${data.gate.blockers.join('; ')}.`}
        </Text>
      </div>

      {data.groups.map((group) => (
        <div key={group.group} className={styles.groupSection} data-testid={`checklist-group-${group.group}`}>
          <HbcCard>
            <Text size={300} weight="semibold">{group.group}</Text>
            <Text size={200} style={{ marginLeft: 8 }}>
              {group.requiredCompleted}/{group.requiredTotal} required
            </Text>
            {data.items.filter((i) => i.group === group.group).map((item) => (
              <div key={item.id} className={styles.itemRow} data-testid={`checklist-item-${item.id}`}>
                <span className={item.completed ? styles.completedIcon : styles.pendingIcon}>
                  {item.completed ? '✓' : '○'}
                </span>
                <Text size={200}>{item.label}</Text>
                {item.required && !item.completed && (
                  <span className={styles.requiredBadge}>Required</span>
                )}
                {item.completedBy && (
                  <Text size={100} style={{ marginLeft: 'auto', opacity: 0.6 }}>{item.completedBy}</Text>
                )}
              </div>
            ))}
          </HbcCard>
        </div>
      ))}
    </>
  );
}
