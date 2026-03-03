import type { ReactNode } from 'react';
import { HbcEmptyState, WorkspacePageShell } from '@hbc/ui-kit';

export function InvoicesPage(): ReactNode {
  return (
    <WorkspacePageShell title="Invoices" description="Invoice processing and tracking">
      <HbcEmptyState title="Invoices" description="Invoice processing and tracking will be available in a future release." />
    </WorkspacePageShell>
  );
}
