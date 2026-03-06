/**
 * DemoLayouts — Named WorkspacePageShell layout examples for Phase 4b.16.
 *
 * This demo validates that page authors can select the required named layout
 * modes and keep a single shell wrapper model across workspace screens.
 */
import { useMemo, useState } from 'react';
import type { PageLayout } from '@hbc/ui-kit';
import { WorkspacePageShell } from '@hbc/ui-kit';

const LAYOUTS: Array<{ value: PageLayout; label: string }> = [
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'list', label: 'List' },
  { value: 'form', label: 'Form' },
  { value: 'landing', label: 'Landing' },
];

export function DemoLayouts() {
  const [layout, setLayout] = useState<PageLayout>('dashboard');

  const helperText = useMemo(() => {
    switch (layout) {
      case 'dashboard':
        return 'Dashboard mode emphasizes KPI and chart composition.';
      case 'list':
        return 'List mode is optimized for table/list-heavy workflows.';
      case 'form':
        return 'Form mode is used for data-entry and editing tasks.';
      case 'landing':
        return 'Landing mode supports workspace overviews and callouts.';
      default:
        return '';
    }
  }, [layout]);

  return (
    <div className="harness-demo-card">
      <h3 className="harness-section-title">WorkspacePageShell — Named Layout Modes</h3>
      <p className="harness-demo-copy">
        Switch layout modes to verify required named layout usage in one shell wrapper.
      </p>

      <div className="harness-demo-controls">
        {LAYOUTS.map((item) => (
          <button key={item.value} type="button" onClick={() => setLayout(item.value)}>
            {item.label}
          </button>
        ))}
      </div>

      <WorkspacePageShell
        layout={layout}
        title={`Layout Demo — ${layout}`}
      >
        <div className="harness-demo-surface">
          <p>{helperText}</p>
          <p>
            This example intentionally keeps content simple so layout frame behavior is easy to
            evaluate in visual QA and e2e smoke coverage.
          </p>
        </div>
      </WorkspacePageShell>
    </div>
  );
}

