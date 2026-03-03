import type { ReactNode } from 'react';
import { useProjectStore } from '../stores/projectStore.js';

export interface BackToProjectHubProps {
  /** Called when the link is clicked. */
  onNavigate?: () => void;
}

/**
 * "Back to the Project Hub {name}" emphasized link — Blueprint §2c.
 * Rendered when mode === 'full' && activeWorkspace !== 'project-hub' && activeProject !== null.
 */
export function BackToProjectHub({ onNavigate }: BackToProjectHubProps): ReactNode {
  const activeProject = useProjectStore((s) => s.activeProject);

  if (!activeProject) return null;

  return (
    <a
      data-hbc-shell="back-to-project-hub"
      href="#"
      role="link"
      onClick={(e) => {
        e.preventDefault();
        onNavigate?.();
      }}
    >
      Back to the Project Hub <strong>{activeProject.name}</strong>
    </a>
  );
}
