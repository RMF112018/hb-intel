/**
 * HbcTearsheet Stories — PH4.8 §Step 5
 */
import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { HbcTearsheet } from './index.js';
import type { TearsheetStep } from './types.js';

const meta: Meta<typeof HbcTearsheet> = {
  title: 'Overlays/HbcTearsheet',
  component: HbcTearsheet,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof HbcTearsheet>;

const multiSteps: TearsheetStep[] = [
  {
    id: 'basics',
    label: 'Basics',
    content: (
      <div>
        <h4>Step 1: Basic Information</h4>
        <p>Enter the project name and description.</p>
        <input type="text" placeholder="Project name" style={{ width: '100%', padding: '8px', marginBottom: '12px' }} />
        <textarea placeholder="Description" style={{ width: '100%', padding: '8px', minHeight: '80px' }} />
      </div>
    ),
  },
  {
    id: 'team',
    label: 'Team',
    content: (
      <div>
        <h4>Step 2: Assign Team</h4>
        <p>Select team members for this project.</p>
        <label style={{ display: 'block', margin: '8px 0' }}>
          <input type="checkbox" /> Alice Johnson
        </label>
        <label style={{ display: 'block', margin: '8px 0' }}>
          <input type="checkbox" /> Bob Smith
        </label>
        <label style={{ display: 'block', margin: '8px 0' }}>
          <input type="checkbox" /> Charlie Brown
        </label>
      </div>
    ),
  },
  {
    id: 'review',
    label: 'Review',
    content: (
      <div>
        <h4>Step 3: Review &amp; Confirm</h4>
        <p>Review your selections and click Complete to finish.</p>
      </div>
    ),
  },
];

const TearsheetDemo: React.FC<{ steps?: TearsheetStep[] }> = ({ steps = multiSteps }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{ padding: '32px' }}>
      <button type="button" onClick={() => setOpen(true)}>
        Open Tearsheet
      </button>
      <HbcTearsheet
        open={open}
        onClose={() => setOpen(false)}
        title="Create New Project"
        steps={steps}
        onComplete={() => {
          setOpen(false);
        }}
      />
    </div>
  );
};

export const Default: Story = {
  render: () => <TearsheetDemo />,
};

export const SingleStep: Story = {
  render: () => (
    <TearsheetDemo
      steps={[
        {
          id: 'only',
          label: 'Only Step',
          content: (
            <div>
              <h4>Single Step Tearsheet</h4>
              <p>This tearsheet has only one step. The footer shows Cancel and Complete.</p>
            </div>
          ),
        },
      ]}
    />
  ),
};

export const FieldMode: Story = {
  render: () => (
    <div style={{ backgroundColor: '#0F1419', minHeight: '100vh' }}>
      <TearsheetDemo />
    </div>
  ),
};

export const A11yTest: Story = {
  render: () => (
    <div style={{ padding: '32px' }}>
      <p>Open the tearsheet and verify: focus trap, Escape closes, step navigation, Previous disabled on step 1.</p>
      <TearsheetDemo />
    </div>
  ),
};
