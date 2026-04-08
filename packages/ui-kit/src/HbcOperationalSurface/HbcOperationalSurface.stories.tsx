/**
 * HbcOperationalSurface Stories — Visual proof for presentation-lane operational intelligence.
 * Wave-01r Prompt-01: Capture Visual Proof
 */
import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { HbcOperationalSurface } from './index.js';
import { AlertCircle, AlertTriangle, CheckCircle2, HardHat, Shield } from 'lucide-react';

const meta: Meta<typeof HbcOperationalSurface> = {
  title: 'Homepage Surfaces/HbcOperationalSurface',
  component: HbcOperationalSurface,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof HbcOperationalSurface>;

export const Default: Story = {
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <HbcOperationalSurface
        title="Safety & Field Excellence"
        icon={Shield}
        featured={{
          title: '14 Days Without Incident',
          description: 'Northeast Region — all sites reporting green status for safety metrics this period.',
          meta: (
            <span style={{ fontSize: 13, color: '#64748b' }}>
              Last updated: April 8, 2026 08:00 AM
            </span>
          ),
        }}
        signals={[
          { id: '1', title: 'PPE Compliance', meta: '98% across all sites', icon: CheckCircle2, severity: 'success' },
          { id: '2', title: 'Open Safety Observations', meta: '3 pending review', icon: AlertTriangle, severity: 'warning' },
          { id: '3', title: 'Equipment Certification', meta: '2 expiring this week', icon: AlertCircle, severity: 'danger' },
          { id: '4', title: 'Training Completion', meta: 'Q2 module — 87% complete', icon: HardHat, severity: 'default' },
        ]}
      />
    </div>
  ),
};
