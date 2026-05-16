import { useId, useState } from 'react';
import {
  MY_PROJECT_ASSIGNMENT_ROLE_BY_ID,
  type MyProjectAssignmentRoleId,
  type MyProjectLinkItem,
} from '@hbc/models/myWork';
import styles from './ProjectPortfolioTile.module.css';

export interface ProjectPortfolioTileProps {
  readonly row: MyProjectLinkItem;
}

function rowHasProcoreInvalidWarning(row: MyProjectLinkItem): boolean {
  return row.warnings.some((warning) => warning.code === 'procore-project-invalid');
}

function sortedRoleLabels(
  roles: readonly MyProjectAssignmentRoleId[],
): readonly string[] {
  return roles
    .map((roleId) => MY_PROJECT_ASSIGNMENT_ROLE_BY_ID[roleId])
    .slice()
    .sort((a, b) => a.priority - b.priority)
    .map((definition) => definition.displayLabel);
}

function TileActionSlot({
  area,
  row,
}: {
  readonly area: 'sharepoint' | 'procore';
  readonly row: MyProjectLinkItem;
}) {
  if (area === 'sharepoint') {
    const action = row.sharePointAction;
    if (action.state === 'available' && action.href) {
      return (
        <a
          href={action.href}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.actionLink}
          data-my-projects-action-slot="sharepoint"
          data-my-projects-action-state="available"
        >
          {action.label}
        </a>
      );
    }
    return (
      <span
        className={styles.actionUnavailable}
        data-my-projects-action-slot="sharepoint"
        data-my-projects-action-state="unavailable"
        aria-label="SharePoint unavailable for this project."
      >
        SharePoint unavailable
      </span>
    );
  }

  const action = row.procoreAction;
  if (action.state === 'available' && action.href) {
    return (
      <a
        href={action.href}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.actionLink}
        data-my-projects-action-slot="procore"
        data-my-projects-action-state="available"
      >
        Open Procore
      </a>
    );
  }

  const invalidToken = rowHasProcoreInvalidWarning(row);
  const unavailableReason = invalidToken
    ? 'Procore unavailable due to invalid project token.'
    : 'Procore unavailable for this project.';
  return (
    <span
      className={styles.actionUnavailable}
      data-my-projects-action-slot="procore"
      data-my-projects-action-state="unavailable"
      aria-label={unavailableReason}
    >
      Procore unavailable
    </span>
  );
}

export function ProjectPortfolioTile({ row }: ProjectPortfolioTileProps) {
  const launchRegionId = useId();
  const roleOverflowId = useId();
  const [launchOpen, setLaunchOpen] = useState(false);
  const [roleOverflowOpen, setRoleOverflowOpen] = useState(false);

  const labels = sortedRoleLabels(row.assignmentRoles);
  const primaryRoleLabel = labels[0];
  const overflowLabels = labels.slice(1);

  return (
    <article
      className={styles.tile}
      data-my-projects-tile={row.recordKey}
      data-my-projects-tile-source={row.source}
    >
      <div className={styles.identity} data-my-projects-identity="">
        <p className={styles.projectName} data-my-projects-project-name="">
          {row.projectName}
        </p>
        <p className={styles.projectNumber} data-my-projects-project-number="">
          {row.projectNumber}
        </p>
      </div>

      <div className={styles.meta}>
        {row.projectStage ? (
          <p className={styles.projectStage} data-my-projects-project-stage="">
            {row.projectStage}
          </p>
        ) : null}
        <button
          type="button"
          className={styles.openTrigger}
          aria-expanded={launchOpen ? 'true' : 'false'}
          aria-controls={launchRegionId}
          onClick={() => setLaunchOpen((current) => !current)}
          data-my-projects-launch-trigger=""
        >
          Open
        </button>
      </div>

      {primaryRoleLabel ? (
        <div className={styles.roleRow}>
          <span className={styles.primaryRole} data-my-projects-primary-role="">
            {primaryRoleLabel}
          </span>
          {overflowLabels.length > 0 ? (
            <>
              <button
                type="button"
                className={styles.roleOverflow}
                aria-expanded={roleOverflowOpen ? 'true' : 'false'}
                aria-controls={roleOverflowId}
                onClick={() => setRoleOverflowOpen((current) => !current)}
                data-my-projects-role-overflow=""
              >
                +{overflowLabels.length}
              </button>
              <div
                id={roleOverflowId}
                hidden={!roleOverflowOpen}
                className={styles.roleOverflowDetails}
                data-my-projects-role-overflow-details=""
              >
                {overflowLabels.join(', ')}
              </div>
            </>
          ) : null}
        </div>
      ) : null}

      <div
        id={launchRegionId}
        className={styles.launchGroup}
        data-my-projects-launch-group=""
        hidden={!launchOpen}
      >
        <TileActionSlot area="sharepoint" row={row} />
        <TileActionSlot area="procore" row={row} />
      </div>
    </article>
  );
}

export default ProjectPortfolioTile;
