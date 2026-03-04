/**
 * HbcEmptyState stories — PH4.6 §Step 4, PH4.9 §Step 5
 */
import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FluentProvider } from '@fluentui/react-components';
import { HbcEmptyState } from './index.js';
import { hbcFieldTheme } from '../theme/theme.js';
import { DrawingSheet, StatusInfoIcon } from '../icons/index.js';

const meta: Meta<typeof HbcEmptyState> = {
  title: 'Components/HbcEmptyState',
  component: HbcEmptyState,
};

export default meta;
type Story = StoryObj<typeof HbcEmptyState>;

export const Default: Story = {
  args: {
    title: 'No items found',
    description: 'There are no items matching your current filters.',
  },
};

export const WithAction: Story = {
  args: {
    title: 'No projects yet',
    description: 'Get started by creating your first project.',
    action: (
      <button
        type="button"
        style={{
          padding: '8px 24px',
          fontSize: '0.875rem',
          fontWeight: 600,
          color: '#FFFFFF',
          backgroundColor: '#F37021',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Create Project
      </button>
    ),
  },
};

export const WithIllustration: Story = {
  args: {
    title: 'No drawings uploaded',
    description: 'Upload your first drawing set to get started.',
    illustration: <DrawingSheet size="lg" color="#8B95A5" />,
    action: (
      <button
        type="button"
        style={{
          padding: '8px 24px',
          fontSize: '0.875rem',
          fontWeight: 600,
          color: '#FFFFFF',
          backgroundColor: '#004B87',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Upload Drawings
      </button>
    ),
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div>
        <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Text only</p>
        <HbcEmptyState title="No items found" description="No matching results." />
      </div>
      <div>
        <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>With icon + action</p>
        <HbcEmptyState
          title="No projects"
          description="Get started by creating your first project."
          icon={<DrawingSheet size="lg" color="#8B95A5" />}
          primaryAction={<button type="button">Create Project</button>}
        />
      </div>
      <div>
        <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Dual actions</p>
        <HbcEmptyState
          title="No commitments"
          description="Import from Procore or create locally."
          icon={<StatusInfoIcon size="lg" color="#8B95A5" />}
          primaryAction={<button type="button">Import</button>}
          secondaryAction={<button type="button">Create Local</button>}
        />
      </div>
    </div>
  ),
};

export const A11yTest: Story = {
  render: () => (
    <div>
      <p style={{ fontSize: '0.875rem', color: '#605E5C', marginBottom: '16px' }}>
        Empty state uses semantic heading and descriptive text.
        Action buttons are keyboard accessible.
      </p>
      <HbcEmptyState
        title="No data"
        description="Try adjusting your filters."
        icon={<StatusInfoIcon size="lg" color="#8B95A5" />}
        primaryAction={<button type="button">Tab to me</button>}
      />
    </div>
  ),
};

export const FieldMode: Story = {
  render: () => (
    <FluentProvider theme={hbcFieldTheme}>
      <div style={{ padding: '24px', backgroundColor: '#0F1419' }}>
        <HbcEmptyState
          title="No data available offline"
          description="Connect to the network to sync project data."
          illustration={<DrawingSheet size="lg" color="#8B95A5" />}
        />
      </div>
    </FluentProvider>
  ),
};

/* ── Phase 4.9 additions ─────────────────────────────────────── */

export const WithDualActions: Story = {
  args: {
    title: 'No commitments found',
    description: 'Import commitments from Procore or create a local one.',
    icon: <DrawingSheet size="lg" color="#8B95A5" />,
    primaryAction: (
      <button
        type="button"
        style={{
          padding: '8px 24px',
          fontSize: '0.875rem',
          fontWeight: 600,
          color: '#FFFFFF',
          backgroundColor: '#004B87',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Import from Procore
      </button>
    ),
    secondaryAction: (
      <button
        type="button"
        style={{
          padding: '8px 24px',
          fontSize: '0.875rem',
          fontWeight: 600,
          color: '#004B87',
          backgroundColor: 'transparent',
          border: '1px solid #004B87',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Create Local
      </button>
    ),
  },
};

export const WithIcon: Story = {
  args: {
    title: 'No notifications',
    description: 'You are all caught up.',
    icon: <StatusInfoIcon size="lg" color="#8B95A5" />,
  },
};

export const BackwardCompat: Story = {
  name: 'Backward Compat (illustration + action)',
  args: {
    title: 'Legacy props still work',
    description: 'Uses deprecated illustration and action props.',
    illustration: <DrawingSheet size="lg" color="#8B95A5" />,
    action: (
      <button
        type="button"
        style={{
          padding: '8px 24px',
          fontSize: '0.875rem',
          fontWeight: 600,
          color: '#FFFFFF',
          backgroundColor: '#F37021',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Legacy Action
      </button>
    ),
  },
};
