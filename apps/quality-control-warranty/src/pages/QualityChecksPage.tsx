import type { ReactNode } from 'react';
import { HbcEmptyState, WorkspacePageShell } from '@hbc/ui-kit';

export function QualityChecksPage(): ReactNode {
  return (
    <WorkspacePageShell layout="list" title="Quality Checks">
      <HbcEmptyState title="Quality Checks" description="Quality control inspection tools will be available in a future release." />
    </WorkspacePageShell>
  );
}
