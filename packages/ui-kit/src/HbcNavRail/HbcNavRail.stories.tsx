import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { HbcNavRail } from './index.js';
import type { NavRailItem } from '../layouts/multi-column-types.js';

const MOCK_ITEMS: NavRailItem[] = [
  { id: 'item-1', label: 'Financial', status: 'watch', issueCount: 2, actionCount: 3 },
  { id: 'item-2', label: 'Schedule', status: 'at-risk', issueCount: 5, actionCount: 4 },
  { id: 'item-3', label: 'Constraints', status: 'critical', issueCount: 8, actionCount: 6 },
  { id: 'item-4', label: 'Permits', status: 'healthy', issueCount: 0, actionCount: 1 },
  { id: 'item-5', label: 'Safety', status: 'healthy', issueCount: 1, actionCount: 2 },
  { id: 'item-6', label: 'Reports', status: 'no-data', issueCount: 0, actionCount: 0 },
];

const meta: Meta<typeof HbcNavRail> = {
  title: 'Composition/HbcNavRail',
  component: HbcNavRail,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof HbcNavRail>;

export const Default: Story = {
  render: () => {
    const [selected, setSelected] = React.useState<string | null>(null);
    const [collapsed, setCollapsed] = React.useState(false);
    return (
      <div style={{ height: 400, width: 280 }}>
        <HbcNavRail
          items={MOCK_ITEMS}
          selectedItemId={selected}
          onSelectItem={setSelected}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
          title="Modules"
        />
      </div>
    );
  },
};

export const Collapsed: Story = {
  render: () => {
    const [selected, setSelected] = React.useState<string | null>(null);
    const [collapsed, setCollapsed] = React.useState(true);
    return (
      <div style={{ height: 400, width: 60 }}>
        <HbcNavRail
          items={MOCK_ITEMS}
          selectedItemId={selected}
          onSelectItem={setSelected}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
        />
      </div>
    );
  },
};

export const WithSelection: Story = {
  render: () => {
    const [selected, setSelected] = React.useState<string | null>('item-3');
    return (
      <div style={{ height: 400, width: 280 }}>
        <HbcNavRail
          items={MOCK_ITEMS}
          selectedItemId={selected}
          onSelectItem={setSelected}
          collapsed={false}
          onToggleCollapse={() => {}}
        />
      </div>
    );
  },
};
