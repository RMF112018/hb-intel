import type { ReactNode } from 'react';
import { HbcEmptyState, WorkspacePageShell } from '@hbc/ui-kit';

export function TemplatesPage(): ReactNode {
  return (
    <WorkspacePageShell layout="list" title="Templates">
      <HbcEmptyState title="Templates" description="Estimating templates will be available in a future release." />
    </WorkspacePageShell>
  );
}
