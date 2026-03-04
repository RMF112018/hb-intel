import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { HbcAppShell } from '../HbcAppShell/HbcAppShell.js';
import { CreateUpdateLayout } from './CreateUpdateLayout.js';
import { RFI } from '../icons/index.js';
import type { SidebarNavGroup, ShellUser } from '../HbcAppShell/types.js';

const mockUser: ShellUser = {
  id: '1',
  displayName: 'John Smith',
  email: 'john.smith@hbconstruction.com',
  initials: 'JS',
};

const mockGroups: SidebarNavGroup[] = [
  {
    id: 'operations',
    label: 'Operations',
    items: [
      { id: 'rfis', label: 'RFIs', icon: <RFI size="md" />, href: '/rfis' },
    ],
  },
];

const MockFormContent: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
    <div>
      <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '0.875rem' }}>Subject</label>
      <input
        type="text"
        placeholder="Enter RFI subject..."
        style={{
          width: '100%',
          padding: '8px 12px',
          border: '1px solid #D1D5DB',
          borderRadius: '6px',
          fontSize: '0.875rem',
          boxSizing: 'border-box',
        }}
      />
    </div>
    <div>
      <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '0.875rem' }}>Description</label>
      <textarea
        rows={6}
        placeholder="Describe the information requested..."
        style={{
          width: '100%',
          padding: '8px 12px',
          border: '1px solid #D1D5DB',
          borderRadius: '6px',
          fontSize: '0.875rem',
          boxSizing: 'border-box',
          resize: 'vertical',
        }}
      />
    </div>
    <div>
      <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '0.875rem' }}>Assignee</label>
      <select
        style={{
          width: '100%',
          padding: '8px 12px',
          border: '1px solid #D1D5DB',
          borderRadius: '6px',
          fontSize: '0.875rem',
        }}
      >
        <option>Select assignee...</option>
        <option>Sarah Johnson</option>
        <option>Mike Chen</option>
        <option>Emily Davis</option>
      </select>
    </div>
    <div>
      <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '0.875rem' }}>Due Date</label>
      <input
        type="date"
        style={{
          width: '100%',
          padding: '8px 12px',
          border: '1px solid #D1D5DB',
          borderRadius: '6px',
          fontSize: '0.875rem',
          boxSizing: 'border-box',
        }}
      />
    </div>
  </div>
);

const meta: Meta<typeof CreateUpdateLayout> = {
  title: 'Layouts/CreateUpdateLayout',
  component: CreateUpdateLayout,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof CreateUpdateLayout>;

export const CreateMode: Story = {
  render: () => (
    <HbcAppShell user={mockUser} sidebarGroups={mockGroups}>
      <CreateUpdateLayout
        mode="create"
        itemType="RFI"
        onCancel={() => console.log('Cancel')}
        onSubmit={() => console.log('Submit')}
      >
        <MockFormContent />
      </CreateUpdateLayout>
    </HbcAppShell>
  ),
};

export const EditMode: Story = {
  render: () => (
    <HbcAppShell user={mockUser} sidebarGroups={mockGroups}>
      <CreateUpdateLayout
        mode="edit"
        itemType="RFI"
        itemTitle="RFI-042: Foundation Rebar Specification"
        onCancel={() => console.log('Cancel')}
        onSubmit={() => console.log('Submit')}
      >
        <MockFormContent />
      </CreateUpdateLayout>
    </HbcAppShell>
  ),
};

export const FocusModeActive: Story = {
  name: 'Focus Mode (Desktop)',
  render: () => (
    <HbcAppShell user={mockUser} sidebarGroups={mockGroups}>
      <CreateUpdateLayout
        mode="create"
        itemType="Submittal"
        onCancel={() => console.log('Cancel')}
        onSubmit={() => console.log('Submit')}
      >
        <MockFormContent />
      </CreateUpdateLayout>
    </HbcAppShell>
  ),
};

export const Submitting: Story = {
  render: () => (
    <HbcAppShell user={mockUser} sidebarGroups={mockGroups}>
      <CreateUpdateLayout
        mode="edit"
        itemType="RFI"
        itemTitle="RFI-042: Foundation Rebar Specification"
        onCancel={() => {}}
        onSubmit={() => {}}
        isSubmitting
      >
        <MockFormContent />
      </CreateUpdateLayout>
    </HbcAppShell>
  ),
};
