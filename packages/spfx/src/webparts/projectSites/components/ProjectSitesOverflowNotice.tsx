/**
 * Truthful overflow banner for All-Projects retrieval.
 *
 * Rendered only when the repository signals `bounded === true` — meaning
 * the defense-in-depth ceiling halted the fetch before exhausting the
 * eligible Projects-list dataset. The banner explains exactly what
 * happened, names the actual count and ceiling, and avoids the previous
 * silent-truncation behavior.
 *
 * Premium stack: lucide AlertTriangle icon, semantic role="status" so
 * screen readers announce the limit without interrupting the user.
 */
import React, { type FC } from 'react';
import { AlertTriangle } from 'lucide-react';
import { makeStyles, shorthands } from '@griffel/react';
import {
  HBC_SURFACE_LIGHT,
  HBC_STATUS_COLORS,
  HBC_STATUS_RAMP_AMBER,
  HBC_RADIUS_MD,
  HBC_SPACE_SM,
  HBC_SPACE_MD,
  HBC_SPACE_LG,
  bodySmall,
  label as labelType,
} from '@hbc/ui-kit/theme';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: `${HBC_SPACE_MD}px`,
    paddingTop: `${HBC_SPACE_MD}px`,
    paddingBottom: `${HBC_SPACE_MD}px`,
    paddingLeft: `${HBC_SPACE_LG}px`,
    paddingRight: `${HBC_SPACE_LG}px`,
    backgroundColor: HBC_STATUS_RAMP_AMBER[90],
    marginBottom: `${HBC_SPACE_LG}px`,
    ...shorthands.borderLeft('3px', 'solid', HBC_STATUS_COLORS.warning),
    ...shorthands.borderRadius(HBC_RADIUS_MD),
  },
  icon: {
    flex: '0 0 auto',
    color: HBC_STATUS_RAMP_AMBER[30],
    marginTop: '2px',
  },
  body: {
    flex: '1 1 auto',
    minWidth: 0,
  },
  title: {
    ...labelType,
    color: HBC_SURFACE_LIGHT['text-primary'],
    marginBottom: `${HBC_SPACE_SM}px`,
  },
  description: {
    ...bodySmall,
    color: HBC_SURFACE_LIGHT['text-muted'],
  },
});

export interface ProjectSitesOverflowNoticeProps {
  /** Number of project rows actually fetched. */
  fetchedCount: number;
  /** Defense-in-depth ceiling that halted the fetch. */
  ceiling: number;
}

export const ProjectSitesOverflowNotice: FC<ProjectSitesOverflowNoticeProps> = ({
  fetchedCount,
  ceiling,
}) => {
  const classes = useStyles();
  return (
    <div className={classes.root} role="status">
      <AlertTriangle size={18} className={classes.icon} aria-hidden="true" />
      <div className={classes.body}>
        <div className={classes.title}>
          Showing the first {fetchedCount.toLocaleString()} projects
        </div>
        <div className={classes.description}>
          The Projects list exceeded the safety ceiling
          ({ceiling.toLocaleString()} rows). Search and filters operate on
          the loaded set. Narrow by year to reach projects beyond this
          ceiling, or contact the workspace owner if this limit needs to be
          raised.
        </div>
      </div>
    </div>
  );
};
