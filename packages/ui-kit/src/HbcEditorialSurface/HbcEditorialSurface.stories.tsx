/**
 * HbcEditorialSurface Stories — Visual proof for presentation-lane editorial channel.
 * Wave-01r Prompt-01: Capture Visual Proof
 */
import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { HbcEditorialSurface } from './index.js';
import { Briefcase, Clock, FileText, Users } from 'lucide-react';

const meta: Meta<typeof HbcEditorialSurface> = {
  title: 'Homepage Surfaces/HbcEditorialSurface',
  component: HbcEditorialSurface,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof HbcEditorialSurface>;

export const Default: Story = {
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <HbcEditorialSurface
        title="Leadership Messages"
        icon={Briefcase}
        featured={{
          eyebrow: 'From the CEO',
          title: 'Building for the Next Decade',
          excerpt:
            'As we enter Q2, I want to share our strategic vision for sustained growth and how each of you plays a critical role in achieving our goals across all regions.',
          meta: (
            <span style={{ fontSize: 13, color: '#64748b' }}>
              <Clock size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
              Published April 7, 2026
            </span>
          ),
        }}
        items={[
          { id: '1', title: 'VP Operations: Regional Safety Wins', meta: 'April 5', icon: Users },
          { id: '2', title: 'CFO Update: Q1 Financial Summary', meta: 'April 3', icon: FileText },
          { id: '3', title: 'HR Director: Benefits Enrollment Open', meta: 'April 1', icon: Users },
        ]}
      />
    </div>
  ),
};
