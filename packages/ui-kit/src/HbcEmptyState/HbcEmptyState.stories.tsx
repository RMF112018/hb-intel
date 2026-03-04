/**
 * HbcEmptyState stories — PH4.6 §Step 4
 */
import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FluentProvider } from '@fluentui/react-components';
import { HbcEmptyState } from './index.js';
import { hbcFieldTheme } from '../theme/theme.js';
import { DrawingSheet } from '../icons/index.js';

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
