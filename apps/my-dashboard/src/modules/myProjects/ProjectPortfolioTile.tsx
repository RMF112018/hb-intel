import { useId, useRef, useState } from 'react';
import {
  MY_PROJECT_ASSIGNMENT_ROLE_BY_ID,
  type MyProjectAssignmentRoleId,
  type MyProjectLinkItem,
} from '@hbc/models/myWork';
import { useMyWorkBentoContext } from '../../layout/MyWorkBentoGrid.js';
import { ProjectLaunchActions } from './ProjectLaunchActions.js';
import { buildMyProjectLaunchPresentation } from './myProjectLaunchPresentation.js';
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
  const launchOverflowPanelId = useId();
  const moreResourcesTriggerRef = useRef<HTMLButtonElement | null>(null);
  const [roleOverflowOpen, setRoleOverflowOpen] = useState(false);

  const labels = sortedRoleLabels(row.assignmentRoles);
  const primaryRoleLabel = labels[0];
  const overflowLabels = labels.slice(1);
  const launchPresentation = buildMyProjectLaunchPresentation(row);
  const hasLaunchActions = launchPresentation.hasAvailableLaunchActions;
  const isPhone = mode === 'phone';
  const tileLayout = !isPhone && hasLaunchActions ? 'content-rail' : 'content-only';

  return (
    <article
      className={styles.tile}
      data-my-projects-tile={row.recordKey}
      data-my-projects-tile-source={row.source}
      data-my-projects-tile-layout={tileLayout}
      onKeyDown={(event) => {
        if (event.key !== 'Escape') return;
        if (!isOpen) return;
        onOpenChange(false);
        moreResourcesTriggerRef.current?.focus();
      }}
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
            presentation={launchPresentation}
            projectName={row.projectName}
            isLaunchOptionsOpen={isOpen}
            onLaunchOptionsOpenChange={onOpenChange}
            moreResourcesPanelId={launchOverflowPanelId}
            onMoreResourcesTriggerReady={(node) => {
              moreResourcesTriggerRef.current = node;
            }}
          />
        </div>
      ) : null}

      {!isPhone && launchPresentation.overflowOptions.length > 0 ? (
        <div
          id={launchOverflowPanelId}
          className={styles.moreResourcesPanel}
          hidden={!isOpen}
          data-my-projects-more-resources-panel=""
          data-my-projects-more-resources-state={isOpen ? 'open' : 'closed'}
        >
          {launchPresentation.overflowOptions.map((option) => (
            <a
              key={option.key}
              className={styles.moreResourceOption}
              href={option.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={option.ariaLabel}
              data-my-projects-more-resource-option={option.key}
              data-my-projects-launch-option-state="available"
              onClick={() => onOpenChange(false)}
            >
              {option.label}
            </a>
          ))}
        </div>
      ) : null}
    </article>
  );
}

export default ProjectPortfolioTile;
