/**
 * HbcDiscoverySurface Stories — Visual proof for presentation-lane discovery product.
 * Wave-01r Prompt-01: Capture Visual Proof
 */
import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { HbcDiscoverySurface } from './index.js';
import { Briefcase, FileText, HardHat, Search, Settings, Users } from 'lucide-react';

const meta: Meta<typeof HbcDiscoverySurface> = {
  title: 'Homepage Surfaces/HbcDiscoverySurface',
  component: HbcDiscoverySurface,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof HbcDiscoverySurface>;

export const Default: Story = {
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <HbcDiscoverySurface
        quickPaths={[
          { id: 'qp1', label: 'Safety Forms', icon: HardHat, href: '#' },
          { id: 'qp2', label: 'HR Policies', icon: FileText, href: '#' },
          { id: 'qp3', label: 'Project Tools', icon: Briefcase, href: '#' },
          { id: 'qp4', label: 'Team Directory', icon: Users, href: '#' },
        ]}
        categories={[
          {
            id: 'cat1',
            label: 'Operations',
            icon: Settings,
            items: [
              { id: 'c1i1', label: 'Daily Log', icon: FileText, href: '#' },
              { id: 'c1i2', label: 'Inspection Tracker', icon: Search, href: '#' },
              { id: 'c1i3', label: 'Equipment Checkout', icon: HardHat, href: '#' },
            ],
          },
          {
            id: 'cat2',
            label: 'Administration',
            icon: Briefcase,
            items: [
              { id: 'c2i1', label: 'Expense Reports', icon: FileText, href: '#' },
              { id: 'c2i2', label: 'Travel Requests', icon: Briefcase, href: '#' },
            ],
          },
        ]}
        promoted={[
          { id: 'pr1', label: 'New: Q2 Safety Playbook', icon: HardHat, href: '#' },
          { id: 'pr2', label: 'Updated Travel Policy', icon: FileText, href: '#' },
        ]}
      />
    </div>
  ),
};
