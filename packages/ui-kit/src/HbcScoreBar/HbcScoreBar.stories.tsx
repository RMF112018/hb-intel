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

export const WithLabel: Story = {
  args: {
    score: 65,
    showLabel: true,
    height: '14px',
  },
};
