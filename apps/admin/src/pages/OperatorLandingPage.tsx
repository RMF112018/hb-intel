import type { ReactNode } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { makeStyles } from '@griffel/react';
import {
  HbcCard,
  HbcTypography,
  HBC_SPACE_MD,
  HBC_SPACE_SM,
  HBC_SPACE_LG,
  HBC_SPACE_XXL,
  WorkspacePageShell,
} from '@hbc/ui-kit';
import { getNavigationLanes } from '../router/lane-registry.js';
import type { LaneDefinition } from '../router/lane-registry.js';

/**
 * P5-03: Operator landing page — lightweight control-center overview.
 *
 * Displays the 8 operator workflow lanes as a card grid.
 * Active lanes show their label; scaffold lanes show the delivery phase.
 */

const useStyles = makeStyles({
  grid: {
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fill, minmax(${HBC_SPACE_XXL * 5}px, 1fr))`,
    gap: `${HBC_SPACE_MD}px`,
    paddingTop: `${HBC_SPACE_LG}px`,
    paddingBottom: `${HBC_SPACE_LG}px`,
  },
  cardWrapper: {
    cursor: 'pointer',
  },
  cardContent: {
    minHeight: `${HBC_SPACE_XXL * 3}px`,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingLeft: `${HBC_SPACE_MD}px`,
    paddingRight: `${HBC_SPACE_MD}px`,
  },
  scaffoldWrapper: {
    opacity: 0.7,
  },
  subtitle: {
    marginTop: `${HBC_SPACE_SM}px`,
  },
});

function LaneCard({ lane }: { readonly lane: LaneDefinition }): ReactNode {
  const styles = useStyles();
  const navigate = useNavigate();

  return (
    <div
      role="button"
      tabIndex={0}
      className={`${styles.cardWrapper} ${lane.status === 'scaffold' ? styles.scaffoldWrapper : ''}`}
      onClick={() => navigate({ to: lane.path })}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate({ to: lane.path });
        }
      }}
    >
      <HbcCard>
        <div className={styles.cardContent}>
          <HbcTypography intent="heading3">{lane.label}</HbcTypography>
          <HbcTypography intent="bodySmall" className={styles.subtitle}>
            {lane.status === 'active'
              ? 'Active'
              : `Coming in ${lane.deliversIn ?? 'a future phase'}`}
          </HbcTypography>
        </div>
      </HbcCard>
    </div>
  );
}

export function OperatorLandingPage(): ReactNode {
  const styles = useStyles();
  const lanes = getNavigationLanes();

  return (
    <WorkspacePageShell layout="landing" title="IT Control Center">
      <HbcTypography intent="body">
        Welcome to the HB Intel IT Control Center. Select a workflow lane below.
      </HbcTypography>
      <div className={styles.grid}>
        {lanes.map((lane) => (
          <LaneCard key={lane.id} lane={lane} />
        ))}
      </div>
    </WorkspacePageShell>
  );
}
