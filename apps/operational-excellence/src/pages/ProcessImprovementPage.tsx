import type { ReactNode } from 'react';
import { HbcEmptyState, WorkspacePageShell } from '@hbc/ui-kit';

export function ProcessImprovementPage(): ReactNode {
  return (
    <WorkspacePageShell title="Process Improvement" description="Continuous improvement initiatives">
      <HbcEmptyState title="Process Improvement" description="Process improvement tracking tools will be available in a future release." />
    </WorkspacePageShell>
  );
}
