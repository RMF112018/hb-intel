/**
 * HbcCanvasEditor stories — D-SF13-T08, D-10
 *
 * Storybook variants: Default, WithTiles, MandatoryTiles, UnsavedChanges
 * Inline styles only — D-07
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import type { ICanvasTilePlacement } from '../types/index.js';
import { HbcCanvasEditor } from './HbcCanvasEditor.js';

const baseTiles: ICanvasTilePlacement[] = [
  { tileKey: 'bic-my-items', colStart: 1, colSpan: 4, rowStart: 1, rowSpan: 1, isLocked: false },
  { tileKey: 'project-health-pulse', colStart: 5, colSpan: 6, rowStart: 1, rowSpan: 1, isLocked: false },
];

const meta: Meta<typeof HbcCanvasEditor> = {
  title: 'ProjectCanvas/HbcCanvasEditor',
  component: HbcCanvasEditor,
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
type Story = StoryObj<typeof HbcCanvasEditor>;

export const Default: Story = {
  args: {
    projectId: 'project-001',
    tiles: [],
    isMandatory: () => false,
    isLocked: () => false,
    onSave: () => {},
    onCancel: () => {},
  },
};

export const WithTiles: Story = {
  args: {
    ...Default.args,
    tiles: baseTiles,
  },
};

export const MandatoryTiles: Story = {
  args: {
    ...Default.args,
    tiles: baseTiles,
    isMandatory: (key: string) => key === 'bic-my-items',
    isLocked: (key: string) => key === 'bic-my-items',
  },
};

export const UnsavedChanges: Story = {
  args: {
    ...Default.args,
    tiles: baseTiles,
  },
};
