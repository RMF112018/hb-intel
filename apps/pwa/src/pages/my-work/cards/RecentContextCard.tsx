/**
 * RecentContextCard — P2-D1 §6: available to all roles.
 * P2-A1 requirement: continue-working links and recent context
 * to keep the hub useful even with zero work items.
 *
 * Empty/pending state uses HbcEmptyState per UI governance (UIF-008).
 * Real recent-context data is a Phase 3+ concern; this card renders
 * the governed inline empty state until that data source is available.
 *
 * INS-014: heading4 header, size="md" CTA (36px minimum), darker
 * card background for visual depth against adjacent Quick Actions.
 */
import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import { HbcCard, HbcEmptyState, HbcButton, heading4 } from '@hbc/ui-kit';
import { BlueprintRoll } from '@hbc/ui-kit/icons';

const useStyles = makeStyles({
  // INS-014: heading4 (14px/600) matches QuickActionsCard header treatment.
  heading: {
    ...heading4,
    color: 'var(--colorNeutralForeground1)',
    margin: '0',
  },
  // INS-014: Slightly darker background for depth against adjacent card.
  card: {
    backgroundColor: '#0D1520',
  },
});

export function RecentContextCard(): ReactNode {
  const styles = useStyles();

  return (
    <HbcCard weight="supporting" header={<span className={styles.heading}>Recent Context</span>} className={styles.card}>
      <HbcEmptyState
        icon={<BlueprintRoll size="lg" color="var(--colorNeutralForeground4)" />}
        title="No recent context"
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
