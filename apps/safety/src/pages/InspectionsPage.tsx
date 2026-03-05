import type { ReactNode } from 'react';
import { HbcEmptyState, WorkspacePageShell } from '@hbc/ui-kit';

export function InspectionsPage(): ReactNode {
  return (
    <WorkspacePageShell layout="list" title="Inspections">
      <HbcEmptyState title="Inspections" description="Safety inspection management tools will be available in a future release." />
    </WorkspacePageShell>
  );
}
