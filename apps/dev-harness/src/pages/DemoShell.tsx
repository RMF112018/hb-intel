/**
 * DemoShell — WorkspacePageShell behavior matrix for Phase 4b.16 (P3).
 *
 * This demo provides concrete, visible examples of the shell contract:
 * - D-01: all page content wrapped by WorkspacePageShell
 * - D-03: actions flow through command bar props (not ad-hoc page buttons)
 * - D-06: loading/empty/error states are owned by WorkspacePageShell props
 */
import { useState } from 'react';
import type { BreadcrumbItem } from '@hbc/models';
import type { CommandBarAction } from '@hbc/ui-kit';
import { WorkspacePageShell } from '@hbc/ui-kit';

const DEMO_BREADCRUMBS: BreadcrumbItem[] = [
  { label: 'Dev Harness', href: '/dev-harness' },
  { label: 'Demo Shell' },
];

const DEMO_ACTIONS: CommandBarAction[] = [
  {
    key: 'refresh-data',
    label: 'Refresh',
    onClick: () => {
      // Intentionally no-op: this action is here to exercise D-03 command bar wiring.
    },
  },
  {
    key: 'create-record',
    label: 'Create',
    primary: true,
    onClick: () => {
      // Intentionally no-op: this action is here to exercise D-03 primary actions.
    },
  },
];

type ShellState = 'ready' | 'loading' | 'empty' | 'error';

export function DemoShell() {
  const [state, setState] = useState<ShellState>('ready');

  return (
    <div className="harness-demo-card">
      <h3 className="harness-section-title">WorkspacePageShell — Shell Contract</h3>
      <p className="harness-demo-copy">
        Toggle shell states below to validate centralized loading, empty, and error handling.
      </p>

      <div className="harness-demo-controls">
        <button type="button" onClick={() => setState('ready')}>Ready</button>
        <button type="button" onClick={() => setState('loading')}>Loading</button>
        <button type="button" onClick={() => setState('empty')}>Empty</button>
        <button type="button" onClick={() => setState('error')}>Error</button>
      </div>

      <WorkspacePageShell
        layout="dashboard"
        title="Demo Shell Workspace"
        breadcrumbs={DEMO_BREADCRUMBS}
        actions={DEMO_ACTIONS}
        isLoading={state === 'loading'}
        isEmpty={state === 'empty'}
        isError={state === 'error'}
        errorMessage="Simulated shell error state for 4b.16 verification."
        banner={{
          variant: 'info',
          message: 'Demo banner: page-level notices are routed through WorkspacePageShell.',
        }}
      >
        <div className="harness-demo-surface">
          <p>
            Shell ready state content. This block should only render when loading/empty/error
            overlays are not active.
          </p>
        </div>
      </WorkspacePageShell>
    </div>
  );
}
