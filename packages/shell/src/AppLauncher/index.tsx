import type { ReactNode } from 'react';
import { useNavStore } from '../stores/navStore.js';
import { WORKSPACE_IDS } from '../types.js';
import type { WorkspaceId, WorkspaceDescriptor } from '../types.js';

export interface AppLauncherProps {
  /** Workspace descriptors for the grid; defaults to WORKSPACE_IDS with id-as-label. */
  workspaces?: WorkspaceDescriptor[];
  /** Called when a workspace tile is selected. */
  onWorkspaceSelect?: (id: WorkspaceId) => void;
}

const defaultDescriptors: WorkspaceDescriptor[] = WORKSPACE_IDS.map((id) => ({
  id,
  label: id
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' '),
}));

/**
 * M365-style waffle button + 14-workspace grid panel — Blueprint §2c.
 * Reads isAppLauncherOpen from navStore; toggles via store action.
 */
export function AppLauncher({ workspaces = defaultDescriptors, onWorkspaceSelect }: AppLauncherProps): ReactNode {
  const isOpen = useNavStore((s) => s.isAppLauncherOpen);
  const toggleAppLauncher = useNavStore((s) => s.toggleAppLauncher);
  const setActiveWorkspace = useNavStore((s) => s.setActiveWorkspace);

  return (
    <div data-hbc-shell="app-launcher">
      <button
        data-hbc-shell="app-launcher-trigger"
        onClick={toggleAppLauncher}
        aria-expanded={isOpen}
        aria-label="App launcher"
      >
        <span data-hbc-shell="waffle-icon" aria-hidden="true">
          &#9783;
        </span>
      </button>
      {isOpen && (
        <div data-hbc-shell="app-launcher-panel" role="menu">
          {workspaces.map((ws) => (
            <button
              key={ws.id}
              data-hbc-shell="app-launcher-tile"
              role="menuitem"
              onClick={() => {
                setActiveWorkspace(ws.id);
                onWorkspaceSelect?.(ws.id);
                toggleAppLauncher();
              }}
            >
              <span data-hbc-shell="tile-label">{ws.label}</span>
              {ws.description && (
                <span data-hbc-shell="tile-description">{ws.description}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
