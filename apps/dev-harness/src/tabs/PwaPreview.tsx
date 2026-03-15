/**
 * PwaPreview — Mounts the real PWA TanStack Router with memory history.
 * D-PH7-DH-1: memory history keeps in-shell navigation isolated from the
 * harness ?tab=pwa URL parameter.
 *
 * Wave 0 quick-nav strip provides direct links to non-workspace PWA routes
 * (project-setup, my-projects, provisioning) that are not reachable from
 * the workspace sidebar.
 */
import { useMemo, useEffect } from 'react';
import { createMemoryHistory, RouterProvider } from '@tanstack/react-router';
import type { AnyRouter } from '@tanstack/react-router';
import { SessionStateProvider } from '@hbc/session-state';
import type { OperationExecutor } from '@hbc/session-state';
import { createAppRouter } from '../../../pwa/src/router/index.js';
import { bootstrapMockEnvironment } from '../../../pwa/src/bootstrap.js';

/**
 * Harness-only executor: no real API calls during dev preview.
 * The operation queue is populated by session-state but never dispatched.
 */
const harnessExecutor: OperationExecutor = async () => {};

let pwaBootstrapped = false;

export function PwaPreview(): React.ReactNode {
  const router = useMemo(() => {
    const history = createMemoryHistory({ initialEntries: ['/project-hub'] });
    return createAppRouter(history);
  }, []);

  useEffect(() => {
    if (!pwaBootstrapped) {
      bootstrapMockEnvironment();
      pwaBootstrapped = true;
    }
  }, []);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PwaQuickNav router={router} />
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <SessionStateProvider executor={harnessExecutor}>
          <RouterProvider router={router} />
        </SessionStateProvider>
      </div>
    </div>
  );
}

interface PwaQuickNavProps {
  router: AnyRouter;
}

function PwaQuickNav({ router }: PwaQuickNavProps): React.ReactNode {
  const navigate = (to: string, search?: Record<string, string>) =>
    void router.navigate({ to, ...(search ? { search } : {}) });

  return (
    <div className="pwa-quick-nav">
      <span className="pwa-quick-nav-label">Wave 0 PWA routes:</span>
      <button
        className="pwa-quick-nav-btn"
        onClick={() => navigate('/project-hub')}
      >
        Project Hub
      </button>
      <button
        className="pwa-quick-nav-btn"
        onClick={() => navigate('/project-setup', { mode: 'new-request' })}
      >
        Project Setup (new)
      </button>
      <button
        className="pwa-quick-nav-btn"
        onClick={() => navigate('/projects')}
      >
        My Projects
      </button>
      <button
        className="pwa-quick-nav-btn"
        onClick={() => navigate('/provisioning/PRJ-001')}
      >
        Provisioning (mock)
      </button>
      <button
        className="pwa-quick-nav-btn"
        onClick={() => navigate('/admin')}
      >
        Admin (PWA)
      </button>
      <span className="pwa-quick-nav-hint">
        SPFx webpart apps → use the tab bar above ↑
      </span>
    </div>
  );
}
