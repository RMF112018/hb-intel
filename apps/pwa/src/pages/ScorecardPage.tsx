import type { ReactNode } from 'react';
import { WorkspacePageShell } from '../components/WorkspacePageShell.js';
import { HbcEmptyState } from '@hbc/ui-kit';

export function ScorecardPage(): ReactNode {
  return (
    <WorkspacePageShell title="Scorecard" description="Project performance metrics">
      <HbcEmptyState
        title="Scorecard"
        description="Project performance scorecards will be available in a future release."
      />
    </WorkspacePageShell>
  );
}
