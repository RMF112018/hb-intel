/**
 * HbcPanel stories — PH4.6 §Step 9
 * Desktop drawer + mobile bottom-sheet + FieldMode
 */
import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FluentProvider } from '@fluentui/react-components';
import { HbcPanel } from './index.js';
import { hbcFieldTheme } from '../theme/theme.js';
import type { PanelSize } from './types.js';

const meta: Meta<typeof HbcPanel> = {
  title: 'Components/HbcPanel',
  component: HbcPanel,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
};

export default meta;
type Story = StoryObj<typeof HbcPanel>;

const PanelDemo: React.FC<{ size?: PanelSize }> = ({ size = 'md' }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} style={{ padding: '8px 16px' }}>
        Open Panel ({size})
      </button>
      <HbcPanel
        open={open}
        onClose={() => setOpen(false)}
        title={`Panel (${size})`}
        size={size}
        footer={
          <>
            <button type="button" onClick={() => setOpen(false)} style={{ padding: '6px 12px' }}>Cancel</button>
            <button type="button" style={{ padding: '6px 12px', backgroundColor: '#F37021', color: '#FFF', border: 'none', borderRadius: '4px' }}>Save</button>
          </>
        }
      >
        <p style={{ fontSize: '0.875rem' }}>Panel content goes here. On mobile (&le;767px), this renders as a bottom sheet.</p>
      </HbcPanel>
    </>
  );
};

export const Default: Story = {
  render: () => <PanelDemo />,
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px' }}>
      <PanelDemo size="sm" />
      <PanelDemo size="md" />
      <PanelDemo size="lg" />
    </div>
  ),
};

export const MobileBottomSheet: Story = {
  name: 'Mobile Bottom Sheet',
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  render: () => <PanelDemo />,
};

export const FieldMode: Story = {
  render: () => (
    <FluentProvider theme={hbcFieldTheme}>
      <div style={{ padding: '24px', backgroundColor: '#0F1419' }}>
        <PanelDemo />
      </div>
    </FluentProvider>
  ),
};
