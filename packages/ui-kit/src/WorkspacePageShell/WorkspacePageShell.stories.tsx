/**
 * WorkspacePageShell Stories — PH4B.2 §Step 5 (F-013)
 * CSF3 format | DESIGN_SYSTEM.md convention
 */
import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FluentProvider } from '@fluentui/react-components';
import { WorkspacePageShell } from './index.js';
import { hbcFieldTheme } from '../theme/theme.js';
import type { WorkspacePageShellProps } from './types.js';

const baseArgs: Partial<WorkspacePageShellProps> = {
  title: 'RFIs',
  layout: 'list',
};

const sampleActions = [
  { key: 'create', label: 'New RFI', onClick: () => console.log('Create'), primary: true },
  { key: 'export', label: 'Export', onClick: () => console.log('Export') },
];

const sampleBreadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Project Alpha', href: '/projects/alpha' },
  { label: 'RFIs' },
];

const meta: Meta<typeof WorkspacePageShell> = {
  title: 'Shell/WorkspacePageShell',
  component: WorkspacePageShell,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof WorkspacePageShell>;

const SampleContent = () => (
  <div style={{ padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '4px', minHeight: '200px' }}>
    <p style={{ color: '#374151' }}>Page content renders here.</p>
  </div>
);

export const Default: Story = {
  args: {
    ...baseArgs,
    children: <SampleContent />,
  },
};

export const Dashboard: Story = {
  args: {
    layout: 'dashboard',
    title: 'Project Dashboard',
    children: <SampleContent />,
  },
};

export const List: Story = {
  args: {
    layout: 'list',
    title: 'RFIs',
    actions: sampleActions,
    breadcrumbs: sampleBreadcrumbs,
    children: <SampleContent />,
  },
};

export const Form: Story = {
  args: {
    layout: 'form',
    title: 'Create RFI',
    breadcrumbs: [
      { label: 'RFIs', href: '/rfis' },
      { label: 'New RFI' },
    ],
    children: <SampleContent />,
  },
};

export const Detail: Story = {
  args: {
    layout: 'detail',
    title: 'RFI-001: Foundation Clarification',
    breadcrumbs: sampleBreadcrumbs,
    actions: [
      { key: 'edit', label: 'Edit', onClick: () => console.log('Edit'), primary: true },
      { key: 'delete', label: 'Delete', onClick: () => console.log('Delete') },
    ],
    children: <SampleContent />,
  },
};

export const Landing: Story = {
  args: {
    layout: 'landing',
    title: 'Project Hub',
    children: <SampleContent />,
  },
};

export const Loading: Story = {
  args: {
    ...baseArgs,
    isLoading: true,
    children: <SampleContent />,
  },
};

export const Error: Story = {
  args: {
    ...baseArgs,
    isError: true,
    errorMessage: 'Failed to load RFIs. The server returned a 500 error.',
    children: <SampleContent />,
  },
};

export const Empty: Story = {
  args: {
    ...baseArgs,
    isEmpty: true,
    emptyMessage: 'No RFIs found for this project.',
    emptyActionLabel: 'Create First RFI',
    onEmptyAction: () => console.log('Create RFI'),
    children: <SampleContent />,
  },
};

export const WithBanner: Story = {
  args: {
    ...baseArgs,
    banner: {
      variant: 'warning',
      message: 'This project has 3 overdue RFIs requiring immediate attention.',
      dismissible: true,
    },
    children: <SampleContent />,
  },
};

export const WithActions: Story = {
  args: {
    ...baseArgs,
    actions: sampleActions,
    overflowActions: [
      { key: 'archive', label: 'Archive', onClick: () => console.log('Archive') },
    ],
    breadcrumbs: sampleBreadcrumbs,
    children: <SampleContent />,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {(['dashboard', 'list', 'form', 'detail', 'landing'] as const).map((layout) => (
        <div key={layout}>
          <p style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '4px', paddingLeft: '16px' }}>
            layout=&quot;{layout}&quot;
          </p>
          <div style={{ border: '1px solid #E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
            <WorkspacePageShell layout={layout} title={`${layout.charAt(0).toUpperCase() + layout.slice(1)} Page`}>
              <div style={{ padding: '16px', backgroundColor: '#F9FAFB' }}>
                <p>Content for {layout} layout</p>
              </div>
            </WorkspacePageShell>
          </div>
        </div>
      ))}
    </div>
  ),
};

export const FieldMode: Story = {
  render: () => (
    <FluentProvider theme={hbcFieldTheme}>
      <WorkspacePageShell
        layout="list"
        title="Daily Log"
        actions={sampleActions}
        breadcrumbs={sampleBreadcrumbs}
      >
        <div style={{ padding: '16px', backgroundColor: '#1A1A2E', color: '#E5E7EB', borderRadius: '4px' }}>
          <p>Field mode content area</p>
        </div>
      </WorkspacePageShell>
    </FluentProvider>
  ),
};

export const FieldModeActions: Story = {
  name: 'Field Mode Actions (FAB + Cmd+K)',
  render: () => (
    <FluentProvider theme={hbcFieldTheme}>
      <div data-theme="field" style={{ minHeight: '400px', backgroundColor: '#0F1419', position: 'relative' }}>
        <WorkspacePageShell
          layout="list"
          title="Daily Log"
          actions={[
            { key: 'create', label: 'New Entry', onClick: () => console.log('Create'), primary: true },
            { key: 'export', label: 'Export', onClick: () => console.log('Export') },
            { key: 'sync', label: 'Sync', onClick: () => console.log('Sync') },
          ]}
          overflowActions={[
            { key: 'archive', label: 'Archive', onClick: () => console.log('Archive') },
          ]}
        >
          <div style={{ padding: '16px', color: '#E5E7EB' }}>
            <p>In field mode: primary action renders as 56px FAB (bottom-right).</p>
            <p>Secondary actions are injected into Cmd+K palette.</p>
            <p>Command bar zone is hidden.</p>
          </div>
        </WorkspacePageShell>
      </div>
    </FluentProvider>
  ),
};

export const WithDestructiveOverflow: Story = {
  args: {
    ...baseArgs,
    actions: [
      { key: 'create', label: 'New RFI', onClick: () => console.log('Create'), primary: true },
      { key: 'export', label: 'Export', onClick: () => console.log('Export') },
    ],
    overflowActions: [
      { key: 'archive', label: 'Archive', onClick: () => console.log('Archive') },
      { key: 'delete', label: 'Delete All', onClick: () => console.log('Delete'), isDestructive: true },
    ],
    children: <SampleContent />,
  },
};

export const A11yTest: Story = {
  name: 'A11y Test (Landmarks + States)',
  render: () => (
    <div>
      <p style={{ marginBottom: '16px', fontSize: '0.875rem', color: '#605E5C', padding: '16px' }}>
        Verify <code>data-hbc-ui="workspace-page-shell"</code> and <code>data-layout</code> attributes.
        Loading state should have <code>role="status"</code> on spinner.
        Error/empty states should be clearly announced. Breadcrumbs should have
        <code> role="navigation"</code> with <code>aria-label="Breadcrumb"</code>.
      </p>
      <WorkspacePageShell
        layout="list"
        title="A11y Test Page"
        breadcrumbs={sampleBreadcrumbs}
        actions={sampleActions}
        banner={{ variant: 'info', message: 'Test banner for accessibility.', dismissible: true }}
      >
        <SampleContent />
      </WorkspacePageShell>
    </div>
  ),
};
