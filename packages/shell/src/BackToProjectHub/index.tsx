import type { ReactNode } from 'react';
import { useProjectStore } from '../stores/projectStore.js';

export interface BackToProjectHubProps {
  /** Base URL for the Project Hub (SPFx site URL or localhost). D-PH7-BW-6. */
  projectHubUrl?: string;
  /** Called when the link is clicked (fallback if no projectHubUrl). */
  onNavigate?: () => void;
}

/**
 * "Back to the Project Hub {name}" emphasized link — Blueprint §2c, D-PH7-BW-6.
 * Rendered when mode === 'full' && activeWorkspace !== 'project-hub' && activeProject !== null,
 * or when simplified shell has showBackToProjectHub === true.
 */
export function BackToProjectHub({ projectHubUrl, onNavigate }: BackToProjectHubProps): ReactNode {
  const activeProject = useProjectStore((s) => s.activeProject);

  if (!activeProject) return null;

  const href = projectHubUrl
    ? `${projectHubUrl}?projectId=${activeProject.id}`
    : '#';

  return (
    <a
      data-hbc-shell="back-to-project-hub"
      href={href}
      role="link"
      onClick={(e) => {
        if (!projectHubUrl) {
          e.preventDefault();
          onNavigate?.();
        }
      }}
    >
      Back to the Project Hub <strong>{activeProject.name}</strong>
    </a>
  );
}
