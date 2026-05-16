import { useId, useState } from 'react';
import {
  MY_PROJECT_ASSIGNMENT_ROLE_BY_ID,
  type MyProjectAssignmentRoleId,
  type MyProjectLinkItem,
} from '@hbc/models/myWork';
import { ProjectLaunchActions } from './ProjectLaunchActions.js';
import styles from './ProjectPortfolioTile.module.css';

export interface ProjectPortfolioTileProps {
  readonly row: MyProjectLinkItem;
  readonly isOpen: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

function sortedRoleLabels(roles: readonly MyProjectAssignmentRoleId[]): readonly string[] {
  return roles
    .map((roleId) => MY_PROJECT_ASSIGNMENT_ROLE_BY_ID[roleId])
    .slice()
    .sort((a, b) => a.priority - b.priority)
    .map((definition) => definition.displayLabel);
}

export function ProjectPortfolioTile({ row, isOpen, onOpenChange }: ProjectPortfolioTileProps) {
  const roleOverflowId = useId();
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
        <ProjectLaunchActions row={row} isDrawerOpen={isOpen} onDrawerOpenChange={onOpenChange} />
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
    </article>
  );
}

export default ProjectPortfolioTile;
