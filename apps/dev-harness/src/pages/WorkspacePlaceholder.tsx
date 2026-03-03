/**
 * WorkspacePlaceholder — Generic workspace page showing status badges
 * and conditional demo components.
 * Foundation Plan Phase 3.
 */
import { HbcStatusBadge } from '@hbc/ui-kit';
import { useProjectStore } from '@hbc/shell';
import { DemoDataGrid } from './DemoDataGrid.js';
import { DemoCharts } from './DemoCharts.js';
import { DemoForms } from './DemoForms.js';

const WORKSPACE_LABELS: Record<string, string> = {
  'project-hub': 'Project Hub',
  accounting: 'Accounting',
  estimating: 'Estimating',
  scheduling: 'Safety / Scheduling',
  buyout: 'Buyout',
  compliance: 'Quality Control / Compliance',
  contracts: 'Contracts',
  risk: 'Risk Management',
  scorecard: 'Scorecard',
  pmp: 'Operational Excellence / PMP',
  leadership: 'Leadership',
  'business-development': 'Business Development',
  admin: 'Admin / Human Resources',
  'site-control': 'HB Site Control',
};

/** Show different demo components based on workspace to exercise different ui-kit components. */
const WORKSPACE_DEMOS: Record<string, ('grid' | 'charts' | 'forms')[]> = {
  'project-hub': ['grid', 'charts'],
  accounting: ['grid'],
  estimating: ['grid', 'charts'],
  scheduling: ['grid'],
  'business-development': ['grid'],
  leadership: ['charts'],
  pmp: ['charts', 'forms'],
  admin: ['forms'],
  compliance: ['forms'],
  risk: ['charts'],
};

interface WorkspacePlaceholderProps {
  workspaceId: string;
}

export function WorkspacePlaceholder({ workspaceId }: WorkspacePlaceholderProps) {
  const activeProject = useProjectStore((s) => s.activeProject);
  const label = WORKSPACE_LABELS[workspaceId] ?? workspaceId;
  const demos = WORKSPACE_DEMOS[workspaceId] ?? [];

  return (
    <div className="harness-placeholder">
      <h2>{label}</h2>
      <p>
        Workspace preview for <strong>{label}</strong>
        {activeProject && (
          <> — Project: <strong>{activeProject.name}</strong> ({activeProject.number})</>
        )}
      </p>

      <div className="harness-badge-row">
        <HbcStatusBadge variant="success" label="Active" />
        <HbcStatusBadge variant="info" label="Phase 3" />
        <HbcStatusBadge variant="warning" label="Mock Data" />
        <HbcStatusBadge variant="neutral" label={workspaceId} />
      </div>

      {demos.length === 0 && (
        <p style={{ fontStyle: 'italic', color: 'var(--colorNeutralForeground3)' }}>
          No demo components configured for this workspace. Switch to Project Hub, Accounting, or
          Estimating to see data grids, charts, and forms.
        </p>
      )}

      <div className="harness-demo-section">
        {demos.includes('grid') && <DemoDataGrid />}
        {demos.includes('charts') && <DemoCharts />}
        {demos.includes('forms') && <DemoForms />}
      </div>
    </div>
  );
}
