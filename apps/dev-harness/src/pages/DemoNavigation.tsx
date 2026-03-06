/**
 * DemoNavigation — WorkspacePageShell navigation continuity demo for Phase 4b.16.
 *
 * The goal is to demonstrate shell continuity while route-like state changes occur:
 * - title and breadcrumbs update from nav state
 * - active selection remains visible in shell content
 * - page frame remains stable across navigation transitions
 */
import { useMemo, useState } from 'react';
import type { BreadcrumbItem } from '@hbc/models';
import type { CommandBarAction } from '@hbc/ui-kit';
import { WorkspacePageShell } from '@hbc/ui-kit';

type NavSection = 'overview' | 'milestones' | 'documents';

const NAV_LABELS: Record<NavSection, string> = {
  overview: 'Overview',
  milestones: 'Milestones',
  documents: 'Documents',
};

export function DemoNavigation() {
  const [activeSection, setActiveSection] = useState<NavSection>('overview');

  const breadcrumbs = useMemo<BreadcrumbItem[]>(
    () => [
      { label: 'Dev Harness', href: '/dev-harness' },
      { label: 'Demo Navigation' },
      { label: NAV_LABELS[activeSection] },
    ],
    [activeSection],
  );

  const actions = useMemo<CommandBarAction[]>(
    () => [
      {
        key: 'goto-overview',
        label: 'Overview',
        onClick: () => setActiveSection('overview'),
      },
      {
        key: 'goto-milestones',
        label: 'Milestones',
        onClick: () => setActiveSection('milestones'),
      },
      {
        key: 'goto-documents',
        label: 'Documents',
        primary: true,
        onClick: () => setActiveSection('documents'),
      },
    ],
    [],
  );

  return (
    <div className="harness-demo-card">
      <h3 className="harness-section-title">WorkspacePageShell — Navigation Continuity</h3>
      <p className="harness-demo-copy">
        Use command-bar actions to change sections and verify shell framing stays consistent.
      </p>

      <WorkspacePageShell
        layout="detail"
        title={`Navigation Demo — ${NAV_LABELS[activeSection]}`}
        breadcrumbs={breadcrumbs}
        actions={actions}
      >
        <div className="harness-demo-surface">
          <p>
            Active section: <strong>{NAV_LABELS[activeSection]}</strong>
          </p>
          <p>
            This content intentionally changes with section state to emulate router-driven
            transitions while preserving shell-level chrome.
          </p>
        </div>
      </WorkspacePageShell>
    </div>
  );
}
