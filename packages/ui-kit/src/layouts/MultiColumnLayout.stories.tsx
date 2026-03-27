import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MultiColumnLayout } from './MultiColumnLayout.js';

const meta: Meta<typeof MultiColumnLayout> = {
  title: 'Composition/MultiColumnLayout',
  component: MultiColumnLayout,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof MultiColumnLayout>;

const LeftContent = () => (
  <div style={{ height: '100%', background: '#f0f2f5', padding: 8 }}>Left Rail</div>
);
const CenterContent = () => (
  <div style={{ height: '100%', background: '#ffffff', padding: 16 }}>Center Content</div>
);
const RightContent = () => (
  <div style={{ height: '100%', background: '#f0f2f5', padding: 8 }}>Right Rail</div>
);
const BottomContent = () => (
  <div style={{ background: '#e4e7eb', padding: 8 }}>Bottom Strip</div>
);

export const ThreeColumnWithBottom: Story = {
  render: () => (
    <div style={{ height: 500 }}>
      <MultiColumnLayout
        config={{
          left: { width: 260, collapsible: true, collapsedWidth: 48 },
          right: { width: 300, hideOnTablet: true, hideOnMobile: true },
        }}
        leftSlot={<LeftContent />}
        centerSlot={<CenterContent />}
        rightSlot={<RightContent />}
        bottomSlot={<BottomContent />}
      />
    </div>
  ),
};

export const TwoColumnNoRight: Story = {
  render: () => (
    <div style={{ height: 400 }}>
      <MultiColumnLayout
        config={{ left: { width: 240 } }}
        leftSlot={<LeftContent />}
        centerSlot={<CenterContent />}
        bottomSlot={<BottomContent />}
      />
    </div>
  ),
};

export const CenterOnly: Story = {
  render: () => (
    <div style={{ height: 400 }}>
      <MultiColumnLayout
        config={{}}
        centerSlot={<CenterContent />}
      />
    </div>
  ),
};
