import type { ReactNode } from 'react';
import { HbcEmptyState, WorkspacePageShell } from '@hbc/ui-kit';

export function ScorecardPage(): ReactNode {
  return (
    <WorkspacePageShell layout="dashboard" title="Scorecard">
      <HbcEmptyState
        title="Scorecard"
        description="Project performance scorecards will be available in a future release."
      />
    </WorkspacePageShell>
  );
}
