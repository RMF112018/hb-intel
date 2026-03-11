/**
 * HbcProjectCanvas stories — D-SF13-T08, D-10
 *
 * Storybook variants: Default, Loading, Error, Empty, WithRecommendations, EditMode, MandatoryLocked
 * Inline styles only — D-07
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { HbcProjectCanvas } from './HbcProjectCanvas.js';

const meta: Meta<typeof HbcProjectCanvas> = {
  title: 'ProjectCanvas/HbcProjectCanvas',
  component: HbcProjectCanvas,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof HbcProjectCanvas>;

export const Default: Story = {
  args: {
    projectId: 'project-001',
    userId: 'user-001',
    role: 'Project Manager',
  },
};

export const Loading: Story = {
  args: {
    ...Default.args,
  },
};

export const Error: Story = {
  args: {
    ...Default.args,
  },
};

export const Empty: Story = {
  args: {
    ...Default.args,
  },
};

export const WithRecommendations: Story = {
  args: {
    ...Default.args,
  },
};

export const EditMode: Story = {
  args: {
    ...Default.args,
    editable: true,
  },
};

export const MandatoryLocked: Story = {
  args: {
    ...Default.args,
  },
};
