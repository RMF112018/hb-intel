/**
 * PwaPreview — Full ShellLayout (mode='full') with workspace switching.
 * Foundation Plan Phase 3.
 */
import { useState } from 'react';
import { ShellLayout } from '@hbc/shell';
import { useNavStore, useProjectStore } from '@hbc/shell';
import type { WorkspaceId } from '@hbc/shell';
import type { IActiveProject } from '@hbc/models';
import { WorkspacePlaceholder } from '../pages/WorkspacePlaceholder.js';

export function PwaPreview() {
  const activeWorkspace = useNavStore((s) => s.activeWorkspace);
  const setActiveWorkspace = useNavStore((s) => s.setActiveWorkspace);
  const setActiveProject = useProjectStore((s) => s.setActiveProject);

  const handleProjectSelect = (project: IActiveProject) => {
    setActiveProject(project);
  };

  const handleBackToProjectHub = () => {
    setActiveWorkspace('project-hub');
  };

  const handleWorkspaceSelect = (id: WorkspaceId) => {
    setActiveWorkspace(id);
  };

  return (
    <ShellLayout
      mode="full"
      onProjectSelect={handleProjectSelect}
      onBackToProjectHub={handleBackToProjectHub}
      onWorkspaceSelect={handleWorkspaceSelect}
    >
      <WorkspacePlaceholder workspaceId={activeWorkspace ?? 'project-hub'} />
    </ShellLayout>
  );
}
