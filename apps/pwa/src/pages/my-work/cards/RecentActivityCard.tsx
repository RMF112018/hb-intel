/**
 * RecentActivityCard — P2-D1 §6: available to all roles.
 * P2-A1 requirement: continue-working links and recent activity
 * to keep the hub useful even with zero work items.
 *
 * UIF-047-addl: Extracted from RecentContextCard. Renamed heading to
 * "Recent Activity". Standalone component with governed data attributes.
 *
 * Empty/pending state uses HbcEmptyState per UI governance (UIF-008).
 * Real recent-activity data is a Phase 3+ concern; this card renders
 * the governed inline empty state until that data source is available.
 *
 * INS-014: heading4 header, size="md" CTA (36px minimum), theme-adaptive
 * card background for visual depth against adjacent Quick Actions.
 */
import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import { tokens, HbcCard, HbcEmptyState, HbcButton, heading4 } from '@hbc/ui-kit';
import { BlueprintRoll } from '@hbc/ui-kit/icons';

const useStyles = makeStyles({
  heading: {
    ...heading4,
    color: tokens.colorNeutralForeground1,
    margin: '0',
  },
  card: {
    backgroundColor: tokens.colorNeutralBackground3,
  },
});

export function RecentActivityCard(): ReactNode {
  const styles = useStyles();

  return (
    <HbcCard
      weight="supporting"
      header={<span className={styles.heading}>Recent Activity</span>}
      className={styles.card}
    >
      <HbcEmptyState
        icon={<BlueprintRoll size="lg" color={tokens.colorNeutralForeground4} />}
        title="No recent activity"
        description="Recently visited projects and work items will appear here."
        primaryAction={
          <HbcButton
            variant="primary"
            size="md"
            onClick={() => { window.location.href = '/projects'; }}
          >
            Browse Projects
          </HbcButton>
        }
      />
    </HbcCard>
  );
}
