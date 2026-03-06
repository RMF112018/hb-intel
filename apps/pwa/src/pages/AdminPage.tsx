import type { ReactNode } from 'react';
import { AdminAccessControlPage } from '@hbc/auth';
import { WorkspacePageShell } from '@hbc/ui-kit';

export function AdminPage(): ReactNode {
  return (
    <WorkspacePageShell layout="list" title="Admin">
      <AdminAccessControlPage title="Access Control Administration" />
    </WorkspacePageShell>
  );
}
