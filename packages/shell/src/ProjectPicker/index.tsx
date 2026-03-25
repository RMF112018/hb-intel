import { useState } from 'react';
import type { ReactNode } from 'react';
import type { IActiveProject } from '@hbc/models';
import { useProjectStore } from '../stores/projectStore.js';

export interface ProjectPickerProps {
  /** Called when the user selects a project. */
  onProjectSelect?: (project: IActiveProject) => void;
}

/**
 * Project selector dropdown — Blueprint §2c.
 * Rendered only when mode === 'full' && activeWorkspace === 'project-hub'.
 */
export function ProjectPicker({ onProjectSelect }: ProjectPickerProps): ReactNode {
  const activeProject = useProjectStore((s) => s.activeProject);
  const availableProjects = useProjectStore((s) => s.availableProjects);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div data-hbc-shell="project-picker">
      <button
        data-hbc-shell="project-picker-trigger"
        onClick={() => setIsOpen((o) => !o)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {activeProject?.name ?? 'Select Project'}
      </button>
      {isOpen && (
        <ul data-hbc-shell="project-picker-list" role="listbox">
          {availableProjects.map((project) => (
            <li
              key={project.id}
              data-hbc-shell="project-picker-option"
              role="option"
              aria-selected={project.id === activeProject?.id}
              onClick={() => {
                onProjectSelect?.(project);
                setIsOpen(false);
              }}
            >
              <span data-hbc-shell="project-name">{project.name}</span>
              <span data-hbc-shell="project-number">{project.number}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
