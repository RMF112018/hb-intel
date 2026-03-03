/**
 * WebpartPreview — Reusable simplified shell wrapper for SPFx webpart tabs.
 * Foundation Plan Phase 3.
 */
import { useEffect } from 'react';
import { ShellLayout, useNavStore } from '@hbc/shell';
import { WorkspacePlaceholder } from '../pages/WorkspacePlaceholder.js';

interface WebpartPreviewProps {
  workspaceId: string;
}

export function WebpartPreview({ workspaceId }: WebpartPreviewProps) {
  const setActiveWorkspace = useNavStore((s) => s.setActiveWorkspace);

  useEffect(() => {
    setActiveWorkspace(workspaceId as Parameters<typeof setActiveWorkspace>[0]);
  }, [workspaceId, setActiveWorkspace]);

  return (
    <ShellLayout mode="simplified">
      <WorkspacePlaceholder workspaceId={workspaceId} />
    </ShellLayout>
  );
}
