/**
 * HbcCommandSurface Stories — Visual proof for presentation-lane command band.
 * Wave-01r Prompt-01: Capture Visual Proof
 */
import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { HbcCommandSurface } from './index.js';
import type { CommandItem } from './index.js';
import { AlertCircle, CheckCircle2, Clock, FileText, Shield } from 'lucide-react';

const meta: Meta<typeof HbcCommandSurface> = {
  title: 'Homepage Surfaces/HbcCommandSurface',
  component: HbcCommandSurface,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof HbcCommandSurface>;

const sampleItems: CommandItem[] = [
  { id: '1', title: 'Approve Safety Inspection', description: 'Site 14 — due today', icon: Shield },
  { id: '2', title: 'Review Change Order #4072', description: 'Budget impact: $24,500', icon: FileText },
  { id: '3', title: 'Complete Timesheet', description: 'Week ending April 5', icon: Clock },
  { id: '4', title: 'Sign Off on Punch List', description: '3 items remaining', icon: CheckCircle2 },
];

export const Default: Story = {
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <HbcCommandSurface
        title="Priority Actions"
        icon={AlertCircle}
        items={sampleItems}
      />
    </div>
  ),
};

export const HighUrgency: Story = {
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <HbcCommandSurface
        title="Urgent Actions"
        icon={AlertCircle}
        urgency="high"
        items={sampleItems.slice(0, 2)}
      />
    </div>
  ),
};

export const CriticalUrgency: Story = {
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <HbcCommandSurface
        title="Critical Actions"
        icon={AlertCircle}
        urgency="critical"
        items={[sampleItems[0]]}
      />
    </div>
  ),
};
