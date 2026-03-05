/**
 * HbcToolboxFlyout Stories — PH4B.2 §Step 5 (F-013)
 * CSF3 format | DESIGN_SYSTEM.md convention
 */
import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FluentProvider } from '@fluentui/react-components';
import { HbcToolboxFlyout } from './HbcToolboxFlyout.js';
import { hbcFieldTheme } from '../theme/theme.js';

const meta: Meta<typeof HbcToolboxFlyout> = {
  title: 'Shell/HbcToolboxFlyout',
  component: HbcToolboxFlyout,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div style={{ backgroundColor: '#1B2A3D', padding: '16px', borderRadius: '4px', minHeight: '200px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof HbcToolboxFlyout>;

export const Default: Story = {
  name: 'Closed',
  args: {
    onToolboxOpen: () => console.log('Toolbox opened'),
  },
};

export const Open: Story = {
  name: 'Click to Open',
  args: {
    onToolboxOpen: () => console.log('Toolbox opened'),
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '48px' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginBottom: '8px' }}>Closed (default)</p>
        <HbcToolboxFlyout onToolboxOpen={() => console.log('Open')} />
      </div>
    </div>
  ),
};

export const FieldMode: Story = {
  render: () => (
    <FluentProvider theme={hbcFieldTheme}>
      <div style={{ backgroundColor: '#0F1419', padding: '16px', borderRadius: '4px' }}>
        <HbcToolboxFlyout onToolboxOpen={() => console.log('Toolbox')} />
      </div>
    </FluentProvider>
  ),
};

export const A11yTest: Story = {
  name: 'A11y Test (Dialog + Escape)',
  render: () => (
    <div>
      <p style={{ marginBottom: '16px', fontSize: '0.875rem', color: '#605E5C' }}>
        Click the toolbox icon to open flyout. Verify <code>aria-expanded</code> toggles.
        Flyout has <code>role="dialog"</code>. Press Escape to close and return focus
        to the trigger button.
      </p>
      <div style={{ backgroundColor: '#1B2A3D', padding: '16px', borderRadius: '4px' }}>
        <HbcToolboxFlyout onToolboxOpen={() => {}} />
      </div>
    </div>
  ),
};
