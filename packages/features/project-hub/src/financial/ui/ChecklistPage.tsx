/**
 * ChecklistPage — Forecast Checklist tool workspace.
 *
 * Route: /project-hub/:projectId/financial/checklist
 * Wave 3D.2: facade-wired with version-aware posture, gate status,
 * worksheet-aligned group labels, and immutable state handling.
 */

import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import { Text, HbcStatusBadge, HbcCard, HbcButton, HBC_SPACE_SM, HBC_SPACE_MD, HBC_SPACE_XS, HBC_STATUS_COLORS } from '@hbc/ui-kit';
import { useChecklistSurface } from '../hooks/useChecklistSurface.js';
import type { FinancialViewerRole, FinancialComplexityTier } from '../hooks/useFinancialControlCenter.js';

const useStyles = makeStyles({
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: `${HBC_SPACE_MD}px`,
    paddingBottom: `${HBC_SPACE_MD}px`,
    paddingLeft: `${HBC_SPACE_MD}px`,
    paddingRight: `${HBC_SPACE_MD}px`,
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--colorNeutralStroke1)',
  },
  headerMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
  },
  gateBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
    paddingTop: `${HBC_SPACE_SM}px`,
    paddingBottom: `${HBC_SPACE_SM}px`,
    paddingLeft: `${HBC_SPACE_MD}px`,
    paddingRight: `${HBC_SPACE_MD}px`,
  },
  gatePass: {
    backgroundColor: HBC_STATUS_COLORS.success + '18',
    borderBottomWidth: '2px',
    borderBottomStyle: 'solid',
    borderBottomColor: HBC_STATUS_COLORS.success,
  },
  gateFail: {
    backgroundColor: HBC_STATUS_COLORS.warning + '18',
    borderBottomWidth: '2px',
    borderBottomStyle: 'solid',
    borderBottomColor: HBC_STATUS_COLORS.warning,
  },
  immutableBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
    paddingTop: `${HBC_SPACE_SM}px`,
    paddingBottom: `${HBC_SPACE_SM}px`,
    paddingLeft: `${HBC_SPACE_MD}px`,
    paddingRight: `${HBC_SPACE_MD}px`,
    backgroundColor: 'var(--colorNeutralBackground3)',
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--colorNeutralStroke2)',
  },
  groupSection: {
    paddingTop: `${HBC_SPACE_MD}px`,
    paddingBottom: `${HBC_SPACE_MD}px`,
    paddingLeft: `${HBC_SPACE_MD}px`,
    paddingRight: `${HBC_SPACE_MD}px`,
  },
  itemRow: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
    paddingTop: `${HBC_SPACE_XS}px`,
    paddingBottom: `${HBC_SPACE_XS}px`,
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--colorNeutralStroke2)',
  },
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

export function ChecklistPage({ projectId: _projectId, viewerRole, complexityTier, onBack }: ChecklistPageProps): ReactNode {
  const styles = useStyles();
  const data = useChecklistSurface({ viewerRole, complexityTier });

  return (
    <>
      {/* Header with version context */}
      <div className={styles.header} data-testid="checklist-header">
        <div>
          <Text size={400} weight="semibold">Forecast Checklist</Text>
          <div className={styles.headerMeta}>
            <Text size={200}>
              {data.gate.requiredCompleted} of {data.gate.requiredTotal} required items complete
            </Text>
            <HbcStatusBadge
              variant={data.isEditable ? 'info' : 'neutral'}
              label={data.isEditable ? `Working V${data.versionNumber ?? '?'}` : data.versionState === 'ConfirmedInternal' ? 'Confirmed — Read-Only' : 'Read-Only'}
              size="small"
            />
            <Text size={100} style={{ opacity: 0.6 }}>{data.reportingMonth}</Text>
          </div>
        </div>
        <div style={{ display: 'flex', gap: `${HBC_SPACE_SM}px`, alignItems: 'center' }}>
          <HbcStatusBadge
            variant={data.gate.canConfirm ? 'success' : 'warning'}
            label={data.gate.canConfirm ? 'Ready to Confirm' : 'Not Ready'}
            size="medium"
          />
          {data.canConfirm && (
            <HbcButton size="sm">Confirm Version</HbcButton>
          )}
          {data.canDerive && (
            <HbcButton size="sm" variant="secondary">Derive New Working</HbcButton>
          )}
          {onBack && <HbcButton variant="secondary" onClick={onBack}>Back</HbcButton>}
        </div>
      </div>

      {/* Immutable state banner */}
      {!data.isEditable && (
        <div className={styles.immutableBanner} data-testid="checklist-immutable-banner">
          <HbcStatusBadge variant="neutral" label="This version is immutable — checklist items cannot be changed" size="small" />
        </div>
      )}

      {/* Confirmation gate banner */}
      <div className={`${styles.gateBanner} ${data.gate.canConfirm ? styles.gatePass : styles.gateFail}`} data-testid="checklist-gate-banner">
        <Text size={200} weight="semibold">
          {data.gate.canConfirm
            ? 'Confirmation gate: PASS — all required items complete, no stale budget lines.'
            : `Confirmation gate: BLOCKED — ${data.gate.blockers.join('; ')}.`}
        </Text>
      </div>

      {/* Checklist groups (worksheet-aligned) */}
      {data.groups.map((group) => (
        <div key={group.group} className={styles.groupSection} data-testid={`checklist-group-${group.group}`}>
          <HbcCard>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text size={300} weight="semibold">{group.group}</Text>
              <HbcStatusBadge
                variant={group.requiredCompleted === group.requiredTotal ? 'success' : 'warning'}
                label={`${group.requiredCompleted}/${group.requiredTotal} required`}
                size="small"
              />
            </div>
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
