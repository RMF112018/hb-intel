/**
 * HbcScoreBar — Storybook stories
 * PH4.13 §13.2 | Blueprint §1d
 */
import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { HbcScoreBar } from './index.js';

const meta: Meta<typeof HbcScoreBar> = {
  title: 'Components/HbcScoreBar',
  component: HbcScoreBar,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof HbcScoreBar>;

export const Default: Story = {
  args: {
    score: 72,
    height: '12px',
  },
};

export const AllScores: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 400 }}>
      {[0, 25, 50, 75, 100].map((score) => (
        <div key={score}>
          <p style={{ margin: 0, marginBottom: 4, fontSize: 13, fontWeight: 600 }}>
            Score: {score}
          </p>
          <HbcScoreBar score={score} />
        </div>
      ))}
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 400 }}>
      {[0, 25, 50, 75, 100].map((score) => (
        <div key={score}>
          <p style={{ margin: 0, marginBottom: 4, fontSize: 13, fontWeight: 600 }}>
            Score: {score}
          </p>
          <HbcScoreBar score={score} />
        </div>
      ))}
      <div>
        <p style={{ margin: 0, marginBottom: 4, fontSize: 13, fontWeight: 600 }}>With label</p>
        <HbcScoreBar score={65} showLabel height="14px" />
      </div>
    </div>
  ),
};

export const FieldMode: Story = {
  parameters: { backgrounds: { default: 'dark' } },
  render: () => (
    <div style={{ padding: 24, backgroundColor: '#0F1419', maxWidth: 400 }}>
      <HbcScoreBar score={72} />
    </div>
  ),
};

export const A11yTest: Story = {
  render: () => (
    <div style={{ maxWidth: 400 }}>
      <p style={{ fontSize: '0.875rem', color: '#605E5C', marginBottom: '16px' }}>
        Score bar uses role=&quot;progressbar&quot; with aria-valuenow, aria-valuemin, aria-valuemax.
        Color coding provides semantic feedback (red/yellow/green).
      </p>
      <HbcScoreBar score={72} showLabel />
    </div>
  ),
};

export const WithLabel: Story = {
  args: {
    score: 65,
    showLabel: true,
    height: '14px',
  },
};
