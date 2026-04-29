import type { FC } from 'react';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccStatusPill } from '../../ui/PccStatusPill';
import { PccPreviewState } from '../../ui/PccPreviewState';
import type { TeamAccessPreviewModel } from './shared';
import styles from './PccTeamAccessSurface.module.css';

export interface PccAccessManagerLaneCardProps {
  model: TeamAccessPreviewModel;
}

export const PccAccessManagerLaneCard: FC<PccAccessManagerLaneCardProps> = ({ model }) => {
  const lane = model.accessManagerLane;

  return (
    <PccDashboardCard footprint="full" eyebrow="Access Manager Lane" title="Assignment + Approval Preview">
      <div className={styles.body} data-pcc-team-access-lane="access-manager">
        <p className={styles.previewCue}>
          Access manager lifecycle preview only. No people lookup, no group mutation, and no backend/API
          execution.
        </p>

        <div className={styles.metaRow}>
          <button type="button" disabled className={styles.disabledAction}>
            Add/search user (preview-only)
          </button>
          <button type="button" disabled className={styles.disabledAction}>
            Submit assignment change (preview-only)
          </button>
          <button type="button" disabled className={styles.disabledAction}>
            Approve/reject/comment (preview-only)
          </button>
        </div>
        <PccPreviewState
          state="not-yet-implemented-operation"
          title="Access manager operations are deferred"
          description="Execution remains manual/IT-handled or backend-gated later; no Wave 2 runtime action path exists."
        />

        <div className={styles.metaRow}>
          <PccStatusPill tone="info">Execution status: {lane.executionStatus}</PccStatusPill>
          <PccStatusPill tone="warning">{lane.executionStatusLabel}</PccStatusPill>
        </div>

        <div className={styles.metaRow}>Access manager personas: {lane.managerPersonas.join(', ')}</div>
        <div className={styles.metaRow}>Permission template selector preview:</div>
        {lane.permissionTemplateOptions.length === 0 ? (
          <PccPreviewState state="unavailable-fixture" />
        ) : (
          <div className={styles.tags}>
            {lane.permissionTemplateOptions.map((template) => (
              <span key={template} className={styles.chip}>
                {template}
              </span>
            ))}
          </div>
        )}

        <div className={styles.metaRow}>Audit preview: {lane.auditPreviewLabel}</div>
      </div>
    </PccDashboardCard>
  );
};

export default PccAccessManagerLaneCard;
