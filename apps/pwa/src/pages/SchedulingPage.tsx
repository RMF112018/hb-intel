import type { ReactNode } from 'react';
import { WorkspacePageShell } from '../components/WorkspacePageShell.js';
import { HbcEmptyState } from '@hbc/ui-kit';

export function SchedulingPage(): ReactNode {
  return (
    <WorkspacePageShell title="Scheduling" description="Project scheduling and timelines">
      <HbcEmptyState
        title="Scheduling"
        description="Project scheduling and timeline management will be available in a future release."
      />
    </WorkspacePageShell>
  );
}
