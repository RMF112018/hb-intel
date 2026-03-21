/**
 * RecentContextCard — P2-D1 §6: available to all roles.
 * P2-A1 requirement: continue-working links and recent context
 * to keep the hub useful even with zero work items.
 *
 * Empty/pending state uses HbcEmptyState per UI governance.
 * Real recent-context data is a Phase 3+ concern; this card renders
 * the governed inline empty state until that data source is available.
 * HbcEmptyState (not HbcSmartEmptyState) is appropriate here — this is
 * a simple inline placeholder, not a page-level orchestrated empty state.
 */
import type { ReactNode } from 'react';
import { HbcCard, HbcEmptyState } from '@hbc/ui-kit';

export function RecentContextCard(): ReactNode {
  return (
    <HbcCard weight="supporting" header={<span>Recent Context</span>}>
      <HbcEmptyState
        title="No recent context"
        description="Recently visited projects and work items will appear here."
      />
    </HbcCard>
  );
}
