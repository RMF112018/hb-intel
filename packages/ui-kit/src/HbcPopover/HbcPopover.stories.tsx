/**
 * HbcPopover Stories — PH4.8 §Step 6
 */
import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { HbcPopover } from './index.js';

const meta: Meta<typeof HbcPopover> = {
  title: 'Overlays/HbcPopover',
  component: HbcPopover,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof HbcPopover>;

export const Default: Story = {
  render: () => (
    <div style={{ padding: '100px 200px' }}>
      <HbcPopover
        trigger={<button type="button">Click me</button>}
        triggerMode="click"
      >
        <p style={{ margin: 0 }}>Popover content with click trigger.</p>
      </HbcPopover>
    </div>
  ),
};

export const HoverTrigger: Story = {
  render: () => (
    <div style={{ padding: '100px 200px' }}>
      <HbcPopover
        trigger={<button type="button">Hover me</button>}
        triggerMode="hover"
      >
        <p style={{ margin: 0 }}>Popover content with 150ms hover delay.</p>
      </HbcPopover>
    </div>
  ),
};

export const ClickTrigger: Story = {
  render: () => (
    <div style={{ padding: '100px 200px' }}>
      <HbcPopover
        trigger={<button type="button">Toggle popover</button>}
        triggerMode="click"
      >
        <p style={{ margin: 0 }}>Click outside or press Escape to dismiss.</p>
        <button type="button" style={{ marginTop: '8px' }}>Action</button>
      </HbcPopover>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '64px', padding: '100px 200px' }}>
      <HbcPopover
        trigger={<button type="button">Small (240px)</button>}
        size="sm"
        triggerMode="click"
      >
        <p style={{ margin: 0 }}>Small popover content.</p>
      </HbcPopover>
      <HbcPopover
        trigger={<button type="button">Medium (320px)</button>}
        size="md"
        triggerMode="click"
      >
        <p style={{ margin: 0 }}>Medium popover content with more room.</p>
      </HbcPopover>
    </div>
  ),
};

export const FieldMode: Story = {
  render: () => (
    <div style={{ backgroundColor: '#0F1419', minHeight: '400px', padding: '100px 200px' }}>
      <HbcPopover
        trigger={<button type="button" style={{ color: '#E8EAED' }}>Open in dark</button>}
        triggerMode="click"
      >
        <p style={{ margin: 0 }}>Popover in a dark container (Field Mode context).</p>
      </HbcPopover>
    </div>
  ),
};
