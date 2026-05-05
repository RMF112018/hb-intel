import type { FC } from 'react';
import type { TeamAccessExecutionStatus, TeamAccessManagerPersona } from '@hbc/models/pcc';
import { PccStatusPill, type PccStatusPillTone } from '../../ui/PccStatusPill';
import { EXECUTION_STATUS_LABELS, NO_PERMISSION_CHANGE_NOTICE } from './teamAccessAdapter';
import styles from './PccTeamAccessSurface.module.css';

export const LANE_EXECUTION_STATUS_TONES: Readonly<
  Record<TeamAccessExecutionStatus, PccStatusPillTone>
> = {
  'preview-only': 'neutral',
  'manual-it-handled': 'warning',
  'backend-gated-later': 'info',
};

export interface PccExecutionStatusPanelProps {
  readonly executionStatus: TeamAccessExecutionStatus;
  readonly executionStatusLabel: string;
  readonly managerPersonas: readonly TeamAccessManagerPersona[];
  readonly auditPreviewLabel: string;
}

export const PccExecutionStatusPanel: FC<PccExecutionStatusPanelProps> = ({
  executionStatus,
  executionStatusLabel,
  managerPersonas,
  auditPreviewLabel,
}) => {
  const tone = LANE_EXECUTION_STATUS_TONES[executionStatus];
  const canonicalLabel = EXECUTION_STATUS_LABELS[executionStatus];

  return (
    <div className={styles.executionStatusPanel} data-pcc-execution-status-panel="preview">
      <div className={styles.metaRow} data-pcc-execution-status-panel-banner="">
        <PccStatusPill tone="info">Reference</PccStatusPill>
      </div>

      <div
        className={styles.metaRow}
        data-pcc-execution-status={executionStatus}
        data-pcc-execution-status-tone={tone}
        data-pcc-execution-status-label={canonicalLabel}
      >
        <PccStatusPill tone={tone}>{canonicalLabel}</PccStatusPill>
        <span>Lane execution status: {canonicalLabel}</span>
      </div>

      <div className={styles.metaRow} data-pcc-execution-status-fixture-label="">
        Fixture status label: {executionStatusLabel}
      </div>

      <div
        className={styles.managerPersonaChips}
        data-pcc-manager-personas={managerPersonas.length}
      >
        <span className={styles.metaRow}>Access manager personas:</span>
        <div className={styles.tags}>
          {managerPersonas.map((persona) => (
            <span key={persona} className={styles.chip} data-pcc-manager-persona={persona}>
              {persona}
            </span>
          ))}
        </div>
      </div>

      <p className={styles.auditPreviewLine} data-pcc-audit-preview-label="">
        {auditPreviewLabel}
      </p>

      <p className={styles.noPermissionChangeNotice} data-pcc-no-permission-change-notice="">
        {NO_PERMISSION_CHANGE_NOTICE}
      </p>
    </div>
  );
};

export default PccExecutionStatusPanel;
