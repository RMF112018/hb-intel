/**
 * HbcProjectSelector Stories — PH4B.2 §Step 5 (F-013)
 * CSF3 format | DESIGN_SYSTEM.md convention
 */
import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FluentProvider } from '@fluentui/react-components';
import { HbcProjectSelector } from './HbcProjectSelector.js';
import { hbcFieldTheme } from '../theme/theme.js';

const meta: Meta<typeof HbcProjectSelector> = {
  title: 'Shell/HbcProjectSelector',
  component: HbcProjectSelector,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div style={{ backgroundColor: '#1B2A3D', padding: '16px', borderRadius: '4px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof HbcProjectSelector>;

export const Default: Story = {
  args: {
    onProjectSelect: (id: string) => console.log('Selected:', id),
  },
};

export const Empty: Story = {
  name: 'No Active Project',
  args: {
    onProjectSelect: (id: string) => console.log('Selected:', id),
  },
};

export const Loading: Story = {
  name: 'Loading State',
  args: {
    onProjectSelect: (id: string) => console.log('Selected:', id),
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginBottom: '4px' }}>Default</p>
        <HbcProjectSelector onProjectSelect={(id) => console.log('Selected:', id)} />
      </div>
      <div>
        <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginBottom: '4px' }}>No projects</p>
        <HbcProjectSelector />
      </div>
    </div>
  ),
};

export const FieldMode: Story = {
  render: () => (
    <FluentProvider theme={hbcFieldTheme}>
      <div style={{ backgroundColor: '#0F1419', padding: '16px', borderRadius: '4px' }}>
        <HbcProjectSelector onProjectSelect={(id) => console.log('Selected:', id)} />
      </div>
    </FluentProvider>
  ),
};

export const A11yTest: Story = {
  name: 'A11y Test (Keyboard + ARIA)',
  render: () => (
    <div>
      <p style={{ marginBottom: '16px', fontSize: '0.875rem', color: '#605E5C' }}>
        Tab to the selector, press Enter/Space to open dropdown. Type to filter.
        Press Escape to close. Verify <code>aria-haspopup</code> and <code>aria-expanded</code>.
      </p>
      <div style={{ backgroundColor: '#1B2A3D', padding: '16px', borderRadius: '4px' }}>
        <HbcProjectSelector onProjectSelect={(id) => console.log('Selected:', id)} />
      </div>
    </div>
  ),
};
