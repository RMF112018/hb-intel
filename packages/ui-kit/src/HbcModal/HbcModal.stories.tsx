/**
 * HbcModal Stories — PH4.8 §Step 4
 */
import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { HbcModal } from './index.js';

const meta: Meta<typeof HbcModal> = {
  title: 'Overlays/HbcModal',
  component: HbcModal,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof HbcModal>;

const ModalDemo: React.FC<{ size?: 'sm' | 'md' | 'lg'; preventBackdropClose?: boolean }> = ({
  size = 'md',
  preventBackdropClose,
}) => {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{ padding: '32px' }}>
      <button type="button" onClick={() => setOpen(true)}>
        Open Modal ({size})
      </button>
      <HbcModal
        open={open}
        onClose={() => setOpen(false)}
        title={`Modal — ${size.toUpperCase()}`}
        size={size}
        preventBackdropClose={preventBackdropClose}
        footer={
          <>
            <button type="button" onClick={() => setOpen(false)}>Cancel</button>
            <button type="button" onClick={() => setOpen(false)}>Confirm</button>
          </>
        }
      >
        <p>This is a {size} modal dialog with focus trap and Escape-to-close.</p>
        <p>Tab cycles through focusable elements within the modal.</p>
        <input type="text" placeholder="Focusable input" style={{ width: '100%', padding: '8px' }} />
      </HbcModal>
    </div>
  );
};

export const Default: Story = {
  render: () => <ModalDemo />,
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', padding: '32px' }}>
      <ModalDemo size="sm" />
      <ModalDemo size="md" />
      <ModalDemo size="lg" />
    </div>
  ),
};

export const FieldMode: Story = {
  render: () => (
    <div style={{ backgroundColor: '#0F1419', minHeight: '100vh' }}>
      <ModalDemo />
    </div>
  ),
};

export const A11yTest: Story = {
  render: () => (
    <div style={{ padding: '32px' }}>
      <p>Open the modal and verify: focus trap, Escape closes, backdrop click closes, focus returns to trigger.</p>
      <ModalDemo />
    </div>
  ),
};

export const PreventBackdropClose: Story = {
  render: () => <ModalDemo preventBackdropClose />,
};
