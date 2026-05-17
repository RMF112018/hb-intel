import { useId, useState } from 'react';
import {
  MY_PROJECT_ASSIGNMENT_ROLE_BY_ID,
  type MyProjectAssignmentRoleId,
  type MyProjectLinkItem,
} from '@hbc/models/myWork';
import { useMyWorkBentoContext } from '../../layout/MyWorkBentoGrid.js';
import { ProjectLaunchActions, hasAvailableLaunchActions } from './ProjectLaunchActions.js';
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
  const { mode } = useMyWorkBentoContext();
  const roleOverflowId = useId();
  const [roleOverflowOpen, setRoleOverflowOpen] = useState(false);

  const labels = sortedRoleLabels(row.assignmentRoles);
  const primaryRoleLabel = labels[0];
  const overflowLabels = labels.slice(1);
  const hasLaunchActions = hasAvailableLaunchActions(row);
  const isPhone = mode === 'phone';
  const tileLayout = !isPhone && hasLaunchActions ? 'content-rail' : 'content-only';

  return (
    <article
      className={styles.tile}
      data-my-projects-tile={row.recordKey}
      data-my-projects-tile-source={row.source}
      data-my-projects-tile-layout={tileLayout}
    >
      <div className={styles.contentColumn}>
        <div className={styles.identity} data-my-projects-identity="">
          <p className={styles.projectName} data-my-projects-project-name="">
            {row.projectName}
          </p>
          <span
            className={styles.projectNameAccent}
            data-my-projects-project-name-accent=""
            aria-hidden="true"
          />
          <p className={styles.projectNumber} data-my-projects-project-number="">
            {row.projectNumber}
          </p>
        </div>

        <div className={styles.meta} data-my-projects-meta-row="">
          {row.projectStage ? (
            <p className={styles.projectStage} data-my-projects-project-stage="">
              {row.projectStage}
            </p>
          ) : null}
          {primaryRoleLabel ? (
            <span className={styles.primaryRole} data-my-projects-primary-role="">
              {primaryRoleLabel}
            </span>
          ) : null}
          {primaryRoleLabel && overflowLabels.length > 0 ? (
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
          ) : null}
        </div>

        {primaryRoleLabel && overflowLabels.length > 0 ? (
          <div
            id={roleOverflowId}
            hidden={!roleOverflowOpen}
            className={styles.roleOverflowDetails}
            data-my-projects-role-overflow-details=""
          >
            {overflowLabels.join(', ')}
          </div>
        ) : null}
      </div>

      {hasLaunchActions ? (
        <div className={styles.launchRail} data-my-projects-tile-actions="">
          <ProjectLaunchActions
            row={row}
            isActionOverlayOpen={isOpen}
            onActionOverlayOpenChange={onOpenChange}
          />
        </div>
      ) : null}
    </article>
  );
}

export default ProjectPortfolioTile;
