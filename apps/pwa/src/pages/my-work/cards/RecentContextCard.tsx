/**
 * RecentContextCard — P2-D1 §6: available to all roles.
 * P2-A1 requirement: continue-working links and recent context
 * to keep the hub useful even with zero work items.
 *
 * Empty/pending state uses HbcEmptyState per UI governance (UIF-008).
 * Real recent-context data is a Phase 3+ concern; this card renders
 * the governed inline empty state until that data source is available.
 * HbcEmptyState (not HbcSmartEmptyState) is appropriate here — this is
 * a simple inline placeholder, not a page-level orchestrated empty state.
 *
 * UIF-008: Added icon + primary action to empty state per acceptance criteria.
 */
import type { ReactNode } from 'react';
import { HbcCard, HbcEmptyState, HbcButton } from '@hbc/ui-kit';
import { BlueprintRoll } from '@hbc/ui-kit/icons';

export function RecentContextCard(): ReactNode {
  return (
    <HbcCard weight="supporting" header={<span>Recent Context</span>}>
      <HbcEmptyState
        icon={<BlueprintRoll size="lg" color="var(--colorNeutralForeground4)" />}
        title="No recent context"
        description="Recently visited projects and work items will appear here."
        primaryAction={
          <HbcButton
            variant="primary"
            size="sm"
            onClick={() => { window.location.href = '/projects'; }}
          >
            Browse Projects
          </HbcButton>
        }
      />
    </HbcCard>
  );
}
